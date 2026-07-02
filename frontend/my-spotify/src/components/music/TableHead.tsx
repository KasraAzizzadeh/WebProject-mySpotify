'use client';

import { Clock } from 'lucide-react';

interface SongTableHeaderProps {
  showAlbum?: boolean;
  showStreams?: boolean;
}

export default function SongTableHeader({
  showAlbum = true,
  showStreams = true,
}: SongTableHeaderProps) {
  return (
    <div
      className="
        grid w-full items-center gap-4 px-4 py-2 text-sm font-medium text-neutral-500 border-b border-neutral-800 select-none
        grid-cols-[40px_1fr_60px_40px]
        md:grid-cols-[40px_1fr_200px_60px_40px]
        lg:grid-cols-[40px_1fr_200px_150px_60px_40px]
      "
    >
      {/* # Column */}
      <div className="text-center w-10">#</div>
      
      {/* Title Column */}
      <div className="text-left">Title</div>
      
      {/* Album Column Track (Maintains spacing even if hidden) */}
      {showAlbum ? (
        <div className="hidden md:block truncate text-left">
          Album
        </div>
      ) : (
        <div className="hidden md:block" /> // Locks structural tracking size
      )}

      {/* Streams Column Track */}
      {showStreams ? (
        <div className="hidden lg:block text-right">
          Streams
        </div>
      ) : (
        <div className="hidden lg:block" /> // Locks structural tracking size
      )}

      {/* Duration Column Track (Centered Icon to align over text values) */}
      <div className="flex items-center justify-center text-center w-full">
        <Clock size={16} />
      </div>

      {/* Action Column Track spacing */}
      <div className="w-10" />
    </div>
  );
}