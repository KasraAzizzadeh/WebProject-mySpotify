import { getAlbums, getSongs, getPlaylists, getUsers, savePlaylists, saveSongs , saveUsers } from "@/store/mockDb";
import { AlbumItem, SongItem, PlaylistItem, DiscoverData, DiscoverFilter, PlaybackSource } from "@/types";
import { getBackendFilter, isSameDay, mapAlbum, mapPlaylist, mapSong } from "@/utils/mediaUtils";
import api from "@/services/api"
import { handleApiError } from "@/services/api";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const getAlbumById = async (albumId: string) : Promise<AlbumItem> => {
  try {
    const response = await api.get(
      `/albums/${albumId}/`
    );
    return mapAlbum(response.data);
  } catch (error) {
    handleApiError(error)
  }
}

export const getSongById = async (songId: string) : Promise<SongItem> => {
    await delay(100);
    const allSongs = getSongs();
    const song = allSongs.find(s => s.id === songId);
    if (!song) throw new Error("This song doesn't exist");
    return song;
}

export const getSongsByAlbumId = async (albumId: string): Promise<SongItem[]> => {
  try {
    const response = await api.get(
      `/albums/${albumId}/songs/`
    );
    return response.data.map(mapSong)
  } catch (error) {
    handleApiError(error)
  }
};

export const getPlaylistById = async (playlistId: string): Promise<PlaylistItem> => {
  try {
    const response = await api.get(
      `/playlists/${playlistId}/`
    );
    return mapPlaylist(response.data);
  } catch (error) {
    handleApiError(error)
  }
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

export const getSongsByPlaylistId = async (playlistId: string): Promise<SongItem[]> => {
  try {
    const response = await api.get(
      `/playlists/${playlistId}/songs/`
    )

    const songs = response.data.sort(
      (a: {position : number}, b : {position : number}) => a.position - b.position
    ).map((item: { song: SongItem }) => item.song);

    return songs.map(mapSong);
  } catch (error) {
    handleApiError(error);
  }
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

export const removeSongFromPlaylist = async (songId: string, playlistId: string): Promise<void> => {
  try {
    await api.delete(
      `/playlists/${playlistId}/songs/${songId}/`
    );
  } catch (error) {
    handleApiError(error);
  }
};

export const discoverSongs = async (
  query: string,
  filter: DiscoverFilter = "latest"
): Promise<SongItem[]> => {
  try {
    const response = await api.get("/songs/", {
      params: {
        query: query || undefined,
        filter: getBackendFilter(filter, "songs")
      },
    });

    return response.data.map(mapSong);
  } catch (error) {
    handleApiError(error);
  }
};

export const discoverAlbums = async (
  query: string,
  filter: DiscoverFilter = "latest"
): Promise<AlbumItem[]> => {
  try {
    const response = await api.get("/albums/", {
      params: {
        query: query || undefined,
        filter: getBackendFilter(filter, "albums")
      },
    });

    return response.data
      .filter((album: any) => (album.song_list ?? album.songList ?? []).length > 1)
      .map(mapAlbum);
  } catch (error) {
    handleApiError(error);
  }
};

export const discoverPlaylists = async (
  query: string,
  filter: DiscoverFilter = "latest"
): Promise<PlaylistItem[]> => {
  try {
    const response = await api.get("/playlists/", {
      params: {
        query: query || undefined,
        filter: getBackendFilter(filter, "playlists")
      },
    });

    return response.data.map(mapPlaylist);
  } catch (error) {
    handleApiError(error);
  }
};

export const updatePlaylist = async (
  playlistId: string,
  updates: {
    name: string;
    description?: string;
    imageFile?: File;
  }
): Promise<PlaylistItem> => {
  try {
    const formData = new FormData();
    formData.append("name", updates.name);
    if (updates.description !== undefined) {
      formData.append("description", updates.description)
    }
    if (updates.imageFile) {
      formData.append("cover_image", updates.imageFile);
    }

    const response = await api.patch(
      `/playlists/${playlistId}/`, formData
    );
    return mapPlaylist(response.data);
  } catch (error) {
    handleApiError(error);
  }
};

export const deletePlaylist = async (playlistId: string): Promise<void> => {
    try {
        await api.delete(`/playlists/${playlistId}/`);
    } catch (error) {
        handleApiError(error);
    }
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