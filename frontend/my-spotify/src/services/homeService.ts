import { DashboardData, UserProfile, SubscriptionType, PlaylistItem } from '@/types';
import { getUsers, getAlbums, getSongs, getPlaylists } from '@/store/mockDb';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getDashboardData(
  subscriptionType?: SubscriptionType,
  userId?: string
): Promise<DashboardData> {
  await delay(200);

  const dbSongs = getSongs();
  const dbAlbums = getAlbums();
  const allPlaylists = getPlaylists();

  // Resolve recently played playlists from the user's listenerProfile if available
  let recentlyPlayed: PlaylistItem[] = [];

  if (userId) {
    const users = getUsers();
    const user = users.find((u) => u.id === userId);

    if (user && user.listenerProfile && Array.isArray(user.listenerProfile.recentlyPlayed) && user.listenerProfile.recentlyPlayed.length > 0) {
      recentlyPlayed = user.listenerProfile.recentlyPlayed
        .map((pid) => allPlaylists.find((p) => p.id === pid))
        .filter((p): p is PlaylistItem => !!p);
    }
  }

  // Fallback to all playlists when no user-specific recently played exists
  if (!recentlyPlayed || recentlyPlayed.length === 0) {
    recentlyPlayed = allPlaylists;
  }

  // Trending songs
  const trendingSongs = dbSongs.slice(0, 2);

  // Sort albums by release date (latest first)
  const recentAlbums = [...dbAlbums].sort((a, b) =>
    new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
  );

  const baseData: DashboardData = {
    recentlyPlayed,
    trendingSongs,
    recentAlbums,
  };

  if (subscriptionType === 'gold' && recentAlbums.length > 1) {
    baseData.earlyAccess = [recentAlbums[1]];
  }

  return baseData;
}