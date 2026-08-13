'use client';

import { useEffect, useRef, useState } from "react";
import { usePlayerStore } from "@/store/playerStore";
import { getSongStreamUrl, registerSongStream } from "@/services/mediaService";
import { ApiError } from "@/services/api";
import Message from "../ui/Message";

const LISTEN_THRESHOLD = 60;

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
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const listenedSeconds = useRef(0);
  const lastTimeRef = useRef(0);
  const streamRegistered = useRef(false);
  const alreadyUpdating = useRef(false);

  const [message, setMessage] = useState({
    isOpen: false,
    title: "",
    description: "",
  });

  const currentSong = usePlayerStore((s) => s.currentSong);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const volume = usePlayerStore((s) => s.volume);
  const progress = usePlayerStore((s) => s.progress);

  const setProgress = usePlayerStore((s) => s.setProgress);
  const setDuration = usePlayerStore((s) => s.setDuration);
  const resetPlayer = usePlayerStore((s) => s.resetPlayer);
  const nextTrack = usePlayerStore((s) => s.nextTrack);

  const closeMessage = () => {
    setMessage({
      isOpen: false,
      title: "",
      description: "",
    });
  };

  /*
   * Create audio element once.
   */
  useEffect(() => {
    const audio = new Audio();

    audioRef.current = audio;

    const updateTime = () => {
      const current = audio.currentTime;

      setProgress(current);

      const delta = current - lastTimeRef.current;

      /*
       * Only count normal forward playback.
       * This prevents seeking from contributing to the
       * stream threshold.
       */
      if (
        !streamRegistered.current &&
        delta > 0 &&
        delta < 1.5
      ) {
        listenedSeconds.current += delta;
      }

      lastTimeRef.current = current;

      if (
        !streamRegistered.current &&
        listenedSeconds.current >= LISTEN_THRESHOLD
      ) {
        streamRegistered.current = true;
        registerStream();
      }
    };

    const updateDuration = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      const { repeatMode } = usePlayerStore.getState();

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

      audio.src = "";
      audioRef.current = null;
    };
  }, []);

  /*
   * Register the stream once the listening threshold is reached.
   */
  const registerStream = async () => {
    const song = usePlayerStore.getState().currentSong;

    if (!song || alreadyUpdating.current) {
      return;
    }

    alreadyUpdating.current = true;

    try {
      await registerSongStream(song.id);
    } catch (error) {
      console.error("Failed to register song stream:", error);
    }
  };

  /*
   * Load a new song.
   */
  useEffect(() => {
    const audio = audioRef.current;

    if (!audio || !currentSong) {
      return;
    }

    let cancelled = false;

    const loadSong = async () => {
      /*
       * Reset stream tracking for the new song.
       */
      listenedSeconds.current = 0;
      lastTimeRef.current = 0;
      streamRegistered.current = false;
      alreadyUpdating.current = false;

      audio.pause();
      audio.currentTime = 0;
      audio.removeAttribute("src");
      audio.load();

      try {
        const audioUrl = await getSongStreamUrl(currentSong.id);

        if (cancelled) {
          return;
        }

        audio.src = audioUrl || "";
        audio.load();

        if (usePlayerStore.getState().isPlaying) {
          await playAudioSafely(audio);
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        if (error instanceof ApiError) {
          setMessage({
            isOpen: true,
            title: "Unable to play song",
            description: error.getFirstError(),
          });
        } else {
          setMessage({
            isOpen: true,
            title: "Unable to play song",
            description: "Something went wrong while loading the song.",
          });
        }

        resetPlayer();
      }
    };

    void loadSong();

    return () => {
      cancelled = true;
    };
  }, [currentSong]);

  /*
   * Play / pause.
   */
  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (isPlaying) {
      void playAudioSafely(audio);
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  /*
   * Volume.
   */
  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.volume = volume;
  }, [volume]);

  /*
   * Seeking.
   */
  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (Math.abs(audio.currentTime - progress) > 0.25) {
      audio.currentTime = progress;
      lastTimeRef.current = progress;
    }
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