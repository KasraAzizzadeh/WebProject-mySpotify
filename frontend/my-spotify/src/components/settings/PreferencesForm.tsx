'use client';

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { Bell, Volume2, Globe } from 'lucide-react';

type PreferencesFormProps = {
  onSaveSuccess: (description: string) => void;
  onSaveFailure: (error: string) => void;
};

export default function PreferencesForm({ onSaveSuccess, onSaveFailure }: PreferencesFormProps) {
  const [notificationLimit, setNotificationLimit] = useState('10');
  const [systemVoice, setSystemVoice] = useState('en-US-standard');
  const [language, setLanguage] = useState('en');

  const [initialSettings, setInitialSettings] = useState({
    limit: '10',
    voice: 'en-US-standard',
    lang: 'en',
  });

  useEffect(() => {
    const savedLimit = localStorage.getItem('setting_notification_limit') || '10';
    const savedVoice = localStorage.getItem('setting_system_voice') || 'en-US-standard';
    const savedLang = localStorage.getItem('setting_interface_language') || 'en';

    setNotificationLimit(savedLimit);
    setSystemVoice(savedVoice);
    setLanguage(savedLang);

    setInitialSettings({ limit: savedLimit, voice: savedVoice, lang: savedLang });
  }, []);

  const isFormDirty =
    notificationLimit !== initialSettings.limit ||
    systemVoice !== initialSettings.voice ||
    language !== initialSettings.lang;

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const changedKeys: string[] = [];

      if (notificationLimit !== initialSettings.limit) {
        localStorage.setItem('setting_notification_limit', notificationLimit);
        changedKeys.push('notification limit');
      }
      if (systemVoice !== initialSettings.voice) {
        localStorage.setItem('setting_system_voice', systemVoice);
        changedKeys.push('system voice');
      }
      if (language !== initialSettings.lang) {
        localStorage.setItem('setting_interface_language', language);
        changedKeys.push('language');
      }

      setInitialSettings({ limit: notificationLimit, voice: systemVoice, lang: language });
      onSaveSuccess(`Settings changed for ${changedKeys.join(' and ')}`);
    } catch (error) {
      onSaveFailure('Failed to save settings to browser disk.');
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