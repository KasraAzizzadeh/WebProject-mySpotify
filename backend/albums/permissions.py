from rest_framework.permissions import BasePermission


class IsAlbumOwner(BasePermission):
    message = "You do not own this album."

    def has_object_permission(self, request, view, obj):
        # obj is an Album instance
        try:
            return obj.artist.owner == request.user
        except Exception:
            return False