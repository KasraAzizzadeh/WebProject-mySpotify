'use client';

import { useEffect, useRef } from "react";

import { usePlayerStore } from "@/store/playerStore";

export default function AudioManager() {

    const audioRef = useRef<HTMLAudioElement>(null);

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
            setProgress(audio.currentTime);
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