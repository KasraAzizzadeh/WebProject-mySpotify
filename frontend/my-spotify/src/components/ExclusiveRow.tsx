'use client';

import { DashboardData, UserProfile } from '@/types';
import AlbumCard from '@/components/AlbumCard';

interface Props {
  user: UserProfile;
  data: DashboardData;
}

export default function ExclusiveRow({ user, data }: Props) {
  if (user.subscriptionType !== 'gold' || !data.earlyAccess) return null;

  return (
    <section className="bg-gradient-to-br from-amber-950/20 to-neutral-900 p-5 rounded-2xl border border-amber-500/20">
      <h2 className="text-lg md:text-xl font-bold text-amber-400 tracking-tight mb-4">
        Exclusive Early Access
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {data.earlyAccess.map((album) => (
          <AlbumCard key={album.id} album={album} badge="New" />
        ))}
      </div>
    </section>
  );
}