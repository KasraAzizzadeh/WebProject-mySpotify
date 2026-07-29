from django.shortcuts import get_object_or_404
from rest_framework.permissions import AllowAny

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status, generics
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User, Notification
from albums.models import Album
from songs.models import Song

from rest_framework import serializers
from .serializers import RegisterSerializer, LoginSerializer, AuthUserSerializer, AuthResponseSerializer

from drf_spectacular.utils import extend_schema, OpenApiExample, inline_serializer, OpenApiResponse


@extend_schema(
    summary="Register a new user",
    description=(
        "Creates a new listener account, assigns the Basic subscription plan, "
        "generates a random display name, creates default user settings, and "
        "returns the authenticated user together with JWT access and refresh tokens."
    ),
    request=RegisterSerializer,
    responses={
        status.HTTP_201_CREATED: AuthResponseSerializer,
        status.HTTP_400_BAD_REQUEST: OpenApiResponse(
            description="Validation error.",
            response=inline_serializer(
                name="RegisterError",
                fields={
                    "username": serializers.ListField(
                        child=serializers.CharField(),
                        required=False,
                    ),
                    "email": serializers.ListField(
                        child=serializers.CharField(),
                        required=False,
                    ),
                    "password": serializers.ListField(
                        child=serializers.CharField(),
                        required=False,
                    ),
                },
            ),
        ),
    },
    examples=[
        OpenApiExample(
            "Register request",
            request_only=True,
            value={
                "username": "johndoe",
                "email": "john@example.com",
                "password": "StrongPassword123!",
                "birth_date": "2000-01-15",
                "gender": "MALE",
            },
        ),
        OpenApiExample(
            "Successful registration",
            response_only=True,
            status_codes=["201"],
            value={
                "user": {
                    "id": 1,
                    "username": "johndoe",
                    "display_name": "johndoe_4821",
                    "email": "john@example.com",
                    "role": "listener",
                    "profile_picture": None,
                    "gender": "MALE",
                    "birth_date": "2000-01-15",
                    "subscription_type": "basic",
                    "subscription_valid_until": None,
                    "followers": [],
                    "following": [],
                    "created_at": "2026-07-29T12:34:56Z",
                    "settings": {
                        "language": "en",
                        "system_voice": "en-is",
                        "notification_limit": 10,
                    },
                    "listener_profile": {
                        "playlists": [],
                        "recently_played": [],
                        "liked_tracks": [],
                        "daily_streams": 0,
                        "last_stream_date": None,
                    },
                    "artist_profile": {},
                },
                "access": "<jwt access token>",
                "refresh": "<jwt refresh token>",
            },
        ),
        OpenApiExample(
            "Email already exists",
            response_only=True,
            status_codes=["400"],
            value={
                "email": [
                    "user with this email already exists."
                ]
            },
        ),
        OpenApiExample(
            "Username already exists",
            response_only=True,
            status_codes=["400"],
            value={
                "username": [
                    "A user with that username already exists."
                ]
            },
        ),
        OpenApiExample(
            "Weak password",
            response_only=True,
            status_codes=["400"],
            value={
                "password": [
                    "This password is too short."
                ]
            },
        ),
    ],
)
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "user": AuthUserSerializer(user).data,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
            status=status.HTTP_201_CREATED,
        )


@extend_schema(
    summary="Login",
    description=(
        "Authenticates a user using their email and password, checks their "
        "subscription status, creates an expiration notification if necessary, "
        "and returns the authenticated user together with JWT access and refresh tokens."
    ),
    request=LoginSerializer,
    responses={
        status.HTTP_200_OK: AuthResponseSerializer,
        status.HTTP_401_UNAUTHORIZED: OpenApiResponse(
            description="Authentication failed.",
            response=inline_serializer(
                name="LoginError",
                fields={
                    "detail": serializers.CharField(),
                },
            ),
        ),
    },
    examples=[
        OpenApiExample(
            "Login request",
            request_only=True,
            value={
                "email": "john@example.com",
                "password": "StrongPassword123!",
            },
        ),
        OpenApiExample(
            "Successful login",
            response_only=True,
            status_codes=["200"],
            value={
                "user": {
                    "id": 1,
                    "username": "johndoe",
                    "display_name": "johndoe_4821",
                    "email": "john@example.com",
                    "role": "listener",
                    "profile_picture": None,
                    "gender": "MALE",
                    "birth_date": "2000-01-15",
                    "subscription_type": "basic",
                    "subscription_valid_until": None,
                    "followers": [3, 5],
                    "following": [7, 12],
                    "created_at": "2026-07-29T12:34:56Z",
                    "settings": {
                        "language": "en",
                        "system_voice": "en-is",
                        "notification_limit": 10,
                    },
                    "listener_profile": {
                        "playlists": [4, 8],
                        "recently_played": [21, 15, 8],
                        "liked_tracks": [],
                        "daily_streams": 6,
                        "last_stream_date": "2026-07-29T11:08:12Z",
                    },
                    "artist_profile": {},
                },
                "access": "<jwt access token>",
                "refresh": "<jwt refresh token>",
            },
        ),
        OpenApiExample(
            "Invalid credentials",
            response_only=True,
            status_codes=["401"],
            value={
                "detail": "Invalid credentials",
            },
        ),
    ],
)
class LoginView(generics.CreateAPIView):
    serializer_class = LoginSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]
        user = (
            User.objects
            .select_related(
                "subscription_plan",
                "settings",
                "artist_profile",
            )
            .prefetch_related(
                "followers",
                "following",
                "playlists",
            )
            .get(pk=user.pk)
        )
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "user": AuthUserSerializer(user).data,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
            status=status.HTTP_200_OK,
        )


class UserProfileView(APIView):

    permission_classes = [
        permissions.IsAuthenticated
    ]

    def get(self, request, id):

        user = get_object_or_404(
            User,
            id=id
        )

        data = {
            "id": user.id,
            "username": user.username,
            "display_name": user.display_name,
            "email": user.email,
            "profile_picture": user.profile_picture.url
            if user.profile_picture else None,
            "role": user.role,
            "gender": user.gender,
            "birth_date": user.birth_date,
            "created_at": user.created_at,
            "followers": user.followers.count(),
            "following": user.following.count(),
        }


        # Only show private information to owner
        if request.user.id == user.id:

            data.update(
                {
                    "subscription_plan":
                        user.subscription_plan.name
                        if user.subscription_plan else None,

                    "subscription_valid_until":
                        user.subscription_valid_until,
                }
            )

        return Response(data)



class UserPlaylistsView(APIView):

    permission_classes = [
        permissions.IsAuthenticated
    ]

    def get(self, request, id):

        user = get_object_or_404(
            User,
            id=id
        )

        playlists = user.playlists.all()

        data = [
            {
                "id": playlist.id,
                "name": playlist.name,
                "description": playlist.description,
                "is_private": playlist.is_private,
                "cover_image":
                    playlist.cover_image.url
                    if playlist.cover_image else None,
                "created_at": playlist.created_at,
            }

            for playlist in playlists
        ]

        return Response(data)



class UserAlbumsView(APIView):

    permission_classes = [
        permissions.IsAuthenticated
    ]

    def get(self, request, id):

        user = get_object_or_404(
            User,
            id=id
        )

        if not hasattr(user, "artist_profile"):
            return Response([])


        albums = user.artist_profile.albums.all()


        data = [
            {
                "id": album.id,
                "title": album.title,
                "description": album.description,
                "release_date": album.release_date,
                "cover_image":
                    album.cover_image.url
                    if album.cover_image else None,
            }

            for album in albums
        ]

        return Response(data)



class UserSongsView(APIView):

    permission_classes = [
        permissions.IsAuthenticated
    ]

    def get(self, request, id):

        user = get_object_or_404(
            User,
            id=id
        )

        if not hasattr(user, "artist_profile"):
            return Response([])


        songs = user.artist_profile.songs.all()


        data = [
            {
                "id": song.id,
                "title": song.title,
                "album": song.album.title,
                "duration_ms": song.duration_ms,
                "streams": song.streams,
                "release_date": song.release_date,
            }

            for song in songs
        ]


        return Response(data)



class NotificationsView(APIView):

    permission_classes = [
        permissions.IsAuthenticated
    ]

    def get(self, request):

        notifications = request.user.notifications.all()

        data = [
            {
                "id": notification.id,
                "type": notification.type,
                "content": notification.content,
                "is_read": notification.is_read,
                "created_at": notification.created_at,
            }

            for notification in notifications
        ]

        return Response(data)



class NotificationDetailView(APIView):

    permission_classes = [
        permissions.IsAuthenticated
    ]

    def patch(self, request, id):

        notification = get_object_or_404(
            Notification,
            id=id,
            owner=request.user
        )

        notification.is_read = request.data.get(
            "is_read",
            notification.is_read
        )

        notification.save()

        return Response(
            {
                "detail": "Notification updated"
            }
        )


    def delete(self, request, id):

        notification = get_object_or_404(
            Notification,
            id=id,
            owner=request.user
        )

        notification.delete()

        return Response(
            {
                "detail": "Notification deleted"
            }
        )



class FollowUserView(APIView):

    permission_classes = [
        permissions.IsAuthenticated
    ]


    def post(self, request, id):

        target = get_object_or_404(
            User,
            id=id
        )


        request.user.following.add(
            target
        )


        return Response(
            {
                "detail": "Followed successfully"
            }
        )



    def delete(self, request, id):

        target = get_object_or_404(
            User,
            id=id
        )


        request.user.following.remove(
            target
        )


        return Response(
            {
                "detail": "Unfollowed successfully"
            }
        )