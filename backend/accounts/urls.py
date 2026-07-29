from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import RegisterView, LoginView, SubmitArtistApplicationView
from .views import (
    UserProfileView,
    UserPlaylistsView,
    UserAlbumsView,
    UserSongsView,
    NotificationsView,
    NotificationDetailView,
    FollowUserView,
)

urlpatterns = [
    # Auth
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("apply-as-artist/", SubmitArtistApplicationView.as_view(), name="aplly_as_artist"),

    # Profile
    path("<int:id>/", UserProfileView.as_view(), name="profile"),
    path("<int:id>/playlists/", UserPlaylistsView.as_view(), name="user-playlists"),
    path("<int:id>/albums/", UserAlbumsView.as_view(), name="user-albums"),
    path("<int:id>/songs/", UserSongsView.as_view(), name="user-songs"),
    # Notifications
    path("notifications/", NotificationsView.as_view(), name="notifications"),
    path("notifications/<int:id>/", NotificationDetailView.as_view(), name="notification-detail"),
    # Follow / Unfollow
    # POST   /accounts/<id>/follow/
    # DELETE /accounts/<id>/follow/
    path("<int:id>/follow/", FollowUserView.as_view(), name="follow"),
]