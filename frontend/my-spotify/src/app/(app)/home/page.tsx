'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { getDashboardData } from '@/services/homeService';
import { DashboardData, UserProfile } from '@/types';
import Avatar from '@/components/ui/Avatar';
import AlbumCard from '@/components/AlbumCard';
import SongCard from '@/components/SongCard';
import PlaylistCard from '@/components/PlaylistCard';
import Link from 'next/link';

export default function HomePage() {
  const { user: authUser } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);

  // Mock user if localstorage empty
  const user: UserProfile = authUser || {
    id: 'user-123',
    username: 'jam_session99',
    displayName: 'Alex Carter',
    email: 'alex.carter@gmail.com',
    profilePictureUrl: undefined,
    role: 'listener',
    subscriptionType: 'gold', 
  };

  useEffect(() => {
    getDashboardData(user.subscriptionType).then((res) => {
      setData(res);
    });
  }, [authUser, user.subscriptionType]);

  if (!data) {
    return (
      <div className="h-screen flex items-center justify-center text-neutral-500 text-sm tracking-wide">
        Loading music environment...
      </div>
    );
  }

  return (
    <main className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto relative">
      
      {/* Top Header Block */}
      <header className="sticky top-0 z-40 bg-neutral-900/80 backdrop-blur-md py-4 border-b border-neutral-800/40 -mx-4 px-4 md:-mx-8 md:px-8 transition-all duration-200 group">
        <Link 
          href="/profile" 
          className="flex items-center justify-between w-full bg-neutral-950/40 p-4 rounded-2xl border border-neutral-800/60 hover:bg-neutral-950/70 transition-all duration-200"
        >
          <div>
            <span className="text-xs uppercase font-semibold text-neutral-500 tracking-widest group-hover:text-neutral-400 transition-colors">
              Welcome Back ({user.role})
            </span>
            <h1 className="text-xl md:text-3xl font-bold text-white mt-0.5 group-hover:text-green-400 transition-colors">
              {user.displayName}
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            {user.subscriptionType === 'gold' && (
              <span className="hidden sm:inline-block text-[11px] font-extrabold bg-gradient-to-r from-amber-400 to-yellow-600 text-black px-2.5 py-1 rounded-md shadow-md uppercase">
                🏆 Gold Access
              </span>
            )}
            <div className="group-hover:scale-105 transition-transform duration-200">
              <Avatar src={user.profilePictureUrl} alt={user.displayName} size={52} />
            </div>
          </div>
        </Link>
      </header>

      {/* Exclusive Early Access Section */}
      {user.subscriptionType === 'gold' && data.earlyAccess && (
        <section className="bg-gradient-to-br from-amber-950/20 to-neutral-900 p-5 rounded-2xl border border-amber-500/20">
          <h2 className="text-lg md:text-xl font-bold text-amber-400 tracking-tight mb-4">Exclusive Early Access</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {data.earlyAccess.map((album) => (
              <AlbumCard key={album.id} album={album} badge="New" />
            ))}
          </div>
        </section>
      )}

      {/* Playlists Dashboard Row */}
      <section className="space-y-2">
        <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">Recently Played Playlists</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {data.recentlyPlayed.map((playlist) => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </div>
      </section>

      {/* Trending Tracks Dashboard Row */}
      <section className="space-y-2">
        <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">Trending Songs</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {data.trendingSongs.map((song) => (
            <SongCard key={song.id} song={song} subscriptionType={user.subscriptionType} />
          ))}
        </div>
      </section>

      {/* Recent Studio Album Publications */}
      <section className="space-y-2">
        <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">Recently Released Albums</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {data.recentAlbums.map((album) => (
            <AlbumCard key={album.id} album={album} />
          ))}
        </div>
      </section>
    </main>
  );
}