'use client';

import Sidebar from '@/components/Sidebar';
import AudioManager from '@/components/player/AudioManager';
import PlayerWrapper from '@/components/player/PlayerWrapper';
import { usePathname } from 'next/navigation';

export default function AppGroupLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Detect if the user is currently on any support-related route dashboard panel
  const isSupportRoute = pathname?.startsWith('/support');

  return (
    <>
      <AudioManager />
      
      {/* FIX: Background color dynamically shifts from bg-[#121212] to bg-[#050505] 
        when on support paths so that the 112px player padding area matches perfectly.
      */}
      <div 
        className={`flex flex-col md:flex-row min-h-screen transition-colors duration-300 ${
          isSupportRoute ? 'bg-[#050505]' : 'bg-[#121212]'
        }`}
      >
        {/* Sidebar Navigation Panel */}
        <Sidebar />
        
        {/* Main Content Container wrapping dashboard and streaming pages.
          - Removed md:ml-64 because the sidebar is now part of the flex flow.
          - Added min-w-0 (CRITICAL): This prevents horizontal scrolling rows inside 
            from blowing out the width of the page on desktop.
        */}
        <div className="flex-1 min-w-0 pb-24 md:pb-28 transition-all duration-300">
          {children}
        </div>

        {/* Global Floating Player Interface (Desktop Bar / Mobile Mini View) */}
        <PlayerWrapper />
      </div>
    </>
  );
}