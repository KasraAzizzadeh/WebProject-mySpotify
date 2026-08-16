from datetime import timedelta

from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from django.utils import timezone

from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User, ArtistProfile
from albums.models import Album
from playlists.models import Playlist, PlaylistItem
from songs.models import Song


class PlaylistAPITestCase(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="user1",
            email="user1@test.com",
            password="password123",
        )

        self.other_user = User.objects.create_user(
            username="user2",
            email="user2@test.com",
            password="password123",
        )

        self.artist = ArtistProfile.objects.create(
            owner=self.user,
            artistic_name="Test Artist",
        )

        self.other_artist = ArtistProfile.objects.create(
            owner=self.other_user,
            artistic_name="Other Artist",
        )

        self.album = Album.objects.create(
            title="Test Album",
            artist=self.artist,
        )

        self.other_album = Album.objects.create(
            title="Other Album",
            artist=self.other_artist,
        )

        self.client.force_authenticate(user=self.user)

    # ---------------------------------------------------------
    # Helpers
    # ---------------------------------------------------------

    def create_playlist(
        self,
        owner=None,
        name="Test Playlist",
        is_private=True,
    ):
        return Playlist.objects.create(
            owner=owner or self.user,
            name=name,
            is_private=is_private,
        )

    def create_song(
        self,
        artist=None,
        album=None,
        title="Test Song",
        track_number=1,
    ):
        audio = SimpleUploadedFile(
            "test.mp3",
            b"fake audio content",
            content_type="audio/mpeg",
        )

        return Song.objects.create(
            title=title,
            artist=artist or self.artist,
            album=album or self.album,
            duration_ms=180000,
            track_number=track_number,
            audio_file=audio,
            release_date=timezone.now(),
        )

    # =========================================================
    # LIST
    # =========================================================

    def test_list_returns_own_private_and_public_playlists(self):
        own_private = self.create_playlist(
            name="My Private",
            is_private=True,
        )

        own_public = self.create_playlist(
            name="My Public",
            is_private=False,
        )

        other_private = self.create_playlist(
            owner=self.other_user,
            name="Other Private",
            is_private=True,
        )

        other_public = self.create_playlist(
            owner=self.other_user,
            name="Other Public",
            is_private=False,
        )

        response = self.client.get(
            reverse("playlist-list-create")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        returned_ids = {
            item["id"]
            for item in response.data
        }

        self.assertIn(own_private.id, returned_ids)
        self.assertIn(own_public.id, returned_ids)
        self.assertIn(other_public.id, returned_ids)

        self.assertNotIn(
            other_private.id,
            returned_ids,
        )

    def test_list_requires_authentication(self):
        self.client.force_authenticate(user=None)

        response = self.client.get(
            reverse("playlist-list-create")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    # =========================================================
    # CREATE
    # =========================================================

    def test_create_playlist(self):
        response = self.client.post(
            reverse("playlist-list-create"),
            {
                "name": "New Playlist",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        playlist = Playlist.objects.get(
            name="New Playlist"
        )

        self.assertEqual(
            playlist.owner,
            self.user,
        )

    def test_create_playlist_requires_name(self):
        response = self.client.post(
            reverse("playlist-list-create"),
            {},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    # =========================================================
    # RETRIEVE
    # =========================================================

    def test_owner_can_retrieve_private_playlist(self):
        playlist = self.create_playlist(
            is_private=True,
        )

        response = self.client.get(
            reverse(
                "playlist-details",
                kwargs={"pk": playlist.id},
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["id"],
            playlist.id,
        )

    def test_non_owner_can_retrieve_public_playlist(self):
        playlist = self.create_playlist(
            owner=self.other_user,
            is_private=False,
        )

        response = self.client.get(
            reverse(
                "playlist-details",
                kwargs={"pk": playlist.id},
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

    # =========================================================
    # UPDATE
    # =========================================================

    def test_owner_can_update_playlist(self):
        playlist = self.create_playlist(
            name="Old Name",
            is_private=True,
        )

        response = self.client.patch(
            reverse(
                "playlist-details",
                kwargs={"pk": playlist.id},
            ),
            {
                "name": "New Name",
                "description": "New description",
                "is_private": False,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        playlist.refresh_from_db()

        self.assertEqual(
            playlist.name,
            "New Name",
        )

        self.assertEqual(
            playlist.description,
            "New description",
        )

        self.assertFalse(
            playlist.is_private
        )

    def test_non_owner_cannot_update_playlist(self):
        playlist = self.create_playlist(
            owner=self.other_user,
            name="Original",
        )

        response = self.client.patch(
            reverse(
                "playlist-details",
                kwargs={"pk": playlist.id},
            ),
            {
                "name": "Hacked",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

        playlist.refresh_from_db()

        self.assertEqual(
            playlist.name,
            "Original",
        )

    # =========================================================
    # DELETE
    # =========================================================

    def test_owner_can_delete_playlist(self):
        playlist = self.create_playlist()

        response = self.client.delete(
            reverse(
                "playlist-details",
                kwargs={"pk": playlist.id},
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_204_NO_CONTENT,
        )

        self.assertFalse(
            Playlist.objects.filter(
                id=playlist.id
            ).exists()
        )

    def test_non_owner_cannot_delete_playlist(self):
        playlist = self.create_playlist(
            owner=self.other_user,
        )

        response = self.client.delete(
            reverse(
                "playlist-details",
                kwargs={"pk": playlist.id},
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

        self.assertTrue(
            Playlist.objects.filter(
                id=playlist.id
            ).exists()
        )

    # =========================================================
    # SEARCH
    # =========================================================

    def test_search_by_playlist_name(self):
        matching = self.create_playlist(
            name="Workout Music",
        )

        self.create_playlist(
            name="Chill Songs",
        )

        response = self.client.get(
            reverse("playlist-list-create"),
            {"query": "workout"},
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        returned_ids = {
            item["id"]
            for item in response.data
        }

        self.assertIn(
            matching.id,
            returned_ids,
        )

    def test_search_is_case_insensitive(self):
        playlist = self.create_playlist(
            name="Morning Music",
        )

        response = self.client.get(
            reverse("playlist-list-create"),
            {"query": "MORNING"},
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        returned_ids = {
            item["id"]
            for item in response.data
        }

        self.assertIn(
            playlist.id,
            returned_ids,
        )

    # =========================================================
    # PLAYLIST SONGS
    # =========================================================

    def test_owner_can_list_playlist_songs(self):
        playlist = self.create_playlist()

        song = self.create_song()

        PlaylistItem.objects.create(
            playlist=playlist,
            song=song,
            position=1,
        )

        response = self.client.get(
            reverse(
                "playlist-songs",
                kwargs={
                    "playlist_id": playlist.id,
                },
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

    def test_public_playlist_songs_can_be_listed(self):
        playlist = self.create_playlist(
            owner=self.other_user,
            is_private=False,
        )

        song = self.create_song(
            artist=self.other_artist,
            album=self.other_album,
        )

        PlaylistItem.objects.create(
            playlist=playlist,
            song=song,
            position=1,
        )

        response = self.client.get(
            reverse(
                "playlist-songs",
                kwargs={
                    "playlist_id": playlist.id,
                },
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

    # =========================================================
    # ADD SONG
    # =========================================================

    def test_owner_can_add_song(self):
        playlist = self.create_playlist()

        song = self.create_song()

        response = self.client.post(
            reverse(
                "playlist-song-manage",
                kwargs={
                    "playlist_id": playlist.id,
                    "song_id": song.id,
                },
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        item = PlaylistItem.objects.get(
            playlist=playlist,
            song=song,
        )

        self.assertEqual(
            item.position,
            1,
        )

    def test_add_song_appends_to_end(self):
        playlist = self.create_playlist()

        song1 = self.create_song(
            title="Song 1",
            track_number=1,
        )

        song2 = self.create_song(
            title="Song 2",
            track_number=2,
        )

        PlaylistItem.objects.create(
            playlist=playlist,
            song=song1,
            position=1,
        )

        response = self.client.post(
            reverse(
                "playlist-song-manage",
                kwargs={
                    "playlist_id": playlist.id,
                    "song_id": song2.id,
                },
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        item = PlaylistItem.objects.get(
            playlist=playlist,
            song=song2,
        )

        self.assertEqual(
            item.position,
            2,
        )

    def test_cannot_add_duplicate_song(self):
        playlist = self.create_playlist()

        song = self.create_song()

        PlaylistItem.objects.create(
            playlist=playlist,
            song=song,
            position=1,
        )

        response = self.client.post(
            reverse(
                "playlist-song-manage",
                kwargs={
                    "playlist_id": playlist.id,
                    "song_id": song.id,
                },
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertEqual(
            PlaylistItem.objects.filter(
                playlist=playlist,
                song=song,
            ).count(),
            1,
        )

    def test_non_owner_cannot_add_song(self):
        playlist = self.create_playlist(
            owner=self.other_user,
        )

        song = self.create_song()

        response = self.client.post(
            reverse(
                "playlist-song-manage",
                kwargs={
                    "playlist_id": playlist.id,
                    "song_id": song.id,
                },
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    # =========================================================
    # REMOVE SONG
    # =========================================================

    def test_owner_can_remove_song(self):
        playlist = self.create_playlist()

        song = self.create_song()

        PlaylistItem.objects.create(
            playlist=playlist,
            song=song,
            position=1,
        )

        response = self.client.delete(
            reverse(
                "playlist-song-manage",
                kwargs={
                    "playlist_id": playlist.id,
                    "song_id": song.id,
                },
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_204_NO_CONTENT,
        )

        self.assertFalse(
            PlaylistItem.objects.filter(
                playlist=playlist,
                song=song,
            ).exists()
        )

    def test_non_owner_cannot_remove_song(self):
        playlist = self.create_playlist(
            owner=self.other_user,
        )

        song = self.create_song()

        PlaylistItem.objects.create(
            playlist=playlist,
            song=song,
            position=1,
        )

        response = self.client.delete(
            reverse(
                "playlist-song-manage",
                kwargs={
                    "playlist_id": playlist.id,
                    "song_id": song.id,
                },
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_remove_song_shifts_positions(self):
        playlist = self.create_playlist()

        song1 = self.create_song(
            title="Song 1",
            track_number=1,
        )

        song2 = self.create_song(
            title="Song 2",
            track_number=2,
        )

        song3 = self.create_song(
            title="Song 3",
            track_number=3,
        )

        PlaylistItem.objects.create(
            playlist=playlist,
            song=song1,
            position=1,
        )

        PlaylistItem.objects.create(
            playlist=playlist,
            song=song2,
            position=2,
        )

        PlaylistItem.objects.create(
            playlist=playlist,
            song=song3,
            position=3,
        )

        response = self.client.delete(
            reverse(
                "playlist-song-manage",
                kwargs={
                    "playlist_id": playlist.id,
                    "song_id": song2.id,
                },
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_204_NO_CONTENT,
        )

        item1 = PlaylistItem.objects.get(
            playlist=playlist,
            song=song1,
        )

        item3 = PlaylistItem.objects.get(
            playlist=playlist,
            song=song3,
        )

        self.assertEqual(item1.position, 1)
        self.assertEqual(item3.position, 2)