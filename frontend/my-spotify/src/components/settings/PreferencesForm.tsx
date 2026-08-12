'use client';

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { Bell, Volume2, Globe } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/userService';
import { UserProfile } from '@/types';

type PreferencesFormProps = {
  onSaveSuccess: (description: string) => void;
  onSaveFailure: (error: string) => void;
  user?: UserProfile | null;
};

export default function PreferencesForm({ onSaveSuccess, onSaveFailure, user }: PreferencesFormProps) {
  const { user: authUser } = useAuth() as any;
  const currentUser = user ?? authUser;

  const [notificationLimit, setNotificationLimit] = useState('10');
  const [systemVoice, setSystemVoice] = useState('en-is');
  const [language, setLanguage] = useState('en');

  const [initialSettings, setInitialSettings] = useState({
    limit: '10',
    voice: 'en-is',
    lang: 'en',
  });

  useEffect(() => {
    const settings = currentUser?.settings ?? {
      notificationLimit: 10,
      systemVoice: 'en-is',
      language: 'en',
    };

    const savedLimit = String(settings.notificationLimit ?? 10);
    const savedVoice = settings.systemVoice ?? 'en-is';
    const savedLang = settings.language ?? 'en';

    setNotificationLimit(savedLimit);
    setSystemVoice(savedVoice);
    setLanguage(savedLang);

    setInitialSettings({ limit: savedLimit, voice: savedVoice, lang: savedLang });
  }, [currentUser]);

  const isFormDirty =
    notificationLimit !== initialSettings.limit ||
    systemVoice !== initialSettings.voice ||
    language !== initialSettings.lang;

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser?.id) {
      onSaveFailure('User session is not available.');
      return;
    }

    try {
      const changedKeys: string[] = [];

      if (notificationLimit !== initialSettings.limit) {
        changedKeys.push('notification limit');
      }
      if (systemVoice !== initialSettings.voice) {
        changedKeys.push('system voice');
      }
      if (language !== initialSettings.lang) {
        changedKeys.push('language');
      }

      await userService.updateUserSettings(currentUser.id, {
        language,
        systemVoice,
        notificationLimit: Number(notificationLimit),
      });

      setInitialSettings({ limit: notificationLimit, voice: systemVoice, lang: language });
      onSaveSuccess(`Settings changed for ${changedKeys.join(' and ')}`);
    } catch (error) {
      console.error('Failed to save settings:', error);
      onSaveFailure('Failed to save settings to the server.');
    }
  };

  return (
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
          min="1"
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
          <option value="en-is">English (US) - Male</option>
          <option value="fa">فارسی (Persian)</option>
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
        <Button
          type="submit"
          variant="primary"
          disabled={!isFormDirty}
          className={
            !isFormDirty
              ? '!bg-[#1a1a1a] !text-neutral-600 border border-neutral-900/60 opacity-60 !cursor-not-allowed pointer-events-none'
              : 'text-sm font-semibold py-2.5 rounded-xl'
          }
        >
          Save Changes
        </Button>
      </div>
    </form>
  );
}