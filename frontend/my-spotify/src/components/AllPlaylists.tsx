'use client';

import { DashboardData } from '@/types';
import PlaylistCard from '@/components/PlaylistCard';

interface Props {
  data: DashboardData;
}

export default function AllPlaylists({ data }: Props) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">All Playlists</h2>

      <div className="grid grid-cols-[repeat(auto-fill,_180px)] gap-4">
        {data.recentlyPlayed.map((playlist) => (
          <PlaylistCard key={playlist.id} playlist={playlist} />
        ))}
      </div>
    </div>
  );
}