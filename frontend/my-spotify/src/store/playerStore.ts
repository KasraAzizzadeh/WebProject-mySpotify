import { create } from "zustand";
import { SongItem, PlaybackSource } from "@/types";
import { stat } from "fs";

type RepeatMode = "none" | "all" | "one";

interface QueueItem {
    song: SongItem;
    source: PlaybackSource;
}

interface PlayerStore {
    currentSong: SongItem | null;

    originalQueue: QueueItem[];
    playQueue: QueueItem[];
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
        index: number,
    ) => void;

    setQueue: (
        songs: SongItem[],
        source: PlaybackSource,
        startSong?: SongItem
    ) => void;

    addToQueue: (
        songs: SongItem[],
        source: PlaybackSource
    ) => void;

    clearQueue: () => void;

    togglePlayPause: () => void;

    nextTrack: () => void;

    prevTrack: () => void;

    seek: (time: number) => void;

    setVolume: (volume: number) => void;

    setProgress: (time: number) => void;

    setDuration: (duration: number) => void;

    toggleRepeat: () => void;

    toggleShuffle: () => void;

    resetPlayer: () => void;
}

const makeQueue = (songs: SongItem[], source: PlaybackSource) : QueueItem[] => {
    return songs.map(song => ({song, source}));
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
    
    currentSong: null,
    
    originalQueue: [],

    playQueue: [],
    
    currentIndex: -1,
    
    isPlaying: false,
    
    progress: 0,
    
    duration: 0,
    
    volume: 1,
    
    repeatMode: "none",
    
    isShuffle: false,
    
    playbackSource: null,

    playSong: (song, index) => {
        const state = get();

        const item = state.playQueue[index];
        
        set({
            currentSong: item.song,
            playbackSource: item.source,
            currentIndex: index,
            progress: 0,
            isPlaying: true
        });
    },

    setQueue: (songs, source, startSong) => {
        const queue = makeQueue(songs, source);

        const firstSong = startSong ?? songs[0];
        
        const index = Math.max(
            0,
            queue.findIndex(q => q.song.id === firstSong.id)
        );

        set({
            originalQueue: queue,
            playQueue: queue,

            currentSong: firstSong,
            playbackSource: source,
            currentIndex: index,

            isPlaying: true,
            progress: 0
        })
    },

    addToQueue: (songs, source) => {        
        const state = get();
        const newQueue = makeQueue(songs, source);

        const updatedOriginal = [
            ...state.originalQueue,
            ...newQueue
        ];

        const updatedPlay = state.isShuffle
            ? [...state.playQueue, ...newQueue]
            : updatedOriginal;

        set({
            originalQueue: updatedOriginal,
            playQueue: updatedPlay,
        });
    },

    clearQueue: () => {
        set({
            originalQueue: [],
            playQueue: [],

            currentSong: null,
            playbackSource: null,
            currentIndex: -1,

            isPlaying: false,
            duration: 0,
            progress: 0
        })
    },

    togglePlayPause: () => {
        set(state => ({
            isPlaying: !state.isPlaying
        }));
    },

    nextTrack: () => {
        const state = get();

        let nextIndex = state.currentIndex + 1;

        if (nextIndex >= state.playQueue.length) {

            if (state.repeatMode === "all")
                nextIndex = 0;
            else {
                set({ isPlaying: false });
                return;
            }
        }

        const item = state.playQueue[nextIndex];

        set({
            currentIndex: nextIndex,
            currentSong: item.song,
            playbackSource: item.source,
            progress: 0,
            isPlaying: true
        });
    },

    prevTrack: () => {
        const state = get();

        let prevIndex = state.currentIndex - 1;

        if (prevIndex < 0) {
            state.repeatMode === "all" ? 
                prevIndex = state.playQueue.length - 1  : prevIndex = 0;
        }

        const item = state.playQueue[prevIndex];

        set({
            currentSong: item.song,
            playbackSource: item.source,
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
        const state = get();

        if (state.currentIndex === -1)
            return;

        const currentSong = state.currentSong!;
        let playQueue = [...state.originalQueue];

        if (!state.isShuffle) {
            const currentIndex = playQueue.findIndex(
                q => q.song.id === currentSong.id
            );

            const remaining = playQueue.slice(currentIndex + 1);

            // Fisher-Yates
            for (let i = remaining.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [remaining[i], remaining[j]] =
                    [remaining[j], remaining[i]];
            }

            playQueue = [
                ...playQueue.slice(0, currentIndex + 1),
                ...remaining
            ];
        }

        const newIndex = playQueue.findIndex(
            q => q.song.id === currentSong.id
        );

        set({
            isShuffle: !state.isShuffle,
            playQueue,
            currentIndex: newIndex,
            currentSong,
            playbackSource: playQueue[newIndex].source
        });
    }, 

    resetPlayer: () => {
        set({
            currentSong: null,

            originalQueue: [],
            playQueue: [],
            currentIndex: -1,

            playbackSource: null,

            isPlaying: false,

            progress: 0,
            duration: 0,

            volume: 1,

            repeatMode: "none",
            isShuffle: false,
        });
    },

}));