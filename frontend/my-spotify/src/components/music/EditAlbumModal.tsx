'use client';

import { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Music } from 'lucide-react';

import Input from '@/components/ui/Input';
import FileInput from '@/components/ui/FileInput';
import Button from '@/components/ui/Button';
import Cover from '@/components/ui/Cover';

import { AlbumItem, SongItem } from '@/types';
import { getGenres } from '@/services/manageService';

export interface TrackEditData {
  id: string;
  title: string;
  lyrics: string;
  audioFile?: File;
}

interface EditAlbumModalProps {
  release: AlbumItem;
  releaseSongs: SongItem[];
  onSave: (updatedRelease: AlbumItem, newImageFile?: File, updatedTracks?: TrackEditData[]) => void;
  onClose: () => void;
}

export default function EditAlbumModal({
  release,
  releaseSongs,
  onSave,
  onClose,
}: EditAlbumModalProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [genre, setGenre] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File[]>([]);

  const [genres, setGenres] = useState<{ id: number; name: string }[]>([]);

  const [tracks, setTracks] = useState<{ id: string; title: string; lyrics: string; audioFiles: File[] }[]>([]);

  useEffect(() => {
    setName(release.name);
    // store genre as string (could be id or name depending on backend)
    setGenre(release.genre !== undefined && release.genre !== null ? String(release.genre) : '');
    setImageUrl(release.imageUrl || '');

    setTracks(releaseSongs.map(s => ({
      id: s.id,
      title: s.title,
      lyrics: s.lyrics || '',
      audioFiles: []
    })));

    // fetch genres for dropdown
    (async () => {
      try {
        const g = await getGenres();
        if (Array.isArray(g)) setGenres(g);
      } catch (err) {
        // ignore — calling component handles errors elsewhere
        console.error('Failed to load genres', err);
      }
    })();
  }, [release, releaseSongs]);

  const handleTrackChange = (index: number, field: string, value: any) => {
    const updatedTracks = [...tracks];
    updatedTracks[index] = { ...updatedTracks[index], [field]: value };
    setTracks(updatedTracks);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsSubmitting(true);

      const updatedRelease: AlbumItem = {
        ...release,
        name,
        genre,
      };

      const finalTracks: TrackEditData[] = tracks.map(t => ({
        id: t.id,
        title: t.title,
        lyrics: t.lyrics,
        audioFile: t.audioFiles.length > 0 ? t.audioFiles[0] : undefined
      }));

      onSave(updatedRelease, imageFile[0], finalTracks);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isGeneralPage = currentPage === 0;
  const currentTrackIndex = currentPage - 1;
  const totalPages = tracks.length + 1;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-xl border border-neutral-800 bg-neutral-900 shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between border-b border-neutral-800 p-6 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white">
              Edit {release.releaseType === 'single' ? 'Single' : 'Album'}
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              {isGeneralPage ? 'General Information' : `Track ${currentPage} of ${tracks.length}: ${tracks[currentTrackIndex]?.title}`}
            </p>
          </div>

          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-neutral-400 hover:text-red-500 transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form id="edit-release-form" onSubmit={handleSubmit} className="flex flex-col gap-8">

            {isGeneralPage ? (
              <div className="flex flex-col sm:flex-row gap-8 animate-fade-in">
                <div className="flex flex-col items-center gap-4 shrink-0 mx-auto sm:mx-0">
                  <Cover src={imageUrl} alt={name} size={220} />
                  <FileInput
                    label="Update Cover Art"
                    accept=".png,.jpg,.jpeg"
                    maxFiles={1}
                    value={imageFile}
                    onChange={setImageFile}
                  />
                </div>

                <div className="flex-1 flex flex-col gap-5">
                  <Input
                    label="Release Title"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />

                  <div>
                    <label className="block text-sm text-neutral-400 mb-1">Primary Genre</label>
                    <select
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                      className="w-full bg-neutral-800/60 border border-neutral-700/40 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-green-500 transition-all"
                    >
                      <option value="">Select genre</option>
                      {genres.map(g => (
                        <option key={g.id} value={String(g.id)}>{g.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-5 animate-fade-in">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center">
                    <Music size={18} className="text-green-500" />
                  </div>

                  <h3 className="text-sm font-bold text-white">
                    Track Metadata
                  </h3>
                </div>

                <Input
                  label="Track Title"
                  value={tracks[currentTrackIndex]?.title || ''}
                  onChange={(e) => handleTrackChange(currentTrackIndex, 'title', e.target.value)}
                  required
                />

                <FileInput
                  label="Replace Audio File (Optional)"
                  accept="audio/*"
                  maxFiles={1}
                  value={tracks[currentTrackIndex]?.audioFiles || []}
                  onChange={(files) => handleTrackChange(currentTrackIndex, 'audioFiles', files)}
                />

                <div>
                  <label className="block text-sm text-neutral-400 mb-1">
                    Lyrics
                  </label>

                  <textarea
                    value={tracks[currentTrackIndex]?.lyrics || ''}
                    onChange={(e) => handleTrackChange(currentTrackIndex, 'lyrics', e.target.value)}
                    placeholder="Enter lyrics here..."
                    className="w-full h-32 bg-neutral-800/60 border border-neutral-700/40 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-green-500 resize-none transition-all"
                  />
                </div>
              </div>
            )}

          </form>
        </div>

        {/* Footer Carousel Controls */}
        <div className="p-6 border-t border-neutral-800 shrink-0 bg-neutral-900/50 rounded-b-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))} 
              disabled={currentPage === 0 || isSubmitting}
              className="!w-8 !h-8 !p-0 flex items-center justify-center rounded-lg"
            >
              <ChevronLeft size={16} />
            </Button>

            <span className="text-xs font-semibold text-neutral-400 min-w-[48px] text-center">
              {currentPage + 1} / {totalPages}
            </span>

            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} 
              disabled={currentPage === totalPages - 1 || isSubmitting}
              className="!w-8 !h-8 !p-0 flex items-center justify-center rounded-lg"
            >
              <ChevronRight size={16} />
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={onClose} 
              disabled={isSubmitting} 
              className="!h-8 !px-4 !py-0 text-xs rounded-lg"
            >
              Cancel
            </Button>

            <Button 
              type="submit" 
              form="edit-release-form" 
              disabled={isSubmitting} 
              className="!h-8 !px-5 !py-0 text-xs rounded-lg"
            >
              Save
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}