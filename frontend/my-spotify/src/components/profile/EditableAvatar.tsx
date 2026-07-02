"use client";

import { useRef, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import Avatar from "@/components/ui/Avatar";

interface EditableAvatarProps {
  src?: string;
  alt: string;
  size?: number;
  isOwnProfile: boolean;
  hasPermission: boolean;
  onFileSelect: (file: File) => void;
  onRemovePhoto: () => void;
}

export default function EditableAvatar({
  src,
  alt,
  size = 120,
  isOwnProfile,
  hasPermission,
  onFileSelect,
  onRemovePhoto,
}: EditableAvatarProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [localError, setLocalError] = useState("");

  const handleContainerClick = (e: React.MouseEvent) => {
    if (!isOwnProfile) return;
    if ((e.target as HTMLElement).closest(".delete-btn")) return;

    if (!hasPermission) {
      setLocalError("Premium Tier required to modify profile photo.");
      setTimeout(() => setLocalError(""), 4000);
      return;
    }

    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const hasCustomPhoto = !!src && !src.includes("default");

  return (
    <div className="relative flex flex-col items-center">
      {/* Outer Anchor Container Wrapper (Allows Group Hover State Tracking) */}
      <div 
        onClick={handleContainerClick}
        className={`relative group ${isOwnProfile ? "cursor-pointer" : ""}`}
      >
        
        {/* Rounded Image Frame Canvas Mask */}
        <div 
          className="rounded-full overflow-hidden relative"
          style={{ width: size, height: size }}
        >
          <Avatar src={src} alt={alt} size={size} />

          {/* Hover Center Control Panel Overlay */}
          {isOwnProfile && (
            <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out z-10">
              <div className="bg-neutral-900/90 p-2 rounded-full border border-neutral-700 text-white shadow-xl hover:text-green-400 transition-colors flex items-center justify-center">
                <Pencil size={16} />
              </div>
              
              {hasCustomPhoto && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemovePhoto();
                  }}
                  className="delete-btn bg-neutral-900/90 p-2 rounded-full border border-neutral-700 text-neutral-400 hover:text-red-400 shadow-xl transition-colors flex items-center justify-center"
                  title="Remove profile photo"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Floating Lower Right Pencil Badge (Moved Outside Overflow Frame to prevent clipping) */}
        {isOwnProfile && (
          <div className="absolute bottom-0 right-0 bg-neutral-900 border border-neutral-800 p-2 rounded-full text-neutral-400 shadow-lg opacity-100 group-hover:opacity-0 transition-opacity duration-300 ease-in-out z-20 flex items-center justify-center translate-x-1 translate-y-1">
            <Pencil size={12} className="text-neutral-400" />
          </div>
        )}

      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {localError && (
        <p className="absolute -bottom-6 text-[11px] text-red-400 whitespace-nowrap font-medium tracking-wide animate-pulse">
          {localError}
        </p>
      )}
    </div>
  );
}