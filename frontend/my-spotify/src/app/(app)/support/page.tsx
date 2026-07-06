'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ArtistApplicationTicket, SupportTicketLocal, AuditingRecord } from '@/types';
import { 
  getApplicaitonTickets, saveApplicationTickets,
  getSupportTickets, saveSupportTickets,
  getAuditingRecords, saveAuditingRecords 
} from '@/store/mockDb';

import VerificationTab from '@/components/support/VerificationTab';
import TicketsTab from '@/components/support/TicketsTab';
import AuditingTab from '@/components/support/AuditingTab';
import SettingsTab from '@/components/support/SettingsTab';
import { ShieldCheck } from 'lucide-react';

export default function SupportDashboardPage() {
  const { user: authUser } = useAuth() as any;
  const searchParams = useSearchParams();
  
  // Directly targets the active subview from the global sidebar link parameter
  const activeTab = searchParams?.get('tab') || 'verification';
  
  const [verifications, setVerifications] = useState<ArtistApplicationTicket[]>([]);
  const [tickets, setTickets] = useState<SupportTicketLocal[]>([]);
  const [auditingRecords, setAuditingRecords] = useState<AuditingRecord[]>([]);

  useEffect(() => {
    refreshData();
  }, [activeTab]); // Triggers fresh query calculations automatically when tab adjustments happen

  const refreshData = () => {
    setVerifications(getApplicaitonTickets().filter(t => t.verificationStatus === 'pending'));
    setTickets(getSupportTickets());
    setAuditingRecords(getAuditingRecords());
  };

  const userRole = authUser?.role || 'admin'; 
  const isSystemAdmin = userRole === 'admin';
  const hasAccess = userRole === 'admin' || userRole === 'supporter';

  const handleApproveArtist = (ticketId: string) => {
    const all = getApplicaitonTickets().map(t => t.id === ticketId ? { ...t, verificationStatus: 'approved' as const } : t);
    saveApplicationTickets(all);
    refreshData();
  };

  const handleRejectArtist = (ticketId: string) => {
    const all = getApplicaitonTickets().map(t => t.id === ticketId ? { ...t, verificationStatus: 'rejected' as const } : t);
    saveApplicationTickets(all);
    refreshData();
  };

  const handleSendReply = (ticketId: string, replyText: string, currentActiveSetter: (t: SupportTicketLocal) => void) => {
    const updated = getSupportTickets().map(t => {
      if (t.id === ticketId) {
        const messages = [
          ...t.messages,
          {
            id: `m-local-${Date.now()}`,
            senderId: authUser?.id || 'support-agent',
            senderName: authUser?.displayName || 'Support Team',
            senderRole: 'support' as const,
            content: replyText,
            timestamp: new Date().toLocaleString()
          }
        ];
        return { ...t, status: 'Replied' as const, messages };
      }
      return t;
    });
    saveSupportTickets(updated);
    setTickets(updated);
    const active = updated.find(t => t.id === ticketId);
    if (active) currentActiveSetter(active);
  };

  const handleSettlePayment = (recordId: string) => {
    const updated = getAuditingRecords().map(rec => rec.id === recordId ? { ...rec, paymentStatus: 'Settled' as const } : rec);
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
    <section className="flex-1 flex flex-col h-screen overflow-hidden bg-[#050505] w-full">
      {/* Clean content panel dashboard view layer with no top tabs */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 mb-16 md:mb-0">
        {activeTab === 'verification' && (
          <VerificationTab verifications={verifications} onApprove={handleApproveArtist} onReject={handleRejectArtist} />
        )}
        {activeTab === 'tickets' && (
          <TicketsTab tickets={tickets} onReply={handleSendReply} />
        )}
        {activeTab === 'auditing' && (
          <AuditingTab auditingRecords={auditingRecords} isSystemAdmin={isSystemAdmin} onSettlePayment={handleSettlePayment} />
        )}
        {activeTab === 'settings' && isSystemAdmin && (
          <SettingsTab />
        )}
      </div>
    </section>
  );
}