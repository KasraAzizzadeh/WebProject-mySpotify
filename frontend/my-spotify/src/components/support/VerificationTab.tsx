'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ArtistApplicationTicket, SongItem } from '@/types';
import { UserX, CheckCircle2, Play, Pause, Music } from 'lucide-react';
import Button from '@/components/ui/Button';
import Message from '@/components/ui/Message';

interface VerificationTabProps {
  verifications: ArtistApplicationTicket[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export default function VerificationTab({ verifications, onApprove, onReject }: VerificationTabProps) {
  const [selectedVerification, setSelectedVerification] = useState<ArtistApplicationTicket | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);

  // Audio Playback Tracking States
  const [playingSampleIdx, setPlayingSampleIdx] = useState<number | null>(null);
  const [audioDurations, setAudioDurations] = useState<{ [key: number]: number }>({});
  const [currentTime, setCurrentTime] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Clean up audio context instantly if navigating away
  const resetSelection = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlayingSampleIdx(null);
    setAudioDurations({});
    setCurrentTime(0);
    setSelectedVerification(null);
    setIsRejecting(false);
    setRejectReason('');
    setIsApproveModalOpen(false);
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Sync progress bar timeline updates
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || playingSampleIdx === null) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [playingSampleIdx]);

  // Helper utility function converting seconds to MM:SS string
  const formatDuration = (sec: number) => {
    if (!sec || isNaN(sec)) return '0:00';
    const minutes = Math.floor(sec / 60);
    const seconds = Math.floor(sec % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Intercept and toggle audio playback streams row-by-row
  const togglePlaySample = (sampleUrl: string, idx: number) => {
    if (playingSampleIdx === idx) {
      audioRef.current?.pause();
      setPlayingSampleIdx(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(sampleUrl);
      audioRef.current = audio;
      setPlayingSampleIdx(idx);
      setCurrentTime(0);

      audio.addEventListener('loadedmetadata', () => {
        setAudioDurations(prev => ({ ...prev, [idx]: audio.duration }));
      });

      audio.addEventListener('ended', () => {
        setPlayingSampleIdx(null);
        setCurrentTime(0);
      });

      audio.play().catch(err => {
        console.error("Audio playback failed:", err);
        setPlayingSampleIdx(null);
      });
    }
  };

  // Clickable/draggable progress bar scrubbing event
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
    }
  };

  const handleExecuteApproval = () => {
    if (selectedVerification) {
      onApprove(selectedVerification.id);
      resetSelection();
    }
  };

  if (selectedVerification) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <button onClick={resetSelection} className="text-xs text-neutral-500 hover:text-white flex items-center gap-2 mb-4 transition-colors">
          ← Back to List
        </button>
        
        <div className="bg-[#121212] border border-neutral-800/50 rounded-3xl p-8 space-y-8">
          <div>
            <h2 className="text-2xl font-black text-white">{selectedVerification.artisticName}</h2>
            <p className="text-sm text-neutral-400 mt-1">{selectedVerification.email}</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">Provided Sample Portfolio tracks</h3>
            <div className="flex flex-col gap-3">
              {selectedVerification.samples.map((sampleUrl, idx) => {
                
                const mockSongItem: SongItem = {
                  id: `sample-${idx}`,
                  title: `Portfolio Sample Track #${idx + 1}`,
                  artistName: selectedVerification.artisticName,
                  artistId: selectedVerification.userId,
                  streams: 0,
                  releaseDate: new Date().toISOString(),
                  audioUrl: sampleUrl,
                };

                const isCurrentPlaying = playingSampleIdx === idx;
                const trackDuration = audioDurations[idx] || 0;

                return (
                  <div 
                    key={mockSongItem.id} 
                    className="flex flex-col bg-neutral-950/60 p-4 rounded-xl border border-neutral-900 hover:border-neutral-800 transition-all group gap-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Playback Control Button */}
                        <button
                          type="button"
                          onClick={() => togglePlaySample(mockSongItem.audioUrl || '', idx)}
                          className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shrink-0 shadow-md"
                        >
                          {isCurrentPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
                        </button>

                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate group-hover:text-emerald-400 transition-colors">
                            {mockSongItem.title}
                          </p>
                          <p className="text-xs text-neutral-500 truncate mt-0.5">
                            {mockSongItem.artistName}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-neutral-500 font-medium text-xs">
                        <div className="hidden sm:flex items-center gap-1 text-[10px] uppercase bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded text-neutral-400 tracking-wider">
                          <Music size={10} /> Audio Sample
                        </div>
                      </div>
                    </div>

                    {/* Interactive Progress Bar */}
                    <div className="flex items-center gap-3 w-full px-1">
                      <span className="text-[10px] font-mono text-neutral-500 min-w-[30px]">
                        {isCurrentPlaying ? formatDuration(currentTime) : '0:00'}
                      </span>
                      
                      <input
                        type="range"
                        min="0"
                        max={trackDuration || 100}
                        value={isCurrentPlaying ? currentTime : 0}
                        onChange={handleProgressChange}
                        disabled={!isCurrentPlaying}
                        className={`w-full h-1 accent-white rounded-lg cursor-pointer bg-neutral-800 transition-all ${
                          isCurrentPlaying ? 'opacity-100' : 'opacity-40 cursor-not-allowed'
                        }`}
                      />

                      <span className="text-[10px] font-mono text-neutral-500 min-w-[30px] text-right">
                        {trackDuration ? formatDuration(trackDuration) : '--:--'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-6 border-t border-neutral-800/50">
            {!isRejecting ? (
              <div className="flex gap-4">
                <button 
                  onClick={() => setIsRejecting(true)}
                  className="flex-1 py-3 text-sm font-bold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <UserX size={16} /> Reject Application
                </button>
                <div className="flex-1">
                  <Button 
                    variant="primary"
                    onClick={() => setIsApproveModalOpen(true)}
                    className="w-full !py-3 text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    <CheckCircle2 size={16} /> Approve Artist
                  </Button>
                </div>
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
                  <button onClick={() => setIsRejecting(false)} className="px-4 py-2 text-xs font-bold text-neutral-400 hover:text-white transition-colors">Cancel</button>
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

        {/* CONFIRMATION POPUP MODAL */}
        <div className="[&_h2]:text-lg [&_p]:text-sm">
          <Message
            isOpen={isApproveModalOpen}
            title="Confirm Artist Verification"
            description="Are you sure you want to approve this artist application?"
            confirmLabel="Confirm"
            cancelLabel="Cancel"
            type="confirm"
            onConfirm={handleExecuteApproval}
            onCancel={() => setIsApproveModalOpen(false)}
          />
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
                    <div className="inline-block">
                      <Button 
                        variant="primary"
                        onClick={() => setSelectedVerification(req)}
                        className="!text-xs !px-4 !py-2 font-semibold shadow-sm"
                      >
                        View Portfolio
                      </Button>
                    </div>
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