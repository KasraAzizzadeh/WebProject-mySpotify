'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { getDashboardData } from '@/services/homeService';
import { DashboardData } from '@/types';

import ProfileHeader from '@/components/ProfileHeader';
import ExclusiveRow from '@/components/ExclusiveRow';
import HorizontalScrollRow from '@/components/ui/HorizontalScrollRow';

// Cards needed for the direct row implementation
import PlaylistCard from '@/components/PlaylistCard';
import SongCard from '@/components/SongCard';
import AlbumCard from '@/components/AlbumCard';

// View All components
import AllPlaylists from '@/components/AllPlaylists';
import AllSongs from '@/components/AllSongs';
import AllAlbums from '@/components/AllAlbums';

type ViewMode =
  | 'dashboard'
  | 'playlists-all'
  | 'songs-all'
  | 'albums-all';

export default function HomePage() {
  const { user: authUser } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [view, setView] = useState<ViewMode>('dashboard');

  useEffect(() => {
    if (!authUser) return;

    getDashboardData(authUser.subscriptionType)
      .then(setData)
      .catch(console.error);
  }, [authUser]);

  if (!authUser) {
    return (
      <div className="h-screen flex items-center justify-center text-neutral-500 text-sm bg-black">
        Verifying user security context...
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

  return (
    <main className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto relative">
      <ProfileHeader user={authUser} />

      {/* BACK BUTTON */}
      {view !== 'dashboard' && (
        <button
          onClick={() => setView('dashboard')}
          className="text-sm text-neutral-400 hover:text-white transition"
        >
          ← Back to Home
        </button>
      )}

      {/* DASHBOARD */}
      {view === 'dashboard' && (
        <>
          <ExclusiveRow user={authUser} data={data} />

          {/* PLAYLISTS ROW */}
          <HorizontalScrollRow
            title="Recently Played Playlists"
            onShowAll={() => setView('playlists-all')}
          >
            {data.recentlyPlayed.map((playlist) => (
              <div key={playlist.id} className="flex-none w-[180px]">
                <PlaylistCard playlist={playlist} />
              </div>
            ))}
          </HorizontalScrollRow>

          {/* TRENDING ROW */}
          <HorizontalScrollRow
            title="Trending Songs"
            onShowAll={() => setView('songs-all')}
          >
            {data.trendingSongs.map((song) => (
              <div key={song.id} className="flex-none w-[180px]">
                <SongCard
                  song={song}
                  subscriptionType={authUser.subscriptionType}
                />
              </div>
            ))}
          </HorizontalScrollRow>

          {/* RECENTLY RELEASED ALBUMS ROW */}
          <HorizontalScrollRow
            title="Recently Released Albums"
            onShowAll={() => setView('albums-all')}
          >
            {data.recentAlbums.map((album) => (
              <div key={album.id} className="flex-none w-[180px]">
                <AlbumCard album={album} />
              </div>
            ))}
          </HorizontalScrollRow>
        </>
      )}

      {/* EXPANDED VIEWS */}
      {view === 'playlists-all' && <AllPlaylists data={data} />}

      {view === 'songs-all' && (
        <AllSongs data={data} user={authUser} />
      )}

      {view === 'albums-all' && <AllAlbums data={data} />}
    </main>
  );
}