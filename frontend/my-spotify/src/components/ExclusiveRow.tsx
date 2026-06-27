'use client';

import { DashboardData, UserProfile } from '@/types';
import AlbumCard from '@/components/AlbumCard';
import HorizontalScrollRow from '@/components/ui/HorizontalScrollRow';

export default function ExclusiveRow({
  data,
  user,
}: {
  data: DashboardData;
  user: UserProfile;
}) {
  if (user.subscriptionType !== 'gold' || !data.earlyAccess) return null;

  return (
    <section className="bg-gradient-to-br from-amber-950/20 to-neutral-900 p-5 rounded-2xl border border-amber-500/20 space-y-3">
      <h2 className="text-lg md:text-xl font-bold text-amber-400">
        Exclusive Early Access
      </h2>

      <HorizontalScrollRow title="">
        {data.earlyAccess.map((album) => (
          <div key={album.id} className="min-w-[180px]">
            <AlbumCard album={album} badge="New" />
          </div>
        ))}
      </HorizontalScrollRow>
    </section>
  );
}