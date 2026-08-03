import os
import uuid

from django.db import models
from accounts.models import User, ArtistProfile
from albums.models import Genre, Album

def song_audio_upload_path(instance, filename):
    ext = os.path.splitext(filename)[1]
    return f"songs/{instance.artist.owner.id}/{instance.album.id}/{uuid.uuid4()}{ext}"


def song_cover_upload_path(instance, filename):
    ext = os.path.splitext(filename)[1]
    return f"album_covers/{instance.artist.owner.id}/{uuid.uuid4()}{ext}"

# Create your models here.
class Song(models.Model):
    title = models.CharField(max_length=200, db_index=True)
    genre = models.ManyToManyField(Genre, related_name="songs", blank=True)
    lyrics = models.TextField(null=True, blank=True)
    artist = models.ForeignKey(ArtistProfile, on_delete=models.CASCADE, related_name="songs")
    album = models.ForeignKey(Album, on_delete=models.CASCADE, related_name="songs")
    duration_ms = models.PositiveIntegerField()
    track_number = models.PositiveIntegerField(default=1)
    streams = models.PositiveIntegerField(default=0, db_index=True)
    audio_file = models.FileField(upload_to=song_audio_upload_path)
    cover_image = models.ImageField(upload_to='album_covers/', null=True, blank=True)
    release_date = models.DateTimeField(db_index=True)
    # TODO collaborators
    collaborators = models.ManyToManyField(ArtistProfile, related_name="collaborated_songs", blank=True)

    class Meta:
        indexes = [
            models.Index(
                fields=["artist", "-release_date"]
            ),
            models.Index(
                fields=["album", "track_number"]
            ),
            models.Index(
                fields=["-streams"]
            ),
        ]
        ordering = ["track_number"]

    def __str__(self):
        return f"{self.title} | {self.album.title}"

class PlayHistory(models.Model):
    song = models.ForeignKey(Song, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="play_history")
    played_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(
                fields=["user", "-played_at"]
            ),
            models.Index(
                fields=["song", "-played_at"]
            ),

        ]