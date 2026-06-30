import { getAlbums, getSongs, getPlaylists, savePlaylists, getUsers, saveUsers } from "@/store/mockDb";
import { AlbumItem, SongItem, PlaylistItem, UserProfile } from "@/types";

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