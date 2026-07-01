'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { getUserPlaylists, createPlaylist } from '@/services/mediaService';
import { getUsers } from '@/store/mockDb';
import { PlaylistItem } from '@/types';
import ShowAll from '@/components/ShowAll';
import CreatePlaylistModal from '@/components/CreatePlaylistModal';
import Link from 'next/link';
import { ArrowLeft, Music, Plus } from 'lucide-react';

export default function UserPlaylistsPage() {
  const { user: authUser, updateUser} = useAuth() as any;
  const [playlists, setPlaylists] = useState<PlaylistItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPlaylists = async () => {
    if (!authUser) return;
    try {
      const allUsers = getUsers();
      const freshUser = allUsers.find((u) => u.id === authUser.id);
      const activeUser = freshUser || authUser;

      const playlistIds = activeUser.listenerProfile?.playlists || [];
      const resolvedPlaylists = await getUserPlaylists(playlistIds);
      setPlaylists(resolvedPlaylists);
    } catch (error) {
      console.error("Failed fetching user specific playlists", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, [authUser]);

  const handleCreatePlaylist = async (name: string) => {
    if (!authUser) return;
    
    const { playlist, updatedUser } = await createPlaylist(name, authUser.id);
    
    updateUser(updatedUser);
    
    setPlaylists((prev) => [...(prev || []), playlist]);
  };

  if (!authUser) {
    return (
      <div className="h-screen flex items-center justify-center text-neutral-500 text-sm bg-black">
        Verifying user security context...
      </div>
    );
  }

  if (loading || !playlists) {
    return (
      <div className="h-screen flex items-center justify-center text-neutral-500 text-sm bg-black">
        Loading your music library...
      </div>
    );
  }

  const hasNoPlaylists = playlists.length === 0;

  return (
    <main className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto relative min-h-screen flex flex-col">
      
      {/* HEADER CONTROLS NAVIGATION */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to Home</span>
        </Link>

        {!hasNoPlaylists && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-black bg-green-500 hover:bg-green-400 rounded-full transition-all shadow-md"
          >
            <Plus size={16} />
            <span>Create Playlist</span>
          </button>
        )}
      </div>

      {/* CONDITIONAL BODY RENDER */}
      {hasNoPlaylists ? (
        <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto text-center space-y-6 py-12">
          <div className="p-6 bg-neutral-900 border border-neutral-800/80 text-neutral-400 rounded-2xl shadow-xl">
            <Music size={48} className="mx-auto text-neutral-600 stroke-[1.5]" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">Create your first playlist</h2>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 font-semibold text-black bg-green-500 hover:bg-green-400 rounded-xl transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={18} />
            <span>New Playlist</span>
          </button>
        </div>
      ) : (
        <ShowAll
          title="My Playlists"
          type="playlist"
          items={playlists}
          user={authUser}
        />
      )}

      {/* POPUP OVERLAY ACTION PROMPT TEMPLATE */}
      {isModalOpen && (
        <CreatePlaylistModal
          onClose={() => setIsModalOpen(false)}
          onSave={handleCreatePlaylist}
        />
      )}
    </main>
  );
}