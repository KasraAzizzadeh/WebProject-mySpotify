import { UserProfile } from '@/types';
import EditableAvatar from './EditableAvatar';

interface ProfileCardProps {
  dbUser: UserProfile;
  isOwnProfile: boolean;
  isFollowing: boolean;
  handleFollowToggle: () => void;
  followLoading?: boolean;
  hasAvatarPermission: boolean;
  onAvatarDirectUpload: (file: File) => void;
  onAvatarRemove: () => void;
}

export default function ProfileCard({
  dbUser,
  isOwnProfile,
  isFollowing,
  handleFollowToggle,
  followLoading = false,
  hasAvatarPermission,
  onAvatarDirectUpload,
  onAvatarRemove,
}: ProfileCardProps) {

  const isVerified = dbUser.artistProfile?.verificationStatus === 'approved';
  const isPending = dbUser.artistProfile?.verificationStatus === 'pending';

  return (
    <section className="bg-neutral-900/50 border border-neutral-800/60 rounded-3xl p-6 md:p-10 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden backdrop-blur-sm">

      <div className="flex-shrink-0">
        <EditableAvatar
          src={dbUser.profilePictureUrl}
          alt={dbUser.displayName}
          size={120}
          isOwnProfile={isOwnProfile}
          hasPermission={hasAvatarPermission}
          onFileSelect={onAvatarDirectUpload}
          onRemovePhoto={onAvatarRemove}
        />
      </div>

      <div className="flex-1 text-center md:text-left space-y-2">
        <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
          <span className="text-xs uppercase font-bold tracking-widest text-neutral-400 flex items-center gap-1">
            {dbUser.role}
            {dbUser.role === 'artist' && isVerified && (
              <span className="text-blue-400 text-sm">🔹</span>
            )}
            {dbUser.role === 'artist' && isPending && isOwnProfile && (
              <span className="text-yellow-400 text-[10px] ml-2">
                pending
              </span>
            )}
          </span>

          <span
            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-sm uppercase ${
              dbUser.subscriptionType === 'gold'
                ? 'bg-amber-500 text-black'
                : 'bg-neutral-700 text-neutral-300'
            }`}
          >
            {dbUser.subscriptionType}
          </span>
        </div>

        <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
          {dbUser.displayName}
        </h1>

        <p className="text-neutral-400 font-medium">
          @{dbUser.username}
        </p>
      </div>

      {!isOwnProfile && (
        <div className="w-full md:w-auto flex justify-center mt-4 md:mt-0">
          <button
            onClick={handleFollowToggle}
            disabled={followLoading}
            className={`w-full md:w-auto px-6 py-2.5 text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center ${
              isFollowing 
                ? 'bg-transparent border border-neutral-700 text-neutral-300 hover:bg-neutral-800' 
                : 'bg-white text-black hover:bg-neutral-200'
            }`}
          >
            {followLoading ? 'Processing...' : isFollowing ? 'Unfollow' : 'Follow'}
          </button>
        </div>
      )}

    </section>
  );
}