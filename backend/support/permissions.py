from rest_framework import permissions

from accounts.models import User


class IsSupportOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role in {User.Roles.SUPPORT, User.Roles.ADMIN}
        )


class IsAdminRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == User.Roles.ADMIN
        )
