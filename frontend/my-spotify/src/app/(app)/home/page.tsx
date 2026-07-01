'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from "next/navigation";
import { useEffect, useState } from 'react';
import { getDashboardData } from '@/services/homeService';
import { DashboardData } from '@/types';

import ProfileHeader from '@/components/ProfileHeader';
import ExclusiveRow from '@/components/ExclusiveRow';
import ItemRow from '@/components/ItemRow';
import ShowAll from '@/components/ShowAll';

import { ArrowLeft } from 'lucide-react';

type RowKey = 'recentlyPlayed' | 'trendingSongs' | 'recentAlbums';
type ViewMode = 'dashboard' | RowKey;

export default function HomePage() {
  const { user: authUser } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [view, setView] = useState<ViewMode>('dashboard');
  const router = useRouter();

  // Handle data fetching based on the verified auth state
  useEffect(() => {
    if (!authUser) return;

    getDashboardData(authUser.subscriptionType)
      .then(setData)
      .catch(console.error);
  }, [authUser]);

  // Fallback safety guard if no user is present in memory
  if (!authUser) {
    return (
      <div className="h-screen flex items-center justify-center text-neutral-500 text-sm bg-black">
        Redirecting to secure terminal...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-screen flex items-center justify-center text-neutral-500 text-sm bg-black">
        Loading music environment...
      </div>
    );
  }

  const viewConfigs: Record<RowKey, { title: string; type: 'playlist' | 'song' | 'album'; items: any[] }> = {
    recentlyPlayed: {
      title: 'All Playlists',
      type: 'playlist',
      items: data.recentlyPlayed,
    },
    trendingSongs: {
      title: 'All Songs',
      type: 'song',
      items: data.trendingSongs,
    },
    recentAlbums: {
      title: 'All Albums',
      type: 'album',
      items: data.recentAlbums,
    },
  };

  return (
    <main className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto relative">
      <ProfileHeader user={authUser} />

      {view !== 'dashboard' && (
        <button
          onClick={() => setView('dashboard')}
          className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to Home</span>
        </button>
      )}

      {view === 'dashboard' && (
        <>
          <ExclusiveRow user={authUser} data={data} />

          <ItemRow
            title="Recently Played Playlists"
            type="playlist"
            items={data.recentlyPlayed}
            user={authUser}
            onShowAll={() => setView('recentlyPlayed')}
          />

          <ItemRow
            title="Trending Songs"
            type="song"
            items={data.trendingSongs}
            user={authUser}
            onShowAll={() => setView('trendingSongs')}
          />

          <ItemRow
            title="Recently Released Albums"
            type="album"
            items={data.recentAlbums}
            user={authUser}
            onShowAll={() => setView('recentAlbums')}
          />
        </>
      )}

      {view !== 'dashboard' && (
        <ShowAll
          title={viewConfigs[view].title}
          type={viewConfigs[view].type}
          items={viewConfigs[view].items}
          user={authUser}
        />
      )}
    </main>
  );
}