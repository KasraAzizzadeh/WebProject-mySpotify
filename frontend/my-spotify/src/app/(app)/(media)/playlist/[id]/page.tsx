"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, notFound, useRouter } from "next/navigation";
import { useAuth } from '@/contexts/AuthContext';
import { usePlayerStore } from "@/store/playerStore";

import { PlaylistItem, SongItem } from "@/types";
import { getPlaylistById, getSongsByPlaylistId, removeSongFromPlaylist } from "@/services/mediaService";
import { userService } from "@/services/userService";
import SongEntry from "@/components/music/SongEntry";
import SongTableHeader from "@/components/music/TableHead";
import HeroCard from "@/components/music/AlbumHero";
import StickyBar from "@/components/music/StickyBar";
import DeleteFromPlaylistModal from "@/components/music/DeleteFromPlaylistModal";
import EditPlaylistModal from "@/components/music/EditPlaylistModal";
import { usePlaylist } from "@/hooks/queries/media/usePlaylist";
import { usePlaylistSongs } from "@/hooks/queries/media/usePlaylistSongs";
import { usePlaylistOwner } from "@/hooks/queries/media/usePlaylistOwner";
import { useRemovePlaylistSong } from "@/hooks/queries/media/useRemovePlaylistSong";

export default function PlaylistPage() {
  const { id } = useParams<{ id: string }>();
  const { user: authUser } = useAuth();
  const heroRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  const setQueue = usePlayerStore((s) => s.setQueue);
  const addToQueue = usePlayerStore((s) => s.addToQueue);

  const [showStickyBar, setShowStickyBar] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedSongId, setSelectedSongId] = useState("");

  const {
    data: playlist,
    isLoading: playlistLoading,
    isError: playlistError
  } = usePlaylist(id);

  const {
    data: songs = [],
    isLoading: songsLoading,
  } = usePlaylistSongs(id);

  const ownerProfile = usePlaylistOwner(playlist?.ownerId, authUser?.id);

  const removeSongMutation = useRemovePlaylistSong(id);

  const loading = playlistLoading || songsLoading;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyBar(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => observer.disconnect();
  }, [loading]);

  if (!authUser) {
    router.push("/login");
    return;
  }

  if (loading) {
    return <div className="p-8 text-neutral-400">Loading playlist environment...</div>;
  }

  if (playlistError || !playlist) {
    notFound();
  }


  const remove = async (songId: string) => {
    if (!playlist) return;

    removeSongMutation.mutate(songId, {
      onSuccess: () => setSelectedSongId(""),
      onError: (error) => console.error("Failed to remove song:", error),
    })
  };

  const handlePlayPlaylist = () => {
    if (songs.length === 0) return;
    setQueue(songs, {type: "playlist", id: playlist.id}, songs[0]);
  }
  
  const handlePlaySong = (song : SongItem) => {
    setQueue(songs, {type: "playlist", id: playlist.id}, song);
  }

  const handleAddPlaylist = () => {
    if (songs.length === 0) return;
    addToQueue(songs, {type: "playlist", id: playlist.id})
  }

  const ownerName =
        playlist.ownerId === authUser.id
            ? authUser.displayName || "You"
            : ownerProfile.data?.displayName || "User";
  
  const isOwner = authUser?.id === playlist.ownerId;

  return (
    <main
      className="relative min-h-screen px-1 md:px-2 rounded-lg"
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
      <StickyBar
        album={playlist as any}
        visible={showStickyBar}
      />

      <HeroCard
        item={playlist}
        type="playlist"
        duration={songs.reduce((acc, song) => acc + (song.songDurationMs || 0), 0)}
        heroRef={heroRef}
        ownerName={ownerName}
        edit={isOwner}
        handlePlay={() => {handlePlayPlaylist()}}
        handleAdd={() => {handleAddPlaylist()}}
        handleEdit={() => {setShowEdit(true)}}
      />

      <div className="px-4 md:px-8 overflow-x-hidden">
        <SongTableHeader showAlbum={true} showStreams={authUser?.subscriptionType !== "basic"} />
        
        {songs.length === 0 ? (
          <div className="text-sm text-neutral-500 py-12 border-t border-neutral-800 mt-4 text-center">
            This playlist is empty. Songs you add will show up here.
          </div>
        ) : (
          <div className="mt-4 space-y-1.5">
            {songs.map((song, index) => (
              <SongEntry
                key={song.id}
                song={song}
                trackNumber={index}
                hasPermission={isOwner}
                subscriptionType={authUser?.subscriptionType || "basic"}
                handlePlay={(song: SongItem) => {handlePlaySong(song);}}
                showAlbum={true}
                onRemove={(songId: string) => setSelectedSongId(songId)}
                onQueue={(song) => addToQueue([song], {type: "single", id: song.id,})}
              />
            ))}
          </div>
        )}
      </div>

      {selectedSongId && (
        <DeleteFromPlaylistModal
          playlistId={playlist.id}
          songId={selectedSongId}
          onClose={() => setSelectedSongId("")}
          onSuccess={() => remove(selectedSongId)}
        />
      )}

      {showEdit && (
        <EditPlaylistModal
          playlist={playlist}
          onSave={() => {setShowEdit(false);}}
          onClose={() => setShowEdit(false)}
        />
      )}
    </main>
  );
}