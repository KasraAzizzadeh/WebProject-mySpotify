'use client';

import { Clock } from 'lucide-react';

export default function SongTableHeader() {
  return (
    <div
      className="
        grid w-full items-center gap-4 px-4 py-2 text-md text-neutral-400 border-b border-neutral-800
        grid-cols-[40px_1fr_auto]
        md:grid-cols-[40px_1fr_160px_auto]
        lg:grid-cols-[40px_1fr_200px_200px_80px]
      "
    >

      {/* # */}
      <div className="text-center w-10">
        #
      </div>

      {/* Title */}
      <div className="relative">
        Title
        <span className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-neutral-600">
          |
        </span>
      </div>

      {/* Album (hidden on small screens) */}
      <div className="hidden md:block lg:block relative">
        Album
        <span className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-neutral-600">
          |
        </span>
      </div>

      {/* Streams (hidden on md and below) */}
      <div className="hidden lg:block text-right relative">
        Streams
        <span className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-neutral-600">
          |
        </span>
      </div>

      {/* Duration */}
      <div className="flex justify-end">
        <Clock size={20} />
      </div>

    </div>
  );
}