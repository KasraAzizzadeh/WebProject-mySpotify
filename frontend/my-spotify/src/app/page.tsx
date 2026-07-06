'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function RootPage() {
  const { user, isLoading } = useAuth() as any;
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (user) {
      // ✅ Route based on operational management roles
      if (user.role === 'admin' || user.role === 'supporter') {
        router.replace('/support');
      } else {
        router.replace('/home');
      }
    } else {
      router.replace('/login'); // Fallback if no user exists
    }
  }, [user, isLoading, router]);

  return (
    <div className="h-screen flex items-center justify-center bg-black text-neutral-500 text-sm">
      Loading workspace...
    </div>
  );
}