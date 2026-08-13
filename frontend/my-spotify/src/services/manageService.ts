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
  await delay(100);

  const user = await userService.getUserProfile(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const allAlbums = getAlbums();
  const allSongs = getSongs();

  const albumIds = user.artistProfile?.albums ?? [];
  const singleIds = user.artistProfile?.singles ?? [];

  // Albums owned by artist
  const userAlbums = allAlbums.filter(album =>
    albumIds.includes(album.id)
  );

  // Songs inside albums
  const albumSongIds = userAlbums.flatMap(album =>
    album.songList ?? []
  );

  const targetSongIds = [
    ...new Set([
      ...singleIds,
      ...albumSongIds,
    ]),
  ];

  const userSongs = allSongs.filter(song =>
    targetSongIds.includes(song.id)
  );

  // Build virtual albums for singles
  const virtualSingles: AlbumItem[] = allSongs
    .filter(song => singleIds.includes(song.id))
    .map(song => ({
      id: song.id,
      name: song.title,
      artistName: song.artistName,
      artistId: song.artistId,
      listeners: 0,
      releaseDate: song.releaseDate,
      releaseType: "single",
      genre: song.genre,
      collaborators: song.collaborators,
      imageUrl: song.imageUrl,
      songList: [song.id],
    }));

  const releases = [...userAlbums, ...virtualSingles].filter(
    (release, index, self) =>
      index === self.findIndex(r => r.id === release.id)
  );

  return {
    user,
    releases,
    songs: userSongs,
  };
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
  await delay(100);

  let updatedImageUrl = updatedRelease.imageUrl;

  if (newImageFile) {
    updatedImageUrl = `/covers/${newImageFile.name}`;
  }

  const finalRelease: AlbumItem = {
    ...updatedRelease,
    imageUrl: updatedImageUrl,
  };

  const albums = getAlbums().map(album =>
    album.id === finalRelease.id
      ? finalRelease
      : album
  );

  if (!albums.some(album => album.id === finalRelease.id)) {
    albums.push(finalRelease);
  }

  saveAlbums(albums);

  const songs = getSongs();
  const updatedSongs: SongItem[] = [];

  for (const song of songs) {
    const trackUpdate = updatedTracks?.find(
      t => t.id === song.id
    );

    if (trackUpdate) {
      let audioUrl = song.audioUrl;

      if (trackUpdate.audioFile) {
        audioUrl = `/songs/${trackUpdate.audioFile.name}`;
      }

      updatedSongs.push({
        ...song,
        title: trackUpdate.title,
        lyrics: trackUpdate.lyrics,
        audioUrl,
        albumName: finalRelease.name,
        genre: finalRelease.genre,
        imageUrl: updatedImageUrl ?? song.imageUrl,
      });
      continue;
    }

    if (
      finalRelease.releaseType === "single" &&
      song.id === finalRelease.id
    ) {
      updatedSongs.push({
        ...song,
        title: finalRelease.name,
        albumName: finalRelease.name,
        genre: finalRelease.genre,
        imageUrl: updatedImageUrl ?? song.imageUrl,
      });
      continue;
    }

    if (song.albumId === finalRelease.id) {
      updatedSongs.push({
        ...song,
        albumName: finalRelease.name,
        genre: finalRelease.genre,
        imageUrl: updatedImageUrl ?? song.imageUrl,
      });
      continue;
    }

    updatedSongs.push(song);
  }

  saveSongs(updatedSongs);
}

export const deleteRelease = async (
  userId: string,
  releaseId: string
): Promise<void> => {
  await delay(100);

  deleteReleaseAndSongs(releaseId);

  const users = getUsers();

  const updatedUsers = users.map(user => {
    if (user.id !== userId) return user;

    return {
      ...user,
      artistProfile: {
        ...user.artistProfile!,
        singles: user.artistProfile!.singles.filter(id => id !== releaseId),
        albums: user.artistProfile!.albums.filter(id => id !== releaseId),
      },
    };
  });

  saveUsers(updatedUsers);
};