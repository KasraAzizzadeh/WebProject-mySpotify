'use client';

import React, { useState } from 'react';
import { useAuditRecords } from '@/hooks/queries/support/useAuditRecords';
import { useUpdateAuditRecord } from '@/hooks/queries/support/useUpdateAuditRecord';
import { Lock } from 'lucide-react';
import Message from '@/components/ui/Message';
import Button from '@/components/ui/Button';

interface AuditingTabProps {
  isSystemAdmin: boolean;
}

const LIMIT = 20;

export default function AuditingTab({
  isSystemAdmin,
}: AuditingTabProps) {
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [page] = useState(1);

  const {
    data: auditingRecords = [],
    isLoading,
    error
  } = useAuditRecords(page, LIMIT);

  const updateAudit = useUpdateAuditRecord();
  const mutationError = updateAudit.error as Error | null;

  const handleConfirmSettlement = () => {
    if (!selectedRecordId)
      return;

    updateAudit.mutate({
      id: selectedRecordId
    }, {
      onSuccess: () => {
        setSelectedRecordId(null);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-neutral-400">
        Loading auditing records...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-400">
        Failed to load auditing records.
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in w-full px-4 sm:px-0">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
          Artist Financial Auditing
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Review monthly artist metrics and track performance-calculated rewards.
        </p>
      </div>

      <div className="bg-[#121212] border border-neutral-800/50 rounded-2xl overflow-hidden">
        {updateAudit.isError && (
          <div className="p-4 text-sm text-red-300 bg-red-500/10 border border-red-500/20">
            {mutationError?.message ?? 'Unable to confirm settlement. Please try again.'}
          </div>
        )}
        <table className="w-full text-left text-sm text-neutral-400 table-fixed">
          <thead className="bg-neutral-900/50 text-xs uppercase font-semibold text-neutral-500 border-b border-neutral-800/50">
            <tr>
              <th className="px-4 sm:px-6 py-4 w-[40%] md:w-1/4">
                Artist Name & ID
              </th>
              <th className="px-6 py-4 w-1/6 hidden md:table-cell">
                Unique Listeners
              </th>
              <th className="px-6 py-4 w-1/6 hidden md:table-cell">
                Total Streams
              </th>
              <th className="px-4 sm:px-6 py-4 w-[30%] md:w-1/6">
                Calculated Reward
              </th>
              <th className="px-6 py-4 w-[15%] hidden lg:table-cell">
                Payment Status
              </th>
              <th className="px-4 sm:px-6 py-4 w-[30%] md:w-1/4 text-right">
                Operations
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-neutral-800/50">
            {auditingRecords.map(record => (
              <tr
                key={record.id}
                className="hover:bg-neutral-900/30 transition-colors"
              >
                <td className="px-4 sm:px-6 py-4 min-w-0">
                  <div className="font-bold text-white truncate">
                    {record.artistName}
                  </div>
                  <div className="text-[10px] text-neutral-500 font-mono mt-0.5 truncate">
                    {record.artistId}
                  </div>
                </td>

                <td className="px-6 py-4 hidden md:table-cell truncate">
                  {record.uniqueListeners.toLocaleString()}
                </td>

                <td className="px-6 py-4 hidden md:table-cell truncate">
                  {record.totalStreams.toLocaleString()}
                </td>

                <td className="px-4 sm:px-6 py-4 min-w-0">
                  <div className="font-bold text-green-400 truncate">
                    $
                    {record.calculatedReward.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </div>

                  <div className="lg:hidden mt-1 inline-block">
                    <span
                      className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                        record.paymentStatus === 'Settled'
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-yellow-500/10 text-yellow-500'
                      }`}
                    >
                      {record.paymentStatus === 'Settled' ? 'Paid' : 'Due'}
                    </span>
                  </div>
                </td>

                <td className="px-6 py-4 hidden lg:table-cell truncate">
                  <span
                    className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${
                      record.paymentStatus === 'Settled'
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                    }`}
                  >
                    {record.paymentStatus}
                  </span>
                </td>

                <td className="px-4 sm:px-6 py-4 text-right">
                  {isSystemAdmin ? (
                    <div className="inline-block w-full sm:w-auto">
                      <Button
                        variant="primary"
                        onClick={() => setSelectedRecordId(record.id)}
                        disabled={record.paymentStatus === 'Settled' || updateAudit.isPending}
                        className={`
                          w-full sm:w-auto
                          !text-[10px] sm:!text-xs
                          !px-2 sm:!px-4
                          !py-1.5 sm:!py-2
                          font-semibold shadow-md
                          ${
                            record.paymentStatus === 'Settled'
                              ? '!bg-neutral-800 !text-neutral-600 cursor-not-allowed'
                              : '!bg-green-500 hover:!bg-green-600 !text-black'
                          }
                        `}
                      >
                        {record.paymentStatus === 'Settled'
                          ? 'Settled' :"Confirm"}
                      </Button>
                    </div>
                  ) : (
                    <div className="text-[11px] sm:text-xs text-neutral-600 italic flex items-center justify-end gap-1 sm:gap-1.5 font-medium">
                      <Lock size={11} className="shrink-0" />
                      <span className="truncate">Admin Only</span>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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