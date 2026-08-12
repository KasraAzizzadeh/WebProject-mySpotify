'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Bell, Infinity } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import NotificationModal from '@/components/NotificationModal';
import { useUserNotifications } from '@/hooks/queries/user/useUserNotifications';
import { userService } from '@/services/userService';
import { UserProfile } from '@/types';

interface Props {
  user: UserProfile;
}

export default function ProfileHeader({ user }: Props) {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [dbUser, setDbUser] = useState<UserProfile>(user);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      if (!user?.id) return;

      try {
        const freshUser = await userService.getUserProfile(user.id);
        if (isMounted && freshUser) {
          setDbUser(freshUser);
        }
      } catch (error) {
        console.error('Failed to load profile header user:', error);
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const currentUser = dbUser; //?? user;
  const { data: notifications = [] } = useUserNotifications(currentUser.id, currentUser.role);

  const hasUnreadNotifications = useMemo(() => {
    return notifications.some((notification) => notification.status === 'unread');
  }, [notifications]);

  const dailyStreams = currentUser.listenerProfile?.dailyStreams ?? 0;
  const isBasic = currentUser.subscriptionType === 'basic';

  const showStreamLimitBadge = currentUser.role === 'artist' || currentUser.role === 'listener' || currentUser.role === 'supporter' || currentUser.role === 'admin';

  return (
    <header className="sticky top-0 z-40 w-full md:max-w-[calc(100%-1rem)]">
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
              Welcome Back ({currentUser.role})
            </span>

            <h1 className="text-xl md:text-3xl font-bold text-white mt-0.5 hover:text-green-400 transition-colors">
              {currentUser.displayName}
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            {currentUser.subscriptionType === 'gold' && (
              <span className="hidden sm:inline-block text-[11px] font-extrabold bg-gradient-to-r from-amber-400 to-yellow-600 text-black px-2.5 py-1 rounded-md uppercase">
                🏆 Gold Access
              </span>
            )}

            <div className="flex items-center gap-2">
              {showStreamLimitBadge && (
                <span className="flex items-center gap-1 rounded-full border border-neutral-800 bg-neutral-950/80 px-2.5 py-1 text-[11px] font-semibold text-neutral-400">
                  {isBasic ? `${dailyStreams}/60` : dailyStreams} Streams
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
              src={currentUser.profilePictureUrl}
              alt={currentUser.displayName}
              size={52}
            />
          </div>
        </Link>

        <NotificationModal
          isOpen={isNotificationOpen}
          onClose={() => setIsNotificationOpen(false)}
          user={currentUser}
        />
      </div>
    </header>
  );
}