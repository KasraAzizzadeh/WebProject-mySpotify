'use client';

import React from 'react';
import Button from '@/components/ui/Button';
import { AlertTriangle } from 'lucide-react';

type ConfirmProps = {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDangerous?: boolean;
  isLoading?: boolean;
};

export default function Confirm({
  isOpen,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  isDangerous = false,
  isLoading = false,
}: ConfirmProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"
        onClick={!isLoading ? onCancel : undefined}
      />
      
      <div className="relative w-full max-w-sm transform rounded-2xl bg-[#141414] border border-neutral-800/80 p-6 shadow-2xl transition-all duration-200">
        {isDangerous && (
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
            <AlertTriangle className="h-5 w-5" />
          </div>
        )}

        <div className="space-y-2">
          <h3 className="text-lg font-bold text-white tracking-tight">
            {title}
          </h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={isLoading}
            onClick={onCancel}
            className="text-xs font-semibold text-neutral-400 hover:text-white px-3 py-2 rounded-xl hover:bg-neutral-900 transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          
          <Button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`text-xs px-4 py-2 font-semibold rounded-xl ${
              isDangerous 
                ? 'bg-red-600 hover:bg-red-500 text-white' 
                : 'bg-white text-black hover:bg-neutral-200'
            }`}
          >
            {isLoading ? "Processing..." : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}