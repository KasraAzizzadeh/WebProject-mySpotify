'use client';
import { PlaylistItem } from '@/types';

export default function PlaylistCard({ playlist }: { playlist: PlaylistItem }) {
  return (
    <div 
      onClick={() => window.location.href = `/playlist/${playlist.id}`}
      className="bg-neutral-900/60 hover:bg-neutral-800/80 p-4 rounded-xl border border-neutral-800/40 transition-all cursor-pointer group"
    >
      <div className="w-full aspect-square bg-neutral-800 rounded-lg mb-4 flex items-center justify-center relative shadow-inner group-hover:scale-[1.02] transition-transform">
        <span className="text-3xl">🎶</span>
      </div>
      <h4 className="font-semibold text-white truncate text-base">{playlist.name}</h4>
      <p className="text-neutral-400 text-sm mt-1 truncate">{playlist.songList.length} Tracks</p>
    </div>
  );
}