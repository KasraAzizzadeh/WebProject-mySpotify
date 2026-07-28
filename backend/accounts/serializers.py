from rest_framework import serializers

from .models import User, UserSettings, ArtistProfile, Notification
from albums.models import Album
from playlists.models import Playlist
from songs.models import Song


class ArtistProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArtistProfile
        fields = [
            "bio",
            "verification_status",
        ]


class UserPublicSerializer(serializers.ModelSerializer):
    followers = serializers.PrimaryKeyRelatedField(
        many=True,
        read_only=True
    )

    following = serializers.PrimaryKeyRelatedField(
        many=True,
        read_only=True
    )

    artist_profile = ArtistProfileSerializer(
        read_only=True
    )

    profile_picture_url = serializers.ImageField(
        source="profile_picture",
        read_only=True
    )

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "display_name",
            "profile_picture_url",
            "role",
            "followers",
            "following",
            "artist_profile",
        ]


class UserSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSettings
        fields = [
            "language",
            "system_voice",
            "notification_limit",
        ]


class UserPrivateSerializer(serializers.ModelSerializer):
    followers = serializers.PrimaryKeyRelatedField(
        many=True,
        read_only=True
    )

    following = serializers.PrimaryKeyRelatedField(
        many=True,
        read_only=True
    )

    subscription_type = serializers.CharField(
        source="subscription_plan.name",
        read_only=True
    )

    profile_picture_url = serializers.ImageField(
        source="profile_picture",
        read_only=True
    )

    settings = UserSettingsSerializer(
        read_only=True
    )

    artist_profile = ArtistProfileSerializer(
        read_only=True
    )

    class Meta:
        model = User

        fields = [
            "id",
            "username",
            "email",
            "display_name",
            "profile_picture_url",
            "role",
            "subscription_type",
            "subscription_valid_until",
            "gender",
            "birth_date",
            "created_at",
            "followers",
            "following",
            "settings",
            "artist_profile",
        ]

        read_only_fields = [
            "username",
            "role",
            "created_at",
        ]


class UserPlaylistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Playlist
        fields = [
            "id",
            "name",
            "description",
            "cover_image",
            "is_private",
            "created_at",
        ]


class UserAlbumSerializer(serializers.ModelSerializer):

    class Meta:
        model = Album
        fields = [
            "id",
            "title",
            "description",
            "cover_image",
            "release_date",
            "is_single",
        ]


class UserSongSerializer(serializers.ModelSerializer):

    class Meta:
        model = Song
        fields = [
            "id",
            "title",
            "duration_ms",
            "streams",
            "cover_image",
            "release_date",
            "track_number",
        ]


class NotificationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Notification
        fields = [
            "id",
            "type",
            "content",
            "is_read",
            "created_at",
        ]

        read_only_fields = [
            "created_at",
            "type",
            "content",
        ]