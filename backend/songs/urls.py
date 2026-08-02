from django.urls import path
from .views import SongListCreateView

urlpatterns = [
    path("", SongListCreateView.as_view(), name="songs-list-create"),
]