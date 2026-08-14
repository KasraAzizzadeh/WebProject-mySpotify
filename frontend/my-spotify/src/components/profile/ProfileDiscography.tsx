'use client';

import { useState } from 'react';
import AlbumCard from '@/components/AlbumCard';
import { AlbumItem, SubscriptionType } from '@/types';

interface ProfileDiscographyProps {
  subscriptionType: SubscriptionType;
  artistSingles: AlbumItem[]; // releases with releaseType === 'single'
  artistAlbums: AlbumItem[];  // releases with releaseType === 'album'
}

export default function ProfileDiscography({ 
  subscriptionType, 
  artistSingles, 
  artistAlbums 
}: ProfileDiscographyProps) {
  const [activeTab, setActiveTab] = useState<'songs' | 'albums'>('songs');

  // prepare grid content to avoid nested JSX ternaries which can confuse parsers
  let gridContent: React.ReactNode = (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <p className="text-neutral-500 text-sm col-span-full py-4">No items available.</p>
    </div>
  );

  if (activeTab === 'songs') {
    if (artistSingles.length > 0) {
      gridContent = (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {artistSingles.map((album) => {
            return <AlbumCard key={album.id} album={album} />;
          })}
        </div>
      );
    } else {
      gridContent = (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <p className="text-neutral-500 text-sm col-span-full py-4">No songs available.</p>
        </div>
      );
    }
  } else {
    if (artistAlbums.length > 0) {
      gridContent = (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {artistAlbums.map((album) => {
            return <AlbumCard key={album.id} album={album} />;
          })}
        </div>
      );
    } else {
      gridContent = (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <p className="text-neutral-500 text-sm col-span-full py-4">No albums available.</p>
        </div>
      );
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
        <h3 className="text-lg font-bold text-white tracking-tight">Discography</h3>

        {/* Toggle Tabs */}
        <div className="flex gap-2 bg-neutral-950 p-1 rounded-lg border border-neutral-800">
          <button
            onClick={() => setActiveTab('songs')}
            className={
              activeTab === 'songs'
                ? 'px-4 py-1.5 rounded-md text-xs font-bold transition bg-green-600 hover:bg-green-500 text-black shadow-sm'
                : 'px-4 py-1.5 rounded-md text-xs font-bold transition text-neutral-400 hover:text-neutral-200'
            }
          >
            Songs ({artistSingles.length})
          </button>
          <button
            onClick={() => setActiveTab('albums')}
            className={
              activeTab === 'albums'
                ? 'px-4 py-1.5 rounded-md text-xs font-bold transition bg-green-600 hover:bg-green-400 text-black shadow-sm'
                : 'px-4 py-1.5 rounded-md text-xs font-bold transition text-neutral-400 hover:text-neutral-200'
            }
          >
            Albums ({artistAlbums.length})
          </button>
        </div>
      </div>

      {gridContent}
    </section>
  );
}