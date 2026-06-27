'use client';

import { DashboardData } from '@/types';
import AlbumCard from '@/components/AlbumCard';

interface Props {
  data: DashboardData;
}

export default function AllAlbums({ data }: Props) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">All Albums</h2>

      <div className="grid grid-cols-[repeat(auto-fill,_180px)] gap-4">
        {data.recentAlbums.map((album) => (
          <AlbumCard key={album.id} album={album} />
        ))}
      </div>
    </div>
  );
}