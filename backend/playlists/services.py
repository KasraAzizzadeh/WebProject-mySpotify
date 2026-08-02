from django.db import models
from django.db import transaction
from rest_framework.generics import get_object_or_404

from playlists.models import Playlist, PlaylistItem
from songs.models import Song


class PlaylistService:

    @staticmethod
    @transaction.atomic
    def add_song(playlist, song):
        if PlaylistItem.objects.filter(song=song, playlist=playlist).exists():
            raise ValueError("Song already exists")

        position = PlaylistItem.objects.filter(playlist=playlist).count() + 1
        return PlaylistItem.objects.create(song=song, playlist=playlist, position=position)

    @staticmethod
    @transaction.atomic
    def remove_song(playlist, song):
        try:
            item = PlaylistItem.objects.get(song=song, playlist=playlist)
        except PlaylistItem.DoesNotExist:
            raise ValueError("Song is not in this playlist")

        deleted_position = item.position
        item.delete()

        PlaylistItem.objects.filter(
            playlist=playlist, position__gt=deleted_position
        ).update(position=models.F("position") - 1)