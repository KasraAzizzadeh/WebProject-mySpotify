from django.urls import path
from .views import SongListCreateView, SongDetailView, SongStreamView, SongDownloadView

urlpatterns = [
    path("", SongListCreateView.as_view(), name="songs-list-create"),
    path("<int:pk>/", SongDetailView.as_view(), name="song-detail"),
    path("<int:pk>/streamed/", SongStreamView.as_view(), name="song-streamed"),
    path("<int:pk>/download/", SongDownloadView.as_view(), name="song-download"),
]