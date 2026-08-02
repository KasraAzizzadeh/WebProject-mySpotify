import random

from rest_framework import serializers

from .models import User, ArtistProfile


def generate_display_name(username):
    while True:
        display_name = f"{username}_{random.randint(1000, 9999)}"
        if not User.objects.filter(display_name=display_name).exists():
            return display_name


class ArtistUserPrimaryKeyField(serializers.PrimaryKeyRelatedField):

    def to_internal_value(self, data):
        user = User.objects.get(id=data)
        try:
            return user.artist_profile
        except ArtistProfile.DoesNotExist:
            raise serializers.ValidationError(
                "User is not an artist."
            )