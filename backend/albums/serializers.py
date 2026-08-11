from rest_framework import serializers

from .models import Album, Genre
from . import services
from songs.models import Song


class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ["id", "name"]


class AlbumCreateRequestSerializer(serializers.Serializer):
    title = serializers.CharField(required=True, help_text="Album title")
    description = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    is_single = serializers.BooleanField(required=False, default=False)
    release_date = serializers.DateTimeField(required=True, help_text="Release date in ISO-8601 format")
    cover_image = serializers.ImageField(required=False, allow_null=True, help_text="Optional album cover image")


class AlbumUpdateRequestSerializer(serializers.Serializer):
    title = serializers.CharField(required=False, allow_blank=True)
    description = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    is_single = serializers.BooleanField(required=False)
    release_date = serializers.DateTimeField(required=False)
    cover_image = serializers.ImageField(required=False, allow_null=True)


class AlbumListSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField(source="title")
    artistName = serializers.SerializerMethodField()
    artistId = serializers.SerializerMethodField()
    listeners = serializers.SerializerMethodField()
    releaseDate = serializers.DateTimeField(source="release_date")
    imageUrl = serializers.SerializerMethodField()
    description = serializers.CharField(allow_blank=True, allow_null=True)
    songList = serializers.SerializerMethodField()

    def get_artistName(self, obj):
        try:
            owner = obj.artist.owner
            return owner.display_name or owner.username
        except Exception:
            return None

    def get_artistId(self, obj):
        try:
            return obj.artist.owner.id
        except Exception:
            return None

    def get_imageUrl(self, obj):
        if obj.cover_image:
            try:
                return obj.cover_image.url
            except Exception:
                return None
        return None

    def get_listeners(self, obj):
        try:
            return services.compute_listeners_count(obj)
        except Exception:
            return 0

    def get_songList(self, obj):
        try:
            return list(obj.songs.order_by("track_number").values_list("id", flat=True))
        except Exception:
            return []


class AlbumDetailSerializer(serializers.Serializer):
    # For detail responses and updates (allows cover_image upload on PATCH)
    id = serializers.IntegerField(read_only=True)
    title = serializers.CharField(source="title")
    description = serializers.CharField(allow_blank=True, allow_null=True)
    is_single = serializers.BooleanField(source="is_single")
    release_date = serializers.DateTimeField(source="release_date")
    artist = serializers.SerializerMethodField()
    cover_image = serializers.ImageField(required=False, allow_null=True)

    def get_artist(self, obj):
        try:
            return obj.artist.owner.id
        except Exception:
            return None

    def to_representation(self, instance):
        # Represent as frontend shape
        songs_qs = instance.songs.order_by("track_number").values_list("id", flat=True)
        listeners = services.compute_listeners_count(instance)
        artist_name = None
        artist_id = None
        try:
            owner = instance.artist.owner
            artist_name = owner.display_name or owner.username
            artist_id = owner.id
        except Exception:
            pass

        return {
            "id": instance.id,
            "name": instance.title,
            "artistName": artist_name,
            "artistId": artist_id,
            "listeners": listeners,
            "releaseDate": instance.release_date,
            "imageUrl": instance.cover_image.url if instance.cover_image else None,
            "description": instance.description,
            "songList": list(songs_qs),
        }
from rest_framework import serializers as drf_serializers
from django.forms import model_to_dict

from .models import Album


class AlbumCreateSerializer(drf_serializers.ModelSerializer):
    class Meta:
        model = Album
        fields = [
            "id",
            "title",
            "description",
            "is_single",
            "release_date",
            "artist",
            "cover_image",
        ]
        read_only_fields = ["id", "artist"]

    def create(self, validated_data):
        request = self.context.get("request")
        artist_profile = None
        if request and hasattr(request, "user"):
            user = request.user
            if hasattr(user, "artist_profile"):
                artist_profile = user.artist_profile

        if not artist_profile:
            raise serializers.ValidationError({
                "non_field_errors": [
                    "Only verified artists can create albums."
                ]
            })

        data = dict(validated_data)
        data["artist_id"] = artist_profile.id

        album = services.create_album(data)
        return album

    def to_representation(self, instance):
        # Represent as frontend shape
        songs_qs = instance.songs.order_by("track_number").values_list("id", flat=True)
        listeners = services.compute_listeners_count(instance)
        artist_name = None
        artist_id = None
        try:
            owner = instance.artist.owner
            artist_name = owner.display_name or owner.username
            artist_id = owner.id
        except Exception:
            pass

        return {
            "id": instance.id,
            "name": instance.title,
            "artistName": artist_name,
            "artistId": artist_id,
            "listeners": listeners,
            "releaseDate": instance.release_date,
            "imageUrl": instance.cover_image.url if instance.cover_image else None,
            "description": instance.description,
            "songList": list(songs_qs),
        }


class AlbumDetailModelSerializer(drf_serializers.ModelSerializer):
    songs = serializers.SerializerMethodField()

    class Meta:
        model = Album
        fields = [
            "id",
            "title",
            "description",
            "is_single",
            "release_date",
            "artist",
            "cover_image",
            "songs",
        ]
        read_only_fields = ["id", "artist"]

    def get_songs(self, obj):
        return list(obj.songs.order_by("track_number").values_list("id", flat=True))

    def update(self, instance, validated_data):
        data = dict(validated_data)
        album = services.update_album(instance.pk, data)
        return album

    def to_representation(self, instance):
        # Represent as frontend shape
        songs_qs = instance.songs.order_by("track_number").values_list("id", flat=True)
        listeners = services.compute_listeners_count(instance)
        artist_name = None
        artist_id = None
        try:
            owner = instance.artist.owner
            artist_name = owner.display_name or owner.username
            artist_id = owner.id
        except Exception:
            pass

        return {
            "id": instance.id,
            "name": instance.title,
            "artistName": artist_name,
            "artistId": artist_id,
            "listeners": listeners,
            "releaseDate": instance.release_date,
            "imageUrl": instance.cover_image.url if instance.cover_image else None,
            "description": instance.description,
            "songList": list(songs_qs),
        }


# remove old AlbumCreateUpdateSerializer name to avoid confusion

class AlbumSongSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    title = serializers.CharField()
    artistName = serializers.SerializerMethodField()
    artistId = serializers.SerializerMethodField()
    albumName = serializers.SerializerMethodField()
    albumId = serializers.SerializerMethodField()
    streams = serializers.IntegerField()
    releaseDate = serializers.DateTimeField(source="release_date")
    imageUrl = serializers.SerializerMethodField()
    trackNumber = serializers.IntegerField(source="track_number", allow_null=True)
    songDurationMs = serializers.IntegerField(source="duration_ms")
    audioUrl = serializers.SerializerMethodField()
    lyrics = serializers.CharField(allow_null=True)

    def get_artistName(self, obj):
        try:
            owner = obj.artist.owner
            return owner.display_name or owner.username
        except Exception:
            return None

    def get_artistId(self, obj):
        try:
            return obj.artist.owner.id
        except Exception:
            return None

    def get_albumName(self, obj):
        return obj.album.title if obj.album else None

    def get_albumId(self, obj):
        return obj.album.id if obj.album else None

    def get_imageUrl(self, obj):
        if obj.cover_image:
            try:
                return obj.cover_image.url
            except Exception:
                return None
        # fallback to album cover
        if obj.album and obj.album.cover_image:
            try:
                return obj.album.cover_image.url
            except Exception:
                return None
        return None

    def get_audioUrl(self, obj):
        if obj.audio_file:
            try:
                return obj.audio_file.url
            except Exception:
                return None
        return None