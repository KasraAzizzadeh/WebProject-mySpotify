from mutagen import File

from .models import Song
from albums.models import Album


class SongService:

    @staticmethod
    def extract_duration(audio_file):
        audio = File(audio_file)
        if audio and audio.info:
            return int(audio.info.length * 1000)
        return 0

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