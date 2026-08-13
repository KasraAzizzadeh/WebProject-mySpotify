import { getAlbums, getSongs, getPlaylists, getUsers, savePlaylists, saveSongs , saveUsers } from "@/store/mockDb";
import { AlbumItem, SongItem, PlaylistItem, DiscoverData, DiscoverFilter, PlaybackSource } from "@/types";
import { getBackendFilter, isSameDay, mapAlbum, mapPlaylist, mapSong } from "@/utils/mediaUtils";
import api, { getMediaUrl } from "@/services/api"
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
  try {
    await api.post(
      `/playlists/${playlistId}/songs/${songId}/`
    );
  } catch (error) {
    handleApiError(error);
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
    isPrivate: boolean;
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
    formData.append("is_private", String(updates.isPrivate));

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

interface SongStreamResponse {
  audio_url: string;
}

export const getSongStreamUrl = async (songId: string): Promise<string | undefined> => {
  try {
    const response = await api.get<SongStreamResponse>(
      `/songs/${songId}/stream/`
    );

    return getMediaUrl(response.data.audio_url)
  } catch (error) {
    return handleApiError(error);
  }
};

export const registerSongStream = async (songId: string): Promise<void> => {
  try {
    await api.post(`/songs/${songId}/stream/`);
  } catch (error) {
    return handleApiError(error);
  }
};


export const downloadSong = async (songId: string): Promise<void> => {
  try {
    const response = await api.get(
      `/songs/${songId}/download/`,
      {
        responseType: "blob",
      }
    );

    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `song-${songId}`;
    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    handleApiError(error);
  }
};