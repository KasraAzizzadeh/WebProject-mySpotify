from datetime import timedelta

from django.utils import timezone
from django.urls import reverse

from rest_framework.test import APITestCase
from rest_framework import status

from accounts.models import User, ArtistProfile
from albums.models import Album, Genre
from songs.models import Song, PlayHistory
from subscriptions.models import SubscriptionPlan


class SongAPITestCase(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="artist1",
            password="password"
        )

        self.other_user = User.objects.create_user(
            username="artist2",
            password="password"
        )

        self.artist = ArtistProfile.objects.create(
            owner=self.user
        )

        self.other_artist = ArtistProfile.objects.create(
            owner=self.other_user
        )

        self.gold_plan = SubscriptionPlan.objects.create(
            name="gold",
            song_download=True,
            daily_stream_limit=None,
        )

        self.basic_plan = SubscriptionPlan.objects.create(
            name="basic",
            song_download=False,
            daily_stream_limit=2,
        )

        self.user.subscription_plan = self.gold_plan
        self.user.save()

        self.other_user.subscription_plan = self.basic_plan
        self.other_user.save()

        self.genre = Genre.objects.create(
            name="Pop",
            color="red"
        )

        self.album = Album.objects.create(
            title="Test Album",
            release_date=timezone.now(),
            artist=self.artist,
        )

        self.song = Song.objects.create(
            title="Test Song",
            artist=self.artist,
            album=self.album,
            duration_ms=200000,
            track_number=1,
            audio_file="songs/test.mp3",
            release_date=self.album.release_date
        )

        self.song.genre.add(self.genre)

    # ---------------------------
    # Retrieve
    # ---------------------------

    def test_authenticated_user_can_retrieve_song(self):

        self.client.force_authenticate(self.user)

        response = self.client.get(
            reverse(
                "song-details",
                kwargs={"pk": self.song.id}
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.assertEqual(
            response.data["title"],
            "Test Song"
        )


    # ---------------------------
    # Update permissions
    # ---------------------------

    def test_owner_can_update_song(self):

        self.client.force_authenticate(self.user)

        response = self.client.patch(
            reverse(
                "song-details",
                kwargs={"pk": self.song.id}
            ),
            {
                "title": "Updated Title"
            }
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.song.refresh_from_db()

        self.assertEqual(
            self.song.title,
            "Updated Title"
        )


    def test_other_artist_cannot_update_song(self):

        self.client.force_authenticate(self.other_user)

        response = self.client.patch(
            reverse(
                "song-details",
                kwargs={"pk": self.song.id}
            ),
            {
                "title": "Hack"
            }
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN
        )


    # ---------------------------
    # Delete
    # ---------------------------

    def test_owner_can_delete_song(self):

        self.client.force_authenticate(self.user)

        response = self.client.delete(
            reverse(
                "song-details",
                kwargs={"pk": self.song.id}
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_204_NO_CONTENT
        )

        self.assertFalse(
            Song.objects.filter(id=self.song.id).exists()
        )


    # ---------------------------
    # Streaming
    # ---------------------------

    def test_user_can_stream_song(self):

        self.client.force_authenticate(self.user)

        response = self.client.post(
            reverse(
                "song-streamed",
                kwargs={"pk": self.song.id}
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

        self.assertEqual(
            PlayHistory.objects.filter(
                user=self.user,
                song=self.song
            ).count(),
            1
        )

        self.song.refresh_from_db()

        self.assertEqual(
            self.song.streams,
            1
        )


    def test_user_cannot_spam_streams(self):

        PlayHistory.objects.create(
            user=self.user,
            song=self.song
        )

        self.client.force_authenticate(self.user)

        response = self.client.post(
            reverse(
                "song-streamed",
                kwargs={"pk": self.song.id}
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )


    def test_daily_stream_limit_blocks_user(self):

        self.user.subscription_plan = self.basic_plan
        self.user.save()

        for _ in range(2):
            PlayHistory.objects.create(
                user=self.user,
                song=self.song
            )


        self.client.force_authenticate(self.user)

        response = self.client.post(
            reverse(
                "song-streamed",
                kwargs={"pk": self.song.id}
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )


    # ---------------------------
    # Download
    # ---------------------------

    def test_gold_user_can_download(self):

        self.client.force_authenticate(self.user)

        response = self.client.get(
            reverse(
                "song-download",
                kwargs={"pk": self.song.id}
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )


    def test_basic_user_cannot_download(self):

        self.client.force_authenticate(self.other_user)

        response = self.client.get(
            reverse(
                "song-download",
                kwargs={"pk": self.song.id}
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN
        )