'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePlayerStore } from "@/store/playerStore";
import { useAuth } from '@/contexts/AuthContext';
import { useAverageColor } from '@/hooks/useAverageColor';
import { formatDuration } from '@/utils/mediaUtils';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, 
  Repeat, Repeat1, Shuffle, ListMusic, Mic2
} from 'lucide-react';
import Cover from '../ui/Cover';

export default function DesktopPlayer() {
  const currentSong = usePlayerStore((s) => s.currentSong);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const progress = usePlayerStore((s) => s.progress);
  const duration = usePlayerStore((s) => s.duration);
  const volume = usePlayerStore((s) => s.volume);
  const repeatMode = usePlayerStore((s) => s.repeatMode);
  const isShuffle = usePlayerStore((s) => s.isShuffle);
  const playbackSource = usePlayerStore((s) => s.playbackSource);
  const queue = usePlayerStore((s) => s.playQueue);
  const currentIndex = usePlayerStore((s) => s.currentIndex);

  const togglePlayPause = usePlayerStore((s) => s.togglePlayPause);
  const nextTrack = usePlayerStore((s) => s.nextTrack);
  const prevTrack = usePlayerStore((s) => s.prevTrack);
  const seek = usePlayerStore((s) => s.seek);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const toggleRepeat = usePlayerStore((s) => s.toggleRepeat);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  const playSong = usePlayerStore((s) => s.playSong);
  
  const { user: authUser } = useAuth() as any;
  const isGold = authUser?.subscriptionType?.toLowerCase() === 'gold';

  const [showQueue, setShowQueue] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const queueRef = useRef<HTMLDivElement>(null);
  const lyricsRef = useRef<HTMLDivElement>(null);

  // Dynamic colors derived from the audio art
  const dominantColor = useAverageColor(currentSong?.imageUrl);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (queueRef.current && !queueRef.current.contains(e.target as Node)) {
        setShowQueue(false);
      }
      if (lyricsRef.current && !lyricsRef.current.contains(e.target as Node)) {
        setShowLyrics(false);
      }
    };
    if (showQueue || showLyrics) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showQueue, showLyrics]);

  if (!currentSong) return null;

  const progressPercent = duration ? (progress / duration) * 100 : 0;
  const volumePercent = volume * 100;

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 h-24 border-t grid grid-cols-3 items-center px-6 z-50 select-none transition-all duration-500"
      style={{ 
        borderColor: `${dominantColor}33`, 
        // Mix a solid alpha overlay layer of dominantColor over the true dark base color
        backgroundColor: `color-mix(in srgb, ${dominantColor} 8%, #0a0a0a)`,
        backgroundImage: 'none',
        boxShadow: 'none' // Completely removed the glowing top halo effect
      }} 
    >
      
      {/* 1. LEFT: METADATA */}
      <div className="flex items-center gap-4 min-w-0 justify-self-start max-w-full">
        <div 
          className="relative group shrink-0 border border-neutral-900 rounded-md overflow-hidden transition-all duration-500"
          style={{ boxShadow: `0 4px 20px -2px ${dominantColor}4d` }}
        >
          <Cover src={currentSong.imageUrl} alt={currentSong.title} size={56} className="rounded-md transition-transform duration-300 group-hover:scale-105" />
        </div>
        <div className="flex flex-col min-w-0">
          <p className="text-white text-sm font-semibold truncate transition-colors cursor-pointer">
            {currentSong.title}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 truncate mt-1">
            <Link href={`/profile/${currentSong.artistId}`} className="hover:text-white hover:underline truncate transition-colors">
              {currentSong.artistName}
            </Link>
            <span className="text-neutral-600 font-bold">•</span>
            <Link href={`/album/${currentSong.albumId}`} className="hover:text-white hover:underline truncate transition-colors">
              {currentSong.albumName}
            </Link>
          </div>
          
          {isGold && (
            <div className="flex items-center gap-1 mt-1">
              <span className="inline-block w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
              <p className="text-[9px] text-amber-500 font-extrabold tracking-wider uppercase">
                {currentSong.streams.toLocaleString()} Premium Streams
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 2. CENTER: CONTROLS */}
      <div className="flex flex-col items-center justify-center w-full max-w-xl justify-self-center gap-2.5">
        <div className="flex items-center gap-5">
          <button 
            onClick={toggleShuffle} 
            className="p-1 transition-all active:scale-95"
            style={{ color: isShuffle ? dominantColor : '#a3a3a3', filter: isShuffle ? `drop-shadow(0 0 6px ${dominantColor}80)` : 'none' }}
          >
            <Shuffle size={16} />
          </button>
          
          <button onClick={prevTrack} className="p-1 text-neutral-400 hover:text-white active:scale-90 transition-all">
            <SkipBack size={20} fill="currentColor" />
          </button>
          
          <button 
            onClick={togglePlayPause} 
            className="w-9 h-9 flex items-center justify-center bg-white text-black rounded-full hover:scale-105 transition-transform active:scale-95 shadow-md"
          >
            {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
          </button>
          
          <button onClick={nextTrack} className="p-1 text-neutral-400 hover:text-white active:scale-90 transition-all">
            <SkipForward size={20} fill="currentColor" />
          </button>
          
          <button 
            onClick={toggleRepeat} 
            className="p-1 transition-all active:scale-95"
            style={{ color: repeatMode !== 'none' ? dominantColor : '#a3a3a3', filter: repeatMode !== 'none' ? `drop-shadow(0 0 6px ${dominantColor}80)` : 'none' }}
          >
            {repeatMode === 'one' ? <Repeat1 size={16} /> : <Repeat size={16} />}
          </button>
        </div>

        {/* Progress Input Slider */}
        <div className="flex items-center gap-3 w-full text-xs text-neutral-400 font-medium tabular-nums group">
          <span className="w-9 text-right shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">{formatDuration(progress * 1000)}</span>
          <div className="relative flex-1 flex items-center h-3">
            <input 
              type="range" min="0" max={duration || 100} value={progress} step="0.1"
              onChange={(e) => seek(Number(e.target.value))}
              className="w-full h-1 rounded-full appearance-none cursor-pointer bg-neutral-900 transition-all focus:outline-none accent-transparent group-hover:accent-white"
              style={{
                background: `linear-gradient(to right, ${dominantColor} 0%, ${dominantColor} ${progressPercent}%, #262626 ${progressPercent}%, #262626 100%)`
              }}
            />
          </div>
          <span className="w-9 text-left shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">{formatDuration(duration * 1000)}</span>
        </div>
      </div>

      {/* 3. RIGHT: AUDIO MIXER UTILITIES */}
      <div className="flex items-center justify-end gap-3.5 justify-self-end w-full max-w-[280px] text-neutral-400 relative">
        {/* Lyrics Button and Popup */}
        <div className="relative flex items-center">
          <button 
            onClick={(e) => { e.stopPropagation(); setShowLyrics(!showLyrics); }}
            className="p-1 transition-all active:scale-95 hover:text-white"
            style={{ color: showLyrics ? dominantColor : '' }}
            title="Lyrics"
          >
            <Mic2 size={16} />
          </button>

          {showLyrics && (
            <div 
              ref={lyricsRef} 
              className="absolute bottom-14 right-0 w-80 max-h-[420px] bg-[#0a0a0a] rounded-xl flex flex-col z-50 p-4 border shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200"
              style={{ borderColor: `${dominantColor}4d` }}
            >
              <div className="sticky top-0 bg-[#0a0a0a] pb-3 mb-3 border-b border-neutral-900/60 z-10">
                <h3 className="text-white font-bold text-sm tracking-wide">Lyrics</h3>
              </div>
              
              <div className="overflow-y-auto">
                {currentSong.lyrics ? (
                  <p className="text-sm text-neutral-300 whitespace-pre-wrap leading-relaxed">
                    {currentSong.lyrics}
                  </p>
                ) : (
                  <div className="flex items-center justify-center py-8 text-neutral-500">
                    <p className="text-sm">No lyrics available for this song.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Queue Drop Container */}
        <div className="relative flex items-center">
          <button 
            onClick={(e) => { e.stopPropagation(); setShowQueue(!showQueue); }}
            className="p-1 transition-all active:scale-95 hover:text-white"
            style={{ color: showQueue ? dominantColor : '' }}
            title="Queue"
          >
            <ListMusic size={18} />
          </button>

          {showQueue && (
            <div 
              ref={queueRef} 
              className="absolute bottom-14 right-0 w-80 max-h-[420px] bg-[#0a0a0a] rounded-xl flex flex-col z-50 p-2 border shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200"
              style={{ borderColor: `${dominantColor}4d` }}
            >
              <div className="sticky top-0 bg-[#0a0a0a] pb-2 mb-1.5 border-b border-neutral-900/60 z-10 flex justify-between items-center px-2 pt-2">
                <h3 className="text-white font-bold text-xs tracking-wide">Next Up</h3>
                {playbackSource && (
                  <span className="text-[9px] text-neutral-400 font-bold tracking-widest uppercase bg-neutral-900 px-1.5 py-0.5 rounded">
                    {playbackSource.type}
                  </span>
                )}
              </div>
              
              <div className="flex flex-col gap-0.5 overflow-y-auto">
                {queue.slice(currentIndex).map((item, idx) => {
                  const song = item.song;
                  const realIndex = currentIndex + idx;
                  const isTrackActive = currentIndex === realIndex;

                  return (
                    <div
                      key={`${song.id}-${realIndex}`}
                      onClick={() => !isTrackActive && playSong(song, realIndex)}
                      className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                        isTrackActive
                          ? "bg-neutral-900 border border-neutral-800/60"
                          : "hover:bg-neutral-900/40 cursor-pointer active:scale-[0.99]"
                      }`}
                    >
                      <div className="relative w-9 h-9 shrink-0">
                        <Cover src={song.imageUrl} size={36} className="rounded object-cover" alt={song.title} />

                        {isTrackActive && isPlaying && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded">
                            <div className="w-3 h-3 flex items-end justify-center gap-[2px]">
                              <div className="w-[2px] h-full animate-bounce" style={{ backgroundColor: dominantColor }} />
                              <div className="w-[2px] h-2/3 animate-bounce [animation-delay:0.2s]" style={{ backgroundColor: dominantColor }} />
                              <div className="w-[2px] h-1/2 animate-bounce [animation-delay:0.4s]" style={{ backgroundColor: dominantColor }} />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col min-w-0 flex-1">
                        <p 
                          className="text-xs font-semibold truncate"
                          style={{ color: isTrackActive ? dominantColor : '#ffffff' }}
                        >
                          {song.title}
                        </p>
                        <p className="text-[10px] text-neutral-400 truncate mt-0.5">
                          {song.artistName}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Volume Mixer Controls */}
        <div className="flex items-center gap-2 w-28 group/vol pl-1">
          <button 
            onClick={() => setVolume(volume === 0 ? 0.5 : 0)} 
            className="p-1 hover:text-white transition-colors active:scale-90"
          >
            {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <div className="relative flex-1 flex items-center h-3">
            <input 
              type="range" min="0" max="1" step="0.01" value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-full h-1 rounded-full appearance-none cursor-pointer bg-neutral-900 focus:outline-none accent-transparent group-hover/vol:accent-white"
              style={{
                background: `linear-gradient(to right, #ffffff 0%, #ffffff ${volumePercent}%, #262626 ${volumePercent}%, #262626 100%)`
              }}
            />
          </div>
        </div>
      </div>

    </div>
  );
}