'use client';

import Link from 'next/link';
import { Play, Pause, CirclePlus, CircleX, ListMusic } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { SongItem, SubscriptionType } from '@/types';
import Cover from '../ui/Cover';
import { formatDuration } from '@/utils/mediaUtils';

interface SongEntryProps {
  song: SongItem;
  trackNumber: number;
  subscriptionType: SubscriptionType;
  hasPermission: boolean;
  showAlbum?: boolean;
  onAdd?: (id: string) => void;
  onRemove?: (id: string) => void;
  onQueue?: (song: SongItem) => void;
  handlePlay: (song: SongItem) => void;
}

export default function SongEntry({
  song,
  trackNumber,
  subscriptionType,
  hasPermission,
  showAlbum = true,
  onAdd,
  onRemove,
  onQueue,
  handlePlay,
}: SongEntryProps) {
  const showStreams = subscriptionType !== "basic";
  
  const currentSong = usePlayerStore((s) => s.currentSong);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const togglePlayPause = usePlayerStore((s) => s.togglePlayPause);

  const isCurrentSongActive = currentSong?.id === song.id;
  const isThisSpecificTrackPlaying = isCurrentSongActive && isPlaying;

  const handlePlayAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrentSongActive) {
      togglePlayPause();
    } else {
      handlePlay(song);
    }
  };

  return (
    <div
      className={`
        group grid w-full items-center gap-4 px-4 h-16 rounded-xl transition-colors duration-150
        grid-cols-[40px_1fr_60px_60px]
        md:grid-cols-[40px_1fr_200px_60px_60px]
        lg:grid-cols-[40px_1fr_200px_150px_60px_60px]
        hover:bg-white/5 active:bg-white/10
        ${isCurrentSongActive ? 'bg-white/5' : ''}
      `}
    >
      {/* Column 1: Track Play Controls */}
      <div className="flex justify-center items-center w-10 text-neutral-400 font-medium text-sm">
        <span className={`group-hover:hidden ${isCurrentSongActive ? 'text-green-500 font-semibold' : ''}`}>
          {trackNumber + 1}
        </span>
        <button 
          onClick={handlePlayAction}
          className="hidden group-hover:flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-transform"
        >
          {isThisSpecificTrackPlaying ? (
            <Pause size={14} className="fill-current text-green-500" />
          ) : (
            <Play size={14} className="fill-current" />
          )}
        </button>
      </div>

      {/* Column 2: Details */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="shrink-0 shadow-md overflow-hidden rounded">
          <Cover src={song.imageUrl} alt={song.title} size={40} />
        </div>
        <div className="min-w-0 flex flex-col justify-center">
          <p className={`truncate font-semibold text-sm tracking-tight leading-snug ${isCurrentSongActive ? 'text-green-500' : 'text-white'}`}>
            {song.title}
          </p>
          <Link
            href={`/profile/${song.artistId}`}
            className="truncate text-xs text-neutral-400 hover:text-white hover:underline mt-0.5 w-fit"
          >
            {song.artistName}
          </Link>
        </div>
      </div>

      {/* Column 3: Album */}
      {showAlbum ? (
        <div className="hidden md:block truncate text-sm text-neutral-400 font-medium">
          <Link
            href={`/album/${song.albumId}`}
            className="hover:text-white hover:underline transition-colors"
          >
            {song.albumName}
          </Link>
        </div>
      ) : (
        <div className="hidden md:block" />
      )}

      {/* Column 4: Streams */}
      {showStreams ? (
        <div className="hidden lg:block text-right text-sm text-neutral-400 font-medium tracking-wide">
          {song.streams.toLocaleString()}
        </div>
      ) : (
        <div className="hidden lg:block" />
      )}

      {/* Column 5: Duration */}
      <div className="flex items-center justify-center text-center text-sm text-neutral-400 font-medium tabular-nums select-none w-full">
        {formatDuration(song.songDurationMs)}
      </div>

      {/* Column 6: Action Buttons */}
      <div className="w-[72px] h-10 flex items-center justify-center gap-3 justify-self-end">

        {onQueue && (
          <button
            className="md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-150 hover:text-green-400 text-neutral-500 hover:scale-110 active:scale-90"
            onClick={(e) => {
              e.stopPropagation();
              onQueue(song);
            }}
            title="Add to queue"
          >
            <ListMusic size={16} />
          </button>
        )}

        {!hasPermission && onAdd && (
          <button
            className="md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-150 hover:text-green-400 text-neutral-500 hover:scale-110 active:scale-90"
            onClick={(e) => {
              e.stopPropagation();
              onAdd(song.id);
            }}
            title="Add to playlist"
          >
            <CirclePlus size={16} />
          </button>
        )}

        {hasPermission && onRemove && (
          <button
            className="md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-150 hover:text-red-400 text-neutral-500 hover:scale-110 active:scale-90"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(song.id);
            }}
            title="Remove from playlist"
          >
            <CircleX size={16} />
          </button>
        )}

      </div>

    </div>
  );
}