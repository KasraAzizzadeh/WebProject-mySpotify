'use client';

import { DashboardData } from '@/types';
import PlaylistCard from '@/components/PlaylistCard';

interface Props {
  data: DashboardData;
}

export default function PlaylistRow({ data }: Props) {
  return (
    <section className="space-y-2">
      <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
        Recently Played Playlists
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {data.recentlyPlayed.map((playlist) => (
          <PlaylistCard key={playlist.id} playlist={playlist} />
        ))}
      </div>
    </section>
  );
}