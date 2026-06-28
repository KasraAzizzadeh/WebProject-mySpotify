import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import { UserProfile } from '@/types';

interface ProfileCardProps {
  dbUser: UserProfile;
  isOwnProfile: boolean;
  isEditing: boolean;
  isSaving: boolean;
  isFollowing: boolean;
  setIsEditing: (val: boolean) => void;
  setIsFollowing: (val: boolean) => void;
  handleCancelEdit: () => void;
  handleSaveProfile: () => void;
}

export default function ProfileCard({
  dbUser,
  isOwnProfile,
  isEditing,
  isSaving,
  isFollowing,
  setIsEditing,
  setIsFollowing,
  handleCancelEdit,
  handleSaveProfile,
}: ProfileCardProps) {

  const isVerified =
    dbUser.artistProfile?.verificationStatus === 'approved';

  const isPending =
    dbUser.artistProfile?.verificationStatus === 'pending';

  return (
    <section className="bg-neutral-900/50 border border-neutral-800/60 rounded-3xl p-6 md:p-10 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden backdrop-blur-sm">

      {/* Avatar */}
      <div className="relative group flex-shrink-0">
        <Avatar
          src={dbUser.profilePictureUrl}
          alt={dbUser.displayName}
          size={120}
        />
      </div>

      {/* Identity */}
      <div className="flex-1 text-center md:text-left space-y-2">

        <div className="flex items-center justify-center md:justify-start gap-3 mb-1">

          {/* ROLE + STATUS */}
          <span className="text-xs uppercase font-bold tracking-widest text-neutral-400 flex items-center gap-1">
            {dbUser.role}

            {/* verified badge */}
            {dbUser.role === 'artist' && isVerified && (
              <span className="text-blue-400 text-sm">🔹</span>
            )}

            {/* pending label (ONLY for owner) */}
            {dbUser.role === 'artist' && isPending && isOwnProfile && (
              <span className="text-yellow-400 text-[10px] ml-2">
                pending
              </span>
            )}
          </span>

          {/* Subscription */}
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

        {/* Name */}
        <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
          {dbUser.displayName}
        </h1>

        {/* Username */}
        <p className="text-neutral-400 font-medium">
          @{dbUser.username}
        </p>

      </div>

      {/* Actions */}
      <div className="w-full md:w-auto flex justify-center mt-4 md:mt-0">

        {isOwnProfile ? (
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">

            {isEditing ? (
              <>
                <Button
                  variant="secondary"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="md:w-auto px-6 py-2.5 text-sm disabled:opacity-50"
                >
                  Cancel
                </Button>

                <Button
                  variant="primary"
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="md:w-auto px-6 py-2.5 text-sm disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            ) : (
              <Button
                variant="secondary"
                onClick={() => setIsEditing(true)}
                className="md:w-auto px-6 py-2.5 text-sm border border-neutral-700"
              >
                Edit Profile
              </Button>
            )}

          </div>
        ) : (
          // TODO implement the follow functionality
          <Button
            variant={isFollowing ? 'danger' : 'primary'}
            onClick={() => setIsFollowing(!isFollowing)}
            className={`md:w-auto px-6 py-2.5 text-sm ${
              isFollowing ? 'border border-neutral-600' : ''
            }`}
          >
            {isFollowing ? 'Unfollow' : 'Follow'}
          </Button>
        )}

      </div>

    </section>
  );
}