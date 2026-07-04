'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { PlaylistItem } from '@/types';

export default function PlaylistCard({
  playlist,
}: {
  playlist: PlaylistItem;
}) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/playlist/${playlist.id}`)}
      className="bg-neutral-900/60 hover:bg-neutral-800/80 p-4 rounded-xl border border-neutral-800/40 transition-all cursor-pointer group"
    >
      {/* IMAGE AREA (FIXED) */}
      <div className="w-full aspect-square bg-neutral-800 rounded-lg mb-4 relative overflow-hidden shadow-inner group-hover:scale-[1.02] transition-transform">

        {playlist.imageUrl ? (
          <Image
            src={playlist.imageUrl}
            alt={playlist.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl text-neutral-500 select-none">
            🎶
          </div>
        )}
      </div>

      {/* TITLE */}
      <h4 className="font-semibold text-white truncate text-base">
        {playlist.name}
      </h4>

      {/* META */}
      <p className="text-neutral-400 text-sm mt-1 truncate">
        {playlist.songList.length} Tracks
      </p>
    </div>
  );
}