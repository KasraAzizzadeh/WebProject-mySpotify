'use client';

import { DashboardData } from '@/types';
import SongCard from '@/components/SongCard';
import HorizontalScrollRow from '@/components/ui/HorizontalScrollRow';

export default function TrendingRow({
  data,
  user,
  onShowAll,
}: {
  data: DashboardData;
  user: any;
  onShowAll: () => void;
}) {
  return (
    <HorizontalScrollRow
      title="Trending Songs"
      onShowAll={onShowAll}
    >
      {data.trendingSongs.map((song) => (
        <div key={song.id} className="flex-none w-[180px]">
          <SongCard
            song={song}
            subscriptionType={user.subscriptionType}
          />
        </div>
      ))}
    </HorizontalScrollRow>
  );
}