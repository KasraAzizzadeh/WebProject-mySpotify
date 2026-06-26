'use client';

import { DashboardData, UserProfile } from '@/types';
import SongCard from '@/components/SongCard';

interface Props {
  data: DashboardData;
  user: UserProfile;
}

export default function TrendingRow({ data, user }: Props) {
  return (
    <section className="space-y-2">
      <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
        Trending Songs
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {data.trendingSongs.map((song) => (
          <SongCard
            key={song.id}
            song={song}
            subscriptionType={user.subscriptionType}
          />
        ))}
      </div>
    </section>
  );
}