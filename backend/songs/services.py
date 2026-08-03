from datetime import datetime, time, timedelta
from django.utils import timezone

from django.db import transaction
from django.db.models import F
from mutagen import File

from .models import Song, PlayHistory
from albums.models import Album


class SongService:

    @staticmethod
    def extract_duration(audio_file):
        audio = File(audio_file)
        if audio and audio.info:
            return int(audio.info.length * 1000)
        return 0

    @staticmethod
    def check_stream_allowed(user):
        plan = user.subscription_plan
        if plan.daily_stream_limit is None:
            return

        start = timezone.make_aware(
            datetime.combine(timezone.localdate(), time.min)
        )
        streams_today = PlayHistory.objects.filter(user=user, played_at__gte=start).count()

        if streams_today >= plan.daily_stream_limit:
            raise ValueError(
                "You have reached your daily stream limit."
            )

    @classmethod
    def create_song(cls, *, validated_data, artist):

        audio_file = validated_data['audio_file']
        validated_data["duration_ms"] = cls.extract_duration(audio_file)
        validated_data['artist'] = artist

        album = validated_data['album']
        validated_data['release_date'] = album.release_date
        if album.cover_image:
            validated_data['cover_image'] = album.cover_image

        genres = validated_data.pop("genre", [])
        collaborators = validated_data.pop("collaborators", [])

        song = Song.objects.create(**validated_data)
        song.genre.set(genres)
        song.collaborators.set(collaborators)
        return song

    @classmethod
    @transaction.atomic
    def update_song(cls, song, validated_data):
        if "audio_file" in validated_data:
            song.audio_file = validated_data["audio_file"]
            song.duration_ms = cls.extract_duration(validated_data["audio_file"])

        if "title" in validated_data:
            song.title = validated_data["title"]

        if "lyrics" in validated_data:
            song.lyrics = validated_data["lyrics"]

        if "genre" in validated_data:
            genres = validated_data.pop("genre")
            song.genre.set(genres)

        song.save()
        return song

    @classmethod
    @transaction.atomic
    def stream_song(cls, song, user):
        cls.check_stream_allowed(user)
        last_played = PlayHistory.objects.filter(user=user).order_by("-played_at").first()
        if last_played:
            if timezone.now() - last_played.played_at < timedelta(minutes=1):
                raise ValueError(
                    "A Song was already streamed by you recently."
                )

        PlayHistory.objects.create(song=song, user=user)
        Song.objects.filter(id=song.id).update(streams=(F("streams")+1))