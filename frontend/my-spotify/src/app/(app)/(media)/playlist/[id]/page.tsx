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

export default function PlaylistPage() {
  const { id } = useParams<{ id: string }>();
  const { user: authUser } = useAuth();
  const heroRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  const setQueue = usePlayerStore((s) => s.setQueue);
  const addToQueue = usePlayerStore((s) => s.addToQueue);

  const [playlist, setPlaylist] = useState<PlaylistItem | null>(null);
  const [songs, setSongs] = useState<SongItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedSongId, setSelectedSongId] = useState("");
  const [ownerName, setOwnerName] = useState<string>("User");

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

  useEffect(() => {
    if (!id) return;
    if (!authUser) {
      router.push("/login");
      return;
    }

    const loadPlaylist = async () => {
      try {
        setLoading(true);

        const playlistData = await getPlaylistById(id);

        if (!playlistData) {
          setPlaylist(null);
          setLoading(false);
          return;
        }

        const songsData: SongItem[] = await getSongsByPlaylistId(id);

        setPlaylist(playlistData);
        setSongs(songsData);

        if (playlistData.ownerId === authUser.id) {
          setOwnerName(authUser.displayName || "You");
        } else {
          const ownerProfile = await userService.getUserProfile(playlistData.ownerId);
          setOwnerName(ownerProfile?.displayName || "User");
        }

      } catch (error) {
        console.error("Error loading playlist detail screen:", error);
        setPlaylist(null);
      } finally {
        setLoading(false);
      }
    };

    loadPlaylist();
  }, [id, authUser, router]);

  const remove = async (songId: string) => {
    if (!playlist) return;

    const updatedPlaylist = await removeSongFromPlaylist(songId, playlist.id);
    setPlaylist(updatedPlaylist);
    
    const updatedSongs = songs.filter(s => s.id !== songId);
    setSongs(updatedSongs);
    setSelectedSongId("");
  };
  
  if (loading) {
    return <div className="p-8 text-neutral-400">Loading playlist environment...</div>;
  }

  if (!playlist) {
    notFound();
  }

  const handlePlayPlaylist = () => {
    setQueue(songs, {type: "playlist", id: playlist.id}, songs[0]);
  }
  
  const handlePlaySong = (song : SongItem) => {
    setQueue(songs, {type: "playlist", id: playlist.id}, song);
  }

  const handleAddPlaylist = () => {
    addToQueue(songs, {type: "playlist", id: playlist.id})
  }

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
          onSave={(playlist: PlaylistItem) => {
            setPlaylist(playlist);
            setShowEdit(false);
          }}
          onClose={() => setShowEdit(false)}
        />
      )}
    </main>
  );
}