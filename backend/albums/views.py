from django.shortcuts import get_object_or_404

from rest_framework import generics
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import IsAuthenticated

from drf_spectacular.utils import extend_schema, OpenApiExample, extend_schema_view
from rest_framework import status

from . import services
from .serializers import (
    AlbumCreateSerializer,
    AlbumListSerializer,
    AlbumDetailModelSerializer,
    AlbumSongSerializer,
)
from .permissions import IsAlbumOwner


from drf_spectacular.utils import OpenApiParameter
from drf_spectacular.types import OpenApiTypes


@extend_schema_view(
    get=extend_schema(
        summary="List albums",
        description="Returns all albums ordered by release date. Supports optional search and basic ordering.",
        parameters=[
            OpenApiParameter(
                name="query",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                required=False,
                description="Case-insensitive search by album title or artist name.",
            ),
            OpenApiParameter(
                name="filter",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                required=False,
                enum=["newest", "oldest", "stream"],
                description=(
                    "'newest' orders by newest first, 'oldest' orders by oldest first, 'stream' orders by listeners when available."
                ),
            ),
        ],
        responses={status.HTTP_200_OK: AlbumListSerializer(many=True)},
    ),
    post=extend_schema(
        summary="Create album",
        description="Creates a new album for the authenticated artist.",
        request=AlbumCreateSerializer,
        responses={status.HTTP_201_CREATED: AlbumCreateSerializer},
        examples=[
            OpenApiExample(
                "Create album",
                request_only=True,
                value={
                    "title": "New Album",
                    "description": "My release",
                    "releaseDate": "2026-07-30T12:00:00Z",
                },
            )
        ],
    ),
)
class AlbumListCreateView(generics.ListCreateAPIView):
    # Use AlbumListSerializer for GET and AlbumCreateSerializer for POST to mimic playlists behavior
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        from django.db.models import Q, Sum
        from .models import Album

        queryset = Album.objects.select_related("artist__owner").prefetch_related("songs")

        query = self.request.query_params.get("query")
        if query:
            queryset = queryset.filter(
                Q(title__icontains=query)
                | Q(artist__owner__username__icontains=query)
                | Q(artist__owner__display_name__icontains=query)
            )

        ordering = self.request.query_params.get("filter")
        sort_map = {
            "newest": "-release_date",
            "oldest": "release_date",
        }

        if ordering == "stream":
            queryset = queryset.annotate(listeners=Sum("songs__streams")).order_by("-listeners")
        elif ordering in sort_map:
            queryset = queryset.order_by(sort_map[ordering])
        else:
            queryset = queryset.order_by("-release_date")

        return queryset

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx.update({"request": self.request})
        return ctx

    def get_serializer_class(self):
        if self.request.method == "GET":
            return AlbumListSerializer
        return AlbumCreateSerializer


@extend_schema_view(
    get=extend_schema(
        summary="Retrieve an album",
        description="Returns an album in frontend shape including song list.",
        responses={status.HTTP_200_OK: AlbumDetailModelSerializer},
    ),
    patch=extend_schema(
        summary="Update an album",
        description="Partially updates album metadata. Songs cannot be updated through this endpoint. Only the owning artist may update.",
        request=AlbumDetailModelSerializer,
        responses={status.HTTP_200_OK: AlbumDetailModelSerializer},
    ),
    delete=extend_schema(
        summary="Delete an album",
        description="Deletes an album owned by the authenticated artist.",
        responses={status.HTTP_204_NO_CONTENT: None},
    ),
)
class AlbumRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AlbumDetailModelSerializer
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    permission_classes = [IsAuthenticated, IsAlbumOwner]
    http_method_names = ["get", "patch", "delete"]

    def get_queryset(self):
        return services.list_albums()

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx.update({"request": self.request})
        return ctx


@extend_schema(
    summary="List songs of an album",
    description="Returns the tracks for a given album id in track order.",
    responses={status.HTTP_200_OK: AlbumSongSerializer(many=True)},
)
class AlbumSongsView(generics.ListAPIView):
    serializer_class = AlbumSongSerializer

    def get_queryset(self):
        return services.get_songs_for_album(self.kwargs["pk"])