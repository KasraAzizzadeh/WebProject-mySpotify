'use client';

import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

interface PlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: 'basic' | 'silver' | 'gold';
  onSelectPlan: (plan: 'basic' | 'silver' | 'gold') => void;
}

export default function PlansModal({ isOpen, onClose, currentPlan, onSelectPlan }: PlansModalProps) {
  const [selected, setSelected] = useState<'basic' | 'silver' | 'gold'>(currentPlan);

  if (!isOpen) return null;

  const tiers = [
    {
      id: 'basic' as const,
      name: 'Basic',
      price: '$0',
      period: 'forever',
      features: [
        { text: 'Daily stream limit: 60', included: true },
        { text: 'Playlist limit: 6', included: true },
        { text: 'Add profile picture', included: false },
        { text: 'Download songs', included: false },
        { text: 'Early access to new songs', included: false },
        { text: 'View song stats & analytics', included: false },
      ]
    },
    {
      id: 'silver' as const,
      name: 'Silver',
      price: '$4.99',
      period: 'mo',
      features: [
        { text: 'Unlimited daily streaming', included: true },
        { text: 'Playlist limit: 100', included: true },
        { text: 'Add profile picture', included: true },
        { text: 'Download songs', included: true },
        { text: 'Early access to new songs', included: false },
        { text: 'View song stats & analytics', included: false },
      ],
      selectedBg: 'bg-neutral-950 border-neutral-400',
    },
    {
      id: 'gold' as const,
      name: 'Gold',
      price: '$9.99',
      period: 'mo',
      features: [
        { text: 'Unlimited daily streaming', included: true },
        { text: 'Unlimited playlist layout', included: true },
        { text: 'Add profile picture', included: true },
        { text: 'Download songs', included: true },
        { text: 'Early access to new songs', included: true },
        { text: 'View song stats & analytics', included: true },
      ],
      selectedBg: 'bg-amber-950/10 border-amber-500/60',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="bg-[#0a0a0a] border border-neutral-800/80 w-full max-w-4xl rounded-3xl p-6 md:p-8 relative shadow-2xl z-10 space-y-6 max-h-[90vh] overflow-y-auto">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-neutral-500 hover:text-white hover:bg-neutral-900 border border-transparent hover:border-neutral-800 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center space-y-1">
          <h2 className="text-xl font-black tracking-tight text-white">Upgrade Plan</h2>
          <p className="text-xs text-neutral-400">Select the membership tier that fits your creative needs.</p>
        </div>

        {/* Plan Cards Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tiers.map((tier) => {
            const isCurrent = currentPlan === tier.id;
            const isSelected = selected === tier.id;

            return (
              <div
                key={tier.id}
                onClick={() => setSelected(tier.id)}
                className={`relative flex flex-col justify-between p-5 rounded-2xl border text-left cursor-pointer select-none transition-all duration-200 ${
                  isSelected 
                    ? tier.selectedBg || 'bg-neutral-950 border-neutral-600' 
                    : 'bg-[#121212]/40 hover:bg-[#121212] border-neutral-900'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-sm font-bold tracking-wide ${tier.id === 'gold' ? 'text-amber-400' : 'text-white'}`}>
                      {tier.name}
                    </h3>
                    {isCurrent && (
                      <span className="text-[9px] bg-neutral-800 text-neutral-400 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
                        Current
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-1 py-1 border-b border-neutral-900">
                    <span className="text-2xl font-black text-white">{tier.price}</span>
                    <span className="text-[10px] text-neutral-500 font-medium">/{tier.period}</span>
                  </div>

                  {/* Feature List Layout */}
                  <ul className="space-y-2">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="text-[11px] leading-relaxed flex items-start gap-2">
                        {feature.included ? (
                          <Check className={`w-3 h-3 shrink-0 mt-0.5 ${tier.id === 'gold' ? 'text-amber-400' : 'text-neutral-400'}`} />
                        ) : (
                          <span className="w-3 h-3 shrink-0 mt-0.5 text-neutral-600 text-center font-bold text-xs leading-none">×</span>
                        )}
                        <span className={feature.included ? 'text-neutral-300' : 'text-neutral-500 font-normal'}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Status Selected Bubble */}
                {isSelected && (
                  <div className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center border text-black p-0.5 shadow-md ${
                    tier.id === 'gold' ? 'bg-amber-400 border-amber-300' : 'bg-white border-white'
                  }`}>
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer actions wrapper */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-neutral-900">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-neutral-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onSelectPlan(selected);
              onClose();
            }}
            className="bg-white hover:bg-neutral-200 text-black px-5 py-2.5 text-xs font-bold rounded-xl transition-colors shadow-lg"
          >
            Update Tier
          </button>
        </div>

      </div>
    </div>
  );
}