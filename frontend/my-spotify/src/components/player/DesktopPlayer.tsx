'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePlayerStore } from "@/store/playerStore";
import { useAuth } from '@/contexts/AuthContext';
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

  // Queue Modal State
  const [showQueue, setShowQueue] = useState(false);
  const queueRef = useRef<HTMLDivElement>(null);

  // Close queue when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (queueRef.current && !queueRef.current.contains(e.target as Node)) {
        setShowQueue(false);
      }
    };
    if (showQueue) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showQueue]);

  if (!currentSong) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 bg-black border-t border-neutral-800 flex items-center justify-between px-4 z-50 select-none">
      
      {/* 1. Left: Metadata & Links */}
      <div className="flex items-center gap-4 w-[30%] min-w-[180px]">
        <Cover src={currentSong.imageUrl} alt={currentSong.title} size={56} className="rounded-md" />
        <div className="flex flex-col min-w-0">
          <p className="text-white text-sm font-semibold truncate">
            {currentSong.title}
          </p>
          <div className="flex items-center gap-1 text-xs text-neutral-400 truncate mt-0.5">
            <Link href={`/profile/${currentSong.artistId}`} className="hover:text-white hover:underline truncate">
              {currentSong.artistName}
            </Link>
            <span>•</span>
            <Link href={`/album/${currentSong.albumId}`} className="hover:text-white hover:underline truncate">
              {currentSong.albumName}
            </Link>
          </div>
          
          {/* GOLD TIER EXCLUSIVE */}
          {isGold && (
            <p className="text-[10px] text-amber-500 font-bold tracking-wider uppercase mt-1">
              {currentSong.streams.toLocaleString()} Streams
            </p>
          )}
        </div>
      </div>

      {/* 2. Center: Controls & Progress */}
      <div className="flex flex-col items-center justify-center max-w-[40%] w-full gap-2">
        <div className="flex items-center gap-6">
          <button onClick={toggleShuffle} className={`${isShuffle ? 'text-green-500' : 'text-neutral-400'} hover:text-white transition`}>
            <Shuffle size={18} />
          </button>
          <button onClick={prevTrack} className="text-neutral-400 hover:text-white transition">
            <SkipBack size={22} className="fill-current" />
          </button>
          
          <button 
            onClick={togglePlayPause} 
            className="w-8 h-8 flex items-center justify-center bg-white text-black rounded-full hover:scale-105 transition active:scale-95"
          >
            {isPlaying ? <Pause size={18} className="fill-current" /> : <Play size={18} className="fill-current ml-0.5" />}
          </button>
          
          <button onClick={nextTrack} className="text-neutral-400 hover:text-white transition">
            <SkipForward size={22} className="fill-current" />
          </button>
          <button onClick={toggleRepeat} className={`${repeatMode !== 'none' ? 'text-green-500' : 'text-neutral-400'} hover:text-white transition`}>
            {repeatMode === 'one' ? <Repeat1 size={18} /> : <Repeat size={18} />}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-2 w-full text-xs text-neutral-400 font-medium tabular-nums">
          <span>{formatDuration(progress * 1000)}</span>
          <input 
            type="range" min="0" max={duration || 100} value={progress} step="0.1"
            onChange={(e) => seek(Number(e.target.value))}
            className="w-full h-1 bg-neutral-700 rounded-full appearance-none cursor-pointer accent-white hover:accent-green-500"
          />
          <span>{formatDuration(duration * 1000)}</span>
        </div>
      </div>

      {/* 3. Right: Volume & Extras */}
      <div className="flex items-center justify-end gap-4 w-[30%] min-w-[180px] text-neutral-400 relative">
        <button className="hover:text-white transition" title="Lyrics">
          <Mic2 size={18} />
        </button>
        
        {/* Queue Toggle Button */}
        <div className="relative flex items-center">
          <button 
            onClick={(e) => { e.stopPropagation(); setShowQueue(!showQueue); }}
            className={`${showQueue ? 'text-green-500' : 'text-neutral-400'} hover:text-white transition`} 
            title="Queue"
          >
            <ListMusic size={18} />
          </button>

          {/* Pop-up Queue Rectangle */}
          {showQueue && (
            <div 
              ref={queueRef} 
              className="absolute bottom-12 right-0 w-80 max-h-96 bg-neutral-900 border border-neutral-800 rounded-lg shadow-2xl overflow-y-auto flex flex-col z-50 p-2 cursor-default"
            >
              <div className="sticky top-0 bg-neutral-900 pb-2 mb-2 border-b border-neutral-800 z-10 flex justify-between items-center px-2 pt-2">
                <h3 className="text-white font-bold text-sm">Play Queue</h3>
                {playbackSource && (
                  <span className="text-[10px] text-neutral-500 font-semibold tracking-wider uppercase">
                    {playbackSource.type}
                  </span>
                )}
              </div>
              
              <div className="flex flex-col gap-1">
                {queue.map((item, idx) => {
                  const song = item.song;
                  const isTrackActive = currentIndex === idx;

                  return (
                    <div
                      key={`${song.id}-${idx}`}
                      onClick={() => {
                        if (!isTrackActive) {
                          playSong(song, idx);
                        }
                      }}
                      className={`flex items-center gap-3 p-2 rounded-md transition ${
                        isTrackActive
                          ? "bg-white/10"
                          : "hover:bg-white/5 cursor-pointer"
                      }`}
                    >
                      <div className="relative w-8 h-8 shrink-0">
                        <Cover
                          src={song.imageUrl}
                          size={32}
                          className="rounded"
                          alt={song.title}
                        />

                        {isTrackActive && isPlaying && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded">
                            <div className="w-3 h-3 flex items-end justify-center gap-[2px]">
                              <div className="w-[2px] bg-green-500 h-full animate-pulse" />
                              <div
                                className="w-[2px] bg-green-500 h-2/3 animate-pulse"
                                style={{ animationDelay: "150ms" }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col min-w-0 flex-1">
                        <p
                          className={`text-xs font-semibold truncate ${
                            isTrackActive ? "text-green-500" : "text-white"
                          }`}
                        >
                          {song.title}
                        </p>

                        <p className="text-[10px] text-neutral-400 truncate">
                          {song.artistName}
                        </p>

                        <p className="text-[9px] text-neutral-500 uppercase tracking-wide">
                          {item.source.type}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 w-24">
          <button onClick={() => setVolume(volume === 0 ? 0.5 : 0)}>
            {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <input 
            type="range" min="0" max="1" step="0.01" value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-full h-1 bg-neutral-700 rounded-full appearance-none cursor-pointer accent-white hover:accent-green-500"
          />
        </div>
      </div>

    </div>
  );
}