'use client';

import { useState } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { X } from 'lucide-react';

interface CreatePlaylistModalProps {
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
}

export default function CreatePlaylistModal({ onClose, onSave }: CreatePlaylistModalProps) {
  const [playlistName, setPlaylistName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playlistName.trim()) {
      setError('Playlist name cannot be empty');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onSave(playlistName.trim());
      onClose();
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md p-6 bg-neutral-900 border border-neutral-800 rounded-xl space-y-6 shadow-2xl">
        
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">Create Playlist</h3>
          <button 
            onClick={onClose} 
            className="text-neutral-400 hover:text-white transition"
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
        </div>

        {/* FORM DESCRIPTION */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Playlist Name"
            placeholder="e.g. Late Night Inversions, Workout Hype"
            value={playlistName}
            onChange={(e) => {
              setPlaylistName(e.target.value);
              if (error) setError('');
            }}
            error={error}
            disabled={isSubmitting}
            autoFocus
          />

          {/* ACTION ACTIONS ACTIONS */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}