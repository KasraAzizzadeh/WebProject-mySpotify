'use client';

import React, { useState } from 'react';
import { ArtistApplicationTicket } from '@/types';
import { UserX, CheckCircle2 } from 'lucide-react';

interface VerificationTabProps {
  verifications: ArtistApplicationTicket[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export default function VerificationTab({ verifications, onApprove, onReject }: VerificationTabProps) {
  const [selectedVerification, setSelectedVerification] = useState<ArtistApplicationTicket | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  const resetSelection = () => {
    setSelectedVerification(null);
    setIsRejecting(false);
    setRejectReason('');
  };

  if (selectedVerification) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <button onClick={resetSelection} className="text-xs text-neutral-500 hover:text-white flex items-center gap-2 mb-4">
          ← Back to List
        </button>
        
        <div className="bg-[#121212] border border-neutral-800/50 rounded-3xl p-8 space-y-8">
          <div>
            <h2 className="text-2xl font-black text-white">{selectedVerification.artisticName}</h2>
            <p className="text-sm text-neutral-400">{selectedVerification.email}</p>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">Provided Samples</h3>
            <div className="flex flex-col gap-2">
              {selectedVerification.samples.map((sample, idx) => (
                <a key={idx} href={sample} target="_blank" rel="noreferrer" className="text-sm text-blue-400 hover:underline bg-blue-500/10 p-3 rounded-xl border border-blue-500/20">
                  {sample}
                </a>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-neutral-800/50">
            {!isRejecting ? (
              <div className="flex gap-4">
                <button 
                  onClick={() => setIsRejecting(true)}
                  className="flex-1 py-3 text-sm font-bold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <UserX size={16} /> Reject Application
                </button>
                <button 
                  onClick={() => { onApprove(selectedVerification.id); resetSelection(); }}
                  className="flex-1 py-3 text-sm font-bold text-black bg-white hover:bg-neutral-200 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg"
                >
                  <CheckCircle2 size={16} /> Approve Artist
                </button>
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Reason for Rejection</label>
                <textarea 
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Explain why this portfolio is being rejected..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-red-500 resize-none h-24"
                />
                <div className="flex gap-3">
                  <button onClick={() => setIsRejecting(false)} className="px-4 py-2 text-xs font-bold text-neutral-400 hover:text-white">Cancel</button>
                  <button 
                    onClick={() => { onReject(selectedVerification.id); resetSelection(); }} 
                    className="px-6 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Artist Verification Requests</h1>
        <p className="text-sm text-neutral-500 mt-1">Review and approve pending portfolio applications.</p>
      </div>

      <div className="bg-[#121212] border border-neutral-800/50 rounded-2xl overflow-hidden">
        {verifications.length === 0 ? (
          <p className="p-8 text-sm text-neutral-500 text-center">No pending verification portfolios found.</p>
        ) : (
          <table className="w-full text-left text-sm text-neutral-400">
            <thead className="bg-neutral-900/50 text-xs uppercase font-semibold text-neutral-500 border-b border-neutral-800/50">
              <tr>
                <th className="px-6 py-4">Stage Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Date Submitted</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/50">
              {verifications.map((req) => (
                <tr key={req.id} className="hover:bg-neutral-900/30 transition-colors">
                  <td className="px-6 py-4 font-bold text-white">{req.artisticName}</td>
                  <td className="px-6 py-4">{req.email}</td>
                  <td className="px-6 py-4">{req.submittedAt.toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedVerification(req)}
                      className="text-xs bg-white text-black px-4 py-2 rounded-lg font-semibold hover:bg-neutral-200 transition-colors"
                    >
                      View Portfolio
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}