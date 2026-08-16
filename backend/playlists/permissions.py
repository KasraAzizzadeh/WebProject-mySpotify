from rest_framework.permissions import BasePermission


class IsPlaylistOwner(BasePermission):
    message = "You do not own this playlist."

    def has_object_permission(self, request, view, obj):
        return obj.owner == request.user

class CanViewPlaylist(BasePermission):
    message = "You do not have permission to view this playlist."

    def has_object_permission(self, request, view, obj):
        if not obj.is_private:
            return True

        return obj.owner == request.user