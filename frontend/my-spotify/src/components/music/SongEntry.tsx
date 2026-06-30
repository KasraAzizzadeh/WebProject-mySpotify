'use client';

import Link from 'next/link';
import { Play } from 'lucide-react';

import { SongItem, SubscriptionType } from '@/types';
import Cover from '../ui/Cover';
import { formatDuration } from '@/utils/mediaUtils';

interface SongEntryProps {
  song: SongItem;
  trackNumber: number;
  subscriptionType: SubscriptionType;
  hasPermission: boolean;
  showAlbum?: boolean;
}

export default function SongEntry({
  song,
  trackNumber,
  subscriptionType,
  hasPermission,
  showAlbum = true,
}: SongEntryProps) {
  return (
    <div
      className="
        group grid w-full items-center gap-4 px-4 h-16 rounded-md
        grid-cols-[40px_1fr_auto]
        md:grid-cols-[40px_1fr_160px_auto]
        lg:grid-cols-[40px_1fr_200px_200px_80px]
        hover:bg-neutral-800
      "
    >

      {/* Track */}
      <div className="flex justify-center items-center w-10">
        <span className="group-hover:hidden">
          {trackNumber + 1}
        </span>

        <button className="hidden group-hover:flex items-center justify-center">
          <Play size={16} fill="currentColor" />
        </button>
      </div>

      {/* Title */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="shrink-0">
          <Cover src={song.imageUrl} alt={song.title} size={56} />
        </div>

        <div className="min-w-0">
          <p className="truncate font-medium">
            {song.title}
          </p>

          <Link
            href={`/profile/${song.artistId}`}
            className="block truncate text-sm text-neutral-400 hover:text-white hover:underline"
          >
            {song.artistName}
          </Link>
        </div>
      </div>

      {/* Album (hidden on small screens) */}
      {showAlbum ? (
        <div className="hidden md:block lg:block truncate text-neutral-400">
          <Link
            href={`/album/${song.albumId}`}
            className="hover:text-white hover:underline"
          >
            {song.albumName}
          </Link>
        </div>
      ) : (
        <div />
      )}

      {/* Streams (hidden on md and below) */}
      {subscriptionType !== "basic" ? (
        <div className="hidden lg:block text-right text-neutral-400">
          {song.streams.toLocaleString()}
        </div>
      ) : (
        <div />
      )}

      {/* Duration (always visible) */}
      <div className="text-right text-neutral-400">
        {formatDuration(song.songDurationMs)}
      </div>

    </div>
  );
}