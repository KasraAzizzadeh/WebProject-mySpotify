from django.db.models import Q
from django.http import FileResponse
from django.shortcuts import render, get_object_or_404
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Song
from .permissions import IsSongOwner, CanDownloadSong
from .serializers import SongSerializer, SongDetailSerializer

from accounts.permissions import IsArtist


# Create your views here.
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter, OpenApiTypes, OpenApiExample, OpenApiResponse
from rest_framework import serializers, status
from drf_spectacular.utils import inline_serializer

from .services import SongService


@extend_schema_view(
    get=extend_schema(
        summary="List songs",
        description=(
            "Returns songs with artist and album information. "
            "Songs can be searched by title or artist display name "
            "and optionally ordered by release date or stream count."
        ),
        parameters=[
            OpenApiParameter(
                name="query",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                required=False,
                description=(
                    "Case-insensitive search by song title "
                    "or artist display name."
                ),
            ),
            OpenApiParameter(
                name="filter",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                required=False,
                enum=["newest", "oldest", "streams"],
                description=(
                    "'newest' orders by newest release date, "
                    "'oldest' orders by oldest release date, "
                    "'streams' orders by highest stream count."
                ),
            ),
        ],
        responses={
            status.HTTP_200_OK: SongSerializer(many=True),
        },
        examples=[
            OpenApiExample(
                "Song list",
                response_only=True,
                status_codes=["200"],
                value=[
                    {
                        "id": 12,
                        "title": "Blinding Lights",
                        "lyrics": "....",
                        "duration_ms": 200040,
                        "track_number": 3,
                        "streams": 1200000,
                        "audio_file": "/media/songs/blinding.mp3",
                        "cover_image": "/media/album_covers/dawn.jpg",
                        "release_date": "2026-07-20T12:00:00Z",
                        "genre": [1, 4],
                        "collaborators": [15, 20],
                        "artist_id": 7,
                        "artist_display_name": "The Weeknd",
                        "album_display_name": "After Hours",
                    }
                ],
            ),
        ],
    ),

    post=extend_schema(
        summary="Create song",
        description=(
            "Creates a new song for the authenticated artist. "
            "The artist is assigned automatically from the authenticated user. "
            "The uploaded audio file is validated and its duration is extracted "
            "automatically. If the album has a cover image, it is copied to the song."
        ),
        request=SongSerializer,
        responses={
            status.HTTP_201_CREATED: SongSerializer,
            status.HTTP_400_BAD_REQUEST: OpenApiResponse(
                description="Validation error.",
                response=inline_serializer(
                    name="SongCreateError",
                    fields={
                        "title": serializers.ListField(
                            child=serializers.CharField(),
                            required=False,
                        ),
                        "album_id": serializers.ListField(
                            child=serializers.CharField(),
                            required=False,
                        ),
                        "audio_file": serializers.ListField(
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
                "Create song",
                request_only=True,
                value={
                    "title": "New Song",
                    "album_id": 5,
                    "track_number": 2,
                    "audio_file": "song.mp3",
                    "lyrics": "Optional lyrics",
                    "genre": [1, 3],
                    "collaborators": [12, 15],
                },
            ),
            OpenApiExample(
                "Song created",
                response_only=True,
                status_codes=["201"],
                value={
                    "id": 25,
                    "title": "New Song",
                    "duration_ms": 185000,
                    "track_number": 2,
                    "streams": 0,
                    "audio_file": "/media/songs/new_song.mp3",
                    "cover_image": "/media/album_covers/album.jpg",
                    "release_date": "2026-08-02T20:30:00Z",
                    "genre": [1, 3],
                    "collaborators": [12, 15],
                    "artist_id": 7,
                    "artist_display_name": "Artist Name",
                    "album_display_name": "Album Name",
                },
            ),
        ],
    ),
)
class SongListCreateView(generics.ListCreateAPIView):
    serializer_class = SongSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsArtist()]

        return [IsAuthenticated()]

    def get_queryset(self):
        queryset = (Song.objects.select_related("artist", "artist__owner", "album")
                    .prefetch_related("genre", "collaborators", "collaborators__owner"))

        query = self.request.query_params.get("query")
        if query:
            queryset = queryset.filter(
                Q(title__icontains=query) | Q(artist__owner__display_name__icontains=query)
            )

        ordering = self.request.query_params.get("filter")
        sort_map = {
            "newest": "-release_date",
            "oldest": "release_date",
            "streams": "-streams",
        }
        if ordering is not None and ordering in sort_map:
            queryset = queryset.order_by(sort_map[ordering])

        return queryset



@extend_schema_view(
    get=extend_schema(
        summary="Retrieve song",
        description=(
            "Returns complete information about a song including "
            "artist, album, genres, collaborators, and media information."
        ),
        responses={
            status.HTTP_200_OK: SongDetailSerializer,
            status.HTTP_404_NOT_FOUND: OpenApiResponse(
                description="Song not found."
            ),
        },
        examples=[
            OpenApiExample(
                "Song details",
                response_only=True,
                status_codes=["200"],
                value={
                    "id": 12,
                    "title": "Blinding Lights",
                    "lyrics": "....",
                    "duration_ms": 200040,
                    "track_number": 3,
                    "streams": 1200000,
                    "audio_file": "/media/songs/blinding.mp3",
                    "cover_image": "/media/album_covers/dawn.jpg",
                    "release_date": "2026-07-20T12:00:00Z",
                    "genre": [1, 4],
                    "collaborators": [15, 20],
                    "album_id": 5,
                    "artist_id": 7,
                    "artist_name": "The Weeknd",
                    "album_name": "After Hours",
                },
            ),
        ],
    ),

    patch=extend_schema(
        summary="Update song",
        description=(
            "Updates an existing song. Only the song owner can modify it. "
            "The title, lyrics, genres, collaborators, and audio file can be changed. "
            "If the audio file is replaced, its duration is recalculated automatically."
        ),
        request=SongDetailSerializer,
        responses={
            status.HTTP_200_OK: SongDetailSerializer,
            status.HTTP_400_BAD_REQUEST: OpenApiResponse(
                description="Validation error.",
                response=inline_serializer(
                    name="SongUpdateError",
                    fields={
                        "title": serializers.ListField(
                            child=serializers.CharField(),
                            required=False,
                        ),
                        "audio_file": serializers.ListField(
                            child=serializers.CharField(),
                            required=False,
                        ),
                        "genre": serializers.ListField(
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
            status.HTTP_403_FORBIDDEN: OpenApiResponse(
                description="You do not have permission to modify this song."
            ),
            status.HTTP_404_NOT_FOUND: OpenApiResponse(
                description="Song not found."
            ),
        },
        examples=[
            OpenApiExample(
                "Update song",
                request_only=True,
                value={
                    "title": "Updated Song Title",
                    "lyrics": "Updated lyrics",
                    "genre": [2, 5],
                    "audio_file": "updated_song.mp3",
                },
            ),
            OpenApiExample(
                "Song updated",
                response_only=True,
                status_codes=["200"],
                value={
                    "id": 12,
                    "title": "Updated Song Title",
                    "duration_ms": 215000,
                    "track_number": 3,
                    "streams": 1200000,
                    "audio_file": "/media/songs/updated_song.mp3",
                    "cover_image": "/media/album_covers/dawn.jpg",
                    "release_date": "2026-07-20T12:00:00Z",
                    "genre": [2, 5],
                    "collaborators": [15, 20],
                    "album_id": 5,
                    "artist_id": 7,
                    "artist_name": "The Weeknd",
                    "album_name": "After Hours",
                },
            ),
        ],
    ),

    delete=extend_schema(
        summary="Delete song",
        description=(
            "Deletes a song owned by the authenticated artist. "
            "The song is also removed from all playlists containing it."
        ),
        responses={
            status.HTTP_204_NO_CONTENT: OpenApiResponse(
                description="Song deleted successfully."
            ),
            status.HTTP_403_FORBIDDEN: OpenApiResponse(
                description="You do not have permission to delete this song."
            ),
            status.HTTP_404_NOT_FOUND: OpenApiResponse(
                description="Song not found."
            ),
        },
    ),
)
class SongDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = SongDetailSerializer

    def get_permissions(self):
        if self.request.method == "GET":
            return [IsAuthenticated()]

        return [IsAuthenticated(), IsSongOwner()]

    def get_queryset(self):
        return Song.objects.all()



@extend_schema(
    summary="Register song stream",
    description=(
        "Registers that the authenticated user has played a song. "
        "Creates a play history record and increments the song stream count."
    ),
    responses={
        status.HTTP_201_CREATED: OpenApiResponse(
            description="Song stream registered successfully.",
            response=inline_serializer(
                name="SongStreamResponse",
                fields={
                    "detail": serializers.CharField(),
                },
            ),
            examples=[
                OpenApiExample(
                    "Stream registered",
                    value={
                        "detail": "Song stream registered"
                    },
                )
            ],
        ),
        status.HTTP_400_BAD_REQUEST: OpenApiResponse(
            description="A Song was already streamed by you recently."
        ),
        status.HTTP_404_NOT_FOUND: OpenApiResponse(
            description="Song not found."
        ),
    },
)
class SongStreamView(generics.GenericAPIView):
    def post(self, request, pk):
        song = get_object_or_404(Song, id=pk)

        try:
            SongService.stream_song(song=song, user=request.user)
        except ValueError as e:
            return Response(
                {"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            { "detail": "Song stream registered"}, status=status.HTTP_201_CREATED
        )



@extend_schema(
    summary="Download song audio",
    description=(
        "Downloads the audio file of a song. "
        "Only users with an active subscription plan that supports downloads "
        "can access this endpoint."
    ),
    responses={
        status.HTTP_200_OK: OpenApiResponse(
            description="Song audio file.",
        ),
        status.HTTP_403_FORBIDDEN: OpenApiResponse(
            description="User subscription does not allow downloads."
        ),
        status.HTTP_404_NOT_FOUND: OpenApiResponse(
            description="Song not found."
        ),
    },
)
class SongDownloadView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, CanDownloadSong]

    def get(self, request, pk):
        song = get_object_or_404(Song, id=pk)

        return FileResponse(
            song.audio_file.open("rb"),
            as_attachment=True,
            filename=song.audio_file.name.split("/")[-1]
        )