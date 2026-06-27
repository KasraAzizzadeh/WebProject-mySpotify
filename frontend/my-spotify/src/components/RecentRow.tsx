'use client';

import { DashboardData } from '@/types';
import AlbumCard from '@/components/AlbumCard';
import HorizontalScrollRow from '@/components/ui/HorizontalScrollRow';

export default function RecentRow({
  data,
  onShowAll,
}: {
  data: DashboardData;
  onShowAll: () => void;
}) {
  return (
    <HorizontalScrollRow
      title="Recently Released Albums"
      onShowAll={onShowAll}
    >
      {data.recentAlbums.map((album) => (
        <div key={album.id} className="flex-none w-[180px]">
          <AlbumCard album={album} />
        </div>
      ))}
    </HorizontalScrollRow>
  );
}