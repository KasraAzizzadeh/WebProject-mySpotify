import { getAlbums, getSongs, getPlaylists, savePlaylists, getUsers, saveUsers } from "@/store/mockDb";
import { AlbumItem, SongItem, PlaylistItem, DiscoverData, DiscoverFilter } from "@/types";

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

export const getUserPlaylists = async (playlistIds: string[]): Promise<PlaylistItem[]> => {
  if (!playlistIds || playlistIds.length === 0) return [];
  const playlists = await Promise.all(
    playlistIds.map((id) => getPlaylistById(id).catch(() => null))
  );
  return playlists.filter((p): p is PlaylistItem => p !== null);
};

// 🆕 NEW: Creates a brand new playlist and appends its ID to the owner user profile
export const createPlaylist = async (name: string, userId: string): Promise<{ playlist: PlaylistItem; updatedUser: any }> => {
  await delay(150);

  const allPlaylists = getPlaylists();
  const allUsers = getUsers();

  // Create unique playlist item ID
  const newPlaylistId = `p-${Date.now()}`;
  const newPlaylist: PlaylistItem = {
    id: newPlaylistId,
    name: name,
    ownerId: userId,
    isPrivate: false,
    songList: [], // Initial empty array list for songs
  };

  // 1. Save new playlist item
  allPlaylists.push(newPlaylist);
  savePlaylists(allPlaylists);

  // 2. Update user listener profile registry arrays
  const targetUser = allUsers.find(u => u.id === userId);
  if (!targetUser) throw new Error("Authenticated session owner context not found");

  if (!targetUser.listenerProfile) {
    targetUser.listenerProfile = { playlists: [], likedTracks: [], recentlyPlayed: [] };
  }
  if (!targetUser.listenerProfile.playlists) {
    targetUser.listenerProfile.playlists = [];
  }

  targetUser.listenerProfile.playlists.push(newPlaylistId);
  saveUsers(allUsers);

  return { playlist: newPlaylist, updatedUser: targetUser };
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
  let albums = getAlbums();
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