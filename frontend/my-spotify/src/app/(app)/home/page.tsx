'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { useHomeDashboard } from '@/hooks/queries/home/useHomeDashboard';

import ProfileHeader from '@/components/ProfileHeader';
import ExclusiveRow from '@/components/ExclusiveRow';
import ItemRow from '@/components/ItemRow';
import ShowAll from '@/components/ShowAll';

import { ArrowLeft, History, Flame, Disc } from 'lucide-react';

type RowKey = 'recentlyPlayed' | 'trendingSongs' | 'recentAlbums';
type ViewMode = 'dashboard' | RowKey;

export default function HomePage() {
  const { user: authUser } = useAuth();
  const { data, isLoading, isError } = useHomeDashboard(authUser?.subscriptionType, authUser?.id);
  const [view, setView] = useState<ViewMode>('dashboard');

  if (!authUser) {
    return (
      <div className="h-screen flex items-center justify-center text-neutral-500 text-sm bg-black">
        Redirecting to secure terminal...
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center text-neutral-500 text-sm bg-black">
        Loading music environment...
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="h-screen flex items-center justify-center text-neutral-500 text-sm bg-black">
        Failed to load home dashboard.
      </div>
    );
  }

  const viewConfigs: Record<
    RowKey,
    { title: string; type: 'playlist' | 'song' | 'album'; items: any[] }
  > = {
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
    <main className="p-4 md:p-8 space-y-8 w-full max-w-7xl mx-auto relative overflow-x-hidden">
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
            title={
              <div className="flex items-center gap-2 text-white font-bold text-xl tracking-tight">
                <History className="w-5 h-5 text-neutral-400" />
                <span>Recently Played Playlists</span>
              </div>
            }
            type="playlist"
            items={data.recentlyPlayed}
            user={authUser}
            onShowAll={() => setView('recentlyPlayed')}
          />

          <ItemRow
            title={
              <div className="flex items-center gap-2 text-white font-bold text-xl tracking-tight">
                <Flame className="w-5 h-5 text-amber-500" />
                <span>Trending Songs</span>
              </div>
            }
            type="song"
            items={data.trendingSongs}
            user={authUser}
            onShowAll={() => setView('trendingSongs')}
          />

          <ItemRow
            title={
              <div className="flex items-center gap-2 text-white font-bold text-xl tracking-tight">
                <Disc className="w-5 h-5 text-green-400" />
                <span>Recently Released Albums</span>
              </div>
            }
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