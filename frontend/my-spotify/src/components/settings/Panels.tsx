'use client';

import React from 'react';
import { Shield, ArrowLeft, User } from 'lucide-react';
import Button from '@/components/ui/Button'; 
import { UserProfile } from '@/types';

interface SettingsHeaderProps {
  onBackClick: () => void;
}

// 1. Settings Header Component
export function SettingsHeader({ onBackClick }: SettingsHeaderProps) {
  return (
    <div className="flex items-center gap-4 pb-2">
      <button
        type="button"
        onClick={onBackClick}
        className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900 border border-neutral-800/40 transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
      </button>
      <div>
        <h1 className="text-xl font-black tracking-tight text-white">Settings</h1>
        <p className="text-xs text-neutral-500">Manage your account preferences and access level.</p>
      </div>
    </div>
  );
}

interface ProfilePanelProps {
  onEditProfileClick: () => void;
}

// 2. Profile Panel Component (Updated with Button)
export function ProfilePanel({ onEditProfileClick }: ProfilePanelProps) {
  return (
    <div className="flex items-center justify-between bg-[#141414] border border-neutral-800/60 rounded-2xl p-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-400 flex items-center justify-center">
          <User className="w-4 h-4" />
        </div>
        <div className="space-y-0.5">
          <h3 className="text-sm font-semibold text-white">Account Profile</h3>
          <p className="text-xs text-neutral-500">Your personalized identity configurations.</p>
        </div>
      </div>

      <Button
        onClick={onEditProfileClick}
        variant="secondary"
        className="!w-auto px-4 !py-2 text-xs rounded-xl flex items-center justify-center"
      >
        Edit Profile
      </Button>
    </div>
  );
}

interface SubscriptionPanelProps {
  user: UserProfile;
  onManageClick: () => void;
}

// 3. Subscription Panel Component
export function SubscriptionPanel({ user, onManageClick }: SubscriptionPanelProps) {
  return (
    <div className="flex items-center justify-between bg-[#141414] border border-neutral-800/60 rounded-2xl p-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-400 flex items-center justify-center">
          <Shield className="w-4 h-4" />
        </div>
        <div className="space-y-0.5">
          <h3 className="text-sm font-semibold text-white">Access Tier</h3>
          <div className="flex items-center">
            {user.subscriptionType === 'gold' || user.subscriptionType === 'silver' ? (
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider ${
                user.subscriptionType === 'gold' ? 'bg-gradient-to-r from-amber-400 to-yellow-600 text-black' : 'bg-neutral-700 text-white'
              }`}>
                {user.subscriptionType} Plan
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
        onClick={onManageClick}
        variant="primary"
        className="!w-auto px-4 !py-2 text-xs rounded-xl flex items-center justify-center"
      >
        Manage Plan
      </Button>
    </div>
  );
}