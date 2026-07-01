'use client';

import React from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { ArrowLeft, LogOut, User, Shield } from 'lucide-react';
import { UserProfile } from '@/types';

export function SettingsHeader({ onLogoutClick, onBackClick }: { onLogoutClick: () => void; onBackClick: () => void }) {
  return (
    <div className="flex items-center justify-between pb-4 border-b border-neutral-800/60">
      <div className="flex items-center gap-3">
        <button
          onClick={onBackClick}
          className="p-2 bg-[#141414] hover:bg-[#1a1a1a] border border-neutral-800/60 rounded-xl text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Settings</h1>
          <p className="text-xs text-neutral-500 font-normal">Manage your account and app preferences.</p>
        </div>
      </div>
      
      <button
        onClick={onLogoutClick}
        className="flex items-center gap-2 text-xs font-semibold text-red-400 hover:text-red-300 transition-colors bg-red-950/10 hover:bg-red-950/20 border border-red-900/30 px-3 py-2 rounded-xl"
      >
        <LogOut className="w-3.5 h-3.5" />
        <span>Log out</span>
      </button>
    </div>
  );
}

export function ProfilePanel() {
  return (
    <div className="flex items-center justify-between bg-[#141414] border border-neutral-800/60 rounded-2xl p-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-400">
          <User className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Edit Profile</h3>
          <p className="text-xs text-neutral-500">Change your display name and profile picture.</p>
        </div>
      </div>
      <Link 
        href="/profile" 
        className="text-xs font-semibold text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 px-3 py-2 rounded-xl transition-colors"
      >
        Edit
      </Link>
    </div>
  );
}

export function SubscriptionPanel({ user }: { user: UserProfile }) {
  return (
    <div className="flex items-center justify-between bg-[#141414] border border-neutral-800/60 rounded-2xl p-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-400">
          <Shield className="w-4 h-4" />
        </div>
        <div className="space-y-0.5">
          <h3 className="text-sm font-semibold text-white">Access Tier</h3>
          <div className="flex items-center">
            {user.subscriptionType === 'gold' ? (
              <span className="text-[10px] font-extrabold bg-gradient-to-r from-amber-400 to-yellow-600 text-black px-2 py-0.5 rounded uppercase tracking-wider">
                Gold Plan
              </span>
            ) : (
              <span className="text-xs font-medium text-neutral-400">
                Basic Free Plan
              </span>
            )}
          </div>
        </div>
      </div>
      
      <Button
        onClick={() => alert("Subscription management will be available in Phase 2.")}
        variant="primary"
        className="!w-auto px-4 !py-2 text-xs rounded-xl"
      >
        Manage Plan
      </Button>
    </div>
  );
}