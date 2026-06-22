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

// Extended to support Discover page sorting and Artist routing
export interface AlbumItem {
  id: string;
  name: string;
  artistName: string;
  artistId: string;       // Added for routing
  listeners: number;      // Added for sorting/display
  releaseDate: string;    // Added for sorting/display
  imageUrl?: string;
}

// Extended to support Discover page sorting, Album routing, and Artist routing
export interface SongItem {
  id: string;
  title: string;
  artistName: string;
  artistId: string;       // Added for routing
  albumName?: string;
  albumId?: string;       // Added for routing
  listeners: number;      // Added for sorting/display
  releaseDate: string;    // Added for sorting/display
  imageUrl?: string;
}

export interface DashboardData {
  recentlyPlayed: PlaylistItem[];
  trendingSongs: SongItem[];
  recentAlbums: AlbumItem[];
  earlyAccess?: AlbumItem[]; 
}