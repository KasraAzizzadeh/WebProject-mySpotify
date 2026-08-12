import json

from django.shortcuts import get_object_or_404
from rest_framework.permissions import AllowAny

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status, generics
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User, Notification, ArtistProfile
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
    NotificationSerializer, SubmitArtistApplicationSerializer,
)

from drf_spectacular.utils import extend_schema, OpenApiExample, inline_serializer, OpenApiResponse, PolymorphicProxySerializer


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


@extend_schema_view(
    get=extend_schema(
        summary="Get user profile",
        description=(
            "Returns public profile data for a user when accessed by another authenticated user. "
            "If the authenticated user requests their own profile, the full private profile is returned."
        ),
        responses={
            200: OpenApiResponse(
                response=PolymorphicProxySerializer(
                    component_name='UserProfileResponse',
                    serializers=[UserPublicSerializer, UserPrivateSerializer],
                    resource_type_field_name=None,
                ),
                description=(
                    "Returns either the public user profile or the authenticated owner's full private profile. "
                    "The public profile includes id, username, display_name, profile_picture_url, role, followers, following, "
                    "and artist profile data for artists. The private profile includes additional email, subscription, "
                    "settings, listener_profile, and artist_profile details."
                ),
            )
        }
    ),
    patch=extend_schema(
        summary="Update own profile",
        description=(
            "Update the authenticated user's profile. Allowed fields: display_name, email, password, settings. "
            "settings follows the same shape returned by GET /accounts/{id}/: {\"language\": \"en\"|\"fa\", \"system_voice\": \"en-is\"|\"fa\", \"notification_limit\": <integer>}. "
            "If the user is an artist, artist_bio may also be provided to update the artist bio."
        ),
        request=inline_serializer(
            name='UserUpdateRequest',
            fields={
                'display_name': serializers.CharField(required=False),
                'email': serializers.EmailField(required=False),
                'password': serializers.CharField(required=False),
                'artist_bio': serializers.CharField(required=False),
                'profile_picture': serializers.ImageField(required=False, allow_null=True),
                'settings': inline_serializer(
                    name='UserSettingsUpdateRequest',
                    fields={
                        'language': serializers.ChoiceField(choices=['en', 'fa'], required=False),
                        'system_voice': serializers.ChoiceField(choices=['en-is', 'fa'], required=False),
                        'notification_limit': serializers.IntegerField(min_value=1, required=False),
                    },
                ),
            }
        ),
        responses={200: AuthUserSerializer}
    ),
    delete=extend_schema(
        summary="Delete own account",
        description="Deletes the authenticated user's account. The id in the path must match the authenticated user's id.",
        responses={200: inline_serializer(name='UserDeleteResponse', fields={'detail': serializers.CharField()})}
    )
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

    def patch(self, request, id):
        # Only allow owners to update their profile
        if request.user.id != int(id):
            return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        from .serializers import UserUpdateSerializer

        # Normalize incoming data: if a client (e.g. Swagger UI multipart) sends empty strings
        # for optional fields (clicking 'send empty value'), treat them as omitted so they do not
        # trigger validations or permission checks. Copy request.data (a QueryDict) so it's mutable.
        incoming = request.data.copy()
        for key in list(incoming.keys()):
            val = incoming.get(key)
            if key == 'profile_picture' and val in ('', 'null', 'None', 'undefined'):
                incoming[key] = None
                continue
            # if it's an empty string, remove it so serializer treats it as not provided
            if isinstance(val, str) and val.strip() == "":
                incoming.pop(key)

        if "settings" in incoming and isinstance(incoming["settings"], str):
            try:
                incoming["settings"] = json.loads(incoming["settings"])
            except json.JSONDecodeError:
                return Response({"settings": ["Settings must be a valid JSON object."]}, status=status.HTTP_400_BAD_REQUEST)

        serializer = UserUpdateSerializer(data=incoming)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        user = request.user

        changed = False
        update_fields = []

        if 'display_name' in data:
            user.display_name = data['display_name']
            changed = True
            update_fields.append('display_name')

        if 'email' in data and data['email'] != user.email:
            # ensure email uniqueness
            if User.objects.filter(email=data['email']).exclude(pk=user.pk).exists():
                return Response({'email': ['A user with that email already exists.']}, status=status.HTTP_400_BAD_REQUEST)
            user.email = data['email']
            changed = True
            update_fields.append('email')

        if 'password' in data and data['password']:
            # validate password using same rules as registration
            try:
                RegisterSerializer().validate_password(data['password'])
            except serializers.ValidationError as exc:
                # return error format similar to registration errors
                msg = exc.detail if hasattr(exc, 'detail') else str(exc)
                return Response({'password': [msg]}, status=status.HTTP_400_BAD_REQUEST)

            user.set_password(data['password'])
            changed = True
            update_fields.append('password')

        # artist bio - only allowed for users with artist role
        if 'artist_bio' in data:
            # require explicit artist role
            if user.role != User.Roles.ARTIST:
                return Response({'artist_bio': ['Only artists can update artist bio.']}, status=status.HTTP_400_BAD_REQUEST)

            # Ensure an artist_profile exists (create if missing) and update bio
            artist_profile, created = ArtistProfile.objects.get_or_create(
                owner=user,
                defaults={
                    'bio': data['artist_bio'],
                    'verification_status': ArtistProfile.VerificationStatus.ACCEPTED,
                },
            )

            if not created:
                artist_profile.bio = data['artist_bio']
                artist_profile.save(update_fields=['bio'])
            # no error returned; artist_profile created or updated

        if 'settings' in data:
            settings_data = data['settings']
            settings = user.settings
            for field_name, value in settings_data.items():
                setattr(settings, field_name, value)
            settings.save()
            changed = True

        # profile picture handling (file upload similar to songs audio_file)
        if 'profile_picture' in data:
            # Only allow profile picture changes for plans that support it
            plan = getattr(user, 'subscription_plan', None)
            can_change_picture = bool(plan and getattr(plan, 'profile_picture_upload', False))
            if not can_change_picture:
                return Response({'detail': 'Your subscription plan does not allow changing profile picture.'}, status=status.HTTP_403_FORBIDDEN)

            pic = data.get('profile_picture')
            # explicit removal if null provided
            if pic is None:
                if user.profile_picture:
                    try:
                        user.profile_picture.delete(save=False)
                    except Exception:
                        pass
                user.profile_picture = None
                changed = True
                update_fields.append('profile_picture')
            else:
                user.profile_picture = pic
                changed = True
                update_fields.append('profile_picture')

        if changed:
            # save user
            user.save()

        # return full user representation
        user = User.objects.select_related('subscription_plan', 'settings', 'artist_profile')\
            .prefetch_related('followers', 'following', 'playlists').get(pk=user.pk)

        return Response(AuthUserSerializer(user).data)

    def delete(self, request, id):
        # Only allow owners to delete their account
        if request.user.id != int(id):
            return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        user = request.user
        username = user.username
        user.delete()

        return Response({'detail': f'User {username} deleted successfully.'})


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
        summary="Mark notification as read",
        description="Marks the specified notification as read by setting its is_read field to true.",
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

        notification.is_read = True
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