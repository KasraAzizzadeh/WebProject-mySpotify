'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import FileInput from '@/components/ui/FileInput';
import RadioGroup from '@/components/ui/RadioGroup';
import TrackFormItem from './TrackFormItem';

export type ReleaseFormState = {
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

interface ReleaseFormProps {
  onCancel: () => void;
  onSave: (data: ReleaseFormState) => void;
}

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

export default function ReleaseForm({ onCancel, onSave }: ReleaseFormProps) {
  const [formData, setFormData] = useState<ReleaseFormState>(initialFormState);

  const handleUpdateTrack = (idx: number, fields: Partial<ReleaseFormState['tracks'][number]>) => {
    const updatedTracks = [...formData.tracks];
    updatedTracks[idx] = { ...updatedTracks[idx], ...fields };
    setFormData({ ...formData, tracks: updatedTracks });
  };

  const handleAddTrack = () => {
    setFormData({
      ...formData,
      tracks: [...formData.tracks, { title: '', audio: [], lyrics: '' }],
    });
  };

  const handleRemoveTrack = (idx: number) => {
    setFormData({
      ...formData,
      tracks: formData.tracks.filter((_, i) => i !== idx),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#121212] border border-neutral-800/50 rounded-2xl shadow-xl overflow-hidden">
      <div className="p-6 sm:p-8 border-b border-neutral-800/50">
        <h2 className="text-xl font-bold text-white">Publish New Content</h2>
        <p className="text-xs text-neutral-500 mt-1">Upload your high-quality audio files and attach standard industry metadata.</p>
      </div>

      <div className="p-6 sm:p-8 space-y-8">
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
              required
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
                type="button"
                variant="secondary" 
                onClick={handleAddTrack}
                className="!py-1.5 !px-3 text-[10px] sm:w-auto"
              >
                + Add Track
              </Button>
            </div>

            {formData.tracks.map((track, idx) => (
              <TrackFormItem
                key={idx}
                index={idx}
                title={track.title}
                audio={track.audio}
                lyrics={track.lyrics}
                showRemove={formData.tracks.length > 1}
                onUpdate={(fields) => handleUpdateTrack(idx, fields)}
                onRemove={() => handleRemoveTrack(idx)}
              />
            ))}
          </div>
        )}

        <div className="pt-4 flex items-center justify-end gap-3">
          <Button 
            type="button"
            variant="secondary" 
            onClick={onCancel}
            className="sm:w-32"
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            variant="primary" 
            className="sm:w-48 shadow-lg shadow-green-500/20"
          >
            Publish Release
          </Button>
        </div>
      </div>
    </form>
  );
}