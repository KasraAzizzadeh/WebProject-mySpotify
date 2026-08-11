'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

import Input from '@/components/ui/Input';
import FileInput from '@/components/ui/FileInput';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import Cover from '@/components/ui/Cover';

import { PlaylistItem } from '@/types';
import { useUpdatePlaylist } from '@/hooks/queries/media/useUpdatePlaylist';
import { ApiError } from '@/services/api';

interface EditPlaylistModalProps {
  playlist: PlaylistItem;
  onSave: (playlist: PlaylistItem) => void;
  onClose: () => void;
}

export default function EditPlaylistModal({
  playlist,
  onSave,
  onClose,
}: EditPlaylistModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const [imageFile, setImageFile] = useState<File[]>([]);

  const [alert, setAlert] = useState('');

  const updatePlaylistMutation = useUpdatePlaylist(playlist.id);

  useEffect(() => {
    setName(playlist.name);
    setDescription(playlist.description ?? '');
    setImageUrl(playlist.imageUrl ?? '');
  }, [playlist]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setAlert("");

    updatePlaylistMutation.mutate({
      name,
      description,
      imageFile: imageFile[0],
    }, {
      onSuccess: () => onClose(),
      onError: (error) => {
        if (error instanceof ApiError) {
          setAlert(error.getFirstError());
        } else {
          setAlert("Something went wrong.");
        }
      },
    })
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-xl border border-neutral-800 bg-neutral-900 shadow-2xl"
      >
        {/* Header */}

        <div className="flex items-center justify-between border-b border-neutral-800 p-6">
          <h2 className="text-xl font-bold text-white">
            Edit Playlist
          </h2>

          <button
            onClick={onClose}
            disabled={updatePlaylistMutation.isPending}
            className="text-neutral-400 hover:text-red-500 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}

        <form
          onSubmit={handleSubmit}
          className="flex gap-8 p-6"
        >
          <div className="flex flex-col items-center gap-4 shrink-0">
            <Cover
              src={imageUrl}
              alt={name}
              size={220}
            />

            <FileInput
              label="Playlist Cover"
              accept=".png,.jpg,.jpeg"
              maxFiles={1}
              value={imageFile}
              onChange={setImageFile}
            />
          </div>

          <div className="flex-1 flex flex-col gap-5">
            <Input
              label="Playlist Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <Input
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            {alert && <Alert message={alert} />}

            <div className="mt-auto flex justify-end gap-3">
            
                <Button
                    type="submit"
                    disabled={updatePlaylistMutation.isPending}
                >
                    Save
                </Button>
                
                <Button
                    type="button"
                    variant="secondary"
                    onClick={onClose}
                    disabled={updatePlaylistMutation.isPending}
                >
                    Cancel
                </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}