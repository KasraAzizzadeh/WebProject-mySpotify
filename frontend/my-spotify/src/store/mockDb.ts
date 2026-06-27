import { UserProfile, ArtistApplicationTicket, AlbumItem,
   PlaylistItem, SongItem, OtpEntry } from "@/types";

// Database Keys
const USERS_KEY = "app_users";
const ALBUMS_KEY = "app_albums";
const SONGS_KEY = "app_songs";
const PLAYLISTS_KEY = "app_playlists";
const ARTIST_TICKET_KEY = "app_artist_tickets";
const OTPS_KEY = "app_otps"

export type User = UserProfile & {
  password: string;
};

// --- SEED DATA ---
const SEED_USERS: User[] = [
  {
    id: "user-1",
    email: "alex@gmail.com",
    username: "alex99",
    displayName: "Alex Carter",
    profilePictureUrl: undefined,
    role: "artist",
    subscriptionType: "gold",
    createdAt: new Date(), 
    password: "Alex_1234",
    artistProfile: {
      bio: "Electronic music producer",
      verificationStatus: "approved", 
      singles: ["s1", "s3"], // Pointing to seed track IDs
      albums: ["a1"],
      totalStreams: 120000,
      followersCount: 0
    }
  },
  {
    id: "user-2",
    email: "jane@gmail.com",
    username: "jane_doe",
    displayName: "Jane Doe",
    profilePictureUrl: undefined,
    role: "listener",
    subscriptionType: "basic",
    createdAt: new Date(), 
    password: "J123_abcd",
    listenerProfile: {
      followingArtists: ["user-1"],
      likedTracks: [],
      recentlyPlayed: ["p1"]
    }
  },
];

const SEED_ALBUMS: AlbumItem[] = [
  { id: 'a1', name: 'Velvet Dreams', artistName: 'The Soft Tones', artistId: 'art-st1', listeners: 450000, releaseDate: '2026-04-12' },
  { id: 'a2', name: 'Hyperdrive', artistName: 'Glitch Fox', artistId: 'art-gf4', listeners: 890000, releaseDate: '2026-05-20' },
];

const SEED_PLAYLISTS: PlaylistItem[] = [
  { id: 'p1', name: 'Chill Lo-Fi Beats', trackCount: 42 },
  { id: 'p2', name: 'Coding Session Intensity', trackCount: 18 },
];

const SEED_SONGS: SongItem[] = [
  { id: 's1', title: 'Midnight Pulse', artistName: 'Neon Horizon', artistId: 'user-1', albumName: 'Synth City', albumId: 'alb-sc2', listeners: 1200000, releaseDate: '2026-06-01' },
  { id: 's2', title: 'Ethereal Echoes', artistName: 'Luna Eclipse', artistId: 'art-le3', listeners: 85000, releaseDate: '2025-12-15' },
  { id: 's3', title: 'Cosmic Drift', artistName: 'Neon Horizon', artistId: 'user-1', listeners: 45000, releaseDate: '2026-02-10' }
];

// --- CORE UTILITY DATABASE METHODS ---

export function getUsers(): User[] {
  const data = localStorage.getItem(USERS_KEY);
  if (!data) {
    localStorage.setItem(USERS_KEY, JSON.stringify(SEED_USERS));
    return SEED_USERS;
  }
  return JSON.parse(data).map((user: any) => ({
    ...user,
    createdAt: user.createdAt ? new Date(user.createdAt) : undefined,
    birthDate: user.birthDate ? new Date(user.birthDate) : undefined,
  }));
}
export function saveUsers(users: User[]): void { localStorage.setItem(USERS_KEY, JSON.stringify(users)); }

export function getAlbums(): AlbumItem[] {
  const data = localStorage.getItem(ALBUMS_KEY);
  if (!data) { localStorage.setItem(ALBUMS_KEY, JSON.stringify(SEED_ALBUMS)); return SEED_ALBUMS; }
  return JSON.parse(data);
}
export function saveAlbums(albums: AlbumItem[]): void { localStorage.setItem(ALBUMS_KEY, JSON.stringify(albums)); }

export function getPlaylists(): PlaylistItem[] {
  const data = localStorage.getItem(PLAYLISTS_KEY);
  if (!data) { localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(SEED_PLAYLISTS)); return SEED_PLAYLISTS; }
  return JSON.parse(data);
}
export function savePlaylists(playlists: PlaylistItem[]): void { localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists)); }

export function getSongs(): SongItem[] {
  const data = localStorage.getItem(SONGS_KEY);
  if (!data) { localStorage.setItem(SONGS_KEY, JSON.stringify(SEED_SONGS)); return SEED_SONGS; }
  return JSON.parse(data);
}
export function saveSongs(songs: SongItem[]): void { localStorage.setItem(SONGS_KEY, JSON.stringify(songs)); }

export function getApplicaitonTickets(): ArtistApplicationTicket[] {
  const data = localStorage.getItem(ARTIST_TICKET_KEY);
  if (!data) return [];
  return JSON.parse(data).map((t: any) => ({ ...t, submittedAt: t.submittedAt ? new Date(t.submittedAt) : new Date() }));
}
export function saveApplicationTickets(tickets: ArtistApplicationTicket[]): void { localStorage.setItem(ARTIST_TICKET_KEY, JSON.stringify(tickets)); }

export function getOtps(): OtpEntry[] {
  const data = localStorage.getItem(OTPS_KEY);
  if (!data) return [];
  return JSON.parse(data);
}
export function saveOtps(otps: OtpEntry[]): void { localStorage.setItem(OTPS_KEY, JSON.stringify(otps)); }