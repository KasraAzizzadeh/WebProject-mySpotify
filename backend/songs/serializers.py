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
    cover_image = serializers.SerializerMethodField()

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

    def get_cover_image(self, obj):
        if getattr(obj.album, "cover_image", None):
            current_name = getattr(obj.cover_image, "name", None)
            album_name = getattr(obj.album.cover_image, "name", None)
            if not current_name or current_name != album_name:
                obj.cover_image = obj.album.cover_image
                obj.save(update_fields=["cover_image"])
            return obj.cover_image.url if obj.cover_image else None

        if obj.cover_image:
            return obj.cover_image.url

        return None

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


class SongDetailSerializer(serializers.ModelSerializer):
    # Input field
    lyrics = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    genre = serializers.PrimaryKeyRelatedField(many=True, required=False, queryset=Genre.objects.all())
    # Output fields
    album_id = serializers.PrimaryKeyRelatedField(source="album", read_only=True)
    artist_id = serializers.IntegerField(source="artist.owner.id", read_only=True)
    artist_name = serializers.CharField( source="artist.owner.display_name", read_only=True)
    album_name = serializers.CharField(source="album.title", read_only=True)
    collaborators = ArtistUserPrimaryKeyField(many=True, required=False, read_only=True)
    cover_image = serializers.SerializerMethodField()

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
            "id",
            "duration_ms",
            "streams",
            "release_date",
            "cover_image",
            "artist_id",
            "artist_name",
            "album_name",
            "album_id",
            "collaborators",
        ]

    def get_cover_image(self, obj):
        if getattr(obj.album, "cover_image", None):
            current_name = getattr(obj.cover_image, "name", None)
            album_name = getattr(obj.album.cover_image, "name", None)
            if not current_name or current_name != album_name:
                obj.cover_image = obj.album.cover_image
                obj.save(update_fields=["cover_image"])
            return obj.cover_image.url if obj.cover_image else None

        if obj.cover_image:
            return obj.cover_image.url

        return None

    def validate_audio_file(self, file):
        extension = Path(file.name).suffix.lower()

        if extension not in ALLOWED_AUDIO_EXTENSIONS:
            raise serializers.ValidationError(
                "Unsupported audio format."
            )
        return file

    def update(self, instance, validated_data):
        return SongService.update_song(song=instance, validated_data=validated_data)