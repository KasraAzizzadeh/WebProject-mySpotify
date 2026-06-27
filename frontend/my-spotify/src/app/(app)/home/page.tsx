'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { getDashboardData } from '@/services/homeService';
import { DashboardData } from '@/types';

import ProfileHeader from '@/components/ProfileHeader';
import ExclusiveRow from '@/components/ExclusiveRow';
import PlaylistRow from '@/components/PlaylistRow';
import TrendingRow from '@/components/TrendingRow';
import RecentRow from '@/components/RecentRow';

export default function HomePage() {
  const { user: authUser } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    if (!authUser) return;

    getDashboardData(authUser.subscriptionType)
      .then((dashboardPayload) => {
        setData(dashboardPayload);
      })
      .catch((error) => console.error('Failed to resolve streaming layer dashboard:', error));
  }, [authUser]);

  if (!authUser) {
    return (
      <div className="h-screen flex items-center justify-center text-neutral-500 text-sm tracking-wide bg-black">
        Verifying user security context...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-screen flex items-center justify-center text-neutral-500 text-sm tracking-wide bg-black">
        Loading music environment...
      </div>
    );
  }

  return (
    <main className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto relative">
      <ProfileHeader user={authUser} />

      <ExclusiveRow user={authUser} data={data} />

      <PlaylistRow data={data} />

      <TrendingRow data={data} user={authUser} />

      <RecentRow data={data} />
    </main>
  );
}