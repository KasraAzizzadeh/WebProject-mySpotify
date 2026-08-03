from rest_framework.permissions import BasePermission


class IsSongOwner(BasePermission):
    message = "You do not own this song."

    def has_object_permission(self, request, view, obj):
        return obj.artist.owner == request.user