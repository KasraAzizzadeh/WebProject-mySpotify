export type UserRole = 'listener' | 'artist' | 'supporter' | 'admin';
export type SubscriptionType = 'basic' | 'silver' | 'gold';

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  profilePictureUrl?: string;
  role: UserRole;
  subscriptionType: SubscriptionType;
}

export interface PlaylistItem {
  id: string;
  name: string;
  imageUrl?: string;
  trackCount: number;
}

export interface AlbumItem {
  id: string;
  name: string;
  artistName: string;
  imageUrl?: string;
}

export interface SongItem {
  id: string;
  title: string;
  artistName: string;
  albumName?: string;
  imageUrl?: string;
}

export interface DashboardData {
  recentlyPlayed: PlaylistItem[];
  trendingSongs: SongItem[];
  recentAlbums: AlbumItem[];
  earlyAccess?: AlbumItem[]; // Restricted to Gold users
}