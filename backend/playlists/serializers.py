from rest_framework import serializers

from accounts.models import User
from songs.serializers import SongSerializer
from .models import Playlist, PlaylistItem


class PlaylistsSerializer(serializers.ModelSerializer):
    songs = serializers.SerializerMethodField()

    class Meta:
        model = Playlist
        fields = ["id", "name", "owner", "cover_image", "created_at", "songs"]
        read_only_fields = ["id", "owner", "cover_image", "created_at", "songs"]

    def create(self, validated_data):
        user = self.context['request'].user
        limit = user.subscription_plan.playlist_limit
        if limit is not None:
            if user.playlists.count() >= limit:
                raise serializers.ValidationError(f"You can create at most {limit} playlists with your current subscription.")

        return Playlist.objects.create(**validated_data, owner=user)

    def get_songs(self, obj):
        return list(obj.items.order_by("position").values_list("song_id", flat=True))


class PlaylistDetailSerializer(serializers.ModelSerializer):
    songs = serializers.SerializerMethodField()

    class Meta:
        model = Playlist
        fields = [
            "id",
            "name",
            "description",
            "owner",
            "is_private",
            "cover_image",
            "created_at",
            "songs",
        ]
        read_only_fields = ["id", "owner", "created_at", "songs"]

    def get_songs(self, obj):
        return list(obj.items.order_by("position").values_list("song_id", flat=True))


class PlaylistSongsSerializer(serializers.ModelSerializer):
    song = SongSerializer(read_only=True)

    class Meta:
        model = PlaylistItem
        fields = ("position", "added_at", "song")