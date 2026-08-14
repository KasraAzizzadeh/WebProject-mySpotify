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
  // Show all albums with a release date in the future
  const upcomingAlbums = (data.recentAlbums || []).filter((a) => {
    if (!a?.releaseDate) return false;
    // Defensive: parse the release date and compare to now
    const releaseTs = new Date(a.releaseDate).getTime();
    return !Number.isNaN(releaseTs) && releaseTs > Date.now();
  });

  // Safeguard: hide the row if the user isn't gold OR if there are no upcoming albums
  if (user.subscriptionType !== 'gold' || upcomingAlbums.length === 0) return null;

  return (
    <section className="bg-gradient-to-br from-amber-950/20 to-neutral-900 p-5 rounded-2xl border border-amber-500/20 space-y-3">
      <h2 className="text-lg md:text-xl font-bold text-amber-400">
        Exclusive Early Access
      </h2>

      <HorizontalScrollRow title="">
        {upcomingAlbums.map((album) => (
          <div key={album.id} className="min-w-[180px]">
            <AlbumCard album={album} badge="New" />
          </div>
        ))}
      </HorizontalScrollRow>
    </section>
  );
}