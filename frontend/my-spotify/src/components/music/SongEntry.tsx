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
    <div className="group flex h-16 w-full items-center gap-4 rounded-md px-4 hover:bg-neutral-800">

      {/* Track */}
      <div className="hidden w-10 shrink-0 justify-center md:flex">
        <span className="group-hover:hidden">
          {trackNumber + 1}
        </span>

        <button className="hidden group-hover:flex">
          <Play size={16} fill="currentColor" />
        </button>
      </div>

      {/* Cover */}
      <div className="shrink-0">
        <Cover
          src={song.imageUrl}
          alt={song.title}
          size={56}
        />
      </div>

      {/* Song */}
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">
          {song.title}
        </p>

        <Link
          href={`/profile/${song.artistId}`}
          className="inline-block max-w-full truncate text-sm text-neutral-400 hover:text-white hover:underline"
        >
          {song.artistName}
        </Link>
      </div>

        {/* Right Section */}
        <div className="flex shrink-0 items-center w-[64rem] justify-between gap-4">

            {/* Album */}
            {showAlbum && (
                <div className="w-48 text-left">
                <Link
                    href={`/album/${song.albumId}`}
                    className="inline-block max-w-full truncate text-neutral-400 hover:text-white hover:underline"
                >
                    {song.albumName}
                </Link>
                </div>
            )}

            {/* Streams */}
            {subscriptionType !== "basic" && (
                <div className="w-48 text-right text-neutral-400">
                {song.streams.toLocaleString()}
                </div>
            )}

            {/* Duration */}
            <div className="w-20 text-right text-neutral-400">
                {formatDuration(song.songDurationMs)}
            </div>

        </div>
    </div>
  );
}