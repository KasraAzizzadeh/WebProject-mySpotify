import { PlaylistItem, SongItem } from "@/types";
import { getUsers } from "@/store/mockDb";
import { getMediaUrl } from "@/services/api";

export const formatDuration = (ms?: number) => {
  if (!ms) return "--:--";

  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

export const canPlaySong = (
  userId: string
): boolean => {

  const users = getUsers();

  const user = users.find(
    u => u.id === userId
  );

  if (!user) {
    return false;
  }

  const limit = 60;

  if (user.subscriptionType !== "basic")
    return true;

  const dailyStreams =
    user.listenerProfile?.dailyStreams ?? 0;

  console.log("current streams:", dailyStreams);

  return dailyStreams < limit;
};


// mappers //
export function mapPlaylist(data: any): PlaylistItem {
    return {
        id: String(data.id),
        name: data.name,
        ownerId: String(data.owner_id ?? data.owner),
        createdAt: data.created_at ?? undefined,
        imageUrl: getMediaUrl(data.image_url ?? data.cover_image) ?? undefined,
        description: data.description ?? undefined,
        isPrivate: data.is_private,
        songList: (data.song_list ?? data.songs ?? []).map(String),
    };
}

export function mapSong(data: any): SongItem {
    return {
        id: String(data.id),
        title: data.title,
        artistId: String(data.artist_id),
        artistName: data.artist_name,
        albumId: data.album_id !== undefined && data.album_id !== null ? String(data.album_id) : String(data.albumId ?? ''),
        albumName: data.album_name ?? data.albumName,
        releaseDate: data.release_date ?? data.created_at ?? undefined,
        streams: Number(data.streams ?? 0),
        imageUrl: getMediaUrl(data.cover_image ?? data.image_url) ?? undefined,
        trackNumber: data.track_number ?? data.trackNumber,
        songDurationMs: data.duration_ms ?? data.song_duration_ms,
        audioUrl: getMediaUrl(data.audio_file ?? data.audio_url) ?? undefined,
        lyrics: data.lyrics ?? undefined,
        collaborators: (data.collaborators ?? []).map(String),
        genre: (data.genre ?? []).map(String),
    };
}

export function mapAlbum(data: any): AlbumItem {
    return {
        id: String(data.id),
        name: data.name ?? data.title,
        artistName: data.artistName ?? data.artist_name,
        artistId: data.artistId !== undefined && data.artistId !== null ? String(data.artistId) : String(data.artist_id ?? ''),
        listeners: Number(data.listeners ?? 0),
        releaseDate: data.releaseDate ?? data.release_date,
        imageUrl: getMediaUrl(data.imageUrl ?? data.cover_image) ?? undefined,
        description: data.description ?? undefined,
        songList: (data.songList ?? data.song_list ?? []).map(String),
    };
}