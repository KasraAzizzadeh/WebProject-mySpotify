from django.urls import path

from .views import (
    AlbumListCreateView,
    AlbumRetrieveUpdateDestroyView,
    AlbumSongsView,
)

urlpatterns = [
    path("", AlbumListCreateView.as_view(), name="album-list-create"),
    path("<int:pk>/", AlbumRetrieveUpdateDestroyView.as_view(), name="album-detail"),
    path("<int:pk>/songs/", AlbumSongsView.as_view(), name="album-songs"),
]