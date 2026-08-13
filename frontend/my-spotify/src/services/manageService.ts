import { AlbumItem, SongItem, UserProfile, ArtistDashboard } from "@/types";
import { userService } from "./userService";
import { getAlbums, getSongs, getUsers, saveAlbums, saveSongs, saveUsers, deleteReleaseAndSongs } from "@/store/mockDb";

import { ReleaseFormState } from "@/components/manage/ReleaseForm";
import api, { handleApiError } from "@/services/api";
import { mapSong, mapAlbum } from "@/utils/mediaUtils";
import { TrackEditData } from "@/components/music/EditAlbumModal";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getArtistDashboard(
  userId: string
): Promise<ArtistDashboard> {
  try {
    // Fetch user profile (includes artistProfile totals)
    const user = await userService.getUserProfile(userId);

    if (!user) {
      throw new Error("User not found");
    }

    // Fetch artist albums and songs from backend
    const [albumsResp, songsResp] = await Promise.all([
      api.get(`/accounts/${userId}/albums/`),
      api.get(`/accounts/${userId}/songs/`),
    ]);

    const releases: AlbumItem[] = Array.isArray(albumsResp.data)
      ? albumsResp.data.map(mapAlbum)
      : [];

    const userSongs: SongItem[] = Array.isArray(songsResp.data)
      ? songsResp.data.map(mapSong)
      : [];

    return {
      user,
      releases,
      songs: userSongs,
    };
  } catch (error) {
    handleApiError(error);
  }
}

export async function createRelease(
  dbUser: UserProfile,
  formData: ReleaseFormState
): Promise<void> {
  try {
    // Create album via backend
    const albumForm = new FormData();
    albumForm.append("title", formData.title);
    // backend expects ISO datetime for release_date
    albumForm.append("release_date", new Date(formData.releaseDate).toISOString());
    albumForm.append("is_single", String(formData.releaseType === "single"));
    if (formData.coverImage.length > 0) {
      albumForm.append("cover_image", formData.coverImage[0]);
    }

    const albumResp = await api.post("/albums/", albumForm, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const createdAlbum = mapAlbum(albumResp.data);

    const createdSongs: SongItem[] = [];

    if (formData.releaseType === "single") {
      if (formData.singleAudio.length === 0) throw new Error("No audio file provided for single.");
      const songForm = new FormData();
      songForm.append("title", formData.title);
      songForm.append("album_id", String(createdAlbum.id));
      songForm.append("track_number", "1");
      songForm.append("audio_file", formData.singleAudio[0]);
      if (formData.singleLyrics) songForm.append("lyrics", formData.singleLyrics);
      if (formData.genre) songForm.append("genre", String(formData.genre));

      const songResp = await api.post(`/songs/`, songForm, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      createdSongs.push(mapSong(songResp.data));
    } else {
      for (const [index, track] of formData.tracks.entries()) {
        if (track.audio.length === 0) throw new Error(`Track ${index + 1} has no audio file.`);
        const songForm = new FormData();
        songForm.append("title", track.title || `Track ${index + 1}`);
        songForm.append("album_id", String(createdAlbum.id));
        songForm.append("track_number", String(index + 1));
        songForm.append("audio_file", track.audio[0]);
        if (track.lyrics) songForm.append("lyrics", track.lyrics);
        if (formData.genre) songForm.append("genre", String(formData.genre));

        const songResp = await api.post(`/songs/`, songForm, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        createdSongs.push(mapSong(songResp.data));
      }
    }

    // Success: return (caller mutation invalidates queries)
    return;
  } catch (error) {
    handleApiError(error);
  }
}

export async function getGenres(): Promise<{ id: number; name: string }[]> {
  try {
    const resp = await api.get(`/albums/genres/`);
    return resp.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function updateRelease(
  updatedRelease: AlbumItem,
  newImageFile?: File,
  updatedTracks?: TrackEditData[]
): Promise<void> {
  try {
    // Update album attributes first
    const albumId = updatedRelease.id;

    if (newImageFile) {
      const form = new FormData();
      if (updatedRelease.name) form.append('title', updatedRelease.name);
      if (updatedRelease.genre !== undefined && updatedRelease.genre !== null) form.append('genre', String(updatedRelease.genre));
      form.append('cover_image', newImageFile);

      await api.patch(`/albums/${albumId}/`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } else {
      const body: any = {};
      if (updatedRelease.name) body.title = updatedRelease.name;
      if (updatedRelease.genre !== undefined && updatedRelease.genre !== null) body.genre = updatedRelease.genre;

      // Only send body if there's something to update
      if (Object.keys(body).length > 0) {
        await api.patch(`/albums/${albumId}/`, body);
      }
    }

    // Update songs (if any updates provided)
    if (Array.isArray(updatedTracks) && updatedTracks.length > 0) {
      for (const t of updatedTracks) {
        const songId = t.id;
        try {
          if (t.audioFile) {
            const sf = new FormData();
            if (t.title) sf.append('title', t.title);
            if (t.lyrics) sf.append('lyrics', t.lyrics);
            sf.append('audio_file', t.audioFile);
            await api.patch(`/songs/${songId}/`, sf, {
              headers: { 'Content-Type': 'multipart/form-data' },
            });
          } else {
            const body: any = {};
            if (t.title) body.title = t.title;
            if (t.lyrics !== undefined) body.lyrics = t.lyrics;
            if (Object.keys(body).length > 0) {
              await api.patch(`/songs/${songId}/`, body);
            }
          }
        } catch (err) {
          // surface error with consistent handler
          handleApiError(err);
          throw err;
        }
      }
    }

    // Optionally the caller can invalidate queries (handled by callers/hooks)
    return;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

export const deleteRelease = async (
  userId: string,
  releaseId: string
): Promise<void> => {
  try {
    // Fetch album details to obtain song list (backend shape may vary)
    const albumResp = await api.get(`/albums/${releaseId}/`);
    const albumData = albumResp.data;
    const songIds: string[] = Array.isArray(albumData.song_list)
      ? albumData.song_list.map(String)
      : Array.isArray(albumData.songList)
        ? albumData.songList.map(String)
        : Array.isArray(albumData.songs)
          ? albumData.songs.map((s: any) => String(s.id ?? s))
          : [];

    // Delete songs first
    for (const sid of songIds) {
      try {
        await api.delete(`/songs/${sid}/`);
      } catch (err) {
        // if a song delete fails, surface error
        handleApiError(err);
        throw err;
      }
    }

    // Delete album
    await api.delete(`/albums/${releaseId}/`);

    // Note: callers should invalidate queries / refresh state
    return;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};