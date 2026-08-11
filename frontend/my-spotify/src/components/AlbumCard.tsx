'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlbumItem } from '@/types';
import Image from 'next/image';

export default function AlbumCard({
  album,
  badge,
}: {
  album: AlbumItem;
  badge?: string;
}) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/album/${album.id}`)}
      className="bg-neutral-900/60 hover:bg-neutral-800/80 p-4 rounded-xl border border-neutral-800/40 transition-all cursor-pointer group flex flex-col justify-between relative"
    >
      {badge && (
        <span className="absolute top-2 right-2 bg-yellow-500 text-neutral-950 text-[10px] font-bold px-2 py-0.5 rounded-full z-10 uppercase tracking-wide shadow-md">
          {badge}
        </span>
      )}

      <div>
        {/* IMAGE AREA (FIXED) */}
        <div className="w-full aspect-square bg-neutral-800 rounded-lg mb-4 relative overflow-hidden shadow-inner group-hover:scale-[1.02] transition-transform">
          
          {album.imageUrl ? (
            <Image
              src={album.imageUrl}
              alt={album.name}
              fill
              sizes="180px"
              loading="eager"
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl text-neutral-500">
              💿
            </div>
          )}
        </div>

        <h4 className="font-semibold text-white truncate text-base">
          {album.name}
        </h4>

        <p className="text-neutral-400 text-sm mt-1 truncate">
          By{' '}
          <Link
            href={`/artist/${album.artistId}`}
            onClick={(e) => e.stopPropagation()}
            className="text-green-400 hover:underline inline"
          >
            {album.artistName}
          </Link>
        </p>
      </div>
    </div>
  );
}