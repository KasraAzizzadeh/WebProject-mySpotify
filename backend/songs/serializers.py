from pathlib import Path

from rest_framework import serializers

from accounts.utils import ArtistUserPrimaryKeyField
from .models import Song
from albums.models import Album, Genre
from accounts.models import ArtistProfile, User
from .services import SongService


ALLOWED_AUDIO_EXTENSIONS = {".mp3", ".wav", ".flac",".m4a",}

class SongSerializer(serializers.ModelSerializer):
    # Input field
    album_id = serializers.PrimaryKeyRelatedField(queryset=Album.objects.all(), source="album")
    lyrics = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    genre = serializers.PrimaryKeyRelatedField(many=True, required=False, queryset=Genre.objects.all())
    collaborators = ArtistUserPrimaryKeyField(many=True, required=False, queryset=User.objects.all())
    # Output fields
    artist_id = serializers.IntegerField(source="artist.owner.id", read_only=True)
    artist_name = serializers.CharField( source="artist.owner.display_name", read_only=True)
    album_name = serializers.CharField(source="album.title", read_only=True)

    class Meta:
        model = Song

        fields = [
            "id",
            "title",
            "lyrics",
            "duration_ms",
            "track_number",
            "streams",
            "audio_file",
            "cover_image",
            "release_date",

            # relations
            "genre",
            "collaborators",

            # input
            "album_id",

            # output
            "artist_id",
            "artist_name",
            "album_name",
        ]

        read_only_fields = [
            "duration_ms",
            "streams",
            "release_date",
            "cover_image",
            "artist_id",
            "artist_name",
            "album_name",
        ]

    def validate_audio_file(self, file):
        extension = Path(file.name).suffix.lower()

        if extension not in ALLOWED_AUDIO_EXTENSIONS:
            raise serializers.ValidationError(
                "Unsupported audio format."
            )
        return file

    def create(self, validated_data):
        request = self.context["request"]
        artist = request.user.artist_profile

        return SongService.create_song(validated_data=validated_data, artist=artist)