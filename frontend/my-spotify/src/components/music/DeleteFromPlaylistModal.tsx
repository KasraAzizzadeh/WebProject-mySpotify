"use client";

import React, { useState } from "react";
import Button from "@/components/ui/Button";
import { X } from "lucide-react";

type DeleteFromPlaylistModalProps = {
  playlistId: string;
  songId: string;
  onClose: () => void;
  onSuccess: () => void;
};

export default function DeleteFromPlaylistModal({
  onClose,
  onSuccess,
}: DeleteFromPlaylistModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = async () => {
    setIsDeleting(true);
    await onSuccess();
    setIsDeleting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-[#141414] border border-neutral-800 rounded-2xl p-6 relative shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-500 hover:text-white p-1 rounded-lg transition-colors hover:bg-neutral-900"
          disabled={isDeleting}
        >
          <X className="w-4 h-4" />
        </button>

        <div>
          <h2 className="text-base font-bold text-white tracking-tight pt-1">
            Remove track from playlist?
          </h2>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <div className="w-full">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isDeleting}
              className="!py-2 text-xs font-semibold rounded-xl"
            >
              Cancel
            </Button>
          </div>
          <div className="w-full">
            <Button
              variant="danger"
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className="!py-2 text-xs font-semibold rounded-xl"
            >
              {isDeleting ? "Removing..." : "Remove"}
            </Button>
          </div>
        </div>
        
      </div>
    </div>
  );
}