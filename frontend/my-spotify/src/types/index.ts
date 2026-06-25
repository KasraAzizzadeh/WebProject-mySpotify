export type UserRole = 'listener' | 'artist' | 'supporter' | 'admin';
export type SubscriptionType = 'basic' | 'silver' | 'gold';

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  email: string;
  profilePictureUrl?: string;
  role: UserRole;
  subscriptionType: SubscriptionType;
  createdAt?: string;
  
  followers: string[]; // Array of User IDs following this user
  following: string[]; // Array of User IDs this user is following

  artistProfile?: ArtistProfile;
  listenerProfile?: ListenerProfile;
}

interface ArtistProfile {
  bio?: string;
  isVerified: boolean;
  singles?: string[];
  albums?: string[];
  totalStreams: number;
 }

interface ListenerProfile {
  likedTracks: string[];
  recentlyPlayed: string[];
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
  artistId: string;
  listeners: number;
  releaseDate: string;
  imageUrl?: string;
}

export interface SongItem {
  id: string;
  title: string;
  artistName: string;
  artistId: string;
  albumName?: string;
  albumId?: string;
  listeners: number;
  releaseDate: string;
  imageUrl?: string;
}

export interface DashboardData {
  recentlyPlayed: PlaylistItem[];
  trendingSongs: SongItem[];
  recentAlbums: AlbumItem[];
  earlyAccess?: AlbumItem[]; 
}