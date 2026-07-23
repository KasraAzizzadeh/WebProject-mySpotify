'use client';

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePlayerStore } from "@/store/playerStore";
import { updateStreams } from "@/services/mediaService";
import { canPlaySong } from "@/utils/mediaUtils";
import Message from "../ui/Message";

const LISTEN_THRESHHOLD = 45;

async function playAudioSafely(audio: HTMLAudioElement) {
    try {
        await audio.play();
    } catch (error) {
        const isExpectedInterruption =
            error instanceof DOMException &&
            (error.name === "AbortError" || error.name === "NotAllowedError");

        if (!isExpectedInterruption) {
            console.warn("Audio playback could not start:", error);
        }
    }
}

export default function AudioManager() {

    const audioRef = useRef<HTMLAudioElement>(null);
    const listenedSeconds = useRef(0);
    const lastTimeRef = useRef(0);
    const streamRegistered = useRef(false);
    const alreadyUpdated = useRef(false);

    const {user: authUser} = useAuth();
    const [message, setMessage] = useState({
        isOpen: false,
        title: "",
        description: "",
    });

    const closeMessage = () => {
        setMessage({
            isOpen: false,
            title: "",
            description: "",
        });
    };

    const currentSong = usePlayerStore(s => s.currentSong);
    const isPlaying = usePlayerStore(s => s.isPlaying);
    const volume = usePlayerStore(s => s.volume);
    const setProgress = usePlayerStore(s => s.setProgress);
    const setDuration = usePlayerStore(s => s.setDuration);
    const resetPlayer = usePlayerStore(s => s.resetPlayer);

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
                const playbackSource = usePlayerStore.getState().playbackSource;
                if (song && authUser && playbackSource) {
                    updateStreams(authUser?.id, song.id, playbackSource);
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
                void playAudioSafely(audio);
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

        if (isPlaying && authUser && !canPlaySong(authUser.id)) {
            setMessage({
                isOpen: true,
                title: "Daily limit reached",
                description:
                    "You have reached your daily listening limit. Upgrade your subscription to continue listening.",
            });

            audioRef.current.pause();
            resetPlayer();
            return;
        }


        audioRef.current.src =
            currentSong.audioUrl ??
            `/songs/${currentSong.id}.mp3`;

        audioRef.current.currentTime = 0;

        listenedSeconds.current = 0;
        lastTimeRef.current = 0;
        streamRegistered.current = false;
        alreadyUpdated.current = false;


        if (isPlaying) {
            void playAudioSafely(audioRef.current);
        }

    }, [currentSong]);

    // play pause

    useEffect(() => {

        if (!audioRef.current)
            return;

        if (isPlaying) {
            void playAudioSafely(audioRef.current);
        } else {
            audioRef.current.pause();
        }

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

    return (
        <Message
            isOpen={message.isOpen}
            title={message.title}
            description={message.description}
            type="alert"
            onConfirm={closeMessage}
        />
    );
}