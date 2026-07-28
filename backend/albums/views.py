from django.shortcuts import get_object_or_404

from rest_framework import generics

from .models import Album
from .serializers import AlbumSerializer, AlbumSongSerializer
from songs.models import Song


class AlbumListCreateView(generics.ListCreateAPIView):
    queryset = Album.objects.all().order_by("-release_date")
    serializer_class = AlbumSerializer


class AlbumRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Album.objects.all()
    serializer_class = AlbumSerializer


class AlbumSongsView(generics.ListAPIView):
    serializer_class = AlbumSongSerializer

    def get_queryset(self):
        album = get_object_or_404(Album, pk=self.kwargs["pk"])
        return Song.objects.filter(album=album).order_by("track_number")