'use client';
import Link from 'next/link';
import { SongItem, SubscriptionType } from '@/types';
//import PlaylistMenu from './PlaylistMenu';

interface SongCardProps {
  song: SongItem;
  subscriptionType: SubscriptionType;
}

export default function SongCard({ song, subscriptionType }: SongCardProps) {
  return (
    <div 
      onClick={() => alert(`Playing: "${song.title}" in bottom music player`)}
      className="bg-neutral-900/60 hover:bg-neutral-800/80 p-4 rounded-xl border border-neutral-800/40 transition-all cursor-pointer group flex flex-col justify-between"
    >
      <div>
        <div className="w-full aspect-square bg-neutral-800 rounded-lg mb-4 flex items-center justify-center relative shadow-inner group-hover:scale-[1.02] transition-transform">
          <span className="text-3xl">🎵</span>
        </div>
        
        <div className="flex justify-between items-start gap-2">
          <h4 className="font-semibold text-white truncate text-base flex-1">{song.title}</h4>
          {/*<PlaylistMenu subscriptionType={subscriptionType} trackTitle={song.title} />*/}
        </div>

        <p className="text-neutral-400 text-sm mt-0.5 truncate">
          By{' '}
          <Link 
            href={`/artist/${song.artistId}`}
            onClick={(e) => e.stopPropagation()} 
            className="text-green-400 hover:underline inline"
          >
            {song.artistName}
          </Link>
        </p>

        {song.albumName && (
          <p className="text-xs text-neutral-500 truncate mt-1">
            From:{' '}
            <Link 
              href={`/albums/${song.albumId}`}
              onClick={(e) => e.stopPropagation()}
              className="text-neutral-400 hover:underline"
            >
              {song.albumName}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}