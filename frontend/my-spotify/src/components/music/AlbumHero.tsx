"use client";

import Link from 'next/link';
import Cover from "@/components/ui/Cover";
import { AlbumItem, PlaylistItem, UserProfile } from "@/types";
import { formatDuration } from "@/utils/mediaUtils";
import { useAverageColor } from "@/hooks/useAverageColor";
import { darken } from "@/utils/color";
import { Shuffle, Play, Pen, Plus } from "lucide-react";
import { redirect } from 'next/navigation';

type HeroProps =
  | {
      type: "album";
      item: AlbumItem;
      duration: number;
      heroRef?: React.RefObject<HTMLDivElement | null>;
    }
  | {
      type: "playlist";
      item: PlaylistItem;
      user: UserProfile;
      duration: number;
      heroRef?: React.RefObject<HTMLDivElement | null>;
      ownerName: string;
      edit: boolean;
    };

export default function HeroCard(props: HeroProps) {

    const { item, type, duration, heroRef } = props;
  
    const color = useAverageColor(item.imageUrl);
    const itemType = type == "album" ? (item.songList.length === 1 ? "Single" : "Album") 
                            : (`${item.isPrivate ? "Private" : "Public"} Playlist`);

    return (
        <section
        ref={heroRef}
        className="relative overflow-hidden h-[500px] md:h-[420px]"
        >
        {/* Background */}
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

        {/* Content */}
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

                    <p className="mt-3 text-base md:text-lg text-neutral-200">

                    {/* maybe add artist/user profile */}
                    {/* <Avatar
                        src={user.profilePictureUrl}
                        alt={user.displayName}
                        size={52}
                    /> */}
                    <span className="font-semibold">
                        <Link
                            href={`/album/${type === "album" ? item.artistId : item.ownerId}`}
                            className="hover:text-white hover:underline"
                        >
                            {type === "album" ? item.artistName : props.ownerName}
                        </Link>
                    </span>

                    <span className="mx-2">•</span>

                    <span className='text-neutral-300'>
                        {type === "album" ? new Date(item.releaseDate).getFullYear() : ""}
                    </span>

                    <span className="mx-2">•</span>

                    <span className='text-neutral-300'>
                        {item.songList.length} songs
                    </span>

                    <span className="mx-2">•</span>

                    {formatDuration(duration)}
                    </p>

                    {item.description && (
                        <p className="mt-4 max-w-2xl text-sm md:text-base text-neutral-300">
                        {item.description}
                        </p>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap justify-center sm:justify-start items-center gap-4">
            <button className="rounded-full bg-green-500 px-5 py-5 text-3xl font-bold text-black transition hover:scale-105">
                <Play size={24} />
            </button>

            <button className="rounded-full border border-neutral-500 px-4 py-4 font-medium transition hover:border-white hover:scale-102 hover:text-white">
                <Shuffle size={20} />
            </button>

            {type === "playlist" && props.edit && (
                <button 
                    className="flex items-center gap-2 rounded-full border border-neutral-500 px-6 py-3 text-md transition hover:border-white hover:text-white"
                    onClick={(e) => {e.preventDefault(); redirect("/discover");}}
                >
                    <Plus size={20} />
                    <span>Add</span>
                </button>
            )}
            
            {type === "playlist" && props.edit && (
                <button className="flex items-center gap-2 rounded-full border border-neutral-500 px-6 py-3 text-md transition hover:border-white hover:text-white">
                    <Pen size={20} />
                    <span>Edit</span>
                </button>
            )}
            </div>
        </div>
        </section>
    );
}