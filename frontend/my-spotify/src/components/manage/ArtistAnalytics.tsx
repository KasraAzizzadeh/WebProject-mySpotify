'use client';

import React from 'react';
import { AlbumItem, SongItem } from '@/types';
import { BarChart2, Headphones, DollarSign } from 'lucide-react';

interface ArtistAnalyticsProps {
  myReleases: AlbumItem[];
  mySongs: SongItem[];
}

export default function ArtistAnalytics({ myReleases, mySongs }: ArtistAnalyticsProps) {
  const REVENUE_PER_STREAM = 0.004;

  const totalStreams = mySongs.reduce((sum, song) => sum + song.streams, 0);
  const totalRevenue = totalStreams * REVENUE_PER_STREAM;
  const totalListeners = myReleases.reduce((sum, rel) => sum + rel.listeners, 0);

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
          <p className="text-xl font-black text-white">{totalListeners.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-[#121212] border border-neutral-800/50 rounded-2xl p-5 shadow-lg flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500">
          <DollarSign size={20} />
        </div>
        <div>
          <p className="text-xs font-bold text-neutral-500 uppercase">Est. Revenue</p>
          <p className="text-xl font-black text-white">
            ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </div>
  );
}