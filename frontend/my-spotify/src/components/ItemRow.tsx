'use client';

import { DashboardData } from '@/types';
import HorizontalScrollRow from '@/components/ui/HorizontalScrollRow';
import PlaylistCard from '@/components/PlaylistCard';
import SongCard from '@/components/SongCard';
import AlbumCard from '@/components/AlbumCard';

type RowType = 'trendingSongs' | 'recentlyPlayed' | 'recentAlbums';

interface ItemRowProps {
  type: RowType;
  data: DashboardData;
  user: any; // Using the auth user context for subscriptionType tracking
  onShowAll: () => void;
}

export default function ItemRow({ type, data, user, onShowAll }: ItemRowProps) {
  // 1. Determine Title & Render Content Based on Type
  if (type === 'recentlyPlayed') {
    return (
      <HorizontalScrollRow
        title="Recently Played Playlists"
        onShowAll={onShowAll}
      >
        {data.recentlyPlayed.map((playlist) => (
          <div key={playlist.id} className="flex-none w-[180px]">
            <PlaylistCard playlist={playlist} />
          </div>
        ))}
      </HorizontalScrollRow>
    );
  }

  if (type === 'trendingSongs') {
    return (
      <HorizontalScrollRow title="Trending Songs" onShowAll={onShowAll}>
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

  if (type === 'recentAlbums') {
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

  return null;
}