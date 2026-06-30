'use client';

import PlaylistCard from '@/components/PlaylistCard';
import SongCard from '@/components/SongCard';
import AlbumCard from '@/components/AlbumCard';

type ItemType = 'playlist' | 'song' | 'album';

interface ShowAllProps {
  title: string;
  type: ItemType;
  items: any[];
  user: any;
}

export default function ShowAll({ title, type, items, user }: ShowAllProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">{title}</h2>
      
      <div className="grid grid-cols-[repeat(auto-fill,_180px)] gap-4">
        {items.map((item) => (
          <div key={item.id}>
            {type === 'playlist' && <PlaylistCard playlist={item} />}
            
            {type === 'song' && (
              <SongCard
                key={item.id}
                song={item}
                subscriptionType={user.subscriptionType}
              />
            )}
            
            {type === 'album' && <AlbumCard album={item} />}
          </div>
        ))}
      </div>
    </div>
  );
}