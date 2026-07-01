'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';

import DiscoverSearch from '@/components/music/DiscoverSearch';
import DiscoverFilters from '@/components/music/DiscoverFilters';
import ItemRow from '@/components/ItemRow';
import ShowAll from '@/components/ShowAll';

import { DiscoverData, DiscoverFilter } from '@/types';
import { getMediaData } from '@/services/mediaService';

type ViewMode = 'discover' | 'songs' | 'albums' | 'playlists';

export default function DiscoverPage() {
    const { user } = useAuth();

    const searchParams = useSearchParams();
    const query = searchParams.get('q') ?? '';
    const filter = (searchParams.get("filter") as DiscoverFilter) ?? "latest";

    const [data, setData] = useState<DiscoverData | null>(null);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<ViewMode>('discover');

    useEffect(() => {
        if (!user) return;

        setView('discover');

        const load = async () => {
            try {
                setLoading(true);
                const result = await getMediaData(query, filter);
                setData(result);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [user, query, filter]);

    if (!user) {
        return (
            <div className="h-screen flex items-center justify-center text-neutral-500">
                Loading...
            </div>
        );
    }

    if (!data) {
        return (
            <div className="h-screen flex items-center justify-center text-neutral-500">
                Loading discover...
            </div>
        );
    }

    const viewConfigs = {
        songs: {
            title: query ? 'Songs' : 'Latest Songs',
            type: 'song' as const,
            items: data.songs,
        },
        albums: {
            title: query ? 'Albums' : 'Latest Albums',
            type: 'album' as const,
            items: data.albums,
        },
        playlists: {
            title: query ? 'Playlists' : 'Latest Playlists',
            type: 'playlist' as const,
            items: data.playlists,
        },
    };

    return (
        <main className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8 space-y-6 lg:space-y-8">

            <div className="flex items-center justify-center gap-4">
                <div className='flex-1 max-w-sm md:max-w-md lg: max-w-lg'>
                    <DiscoverSearch />
                </div>
                <div>
                    <DiscoverFilters />
                </div>
            </div>

            {loading && (
                <div className="text-center text-neutral-400">
                    Searching...
                </div>
            )}

            {!loading && view !== 'discover' && (
                <button
                    onClick={() => setView('discover')}
                    className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    Back
                </button>
            )}

            {!loading && view === 'discover' && (
                <>
                    {data.songs.length > 0 && (
                        <ItemRow
                            title={query ? 'Songs' : 'Latest Songs'}
                            type="song"
                            items={data.songs}
                            user={user}
                            onShowAll={() => setView('songs')}
                        />
                    )}

                    {data.albums.length > 0 && (
                        <ItemRow
                            title={query ? 'Albums' : 'Latest Albums'}
                            type="album"
                            items={data.albums}
                            user={user}
                            onShowAll={() => setView('albums')}
                        />
                    )}

                    {data.playlists.length > 0 && (
                        <ItemRow
                            title={query ? 'Playlists' : 'Latest Playlists'}
                            type="playlist"
                            items={data.playlists}
                            user={user}
                            onShowAll={() => setView('playlists')}
                        />
                    )}

                    {data.playlists.length < 1 && data.albums.length < 1 && data.songs.length < 1 && (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                        <h2 className="text-2xl font-semibold text-white">
                            No results found
                        </h2>

                        <p className="mt-3 max-w-md text-sm text-neutral-400">
                            Sorry, we couldn't find any songs, albums, or playlists matching{" "}
                            <span className="font-medium text-white">"{query}"</span>.
                            <br />
                            Try searching with different keywords.
                        </p>
                        </div>
                    )}
                </>
            )}

            {!loading && view !== 'discover' && (
                <ShowAll
                    title={viewConfigs[view].title}
                    type={viewConfigs[view].type}
                    items={viewConfigs[view].items}
                    user={user}
                />
            )}
        </main>
    );
}