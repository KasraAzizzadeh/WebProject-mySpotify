'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AuditingRecord } from '@/types';

import {
  getAuditingRecords,
  saveAuditingRecords
} from '@/store/mockDb';

import VerificationTab from '@/components/support/VerificationTab';
import TicketsTab from '@/components/support/TicketsTab';
import AuditingTab from '@/components/support/AuditingTab';
import SettingsTab from '@/components/support/SettingsTab';

import { ShieldCheck } from 'lucide-react';

export default function SupportDashboardPage() {
  const { user: authUser } = useAuth() as any;
  const searchParams = useSearchParams();

  const activeTab = searchParams?.get('tab') || 'verification';

  const [auditingRecords, setAuditingRecords] = useState<AuditingRecord[]>([]);

  useEffect(() => {
    refreshData();
  }, [activeTab]);

  const refreshData = () => {
    setAuditingRecords(getAuditingRecords());
  };

  const userRole = authUser?.role || 'admin';
  const isSystemAdmin = userRole === 'admin';
  const hasAccess = userRole === 'admin' || userRole === 'supporter';

  const handleSettlePayment = (recordId: string) => {
    const updated = getAuditingRecords().map(rec =>
      rec.id === recordId
        ? { ...rec, paymentStatus: 'Settled' as const }
        : rec
    );

    saveAuditingRecords(updated);
    setAuditingRecords(updated);
  };

  if (!hasAccess) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-neutral-400 bg-black gap-4 w-full">
        <ShieldCheck className="w-12 h-12 text-red-500/50" />
        <p>You do not have permission to view this panel.</p>
      </div>
    );
  }

  return (
    /* FIX: Changed 'h-screen' to scale out the height of the layout wrapper padding bounds natively.
      Using calculated max-height offsets avoids nested view breaks while anchoring view tab contents safely.
    */
    <section className="flex-1 flex flex-col min-h-[calc(100vh-6rem)] md:min-h-[calc(100vh-7rem)] bg-[#050505] w-full">
      <div className="flex-1 p-4 md:p-8">
        {activeTab === 'verification' && (
          <VerificationTab />
        )}

        {activeTab === 'tickets' && (
          <TicketsTab user={authUser}/>
        )}

        {activeTab === 'auditing' && (
          <AuditingTab
            auditingRecords={auditingRecords}
            isSystemAdmin={isSystemAdmin}
            onSettlePayment={handleSettlePayment}
          />
        )}

        {activeTab === 'settings' && isSystemAdmin && <SettingsTab />}
      </div>
    </section>
  );
}