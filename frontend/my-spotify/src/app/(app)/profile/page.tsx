'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { getUsers, saveUsers, User } from '@/store/mockDb';
import Avatar from '@/components/ui/Avatar';
import SongCard from '@/components/SongCard';
import AlbumCard from '@/components/AlbumCard';

export default function ProfilePage() {
  
  const { user: authUser } = useAuth();
  
  const [dbUser, setDbUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form input track states
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [bioText, setBioText] = useState('');

  // 1. Fetch data directly from mockDB on mount/auth load
  useEffect(() => {
    if (authUser?.id) {
      const allUsers: User[] = getUsers();
      const freshUser = allUsers.find((u: User) => u.id === authUser.id);
      
      if (freshUser) {
        setDbUser(freshUser);
        setDisplayName(freshUser.displayName);
        setEmail(freshUser.email);
        
        // Directly maps the database nested bio structure to state
        setBioText(freshUser.artistProfile?.bio || '');
      }
    }
  }, [authUser?.id]);

  // 2. Safely merge modifications and write to mockDB
  const handleSave = () => {
    if (!dbUser) return;

    const allUsers: User[] = getUsers();
    const updatedUsers = allUsers.map((u: User) => {
      if (u.id === dbUser.id) {
        return {
          ...u,
          displayName,
          email,
          artistProfile: u.role === 'artist' 
            ? {
                ...(u.artistProfile || { isVerified: false, totalStreams: 0, followersCount: 0 }),
                bio: bioText
              } 
            : u.artistProfile
        };
      }
      return u;
    });

    // Commit changes straight to data layers
    saveUsers(updatedUsers);
    
    // Refresh local memory state instantly
    const refreshedUser = updatedUsers.find((u: User) => u.id === dbUser.id) || null;
    setDbUser(refreshedUser);
    setIsEditing(false);
  };

  // Loading barrier while async structures resolve hydration
  if (!dbUser) {
    return (
      <div className="h-screen flex items-center justify-center text-neutral-500 text-sm tracking-wide">
        Fetching profile data...
      </div>
    );
  }

  // Derive metrics strictly out of the database data fields
  const followingCount = dbUser.listenerProfile?.followingArtists?.length || 0;
  const followersCount = dbUser.role === 'artist' ? (dbUser.artistProfile?.followersCount || 0) : 15;
  const dailyStreams = 142;
  const totalStreams = dbUser.artistProfile?.totalStreams || 0;
  const totalListeners = dbUser.role === 'artist' ? Math.floor(totalStreams * 0.45) : 0;

  // Track feeds mapping arrays
  const mockArtistSongs = [
    { id: 's1', title: 'Midnight Pulse', artistName: dbUser.displayName, artistId: dbUser.id, listeners: 1200000, releaseDate: '2026-06-01' },
    { id: 's3', title: 'Cosmic Drift', artistName: dbUser.displayName, artistId: dbUser.id, listeners: 45000, releaseDate: '2026-02-10' }
  ];

  const mockArtistAlbums = [
    { id: 'a1', name: 'Velvet Dreams', artistName: dbUser.displayName, artistId: dbUser.id, listeners: 450000, releaseDate: '2026-04-12' }
  ];

  return (
    <main className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      
      {/* Profile Header Visual Card */}
      <section className="bg-neutral-900/50 border border-neutral-800/60 rounded-3xl p-6 md:p-10 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden backdrop-blur-sm">
        <div className="relative group flex-shrink-0">
          <Avatar src={dbUser.profilePictureUrl} alt={dbUser.displayName} size={120} />
        </div>

        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
            <span className="text-xs uppercase font-bold tracking-widest text-neutral-400 flex items-center gap-1">
              {dbUser.role} Profile 
              {dbUser.role === 'artist' && dbUser.artistProfile?.isVerified && (
                <span className="text-blue-400 text-sm" title="Verified Creator Account">🔹</span>
              )}
            </span>
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-sm uppercase ${
              dbUser.subscriptionType === 'gold' ? 'bg-amber-500 text-black' : 'bg-neutral-700 text-neutral-300'
            }`}>
              {dbUser.subscriptionType}
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">{dbUser.displayName}</h1>
          <p className="text-neutral-400 font-medium">@{dbUser.username}</p>
        </div>

        <div className="w-full md:w-auto flex justify-center mt-4 md:mt-0">
          <button 
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all ${
              isEditing ? 'bg-green-500 text-black hover:bg-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'bg-neutral-800 text-white hover:bg-neutral-700 border border-neutral-700'
            }`}
          >
            {isEditing ? 'Save Changes' : 'Edit Profile'}
          </button>
        </div>
      </section>

      {/* Statistics Analytical Grid */}
      <section className={`grid grid-cols-1 gap-4 ${dbUser.role === 'artist' ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
        <div className="bg-neutral-900/40 border border-neutral-800/50 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-bold text-white">{followersCount.toLocaleString()}</span>
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider mt-1">Followers</span>
        </div>
        {dbUser.role === 'artist' ? (
          <>
            <div className="bg-neutral-900/40 border border-neutral-800/50 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-bold text-white">{totalListeners.toLocaleString()}</span>
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider mt-1">Monthly Listeners</span>
            </div>
            <div className="bg-neutral-900/40 border border-neutral-800/50 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-bold text-green-400">{totalStreams.toLocaleString()}</span>
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider mt-1">Total Streams</span>
            </div>
          </>
        ) : (
          <div className="bg-neutral-900/40 border border-neutral-800/50 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-bold text-white">{followingCount}</span>
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider mt-1">Following</span>
          </div>
        )}
        <div className="bg-neutral-900/40 border border-neutral-800/50 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-bold text-white">{dailyStreams}</span>
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider mt-1">Daily Streams</span>
        </div>
      </section>

      {/* Information Inputs Management Form Section */}
      <section className="bg-neutral-900/30 border border-neutral-800/50 p-6 md:p-8 rounded-3xl space-y-6">
        <h2 className="text-xl font-bold text-white tracking-tight">Personal Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Display Name</label>
            {isEditing ? (
              <input 
                type="text" 
                value={displayName} 
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500 transition-colors text-sm"
              />
            ) : (
              <div className="bg-neutral-950/50 border border-neutral-800/50 rounded-lg px-4 py-3 text-white text-sm">{dbUser.displayName}</div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Email Address</label>
            {isEditing ? (
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500 transition-colors text-sm"
              />
            ) : (
              <div className="bg-neutral-950/50 border border-neutral-800/50 rounded-lg px-4 py-3 text-white text-sm">{dbUser.email}</div>
            )}
          </div>
        </div>

        {/* The Artist Biography Row */}
        {dbUser.role === 'artist' && (
          <div className="space-y-2 pt-2">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Artist Biography</label>
            {isEditing ? (
              <textarea 
                value={bioText}
                onChange={(e) => setBioText(e.target.value)}
                rows={4}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500 transition-colors resize-none text-sm"
              />
            ) : (
              <div className="bg-neutral-950/50 border border-neutral-800/50 rounded-lg px-4 py-3 text-neutral-300 text-sm leading-relaxed whitespace-pre-wrap">
                {dbUser.artistProfile?.bio || 'No biography provided yet.'}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Catalogues display rows for Artist roles */}
      {dbUser.role === 'artist' && (
        <section className="space-y-8">
          <div className="space-y-3">
            <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">Released Singles</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {mockArtistSongs.map((song) => (
                <SongCard key={song.id} song={song} subscriptionType={dbUser.subscriptionType} />
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">Studio Albums</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {mockArtistAlbums.map((album) => (
                <AlbumCard key={album.id} album={album} />
              ))}
            </div>
          </div>
        </section>
      )}

    </main>
  );
}