'use client';

import { Clock } from 'lucide-react';

export default function SongTableHeader() {
  return (
    <div className="group flex w-full items-center gap-4 px-4 py-2 text-md text-neutral-400 border-b border-neutral-800">

      {/* # */}
      <div className="w-10 text-center">
        #
      </div>

      {/* Title */}
      <div className="flex-1 relative">
        Title

        {/* pipe appears on hover */}
        <span className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-neutral-600">
          |
        </span>
      </div>

      {/* Album */}
      <div className="w-48 relative">
        Album

        <span className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-neutral-600">
          |
        </span>
      </div>

      {/* Streams */}
      <div className="w-48 text-right relative">
        Streams

        <span className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-neutral-600">
          |
        </span>
      </div>

      {/* Duration */}
      <div className="w-20 flex justify-end items-center gap-1">
        <Clock size={20} />
      </div>

    </div>
  );
}