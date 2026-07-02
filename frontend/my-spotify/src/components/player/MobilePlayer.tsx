'use client';

import { useState } from 'react';
import { usePlayer } from '@/contexts/PlayerContext';
import { Play, Pause, ChevronDown } from 'lucide-react';
import Cover from '../ui/Cover';

export default function MobilePlayer() {
  const { currentSong, isPlaying, togglePlayPause, playbackSource } = usePlayer() as any;
  const [isExpanded, setIsExpanded] = useState(false);

  if (!currentSong) return null;

  if (isExpanded) {
    return (
      <div className="fixed inset-0 bg-neutral-900 z-[100] flex flex-col p-6 text-white animate-in slide-in-from-bottom-full duration-300 select-none">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pt-4">
          <button onClick={() => setIsExpanded(false)}>
            <ChevronDown size={28} />
          </button>
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">Now Playing</span>
            {playbackSource && (
              <span className="text-[9px] uppercase tracking-wider text-neutral-500 font-semibold mt-0.5">
                From {playbackSource.type}
              </span>
            )}
          </div>
          <div className="w-7" />
        </div>
        
        {/* Art */}
        <div className="w-full aspect-square relative rounded-lg shadow-2xl mb-8 overflow-hidden bg-neutral-800">
           <Cover src={currentSong.imageUrl} alt={currentSong.title} size={400} className="w-full h-full object-cover" />
        </div>

        {/* Metadata */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold truncate">{currentSong.title}</h1>
          <p className="text-lg text-neutral-400 truncate">{currentSong.artistName}</p>
        </div>

        {/* Big Play Button */}
        <div className="mt-auto mb-12 flex justify-center">
           <button 
             onClick={togglePlayPause} 
             className="w-20 h-20 flex items-center justify-center bg-white text-black rounded-full active:scale-95 transition"
           >
             {isPlaying ? <Pause size={36} className="fill-current" /> : <Play size={36} className="fill-current ml-2" />}
           </button>
        </div>
      </div>
    );
  }

  // Mini Player State
  return (
    <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+64px)] md:bottom-[env(safe-area-inset-bottom)] left-2 right-2 bg-neutral-800 rounded-md p-2 flex items-center justify-between shadow-xl z-40 border border-neutral-700/50 select-none">
      <div 
        className="flex items-center gap-3 flex-1 min-w-0" 
        onClick={() => setIsExpanded(true)}
      >
        <Cover src={currentSong.imageUrl} alt={currentSong.title} size={40} className="rounded-md shrink-0" />
        <div className="flex flex-col min-w-0">
          <p className="text-white text-sm font-semibold truncate">{currentSong.title}</p>
          <p className="text-neutral-400 text-xs truncate">{currentSong.artistName}</p>
        </div>
      </div>
      
      <button 
        onClick={(e) => { e.stopPropagation(); togglePlayPause(); }} 
        className="text-white p-3 pr-2"
      >
        {isPlaying ? <Pause size={20} className="fill-current" /> : <Play size={20} className="fill-current" />}
      </button>
    </div>
  );
}