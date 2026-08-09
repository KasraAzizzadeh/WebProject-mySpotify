import { getAlbums, getSongs, getPlaylists, getUsers, savePlaylists, saveSongs , saveUsers } from "@/store/mockDb";
import { AlbumItem, SongItem, PlaylistItem, DiscoverData, DiscoverFilter, PlaybackSource } from "@/types";
import { isSameDay, mapPlaylist } from "@/utils/mediaUtils";
import api from "@/services/api"
import { handleApiError } from "@/services/api";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const getAlbumById = async (albumId: string) : Promise<AlbumItem> => {
    await delay(100);
    const allAlbums = getAlbums();
    const album = allAlbums.find(al => al.id === albumId);
    if (!album) throw new Error("Sorry no such album exists");
    return album;
}

export const getSongById = async (songId: string) : Promise<SongItem> => {
    await delay(100);
    const allSongs = getSongs();
    const song = allSongs.find(s => s.id === songId);
    if (!song) throw new Error("This song doesn't exist");
    return song;
}

export const getSongsByAlbumId = async (albumId: string): Promise<SongItem[]> => {
  await delay(100);
  const album = await getAlbumById(albumId);
  const songs = await Promise.all(album.songList.map((songId) => getSongById(songId)));
  return songs.filter((song): song is SongItem => song != null);
};

export const getPlaylistById = async (playlistId: string): Promise<PlaylistItem> => {
  await delay(100);
  const allPlaylists = getPlaylists();
  const playlist = allPlaylists.find(p => p.id === playlistId);
  if (!playlist) throw new Error("This playlist doesn't exist");
  return playlist;
};

export const getUserPlaylists = async (userId: string): Promise<PlaylistItem[]> => {
  try {
    const response = await api.get(
      `/accounts/${userId}/playlists/`
    );
    return response.data.map(mapPlaylist)
  } catch (error) {
    handleApiError(error)
  }
};

export const createPlaylist = async (name: string): Promise<PlaylistItem> => {
  try {
    const response = await api.post("/playlists/", {
      name,
    });

    return mapPlaylist(response.data);
  } catch (error) {
    handleApiError(error);
  }
};

// 🆕 NEW: Resolves all songs belonging to a specific playlist ID
export const getSongsByPlaylistId = async (playlistId: string): Promise<SongItem[]> => {
  await delay(100);

  const playlist = await getPlaylistById(playlistId);

  const songs = await Promise.all(
    playlist.songList.map((songId) => getSongById(songId).catch(() => null))
  );

  return songs.filter((song): song is SongItem => song !== null);
};

export const addSongToPlaylist = async (songId: string, playlistId: string): Promise<void> => {
  await delay(100);

  const allPlaylists = getPlaylists();
  const index = allPlaylists.findIndex((p) => p.id === playlistId);
      
  if (index !== -1) {
    if (allPlaylists[index].songList.find(s => s === songId))
      throw new Error ("Song is already in this playlist");
    allPlaylists[index].songList.push(songId);
    savePlaylists(allPlaylists);
  }
};

export const removeSongFromPlaylist = async (songId: string, playlistId: string): Promise<PlaylistItem> => {
  await delay(100);

  const allPlaylists = getPlaylists();
  const index = allPlaylists.findIndex((p) => p.id === playlistId);

  if (index === -1) {
    throw new Error("Playlist not found");
  }

  if (!allPlaylists[index].songList.includes(songId)) {
    throw new Error("Song is not in this playlist");
  }

  allPlaylists[index].songList =
    allPlaylists[index].songList.filter((s) => s !== songId);

  savePlaylists(allPlaylists);

  return allPlaylists[index];
};

export const getMediaData = async (
  query: string,
  filter: DiscoverFilter = "latest"
): Promise<DiscoverData> => {
  await delay(100);

  let songs = getSongs();
  // don't show singles in album section
  let albums = getAlbums().filter(a => a.songList.length > 1);
  let playlists = getPlaylists();

  if (query.trim()) {
    const search = query.toLowerCase();

    songs = songs.filter(
      (song) =>
        song.title.toLowerCase().includes(search) ||
        song.artistName.toLowerCase().includes(search)
    );

    albums = albums.filter(
      (album) =>
        album.name.toLowerCase().includes(search) ||
        album.artistName.toLowerCase().includes(search)
    );

    playlists = playlists.filter((playlist) =>
      playlist.name.toLowerCase().includes(search)
    );
  }
  
  switch (filter) {
    case "latest":
      songs.sort(
        (a, b) =>
          new Date(b.releaseDate).getTime() -
          new Date(a.releaseDate).getTime()
      );

      albums.sort(
        (a, b) =>
          new Date(b.releaseDate).getTime() -
          new Date(a.releaseDate).getTime()
      );

      break;

    case "oldest":
      songs.sort(
        (a, b) =>
          new Date(a.releaseDate).getTime() -
          new Date(b.releaseDate).getTime()
      );

      albums.sort(
        (a, b) =>
          new Date(a.releaseDate).getTime() -
          new Date(b.releaseDate).getTime()
      );

      break;

    case "most-streamed":
      songs.sort((a, b) => b.streams - a.streams);

      albums.sort((a, b) => b.listeners - a.listeners);

      break;
  }

  return {
    songs: songs.slice(0, 50),
    albums: albums.slice(0, 50),
    playlists: playlists.slice(0, 50),
  };
};

export const updatePlaylist = async (
  playlistId: string,
  updates: {
    name: string;
    description?: string;
    imageFile?: File;
  }
): Promise<PlaylistItem> => {
  await delay(100);

  const allPlaylists = getPlaylists();

  const index = allPlaylists.findIndex(
    (p) => p.id === playlistId
  );

  if (index === -1) {
    throw new Error("Playlist not found");
  }

  let imageUrl = allPlaylists[index].imageUrl;

  if (updates.imageFile) {
    imageUrl = `/covers/${updates.imageFile.name}`;
  }

  allPlaylists[index] = {
    ...allPlaylists[index],
    name: updates.name.trim(),
    description: updates.description?.trim() || "",
    imageUrl: imageUrl || "",
  };

  savePlaylists(allPlaylists);

  return allPlaylists[index];
};

export const deletePlaylist = async (
  playlistId: string,
): Promise<string> => {
  await delay(100);

  const allPlaylists = getPlaylists();

  const updatedPlaylists = allPlaylists.filter(
    (p) => p.id !== playlistId
  );

  savePlaylists(updatedPlaylists);

  return "success";
};

export const updateStreams = async (
  userId: string,
  songId: string,
  playback: PlaybackSource
): Promise<void> => {
  await delay(100);

  // Update song streams
  const allSongs = getSongs();

  const songIndex = allSongs.findIndex((s) => s.id === songId);

  if (songIndex === -1) {
    throw new Error("Song not found");
  }

  allSongs[songIndex] = {
    ...allSongs[songIndex],
    streams: allSongs[songIndex].streams + 1,
  };

  saveSongs(allSongs);

  // Update user's daily streams
  const today = new Date();

  const allUsers = getUsers();

  const updatedUsers = allUsers.map((u) => {
    if (u.id !== userId) return u;

    const profile = u.listenerProfile;

    if (!profile) return u;

    const listenedToday =
      profile.lastStreamDate &&
      isSameDay(new Date(profile.lastStreamDate), today);

    let recents = [...profile.recentlyPlayed];
    if (playback.type === "playlist") {
      recents = recents.filter(r => {
        r !== playback.id
      })
      recents.unshift(playback.id);
      if (recents.length > 20) {
        recents.splice(20);
      }
    }

    return {
      ...u,
      listenerProfile: {
        ...profile,
        recentlyPlayed: recents,
        dailyStreams: listenedToday
          ? profile.dailyStreams + 1
          : 1,
        lastStreamDate: today,
      },
    };
  });

  saveUsers(updatedUsers);

  // add unique listeners update later
};