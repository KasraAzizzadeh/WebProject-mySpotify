import Sidebar from '@/components/Sidebar';
import AudioManager from '@/components/player/AudioManager';
import PlayerWrapper from '@/components/player/PlayerWrapper';

export default function AppGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AudioManager />
      
      <div className="flex flex-col md:flex-row min-h-screen bg-[#121212]">
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