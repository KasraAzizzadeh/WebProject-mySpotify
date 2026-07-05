'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { SongItem, SubscriptionType } from '@/types';
import { CirclePlus, ListMusic } from "lucide-react";
import AddToPlaylistModal from './music/AddToPlaylistModal';
import { useAuth } from '@/contexts/AuthContext';

interface SongCardProps {
  song: SongItem;
  subscriptionType: SubscriptionType;
  songsContext?: SongItem[];
}

export default function SongCard({
  song,
  subscriptionType,
  songsContext = [song],
}: SongCardProps) {
  const currentSong = usePlayerStore((s) => s.currentSong);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const togglePlayPause = usePlayerStore((s) => s.togglePlayPause);
  const setQueue = usePlayerStore((s) => s.setQueue);
  const addToQueue = usePlayerStore((s) => s.addToQueue);

  const { user } = useAuth();
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [imgError, setImgError] = useState(false);

  const isCurrentSongActive = currentSong?.id === song.id;
  const showImage = song.imageUrl && !imgError;

  const handleCardClick = () => {
    if (isCurrentSongActive) {
      togglePlayPause();
    } else {
      setQueue(
        songsContext,
        { type: 'single', id: song.id },
        song
      );
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`
        p-4 rounded-xl border transition-all cursor-pointer group
        flex flex-col justify-between h-full
        ${isCurrentSongActive
          ? 'bg-neutral-800/90 border-green-500/30 shadow-[0_4px_20px_rgba(34,197,94,0.1)]'
          : 'bg-neutral-900/60 hover:bg-neutral-800/80 border-neutral-800/40'
        }
      `}
    >
      <div>
        {/* IMAGE */}
        <div className="w-full aspect-square bg-neutral-800 rounded-lg mb-4 relative overflow-hidden shadow-inner group-hover:scale-[1.02] transition-transform">

          {showImage ? (
            <img
              src={song.imageUrl}
              alt={song.title}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-400 text-3xl">
              🎵
            </div>
          )}

          {/* ACTIONS (IMPORTANT FIX) */}
          <div
            className="absolute bottom-2 right-2 flex gap-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 z-20 pointer-events-auto"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                addToQueue(
                  [song],
                  { type: "single", id: song.id }
                );
              }}
              className="w-8 h-8 rounded-full bg-black/70 backdrop-blur flex items-center justify-center text-neutral-300 hover:text-green-400 hover:bg-black/90 transition"
              title="Add to queue"
            >
              <ListMusic size={16} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowPlaylistModal(true);
              }}
              className="w-8 h-8 rounded-full bg-black/70 backdrop-blur flex items-center justify-center text-neutral-300 hover:text-green-400 hover:bg-black/90 transition"
              title="Add to playlist"
            >
              <CirclePlus size={16} />
            </button>
          </div>

          {/* PLAYING OVERLAY */}
          <div className="pointer-events-none">
            {isCurrentSongActive && (
              <div className="absolute inset-0 bg-green-500/10 flex items-center justify-center backdrop-blur-[1px] z-10">
                <div className="bg-black/60 rounded-full px-4 py-2 border border-green-500/30 text-green-500 text-xs font-bold uppercase tracking-wider">
                  {isPlaying ? 'Playing' : 'Paused'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* TITLE */}
        <h4 className={`font-semibold truncate text-base transition-colors ${
          isCurrentSongActive ? 'text-green-500' : 'text-white'
        }`}>
          {song.title}
        </h4>

        {/* ARTIST */}
        <p className="text-neutral-400 text-sm mt-0.5 truncate">
          By{' '}
          <Link
            href={`/artist/${song.artistId}`}
            onClick={(e) => e.stopPropagation()}
            className="text-green-400 hover:underline"
          >
            {song.artistName}
          </Link>
        </p>

        {/* ALBUM */}
        <p className="text-xs text-neutral-500 mt-1 min-h-[18px]">
          {song.albumName ? (
            <>
              From:{' '}
              <Link
                href={`/album/${song.albumId}`}
                onClick={(e) => e.stopPropagation()}
                className="text-neutral-400 hover:underline"
              >
                {song.albumName}
              </Link>
            </>
          ) : (
            <span className="opacity-0 select-none">placeholder</span>
          )}
        </p>
      </div>

      {/* MODAL */}
      {showPlaylistModal && user && (
        <AddToPlaylistModal
          songId={song.id}
          user={user}
          onClose={() => setShowPlaylistModal(false)}
        />
      )}
    </div>
  );
}