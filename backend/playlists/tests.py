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
            verification_status=ArtistProfile.VerificationStatus.ACCEPTED,
        )

        self.other_artist = ArtistProfile.objects.create(
            owner=self.other_user,
            verification_status=ArtistProfile.VerificationStatus.ACCEPTED,
        )

        self.album = Album.objects.create(
            title="Test Album",
            artist=self.artist,
            release_date=timezone.now(),
        )

        self.other_album = Album.objects.create(
            title="Other Album",
            artist=self.other_artist,
            release_date=timezone.now(),
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
    # 1. LIST PLAYLISTS
    # =========================================================

    def test_list_shows_own_private_and_public_playlists(self):
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

        ids = {playlist["id"] for playlist in response.data}

        self.assertIn(own_private.id, ids)
        self.assertIn(own_public.id, ids)
        self.assertIn(other_public.id, ids)
        self.assertNotIn(other_private.id, ids)

    # =========================================================
    # 3. RETRIEVE
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

    def test_user_can_retrieve_public_playlist(self):
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

        self.assertEqual(
            response.data["id"],
            playlist.id,
        )

    # =========================================================
    # 4. UPDATE
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
                "description": "Updated description",
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
            "Updated description",
        )

        self.assertFalse(
            playlist.is_private,
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
    # 5. DELETE
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

    # =========================================================
    # 6. SEARCH
    # =========================================================

    def test_playlist_search_by_name(self):
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

        ids = {playlist["id"] for playlist in response.data}

        self.assertIn(
            matching.id,
            ids,
        )

    # =========================================================
    # 7. PLAYLIST SONGS
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

        self.assertEqual(
            len(response.data),
            1,
        )

    # =========================================================
    # 8. ADD SONG
    # =========================================================

    def test_owner_can_add_song_to_playlist(self):
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

    def test_adding_duplicate_song_fails(self):
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
    # 9. REMOVE SONG
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

        song = self.create_song(
            artist=self.other_artist,
            album=self.other_album,
        )

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

    def test_removing_song_shifts_following_positions(self):
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