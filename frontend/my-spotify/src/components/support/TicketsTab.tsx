'use client';

import React, { useState } from 'react';
import { SupportTicketLocal, TicketStatus } from '@/types';
import { X, Send } from 'lucide-react';

interface TicketsTabProps {
  tickets: SupportTicketLocal[];
  onReply: (ticketId: string, text: string, currentActiveSetter: (t: SupportTicketLocal) => void) => void;
}

export default function TicketsTab({ tickets, onReply }: TicketsTabProps) {
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketLocal | null>(null);
  const [ticketReply, setTicketReply] = useState('');

  if (selectedTicket) {
    return (
      <div className="h-full flex flex-col max-w-4xl mx-auto animate-fade-in border border-neutral-800/60 rounded-3xl overflow-hidden bg-[#0a0a0a]">
        <div className="p-4 md:p-6 border-b border-neutral-800/60 bg-neutral-900/30 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-lg font-bold text-white">{selectedTicket.subject}</h2>
              <StatusBadge status={selectedTicket.status} />
            </div>
            <p className="text-xs text-neutral-400">Ticket {selectedTicket.id} • Opened by @{selectedTicket.username}</p>
          </div>
          <button onClick={() => setSelectedTicket(null)} className="p-2 hover:bg-neutral-800 rounded-full text-neutral-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {selectedTicket.messages.map((msg) => {
            const isSupport = msg.senderRole === 'support';
            return (
              <div key={msg.id} className={`flex flex-col ${isSupport ? 'items-end' : 'items-start'}`}>
                <span className="text-[10px] text-neutral-500 font-medium mb-1 px-1">
                  {msg.senderName} • {msg.timestamp}
                </span>
                <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${
                  isSupport ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-neutral-800 text-neutral-200 rounded-tl-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-neutral-800/60 bg-neutral-950 flex gap-2 shrink-0">
          <input 
            type="text" 
            value={ticketReply}
            onChange={(e) => setTicketReply(e.target.value)}
            placeholder="Type your response to the user..."
            className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-600 transition-colors"
          />
          <button 
            onClick={() => {
              if (!ticketReply.trim()) return;
              onReply(selectedTicket.id, ticketReply, setSelectedTicket);
              setTicketReply('');
            }}
            className="px-4 bg-white text-black rounded-xl hover:bg-neutral-200 transition-colors flex items-center justify-center"
          >
            <Send size={18} />
          </button>
        </div>
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
        <table className="w-full text-left text-sm text-neutral-400">
          <thead className="bg-neutral-900/50 text-xs uppercase font-semibold text-neutral-500 border-b border-neutral-800/50">
            <tr>
              <th className="px-6 py-4">Ticket ID</th>
              <th className="px-6 py-4">Username</th>
              <th className="px-6 py-4 w-1/3">Subject</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/50">
            {tickets.map((ticket) => (
              <tr 
                key={ticket.id} 
                onClick={() => setSelectedTicket(ticket)}
                className="hover:bg-neutral-900/50 transition-colors cursor-pointer"
              >
                <td className="px-6 py-4 font-mono text-xs">{ticket.id}</td>
                <td className="px-6 py-4 font-semibold text-white">@{ticket.username}</td>
                <td className="px-6 py-4 truncate max-w-[200px]">{ticket.subject}</td>
                <td className="px-6 py-4">{ticket.dateSubmitted}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={ticket.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: TicketStatus }) {
  switch (status) {
    case 'Open':
      return <span className="text-[10px] bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 font-bold px-2 py-0.5 rounded uppercase tracking-wider">Open</span>;
    case 'Replied':
      return <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold px-2 py-0.5 rounded uppercase tracking-wider">Replied</span>;
    case 'Closed':
      return <span className="text-[10px] bg-neutral-800 text-neutral-400 border border-neutral-700 font-bold px-2 py-0.5 rounded uppercase tracking-wider">Closed</span>;
    default:
      return null;
  }
}