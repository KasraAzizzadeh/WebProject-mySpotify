'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { getDashboardData } from '@/services/homeService';
import { DashboardData, UserProfile } from '@/types';

import ProfileHeader from '@/components/ProfileHeader';
import ExclusiveRow from '@/components/ExclusiveRow';
import PlaylistRow from '@/components/PlaylistRow';
import TrendingRow from '@/components/TrendingRow';
import RecentRow from '@/components/RecentRow';

export default function HomePage() {
  const { user: authUser } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);

  const user: UserProfile = authUser || {
    id: 'user-123',
    username: 'jam_session99',
    displayName: 'Alex Carter',
    email: 'alex.carter@gmail.com',
    profilePictureUrl: undefined,
    role: 'listener',
    subscriptionType: 'gold',
  };

  useEffect(() => {
    getDashboardData(user.subscriptionType).then(setData);
  }, [authUser, user.subscriptionType]);

  if (!data) {
    return (
      <div className="h-screen flex items-center justify-center text-neutral-500 text-sm tracking-wide">
        Loading music environment...
      </div>
    );
  }

  return (
    <main className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto relative">
      <ProfileHeader user={user} />

      <ExclusiveRow user={user} data={data} />

      <PlaylistRow data={data} />

      <TrendingRow data={data} user={user} />

      <RecentRow data={data} />
    </main>
  );
}