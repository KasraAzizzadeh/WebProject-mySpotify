'use client';

import Link from 'next/link';
import Avatar from '@/components/ui/Avatar';
import { UserProfile } from '@/types';

interface Props {
  user: UserProfile;
}

export default function ProfileHeader({ user }: Props) {
  return (
    <header className="sticky top-0 z-40 w-full">
      
      {/* This keeps alignment with dashboard rows */}
      <div className="w-full">
        
        <Link
          href="/profile"
          className="
            flex items-center justify-between w-full
            bg-[#141414]
            border border-neutral-800/60
            rounded-2xl
            p-4
            hover:bg-[#1a1a1a]
            transition-all duration-200
          "
        >
          <div>
            <span className="text-xs uppercase font-semibold text-neutral-500 tracking-widest">
              Welcome Back ({user.role})
            </span>

            <h1 className="text-xl md:text-3xl font-bold text-white mt-0.5 hover:text-green-400 transition-colors">
              {user.displayName}
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            {user.subscriptionType === 'gold' && (
              <span className="hidden sm:inline-block text-[11px] font-extrabold bg-gradient-to-r from-amber-400 to-yellow-600 text-black px-2.5 py-1 rounded-md uppercase">
                🏆 Gold Access
              </span>
            )}

            <Avatar
              src={user.profilePictureUrl}
              alt={user.displayName}
              size={52}
            />
          </div>
        </Link>

      </div>
    </header>
  );
}