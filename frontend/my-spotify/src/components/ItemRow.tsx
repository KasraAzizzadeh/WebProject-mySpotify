'use client';

import HorizontalScrollRow from '@/components/ui/HorizontalScrollRow';
import PlaylistCard from '@/components/PlaylistCard';
import SongCard from '@/components/SongCard';
import AlbumCard from '@/components/AlbumCard';

type ItemType = 'playlist' | 'song' | 'album';

interface ItemRowProps {
  title: string;
  type: ItemType;
  items: any[];
  user: any;
  onShowAll: () => void;
}

export default function ItemRow({ title, type, items, user, onShowAll }: ItemRowProps) {
  return (
    <HorizontalScrollRow title={title} onShowAll={onShowAll}>
      {items.map((item) => (
        <div key={item.id} className="flex-none w-[180px]">
          {type === 'playlist' && <PlaylistCard playlist={item} />}
          
          {type === 'song' && (
            <SongCard
              song={item}
              subscriptionType={user.subscriptionType}
            />
          )}
          
          {type === 'album' && <AlbumCard album={item} />}
        </div>
      ))}
    </HorizontalScrollRow>
  );
}