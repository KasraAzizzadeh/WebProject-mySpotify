import os
import uuid

from django.db import models
from accounts.models import User
from songs.models import Song


def playlist_cover_upload_path(instance, filename):
    ext = os.path.splitext(filename)[1]
    return f"playlist_covers/{instance.owner.id}/{uuid.uuid4()}{ext}"

# Create your models here.
class Playlist(models.Model):
    name = models.CharField(max_length=100, db_index=True)
    description = models.TextField(null=True, blank=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="playlists")
    is_private = models.BooleanField(default=True)
    cover_image = models.ImageField(upload_to=playlist_cover_upload_path, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    def __str__(self):
        return f"{self.name} | {self.owner.username}"

class PlaylistItem(models.Model):
    position = models.PositiveIntegerField()
    playlist = models.ForeignKey(Playlist, on_delete=models.CASCADE, related_name="items")
    song = models.ForeignKey(Song, on_delete=models.CASCADE, related_name="playlist_items")
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["playlist", "position"],
                name="unique_playlist_position",
            )
        ]
        ordering = ["position"]