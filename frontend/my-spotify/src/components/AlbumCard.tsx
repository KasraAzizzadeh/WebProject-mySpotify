'use client';
import Link from 'next/link';
import { AlbumItem } from '@/types';

export default function AlbumCard({ album, badge }: { album: AlbumItem; badge?: string }) {
  return (
    <div 
      onClick={() => window.location.href = `/album/${album.id}`}
      className="bg-neutral-900/60 hover:bg-neutral-800/80 p-4 rounded-xl border border-neutral-800/40 transition-all cursor-pointer group flex flex-col justify-between relative"
    >
      {badge && (
        <span className="absolute top-2 right-2 bg-yellow-500 text-neutral-950 text-[10px] font-bold px-2 py-0.5 rounded-full z-10 uppercase tracking-wide shadow-md">
          {badge}
        </span>
      )}
      <div>
        <div className="w-full aspect-square bg-neutral-800 rounded-lg mb-4 flex items-center justify-center relative shadow-inner group-hover:scale-[1.02] transition-transform">
          <span className="text-3xl">💿</span>
        </div>
        <h4 className="font-semibold text-white truncate text-base">{album.name}</h4>
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