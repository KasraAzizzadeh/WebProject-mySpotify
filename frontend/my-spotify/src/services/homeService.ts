import { DashboardData, UserProfile, SubscriptionType, PlaylistItem } from '@/types';
import { getUsers, getPlaylists } from '@/store/mockDb';
import api, { handleApiError } from '@/services/api';
import { mapSong, mapAlbum, mapPlaylist } from '@/utils/mediaUtils';

export async function getDashboardData(
  subscriptionType?: SubscriptionType,
  userId?: string
): Promise<DashboardData> {
  // Keep recentlyPlayed resolution from mock DB for now (no backend equivalent implemented)
  const allPlaylists = getPlaylists();

  let recentlyPlayed: PlaylistItem[] = [];
  let backendReturned = false; // indicates whether backend responded successfully (even if empty array)

  if (userId) {
    try {
      const resp = await api.get('/playlists/recent/', { params: { id: userId } });

      if (Array.isArray(resp.data)) {
        recentlyPlayed = resp.data.map(mapPlaylist);
        backendReturned = true;
      }
    } catch (error) {
      // If backend call fails, we'll fall back to mock DB logic below
      console.warn('Failed to fetch recent playlists from backend, falling back to client-side mock. Error:', error);
      backendReturned = false;
    }
  }

  // Only use client-side mock fallback when the backend was not called or it failed.
  // If the backend returned an empty array intentionally, keep it empty so the
  // UI can hide the Recent Playlists row as requested.
  if (!backendReturned) {
    // fallback: use client-side mock DB as before
    if (userId) {
      const users = getUsers();
      const user = users.find((u) => u.id === userId);

      if (
        user &&
        user.listenerProfile &&
        Array.isArray(user.listenerProfile.recentlyPlayed) &&
        user.listenerProfile.recentlyPlayed.length > 0
      ) {
        recentlyPlayed = user.listenerProfile.recentlyPlayed
          .map((pid) => allPlaylists.find((p) => p.id === pid))
          .filter((p): p is PlaylistItem => !!p);
      }
    }

    if (!recentlyPlayed || recentlyPlayed.length === 0) {
      recentlyPlayed = allPlaylists;
    }
  }


  try {
    // Fetch trending songs and recent albums from backend API in parallel
    const [songsResp, albumsResp] = await Promise.all([
      api.get('/songs/', { params: { filter: 'streams' } }),
      api.get('/albums/', { params: { filter: 'newest' } }),
    ]);

    const trendingSongs = Array.isArray(songsResp.data)
      ? songsResp.data.map(mapSong)
      : [];

    const recentAlbums = Array.isArray(albumsResp.data)
      ? albumsResp.data.map(mapAlbum)
      : [];

    const baseData: DashboardData = {
      recentlyPlayed,
      trendingSongs,
      recentAlbums,
    };

    if (subscriptionType === 'gold' && recentAlbums.length > 1) {
      baseData.earlyAccess = [recentAlbums[1]];
    }

    return baseData;
  } catch (error) {
    handleApiError(error);
  }
}