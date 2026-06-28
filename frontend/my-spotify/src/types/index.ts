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
  followers: string[]; // Array of User IDs following this user
  following: string[]; // Array of User IDs this user is following
  listenerProfile?: ListenerProfile;
  artistProfile?: ArtistProfile;
}

interface ArtistProfile {
  bio?: string;
  //isVerified: boolean;
  verificationStatus: VerificationStatus;
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

export interface ArtistApplicationTicket {
    id: string;
    userId: string;
    email: string;
    artisticName: string;
    samples: string[];
    verificationStatus: VerificationStatus;
    submittedAt: Date;
}

export interface OtpEntry {
  id: string;
  userId: string;
  userEmail: string;
  otpCode: string;
  createdAt: Date;
  expiresAt: Date;
}