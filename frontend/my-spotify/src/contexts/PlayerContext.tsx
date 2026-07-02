'use client';

import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import { SongItem } from '@/types';

type RepeatMode = 'none' | 'all' | 'one';

interface PlayerContextType {
  currentSong: SongItem | null;
  queue: SongItem[];
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
  repeatMode: RepeatMode;
  isShuffle: boolean;
  playSong: (song: SongItem, queue?: SongItem[]) => void;
  togglePlayPause: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seek: (time: number) => void;
  setVolume: (vol: number) => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error("usePlayer must be used within a PlayerProvider");
  return context;
};

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [currentSong, setCurrentSong] = useState<SongItem | null>(null);
  const [queue, setQueue] = useState<SongItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(1);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('none');
  const [isShuffle, setIsShuffle] = useState(false);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = volume;

    const audio = audioRef.current;
    
    const updateTime = () => setProgress(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnd = () => nextTrack();

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnd);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnd);
      audio.pause();
    };
  }, []);

  // Handle Play/Pause side effects
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(e => console.log("Playback prevented:", e));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentSong]);

  const playSong = (song: SongItem, newQueue?: SongItem[]) => {
    if (newQueue) {
      setQueue(newQueue);
      setCurrentIndex(newQueue.findIndex(s => s.id === song.id));
    }
    setCurrentSong(song);
    if (audioRef.current) {
      // Assuming audioUrl is available. Using placeholder if missing.
      audioRef.current.src = song.audioUrl || `/songs/${song.id}.mp3`;
      audioRef.current.currentTime = 0;
      setIsPlaying(true);
    }
  };

  const togglePlayPause = () => {
    if (currentSong) setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    if (!audioRef.current) return;
    
    if (repeatMode === 'one') {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      return;
    }

    if (queue.length > 0) {
      let nextIndex = currentIndex + 1;
      
      if (isShuffle) {
        nextIndex = Math.floor(Math.random() * queue.length);
      } else if (nextIndex >= queue.length) {
        if (repeatMode === 'all') nextIndex = 0;
        else {
          setIsPlaying(false);
          return;
        }
      }
      
      setCurrentIndex(nextIndex);
      playSong(queue[nextIndex]);
    }
  };

  const prevTrack = () => {
    if (!audioRef.current) return;
    if (audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }
    if (queue.length > 0 && currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      playSong(queue[prevIndex]);
    }
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  };

  const setVolume = (vol: number) => {
    setVolumeState(vol);
    if (audioRef.current) audioRef.current.volume = vol;
  };

  const toggleRepeat = () => {
    const modes: RepeatMode[] = ['none', 'all', 'one'];
    setRepeatMode(modes[(modes.indexOf(repeatMode) + 1) % 3]);
  };

  const toggleShuffle = () => setIsShuffle(!isShuffle);

  return (
    <PlayerContext.Provider value={{
      currentSong, queue, isPlaying, volume, progress, duration,
      repeatMode, isShuffle, playSong, togglePlayPause, nextTrack,
      prevTrack, seek, setVolume, toggleRepeat, toggleShuffle
    }}>
      {children}
    </PlayerContext.Provider>
  );
}