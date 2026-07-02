'use client';

import Link from 'next/link';
import { Play, CirclePlus, CircleX } from 'lucide-react';

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
}

export default function SongEntry({
  song,
  trackNumber,
  subscriptionType,
  hasPermission,
  showAlbum = true,
  onAdd,
  onRemove
}: SongEntryProps) {
  const showStreams = subscriptionType !== "basic";

  return (
    <div
      className="
        group grid w-full items-center gap-4 px-4 h-16 rounded-xl transition-colors duration-150
        grid-cols-[40px_1fr_60px_40px]
        md:grid-cols-[40px_1fr_200px_60px_40px]
        lg:grid-cols-[40px_1fr_200px_150px_60px_40px]
        hover:bg-white/5 active:bg-white/10
      "
    >
      {/* Column 1: Track Play/Index */}
      <div className="flex justify-center items-center w-10 text-neutral-400 font-medium text-sm">
        <span className="group-hover:hidden">
          {trackNumber + 1}
        </span>
        <button className="hidden group-hover:flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-transform">
          <Play size={14} fill="currentColor" />
        </button>
      </div>

      {/* Column 2: Title & Artist */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="shrink-0 shadow-md overflow-hidden rounded">
          <Cover src={song.imageUrl} alt={song.title} size={40} />
        </div>
        <div className="min-w-0 flex flex-col justify-center">
          <p className="truncate font-semibold text-sm text-white tracking-tight leading-snug">
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

      {/* Column 3: Album (Keeps layout aligned on Album pages) */}
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
        <div className="hidden md:block" /> // Prevents right-side layout collapsing
      )}

      {/* Column 4: Streams */}
      {showStreams ? (
        <div className="hidden lg:block text-right text-sm text-neutral-400 font-medium tracking-wide">
          {song.streams.toLocaleString()}
        </div>
      ) : (
        <div className="hidden lg:block" /> // Prevents right-side layout collapsing
      )}

      {/* Column 5: Duration text (Centered to align right beneath the header clock icon) */}
      <div className="flex items-center justify-center text-center text-sm text-neutral-400 font-medium tabular-nums select-none w-full">
        {formatDuration(song.songDurationMs)}
      </div>

      {/* Column 6: Action Trigger */}
      <div className="w-10 h-10 flex items-center justify-center justify-self-end">
        {!hasPermission && onAdd && (
          <button
            className="md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-150 hover:text-green-400 text-neutral-500 hover:scale-110 active:scale-90"
            onClick={(e) => { e.stopPropagation(); onAdd(song.id); }}
          >
            <CirclePlus size={16} />
          </button>
        )}

        {hasPermission && onRemove && (
          <button
            className="md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-150 hover:text-red-400 text-neutral-500 hover:scale-110 active:scale-90"
            onClick={(e) => { e.stopPropagation(); onRemove(song.id); }}
          >
            <CircleX size={16} />
          </button>
        )}
      </div>

    </div>
  );
}