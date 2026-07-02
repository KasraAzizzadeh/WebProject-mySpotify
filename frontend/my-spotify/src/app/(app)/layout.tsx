import Sidebar from '@/components/Sidebar';
import { PlayerProvider } from '@/contexts/PlayerContext';
import PlayerWrapper from '@/components/player/PlayerWrapper';

export default function AppGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <PlayerProvider>
      <div className="flex flex-col md:flex-row min-h-screen bg-[#121212]">
        {/* Sidebar Navigation Panel */}
        <Sidebar />
        
        {/* Main Content Container wrapping dashboard and streaming pages.
          Added md:pb-28 so content doesn't get hidden behind the fixed desktop player bar.
        */}
        <div className="flex-1 md:ml-64 pb-24 md:pb-28 transition-all duration-300">
          {children}
        </div>

        {/* Global Floating Player Interface (Desktop Bar / Mobile Mini View) */}
        <PlayerWrapper />
      </div>
    </PlayerProvider>
  );
}