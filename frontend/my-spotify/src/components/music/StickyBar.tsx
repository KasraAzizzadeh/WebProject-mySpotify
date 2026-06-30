"use client";

import Cover from "@/components/ui/Cover";
import { AlbumItem } from "@/types";

interface Props {
  album: AlbumItem;
  visible: boolean;
}

export default function StickyBar({
  album,
  visible,
}: Props) {
  return (
    <section
      className={`
        fixed
        top-0
        left-0
        right-0
        h-16
        bg-neutral-900/80
        backdrop-blur-lg
        border-b
        border-neutral-800
        z-50

        transition-all
        duration-300

        ${
          visible
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0"
        }
      `}
    >
      <div className="h-full flex items-center gap-4 px-6">
        <Cover
          src={album.imageUrl}
          alt={album.name}
          size={48}
        />

        <div>
          <h2 className="font-semibold leading-none">
            {album.name}
          </h2>

          <p className="text-sm text-neutral-400">
            {album.artistName}
          </p>
        </div>
      </div>
    </section>
  );
}