'use client';

import { DashboardData } from '@/types';
import SongCard from '@/components/SongCard';
import { UserProfile } from '@/types';

interface Props {
  data: DashboardData;
  user: UserProfile;
}

export default function AllSongs({ data, user }: Props) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">All Songs</h2>

      <div className="grid grid-cols-[repeat(auto-fill,_180px)] gap-4">
        {data.trendingSongs.map((song) => (
          <SongCard
            key={song.id}
            song={song}
            subscriptionType={user.subscriptionType}
          />
        ))}
      </div>
    </div>
  );
}