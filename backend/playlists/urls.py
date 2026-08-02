from django.urls import path
from .views import PlaylistListCreateView, PlaylistDetailView, PlaylistSongsView, PlaylistSongManageView

urlpatterns = [
    path("", PlaylistListCreateView.as_view(), name="playlist-list-create"),
    path("<int:pk>/", PlaylistDetailView.as_view(), name="playlist-details"),
    path("<int:playlist_id>/songs/", PlaylistSongsView.as_view(), name="playlist-songs"),
    path("<int:playlist_id>/songs/<int:song_id>/", PlaylistSongManageView.as_view(), name="playlist-song-manage"),
]