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
  // Extract the single latest album from the recent albums array
  const latestAlbum = data.recentAlbums?.[0];

  // Safeguard: hide the row if the user isn't gold OR if there are no recent albums
  if (user.subscriptionType !== 'gold' || !latestAlbum) return null;

  return (
    <section className="bg-gradient-to-br from-amber-950/20 to-neutral-900 p-5 rounded-2xl border border-amber-500/20 space-y-3">
      <h2 className="text-lg md:text-xl font-bold text-amber-400">
        Exclusive Early Access
      </h2>

      <HorizontalScrollRow title="">
        {/* Removed the .map() loop since we are only rendering the single latest album */}
        <div key={latestAlbum.id} className="min-w-[180px]">
          <AlbumCard album={latestAlbum} badge="New" />
        </div>
      </HorizontalScrollRow>
    </section>
  );
}