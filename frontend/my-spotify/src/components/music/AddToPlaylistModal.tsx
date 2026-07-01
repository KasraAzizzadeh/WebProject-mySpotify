'use client';

import { useEffect, useState } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { X } from 'lucide-react';
import { PlaylistItem, UserProfile } from '@/types';
import { getUserPlaylists, addSongToPlaylist } from '@/services/mediaService';
import Alert from '../ui/Alert';

interface CreatePlaylistModalProps {
  songId: string;
  user: UserProfile;
  onClose: () => void;
}

export default function AddToPlaylistModal({ songId, user, onClose }: CreatePlaylistModalProps) {
  const [playlists, setPlaylists] = useState<PlaylistItem[]>([]);
  const [alert, setAlert] = useState('');
  const [searchInput, setSeachInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPlaylists = async () => {
        if (!user) return;

        try {
            setLoading(true);
            const fetchedPlaylists = await getUserPlaylists(user.listenerProfile?.playlists || [])
            setPlaylists(fetchedPlaylists)
        } catch (error) {
            console.error("Failed fetching user specific playlists", error);
        } finally {
            setLoading(false)
        }
    }

    fetchPlaylists();
  }, []);

  const filteredPlaylists = playlists.filter((playlist) =>
    playlist.name.toLowerCase().includes(searchInput.toLowerCase())
  );

  const handlePlaylistClick = async (playlist: PlaylistItem) => {
    try {
      setIsSubmitting(true);
      setAlert("");
      await addSongToPlaylist(songId, playlist.id)
      onClose();
    } catch (err: any) {
      setAlert(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-neutral-400">Loading your playlists...</div>;


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 animate-fade-in">
        <div className="relative flex w-full max-w-lg max-h-[90vh] flex-col overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold text-white">
            Add to Playlist
            </h3>

            <button
            onClick={onClose}
            className="text-neutral-400 transition hover:text-red-500"
            disabled={isSubmitting}
            >
            <X size={20} />
            </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col overflow-hidden p-4 sm:p-6 gap-4">

            <Input
            placeholder="Find a playlist"
            variant="search"
            value={searchInput}
            onChange={(e) => setSeachInput(e.target.value)}
            disabled={isSubmitting}
            autoFocus
            />

            {/* Playlist list */}
            <div className="max-h-48 overflow-y-auto border border-neutral-800 divide-y divide-neutral-800">
            {filteredPlaylists.length === 0 ? (
                <div className="p-6 text-center text-sm text-neutral-500">
                <p>No playlists found.</p>

                <Link
                    href="/playlists"
                    className="mt-2 inline-block text-green-500 hover:underline"
                >
                    Create your first playlist
                </Link>
                </div>
            ) : (
                filteredPlaylists.map((playlist) => (
                <button
                    key={playlist.id}
                    type="button"
                    onClick={() => handlePlaylistClick(playlist)}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 text-left transition-colors hover:bg-neutral-800 disabled:opacity-50"
                >
                    <p className="font-medium text-white truncate">
                    {playlist.name}
                    </p>
                </button>
                ))
            )}
            </div>

            {alert && <Alert message={alert} />}
        </div>
        </div>
    </div>
    );
}