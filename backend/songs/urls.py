from django.urls import path
from .views import SongListCreateView, SongDetailView, SongStreamView, SongDownloadView

urlpatterns = [
    path("", SongListCreateView.as_view(), name="songs-list-create"),
    path("<int:pk>/", SongDetailView.as_view(), name="song-details"),
    path("<int:pk>/stream/", SongStreamView.as_view(), name="song-stream"),
    path("<int:pk>/download/", SongDownloadView.as_view(), name="song-download"),
]