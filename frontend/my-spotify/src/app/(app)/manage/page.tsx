'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { usePlayerStore } from '@/store/playerStore';
import { AlbumItem, SongItem, UserProfile, PlaybackSource } from '@/types';

import { useArtistDashboard } from "@/hooks/queries/artist/useArtistDashboard";
import { useCreateRelease } from "@/hooks/queries/artist/useCreateRelease";
import { useUpdateRelease } from "@/hooks/queries/artist/useUpdateRelease";
import { useDeleteRelease } from '@/hooks/queries/artist/useDeleteRelease';

import Button from '@/components/ui/Button';
import Message from '@/components/ui/Message';
import Cover from '@/components/ui/Cover';
import ArtistAnalytics from '@/components/manage/ArtistAnalytics';
import ReleaseForm, { ReleaseFormState } from '@/components/manage/ReleaseForm';
import EditAlbumModal, { TrackEditData } from '@/components/music/EditAlbumModal';

import { ShieldAlert, Plus, Trash2, Edit2, Music, ChevronLeft, Loader2 } from 'lucide-react';

export default function ManagePage() {
  const router = useRouter();
  const { user: authUser } = useAuth() as any;

  const setQueue = usePlayerStore((s) => s.setQueue);

  const [viewState, setViewState] = useState<'dashboard' | 'create'>('dashboard');

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingRelease, setEditingRelease] = useState<AlbumItem | null>(null);

  const {
    data: dashboardData,
    isLoading: isInitializing,
  } = useArtistDashboard(authUser?.id);

  const dbUser = (dashboardData?.user ?? null) as UserProfile | null;
  const myReleases: AlbumItem[] = dashboardData?.releases ?? [];
  const mySongs: SongItem[] = dashboardData?.songs ?? [];

  const handlePlaySong = (song: SongItem) => {
    const sourceContext = 'album' as unknown as PlaybackSource;
    if (setQueue) {
      setQueue([song], sourceContext, song);
    } else {
      usePlayerStore.setState({
        originalQueue: [{ song, source: sourceContext }],
        playQueue: [{ song, source: sourceContext }],
        currentSong: song,
        playbackSource: sourceContext,
        currentIndex: 0,
        isPlaying: true,
        progress: 0
      });
    }
  };

  const createRelease = useCreateRelease();
  const updateRelease = useUpdateRelease();
  const deleteRelease = useDeleteRelease();

  const handleSaveRelease = (formData: ReleaseFormState) => {
    if (!dbUser) return;

    createRelease.mutate(
      {
        dbUser,
        formData,
      },
      {
        onSuccess: () => {
          setViewState("dashboard");
        },
      }
    );
  };

  const handleUpdateRelease = (
    updatedRelease: AlbumItem,
    newImageFile?: File,
    updatedTracks?: TrackEditData[]
  ) => {
    updateRelease.mutate(
      {
        release: updatedRelease,
        image: newImageFile,
        tracks: updatedTracks,
      },
      {
        onSuccess: () => {
          setEditingRelease(null);
        },
      }
    );
  };

  const executeDelete = () => {
    if (!deletingId || !dbUser) return;

    deleteRelease.mutate(
      {
        userId: dbUser.id,
        releaseId: deletingId,
      },
      {
        onSuccess: () => {
          setDeletingId(null);
        },
      }
    );
  };

  if (isInitializing) {
    return (
      <div className="h-[calc(100vh-112px)] flex items-center justify-center text-neutral-400">
        <Loader2 className="w-8 h-8 animate-spin opacity-50" />
      </div>
    );
  }

  const isVerifiedArtist = dbUser?.role === 'artist';

  if (!isVerifiedArtist) {
    return (
      <div className="h-[calc(100vh-112px)] flex flex-col items-center justify-center text-neutral-400 gap-4 w-full px-4 text-center">
        <ShieldAlert className="w-16 h-16 text-yellow-500/50" />
        <h2 className="text-xl font-bold text-white tracking-tight">Access Restricted</h2>
        <p className="max-w-md text-sm">
          Content management is exclusively available to approved artists.
        </p>
      </div>
    );
  }

  if (viewState === 'dashboard') {
    return (
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-12 px-4 sm:px-6 mt-6 sm:mt-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Artist Hub</h1>
            <p className="text-sm text-neutral-500 mt-1">Manage your discography and track live publication analytics.</p>
          </div>
          <Button
            onClick={() => setViewState('create')}
            className="sm:w-auto !py-2.5 !px-6 flex items-center justify-center gap-2"
          >
            <Plus size={18} /> New Release
          </Button>
        </div>

        <ArtistAnalytics myReleases={myReleases} mySongs={mySongs} />

        <div className="bg-[#121212] border border-neutral-800/50 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-neutral-800/50">
            <h2 className="font-bold text-white tracking-tight">My Published Works</h2>
          </div>

          {myReleases.length === 0 ? (
            <div className="p-12 text-center text-neutral-500 text-sm">
              <Music className="w-12 h-12 mx-auto mb-3 opacity-20" />
              You haven't published any releases yet.
            </div>
          ) : (
            <div className="divide-y divide-neutral-800/50">
              {myReleases.map((release: AlbumItem) => {
                const releaseStreams = release.songList.reduce((sum: number, id: string) => {
                  const s = mySongs.find((song: SongItem) => song.id === id);
                  return sum + (s?.streams || 0);
                }, 0);

                const isSingle = release.releaseType === 'single';
                const singleTargetSong = isSingle ? mySongs.find((s: SongItem) => s.id === release.id) : null;

                const handleOpenRelease = () => {
                  router.push(`/album/${release.id}`);
                };

                return (
                  <div
                    key={release.id}
                    onClick={handleOpenRelease}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        handleOpenRelease();
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    className="group cursor-pointer p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition select-none hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] hover:bg-neutral-900/40 focus:outline-none focus:ring-2 focus:ring-green-500/40"
                  >
                    <div className="flex items-center gap-4 w-full sm:w-auto min-w-0">
                      <div className="relative shrink-0 shadow-md overflow-hidden rounded">
                        <Cover src={release.imageUrl} alt={release.name} size={60} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold truncate text-white">
                            {release.name}
                          </h3>
                          <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 shrink-0">
                            {release.releaseType || 'Album'}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 truncate mt-0.5">
                          {release.genre || 'Unknown Genre'} • {release.releaseDate ? new Date(release.releaseDate).getFullYear() : 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between w-full sm:w-auto gap-6 sm:gap-8">
                      <div className="flex gap-4 sm:gap-8 text-right shrink-0">
                        <div>
                          <p className="text-[10px] text-neutral-500 font-bold uppercase">Streams</p>
                          <p className="text-sm font-mono text-white mt-0.5">{releaseStreams.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-neutral-500 font-bold uppercase">Revenue</p>
                          <p className="text-sm font-mono text-green-400 mt-0.5">${(releaseStreams * 0.004).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingRelease(release);
                          }}
                          className="p-2 text-neutral-400 hover:text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition"
                          title="Edit Metadata"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingId(release.id);
                          }}
                          className="p-2 text-red-400 hover:text-white hover:bg-red-500/20 bg-neutral-900 rounded-lg transition"
                          title="Delete Release"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <Message
          isOpen={deletingId !== null}
          title="Delete Release?"
          description="Are you sure you want to permanently delete this release? All associated tracks and streaming histories will be lost."
          confirmLabel="Delete"
          isDangerous={true}
          onConfirm={executeDelete}
          onCancel={() => setDeletingId(null)}
        />

        {editingRelease && (
          <EditAlbumModal
            release={editingRelease}
            releaseSongs={mySongs.filter((s: SongItem) => editingRelease.songList.includes(s.id))}
            onSave={handleUpdateRelease}
            onClose={() => setEditingRelease(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-24 px-4 sm:px-6 mt-6 sm:mt-10">
      <button
        onClick={() => setViewState('dashboard')}
        className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition"
      >
        <ChevronLeft size={16} /> Back to Dashboard
      </button>
      <ReleaseForm onCancel={() => setViewState('dashboard')} onSave={handleSaveRelease} />
    </div>
  );
}