'use client';

import React, { useState } from 'react';
import { CircleDollarSign, TrendingUp, Users, PieChart as ChartIcon, Sliders, DollarSign } from 'lucide-react';

export default function SettingsTab() {
  const [silverPrice, setSilverPrice] = useState<number>(4.99);
  const [goldPrice, setGoldPrice] = useState<number>(9.99);
  const [isUpdatingPrices, setIsUpdatingPrices] = useState(false);

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Subscription Management & Revenue</h1>
        <p className="text-sm text-neutral-500 mt-1">Monitor platform revenue metrics and configure global pricing tiers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="bg-[#121212] border border-neutral-800/50 p-6 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider">Monthly Gross Revenue</p>
              <h3 className="text-2xl font-black text-white mt-1">$14,845.50</h3>
              <p className="text-[10px] text-green-400 flex items-center gap-1 mt-1">
                <TrendingUp size={12} /> +12.4% from last month
              </p>
            </div>
            <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 text-neutral-400">
              <CircleDollarSign size={20} />
            </div>
          </div>

          <div className="bg-[#121212] border border-neutral-800/50 p-6 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider">Active Premium Tiers</p>
              <h3 className="text-2xl font-black text-white mt-1">1,240 users</h3>
              <p className="text-[10px] text-neutral-400 mt-1">Silver and Gold distributions</p>
            </div>
            <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 text-neutral-400">
              <Users size={20} />
            </div>
          </div>
        </div>

        <div className="bg-[#121212] border border-neutral-800/50 p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <ChartIcon size={14} className="text-neutral-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">User Distribution</h4>
          </div>
          
          <div className="flex items-center justify-center py-4">
            <div className="relative w-28 h-28 rounded-full border-8 border-neutral-800 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-8 border-t-blue-500 border-r-amber-400 border-b-neutral-700 animate-spin-slow pointer-events-none" />
              <span className="text-[10px] font-mono text-neutral-400">3 Tiers</span>
            </div>
          </div>

          <div className="flex justify-between items-center text-[10px] font-mono pt-2 border-t border-neutral-900">
            <div className="flex items-center"><span className="inline-block w-2 h-2 rounded-full bg-neutral-600 mr-1" />Basic (65%)</div>
            <div className="flex items-center"><span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-1" />Silver (25%)</div>
            <div className="flex items-center"><span className="inline-block w-2 h-2 rounded-full bg-amber-400 mr-1" />Gold (10%)</div>
          </div>
        </div>

        <div className="bg-[#121212] border border-neutral-800/50 p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.01] rounded-bl-full pointer-events-none" />
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sliders size={14} className="text-neutral-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Price Settings</h4>
              </div>
              <span className="text-[9px] font-mono bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded-md border border-neutral-700/50">Live Matrix</span>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide">Silver Tier</label>
                  <span className="text-[10px] text-neutral-600 font-mono">Current: $4.99</span>
                </div>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-neutral-500">
                    <DollarSign size={14} />
                  </div>
                  <input 
                    type="number" 
                    step="0.01"
                    value={silverPrice}
                    onChange={(e) => setSilverPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-neutral-950 border border-neutral-800/80 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white font-mono font-bold focus:outline-none focus:border-neutral-700"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-amber-400/90 uppercase tracking-wide">Gold Tier</label>
                  <span className="text-[10px] text-neutral-600 font-mono">Current: $9.99</span>
                </div>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-amber-500/50">
                    <DollarSign size={14} />
                  </div>
                  <input 
                    type="number" 
                    step="0.01"
                    value={goldPrice}
                    onChange={(e) => setGoldPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-neutral-950 border border-neutral-800/80 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white font-mono font-bold focus:outline-none focus:border-neutral-700"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setIsUpdatingPrices(true);
              setTimeout(() => { setIsUpdatingPrices(false); }, 600);
            }}
            disabled={isUpdatingPrices}
            className="w-full mt-5 bg-white text-black font-bold text-xs py-3 rounded-xl hover:bg-neutral-200 disabled:bg-neutral-700 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            {isUpdatingPrices ? 'Syncing system ecosystem...' : 'Update Prices'}
          </button>
        </div>
      </div>
    </div>
  );
}