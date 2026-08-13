"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, notFound, useRouter } from "next/navigation";
import { useAuth } from '@/contexts/AuthContext';
import { usePlayerStore } from "@/store/playerStore";

import { AlbumItem, SongItem } from "@/types";
import SongEntry from "@/components/music/SongEntry";
import SongTableHeader from "@/components/music/TableHead";
import HeroCard from "@/components/music/AlbumHero";
import StickyBar from "@/components/music/StickyBar";
import AddToPlaylistModal from "@/components/music/AddToPlaylistModal";
import { useAlbum } from "@/hooks/queries/media/useAlbum";
import { useAlbumSongs } from "@/hooks/queries/media/useAlbumSongs";

export default function AlbumPage() {
  const { id } = useParams<{ id: string }>();
  const { user: authUser } = useAuth();
  const heroRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  const playSong = usePlayerStore((s) => s.playSong);
  const setQueue = usePlayerStore((s) => s.setQueue);
  const addToQueue = usePlayerStore((s) => s.addToQueue);

  const [showStickyBar, setShowStickyBar] = useState(false);
  const [selectedSongId, setSelectedSongId] = useState("");

  const {
      data: album,
      isLoading: albumLoading,
      isError: albumError,
  } = useAlbum(id);
  
  const {
      data: songs = [],
      isLoading: songsLoading,
  } = useAlbumSongs(id);

  const loading = albumLoading || songsLoading;
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyBar(!entry.isIntersecting);
      },
      {
        threshold: 0,
      }
    );

    if (heroRef.current)
      observer.observe(heroRef.current);

    return () => observer.disconnect();
  }, [loading]);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (albumError || !album) {
    notFound();
  }  

  const handlePlayAlbum = () => {
    if (songs.length === 0) return;
    setQueue(songs, {type: "album", id: album.id}, songs[0]);
  }
  
  const handlePlaySong = (song : SongItem) => {
    setQueue(songs, {type: "album", id: album.id}, song);
  }

  const handleAddAlbum = () => {
    if (songs.length === 0) return;
    addToQueue(songs, {type: "album", id: album.id})
  }

  return (
    <main
      className="relative min-h-screen px-2 rounded-lg"
        style={{
        background: `
          linear-gradient(
            to bottom,
            rgba(23,23,23,.85) 0%,
            #171717 120px
          )
        `,
      }}
    >
      {/* Sticky top action row tracking block bar */}
      <StickyBar
        album={album}
        visible={showStickyBar}
      />

      <HeroCard
        item={album}
        type="album"
        duration={songs.reduce((acc, song) => {return acc + (song.songDurationMs || 0);}, 0)}
        heroRef={heroRef}
        handlePlay={() => {handlePlayAlbum()}}
        handleAdd={() => {handleAddAlbum()}}
      />

      <div className="px-8">
        <SongTableHeader showAlbum={false} showStreams={authUser?.subscriptionType !== "basic"}/>

        <div className="mt-4 space-y-2">
          {songs.map((song, index) => (
            <SongEntry
              key={song.id}
              song={song}
              trackNumber={index}
              hasPermission={false}
              subscriptionType={
                authUser?.subscriptionType || "basic"
              }
              handlePlay={(song: SongItem) => {handlePlaySong(song);}}
              showAlbum={false}
              showImage={false}
              onAdd={(songId: string) => setSelectedSongId(songId)}
              onQueue={(song) => addToQueue([song], {type: "single", id: song.id,})}
            />
          ))}
        </div>
      </div>

      {selectedSongId && authUser && (
        <AddToPlaylistModal
          songId={selectedSongId}
          user={authUser}
          onClose={() => setSelectedSongId("")}
        />
      )}
    </main>
  );
}