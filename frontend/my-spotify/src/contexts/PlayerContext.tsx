'use client';

import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import { SongItem } from '@/types';
import { getSongsByCollectionSource, getSiblingSongsByAlbumId } from '@/store/mockDb';

type RepeatMode = 'none' | 'all' | 'one';

export interface PlaybackSource {
  type: 'album' | 'playlist' | 'single';
  id: string;
}

interface PlayerContextType {
  currentSong: SongItem | null;
  queue: SongItem[];
  currentIndex: number;
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
  repeatMode: RepeatMode;
  isShuffle: boolean;
  playbackSource: PlaybackSource | null;
  playSong: (song: SongItem, initialQueue?: SongItem[], source?: PlaybackSource) => void;
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
  const [originalQueue, setOriginalQueue] = useState<SongItem[]>([]); 
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(1);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('none');
  const [isShuffle, setIsShuffle] = useState(false);
  const [playbackSource, setPlaybackSource] = useState<PlaybackSource | null>(null);

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = volume;
    const audio = audioRef.current;
    
    const updateTime = () => setProgress(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration || 0);
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
  }, [currentIndex, queue, repeatMode]);

  useEffect(() => {
    if (!audioRef.current || !currentSong) return;
    const targetSrc = currentSong.audioUrl || `/songs/${currentSong.id}.mp3`;
    
    if (audioRef.current.src !== window.location.origin + targetSrc && !audioRef.current.src.endsWith(targetSrc)) {
      audioRef.current.src = targetSrc;
      audioRef.current.currentTime = 0;
    }
    if (isPlaying) {
      audioRef.current.play().catch(e => console.log("Playback interaction handled:", e));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentSong]);

  const playSong = (song: SongItem, initialQueue?: SongItem[], source?: PlaybackSource) => {
    let resolvedQueue = initialQueue && initialQueue.length > 1 ? [...initialQueue] : [song];
    let trackingSource = source || null;

    // Direct Context Injection: If queue is limited, populate using our lookups
    if (source && (source.type === 'album' || source.type === 'playlist') && resolvedQueue.length <= 1) {
      const fullCollection = getSongsByCollectionSource(source.type, source.id);
      if (fullCollection.length > 0) {
        resolvedQueue = [...fullCollection];
      }
    } else if ((!source || source.type === 'single') && song.albumId) {
      // SongCard fallback query matching layout
      const albumCollection = getSiblingSongsByAlbumId(song.albumId);
      if (albumCollection.length > 0) {
        resolvedQueue = [...albumCollection];
        trackingSource = { type: 'album', id: song.albumId };
      }
    }

    if (!trackingSource) {
      trackingSource = { type: 'single', id: song.id };
    }

    setPlaybackSource(trackingSource);
    setOriginalQueue([...resolvedQueue]);

    if (isShuffle) {
      resolvedQueue = shuffleArray(resolvedQueue, song);
    }

    setQueue(resolvedQueue);
    const targetIdx = resolvedQueue.findIndex(s => s.id === song.id);
    setCurrentIndex(targetIdx !== -1 ? targetIdx : 0);
    setCurrentSong(song);
    setIsPlaying(true);
  };

  const togglePlayPause = () => { if (currentSong) setIsPlaying(!isPlaying); };

  const nextTrack = () => {
    if (!audioRef.current || queue.length === 0) return;
    
    if (repeatMode === 'one') {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
      return;
    }

    let nextIndex = currentIndex + 1;
    if (nextIndex >= queue.length) {
      if (repeatMode === 'all') nextIndex = 0;
      else { setIsPlaying(false); audioRef.current.currentTime = 0; return; }
    }
    setCurrentIndex(nextIndex);
    setCurrentSong(queue[nextIndex]);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    if (!audioRef.current || queue.length === 0) return;
    if (audioRef.current.currentTime > 3) { audioRef.current.currentTime = 0; return; }
    
    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      if (repeatMode === 'all') prevIndex = queue.length - 1;
      else prevIndex = 0;
    }
    setCurrentIndex(prevIndex);
    setCurrentSong(queue[prevIndex]);
    setIsPlaying(true);
  };

  const seek = (time: number) => { if (audioRef.current) { audioRef.current.currentTime = time; setProgress(time); } };
  const setVolume = (vol: number) => { setVolumeState(vol); if (audioRef.current) audioRef.current.volume = vol; };
  const toggleRepeat = () => { const modes: RepeatMode[] = ['none', 'all', 'one']; setRepeatMode(modes[(modes.indexOf(repeatMode) + 1) % 3]); };

  const toggleShuffle = () => {
    setIsShuffle(prev => {
      const nextShuffle = !prev;
      if (!currentSong) return nextShuffle;
      if (nextShuffle) {
        const randomized = shuffleArray(originalQueue, currentSong);
        setQueue(randomized);
        setCurrentIndex(0);
      } else {
        setQueue([...originalQueue]);
        setCurrentIndex(originalQueue.findIndex(s => s.id === currentSong.id));
      }
      return nextShuffle;
    });
  };

  const shuffleArray = (array: SongItem[], activeSong: SongItem): SongItem[] => {
    const filtered = array.filter((item) => item.id !== activeSong.id);
    for (let i = filtered.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
    }
    return [activeSong, ...filtered];
  };

  return (
    <PlayerContext.Provider value={{
      currentSong, queue, currentIndex, isPlaying, volume, progress, duration,
      repeatMode, isShuffle, playbackSource, playSong, togglePlayPause, nextTrack,
      prevTrack, seek, setVolume, toggleRepeat, toggleShuffle
    }}>
      {children}
    </PlayerContext.Provider>
  );
}