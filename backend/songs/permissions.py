from rest_framework.permissions import BasePermission


class IsSongOwner(BasePermission):
    message = "You do not own this song."

    def has_object_permission(self, request, view, obj):
        return obj.artist.owner == request.user

class CanDownloadSong(BasePermission):
    message = "You do not have the required subscription to download songs."

    def has_permission(self, request, view):
        return request.user.subscription_plan.song_download