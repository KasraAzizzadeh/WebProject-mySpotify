'use client';

import { DashboardData } from '@/types';
import AlbumCard from '@/components/AlbumCard';

interface Props {
  data: DashboardData;
}

export default function RecentRow({ data }: Props) {
  return (
    <section className="space-y-2">
      <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
        Recently Released Albums
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {data.recentAlbums.map((album) => (
          <AlbumCard key={album.id} album={album} />
        ))}
      </div>
    </section>
  );
}