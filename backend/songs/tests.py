from django.urls import reverse
from django.utils import timezone

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
            email="artist1@test.com",
            password="password",
        )

        self.other_user = User.objects.create_user(
            username="artist2",
            email="artist2@test.com",
            password="password",
        )

        self.artist = ArtistProfile.objects.create(
            owner=self.user,
            verification_status=ArtistProfile.VerificationStatus.ACCEPTED,
        )

        self.other_artist = ArtistProfile.objects.create(
            owner=self.other_user,
            verification_status=ArtistProfile.VerificationStatus.ACCEPTED,
        )

        self.gold_plan = SubscriptionPlan.objects.create(
            name=SubscriptionPlan.PlanType.GOLD,
            daily_stream_limit=None,
            song_download=True,
        )

        self.basic_plan = SubscriptionPlan.objects.create(
            name=SubscriptionPlan.PlanType.BASIC,
            daily_stream_limit=2,
            song_download=False,
        )

        self.user.subscription_plan = self.gold_plan
        self.user.save()

        self.other_user.subscription_plan = self.basic_plan
        self.other_user.save()

        self.genre, _ = Genre.objects.get_or_create(
            name="Pop",
            defaults={
                "color": "red",
            }
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
            release_date=self.album.release_date,
        )

        self.song.genre.add(self.genre)

    # =========================================================
    # RETRIEVE
    # =========================================================

    def test_authenticated_user_can_retrieve_song(self):
        self.client.force_authenticate(self.user)

        response = self.client.get(
            reverse(
                "song-details",
                kwargs={"pk": self.song.id},
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["title"],
            "Test Song",
        )

    # =========================================================
    # UPDATE
    # =========================================================

    def test_owner_can_update_song(self):
        self.client.force_authenticate(self.user)

        response = self.client.patch(
            reverse(
                "song-details",
                kwargs={"pk": self.song.id},
            ),
            {
                "title": "Updated Title",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.song.refresh_from_db()

        self.assertEqual(
            self.song.title,
            "Updated Title",
        )

    def test_other_artist_cannot_update_song(self):
        self.client.force_authenticate(self.other_user)

        response = self.client.patch(
            reverse(
                "song-details",
                kwargs={"pk": self.song.id},
            ),
            {
                "title": "Hack",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    # =========================================================
    # DELETE
    # =========================================================

    def test_owner_can_delete_song(self):
        self.client.force_authenticate(self.user)

        response = self.client.delete(
            reverse(
                "song-details",
                kwargs={"pk": self.song.id},
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_204_NO_CONTENT,
        )

        self.assertFalse(
            Song.objects.filter(id=self.song.id).exists()
        )

    # =========================================================
    # STREAMING
    # =========================================================

    def test_user_can_stream_song(self):
        self.client.force_authenticate(self.user)

        response = self.client.post(
            reverse(
                "song-stream",
                kwargs={"pk": self.song.id},
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertEqual(
            PlayHistory.objects.filter(
                user=self.user,
                song=self.song,
            ).count(),
            1,
        )

        self.song.refresh_from_db()

        self.assertEqual(
            self.song.streams,
            1,
        )

    def test_user_cannot_spam_streams(self):
        PlayHistory.objects.create(
            user=self.user,
            song=self.song,
        )

        self.client.force_authenticate(self.user)

        response = self.client.post(
            reverse(
                "song-stream",
                kwargs={"pk": self.song.id},
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_daily_stream_limit_blocks_user(self):
        self.user.subscription_plan = self.basic_plan
        self.user.save()

        # Two streams already used today.
        PlayHistory.objects.create(
            user=self.user,
            song=self.song,
        )

        # Use a different song so the "already streamed recently"
        # protection does not interfere with the daily-limit test.
        song2 = Song.objects.create(
            title="Second Song",
            artist=self.artist,
            album=self.album,
            duration_ms=200000,
            track_number=2,
            audio_file="songs/test2.mp3",
            release_date=self.album.release_date,
        )

        PlayHistory.objects.create(
            user=self.user,
            song=song2,
        )

        self.client.force_authenticate(self.user)

        # Third stream should exceed the basic plan limit of 2.
        song3 = Song.objects.create(
            title="Third Song",
            artist=self.artist,
            album=self.album,
            duration_ms=200000,
            track_number=3,
            audio_file="songs/test3.mp3",
            release_date=self.album.release_date,
        )

        response = self.client.post(
            reverse(
                "song-stream",
                kwargs={"pk": song3.id},
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )