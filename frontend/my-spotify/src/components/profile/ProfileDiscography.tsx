'use client';

import { useState } from 'react';
import SongCard from '@/components/SongCard';
import AlbumCard from '@/components/AlbumCard';
import { SongItem, AlbumItem, SubscriptionType } from '@/types';

interface ProfileDiscographyProps {
  subscriptionType: SubscriptionType;
  mockArtistSongs: SongItem[];
  mockArtistAlbums: AlbumItem[];
}

export default function ProfileDiscography({ 
  subscriptionType, 
  mockArtistSongs, 
  mockArtistAlbums 
}: ProfileDiscographyProps) {
  const [activeTab, setActiveTab] = useState<'songs' | 'albums'>('songs');

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
        <h3 className="text-lg font-bold text-white tracking-tight">Discography</h3>
        
        {/* Toggle Tabs */}
        <div className="flex gap-2 bg-neutral-950 p-1 rounded-lg border border-neutral-800">
          <button
            onClick={() => setActiveTab('songs')}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${
              activeTab === 'songs' 
                ? 'bg-neutral-800 text-white shadow-sm' 
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Songs ({mockArtistSongs.length})
          </button>
          <button
            onClick={() => setActiveTab('albums')}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${
              activeTab === 'albums' 
                ? 'bg-neutral-800 text-white shadow-sm' 
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Albums ({mockArtistAlbums.length})
          </button>
        </div>
      </div>

      {/* Conditional Grid Rendering */}
      {activeTab === 'songs' ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {mockArtistSongs.length > 0 ? (
            mockArtistSongs.map((song) => (
              <SongCard key={song.id} song={song} subscriptionType={subscriptionType} />
            ))
          ) : (
            <p className="text-neutral-500 text-sm col-span-full py-4">No songs available.</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {mockArtistAlbums.length > 0 ? (
            mockArtistAlbums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))
          ) : (
            <p className="text-neutral-500 text-sm col-span-full py-4">No albums available.</p>
          )}
        </div>
      )}
    </section>
  );
}