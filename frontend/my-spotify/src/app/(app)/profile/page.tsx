'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getUsers, User } from '@/store/mockDb';
import Avatar from '@/components/ui/Avatar';
import SongCard from '@/components/SongCard';
import AlbumCard from '@/components/AlbumCard';

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const searchParams = useSearchParams();
  
  const targetUserId = searchParams.get('id') || authUser?.id;
  const isOwnProfile = authUser?.id === targetUserId;

  const [dbUser, setDbUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  // Form Track States
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [bioText, setBioText] = useState('');

  // 1. Fetch Profile Data out of mockDb
  useEffect(() => {
    if (targetUserId) {
      const allUsers: User[] = getUsers();
      const freshUser = allUsers.find((u: User) => u.id === targetUserId);
      
      if (freshUser) {
        setDbUser(freshUser);
        setDisplayName(freshUser.displayName);
        setEmail(freshUser.email);
        setBioText(freshUser.artistProfile?.bio || '');

        // Determine if current logged-in user is present in this profile's followers array
        if (authUser?.id) {
          const followerList = freshUser.followers || [];
          setIsFollowing(followerList.includes(authUser.id));
        }
      }
    }
  }, [targetUserId, authUser?.id]);

  if (!dbUser) {
    return (
      <div className="h-screen flex items-center justify-center text-neutral-500 text-sm tracking-wide">
        Loading profile data...
      </div>
    );
  }

  // Derive counts directly from array tracking attributes
  const followersCount = dbUser.followers?.length || 0;
  const followingCount = dbUser.following?.length || 0;

  // Purely structural data rules
  const dailyStreams = 142;
  const totalStreams = dbUser.artistProfile?.totalStreams || 0;
  const shouldShowDailyStreams = isOwnProfile || dbUser.role === 'listener';

  const mockArtistSongs = [
    { id: 's1', title: 'Midnight Pulse', artistName: dbUser.displayName, artistId: dbUser.id, listeners: 1200000, releaseDate: '2026-06-01' },
    { id: 's3', title: 'Cosmic Drift', artistName: dbUser.displayName, artistId: dbUser.id, listeners: 45000, releaseDate: '2026-02-10' }
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
              {dbUser.role} 
              {dbUser.role === 'artist' && dbUser.artistProfile?.isVerified && (
                <span className="text-blue-400 text-sm">🔹</span>
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

        {/* Action Toggle State Item */}
        <div className="w-full md:w-auto flex justify-center mt-4 md:mt-0">
          {isOwnProfile ? (
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="px-6 py-2.5 rounded-full font-bold text-sm bg-neutral-800 text-white hover:bg-neutral-700 border border-neutral-700 transition"
            >
              {isEditing ? 'Close Editor' : 'Edit Profile'}
            </button>
          ) : (
            <button 
              onClick={() => setIsFollowing(!isFollowing)}
              className={`px-6 py-2.5 rounded-full font-bold text-sm transition ${
                isFollowing 
                  ? 'bg-neutral-800 text-white border border-neutral-600 hover:bg-neutral-700' 
                  : 'bg-green-500 text-black hover:bg-green-400'
              }`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
        </div>
      </section>

      {/* Statistics Dynamic Array Metric Grid */}
      <section className={`grid grid-cols-1 gap-4 ${
        dbUser.role === 'artist' && !shouldShowDailyStreams ? 'md:grid-cols-3' : 
        dbUser.role === 'artist' ? 'md:grid-cols-4' : 
        shouldShowDailyStreams ? 'md:grid-cols-3' : 'md:grid-cols-2'
      }`}>
        <div className="bg-neutral-900/40 border border-neutral-800/50 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-bold text-white">{followersCount}</span>
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider mt-1">Followers</span>
        </div>
        
        <div className="bg-neutral-900/40 border border-neutral-800/50 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-bold text-white">{followingCount}</span>
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider mt-1">Following</span>
        </div>

        {dbUser.role === 'artist' && (
          <div className="bg-neutral-900/40 border border-neutral-800/50 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-bold text-green-400">{totalStreams.toLocaleString()}</span>
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider mt-1">Total Streams</span>
          </div>
        )}

        {shouldShowDailyStreams && (
          <div className="bg-neutral-900/40 border border-neutral-800/50 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-bold text-white">{dailyStreams}</span>
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider mt-1">Daily Streams</span>
          </div>
        )}
      </section>

      {/* Profile Bio Details Field Element */}
      <section className="bg-neutral-900/30 border border-neutral-800/50 p-6 md:p-8 rounded-3xl space-y-6">
        <h2 className="text-xl font-bold text-white tracking-tight">Profile Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Display Name</label>
            {isOwnProfile && isEditing ? (
              <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-3 text-white text-sm" />
            ) : (
              <div className="bg-neutral-950/50 border border-neutral-800/50 rounded-lg px-4 py-3 text-white text-sm">{dbUser.displayName}</div>
            )}
          </div>
          {isOwnProfile && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Email Address</label>
              {isOwnProfile && isEditing ? (
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-3 text-white text-sm" />
              ) : (
                <div className="bg-neutral-950/50 border border-neutral-800/50 rounded-lg px-4 py-3 text-white text-sm">{dbUser.email}</div>
              )}
            </div>
          )}
        </div>

        {dbUser.role === 'artist' && (
          <div className="space-y-2 pt-2">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Artist Biography</label>
            {isOwnProfile && isEditing ? (
              <textarea value={bioText} onChange={(e) => setBioText(e.target.value)} rows={4} className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-3 text-white resize-none text-sm" />
            ) : (
              <div className="bg-neutral-950/50 border border-neutral-800/50 rounded-lg px-4 py-3 text-neutral-300 text-sm leading-relaxed whitespace-pre-wrap">
                {dbUser.artistProfile?.bio || 'No biography provided yet.'}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Discography Display Grid for Artist Roles */}
      {dbUser.role === 'artist' && (
        <section className="space-y-4">
          <h3 className="text-lg font-bold text-white tracking-tight">Discography</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {mockArtistSongs.map((song) => (
              <SongCard key={song.id} song={song} subscriptionType={dbUser.subscriptionType} />
            ))}
          </div>
        </section>
      )}

    </main>
  );
}