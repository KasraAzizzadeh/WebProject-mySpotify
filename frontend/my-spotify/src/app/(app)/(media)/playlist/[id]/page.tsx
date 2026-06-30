"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { useAuth } from '@/contexts/AuthContext';

import { PlaylistItem, SongItem } from "@/types";
import { getPlaylistById, getSongsByPlaylistId } from "@/services/mediaService";
import SongEntry from "@/components/music/SongEntry";
import SongTableHeader from "@/components/music/TableHead";

export default function PlaylistPage() {
  const { id } = useParams<{ id: string }>();
  const { user: authUser } = useAuth();

  const [playlist, setPlaylist] = useState<PlaylistItem | null>(null);
  const [songs, setSongs] = useState<SongItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

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
      } catch (error) {
        console.error("Error loading playlist detail screen:", error);
        setPlaylist(null);
      } finally {
        setLoading(false);
      }
    };

    loadPlaylist();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-neutral-400">Loading playlist environment...</div>;
  }

  if (!playlist) {
    notFound();
  }

  const isOwner = authUser?.id === playlist.ownerId;

  return (
    <main className="p-8 space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-white">{playlist.name}</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Playlist • {songs.length} {songs.length === 1 ? 'song' : 'songs'}
        </p>
      </div>

      {songs.length === 0 ? (
        <div className="text-sm text-neutral-500 py-12 border-t border-neutral-800">
          This playlist is empty. Songs you add will show up here.
        </div>
      ) : (
        <>
          <SongTableHeader />
          <div className="mt-4 space-y-3">
            {songs.map((song, index) => (
              <SongEntry
                key={song.id}
                song={song}
                trackNumber={index + 1} // Starts tracks cleanly at position #1
                hasPermission={isOwner}
                subscriptionType={authUser?.subscriptionType || "basic"}
              />
            ))}
          </div>
        </>
      )}
    </main>
  );
}