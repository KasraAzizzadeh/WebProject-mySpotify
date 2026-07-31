import re

from django.contrib.auth import authenticate
from django.db import transaction
from django.db.models import Sum
from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed

from .models import User, UserSettings, ArtistProfile, Notification
from albums.models import Album
from playlists.models import Playlist
from songs.models import Song
from subscriptions.models import SubscriptionPlan
from .utils import generate_display_name
from .services import get_artist_total_streams, get_artist_unique_listeners, get_recently_played, \
    get_user_daily_streams, get_last_stream_date, get_user_followers, get_user_followings, prepare_user_for_login, \
    submit_artist_application


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    class Meta:
        model = User
        fields = ("username", "email", "password", "birth_date", "gender")

    def validate_password(self, password):
        if len(password) < 8:
            raise serializers.ValidationError(
                "Password should be at least 8 characters."
            )

        if len(password) > 32:
            raise serializers.ValidationError(
                "Password should be at most 32 characters."
            )

        if not re.search(r"[a-z]", password):
            raise serializers.ValidationError(
                "Password must contain a lowercase letter."
            )

        if not re.search(r"[A-Z]", password):
            raise serializers.ValidationError(
                "Password must contain an uppercase letter."
            )

        if not re.search(r"\d", password):
            raise serializers.ValidationError(
                "Password must contain a number."
            )

        if not re.search(r"[^A-Za-z\d]", password):
            raise serializers.ValidationError(
                "Password must contain a special character."
            )

        return password

    @transaction.atomic
    def create(self, validated_data):
        display_name = generate_display_name(validated_data["username"])
        password = validated_data.pop("password")
        subscription_plan = SubscriptionPlan.objects.get(name=SubscriptionPlan.PlanType.BASIC)
        user = User.objects.create_user(
            **validated_data,
            password=password,
            subscription_plan=subscription_plan,
            display_name=display_name,
        )
        UserSettings.objects.create(owner=user)

        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs["email"]
        password = attrs["password"]
        user = User.objects.filter(email=email).first()
        if not user:
            raise AuthenticationFailed("Invalid credentials")

        user = authenticate(username=user.username, password=password)
        if user is None:
            raise AuthenticationFailed("Invalid credentials")

        prepare_user_for_login(user)
        attrs["user"] = user
        return attrs


class ArtistProfileSerializer(serializers.ModelSerializer):
    songs = serializers.SerializerMethodField()
    albums = serializers.SerializerMethodField()
    total_streams = serializers.SerializerMethodField()
    unique_listeners = serializers.SerializerMethodField()

    class Meta:
        model = ArtistProfile
        fields = (
            "bio",
            "verification_status",
            "songs",
            "albums",
            "total_streams",
            "unique_listeners",
        )

    def get_songs(self, artist):
        return list(artist.songs.values_list("id", flat=True))

    def get_albums(self, artist):
        return list(artist.albums.values_list("id", flat=True))

    def get_total_streams(self, artist):
        return get_artist_total_streams(artist)

    def get_unique_listeners(self, artist):
        return get_artist_unique_listeners(artist)


class ListenerProfileSerializer(serializers.Serializer):
    playlists = serializers.SerializerMethodField()
    recently_played = serializers.SerializerMethodField()
    liked_tracks = serializers.SerializerMethodField()
    daily_streams = serializers.SerializerMethodField()
    last_stream_date = serializers.SerializerMethodField()

    def get_playlists(self, user):
        return list(user.playlists.values_list("id", flat=True))

    def get_recently_played(self, user):
        return get_recently_played(user)

    def get_liked_tracks(self, user):
        return []

    def get_daily_streams(self, user):
        return get_user_daily_streams(user)

    def get_last_stream_date(self, user):
        return get_last_stream_date(user)


class UserSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSettings
        fields = [
            "language",
            "system_voice",
            "notification_limit",
        ]

class AuthUserSerializer(serializers.ModelSerializer):
    subscription_type = serializers.CharField(source="subscription_plan.name", read_only=True)
    settings = UserSettingsSerializer(read_only=True)
    listener_profile = serializers.SerializerMethodField()
    artist_profile = serializers.SerializerMethodField()
    followers = serializers.SerializerMethodField()
    following = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "display_name",
            "email",
            "role",
            "profile_picture",
            "gender",
            "birth_date",
            "subscription_type",
            "subscription_valid_until",
            "followers",
            "following",
            "created_at",
            "settings",
            "listener_profile",
            "artist_profile",
        )

    def get_followers(self, user):
        return get_user_followers(user)

    def get_following(self, user):
        return get_user_followings(user)

    def get_listener_profile(self, user):
        return ListenerProfileSerializer(user).data

    def get_artist_profile(self, user):
        try:
            return ArtistProfileSerializer(user.artist_profile).data
        except ArtistProfile.DoesNotExist:
            return {}


class AuthResponseSerializer(serializers.Serializer):
    user = AuthUserSerializer()
    access = serializers.CharField()
    refresh = serializers.CharField()


class SubmitArtistApplicationSerializer(serializers.Serializer):
    artistic_name = serializers.CharField(max_length=64)
    samples = serializers.ListField(child=serializers.FileField(), allow_empty=False, max_length=5,)

    def validate(self, attrs):
        user = self.context["request"].user

        if hasattr(user, "artist_profile"):
            status = user.artist_profile.verification_status

            if status == ArtistProfile.VerificationStatus.PENDING:
                raise serializers.ValidationError("Your artist application is still pending.")

            if status == ArtistProfile.VerificationStatus.ACCEPTED:
                raise serializers.ValidationError("You are already a verified artist.")

        return attrs

    def create(self, validated_data):
        return submit_artist_application(
            user=self.context["request"].user,
            artistic_name=validated_data["artistic_name"],
            samples=validated_data["samples"],
        )


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
    owner_id = serializers.IntegerField(source='owner.id', read_only=True)
    image_url = serializers.ImageField(source='cover_image', read_only=True)
    song_list = serializers.SerializerMethodField()

    class Meta:
        model = Playlist
        fields = [
            "id",
            "name",
            "owner_id",
            "created_at",
            "image_url",
            "description",
            "is_private",
            "song_list",
        ]

    def get_song_list(self, playlist):
        # preserve order by PlaylistItem.position
        return list(playlist.items.order_by('position').values_list('song_id', flat=True))


class UserAlbumSerializer(serializers.ModelSerializer):
    """
    Serialize Album to match frontend AlbumItem shape where possible.
    """
    name = serializers.CharField(source='title')
    artist_name = serializers.SerializerMethodField()
    artist_id = serializers.SerializerMethodField()
    listeners = serializers.SerializerMethodField()
    image_url = serializers.ImageField(source='cover_image', read_only=True)
    song_list = serializers.SerializerMethodField()
    description = serializers.CharField(allow_null=True)
    genre = serializers.SerializerMethodField()
    collaborators = serializers.SerializerMethodField()
    release_type = serializers.SerializerMethodField()

    class Meta:
        model = Album
        fields = [
            'id',
            'name',
            'artist_name',
            'artist_id',
            'listeners',
            'release_date',
            'image_url',
            'description',
            'song_list',
            'genre',
            'collaborators',
            'release_type',
        ]

    def get_artist_name(self, album):
        owner = album.artist.owner
        return owner.display_name or owner.username

    def get_artist_id(self, album):
        return album.artist.owner.id

    def get_listeners(self, album):
        # approximate listeners as total streams for songs in the album
        return int(album.songs.aggregate(total_streams=Sum('streams'))['total_streams'] or 0)

    def get_song_list(self, album):
        return list(album.songs.order_by('track_number').values_list('id', flat=True))

    def get_genre(self, album):
        return list(album.genre.values_list('name', flat=True))

    def get_collaborators(self, album):
        return [c.owner.id for c in album.collaborators.all()]

    def get_release_type(self, album):
        return 'single' if album.is_single else 'album'


class UserSongSerializer(serializers.ModelSerializer):
    artist_name = serializers.SerializerMethodField()
    artist_id = serializers.SerializerMethodField()
    album_name = serializers.CharField(source='album.title', read_only=True)
    album_id = serializers.IntegerField(source='album.id', read_only=True)
    image_url = serializers.ImageField(source='cover_image', read_only=True)
    song_duration_ms = serializers.IntegerField(source='duration_ms')
    audio_url = serializers.FileField(source='audio_file', read_only=True)

    class Meta:
        model = Song
        fields = [
            'id',
            'title',
            'artist_name',
            'artist_id',
            'album_name',
            'album_id',
            'streams',
            'release_date',
            'image_url',
            'track_number',
            'song_duration_ms',
            'audio_url',
            'lyrics',
        ]

    def get_artist_name(self, song):
        owner = song.artist.owner
        return owner.display_name or owner.username

    def get_artist_id(self, song):
        return song.artist.owner.id


class NotificationSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source='owner.id', read_only=True)
    status = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField()

    class Meta:
        model = Notification
        fields = [
            'id',
            'user_id',
            'content',
            'status',
            'type',
            'created_at',
        ]

    def get_status(self, obj):
        return 'read' if obj.is_read else 'unread'