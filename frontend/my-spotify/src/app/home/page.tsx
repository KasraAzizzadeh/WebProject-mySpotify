import { getCurrentUser, getDashboardData } from '@/services/homeService';
import Avatar from '@/components/ui/Avatar';
import AlbumCard from '@/components/AlbumCard';
import SongCard from '@/components/SongCard';
import PlaylistCard from '@/components/PlaylistCard';

export default async function HomePage() {
  const user = await getCurrentUser();
  const data = await getDashboardData(user.subscriptionType);

  return (
    <main className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Block remains the same */}
      <header className="flex items-center justify-between bg-neutral-950/40 p-4 rounded-2xl border border-neutral-800/60 backdrop-blur-md">
        <div>
          <span className="text-xs uppercase font-semibold text-neutral-500 tracking-widest">
            Welcome Back ({user.role})
          </span>
          <h1 className="text-xl md:text-3xl font-bold text-white mt-0.5">
            {user.displayName}
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          {user.subscriptionType === 'gold' && (
            <span className="hidden sm:inline-block text-[11px] font-extrabold bg-gradient-to-r from-amber-400 to-yellow-600 text-black px-2.5 py-1 rounded-md shadow-md uppercase">
              🏆 Gold Access
            </span>
          )}
          <Avatar src={user.profilePictureUrl} alt={user.displayName} size={52} />
        </div>
      </header>

      {/* Early Access (Uses AlbumCard) */}
      {user.subscriptionType === 'gold' && data.earlyAccess && (
        <section className="bg-gradient-to-br from-amber-950/20 to-neutral-900 p-5 rounded-2xl border border-amber-500/20">
          <div className="flex items-center space-x-2 mb-4">
            <h2 className="text-lg md:text-xl font-bold text-amber-400 tracking-tight">Exclusive Early Access</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {data.earlyAccess.map((album) => (
              <AlbumCard key={album.id} album={album} badge="New" />
            ))}
          </div>
        </section>
      )}

      {/* Playlists (Uses PlaylistCard) */}
      <section className="space-y-2">
        <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">Recently Played Playlists</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {data.recentlyPlayed.map((playlist) => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </div>
      </section>

      {/* Trending Songs (Uses SongCard and passes subscriptionType for the Playlist Menu) */}
      <section className="space-y-2">
        <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">Trending Songs</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {data.trendingSongs.map((song) => (
            <SongCard key={song.id} song={song} subscriptionType={user.subscriptionType} />
          ))}
        </div>
      </section>

      {/* Recent Albums (Uses AlbumCard) */}
      <section className="space-y-2">
        <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">Recently Released Albums</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {data.recentAlbums.map((album) => (
            <AlbumCard key={album.id} album={album} />
          ))}
        </div>
      </section>
    </main>
  );
}