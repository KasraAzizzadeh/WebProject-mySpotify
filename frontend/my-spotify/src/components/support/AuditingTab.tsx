'use client';

import React, { useState } from 'react';
import { AuditingRecord } from '@/types';
import { Lock } from 'lucide-react';
import Message from '@/components/ui/Message';

interface AuditingTabProps {
  auditingRecords: AuditingRecord[];
  isSystemAdmin: boolean;
  onSettlePayment: (id: string) => void;
}

export default function AuditingTab({ auditingRecords, isSystemAdmin, onSettlePayment }: AuditingTabProps) {
  // Holds the ID of the record that the admin wants to settle
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

  // Triggered from inside the Message component modal overlay
  const handleConfirmSettlement = () => {
    if (selectedRecordId) {
      onSettlePayment(selectedRecordId);
      setSelectedRecordId(null); // Close the modal
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Artist Financial Auditing</h1>
        <p className="text-sm text-neutral-500 mt-1">Review monthly artist metrics and track performance-calculated rewards.</p>
      </div>

      <div className="bg-[#121212] border border-neutral-800/50 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm text-neutral-400">
          <thead className="bg-neutral-900/50 text-xs uppercase font-semibold text-neutral-500 border-b border-neutral-800/50">
            <tr>
              <th className="px-6 py-4">Artist Name & ID</th>
              <th className="px-6 py-4">Unique Listeners</th>
              <th className="px-6 py-4">Total Streams</th>
              <th className="px-6 py-4">Calculated Reward</th>
              <th className="px-6 py-4">Payment Status</th>
              <th className="px-6 py-4 text-right">Operations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/50">
            {auditingRecords.map((record) => (
              <tr key={record.id} className="hover:bg-neutral-900/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-white">{record.artistName}</div>
                  <div className="text-[10px] text-neutral-500 font-mono mt-0.5">{record.artistId}</div>
                </td>
                <td className="px-6 py-4">{record.uniqueListeners.toLocaleString()}</td>
                <td className="px-6 py-4">{record.totalStreams.toLocaleString()}</td>
                <td className="px-6 py-4 font-bold text-green-400">
                  ${record.calculatedReward.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${
                    record.paymentStatus === 'Settled' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                  }`}>
                    {record.paymentStatus}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {isSystemAdmin ? (
                    <button 
                      disabled={record.paymentStatus === 'Settled'}
                      onClick={() => setSelectedRecordId(record.id)}
                      className={`text-xs px-4 py-2 rounded-lg font-semibold transition-all ${
                        record.paymentStatus === 'Settled' 
                          ? 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
                          : 'bg-white text-black hover:bg-neutral-200 shadow-md'
                      }`}
                    >
                      {record.paymentStatus === 'Settled' ? 'Settled' : 'Confirm Settlement'}
                    </button>
                  ) : (
                    <div className="text-xs text-neutral-600 italic flex items-center justify-end gap-1.5 font-medium">
                      <Lock size={12} /> Admin Only
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CONFIRMATION POPUP MODAL */}
      <div className="[&_h2]:text-lg [&_p]:text-sm">
        <Message
          isOpen={selectedRecordId !== null}
          title="Confirm Payment Settlement"
          description="Are you sure you want to confirm the settlement?"
          confirmLabel="Confirm"
          cancelLabel="Cancel"
          type="confirm"
          onConfirm={handleConfirmSettlement}
          onCancel={() => setSelectedRecordId(null)}
        />
      </div>
    </div>
  );
}