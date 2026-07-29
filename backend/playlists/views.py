from django.db.models import Q
from django.shortcuts import render
from drf_spectacular.types import OpenApiTypes
from rest_framework import generics, status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import IsAuthenticated

from .models import Playlist
from .permissions import IsPlaylistOwner
from .serializers import PlaylistsSerializer, PlaylistDetailSerializer

from rest_framework import serializers
from drf_spectacular.utils import extend_schema, OpenApiExample, inline_serializer, OpenApiResponse, OpenApiParameter, \
    extend_schema_view


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
            queryset = queryset.filter(name__icontains=query)

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
    permission_classes = [IsAuthenticated, IsPlaylistOwner]

    def get_queryset(self):
        return Playlist.objects.all()
