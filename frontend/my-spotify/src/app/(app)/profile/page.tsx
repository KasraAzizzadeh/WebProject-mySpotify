'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfileRedirectPage() {
  const { user: authUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authUser?.id) {
      router.replace(`/profile/${authUser.id}`);
    } else {
      router.replace('/login');
    }
  }, [authUser, router]);

  return (
    <div className="h-screen flex items-center justify-center text-neutral-500 text-sm tracking-wide">
      Loading profile...
    </div>
  );
}