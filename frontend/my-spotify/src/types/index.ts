export type UserRole = 'listener' | 'artist' | 'supporter' | 'admin';
export type SubscriptionType = 'basic' | 'silver' | 'gold';
export type VerificationStatus = "pending" | "approved" | "rejected";
export type ApiValidationErrors = Record<string, string | string[]>;

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  email: string;
  profilePictureUrl?: string;
  role: UserRole;
  subscriptionType: SubscriptionType;
  subValidUntil?: Date | null;
  gender?: string;
  birthDate?: Date;
  createdAt?: Date;
  followers: string[];
  following: string[];
  listenerProfile?: ListenerProfile;
  artistProfile?: ArtistProfile;
  settings?: UserSettings;
}

interface ArtistProfile {
  bio?: string;
  verificationStatus: VerificationStatus;
  singles: string[];
  albums: string[];
  totalStreams: number;
  uniqueListener?: number;
}

interface ListenerProfile {
  playlists?: string[];
  likedTracks: string[];
  recentlyPlayed: string[];
  dailyStreams: number;
  lastStreamDate: Date | null;
}

interface UserSettings {
  notificationLimit: number;
  systemVoice: string;
  language: string;
}

export interface PlaylistItem {
  id: string;
  name: string;
  ownerId: string;
  createdAt?: string;
  imageUrl?: string;
  description?: string;
  isPrivate?: boolean;
  songList: string[];
}

export interface AlbumItem {
  id: string;
  name: string;
  artistName: string;
  artistId: string;
  listeners: number;
  releaseDate: string;
  imageUrl?: string;
  description?: string;
  songList: string[];

  // NEW METADATA FIELDS
  genre?: string;
  collaborators?: string;
  releaseType?: 'single' | 'album';
}

export interface SongItem {
  id: string;
  title: string;
  artistName: string;
  artistId: string;
  albumName?: string;
  albumId?: string;
  streams: number;
  releaseDate: string;
  imageUrl?: string;
  trackNumber?: number;
  songDurationMs?: number;
  audioUrl?: string;
  lyrics?: string;
  // NEW METADATA FIELDS
  genre?: string[];
  collaborators?: string[];
  
}

export interface DashboardData {
  recentlyPlayed: PlaylistItem[];
  trendingSongs: SongItem[];
  recentAlbums: AlbumItem[];
  earlyAccess?: AlbumItem[]; 
}

export interface ArtistDashboard {
  user: UserProfile;
  releases: AlbumItem[];
  songs: SongItem[];
}

export type DiscoverFilter = "latest" | "most-streamed" | "oldest";

export interface PlaybackSource {
  type: 'album' | 'playlist' | 'single';
  id: string;
}

export interface DiscoverData {
  songs: SongItem[];
  albums: AlbumItem[];
  playlists: PlaylistItem[];
}

export interface OtpEntry {
  id: string;
  userId: string;
  userEmail: string;
  otpCode: string;
  createdAt: Date;
  expiresAt: Date;
}

// ES = Expiring Subscription
// SA = Support Artist Application
// AA = Artist Approved
// AQ = Answered Question
// ST = Support Ticket
// AT = Audit Transfer
// NA = New Album

export type NotificationType = "NA" | "ES" | "AQ" | "AA" | "AT" | "SA" | "ST";

export interface Notifications {
  id: string;
  userId: string;
  content: string;
  status: "read" | "unread";
  type: NotificationType;
  redirectId?: string;
  createdAt: Date;
}

// ==========================================
// SUPPORT INTERFACES & OPERATIONAL UI TYPES
// ==========================================
export type TicketStatus = 'Open' | 'Replied' | 'Closed';
export type PaymentStatus = 'Pending Payment' | 'Settled';
export type TabState = 'verification' | 'tickets' | 'auditing' | 'settings';

export interface ArtistApplicationTicket {
  id: string;
  userId: string;
  email: string;
  artisticName: string;
  samples: string[];
  verificationStatus: VerificationStatus;
  submittedAt: Date;
}

export interface TicketMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'user' | 'support';
  content: string;
  timestamp: string;
}

export interface SupportTicketLocal {
  id: string;
  username: string;
  subject: string;
  dateSubmitted: string;
  status: TicketStatus;
  messages: TicketMessage[];
}

export interface AuditingRecord {
  id: string;
  artistName: string;
  artistId: string;
  uniqueListeners: number;
  totalStreams: number;
  calculatedReward: number;
  paymentStatus: PaymentStatus;
}

type SubFeatures = {text: string; included: boolean;}

export interface SubscriptionTier {
  id: SubscriptionType;
  name: string;
  price: string;
  period: "forever" | "mo";
  features: SubFeatures[]
}