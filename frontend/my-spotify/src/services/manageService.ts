import { AlbumItem, SongItem, UserProfile, ArtistDashboard } from "@/types";
import { userService } from "./userService";
import { getAlbums, getSongs, getUsers, getNotifications, saveNotifications,
     saveAlbums, saveSongs, saveUsers, deleteReleaseAndSongs } from "@/store/mockDb";

import { ReleaseFormState } from "@/components/manage/ReleaseForm";
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
  await delay(100);

  const coverUrl =
    formData.coverImage.length > 0
        ? `/covers/${formData.coverImage[0].name}`
        : undefined;

  let newSongs: SongItem[] = [];

  const releaseId =
    `${formData.releaseType === "single" ? "song" : "album"}-${Date.now()}`;

  if (formData.releaseType === "single") {
    newSongs.push({
      id: releaseId,
      title: formData.title,
      artistName: dbUser.displayName,
      artistId: dbUser.id,
      albumName: formData.title,
      albumId: releaseId,
      streams: 0,
      releaseDate: formData.releaseDate,
      genre: formData.genre,
      collaborators: formData.collaborators,
      audioUrl:
        formData.singleAudio.length > 0
            ? `/songs/${formData.singleAudio[0].name}`
            : "",
      lyrics: formData.singleLyrics,
      imageUrl: coverUrl,
    });
  } else {
    newSongs = formData.tracks.map((track, index) => ({
      id: `song-${Date.now()}-${index}`,
      title: track.title || `Track ${index + 1}`,
      artistName: dbUser.displayName,
      artistId: dbUser.id,
      albumName: formData.title,
      albumId: releaseId,
      streams: 0,
      releaseDate: formData.releaseDate,
      genre: formData.genre,
      collaborators: formData.collaborators,
      audioUrl:
        track.audio.length > 0
            ? `/songs/${track.audio[0].name}`
            : "",
      lyrics: track.lyrics,
      trackNumber: index + 1,
      imageUrl: coverUrl,
    }));
  }

  saveSongs([
    ...getSongs(),
    ...newSongs,
  ]);

  if (formData.releaseType === "album") {
    const album: AlbumItem = {
      id: releaseId,
      name: formData.title,
      artistName: dbUser.displayName,
      artistId: dbUser.id,
      listeners: 0,
      releaseDate: formData.releaseDate,
      releaseType: "album",
      genre: formData.genre,
      collaborators: formData.collaborators,
      imageUrl: coverUrl,
      songList: newSongs.map(s => s.id),
    };

    saveAlbums([
      ...getAlbums(),
      album,
    ]);
  }

    const users = getUsers().map(user => {
        if (user.id !== dbUser.id) return user;

        if (!user.artistProfile)
            throw new Error("Artist profile not found.");

        return {
            ...user,
            artistProfile: {
            ...user.artistProfile,
            singles:
                formData.releaseType === "single"
                ? [...user.artistProfile.singles, releaseId]
                : user.artistProfile.singles,

            albums:
                formData.releaseType === "album"
                ? [...user.artistProfile.albums, releaseId]
                : user.artistProfile.albums,
            },
        };
    });

    saveUsers(users);

    const notifications = getNotifications();

    const followers = users.filter(user =>
    user.following.includes(dbUser.id)
    );

    const releaseName = formData.title;
    const releaseType =
    formData.releaseType === "single" ? "single" : "album";

    followers.forEach(user => {
        notifications.push({
            id: crypto.randomUUID(),
            userId: user.id,
            content: `${dbUser.displayName} has released a new ${releaseType}: "${releaseName}".`,
            status: "unread",
            type: "NA",
            redirectId: releaseId,
            createdAt: new Date(),
        });
    });

    saveNotifications(notifications);
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

  // Update album
  if (finalRelease.releaseType !== "single") {
    const albums = getAlbums().map(album =>
      album.id === finalRelease.id
        ? finalRelease
        : album
    );

    saveAlbums(albums);
  }

  // Update songs
  const songs = getSongs().map(song => {
    const trackUpdate = updatedTracks?.find(
      t => t.id === song.id
    );

    if (trackUpdate) {
      let audioUrl = song.audioUrl;

      if (trackUpdate.audioFile) {
        audioUrl = `/songs/${trackUpdate.audioFile.name}`;
      }

      return {
        ...song,
        title: trackUpdate.title,
        lyrics: trackUpdate.lyrics,
        audioUrl,
        albumName: finalRelease.name,
        genre: finalRelease.genre,
        imageUrl: updatedImageUrl ?? song.imageUrl,
      };
    }

    if (
      finalRelease.releaseType === "single" &&
      song.id === finalRelease.id
    ) {
      return {
        ...song,
        title: finalRelease.name,
        albumName: finalRelease.name,
        genre: finalRelease.genre,
        imageUrl: updatedImageUrl ?? song.imageUrl,
      };
    }

    if (song.albumId === finalRelease.id) {
      return {
        ...song,
        albumName: finalRelease.name,
        genre: finalRelease.genre,
        imageUrl: updatedImageUrl ?? song.imageUrl,
      };
    }

    return song;
  });

  saveSongs(songs);
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