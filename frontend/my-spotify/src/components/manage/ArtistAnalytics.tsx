'use client';

import React from 'react';
import { AlbumItem, SongItem } from '@/types';
import { BarChart2, Headphones, DollarSign } from 'lucide-react';

interface ArtistAnalyticsProps {
  myReleases: AlbumItem[];
  mySongs: SongItem[];
  estimatedRevenue?: number;
  uniqueListeners?: number; // monthly unique listeners from artist profile
}

export default function ArtistAnalytics({ myReleases, mySongs, estimatedRevenue = 0, uniqueListeners }: ArtistAnalyticsProps) {
  const totalStreams = mySongs.reduce((sum, song) => sum + song.streams, 0);
  const totalListenersFromReleases = myReleases.reduce((sum, rel) => sum + rel.listeners, 0);

  // Prefer explicit uniqueListeners passed from the artist profile; fall back to sum of release listeners
  const monthlyListeners = typeof uniqueListeners === 'number' && !isNaN(uniqueListeners)
    ? uniqueListeners
    : totalListenersFromReleases;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-[#121212] border border-neutral-800/50 rounded-2xl p-5 shadow-lg flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-400">
          <BarChart2 size={20} />
        </div>
        <div>
          <p className="text-xs font-bold text-neutral-500 uppercase">Total Streams</p>
          <p className="text-xl font-black text-white">{totalStreams.toLocaleString()}</p>
        </div>
      </div>
      
      <div className="bg-[#121212] border border-neutral-800/50 rounded-2xl p-5 shadow-lg flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
          <Headphones size={20} />
        </div>
        <div>
          <p className="text-xs font-bold text-neutral-500 uppercase">Monthly Listeners</p>
          <p className="text-xl font-black text-white">{monthlyListeners.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-[#121212] border border-neutral-800/50 rounded-2xl p-5 shadow-lg flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500">
          <DollarSign size={20} />
        </div>
        <div>
          <p className="text-xs font-bold text-neutral-500 uppercase">Est. Revenue</p>
          <p className="text-xl font-black text-white">
            ${estimatedRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </div>
  );
}