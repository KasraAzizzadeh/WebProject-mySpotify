import {
  UserProfile,
  ArtistApplicationTicket,
  AlbumItem,
  PlaylistItem,
  SongItem,
  OtpEntry,
} from "@/types";

// Database Keys
const USERS_KEY = "app_users";
const ALBUMS_KEY = "app_albums";
const SONGS_KEY = "app_songs";
const PLAYLISTS_KEY = "app_playlists";
const ARTIST_TICKET_KEY = "app_artist_tickets";
const OTPS_KEY = "app_otps";

export type User = UserProfile & {
  password: string;
};

// --------------------
// SEED DATA (USERS)
// --------------------
const SEED_USERS: User[] = [
  {
    id: "user-1",
    email: "alex@gmail.com",
    username: "alex99",
    displayName: "Alex Carter",
    profilePictureUrl: undefined,
    role: "artist",
    subscriptionType: "gold",

    // KEEP AS DATE OBJECT (from file 1)
    createdAt: new Date(),

    password: "Alex_1234",

    followers: ["user-2"],
    following: [],

    artistProfile: {
      bio: "Electronic music producer",
      // merged safely (keep richer version from file 1)
      //isVerified: true,
      verificationStatus: "pending",
      singles: ["s1", "s3"],
      albums: ["a1"],
      totalStreams: 120000,
     },
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

    followers: [],
    following: ["user-1"],

    listenerProfile: {
      likedTracks: [],
      recentlyPlayed: ["p1"],
    },
  },
];

// --------------------
// SEED DATA (ALBUMS)
// --------------------
const SEED_ALBUMS: AlbumItem[] = [
  { id: "a1", name: "Velvet Dreams", artistName: "The Soft Tones", artistId: "art-st1", listeners: 450000, releaseDate: "2026-04-12" },
  { id: "a2", name: "Hyperdrive", artistName: "Glitch Fox", artistId: "art-gf4", listeners: 890000, releaseDate: "2026-05-20" },
  { id: "a3", name: "Midnight Aurora", artistName: "Luna Eclipse", artistId: "art-le3", listeners: 1200000, releaseDate: "2025-11-10" },
  { id: "a4", name: "Solar Drift", artistName: "Neon Horizon", artistId: "user-1", listeners: 670000, releaseDate: "2026-01-08" },
  { id: "a5", name: "Echoes of Code", artistName: "Binary Soul", artistId: "art-bs9", listeners: 340000, releaseDate: "2026-03-15" },
  { id: "a6", name: "Dreamstate", artistName: "Cloud Atlas", artistId: "art-ca2", listeners: 510000, releaseDate: "2026-02-22" },
  { id: "a7", name: "Neon Abyss", artistName: "Void Runner", artistId: "art-vr7", listeners: 980000, releaseDate: "2025-09-30" },
  { id: "a8", name: "Fragments", artistName: "Static Bloom", artistId: "art-sb5", listeners: 230000, releaseDate: "2026-06-01" },
  { id: "a9", name: "Quantum Lullabies", artistName: "Orbit Theory", artistId: "art-ot4", listeners: 760000, releaseDate: "2026-04-28" },
  { id: "a10", name: "Afterlight", artistName: "Dusk Signal", artistId: "art-ds6", listeners: 410000, releaseDate: "2025-12-19" },
];

// --------------------
// SEED DATA (PLAYLISTS)
// --------------------
const SEED_PLAYLISTS: PlaylistItem[] = [
  { id: "p1", name: "Chill Lo-Fi Beats", trackCount: 42 },
  { id: "p2", name: "Coding Session Intensity", trackCount: 18 },
  { id: "p3", name: "Night Drive Vibes", trackCount: 35 },
  { id: "p4", name: "Deep Focus Flow", trackCount: 28 },
  { id: "p5", name: "Morning Energy Boost", trackCount: 22 },
  { id: "p6", name: "Cyberpunk Dreams", trackCount: 40 },
  { id: "p7", name: "Rainy Day Chill", trackCount: 31 },
  { id: "p8", name: "Underground EDM", trackCount: 55 },
  { id: "p9", name: "Soft Acoustic Nights", trackCount: 19 },
  { id: "p10", name: "Late Night Study", trackCount: 26 },
];

// --------------------
// SEED DATA (SONGS)
// --------------------
const SEED_SONGS: SongItem[] = [
  { id: "s1", title: "Midnight Pulse", artistName: "Neon Horizon", artistId: "user-1", albumName: "Synth City", albumId: "alb-sc2", listeners: 1200000, releaseDate: "2026-06-01" },
  { id: "s2", title: "Ethereal Echoes", artistName: "Luna Eclipse", artistId: "art-le3", listeners: 85000, releaseDate: "2025-12-15" },
  { id: "s3", title: "Cosmic Drift", artistName: "Neon Horizon", artistId: "user-1", listeners: 45000, releaseDate: "2026-02-10" },
  { id: "s4", title: "Digital Rain", artistName: "Binary Soul", artistId: "art-bs9", listeners: 320000, releaseDate: "2026-01-12" },
  { id: "s5", title: "Static Hearts", artistName: "Glitch Fox", artistId: "art-gf4", listeners: 540000, releaseDate: "2026-03-02" },
  { id: "s6", title: "Orbiting Silence", artistName: "Orbit Theory", artistId: "art-ot4", listeners: 610000, releaseDate: "2026-05-18" },
  { id: "s7", title: "Neon Skies", artistName: "Void Runner", artistId: "art-vr7", listeners: 980000, releaseDate: "2025-10-09" },
  { id: "s8", title: "Lost Frequency", artistName: "Dusk Signal", artistId: "art-ds6", listeners: 210000, releaseDate: "2026-04-04" },
  { id: "s9", title: "Frozen Code", artistName: "Cloud Atlas", artistId: "art-ca2", listeners: 430000, releaseDate: "2026-02-28" },
  { id: "s10", title: "Broken Signal", artistName: "Static Bloom", artistId: "art-sb5", listeners: 370000, releaseDate: "2026-06-10" },
];

// --------------------
// USERS
// --------------------
export function getUsers(): User[] {
  const data = localStorage.getItem(USERS_KEY);

  if (!data) {
    localStorage.setItem(USERS_KEY, JSON.stringify(SEED_USERS));
    return SEED_USERS;
  }

  return JSON.parse(data).map((user: any) => ({
    ...user,
    createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
    birthDate: user.birthDate ? new Date(user.birthDate) : undefined,
  }));
}

export function saveUsers(users: User[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// --------------------
// ALBUMS
// --------------------
export function getAlbums(): AlbumItem[] {
  const data = localStorage.getItem(ALBUMS_KEY);

  if (!data) {
    localStorage.setItem(ALBUMS_KEY, JSON.stringify(SEED_ALBUMS));
    return SEED_ALBUMS;
  }

  return JSON.parse(data);
}

export function saveAlbums(albums: AlbumItem[]): void {
  localStorage.setItem(ALBUMS_KEY, JSON.stringify(albums));
}

// --------------------
// PLAYLISTS
// --------------------
export function getPlaylists(): PlaylistItem[] {
  const data = localStorage.getItem(PLAYLISTS_KEY);

  if (!data) {
    localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(SEED_PLAYLISTS));
    return SEED_PLAYLISTS;
  }

  return JSON.parse(data);
}

export function savePlaylists(playlists: PlaylistItem[]): void {
  localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
}

// --------------------
// SONGS
// --------------------
export function getSongs(): SongItem[] {
  const data = localStorage.getItem(SONGS_KEY);

  if (!data) {
    localStorage.setItem(SONGS_KEY, JSON.stringify(SEED_SONGS));
    return SEED_SONGS;
  }

  return JSON.parse(data);
}

export function saveSongs(songs: SongItem[]): void {
  localStorage.setItem(SONGS_KEY, JSON.stringify(songs));
}

// --------------------
// ARTIST APPLICATION TICKETS
// --------------------
export function getApplicaitonTickets(): ArtistApplicationTicket[] {
  const data = localStorage.getItem(ARTIST_TICKET_KEY);

  if (!data) return [];

  return JSON.parse(data).map((t: any) => ({
    ...t,
    submittedAt: t.submittedAt ? new Date(t.submittedAt) : new Date(),
  }));
}

export function saveApplicationTickets(
  tickets: ArtistApplicationTicket[]
): void {
  localStorage.setItem(ARTIST_TICKET_KEY, JSON.stringify(tickets));
}

// --------------------
// OTPS
// --------------------
export function getOtps(): OtpEntry[] {
  const data = localStorage.getItem(OTPS_KEY);

  if (!data) return [];

  return JSON.parse(data);
}

export function saveOtps(otps: OtpEntry[]): void {
  localStorage.setItem(OTPS_KEY, JSON.stringify(otps));
}