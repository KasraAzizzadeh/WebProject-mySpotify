'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

import Alert from '@/components/ui/Alert';
import Message from '@/components/ui/Message';

// Updated import paths to hook into your global UI assets folder
import PreferencesForm from '@/components/settings/PreferencesForm';
import { SettingsHeader, ProfilePanel, SubscriptionPanel } from '@/components/settings/Panels';

import { Trash2 } from 'lucide-react';

type ModalState = 'none' | 'logout' | 'delete' | 'save_success';

export default function SettingsPage() {
  const { user: authUser, logoutUser, deleteUser } = useAuth();
  const router = useRouter();

  const [successDescription, setSuccessDescription] = useState('');
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

  const handlePreferencesSaved = (description: string) => {
    setErrorMessage(null);
    setSuccessDescription(description);
    setActiveModal('save_success');
  };

  const executeDeleteAccount = async () => {
    setErrorMessage(null);
    setIsProcessing(true);
    try {
      await deleteUser();
    } catch (error) {
      console.error(error);
      setErrorMessage("Something went wrong. Could not delete your account.");
      setIsProcessing(false);
      setActiveModal('none');
    }
  };

  return (
    <main className="p-4 md:p-8 max-w-2xl mx-auto space-y-6 bg-black min-h-screen text-white relative">
      
      <SettingsHeader 
        onBackClick={() => router.push('/home')} 
        onLogoutClick={() => setActiveModal('logout')} 
      />

      <Alert message={errorMessage} />

      <ProfilePanel />

      <SubscriptionPanel user={authUser} />

      <PreferencesForm 
        onSaveSuccess={handlePreferencesSaved} 
        onSaveFailure={(err) => setErrorMessage(err)} 
      />

      {/* Account Deletion Panel */}
      <div className="flex items-center justify-between border border-red-950/30 bg-red-950/5 rounded-2xl p-4 gap-4">
        <button
          type="button"
          onClick={() => setActiveModal('delete')}
          className="text-xs font-semibold text-red-400/80 hover:text-red-400 transition-all flex items-center gap-2 px-3 py-2 bg-transparent hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/40 rounded-xl shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5 text-red-500/70" />
          <span>Delete Account</span>
        </button>
        <div className="text-right">
          <p className="text-xs text-neutral-400 leading-normal">
            Permanently close your profile and erase your history data.
          </p>
        </div>
      </div>

      {/* Modals */}
      <Message
        isOpen={activeModal === 'save_success'}
        title="Settings Saved"
        description={successDescription}
        confirmLabel="OK"
        type="alert"
        onConfirm={() => setActiveModal('none')}
      />

      <Message
        isOpen={activeModal === 'logout'}
        title="Log Out"
        description="Are you sure you want to log out? You will need to sign in again to access your account."
        confirmLabel="Log Out"
        onConfirm={logoutUser}
        onCancel={() => setActiveModal('none')}
      />

      <Message
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