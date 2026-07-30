from django.shortcuts import get_object_or_404
from django.db.models import Sum
from django.db import transaction

from .models import Album, Genre
from songs.models import Song
from accounts.models import ArtistProfile


def _album_base_qs():
    return Album.objects.select_related("artist__owner").prefetch_related("songs", "genre", "collaborators")


def list_albums():
    qs = _album_base_qs().all().order_by("-release_date")
    return qs


def get_album(pk):
    return get_object_or_404(_album_base_qs(), pk=pk)


def create_album(data):
    """
    Create album metadata only. Tracks are managed via songs endpoints.
    Expected data keys: title, description, is_single, release_date, artist_id, genre_ids, collaborator_ids
    """
    artist_id = data.get("artist_id")
    artist = None
    if artist_id:
        artist = get_object_or_404(ArtistProfile, pk=artist_id)

    album = Album.objects.create(
        title=data.get("title"),
        description=data.get("description", ""),
        is_single=data.get("is_single", False),
        release_date=data.get("release_date"),
        artist=artist,
    )

    # genres (list of ids)
    genre_ids = data.get("genre_ids") or []
    if genre_ids:
        genres = Genre.objects.filter(id__in=genre_ids)
        album.genre.set(genres)

    # collaborators (list of artist profile ids)
    collaborator_ids = data.get("collaborator_ids") or []
    if collaborator_ids:
        collaborators = ArtistProfile.objects.filter(id__in=collaborator_ids)
        album.collaborators.set(collaborators)

    album.save()
    return album


def update_album(pk, data):
    album = get_object_or_404(Album, pk=pk)

    if "title" in data:
        album.title = data.get("title")
    if "description" in data:
        album.description = data.get("description")
    if "is_single" in data:
        album.is_single = data.get("is_single")
    if "release_date" in data:
        album.release_date = data.get("release_date")

    if "genre_ids" in data:
        genre_ids = data.get("genre_ids") or []
        album.genre.set(Genre.objects.filter(id__in=genre_ids))

    if "collaborator_ids" in data:
        collaborator_ids = data.get("collaborator_ids") or []
        album.collaborators.set(ArtistProfile.objects.filter(id__in=collaborator_ids))

    # Cover image handling: allow updating via detail PATCH (file upload)
    if "cover_image" in data:
        cover = data.get("cover_image")
        # cover may be an InMemoryUploadedFile or a URL/string; assign directly
        album.cover_image = cover

    album.save()
    return album


def delete_album(pk):
    album = get_object_or_404(Album, pk=pk)
    album.delete()


def get_songs_for_album(pk):
    album = get_album(pk)
    return Song.objects.filter(album=album).select_related("artist__owner", "album").order_by("track_number")


def compute_listeners_count(album):
    # sum streams of songs belonging to album
    agg = Song.objects.filter(album=album).aggregate(total=Sum("streams"))
    return agg.get("total") or 0