export type UserRole = 'listener' | 'artist' | 'supporter' | 'admin';
export type SubscriptionType = 'basic' | 'silver' | 'gold';
export type VerificationStatus = "pending" | "approved" | "rejected";

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  email: string;
  profilePictureUrl?: string;
  role: UserRole;
  subscriptionType: SubscriptionType;
  
  gender?: string;
  birthDate?: Date;

  createdAt?: Date;
  artistProfile?: ArtistProfile;
  listenerProfile?: ListenerProfile;
}

interface ArtistProfile {
  bio?: string;
  verificationStatus: VerificationStatus;
  singles?: string[];
  albums?: string[];
  totalStreams: number;
  followersCount: number;
}

interface ListenerProfile {
  followingArtists: string[];
  likedTracks: string[];
  recentlyPlayed: string[];
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

export interface ArtistApplicationTicket {
    id: string;
    userId: string;
    email: string;
    artisticName: string;
    samples: string[];
    verificationStatus: VerificationStatus;
    submittedAt: Date;
}