'use client';

import { DashboardData } from '@/types';
import PlaylistCard from '@/components/PlaylistCard';
import HorizontalScrollRow from '@/components/ui/HorizontalScrollRow';

export default function PlaylistRow({
  data,
  onShowAll,
}: {
  data: DashboardData;
  onShowAll: () => void;
}) {
  return (
    <HorizontalScrollRow
      title="Recently Played Playlists"
      onShowAll={onShowAll}
    >
      {data.recentlyPlayed.map((playlist) => (
        <div key={playlist.id} className="flex-none w-[180px]">
          <PlaylistCard playlist={playlist} />
        </div>
      ))}
    </HorizontalScrollRow>
  );
}