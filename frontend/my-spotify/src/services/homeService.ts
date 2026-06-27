import { DashboardData, UserProfile, SubscriptionType } from '@/types';
import { getUsers, getAlbums, getSongs, getPlaylists } from '@/store/mockDb';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));



export async function getDashboardData(subscriptionType: SubscriptionType): Promise<DashboardData> {
  await delay(200);

  const dbPlaylists = getPlaylists();
  const dbSongs = getSongs();
  const dbAlbums = getAlbums();

  const baseData: DashboardData = {
    recentlyPlayed: dbPlaylists,
    trendingSongs: dbSongs.slice(0, 2), 
    recentAlbums: dbAlbums, 
  };

  if (subscriptionType === 'gold') {
    baseData.earlyAccess = [dbAlbums[1]]; 
  }
  
  return baseData;
}