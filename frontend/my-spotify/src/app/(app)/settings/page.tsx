'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

import Alert from '@/components/ui/Alert';
import Message from '@/components/ui/Message';
import Button from '@/components/ui/Button';
import PlansModal from '@/components/settings/PlansModal';
import PreferencesForm from '@/components/settings/PreferencesForm';
import { SettingsHeader, ProfilePanel, SubscriptionPanel } from '@/components/settings/Panels';

import { Trash2 } from 'lucide-react';

// TanStack hook for current user
import { useUserProfile } from '@/hooks/queries/user/useUserProfile';

type ModalState = 'none' | 'delete' | 'plans' | 'save_success';

export default function SettingsPage() {
  const { user: authUser, deleteUser } = useAuth() as any;
  const router = useRouter();

  const [successDescription, setSuccessDescription] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<ModalState>('none');
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch the freshest user profile via TanStack
  const {
    data: freshUser,
    isLoading: profileLoading,
    error: profileError,
  } = useUserProfile(authUser?.id);

  const userToUse = freshUser ?? authUser;

  if (profileLoading) {
    return (
      <div className="h-screen flex items-center justify-center text-neutral-500 text-sm bg-[#121212]">
        Loading...
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="h-screen flex items-center justify-center text-red-400 text-sm bg-[#121212]">
        Failed to load user profile.
      </div>
    );
  }

  const handlePreferencesSaved = (description: string) => {
    setErrorMessage(null);
    setSuccessDescription(description);
    setActiveModal('save_success');
  };

  const handlePlanSelectionSave = (chosenPlan: 'basic' | 'silver' | 'gold') => {
    console.log("Plan selected:", chosenPlan);

    setSuccessDescription(
      `Plan update to ${chosenPlan.toUpperCase()} started successfully.`
    );
    setActiveModal('save_success');
  };

  const executeDeleteAccount = async () => {
    setErrorMessage(null);
    setIsProcessing(true);

    try {
      await deleteUser();
    } catch (error) {
      console.error(error);
      setErrorMessage("Could not delete account.");
      setIsProcessing(false);
      setActiveModal('none');
    }
  };

  const activeSubscriptionType = userToUse?.subscriptionType || 'basic';

  return (
    <main className="min-h-screen bg-[#121212] text-white p-4 md:p-8">
      {/* Container scaled up to match the profile page structure and breathing room */}
      <div className="max-w-4xl mx-auto space-y-8 md:space-y-12">

        {/* Header */}
        <SettingsHeader onBackClick={() => router.push('/home')} />

        {/* Alert */}
        <Alert message={errorMessage} />

        {/* PROFILE */}
        <section className="space-y-3">
          <h2 className="text-[11px] tracking-[0.2em] text-neutral-500 uppercase">
            Account
          </h2>
          <ProfilePanel onEditProfileClick={() => router.push('/profile')} />
        </section>

        {/* SUBSCRIPTION */}
        <section className="space-y-3">
          <h2 className="text-[11px] tracking-[0.2em] text-neutral-500 uppercase">
            Subscription
          </h2>
          <SubscriptionPanel
            user={userToUse}
            onManageClick={() => setActiveModal('plans')}
          />
        </section>

        {/* PREFERENCES */}
        <section className="space-y-3">
          <h2 className="text-[11px] tracking-[0.2em] text-neutral-500 uppercase">
            Preferences
          </h2>
          <PreferencesForm
            onSaveSuccess={handlePreferencesSaved}
            onSaveFailure={(err) => setErrorMessage(err)}
          />
        </section>

        {/* SUPPORT */}
        <section className="space-y-3">
          <h2 className="text-[11px] tracking-[0.2em] text-neutral-500 uppercase">
            Support
          </h2>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-neutral-800 bg-neutral-900/30 px-4 py-4 md:px-6 md:py-6">
            <div>
              <p className="text-sm text-white font-medium">
                Need Help?
              </p>
              <p className="text-xs text-neutral-400 mt-1 max-w-md">
                Send a question to our support team and we'll get back to you as soon as possible.
              </p>
            </div>

            <Button
              variant="primary"
              onClick={() => router.push('/ask-support')}
              className="!w-auto px-5 !py-2 text-xs rounded-xl"
            >
              Contact Support
            </Button>
          </div>
        </section>

        {/* DANGER ZONE */}
        <section className="space-y-3">
          <h2 className="text-[11px] tracking-[0.2em] text-red-400 uppercase">
            Danger Zone
          </h2>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-4 md:px-6 md:py-6">
            <div>
              <p className="text-sm text-red-300 font-medium">
                Delete Account
              </p>
              <p className="text-xs text-neutral-400 mt-1 max-w-md">
                Permanently remove your account and data.
              </p>
            </div>

            <Button
              onClick={() => setActiveModal('delete')}
              variant="danger"
              className="!w-auto px-4 !py-2 text-xs rounded-xl flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </div>
        </section>

        {/* MODALS */}
        <PlansModal
          isOpen={activeModal === 'plans'}
          currentPlan={activeSubscriptionType}
          onClose={() => setActiveModal('none')}
          onSelectPlan={handlePlanSelectionSave}
        />

        <Message
          isOpen={activeModal === 'save_success'}
          title="Settings Saved"
          description={successDescription}
          confirmLabel="OK"
          type="alert"
          onConfirm={() => setActiveModal('none')}
        />

        <Message
          isOpen={activeModal === 'delete'}
          title="Delete Account?"
          description="This action cannot be undone."
          confirmLabel="Delete Account"
          isDangerous
          isLoading={isProcessing}
          onConfirm={executeDeleteAccount}
          onCancel={() => setActiveModal('none')}
        />

      </div>
    </main>
  );
}