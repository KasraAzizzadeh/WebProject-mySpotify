from django.urls import path
from .views import PlaylistListCreateView, PlaylistDetailView

urlpatterns = [
    path("", PlaylistListCreateView.as_view(), name="playlist-list-create"),
    path("<int:pk>/", PlaylistDetailView.as_view(), name="playlist-details"),
]