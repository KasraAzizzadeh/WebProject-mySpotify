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

    listenerProfile: {
      playlists: [],
      likedTracks: [],
      recentlyPlayed: ["p1"],
    },

    artistProfile: {
      bio: "Electronic music producer",
      verificationStatus: "pending",
      singles: ["s1", "s3"],
      albums: ["a1"],
      totalStreams: 120000,
      uniqueListener: 8200,
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
      playlists: ["p1", "p5", "p6"],
      likedTracks: [],
      recentlyPlayed: ["p1"],
    },
  },
];

// --------------------
// SEED DATA (ALBUMS)
// --------------------
const SEED_ALBUMS: AlbumItem[] = [
  { id: "a1", name: "Velvet Dreams", artistName: "The Soft Tones", artistId: "art-st1", listeners: 450000, releaseDate: "2026-04-12", songList: ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9", "s10"], imageUrl:"/pic2.jpg" },
  { id: "a2", name: "Hyperdrive", artistName: "Glitch Fox", artistId: "art-gf4", listeners: 890000, releaseDate: "2026-05-20", songList: ["s2"], },
  { id: "a3", name: "Midnight Aurora", artistName: "Luna Eclipse", artistId: "art-le3", listeners: 1200000, releaseDate: "2025-11-10", songList: ["s4", "s5"] },
  { id: "a4", name: "Solar Drift", artistName: "Neon Horizon", artistId: "user-1", listeners: 670000, releaseDate: "2026-01-08", songList: [] },
  { id: "a5", name: "Echoes of Code", artistName: "Binary Soul", artistId: "art-bs9", listeners: 340000, releaseDate: "2026-03-15", songList: ["s7"] },
  { id: "a6", name: "Dreamstate", artistName: "Cloud Atlas", artistId: "art-ca2", listeners: 510000, releaseDate: "2026-02-22", songList: ["s9"] },
  { id: "a7", name: "Neon Abyss", artistName: "Void Runner", artistId: "art-vr7", listeners: 980000, releaseDate: "2025-09-30", songList: ["s10"]},
  { id: "a8", name: "Fragments", artistName: "Static Bloom", artistId: "art-sb5", listeners: 230000, releaseDate: "2026-06-01", songList: [] },
  { id: "a9", name: "Quantum Lullabies", artistName: "Orbit Theory", artistId: "art-ot4", listeners: 760000, releaseDate: "2026-04-28", songList: ["s8"] },
  { id: "a10", name: "Afterlight", artistName: "Dusk Signal", artistId: "art-ds6", listeners: 410000, releaseDate: "2025-12-19", songList: ["s6"] },
];

// --------------------
// SEED DATA (PLAYLISTS)
// --------------------
const SEED_PLAYLISTS: PlaylistItem[] = [
  { id: "p1", name: "Chill Lo-Fi Beats", ownerId: "user-2", isPrivate: false, songList: ["s1", "s2", "s3"], imageUrl:"/pic4.jpg"  },
  { id: "p2", name: "Coding Session Intensity", ownerId: "user-2", songList: ["s4", "s5"] },
  { id: "p3", name: "Night Drive Vibes", ownerId: "user-2", songList: ["s6", "s7", "s8"] },
  { id: "p4", name: "Deep Focus Flow", ownerId: "user-2", songList: ["s9", "s10"] },
  { id: "p5", name: "Morning Energy Boost", ownerId: "user-2", songList: ["s1", "s5", "s9"] },
  { id: "p6", name: "Cyberpunk Dreams", ownerId: "user-2", songList: ["s3", "s6", "s10"] },
  { id: "p7", name: "Rainy Day Chill", ownerId: "user-2", songList: ["s2", "s8"] },
  { id: "p8", name: "Underground EDM", ownerId: "user-2", songList: ["s4", "s5", "s6", "s7"] },
  { id: "p9", name: "Soft Acoustic Nights", ownerId: "user-2", songList: ["s1", "s2"] },
  { id: "p10", name: "Late Night Study", ownerId: "user-1", songList: ["s9", "s10", "s3"] },
];

// --------------------
// SEED DATA (SONGS)
// --------------------
const SEED_SONGS: SongItem[] = [
  { id: "s1", title: "Midnight Pulse", artistName: "Neon Horizon", artistId: "user-1", albumName: "Velvet Dreams", albumId: "a1", streams: 1200000, releaseDate: "2026-06-01", songDurationMs: 213000 },
  { id: "s2", title: "Ethereal Echoes", artistName: "Luna Eclipse", artistId: "art-le3", albumName: "Midnight Aurora", albumId: "a3", streams: 85000, releaseDate: "2025-12-15", songDurationMs: 247000 },
  { id: "s3", title: "Cosmic Drift", artistName: "Neon Horizon", artistId: "user-1", albumName: "Velvet Dreams", albumId: "a1", streams: 45000, releaseDate: "2026-02-10", songDurationMs: 196000 },
  { id: "s4", title: "Digital Rain", artistName: "Binary Soul", artistId: "art-bs9", albumName: "Echoes of Code", albumId: "a5", streams: 320000, releaseDate: "2026-01-12", songDurationMs: 231000 },
  { id: "s5", title: "Static Hearts", artistName: "Glitch Fox", artistId: "art-gf4", albumName: "Hyperdrive", albumId: "a2", streams: 540000, releaseDate: "2026-03-02", songDurationMs: 221000 },
  { id: "s6", title: "Orbiting Silence", artistName: "Orbit Theory", artistId: "art-ot4", albumName: "Quantum Lullabies", albumId: "a9", streams: 610000, releaseDate: "2026-05-18", songDurationMs: 258000 },
  { id: "s7", title: "Neon Skies", artistName: "Void Runner", artistId: "art-vr7", albumName: "Neon Abyss", albumId: "a7", streams: 980000, releaseDate: "2025-10-09", songDurationMs: 205000 },
  { id: "s8", title: "Lost Frequency", artistName: "Dusk Signal", artistId: "art-ds6", albumName: "Afterlight", albumId: "a10", streams: 210000, releaseDate: "2026-04-04", songDurationMs: 239000 },
  { id: "s9", title: "Frozen Code", artistName: "Cloud Atlas", artistId: "art-ca2", albumName: "Dreamstate", albumId: "a6", streams: 430000, releaseDate: "2026-02-28", songDurationMs: 226000 },
  { id: "s10", title: "Broken Signal", artistName: "Static Bloom", artistId: "art-sb5", albumName: "Fragments", albumId: "a8", streams: 370000, releaseDate: "2026-06-10", songDurationMs: 244000 },
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