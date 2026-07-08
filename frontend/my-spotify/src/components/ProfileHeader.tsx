'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import NotificationModal from '@/components/NotificationModal';
import { getNotifications } from '@/store/mockDb';
import { UserProfile } from '@/types';

interface Props {
  user: UserProfile;
}

export default function ProfileHeader({ user }: Props) {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const hasUnreadNotifications = useMemo(() => {
    return getNotifications().some((notification) => notification.userId === user.id && notification.status === 'unread');
  }, [user.id, isNotificationOpen]);

  const showStreamLimitBadge = user.role === 'listener' && user.subscriptionType === 'basic';
  const dailyStreams = user.listenerProfile?.dailyStreams ?? 0;
  const streamLimit = 60;

  return (
    <header className="sticky top-0 z-40 w-full md:max-w-[calc(100%-1rem)]">
      
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

            <div className="flex items-center gap-2">
              {showStreamLimitBadge && (
                <span className="rounded-full border border-neutral-800 bg-neutral-950/80 px-2.5 py-1 text-[11px] font-semibold text-neutral-400">
                  {dailyStreams}/{streamLimit}
                </span>
              )}

              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setIsNotificationOpen(true);
                }}
                className="relative rounded-full border border-neutral-800 bg-neutral-900 p-2 text-neutral-300 transition hover:border-neutral-600 hover:text-white"
                aria-label="Open notifications"
              >
                <Bell className="h-5 w-5" />
                {hasUnreadNotifications && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-red-500" />
                )}
              </button>
            </div>

            <Avatar
              src={user.profilePictureUrl}
              alt={user.displayName}
              size={52}
            />
          </div>
        </Link>

        <NotificationModal
          isOpen={isNotificationOpen}
          onClose={() => setIsNotificationOpen(false)}
          user={user}
        />
      </div>
    </header>
  );
}