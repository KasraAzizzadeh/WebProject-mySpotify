import { create } from "zustand";
import { SongItem } from "@/types";
import { stat } from "fs";

type RepeatMode = "none" | "all" | "one";

export interface PlaybackSource {
  type: 'album' | 'playlist' | 'single';
  id: string;
}

interface PlayerStore {
    currentSong: SongItem | null;

    queue: SongItem[];
    shuffledQueue: SongItem[];
    currentIndex: number;

    playbackSource: PlaybackSource | null;

    isPlaying: boolean;

    progress: number;
    duration: number;

    volume: number;

    repeatMode: RepeatMode;
    isShuffle: boolean;

    playSong: (
        song: SongItem,
        queue?: SongItem[],
        source?: PlaybackSource
    ) => void;

    togglePlayPause: () => void;

    nextTrack: () => void;

    prevTrack: () => void;

    seek: (time: number) => void;

    setVolume: (volume: number) => void;

    setProgress: (time: number) => void;

    setDuration: (duration: number) => void;

    toggleRepeat: () => void;

    toggleShuffle: () => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
    
    currentSong: null,
    
    queue: [],

    shuffledQueue: [],
    
    currentIndex: -1,
    
    isPlaying: false,
    
    progress: 0,
    
    duration: 0,
    
    volume: 1,
    
    repeatMode: "none",
    
    isShuffle: false,
    
    playbackSource: null,

    playSong: (song, queue, source) => {
        set(state => ({
            currentSong: song,

            queue: queue ?? state.queue,

            currentIndex: queue
                ? queue.findIndex(s => s.id === song.id)
                : state.currentIndex,

            playbackSource: source ?? state.playbackSource,

            progress: 0,

            isPlaying: true
        }));
    },

    togglePlayPause: () => {
        set(state => ({
            isPlaying: !state.isPlaying
        }));
    },

    nextTrack: () => {
        const state = get();

        if (!state.queue.length)
            return;

        let nextIndex;

        if (state.isShuffle) {
            nextIndex = Math.floor(Math.random() * state.queue.length);
        } else {
            nextIndex = state.currentIndex + 1;

            if (nextIndex >= state.queue.length) {
                if (state.repeatMode === "all")
                    nextIndex = 0;
                else {
                    set({ isPlaying: false });
                    return;
                }
            }
        }

        set({
            currentSong: state.queue[nextIndex],

            currentIndex: nextIndex,

            progress: 0,

            isPlaying: true
        });
    },

    prevTrack: () => {
        const state = get();

        let prevIndex = state.currentIndex - 1;

        if (prevIndex < 0) {
            state.repeatMode === "all" ? 
                prevIndex = state.queue.length - 1  : prevIndex = 0;
        }

        set({
            currentSong: state.queue[prevIndex],

            currentIndex: prevIndex,

            progress: 0,

            isPlaying: true
        });
    },
    
    seek: time => {
        set({
            progress: time
        });
    },
    
    setVolume: volume => {
        set({
            volume
        });
    },

    setProgress: progress => {
        set({
            progress
        });
    },

    setDuration: duration => {
        set({
            duration
        });
    },

    toggleRepeat: () => {
        set(state => {
            const modes: RepeatMode[] = ["none", "all", "one"];

            const index = modes.indexOf(state.repeatMode);

            return {
                repeatMode: modes[(index + 1) % modes.length]
            };
        });
    },

    toggleShuffle: () => {
        set(state => ({
            isShuffle: !state.isShuffle
        }));
    }
}));