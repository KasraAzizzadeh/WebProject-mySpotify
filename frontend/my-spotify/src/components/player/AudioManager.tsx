'use client';

import { useEffect, useRef } from "react";

import { usePlayerStore } from "@/store/playerStore";
import { updateStreams } from "@/services/mediaService";

const LISTEN_THRESHHOLD = 15;

export default function AudioManager() {

    const audioRef = useRef<HTMLAudioElement>(null);
    const listenedSeconds = useRef(0);
    const lastTimeRef = useRef(0);
    const streamRegistered = useRef(false);
    const alreadyUpdated = useRef(false);

    const currentSong = usePlayerStore(s => s.currentSong);
    const isPlaying = usePlayerStore(s => s.isPlaying);
    const volume = usePlayerStore(s => s.volume);
    const setProgress = usePlayerStore(s => s.setProgress);
    const setDuration = usePlayerStore(s => s.setDuration);

    // create audio once

    useEffect(() => {

        audioRef.current = new Audio();

        const audio = audioRef.current;

        const updateTime = () => {
            const audio = audioRef.current;
            if (!audio) return;

            const current = audio.currentTime;

            setProgress(current);

            const delta = current - lastTimeRef.current;

            if (!streamRegistered.current && delta > 0 && delta < 1.5) {
                listenedSeconds.current += delta;
                lastTimeRef.current = current;
            }

            if (listenedSeconds.current > LISTEN_THRESHHOLD) {
                streamRegistered.current = true;
            }

            if (!alreadyUpdated.current && streamRegistered.current) {
                alreadyUpdated.current = true;

                const song = usePlayerStore.getState().currentSong;
                if (song) {
                    updateStreams(song.id);
                }
            }
        };

        const updateDuration = () => {
            setDuration(audio.duration);
        };

        const handleEnded = () => {
            const { repeatMode, nextTrack } = usePlayerStore.getState();

            if (repeatMode === "one") {
                audio.currentTime = 0;
                audio.play();
                return;
            }

            nextTrack();
        };

        audio.addEventListener("timeupdate", updateTime);

        audio.addEventListener("loadedmetadata", updateDuration);

        audio.addEventListener("ended", handleEnded);

        return () => {

            audio.pause();

            audio.removeEventListener("timeupdate", updateTime);

            audio.removeEventListener("loadedmetadata", updateDuration);

            audio.removeEventListener("ended", handleEnded);

        };

    }, []);

    // song changed

    useEffect(() => {

        if (!audioRef.current || !currentSong)
            return;

        audioRef.current.src =
            currentSong.audioUrl ??
            `/songs/${currentSong.id}.mp3`;

        audioRef.current.currentTime = 0;

        listenedSeconds.current = 0;
        lastTimeRef.current = 0;
        streamRegistered.current = false;
        alreadyUpdated.current = false;

        if (isPlaying)
            audioRef.current.play();

    }, [currentSong]);

    // play pause

    useEffect(() => {

        if (!audioRef.current)
            return;

        if (isPlaying)
            audioRef.current.play();

        else
            audioRef.current.pause();

    }, [isPlaying]);

    // volume

    useEffect(() => {

        if (!audioRef.current)
            return;

        audioRef.current.volume = volume;

    }, [volume]);

    // seeking

    const progress = usePlayerStore(s => s.progress);

    useEffect(() => {

        if (!audioRef.current)
            return;

        if (Math.abs(audioRef.current.currentTime - progress) > 0.25)
            audioRef.current.currentTime = progress;

    }, [progress]);

    return null;
}