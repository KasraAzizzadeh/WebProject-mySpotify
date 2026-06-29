"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { useAuth } from '@/contexts/AuthContext';

import { AlbumItem, SongItem } from "@/types";
import { getAlbumById, getSongById, getSongsByAlbumId } from "@/services/mediaService";
import SongEntry from "@/components/music/SongEntry";
import SongTableHeader from "@/components/music/TableHead";

export default function AlbumPage() {
  const { id } = useParams<{ id: string }>();
  const { user: authUser } = useAuth();

  const [album, setAlbum] = useState<AlbumItem | null>(null);
  const [songs, setSongs] = useState<SongItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

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
    <main className="p-8">
      <h1 className="text-4xl font-bold">{album.name}</h1>
      <p className="text-gray-500">{album.artistName}</p>

      <SongTableHeader/>
      <div className="mt-12 space-y-3">
        {songs.map((song, index) => (
          <SongEntry
            key={song.id}
            song={song}
            trackNumber={index}
            hasPermission={authUser?.id === album.artistId}
            subscriptionType={authUser?.subscriptionType || "basic"}
          />
        ))}
      </div>
    </main>
  );
}