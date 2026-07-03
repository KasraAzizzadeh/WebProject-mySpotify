"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePlayerStore } from '@/store/playerStore';
import Cover from "@/components/ui/Cover";
import { AlbumItem, PlaylistItem, PlaybackSource } from "@/types";
import { formatDuration } from "@/utils/mediaUtils";
import { useAverageColor } from "@/hooks/useAverageColor";
import { darken } from "@/utils/color";
import { Shuffle, Play, Pause, Pen, Plus } from "lucide-react";

type HeroProps =
  | {
      type: "album";
      item: AlbumItem;
      duration: number;
      heroRef?: React.RefObject<HTMLDivElement | null>;
      handlePlay: () => void;
    }
  | {
      type: "playlist";
      item: PlaylistItem;
      duration: number;
      heroRef?: React.RefObject<HTMLDivElement | null>;
      ownerName: string;
      edit: boolean;
      handlePlay: () => void;
    };

export default function HeroCard(props: HeroProps) {
    const { item, type, duration, heroRef, handlePlay } = props;
    const router = useRouter();

    const playbackSource = usePlayerStore((s) => s.playbackSource);
    const isPlaying = usePlayerStore((s) => s.isPlaying);
    const isShuffle = usePlayerStore((s) => s.isShuffle);
    const togglePlayPause = usePlayerStore((s) => s.togglePlayPause);
    const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  
    const color = useAverageColor(item.imageUrl);
    
    // Changed strictly here: returns "Playlist" plainly instead of checking privacy states
    const itemType = type == "album" ? (item.songList.length === 1 ? "Single" : "Album") 
            : ((props.edit ? "Private " : "Public") + "Playlist");

    const profileHref = type === "album" 
      ? `/album/${item.artistId}` 
      : `/profile/${item.ownerId}`;

    const isThisPlayback = playbackSource?.id === item.id;

    return (
        <section
        ref={heroRef}
        className="relative overflow-hidden h-[500px] md:h-[420px]"
        >
        <div
            className="absolute inset-0"
            style={{
            background: `
                linear-gradient(
                to bottom,
                ${darken(color, 0.25, 1)} 0%,
                ${darken(color, 0.25, 0.8)} 60%,
                rgba(23,23,23,0.9) 100%,
                #171717 100%
                )
            `,
            }}
        />

        <div className="relative z-10 flex h-full flex-col justify-end px-4 pb-6 md:px-8">
            <div className="flex flex-col items-center gap-6 md:flex-row md:items-end md:gap-8">
                <Cover
                    src={item.imageUrl}
                    alt={item.name}
                    size={210}
                />

                <div className="text-center md:text-left">
                    <p className="uppercase text-sm tracking-wider text-neutral-300">
                        {itemType}
                    </p>

                    <h1 className="mt-2 text-4xl font-bold md:text-6xl">
                    {item.name}
                    </h1>

                    <p className="mt-3 text-sm md:text-base text-neutral-200 flex flex-wrap items-center justify-center md:justify-start gap-2">
                        <span className="font-semibold">
                            <Link
                                href={profileHref}
                                className="hover:text-white hover:underline"
                            >
                                {type === "album" ? item.artistName : props.ownerName}
                            </Link>
                        </span>

                        {/* Renders date metadata only if viewing an official Album record */}
                        {type === "album" && (
                            <>
                                <span className="text-neutral-500">•</span>
                                <span className='text-neutral-300'>
                                    {new Date(item.releaseDate).getFullYear()}
                                </span>
                            </>
                        )}

                        <span className="text-neutral-500">•</span>

                        <span className='text-neutral-300'>
                            {item.songList.length} {item.songList.length === 1 ? 'song' : 'songs'}
                        </span>

                        <span className="text-neutral-500">•</span>

                        <span className="text-neutral-300">
                            {formatDuration(duration)}
                        </span>
                    </p>

                    {item.description && (
                        <p className="mt-4 max-w-2xl text-xs md:text-sm text-neutral-400">
                        {item.description}
                        </p>
                    )}
                </div>
            </div>

            <div className="mt-8 flex flex-wrap justify-center sm:justify-start items-center gap-4">
            <button 
                className="rounded-full bg-green-500 py-5 px-5 font-bold text-black transition hover:scale-105"
                onClick={(e) => {
                    e.stopPropagation();

                    if (isThisPlayback) {
                        togglePlayPause();
                    } else {
                        handlePlay();
                    }
                }}
            >
                {isThisPlayback && isPlaying ? (
                    <Pause size={20} className="fill-black" />
                ) : (
                    <Play size={20} className="fill-black" />
                )}
            </button>

            <button
                className={`rounded-full border p-4 font-medium transition hover:scale-105
                    ${
                        isThisPlayback && isShuffle
                            ? "border-green-500 text-green-500"
                            : "border-neutral-700 text-neutral-400 hover:border-white hover:text-white"
                    }`}
                onClick={(e) => {
                    e.stopPropagation();

                    if (isThisPlayback) {
                        toggleShuffle();
                    }
                }}
            >
                <Shuffle size={20} />
            </button>

            {type === "playlist" && props.edit && (
                <button 
                    className="flex items-center gap-2 rounded-full border border-neutral-700 px-5 py-2.5 text-sm font-medium transition hover:border-white text-neutral-300 hover:text-white"
                    onClick={(e) => {
                      e.preventDefault(); 
                      router.push("/discover");
                    }}
                >
                    <Plus size={16} />
                    <span>Add Tracks</span>
                </button>
            )}
            
            {type === "playlist" && props.edit && (
                <button className="flex items-center gap-2 rounded-full border border-neutral-700 px-5 py-2.5 text-sm font-medium transition hover:border-white text-neutral-300 hover:text-white">
                    <Pen size={16} />
                    <span>Edit</span>
                </button>
            )}
            </div>
        </div>
        </section>
    );
}