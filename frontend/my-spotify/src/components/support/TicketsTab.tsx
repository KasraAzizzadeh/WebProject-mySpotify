'use client';

import React, { useState } from 'react';
import { SupportTicketLocal, TicketStatus } from '@/types';
import { X, CheckCircle, MessageSquarePlus } from 'lucide-react';

interface TicketsTabProps {
  tickets: SupportTicketLocal[];
  onReply: (ticketId: string, text: string, currentActiveSetter: (t: SupportTicketLocal) => void) => void;
}

export default function TicketsTab({ tickets, onReply }: TicketsTabProps) {
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketLocal | null>(null);
  const [ticketReply, setTicketReply] = useState('');

  if (selectedTicket) {
    // Find the original user inquiry message (usually the first one)
    const originalInquiry = selectedTicket.messages.find(m => m.senderRole === 'user') || selectedTicket.messages[0];
    
    // Find the support team answer if it exists
    const officialAnswer = selectedTicket.messages.find(m => m.senderRole === 'support');
    
    const isAnswered = selectedTicket.status === 'Replied' || selectedTicket.status === 'Closed' || !!officialAnswer;

    return (
      <div className="h-full flex flex-col max-w-3xl mx-auto animate-fade-in space-y-6 bg-black">
        {/* Top Header Row Controls */}
        <div className="flex items-center justify-between bg-[#0a0a0a] border border-neutral-800/60 p-5 rounded-2xl shrink-0">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-base font-bold text-white tracking-tight">{selectedTicket.subject}</h2>
              <StatusBadge status={selectedTicket.status} />
            </div>
            <p className="text-xs text-neutral-500 font-medium">
              Ticket {selectedTicket.id} • Opened by <span className="text-neutral-400">@{selectedTicket.username}</span>
            </p>
          </div>
          <button 
            onClick={() => { setSelectedTicket(null); setTicketReply(''); }} 
            className="p-2 hover:bg-neutral-900 rounded-xl text-neutral-400 hover:text-white transition-all border border-transparent hover:border-neutral-800/60"
          >
            <X size={18} />
          </button>
        </div>

        {/* RECTANGLE 1: The Opened Ticket Inquiry Statement Block */}
        <div className="bg-[#121212] border border-neutral-800/60 rounded-2xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-neutral-900 pb-3 mb-4">
            <span className="text-xs font-bold text-neutral-400 font-mono">
              [ INQUIRY REPORT ]
            </span>
            <span className="text-[10px] text-neutral-500 font-mono">
              {originalInquiry?.timestamp || selectedTicket.dateSubmitted}
            </span>
          </div>
          <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap">
            {originalInquiry?.content || "No message body provided."}
          </p>
        </div>

        {/* RECTANGLE 2: Conditional Resolution Workspace Layer */}
        {isAnswered ? (
          /* STATIC RECTANGLE FOR COMPLETED ANSWER (No input allowed) */
          <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 relative">
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-400 font-mono border-b border-neutral-900 pb-3 mb-4">
              <CheckCircle size={14} className="text-neutral-500" />
              <span>[ RESOLUTION SUBMITTED BY {officialAnswer?.senderName.toUpperCase() || 'SUPPORT TEAM'} ]</span>
              <span className="ml-auto text-[10px] font-normal text-neutral-500 font-mono">{officialAnswer?.timestamp}</span>
            </div>
            <p className="text-sm text-neutral-400 leading-relaxed whitespace-pre-wrap italic">
              "{officialAnswer?.content || "This ticket has been locked and marked resolved."}"
            </p>
          </div>
        ) : (
          /* INTERACTIVE RECTANGLE WORKSPACE FOR ANSWERING */
          <div className="bg-[#121212] border border-neutral-800/60 rounded-2xl p-6 flex flex-col space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-400 font-mono border-b border-neutral-900 pb-3">
              <MessageSquarePlus size={14} className="text-neutral-500" />
              <span>[ PENDING RESOLUTION WORKSPACE ]</span>
            </div>
            
            <textarea
              value={ticketReply}
              onChange={(e) => setTicketReply(e.target.value)}
              placeholder="Type your formal solution/response to the user here..."
              className="w-full min-h-[140px] bg-neutral-950 border border-neutral-800/60 rounded-xl p-4 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-700 transition-colors resize-none leading-relaxed"
            />
            
            <div className="flex justify-end">
              <button
                onClick={() => {
                  if (!ticketReply.trim()) return;
                  onReply(selectedTicket.id, ticketReply, setSelectedTicket);
                }}
                disabled={!ticketReply.trim()}
                className="px-5 py-2.5 bg-white text-black font-bold text-xs rounded-xl hover:bg-neutral-200 disabled:bg-neutral-800 disabled:text-neutral-500 transition-all shadow-md"
              >
                Submit Resolution
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Support Tickets</h1>
        <p className="text-sm text-neutral-500 mt-1">Manage user inquiries and platform issues.</p>
      </div>

      <div className="bg-[#121212] border border-neutral-800/50 rounded-2xl overflow-hidden">
        {tickets.length === 0 ? (
          <p className="p-8 text-sm text-neutral-500 text-center">No customer support tickets found.</p>
        ) : (
          <table className="w-full text-left text-sm text-neutral-400">
            <thead className="bg-neutral-900/50 text-xs uppercase font-semibold text-neutral-500 border-b border-neutral-800/50">
              <tr>
                <th className="px-6 py-4">Ticket ID</th>
                <th className="px-6 py-4">Username</th>
                <th className="px-6 py-4 w-1/3">Subject</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/50">
              {tickets.map((ticket) => (
                <tr 
                  key={ticket.id} 
                  onClick={() => setSelectedTicket(ticket)}
                  className="hover:bg-neutral-900/50 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4 font-mono text-xs text-neutral-500 group-hover:text-neutral-300 transition-colors">{ticket.id}</td>
                  <td className="px-6 py-4 font-semibold text-white">@{ticket.username}</td>
                  <td className="px-6 py-4 truncate max-w-[200px] text-neutral-300">{ticket.subject}</td>
                  <td className="px-6 py-4 text-neutral-500">{ticket.dateSubmitted}</td>
                  <td className="px-6 py-4 text-right">
                    <StatusBadge status={ticket.status} />
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

function StatusBadge({ status }: { status: TicketStatus }) {
  switch (status) {
    case 'Open':
      return <span className="text-[9px] bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider">Open</span>;
    case 'Replied':
      return <span className="text-[9px] bg-neutral-800 text-neutral-400 border border-neutral-700/50 font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider">Answered</span>;
    case 'Closed':
      return <span className="text-[9px] bg-neutral-900 text-neutral-600 border border-transparent font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider">Closed</span>;
    default:
      return null;
  }
}