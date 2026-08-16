from django.db.models import Q
from django.shortcuts import render, get_object_or_404
from drf_spectacular.types import OpenApiTypes
from rest_framework import generics, status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from songs.models import Song
from .models import Playlist, PlaylistItem
from .permissions import IsPlaylistOwner
from .serializers import PlaylistsSerializer, PlaylistDetailSerializer, PlaylistSongsSerializer

from rest_framework import serializers
from drf_spectacular.utils import extend_schema, OpenApiExample, inline_serializer, OpenApiResponse, OpenApiParameter, \
    extend_schema_view

from .services import PlaylistService
from rest_framework.exceptions import PermissionDenied
from accounts.services import get_recently_played


# Create your views here.
@extend_schema_view(
    get=extend_schema(
        summary="List playlists",
        description=(
            "Returns all public playlists together with the authenticated user's "
            "private playlists. Results can be searched by name and optionally "
            "ordered by creation date."
        ),
        parameters=[
            OpenApiParameter(
                name="query",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                required=False,
                description="Case-insensitive search by playlist name.",
            ),
            OpenApiParameter(
                name="filter",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                required=False,
                enum=["newest", "oldest", "stream"],
                description=(
                    "'newest' orders by newest first, "
                    "'oldest' orders by oldest first, "
                    "'stream' keeps the default ordering."
                ),
            ),
        ],
        responses={
            status.HTTP_200_OK: PlaylistsSerializer(many=True),
        },
        examples=[
            OpenApiExample(
                "Playlist list",
                response_only=True,
                status_codes=["200"],
                value=[
                    {
                        "id": 15,
                        "name": "Workout Mix",
                        "owner": 3,
                        "cover_image": None,
                        "created_at": "2026-07-30T13:42:11Z",
                    },
                    {
                        "id": 7,
                        "name": "Chill Vibes",
                        "owner": 8,
                        "cover_image": "https://example.com/media/playlist_covers/chill.jpg",
                        "created_at": "2026-07-28T19:21:45Z",
                    },
                ],
            ),
        ],
    ),
    post=extend_schema(
        summary="Create playlist",
        description=(
            "Creates a new playlist for the authenticated user. Only the playlist "
            "name is required. The owner is assigned automatically and the request "
            "fails if the user's subscription playlist limit has been reached."
        ),
        request=PlaylistsSerializer,
        responses={
            status.HTTP_201_CREATED: PlaylistsSerializer,
            status.HTTP_400_BAD_REQUEST: OpenApiResponse(
                description="Validation error.",
                response=inline_serializer(
                    name="PlaylistCreateError",
                    fields={
                        "name": serializers.ListField(
                            child=serializers.CharField(),
                            required=False,
                        ),
                        "non_field_errors": serializers.ListField(
                            child=serializers.CharField(),
                            required=False,
                        ),
                    },
                ),
            ),
        },
        examples=[
            OpenApiExample(
                "Create playlist",
                request_only=True,
                value={
                    "name": "Workout Mix",
                },
            ),
            OpenApiExample(
                "Playlist created",
                response_only=True,
                status_codes=["201"],
                value={
                    "id": 15,
                    "name": "Workout Mix",
                    "owner": 3,
                    "cover_image": None,
                    "created_at": "2026-07-30T13:42:11Z",
                },
            ),
            OpenApiExample(
                "Playlist limit reached",
                response_only=True,
                status_codes=["400"],
                value={
                    "non_field_errors": [
                        "You can create at most 6 playlists with your current subscription."
                    ]
                },
            ),
        ],
    ),
)
class PlaylistListCreateView(generics.ListCreateAPIView):
    serializer_class = PlaylistsSerializer
    # add pagination

    def get_queryset(self):
        queryset = Playlist.objects.filter(
            Q(owner=self.request.user) | Q(is_private=False)
        )

        query = self.request.query_params.get("query")
        if query:
            queryset = queryset.filter(
                Q(name__icontains=query) | Q(owner__display_name__icontains=query)
            )

        ordering = self.request.query_params.get("filter")
        sort_map = {
            "newest": "-created_at",
            "oldest": "created_at",
        }
        if ordering is not None and ordering in sort_map:
            queryset = queryset.order_by(sort_map[ordering])

        return queryset



FORBIDDEN_RESPONSE = OpenApiResponse(
    description="You do not have permission to access this playlist."
)
@extend_schema_view(
    get=extend_schema(
        summary="Retrieve a playlist",
        description=(
            "Returns the complete information for a playlist owned by the "
            "authenticated user, including the IDs of all songs in playlist order."
        ),
        responses={
            status.HTTP_200_OK: PlaylistDetailSerializer,
            status.HTTP_403_FORBIDDEN: FORBIDDEN_RESPONSE,
            status.HTTP_404_NOT_FOUND: OpenApiResponse(
                description="Playlist not found."
            ),
        },
        examples=[
            OpenApiExample(
                "Playlist details",
                response_only=True,
                status_codes=["200"],
                value={
                    "id": 15,
                    "name": "Workout Mix",
                    "description": "Songs for the gym.",
                    "owner": 3,
                    "is_private": True,
                    "cover_image": "https://example.com/media/playlist_covers/workout.jpg",
                    "created_at": "2026-07-30T13:42:11Z",
                    "songs": [4, 18, 27, 35],
                },
            ),
        ],
    ),
    patch=extend_schema(
        summary="Update a playlist",
        description=(
            "Partially updates a playlist owned by the authenticated user. "
            "Only the provided fields are modified. Songs cannot be updated "
            "through this endpoint."
        ),
        request=PlaylistDetailSerializer,
        responses={
            status.HTTP_200_OK: PlaylistDetailSerializer,
            status.HTTP_403_FORBIDDEN: FORBIDDEN_RESPONSE,
            status.HTTP_400_BAD_REQUEST: OpenApiResponse(
                description="Validation error.",
                response=inline_serializer(
                    name="PlaylistUpdateError",
                    fields={
                        "name": serializers.ListField(
                            child=serializers.CharField(),
                            required=False,
                        ),
                        "description": serializers.ListField(
                            child=serializers.CharField(),
                            required=False,
                        ),
                        "cover_image": serializers.ListField(
                            child=serializers.CharField(),
                            required=False,
                        ),
                        "is_private": serializers.ListField(
                            child=serializers.CharField(),
                            required=False,
                        ),
                    },
                ),
            ),
            status.HTTP_404_NOT_FOUND: OpenApiResponse(
                description="Playlist not found."
            ),
        },
        examples=[
            OpenApiExample(
                "Update playlist",
                request_only=True,
                value={
                    "name": "Morning Playlist",
                    "description": "Perfect for commuting.",
                    "is_private": False,
                },
            ),
            OpenApiExample(
                "Playlist updated",
                response_only=True,
                status_codes=["200"],
                value={
                    "id": 15,
                    "name": "Morning Playlist",
                    "description": "Perfect for commuting.",
                    "owner": 3,
                    "is_private": False,
                    "cover_image": None,
                    "created_at": "2026-07-30T13:42:11Z",
                    "songs": [4, 18, 27, 35],
                },
            ),
        ],
    ),
    delete=extend_schema(
        summary="Delete a playlist",
        description="Deletes a playlist owned by the authenticated user.",
        responses={
            status.HTTP_204_NO_CONTENT: OpenApiResponse(
                description="Playlist deleted successfully."
            ),
            status.HTTP_403_FORBIDDEN: FORBIDDEN_RESPONSE,
            status.HTTP_404_NOT_FOUND: OpenApiResponse(
                description="Playlist not found."
            ),
        },
    ),
)
class PlaylistDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PlaylistDetailSerializer
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get_permissions(self):
        if self.request.method == "GET":
            return [IsAuthenticated()]

        return [IsAuthenticated(), IsPlaylistOwner()]

    def get_queryset(self):
        return Playlist.objects.all()



class PlaylistSongsView(generics.ListAPIView):
    serializer_class = PlaylistSongsSerializer

    def get_queryset(self):
        return PlaylistItem.objects.filter(
            playlist__id=self.kwargs["playlist_id"]
        ).filter(
            Q(playlist__owner=self.request.user) | Q(playlist__is_private=False)
        )



@extend_schema(
    summary="List recent playlists for a user",
    description=(
        "Returns playlists belonging to the specified user that overlap with the user's recently played songs. "
        "Only the user themselves may call this endpoint for their id."
    ),
    parameters=[
        OpenApiParameter(
            name="id",
            type=OpenApiTypes.INT,
            location=OpenApiParameter.QUERY,
            required=True,
            description="The id of the user whose recent playlists to return (must be the authenticated user).",
        )
    ],
    responses={
        status.HTTP_200_OK: PlaylistsSerializer(many=True),
        status.HTTP_403_FORBIDDEN: FORBIDDEN_RESPONSE,
    },
)
class RecentPlaylistsView(generics.ListAPIView):
    serializer_class = PlaylistsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user_id = self.request.query_params.get("id")
        if not user_id:
            return Playlist.objects.none()
        try:
            uid = int(user_id)
        except (TypeError, ValueError):
            return Playlist.objects.none()

        if self.request.user.id != uid:
            raise PermissionDenied("You can only access your own recent playlists.")

        return PlaylistService.get_recent_playlists_for_user(self.request.user)


class PlaylistSongManageView(APIView):
    permission_classes = [IsAuthenticated, IsPlaylistOwner]
    def get_playlist(self, playlist_id):
        playlist = get_object_or_404(Playlist, id=playlist_id)
        self.check_object_permissions(self.request, playlist)
        return playlist

    @extend_schema(
        summary="Add song to playlist",
        description=(
                "Adds a song to the specified playlist. "
                "The song is appended to the end of the playlist. "
                "Only the playlist owner can modify the playlist."
        ),
        responses={
            status.HTTP_201_CREATED: OpenApiResponse(
                description="Song added successfully.",
                examples=[
                    OpenApiExample(
                        "Song added",
                        value={
                            "playlist": 5,
                            "song": 12,
                            "position": 3,
                        },
                    )
                ],
            ),
            status.HTTP_400_BAD_REQUEST: OpenApiResponse(
                description="Song already exists in playlist.",
                examples=[
                    OpenApiExample(
                        "Duplicate song",
                        value={
                            "detail": "Song already exists"
                        },
                    )
                ],
            ),
            status.HTTP_403_FORBIDDEN: OpenApiResponse(
                description="You do not have permission to modify this playlist."
            ),
            status.HTTP_404_NOT_FOUND: OpenApiResponse(
                description="Playlist or song not found."
            ),
        },
    )
    def post(self, request, playlist_id, song_id):
        playlist = self.get_playlist(playlist_id)
        song = get_object_or_404(Song, id=song_id)
        try:
            item = PlaylistService.add_song(playlist=playlist, song=song)

        except ValueError as e:
            return Response(
                {"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            {
                "playlist": item.playlist_id,
                "song": item.song_id,
                "position": item.position,
            },
            status=status.HTTP_201_CREATED
        )

    @extend_schema(
        summary="Remove song from playlist",
        description=(
                "Removes a song from the specified playlist. "
                "Songs after the removed song are shifted one position backward."
        ),
        responses={
            status.HTTP_204_NO_CONTENT: OpenApiResponse(
                description="Song removed successfully."
            ),
            status.HTTP_400_BAD_REQUEST: OpenApiResponse(
                description="Song is not in playlist.",
                examples=[
                    OpenApiExample(
                        "Song missing",
                        value={
                            "detail": "Song is not in this playlist"
                        },
                    )
                ],
            ),
            status.HTTP_403_FORBIDDEN: OpenApiResponse(
                description="You do not have permission to modify this playlist."
            ),
            status.HTTP_404_NOT_FOUND: OpenApiResponse(
                description="Playlist or song not found."
            ),
        },
    )
    def delete(self, request, playlist_id, song_id):
        playlist = self.get_playlist(playlist_id)
        song = get_object_or_404(Song, id=song_id)

        try:
            PlaylistService.remove_song(playlist=playlist, song=song)
        except ValueError as e:
            return Response(
                {"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            status=status.HTTP_204_NO_CONTENT
        )