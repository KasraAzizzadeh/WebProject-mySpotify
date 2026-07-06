'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AlbumItem, SongItem } from '@/types';
import { getAlbums, getSongs, saveAlbums, saveSongs, deleteReleaseAndSongs } from '@/store/mockDb';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import FileInput from '@/components/ui/FileInput';
import RadioGroup from '@/components/ui/RadioGroup';
import Message from '@/components/ui/Message';
import Cover from '@/components/ui/Cover';

import { ShieldAlert, Plus, BarChart2, DollarSign, Headphones, Trash2, Edit2, Music, ChevronLeft } from 'lucide-react';

type ReleaseFormState = {
  releaseType: 'single' | 'album';
  title: string;
  releaseDate: string;
  genre: string;
  collaborators: string;
  coverImage: File[];
  singleAudio: File[];
  singleLyrics: string;
  tracks: { title: string; audio: File[]; lyrics: string }[];
};

const initialFormState: ReleaseFormState = {
  releaseType: 'single',
  title: '',
  releaseDate: new Date().toISOString().split('T')[0],
  genre: '',
  collaborators: '',
  coverImage: [],
  singleAudio: [],
  singleLyrics: '',
  tracks: [{ title: '', audio: [], lyrics: '' }],
};

export default function ManagePage() {
  const { user: authUser } = useAuth() as any;
  const [viewState, setViewState] = useState<'dashboard' | 'create' | 'edit'>('dashboard');
  
  const [myReleases, setMyReleases] = useState<AlbumItem[]>([]);
  const [mySongs, setMySongs] = useState<SongItem[]>([]);
  
  const [formData, setFormData] = useState<ReleaseFormState>(initialFormState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Revenue calculation mock rate (e.g., $0.004 per stream)
  const REVENUE_PER_STREAM = 0.004;

  useEffect(() => {
    if (authUser?.id) refreshData();
  }, [authUser]);

  const refreshData = () => {
    const allAlbums = getAlbums();
    const allSongs = getSongs();
    
    setMyReleases(allAlbums.filter(a => a.artistId === authUser.id));
    setMySongs(allSongs.filter(s => s.artistId === authUser.id));
  };

  // Guard: Must be a verified artist
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

  // --- STATS CALCULATION ---
  const totalStreams = mySongs.reduce((sum, song) => sum + song.streams, 0);
  const totalRevenue = totalStreams * REVENUE_PER_STREAM;
  const totalListeners = myReleases.reduce((sum, rel) => sum + rel.listeners, 0);

  // --- FORM HANDLERS ---
  const handleSaveRelease = () => {
    if (!formData.title) return alert("Release title is required.");

    const coverUrl = formData.coverImage.length > 0 
      ? URL.createObjectURL(formData.coverImage[0]) 
      : undefined;

    let newSongs: SongItem[] = [];
    const albumId = editingId || `album-${Date.now()}`;

    // Generate Songs
    if (formData.releaseType === 'single') {
      newSongs.push({
        id: `song-${Date.now()}-1`,
        title: formData.title, // Single song matches release title
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

    // Generate/Update Release (Album/Single record)
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

    if (editingId) {
      // Editing: Replace Album & Songs
      deleteReleaseAndSongs(editingId); 
    }

    // Save to DB
    const updatedAlbums = [...getAlbums().filter(a => a.id !== editingId), newRelease];
    const updatedSongs = [...getSongs().filter(s => s.albumId !== editingId), ...newSongs];
    
    saveAlbums(updatedAlbums);
    saveSongs(updatedSongs);
    
    refreshData();
    setViewState('dashboard');
    setFormData(initialFormState);
    setEditingId(null);
  };

  const executeDelete = () => {
    if (deletingId) {
      deleteReleaseAndSongs(deletingId);
      refreshData();
      setDeletingId(null);
    }
  };

  // --- RENDER DYNAMIC DASHBOARD ---
  if (viewState === 'dashboard') {
    return (
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-12 px-4 sm:px-6 mt-6 sm:mt-10">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Artist Hub</h1>
            <p className="text-sm text-neutral-500 mt-1">Manage your discography and track live publication analytics.</p>
          </div>
          <Button 
            onClick={() => { setFormData(initialFormState); setViewState('create'); }}
            className="sm:w-auto !py-2.5 !px-6 flex items-center justify-center gap-2"
          >
            <Plus size={18} /> New Release
          </Button>
        </div>

        {/* ANALYTICS BANNER */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#121212] border border-neutral-800/50 rounded-2xl p-5 shadow-lg flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-400">
              <BarChart2 size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-500 uppercase">Total Streams</p>
              <p className="text-xl font-black text-white">{totalStreams.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="bg-[#121212] border border-neutral-800/50 rounded-2xl p-5 shadow-lg flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Headphones size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-500 uppercase">Monthly Listeners</p>
              <p className="text-xl font-black text-white">{totalListeners.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-[#121212] border border-neutral-800/50 rounded-2xl p-5 shadow-lg flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500">
              <DollarSign size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-500 uppercase">Est. Revenue</p>
              <p className="text-xl font-black text-white">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>

        {/* DISCOGRAPHY LIST */}
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
                const releaseStreams = release.songList.reduce((sum, songId) => {
                  const song = mySongs.find(s => s.id === songId);
                  return sum + (song?.streams || 0);
                }, 0);
                const releaseRev = releaseStreams * REVENUE_PER_STREAM;

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
                        {release.collaborators && (
                          <p className="text-xs text-neutral-600 truncate mt-0.5">
                            ft. {release.collaborators}
                          </p>
                        )}
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
                          <p className="text-sm font-mono text-green-400 mt-0.5">${releaseRev.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Edit Button is disabled in this mockup to keep it simple, but wired up to state */}
                        <button 
                          onClick={() => alert("Edit pre-fill logic omitted for mock brevity. Use Delete & Recreate.")}
                          className="p-2 text-neutral-400 hover:text-white bg-neutral-900 rounded-lg transition"
                          title="Edit Release"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => setDeletingId(release.id)}
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
          description="Are you sure you want to permanently delete this release? All associated tracks, streams, and revenue history will be lost."
          confirmLabel="Delete"
          isDangerous={true}
          onConfirm={executeDelete}
          onCancel={() => setDeletingId(null)}
        />

      </div>
    );
  }

  // --- RENDER CREATE/EDIT FORM ---
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-24 px-4 sm:px-6 mt-6 sm:mt-10">
      
      <button 
        onClick={() => setViewState('dashboard')}
        className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition"
      >
        <ChevronLeft size={16} /> Back to Dashboard
      </button>

      <div className="bg-[#121212] border border-neutral-800/50 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-neutral-800/50">
          <h2 className="text-xl font-bold text-white">Publish New Content</h2>
          <p className="text-xs text-neutral-500 mt-1">Upload your high-quality audio files and attach standard industry metadata.</p>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          
          {/* RELEASE TYPE & CORE INFO */}
          <div className="space-y-6">
            <RadioGroup 
              options={[
                { label: 'Single Release', value: 'single' },
                { label: 'Full Album / EP', value: 'album' }
              ]}
              value={formData.releaseType}
              onChange={(val) => setFormData({ ...formData, releaseType: val as any })}
              className="flex gap-6 flex-wrap border border-neutral-800 p-4 rounded-xl bg-neutral-900/30"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input 
                label={formData.releaseType === 'single' ? "Track Title *" : "Album Title *"} 
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter title..." 
              />
              <Input 
                label="Primary Genre" 
                value={formData.genre}
                onChange={e => setFormData({ ...formData, genre: e.target.value })}
                placeholder="e.g. Synthwave, Hip-Hop..." 
              />
              <Input 
                label="Release Date" 
                type="date"
                value={formData.releaseDate}
                onChange={e => setFormData({ ...formData, releaseDate: e.target.value })}
              />
              <Input 
                label="Collaborating Artists (Optional)" 
                value={formData.collaborators}
                onChange={e => setFormData({ ...formData, collaborators: e.target.value })}
                placeholder="Comma separated names..." 
              />
            </div>
            
            <FileInput 
              label="Cover Art (Square aspect ratio recommended)"
              accept="image/*"
              value={formData.coverImage}
              onChange={(files) => setFormData({ ...formData, coverImage: files })}
            />
          </div>

          <div className="h-px w-full bg-neutral-800/80" />

          {/* AUDIO & LYRICS CONFIGURATION */}
          {formData.releaseType === 'single' ? (
            <div className="space-y-5 bg-neutral-900/20 p-5 rounded-xl border border-neutral-800/50">
              <h3 className="text-sm font-bold text-neutral-300">Track Upload (MP3 / WAV / FLAC)</h3>
              <FileInput 
                value={formData.singleAudio}
                accept="audio/*"
                onChange={(files) => setFormData({ ...formData, singleAudio: files })}
              />
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Track Lyrics (Optional)</label>
                <textarea 
                  value={formData.singleLyrics}
                  onChange={e => setFormData({ ...formData, singleLyrics: e.target.value })}
                  placeholder="Paste lyrics here..."
                  className="w-full h-32 bg-neutral-800/60 border border-neutral-700/40 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-green-500 resize-none"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-neutral-300">Album Tracklist</h3>
                <Button 
                  variant="secondary" 
                  onClick={() => setFormData({ ...formData, tracks: [...formData.tracks, { title: '', audio: [], lyrics: '' }] })}
                  className="!py-1.5 !px-3 text-[10px] sm:w-auto"
                >
                  + Add Track
                </Button>
              </div>

              {formData.tracks.map((track, idx) => (
                <div key={idx} className="bg-neutral-900/40 p-4 rounded-xl border border-neutral-800/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-green-500">Track {idx + 1}</span>
                    {formData.tracks.length > 1 && (
                      <button 
                        onClick={() => {
                          const updated = formData.tracks.filter((_, i) => i !== idx);
                          setFormData({ ...formData, tracks: updated });
                        }}
                        className="text-xs text-red-400 hover:text-red-300 transition"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  
                  <Input 
                    placeholder="Track Title" 
                    value={track.title}
                    onChange={(e) => {
                      const updated = [...formData.tracks];
                      updated[idx].title = e.target.value;
                      setFormData({ ...formData, tracks: updated });
                    }}
                  />
                  
                  <FileInput 
                    value={track.audio}
                    accept="audio/*"
                    onChange={(files) => {
                      const updated = [...formData.tracks];
                      updated[idx].audio = files;
                      setFormData({ ...formData, tracks: updated });
                    }}
                  />

                  <textarea 
                    value={track.lyrics}
                    onChange={(e) => {
                      const updated = [...formData.tracks];
                      updated[idx].lyrics = e.target.value;
                      setFormData({ ...formData, tracks: updated });
                    }}
                    placeholder="Track lyrics (optional)..."
                    className="w-full h-24 bg-neutral-800/60 border border-neutral-700/40 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-green-500 resize-none"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="pt-4 flex items-center justify-end gap-3">
            <Button 
              variant="secondary" 
              onClick={() => setViewState('dashboard')}
              className="sm:w-32"
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleSaveRelease}
              className="sm:w-48 shadow-lg shadow-green-500/20"
            >
              Publish Release
            </Button>
          </div>
          
        </div>
      </div>
    </div>
  );
}