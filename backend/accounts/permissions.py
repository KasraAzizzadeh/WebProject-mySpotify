from rest_framework.permissions import BasePermission


class IsOwnerOrReadOnly(BasePermission):
    """
    Anyone authenticated can view profiles.
    Only the owner can modify/delete their profile.
    """

    def has_object_permission(
        self,
        request,
        view,
        obj
    ):
        if request.method in ["GET", "HEAD", "OPTIONS"]:
            return True

        return obj == request.user


class IsArtist(BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.role == "artist"