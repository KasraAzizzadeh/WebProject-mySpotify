from django.db import models
from accounts.models import User, ArtistProfile

# Create your models here.
class Genre(models.Model):
    name = models.CharField(max_length=50, unique=True)
    color = models.CharField(max_length=20, unique=True)

    def __str__(self):
        return self.name

class Album(models.Model):
    title = models.CharField(max_length=50, db_index=True)
    description = models.TextField(null=True, blank=True)
    genre = models.ManyToManyField(Genre, related_name="albums", blank=True)
    is_single = models.BooleanField(default=False)
    release_date = models.DateTimeField(db_index=True)
    cover_image = models.ImageField(upload_to='album_covers/', null=True, blank=True)
    artist = models.ForeignKey(ArtistProfile, on_delete=models.CASCADE, related_name="albums")
    # TODO collaborators
    collaborators = models.ManyToManyField(ArtistProfile, related_name="collaborated_albums", blank=True)

    class Meta:
        indexes = [
            models.Index(fields=["artist", "-release_date"]),
        ]

    def __str__(self):
        return f"{self.title} | {self.artist.owner.username}"