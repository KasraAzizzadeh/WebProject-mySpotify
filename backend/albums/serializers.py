from rest_framework import serializers

from .models import Album
from songs.models import Song


class AlbumSerializer(serializers.ModelSerializer):
    class Meta:
        model = Album
        fields = "__all__"


class AlbumSongSerializer(serializers.ModelSerializer):
    class Meta:
        model = Song
        fields = [
            "id",
            "title",
            "track_number",
            "duration_ms",
            "streams",
            "cover_image",
            "release_date",
        ]