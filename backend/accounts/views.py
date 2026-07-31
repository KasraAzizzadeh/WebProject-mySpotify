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
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    AuthUserSerializer,
    AuthResponseSerializer,
    UserPublicSerializer,
    UserPrivateSerializer,
    UserAlbumSerializer,
    UserSongSerializer,
    UserPlaylistSerializer,
    NotificationSerializer,
)

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


from django.db.models import Prefetch

from drf_spectacular.utils import (
    extend_schema,
    extend_schema_view,
    OpenApiExample,
)

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import User
from .serializers import (
    SubmitArtistApplicationSerializer,
    AuthUserSerializer,
)


@extend_schema(
    summary="Apply as an artist",
    description=(
        "Submits an artist verification request together with sample "
        "audio files. A pending artist profile is created (or reset from "
        "rejected), support staff are notified, and the updated user is "
        "returned."
    ),
    request=SubmitArtistApplicationSerializer,
    responses={
        201: AuthUserSerializer,
        400: OpenApiExample(
            "Already pending",
            value={
                "non_field_errors": [
                    "Your artist application is currently under review."
                ]
            },
        ),
    },
    examples=[
        OpenApiExample(
            "Request",
            request_only=True,
            value={
                "artistic_name": "DJ Eclipse",
                "samples": [
                    "<audio file>",
                    "<audio file>",
                ],
            },
        ),
    ],
)
class SubmitArtistApplicationView(generics.CreateAPIView):
    serializer_class = SubmitArtistApplicationSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save()
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

        return Response(
            AuthUserSerializer(user).data,
            status=status.HTTP_201_CREATED,
        )


@extend_schema(
    summary="Get user profile",
    description="Returns public view of a user's profile or private view if requested by the owner.",
    responses={200: UserPublicSerializer}
)
class UserProfileView(APIView):

    permission_classes = [
        permissions.IsAuthenticated
    ]

    def get(self, request, id):
        user = get_object_or_404(
            User.objects.select_related('subscription_plan', 'settings', 'artist_profile')
            .prefetch_related('followers', 'following', 'playlists'),
            id=id,
        )

        if request.user.id == user.id:
            serializer = UserPrivateSerializer(user)
        else:
            serializer = UserPublicSerializer(user)

        return Response(serializer.data)


@extend_schema(
    summary="Get user's playlists",
    description="Returns playlists owned by the specified user.",
    responses={200: UserPlaylistSerializer(many=True)}
)
class UserPlaylistsView(APIView):

    permission_classes = [
        permissions.IsAuthenticated
    ]

    def get(self, request, id):
        user = get_object_or_404(User, id=id)
        playlists = user.playlists.prefetch_related('items').all()
        serializer = UserPlaylistSerializer(playlists, many=True)
        return Response(serializer.data)


@extend_schema(
    summary="Get user's albums",
    description="Returns published albums for an artist. Shape matches frontend AlbumItem as closely as possible.",
    responses={200: UserAlbumSerializer(many=True)}
)
class UserAlbumsView(APIView):

    permission_classes = [
        permissions.IsAuthenticated
    ]

    def get(self, request, id):
        user = get_object_or_404(User, id=id)

        if not hasattr(user, 'artist_profile'):
            return Response([])

        albums = user.artist_profile.albums.prefetch_related('songs', 'genre', 'collaborators').all()
        serializer = UserAlbumSerializer(albums, many=True)
        return Response(serializer.data)


@extend_schema(
    summary="Get user's songs",
    description="Returns songs belonging to an artist. Uses a serializer shaped for frontend SongItem.",
    responses={200: UserSongSerializer(many=True)}
)
class UserSongsView(APIView):

    permission_classes = [
        permissions.IsAuthenticated
    ]

    def get(self, request, id):
        user = get_object_or_404(User, id=id)

        if not hasattr(user, 'artist_profile'):
            return Response([])

        songs = user.artist_profile.songs.select_related('album').all()
        serializer = UserSongSerializer(songs, many=True)
        return Response(serializer.data)


@extend_schema(
    summary="List notifications for current user",
    description="Returns notifications belonging to the authenticated user.",
    responses={200: NotificationSerializer(many=True)}
)
class NotificationsView(APIView):

    permission_classes = [
        permissions.IsAuthenticated
    ]

    def get(self, request):
        notifications = request.user.notifications.all()
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)


@extend_schema_view(
    patch=extend_schema(
        summary="Mark notification read/unread",
        description="Mark the specified notification as read or unread. Accepts 'is_read' (boolean) or 'status' ('read'|'unread').",
        responses={200: inline_serializer(name='NotificationUpdateResponse', fields={'detail': serializers.CharField()})}
    ),
    delete=extend_schema(
        summary="Delete a notification",
        description="Deletes the specified notification owned by the authenticated user.",
        responses={200: inline_serializer(name='NotificationDeleteResponse', fields={'detail': serializers.CharField()})}
    )
)
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

        # allow clients to send 'is_read' (boolean) or 'status' ('read'|'unread')
        if 'is_read' in request.data:
            notification.is_read = bool(request.data.get('is_read'))
        elif 'status' in request.data:
            notification.is_read = (request.data.get('status') == 'read')

        notification.save(update_fields=['is_read'])

        return Response({'detail': 'Notification updated'})


    def delete(self, request, id):
        notification = get_object_or_404(
            Notification,
            id=id,
            owner=request.user
        )

        notification.delete()

        return Response({'detail': 'Notification deleted'})


@extend_schema_view(
    post=extend_schema(
        summary="Follow a user",
        description="Authenticated user follows the specified target user. Returns a success message on completion.",
        responses={200: inline_serializer(name='FollowResponse', fields={'detail': serializers.CharField()})}
    ),
    delete=extend_schema(
        summary="Unfollow a user",
        description="Authenticated user unfollows the specified target user. Returns a success message on completion.",
        responses={200: inline_serializer(name='UnfollowResponse', fields={'detail': serializers.CharField()})}
    )
)
class FollowUserView(APIView):

    permission_classes = [
        permissions.IsAuthenticated
    ]


    def post(self, request, id):
        target = get_object_or_404(User, id=id)

        if target.id == request.user.id:
            return Response({'detail': "Cannot follow yourself."}, status=status.HTTP_400_BAD_REQUEST)

        request.user.following.add(target)

        return Response({'detail': 'Followed successfully'})


    def delete(self, request, id):
        target = get_object_or_404(User, id=id)

        if target.id == request.user.id:
            return Response({'detail': "Cannot unfollow yourself."}, status=status.HTTP_400_BAD_REQUEST)

        request.user.following.remove(target)

        return Response({'detail': 'Unfollowed successfully'})