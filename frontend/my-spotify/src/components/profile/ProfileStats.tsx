import { UserProfile } from '@/types'; 

interface ProfileStatsProps {
  dbUser: UserProfile;
  followersCount: number;
  followingCount: number;
  totalStreams: number;
}

export default function ProfileStats({
  dbUser,
  followersCount,
  followingCount,
  totalStreams,
}: ProfileStatsProps) {
  const dailyStreams = dbUser.listenerProfile?.dailyStreams ?? 0;

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div className="bg-neutral-900/40 border border-neutral-800/50 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-bold text-white">{followersCount}</span>
        <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider mt-1">Followers</span>
      </div>
      
      <div className="bg-neutral-900/40 border border-neutral-800/50 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-bold text-white">{followingCount}</span>
        <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider mt-1">Following</span>
      </div>

      {dbUser.role === 'artist' && (
        <div className="bg-neutral-900/40 border border-neutral-800/50 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-bold text-green-400">{totalStreams.toLocaleString()}</span>
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider mt-1">Total Streams</span>
        </div>
      )}

      {dbUser.role !== 'artist' && (
        <div className="bg-neutral-900/40 border border-neutral-800/50 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-bold text-white">{dailyStreams}</span>
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider mt-1">Daily Streams</span>
        </div>
      )}

    </section>
  );
}