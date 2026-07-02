'use client';

import Link from 'next/link';
import { usePlayer } from '@/contexts/PlayerContext';
import { SongItem, SubscriptionType } from '@/types';

interface SongCardProps {
  song: SongItem;
  subscriptionType: SubscriptionType;
  songsContext?: SongItem[]; // The list of tracks currently displayed around this card
}

export default function SongCard({ song, subscriptionType, songsContext = [song] }: SongCardProps) {
  const { playSong, currentSong, isPlaying, togglePlayPause } = usePlayer();

  const isCurrentSongActive = currentSong?.id === song.id;

  const handleCardClick = () => {
    if (isCurrentSongActive) {
      togglePlayPause();
    } else {
      // Automatically treats the current view grid list as the active play queue
      playSong(song, songsContext, { type: 'album', id: song.albumId || 'grid' });
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`
        p-4 rounded-xl border transition-all cursor-pointer group
        flex flex-col justify-between h-full
        ${isCurrentSongActive 
          ? 'bg-neutral-800/90 border-green-500/30 shadow-[0_4px_20px_rgba(34,197,94,0.1)]' 
          : 'bg-neutral-900/60 hover:bg-neutral-800/80 border-neutral-800/40'
        }
      `}
    >
      <div>
        <div className="w-full aspect-square bg-neutral-800 rounded-lg mb-4 flex items-center justify-center relative shadow-inner group-hover:scale-[1.02] transition-transform overflow-hidden">
          <span className="text-3xl select-none">🎵</span>
          
          {isCurrentSongActive && (
            <div className="absolute inset-0 bg-green-500/10 flex items-center justify-center backdrop-blur-[1px]">
              <div className="bg-black/60 rounded-full p-3 border border-green-500/30 text-green-500">
                <span className="text-xs font-bold uppercase tracking-wider">
                  {isPlaying ? 'Playing' : 'Paused'}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-start gap-2">
          <h4 className={`font-semibold truncate text-base flex-1 transition-colors ${isCurrentSongActive ? 'text-green-500' : 'text-white'}`}>
            {song.title}
          </h4>
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

        <p className="text-xs text-neutral-500 mt-1 min-h-[18px]">
          {song.albumName ? (
            <>
              From:{' '}
              <Link
                href={`/album/${song.albumId}`}
                onClick={(e) => e.stopPropagation()}
                className="text-neutral-400 hover:underline"
              >
                {song.albumName}
              </Link>
            </>
          ) : (
            <span className="opacity-0 select-none">placeholder</span>
          )}
        </p>
      </div>
    </div>
  );
}