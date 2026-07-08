import {
  UserProfile,
  ArtistApplicationTicket,
  AlbumItem,
  PlaylistItem,
  SongItem,
  OtpEntry,
  SupportTicketLocal,
  AuditingRecord,
  Notifications,
  SubscriptionTier
} from "@/types";

// Database Keys
const USERS_KEY = "app_users";
const ALBUMS_KEY = "app_albums";
const SONGS_KEY = "app_songs";
const PLAYLISTS_KEY = "app_playlists";
const ARTIST_TICKET_KEY = "app_artist_tickets";
const OTPS_KEY = "app_otps";
const SUPPORT_TICKET_KEY = "app_support_tickets";
const AUDITING_KEY = "app_auditing_records";
const NOTIFICATIONS_KEY = "app_notifications";
const SUBSCRIPTIONS_KEY = "app_subsriptions";

export type User = UserProfile & {
  password: string;
};

// --------------------
// SEED DATA (USERS)
// --------------------
const SEED_USERS: User[] = [
  {
    id: "user-admin",
    email: "admin@gmail.com",
    username: "system_admin",
    displayName: "Admin Controller",
    profilePictureUrl: undefined,
    role: "admin",
    subscriptionType: "gold",
    createdAt: new Date(),
    password: "Admin_1234",
    followers: [],
    following: [],
    listenerProfile: { 
      playlists: [],
      likedTracks: [],
      recentlyPlayed: ["p1", "p6", "p5", "p7"],
      dailyStreams: 0,
      lastStreamDate: new Date()
    },
  },
  {
    id: "user-supporter",
    email: "support@gmail.com",
    username: "support_hero",
    displayName: "Support Staff",
    profilePictureUrl: undefined,
    role: "supporter",
    subscriptionType: "gold",
    createdAt: new Date(),
    password: "Support_1234",
    followers: [],
    following: [],
    listenerProfile: { 
      playlists: [],
      likedTracks: [],
      recentlyPlayed: ["p1", "p6", "p5", "p7"],
      dailyStreams: 0,
      lastStreamDate: new Date()
    },
  },
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
    followers: ["user-2"],
    following: [],
    listenerProfile: { 
      playlists: [],
      likedTracks: [],
      recentlyPlayed: ["p1", "p6", "p5", "p7"],
      dailyStreams: 0,
      lastStreamDate: new Date()
    },
    artistProfile: {
      bio: "Electronic music producer",
      verificationStatus: "approved",
      singles: ["s2"],
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
    listenerProfile: { playlists: ["p1", "p5", "p6", "p7"],
    likedTracks: [],
    recentlyPlayed: ["p1", "p6", "p5", "p7"],
    dailyStreams: 0,
    lastStreamDate: new Date() },
  },
];

// --------------------
// SEED DATA (ALBUMS)
// --------------------
const SEED_ALBUMS: AlbumItem[] = [
  { id: "a1", name: "Velvet Dreams", artistName: "Alex Carter", artistId: "user-1", listeners: 450000, releaseDate: "2026-04-12", songList: ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9", "s10"], imageUrl:"/covers/pic2.jpg", genre: "Hip Hop" },
  { id: "a2", name: "Hyperdrive", artistName: "Glitch Fox", artistId: "art-gf4", listeners: 890000, releaseDate: "2026-05-20", songList: ["s2"], imageUrl:"/covers/pic12.png" },
  { id: "a3", name: "Midnight Aurora", artistName: "Luna Eclipse", artistId: "art-le3", listeners: 1200000, releaseDate: "2025-11-10", songList: ["s3", "s4", "s5"], imageUrl:"/covers/pic3.png" },
  { id: "a4", name: "Solar Drift", artistName: "Neon Horizon", artistId: "user-14", listeners: 670000, releaseDate: "2026-01-08", songList: [], imageUrl: "/covers/pic15.jpg" },
  { id: "a5", name: "Divinity Original Sin II OST", artistName: "Borislav Slavov", artistId: "art-bs9", listeners: 340000, releaseDate: "2026-03-15", songList: ["s12", "s13"], imageUrl:"/covers/pic5.jpg" },
  { id: "a6", name: "Dreamstate", artistName: "Cloud Atlas", artistId: "art-ca2", listeners: 510000, releaseDate: "2026-02-22", songList: ["s9"], imageUrl:"/covers/pic14.jpg" },
  { id: "a7", name: "Neon Abyss", artistName: "Void Runner", artistId: "art-vr7", listeners: 980000, releaseDate: "2025-09-30", songList: ["s10"] },
  { id: "a8", name: "Fragments", artistName: "Static Bloom", artistId: "art-sb5", listeners: 230000, releaseDate: "2026-06-01", songList: ["s10", "s9"], imageUrl:"/covers/pic7.png" },
  { id: "a9", name: "Quantum Lullabies", artistName: "Orbit Theory", artistId: "art-ot4", listeners: 760000, releaseDate: "2026-04-28", songList: ["s8"], imageUrl:"/covers/pic13.jpg" },
  { id: "a10", name: "Afterlight", artistName: "Dusk Signal", artistId: "art-ds6", listeners: 410000, releaseDate: "2025-12-19", songList: ["s6"] },
];

// --------------------
// SEED DATA (PLAYLISTS)
// --------------------
const SEED_PLAYLISTS: PlaylistItem[] = [
  { id: "p1", name: "Chill Lo-Fi Beats", ownerId: "user-2", isPrivate: false, songList: ["s1", "s2", "s3"], imageUrl: "/covers/pic4.jpg" },
  { id: "p2", name: "Coding Session Intensity", ownerId: "user-2", songList: ["s4", "s5"], imageUrl: "/covers/pic16.jpg" },
  { id: "p3", name: "Night Drive Vibes", ownerId: "user-2", songList: ["s6", "s7", "s8"], imageUrl: "/covers/pic17.jpg" },
  { id: "p4", name: "Deep Focus Flow", ownerId: "user-2", songList: ["s9", "s10"], imageUrl: "/covers/pic18.jpg" },
  { id: "p5", name: "Morning Energy Boost", ownerId: "user-2", songList: ["s1", "s5", "s9"], imageUrl:"/covers/pic9.jpg" },
  { id: "p6", name: "Cyberpunk Vibes", ownerId: "user-2", songList: ["s3", "s6", "s10"], imageUrl:"/covers/pic8.png" },
  { id: "p7", name: "Rainy Day Chill", ownerId: "user-2", songList: ["s2", "s8"], imageUrl:"/covers/pic10.png" },
  { id: "p8", name: "Underground EDM", ownerId: "user-2", songList: ["s4", "s5", "s6", "s7"] },
  { id: "p9", name: "Soft Acoustic Nights", ownerId: "user-2", songList: ["s1", "s2"], imageUrl:"/covers/pic19.jpg" },
  { id: "p10", name: "Late Night Study", ownerId: "user-1", songList: ["s9", "s10", "s3"] },
];

// --------------------
// SEED DATA (SONGS)
// --------------------
const SEED_SONGS: SongItem[] = [
  { id: "s1", title: "Midnight Pulse", artistName: "Alex Carter", artistId: "user-1", albumName: "Velvet Dreams", albumId: "a1", streams: 1200000, releaseDate: "2026-06-01", songDurationMs: 155000, audioUrl: "/midnight-pulse.mp3" },
  { id: "s2", title: "Ethereal Echoes", artistName: "Luna Eclipse", artistId: "user-1", albumName: "Midnight Aurora", albumId: "a3", streams: 85000, releaseDate: "2025-12-15", songDurationMs: 272000, audioUrl: "/etheral-echoes.mp3", genre: "Ambient",
    lyrics: "I hear the night breathe through the walls\nA silver shimmer as silence falls\nYour voice returns like distant fire\nA fading spark that climbs higher\n\nCity lights dissolve to haze\nLost inside a dreamlike maze\nEvery shadow starts to speak\nCalling softly, bittersweet"
  },
  { id: "s3", title: "Cosmic Drift", artistName: "Alex Carter", artistId: "user-1", albumName: "Velvet Dreams", albumId: "a1", streams: 45000, releaseDate: "2026-02-10", songDurationMs: 196000 },
  { id: "s4", title: "Digital Rain", artistName: "Binary Soul", artistId: "art-bs9", albumName: "Echoes of Code", albumId: "a5", streams: 320000, releaseDate: "2026-01-12", songDurationMs: 231000 },
  { id: "s5", title: "Static Hearts", artistName: "Glitch Fox", artistId: "art-gf4", albumName: "Hyperdrive", albumId: "a2", streams: 540000, releaseDate: "2026-03-02", songDurationMs: 221000 },
  { id: "s6", title: "Orbiting Silence", artistName: "Orbit Theory", artistId: "art-ot4", albumName: "Quantum Lullabies", albumId: "a9", streams: 610000, releaseDate: "2026-05-18", songDurationMs: 258000 },
  { id: "s7", title: "Neon Skies", artistName: "Void Runner", artistId: "art-vr7", albumName: "Neon Abyss", albumId: "a7", streams: 980000, releaseDate: "2025-10-09", songDurationMs: 205000 },
  { id: "s8", title: "Lost Frequency", artistName: "Dusk Signal", artistId: "art-ds6", albumName: "Afterlight", albumId: "a10", streams: 210000, releaseDate: "2026-04-04", songDurationMs: 239000 },
  { id: "s9", title: "Frozen Code", artistName: "Cloud Atlas", artistId: "art-ca2", albumName: "Dreamstate", albumId: "a6", streams: 430000, releaseDate: "2026-02-28", songDurationMs: 226000 },
  { id: "s10", title: "Broken Signal", artistName: "Static Bloom", artistId: "art-sb5", albumName: "Fragments", albumId: "a8", streams: 370000, releaseDate: "2026-06-10", songDurationMs: 244000 },
  { id: "s11", title: "Chill Out", artistName: "Alex Carter", artistId: "art-sb5", albumName: "Fragments", albumId: "a8", streams: 370000, releaseDate: "2026-06-10", songDurationMs: 244000 },
  { id: "s12", title: "Divinity - Original Sin 2 (Main Theme)", artistName: "Borislav Slavov", artistId: "art-bs9", albumName: "Divinity Original Sin II OST", albumId: "a5", streams: 239000, releaseDate: "2026-06-10", songDurationMs: 239000, audioUrl: "/songs/01. Divinity - Original Sin 2 (Main Theme).mp3" },
  { id: "s13", title: "Sing for Me (Lohne's Theme) (Bobby's Version)", artistName: "Borislav Slavov", artistId: "art-bs9", albumName: "Divinity Original Sin II OST", albumId: "a5", streams: 174000, releaseDate: "2026-06-10", songDurationMs: 174000, audioUrl: "/songs/Sing_for_Me_(Lohne's_Theme)(Bobby's_Version).mp3" },
  
];

// --------------------
// SEED DATA (OPERATIONAL SUPPORT TIERS)
// --------------------
const SEED_TICKETS: SupportTicketLocal[] = [
  { 
    id: 'TKT-8041', username: 'jane_doe', subject: 'Cannot access my gold features', dateSubmitted: '2026-07-03', status: 'Open', 
    messages: [{ id: 'm1', senderId: 'user-2', senderName: 'jane_doe', senderRole: 'user', content: 'Hi, I upgraded to Gold yesterday but I still see ads?', timestamp: '2026-07-03 10:00 AM' }] 
  },
  { 
    id: 'TKT-8042', username: 'alex99', subject: 'Royalties calculation inquiry', dateSubmitted: '2026-07-02', status: 'Replied', 
    messages: [
      { id: 'm1', senderId: 'user-1', senderName: 'alex99', senderRole: 'user', content: 'When do we get the payout for June?', timestamp: '2026-07-02 09:00 AM' },
      { id: 'm2', senderId: 'support_hero', senderName: 'Support Team', senderRole: 'support', content: 'Payouts are processed on the 5th of every month.', timestamp: '2026-07-02 11:30 AM' }
    ] 
  },
];

const SEED_AUDITING: AuditingRecord[] = [
  { id: 'aud1', artistName: 'Neon Horizon', artistId: 'user-1', uniqueListeners: 45000, totalStreams: 1200000, calculatedReward: 3450.00, paymentStatus: 'Pending Payment' },
  { id: 'aud2', artistName: 'The Soft Tones', artistId: 'art-st1', uniqueListeners: 12000, totalStreams: 450000, calculatedReward: 1250.50, paymentStatus: 'Settled' },
];

const SEED_ARTIST_TICKETS: ArtistApplicationTicket[] = [
  { id: 'v1', userId: 'user-1', email: 'contact@neonhorizon.com', artisticName: 'Neon Horizon', samples: ['https://link.to/track1', 'https://link.to/track2'], verificationStatus: 'pending', submittedAt: new Date('2026-07-01') },
  { id: 'v2', userId: 'user-new', email: 'mgmt@thesofttones.com', artisticName: 'The Soft Tones', samples: ['https://link.to/demo1'], verificationStatus: 'pending', submittedAt: new Date('2026-07-02') },
];

const SEED_SUBSCRIPTIONS: SubscriptionTier[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: '$0',
    period: 'forever',
    features: [
        { text: 'Daily stream limit: 60', included: true },
        { text: 'Playlist limit: 6', included: true },
        { text: 'Add profile picture', included: false },
        { text: 'Download songs', included: false },
        { text: 'Early access to new songs', included: false },
        { text: 'View song stats & analytics', included: false },
    ]
    },

    {
    id: 'silver',
    name: 'Silver',
    price: '$4.99',
    period: 'mo',
    features: [
        { text: 'Unlimited daily streaming', included: true },
        { text: 'Playlist limit: 100', included: true },
        { text: 'Add profile picture', included: true },
        { text: 'Download songs', included: true },
        { text: 'Early access to new songs', included: false },
        { text: 'View song stats & analytics', included: false },
    ],
    },

    {
    id: 'gold',
    name: 'Gold',
    price: '$9.99',
    period: 'mo',
    features: [
        { text: 'Unlimited daily streaming', included: true },
        { text: 'Unlimited playlist layout', included: true },
        { text: 'Add profile picture', included: true },
        { text: 'Download songs', included: true },
        { text: 'Early access to new songs', included: true },
        { text: 'View song stats & analytics', included: true },
    ],
    },
]

// --------------------
// CORE DB MANAGEMENT METHODS
// --------------------
function enrichSongsWithAlbumImages(songs: SongItem[], albums: AlbumItem[]): SongItem[] {
  return songs.map((song) => {
    const album = albums.find((a) => a.id === song.albumId);
    return { ...song, imageUrl: album?.imageUrl ?? song.imageUrl };
  });
}

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

export function getSongs(): SongItem[] {
  const data = localStorage.getItem(SONGS_KEY);
  const albums = getAlbums();
  if (!data) {
    const enriched = enrichSongsWithAlbumImages(SEED_SONGS, albums);
    localStorage.setItem(SONGS_KEY, JSON.stringify(enriched));
    return enriched;
  }
  return enrichSongsWithAlbumImages(JSON.parse(data), albums);
}

export function saveSongs(songs: SongItem[]): void {
  localStorage.setItem(SONGS_KEY, JSON.stringify(songs));
}

export function getApplicaitonTickets(): ArtistApplicationTicket[] {
  const data = localStorage.getItem(ARTIST_TICKET_KEY);
  if (!data) {
    localStorage.setItem(ARTIST_TICKET_KEY, JSON.stringify(SEED_ARTIST_TICKETS));
    return SEED_ARTIST_TICKETS;
  }
  return JSON.parse(data).map((t: any) => ({
    ...t,
    submittedAt: t.submittedAt ? new Date(t.submittedAt) : new Date(),
  }));
}

export function saveApplicationTickets(tickets: ArtistApplicationTicket[]): void {
  localStorage.setItem(ARTIST_TICKET_KEY, JSON.stringify(tickets));
}

export function getOtps(): OtpEntry[] {
  const data = localStorage.getItem(OTPS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveOtps(otps: OtpEntry[]): void {
  localStorage.setItem(OTPS_KEY, JSON.stringify(otps));
}

export function getSupportTickets(): SupportTicketLocal[] {
  const data = localStorage.getItem(SUPPORT_TICKET_KEY);
  if (!data) {
    localStorage.setItem(SUPPORT_TICKET_KEY, JSON.stringify(SEED_TICKETS));
    return SEED_TICKETS;
  }
  return JSON.parse(data);
}

export function saveSupportTickets(tickets: SupportTicketLocal[]): void {
  localStorage.setItem(SUPPORT_TICKET_KEY, JSON.stringify(tickets));
}

export function getAuditingRecords(): AuditingRecord[] {
  const data = localStorage.getItem(AUDITING_KEY);
  if (!data) {
    localStorage.setItem(AUDITING_KEY, JSON.stringify(SEED_AUDITING));
    return SEED_AUDITING;
  }
  return JSON.parse(data);
}

export function saveAuditingRecords(records: AuditingRecord[]): void {
  localStorage.setItem(AUDITING_KEY, JSON.stringify(records));
}

export function getSongsByCollectionSource(type: 'album' | 'playlist', id: string): SongItem[] {
  const allSongs = getSongs();
  const albums = getAlbums();

  if (type === 'album') {
    const album = albums.find(a => a.id === id);
    if (!album) return [];
    const songs = album.songList.map(sId => allSongs.find(s => s.id === sId)).filter((s): s is SongItem => !!s);
    return enrichSongsWithAlbumImages(songs, albums);
  }

  if (type === 'playlist') {
    const playlist = getPlaylists().find(p => p.id === id);
    if (!playlist) return [];
    const songs = playlist.songList.map(sId => allSongs.find(s => s.id === sId)).filter((s): s is SongItem => !!s);
    return enrichSongsWithAlbumImages(songs, albums);
  }
  return [];
}

export function getSiblingSongsByAlbumId(albumId: string): SongItem[] {
  return getSongs().filter(s => s.albumId === albumId);
}

export function getNotifications(): Notifications[] {
  const data = localStorage.getItem(NOTIFICATIONS_KEY);
  if (!data) {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify([]));
    return [];
  }
  return JSON.parse(data);
}

export function saveNotifications(notifs: Notifications[]): void {
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifs));
}

export function getSubscriptions(): SubscriptionTier[] {
  const data = localStorage.getItem(SUBSCRIPTIONS_KEY);
  if (!data) {
    localStorage.setItem(SUBSCRIPTIONS_KEY, JSON.stringify(SEED_SUBSCRIPTIONS));
    return SEED_SUBSCRIPTIONS;
  }
  return JSON.parse(data);
}

export function saveSubscriptions(records: SubscriptionTier[]): void {
  localStorage.setItem(SUBSCRIPTIONS_KEY, JSON.stringify(records));
}

export function deleteReleaseAndSongs(releaseId: string): void {
  
  const songsToDelete = getSongs().filter(
    song => song.albumId === releaseId
  );

  const deletedSongIds = new Set(songsToDelete.map(song => song.id));

  saveAlbums(
    getAlbums().filter(album => album.id !== releaseId)
  );
  saveSongs(
    getSongs().filter(song => song.albumId !== releaseId)
  );

  // Remove deleted songs from every playlist
  const updatedPlaylists = getPlaylists().map(playlist => ({
    ...playlist,
    songList: playlist.songList.filter(
      id => !deletedSongIds.has(id)
    ),
  }));

  savePlaylists(updatedPlaylists);
}