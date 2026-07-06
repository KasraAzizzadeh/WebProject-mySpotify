'use client';

import React from 'react';
import Input from '@/components/ui/Input';
import FileInput from '@/components/ui/FileInput';

interface TrackFormItemProps {
  index: number;
  title: string;
  audio: File[];
  lyrics: string;
  showRemove: boolean;
  onUpdate: (fields: { title?: string; audio?: File[]; lyrics?: string }) => void;
  onRemove: () => void;
}

export default function TrackFormItem({
  index,
  title,
  audio,
  lyrics,
  showRemove,
  onUpdate,
  onRemove,
}: TrackFormItemProps) {
  return (
    <div className="bg-neutral-900/40 p-4 rounded-xl border border-neutral-800/80 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-green-500">Track {index + 1}</span>
        {showRemove && (
          <button 
            type="button"
            onClick={onRemove}
            className="text-xs text-red-400 hover:text-red-300 transition"
          >
            Remove
          </button>
        )}
      </div>
      
      <Input 
        placeholder="Track Title" 
        value={title}
        onChange={(e) => onUpdate({ title: e.target.value })}
      />
      
      <FileInput 
        value={audio}
        accept="audio/*"
        onChange={(files) => onUpdate({ audio: files })}
      />

      <textarea 
        value={lyrics}
        onChange={(e) => onUpdate({ lyrics: e.target.value })}
        placeholder="Track lyrics (optional)..."
        className="w-full h-24 bg-neutral-800/60 border border-neutral-700/40 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-green-500 resize-none"
      />
    </div>
  );
}