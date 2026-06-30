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
        grid w-full items-center gap-4 px-4 py-2 text-md text-neutral-400 border-b border-neutral-800
        grid-cols-[40px_1fr_auto]
        md:grid-cols-[40px_1fr_160px_auto]
        lg:grid-cols-[40px_1fr_200px_200px_100px]
      "
    >
      {/* # */}
      <div className="flex justify-center w-10">
        #
      </div>

      {/* Title */}
      <div>
        Title
      </div>

      {/* Album */}
      {showAlbum ? (
        <div className="hidden md:block truncate">
          Album
        </div>
      ) : (
        <div className="hidden md:block" />
      )}

      {/* Streams */}
      {showStreams ? (
        <div className="hidden lg:block text-right">
          Streams
        </div>
      ) : (
        <div className="hidden lg:block" />
      )}

      {/* Duration */}
      <div className="flex items-center justify-end gap-3">
        <Clock size={20} />
        <div className="w-[18px]" />
      </div>
    </div>
  );
}