'use client';

import { usePlayer } from '@/contexts/PlayerContext';
import DesktopPlayer from '@/components/player/DesktopPlayer';
import MobilePlayer from '@/components/player/MobilePlayer';

export default function PlayerWrapper() {
  const { currentSong } = usePlayer();

  // Do not render anything if no song has been selected yet
  if (!currentSong) return null;

  return (
    <>
      {/* Hidden on mobile, shown on desktop */}
      <div className="hidden md:block">
        <DesktopPlayer />
      </div>

      {/* Shown on mobile, hidden on desktop */}
      <div className="md:hidden">
        <MobilePlayer />
      </div>
    </>
  );
}