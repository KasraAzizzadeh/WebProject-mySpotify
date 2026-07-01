'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Alert from '@/components/ui/Alert';
import Confirm from '@/components/ui/Confirm';

import { Bell, Volume2, Globe, Trash2, ArrowLeft, LogOut, User, Shield } from 'lucide-react';

type ModalState = 'none' | 'logout' | 'delete';

export default function SettingsPage() {
  const { user: authUser, logoutUser } = useAuth();
  const router = useRouter();

  const [notificationLimit, setNotificationLimit] = useState('10');
  const [systemVoice, setSystemVoice] = useState('en-US-standard');
  const [language, setLanguage] = useState('en');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [activeModal, setActiveModal] = useState<ModalState>('none');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!authUser) {
    return (
      <div className="h-screen flex items-center justify-center text-neutral-500 text-sm bg-black">
        Loading...
      </div>
    );
  }

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Settings saved successfully.');
  };

  const executeDeleteAccount = async () => {
    setErrorMessage(null);
    setIsProcessing(true);
    try {
      logoutUser();
    } catch (error) {
      console.error(error);
      setErrorMessage("Something went wrong. Could not delete your account.");
      setIsProcessing(false);
      setActiveModal('none');
    }
  };

  return (
    <main className="p-4 md:p-8 max-w-2xl mx-auto space-y-6 bg-black min-h-screen text-white relative">
      
      {/* Header Panel */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-800/60">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/home')}
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
          onClick={() => setActiveModal('logout')}
          className="flex items-center gap-2 text-xs font-semibold text-red-400 hover:text-red-300 transition-colors bg-red-950/10 hover:bg-red-950/20 border border-red-900/30 px-3 py-2 rounded-xl"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Log out</span>
        </button>
      </div>

      <Alert message={errorMessage} />

      {/* Row 1: Profile link */}
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

      {/* Row 2: Subscription status details */}
      <div className="flex items-center justify-between bg-[#141414] border border-neutral-800/60 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-400">
            <Shield className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-sm font-semibold text-white">Access Tier</h3>
            <div className="flex items-center">
              {authUser.subscriptionType === 'gold' ? (
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
        <button
          onClick={() => alert("Subscription management will be available in Phase 2.")}
          className="text-xs font-semibold text-green-500 hover:text-green-400 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 px-3 py-2 rounded-xl transition-colors"
        >
          Manage Plan
        </button>
      </div>

      {/* Preferences Form Wrapper */}
      <form onSubmit={handleSaveSettings} className="bg-[#141414] border border-neutral-800/60 rounded-2xl p-5 space-y-5">
        
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            <Bell className="w-3.5 h-3.5" />
            <span>Daily Notification Limit</span>
          </label>
          <Input
            type="number"
            value={notificationLimit}
            onChange={(e) => setNotificationLimit(e.target.value)}
            min="0"
            max="100"
            className="bg-neutral-900/60 border-neutral-800 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            <Volume2 className="w-3.5 h-3.5" />
            <span>System Voice</span>
          </label>
          <Select
            value={systemVoice}
            onChange={(e) => setSystemVoice(e.target.value)}
            className="text-sm bg-neutral-900/60 border-neutral-800"
          >
            <option value="en-US-standard">English (US) - Male</option>
            <option value="en-US-neural">English (US) - Female</option>
            <option value="fa-IR-standard">Persian (IR) - Voice Alpha</option>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            <Globe className="w-3.5 h-3.5" />
            <span>Language</span>
          </label>
          <Select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="text-sm bg-neutral-900/60 border-neutral-800"
          >
            <option value="en">English</option>
            <option value="fa">فارسی (Persian)</option>
          </Select>
        </div>

        <div className="pt-2">
          <Button type="submit" className="w-full bg-white text-black hover:bg-neutral-200 font-semibold py-2 rounded-xl transition-colors text-sm">
            Save Changes
          </Button>
        </div>
      </form>

      {/* Red Tinted Account Erasure Strip */}
      <div className="flex items-center justify-between border border-red-950/30 bg-red-950/5 rounded-2xl p-4 gap-4">
        <button
          type="button"
          onClick={() => setActiveModal('delete')}
          className="text-xs font-semibold text-red-400/80 hover:text-red-400 transition-all flex items-center gap-2 px-3 py-2 bg-transparent hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/40 rounded-xl shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5 text-red-500/70 group-hover:text-red-400" />
          <span>Delete Account</span>
        </button>
        <div className="text-right">
          <p className="text-xs text-neutral-400 leading-normal">
            Permanently close your profile and erase your history data.
          </p>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* CONFIRM DIALOG OVERLAYS                                              */}
      {/* ==================================================================== */}
      
      <Confirm
        isOpen={activeModal === 'logout'}
        title="Log Out"
        description="Are you sure you want to log out? You will need to sign in again to access your account."
        confirmLabel="Log Out"
        onConfirm={logoutUser}
        onCancel={() => setActiveModal('none')}
      />

      <Confirm
        isOpen={activeModal === 'delete'}
        title="Delete Account?"
        description="Are you sure you want to delete your account? This will erase your settings and history data permanently. You cannot undo this action."
        confirmLabel="Delete Account"
        isDangerous={true}
        isLoading={isProcessing}
        onConfirm={executeDeleteAccount}
        onCancel={() => setActiveModal('none')}
      />

    </main>
  );
}