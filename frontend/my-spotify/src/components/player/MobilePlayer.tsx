'use client';

import { useState } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { useAverageColor } from '@/hooks/useAverageColor';
import {
  Play,
  Pause,
  ChevronDown,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  ListMusic,
  Mic2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import Cover from '../ui/Cover';

export default function MobilePlayer() {
  const currentSong = usePlayerStore((s) => s.currentSong);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const playbackSource = usePlayerStore((s) => s.playbackSource);

  const togglePlayPause = usePlayerStore((s) => s.togglePlayPause);
  const nextTrack = usePlayerStore((s) => s.nextTrack);
  const prevTrack = usePlayerStore((s) => s.prevTrack);

  const progress = usePlayerStore((s) => s.progress);
  const duration = usePlayerStore((s) => s.duration);
  const volume = usePlayerStore((s) => s.volume);

  const seek = usePlayerStore((s) => s.seek);
  const setVolume = usePlayerStore((s) => s.setVolume);

  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  const toggleRepeat = usePlayerStore((s) => s.toggleRepeat);
  const isShuffle = usePlayerStore((s) => s.isShuffle);
  const repeatMode = usePlayerStore((s) => s.repeatMode);

  const [isExpanded, setIsExpanded] = useState(false);

  // Extract average color from album artwork
  const dominantColor = useAverageColor(currentSong?.imageUrl);

  if (!currentSong) return null;

  const progressPercent = duration ? (progress / duration) * 100 : 0;

  // ======================
  // EXPANDED PLAYER
  // ======================
  if (isExpanded) {
    return (
      <div 
        className="fixed inset-0 z-[100] flex flex-col p-6 text-white select-none transition-colors duration-700 ease-out animate-in slide-in-from-bottom duration-300 bg-[#0a0a0a]"
        style={{
          // Separated background image from color to ensure opacity
          backgroundColor: '#0a0a0a',
          backgroundImage: `linear-gradient(to bottom, ${dominantColor}bf 0%, #0a0a0a 70%)`
        }}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8 pt-2">
          <button 
            onClick={() => setIsExpanded(false)}
            className="p-2 -ml-2 text-neutral-400 hover:text-white active:scale-90 transition-transform"
          >
            <ChevronDown size={28} />
          </button>

          <div className="flex flex-col items-center text-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-300">
              Now Playing
            </span>
            {playbackSource && (
              <span className="text-[10px] uppercase tracking-wider font-semibold mt-0.5 opacity-90" style={{ color: dominantColor }}>
                From {playbackSource.type}
              </span>
            )}
          </div>

          <div className="w-11" />
        </div>

        {/* COVER ART */}
        <div className="w-full flex-1 flex items-center justify-center max-h-[40vh] mb-8">
          <div 
            className="w-full aspect-square max-w-[320px] relative rounded-xl overflow-hidden bg-neutral-800 border border-neutral-700/30 transition-shadow duration-700"
            style={{ boxShadow: `0 25px 50px -12px ${dominantColor}66` }}
          >
            <Cover
              src={currentSong.imageUrl}
              alt={currentSong.title}
              size={400}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* SONG DETAILS */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold tracking-tight truncate">{currentSong.title}</h1>
            <p className="text-base text-neutral-400 truncate mt-0.5">
              {currentSong.artistName}
            </p>
          </div>
        </div>

        {/* PROGRESS BAR */}
        <div className="mb-6 space-y-2">
          <div className="relative group flex items-center">
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={progress}
              onChange={(e) => seek(Number(e.target.value))}
              className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-white focus:outline-none"
              style={{
                background: `linear-gradient(to right, ${dominantColor} 0%, ${dominantColor} ${progressPercent}%, #262626 ${progressPercent}%, #262626 100%)`
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-neutral-400 font-medium tabular-nums">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* MAIN CONTROLS */}
        <div className="flex items-center justify-between px-4 mb-8">
          <button 
            onClick={toggleShuffle}
            className="p-2 transition-all active:scale-90"
            style={{ color: isShuffle ? dominantColor : '#a3a3a3' }}
          >
            <Shuffle size={22} />
          </button>

          <button onClick={prevTrack} className="p-2 text-white active:scale-90 transition-transform">
            <SkipBack size={32} fill="currentColor" />
          </button>

          <button
            onClick={togglePlayPause}
            className="w-20 h-20 flex items-center justify-center bg-white text-black rounded-full active:scale-95 transition-transform shadow-lg"
          >
            {isPlaying ? (
              <Pause size={32} fill="currentColor" />
            ) : (
              <Play size={32} className="ml-1.5" fill="currentColor" />
            )}
          </button>

          <button onClick={nextTrack} className="p-2 text-white active:scale-90 transition-transform">
            <SkipForward size={32} fill="currentColor" />
          </button>

          <button
            onClick={toggleRepeat}
            className="p-2 transition-all active:scale-90"
            style={{ color: repeatMode !== 'none' ? dominantColor : '#a3a3a3' }}
          >
            {repeatMode === 'one' ? <Repeat1 size={22} /> : <Repeat size={22} />}
          </button>
        </div>

        {/* BOTTOM UTILITIES */}
        <div className="mt-auto grid grid-cols-3 items-center text-neutral-400 pt-4 border-t border-neutral-900/60">
          <button className="flex items-center justify-center gap-2 py-2 text-sm font-medium hover:text-white active:scale-95 transition-all">
            <ListMusic size={18} />
            <span>Queue</span>
          </button>

          <div className="flex items-center justify-center gap-2">
            <button 
              onClick={() => setVolume(volume === 0 ? 0.5 : 0)}
              className="p-1 hover:text-white active:scale-90 transition-transform"
            >
              {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          </div>

          <button className="flex items-center justify-center gap-2 py-2 text-sm font-medium hover:text-white active:scale-95 transition-all">
            <Mic2 size={18} />
            <span>Lyrics</span>
          </button>
        </div>
      </div>
    );
  }

  // ======================
  // MINI PLAYER (100% Opaque Gradient Surface)
  // ======================
  return (
    <div 
      className="fixed bottom-[calc(env(safe-area-inset-bottom)+68px)] md:bottom-[calc(env(safe-area-inset-bottom)+16px)] left-3 right-3 rounded-xl flex flex-col overflow-hidden shadow-2xl z-40 select-none border transition-all duration-300 ease-out bg-[#0a0a0a]"
      style={{ 
        borderColor: `${dominantColor}3b`,
        // Ensures a solid black base layer
        backgroundColor: '#0a0a0a',
        // Layers the semi-transparent gradient on top of the solid base
        backgroundImage: `linear-gradient(to right, ${dominantColor}40 0%, #0a0a0a 100%)`
      }}
    >
      <div className="flex items-center justify-between p-2.5">
        <div
          className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer active:opacity-80 transition-opacity"
          onClick={() => setIsExpanded(true)}
        >
          <Cover
            src={currentSong.imageUrl}
            alt={currentSong.title}
            size={44}
            className="rounded-lg shrink-0 shadow-md object-cover aspect-square"
          />

          <div className="flex flex-col min-w-0">
            <span className="text-white text-sm font-semibold truncate tracking-wide">
              {currentSong.title}
            </span>
            <span className="text-neutral-400 text-xs truncate mt-0.5">
              {currentSong.artistName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 pl-2">
          <button onClick={(e) => { e.stopPropagation(); prevTrack(); }} className="p-2 text-neutral-400 active:text-white active:scale-90 transition-all">
            <SkipBack size={20} fill="currentColor" className="opacity-80" />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); togglePlayPause(); }}
            className="p-2 text-white bg-neutral-900 active:bg-neutral-800 rounded-full active:scale-90 transition-all shadow-inner"
          >
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
          </button>

          <button onClick={(e) => { e.stopPropagation(); nextTrack(); }} className="p-2 text-neutral-400 active:text-white active:scale-90 transition-all">
            <SkipForward size={20} fill="currentColor" className="opacity-80" />
          </button>
        </div>
      </div>

      {/* MINI PROGRESS BAR */}
      <div className="w-full h-[2px] bg-neutral-900 mt-auto">
        <div 
          className="h-full transition-all duration-300 ease-linear"
          style={{ width: `${progressPercent}%`, backgroundColor: dominantColor }}
        />
      </div>
    </div>
  );
}

function formatTime(value: number) {
  if (!value && value !== 0) return '0:00';
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}