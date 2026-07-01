"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, notFound, useRouter } from "next/navigation";
import { useAuth } from '@/contexts/AuthContext';

import { AlbumItem, SongItem } from "@/types";
import { getAlbumById, getSongById, getSongsByAlbumId } from "@/services/mediaService";
import SongEntry from "@/components/music/SongEntry";
import SongTableHeader from "@/components/music/TableHead";
import HeroCard from "@/components/music/AlbumHero";
import StickyBar from "@/components/music/StickyBar";
import AddToPlaylistModal from "@/components/music/AddToPlaylistModal";

export default function AlbumPage() {
  const { id } = useParams<{ id: string }>();
  const { user: authUser } = useAuth();
  const heroRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [album, setAlbum] = useState<AlbumItem | null>(null);
  const [songs, setSongs] = useState<SongItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [selectedSongId, setSelectedSongId] = useState("");

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
  
  useEffect(() => {
    if (!id) return;

    if (!authUser) router.push("/login");

    const loadAlbum = async () => {
      setLoading(true);

      const albumData = await getAlbumById(id);

      if (!albumData) {
        setAlbum(null);
        setLoading(false);
        return;
      }

      const songsData : SongItem[] = await getSongsByAlbumId(id);

      setAlbum(albumData);
      setSongs(songsData);
      setLoading(false);
    };

    loadAlbum();
  }, [id]);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!album) {
    notFound();
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
      {/* is buggy, needs to just be on top of album page */}
      <StickyBar
        album={album}
        visible={showStickyBar}
      />

      <HeroCard
        item={album}
        type="album"
        duration={songs.reduce((acc, song) => {return acc + (song.songDurationMs || 0);}, 0)}
        heroRef={heroRef}
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
              showAlbum={false}
              onAdd={(songId: string) => setSelectedSongId(songId)}
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