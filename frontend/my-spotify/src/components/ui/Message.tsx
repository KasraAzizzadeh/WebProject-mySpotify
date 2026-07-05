"use client";

import React from 'react';
import Button from './Button';

type MessageProps = {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDangerous?: boolean;
  isLoading?: boolean;
  type?: 'confirm' | 'alert';
  onConfirm: () => void;
  onCancel?: () => void;
};

export default function Message({
  isOpen,
  title,
  description,
  confirmLabel = "OK",
  cancelLabel = "Cancel",
  isDangerous = false,
  isLoading = false,
  type = 'confirm',
  onConfirm,
  onCancel,
}: MessageProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#141414] border border-neutral-800/80 rounded-2xl p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        
        <div className="space-y-1.5">
          <h2 className="text-base font-bold text-white tracking-tight">{title}</h2>
          <p className="text-xs text-neutral-400 leading-normal">{description}</p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          {type === 'confirm' && onCancel && (
            <div className="w-24">
              <Button
                type="button"
                variant="secondary"
                disabled={isLoading}
                onClick={onCancel}
                className="!py-2 !text-xs !rounded-xl border border-neutral-800 hover:border-neutral-700"
              >
                {cancelLabel}
              </Button>
            </div>
          )}
          
          <div className="w-28">
            <Button
              type="button"
              disabled={isLoading}
              variant={isDangerous ? "danger" : "primary"}
              onClick={onConfirm}
              className="!py-2 !text-xs !rounded-xl"
            >
              {isLoading ? 'Processing...' : confirmLabel}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}