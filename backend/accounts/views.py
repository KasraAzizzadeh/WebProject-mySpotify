from django.shortcuts import get_object_or_404

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status

from .models import User, Notification
from albums.models import Album
from songs.models import Song


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