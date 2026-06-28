import Input from '@/components/ui/Input'; // <-- New Import
import { UserProfile } from '@/types';

interface ProfileDetailsProps {
  dbUser: UserProfile;
  isOwnProfile: boolean;
  isEditing: boolean;
  isSaving: boolean;
  displayName: string;
  setDisplayName: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  bioText: string;
  setBioText: (val: string) => void;
}

export default function ProfileDetails({
  dbUser,
  isOwnProfile,
  isEditing,
  isSaving,
  displayName,
  setDisplayName,
  email,
  setEmail,
  bioText,
  setBioText,
}: ProfileDetailsProps) {
  return (
    <section className="bg-neutral-900/30 border border-neutral-800/50 p-6 md:p-8 rounded-3xl space-y-6">
      <h2 className="text-xl font-bold text-white tracking-tight">Profile Details</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
        <div className="space-y-2">
          {isOwnProfile && isEditing ? (
            <Input 
              label="Display Name"
              type="text" 
              value={displayName} 
              onChange={(e) => setDisplayName(e.target.value)} 
              disabled={isSaving} 
              className="disabled:opacity-50 text-sm" 
            />
          ) : (
            <>
              <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Display Name</label>
              <div className="bg-neutral-950/50 border border-neutral-800/50 rounded-lg px-4 py-3 text-white text-sm">{dbUser.displayName}</div>
            </>
          )}
        </div>

        {isOwnProfile && (
          <div className="space-y-2">
            {isOwnProfile && isEditing ? (
              <Input 
                label="Email Address"
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                disabled={isSaving} 
                className="disabled:opacity-50 text-sm" 
              />
            ) : (
              <>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Email Address</label>
                <div className="bg-neutral-950/50 border border-neutral-800/50 rounded-lg px-4 py-3 text-white text-sm">{dbUser.email}</div>
              </>
            )}
          </div>
        )}
      </div>

      {dbUser.role === 'artist' && (
        <div className="space-y-2 pt-2">
          <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Artist Biography</label>
          {isOwnProfile && isEditing ? (
            <textarea 
              value={bioText} 
              onChange={(e) => setBioText(e.target.value)} 
              disabled={isSaving} 
              rows={4} 
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-3 text-white resize-none text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all disabled:opacity-50" 
            />
          ) : (
            <div className="bg-neutral-950/50 border border-neutral-800/50 rounded-lg px-4 py-3 text-neutral-300 text-sm leading-relaxed whitespace-pre-wrap">
              {dbUser.artistProfile?.bio || 'No biography provided yet.'}
            </div>
          )}
        </div>
      )}
    </section>
  );
}