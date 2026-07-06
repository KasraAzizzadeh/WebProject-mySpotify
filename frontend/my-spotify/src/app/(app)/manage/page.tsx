'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AlbumItem, SongItem } from '@/types';
import { getAlbums, getSongs, saveAlbums, saveSongs, deleteReleaseAndSongs } from '@/store/mockDb';

import Button from '@/components/ui/Button';
import Message from '@/components/ui/Message';
import Cover from '@/components/ui/Cover';
import ArtistAnalytics from '@/components/manage/ArtistAnalytics';
import ReleaseForm, { ReleaseFormState } from '@/components/manage/ReleaseForm';

import { ShieldAlert, Plus, Trash2, Edit2, Music, ChevronLeft } from 'lucide-react';

export default function ManagePage() {
  const { user: authUser } = useAuth() as any;
  const [viewState, setViewState] = useState<'dashboard' | 'create'>('dashboard');
  
  const [myReleases, setMyReleases] = useState<AlbumItem[]>([]);
  const [mySongs, setMySongs] = useState<SongItem[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (authUser?.id) refreshData();
  }, [authUser]);

  const refreshData = () => {
    const allAlbums = getAlbums();
    const allSongs = getSongs();
    setMyReleases(allAlbums.filter(a => a.artistId === authUser.id));
    setMySongs(allSongs.filter(s => s.artistId === authUser.id));
  };

  const isVerifiedArtist = authUser?.role === 'artist' && authUser?.artistProfile?.verificationStatus === 'approved';

  if (!isVerifiedArtist) {
    return (
      <div className="h-[calc(100vh-112px)] flex flex-col items-center justify-center text-neutral-400 gap-4 w-full px-4 text-center">
        <ShieldAlert className="w-16 h-16 text-yellow-500/50" />
        <h2 className="text-xl font-bold text-white tracking-tight">Access Restricted</h2>
        <p className="max-w-md text-sm">
          Content management is exclusively available to approved and verified artists. If you have applied, please wait for administrative approval.
        </p>
      </div>
    );
  }

  const handleSaveRelease = (formData: ReleaseFormState) => {
    if (!formData.title) return alert("Release title is required.");

    const coverUrl = formData.coverImage.length > 0 
      ? URL.createObjectURL(formData.coverImage[0]) 
      : undefined;

    let newSongs: SongItem[] = [];
    const albumId = `album-${Date.now()}`;

    if (formData.releaseType === 'single') {
      newSongs.push({
        id: `song-${Date.now()}-1`,
        title: formData.title,
        artistName: authUser.displayName,
        artistId: authUser.id,
        albumName: formData.title,
        albumId: albumId,
        streams: 0,
        releaseDate: formData.releaseDate,
        genre: formData.genre,
        collaborators: formData.collaborators,
        audioUrl: formData.singleAudio.length > 0 ? URL.createObjectURL(formData.singleAudio[0]) : '',
        lyrics: formData.singleLyrics,
        imageUrl: coverUrl
      });
    } else {
      newSongs = formData.tracks.map((t, idx) => ({
        id: `song-${Date.now()}-${idx}`,
        title: t.title || `Track ${idx + 1}`,
        artistName: authUser.displayName,
        artistId: authUser.id,
        albumName: formData.title,
        albumId: albumId,
        streams: 0,
        releaseDate: formData.releaseDate,
        genre: formData.genre,
        collaborators: formData.collaborators,
        audioUrl: t.audio.length > 0 ? URL.createObjectURL(t.audio[0]) : '',
        lyrics: t.lyrics,
        trackNumber: idx + 1,
        imageUrl: coverUrl
      }));
    }

    const newRelease: AlbumItem = {
      id: albumId,
      name: formData.title,
      artistName: authUser.displayName,
      artistId: authUser.id,
      listeners: 0,
      releaseDate: formData.releaseDate,
      releaseType: formData.releaseType,
      genre: formData.genre,
      collaborators: formData.collaborators,
      imageUrl: coverUrl,
      songList: newSongs.map(s => s.id)
    };

    saveAlbums([...getAlbums(), newRelease]);
    saveSongs([...getSongs(), ...newSongs]);
    
    refreshData();
    setViewState('dashboard');
  };

  const executeDelete = () => {
    if (deletingId) {
      deleteReleaseAndSongs(deletingId);
      refreshData();
      setDeletingId(null);
    }
  };

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
              {myReleases.map(release => {
                const releaseStreams = release.songList.reduce((sum, id) => sum + (mySongs.find(s => s.id === id)?.streams || 0), 0);
                return (
                  <div key={release.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-neutral-900/30 transition">
                    <div className="flex items-center gap-4 w-full sm:w-auto min-w-0">
                      <Cover src={release.imageUrl} alt={release.name} size={60} className="shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white truncate">{release.name}</h3>
                          <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400">
                            {release.releaseType || 'Album'}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 truncate mt-0.5">
                          {release.genre || 'Unknown Genre'} • {new Date(release.releaseDate).getFullYear()}
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
                          onClick={() => alert("Editing items is disabled in the local storage database concept profile. Please delete and recreate.")}
                          className="p-2 text-neutral-400 hover:text-white bg-neutral-900 rounded-lg transition"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => setDeletingId(release.id)}
                          className="p-2 text-red-400 hover:text-white hover:bg-red-500/20 bg-neutral-900 rounded-lg transition"
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