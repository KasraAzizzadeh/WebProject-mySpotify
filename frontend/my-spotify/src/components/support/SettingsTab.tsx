'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Layers, HelpCircle, TrendingUp, Users, ArrowUpRight } from 'lucide-react';

export default function SettingsTab() {
  const [isEditingPrices, setIsEditingPrices] = useState(false);
  const [silverPrice, setSilverPrice] = useState('29.99');
  const [goldPrice, setGoldPrice] = useState('79.99');

  const monthlyGrossRevenue = 148520.00;
  const activePremiumUsers = 12450;

  const userDistribution = [
    { tier: 'Free Tier', count: 45200, percentage: 72, color: 'bg-neutral-700' },
    { tier: 'Silver Premium', count: 8900, percentage: 14, color: 'bg-neutral-400' },
    { tier: 'Gold Premium', count: 3550, percentage: 14, color: 'bg-yellow-500' },
  ];

  return (
    <div className="w-full space-y-6 animate-fade-in max-w-7xl mx-auto pb-12 px-4 sm:px-6">
      
      {/* HEADER */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
          System Settings & Analytics
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Monitor global workspace scale distributions and adjust active subscription tier modeling parameters.
        </p>
      </div>

      {/* TWO COLUMN GRID LAYOUT (FIXES MOBILE SCROLL & DESKTOP ALIGNMENT) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 xl:gap-8 items-start">

        {/* LEFT COLUMN (Spans 2 columns on desktop) */}
        <div className="xl:col-span-2 space-y-6 flex flex-col h-full">

          {/* TOP CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
            
            <div className="bg-[#121212] border border-neutral-800/50 rounded-2xl p-6 shadow-xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 sm:gap-5">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0">
                  <TrendingUp className="text-green-500" size={22} />
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                    Monthly Gross Revenue
                  </p>
                  <p className="text-xl sm:text-2xl font-black text-white mt-1">
                    ${monthlyGrossRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-full text-green-400 text-xs font-bold shrink-0">
                <ArrowUpRight size={14} className="stroke-[3]" />
                <span>+12.4%</span>
              </div>
            </div>

            <div className="bg-[#121212] border border-neutral-800/50 rounded-2xl p-6 shadow-xl flex items-center gap-4 sm:gap-5">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
                <Users className="text-sky-400" size={22} />
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  Active Premium Users
                </p>
                <p className="text-xl sm:text-2xl font-black text-white mt-1">
                  {activePremiumUsers.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* USER DISTRIBUTION */}
          <div className="bg-[#121212] border border-neutral-800/50 rounded-2xl p-6 sm:p-8 shadow-xl flex-1 flex flex-col justify-between">
            <h3 className="text-base font-bold text-white tracking-tight border-b border-neutral-800 pb-4 mb-6">
              User Base Distribution
            </h3>

            <div className="flex flex-col lg:flex-row items-center justify-around gap-8 py-4 flex-1">
              
              <div
                className="relative w-40 h-40 sm:w-44 sm:h-44 rounded-full flex items-center justify-center shrink-0 shadow-2xl bg-neutral-900 border border-neutral-800"
                style={{
                  background: `conic-gradient(
                    #eab308 0% 14%, 
                    #a3a3a3 14% 28%, 
                    #404040 28% 100%
                  )`
                }}
              >
                <div className="absolute inset-5 bg-[#121212] rounded-full flex flex-col items-center justify-center shadow-inner border border-neutral-800/40">
                  <span className="text-xl font-black text-white">61.2K</span>
                  <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest mt-0.5 text-center px-2">
                    Total Users
                  </span>
                </div>
              </div>

              <div className="flex-1 max-w-md w-full space-y-3 sm:space-y-4">
                {userDistribution.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-xl bg-neutral-950/40 border border-neutral-900"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-3 h-3 rounded-full shrink-0 ${item.color}`} />
                      <span className="text-xs sm:text-sm font-semibold text-neutral-200">
                        {item.tier}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs sm:text-sm font-bold text-white font-mono">
                        {item.percentage}%
                      </span>
                      <p className="text-[10px] text-neutral-500 mt-0.5">
                        {item.count.toLocaleString()} accounts
                      </p>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>

        {/* RIGHT COLUMN (MATCHES GRID COLUMN TRACKING BOUNDS PERFECTLY) */}
        <div className="bg-[#121212] border border-neutral-800/50 rounded-2xl p-6 shadow-xl flex flex-col justify-between xl:h-full">
          
          {/* TOP CONTENT */}
          <div className="space-y-6">
            <div className="border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-2.5">
                <Layers size={18} className="text-neutral-400 shrink-0" />
                <h3 className="text-base font-bold text-white tracking-tight">
                  Platform Core Pricing Tiers
                </h3>
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                Configure baseline subscription values used to calculate royalty distribution metrics.
              </p>
            </div>

            <div className="space-y-5">
              <Input
                label="Silver Tier Pricing ($ / Month)"
                type="text"
                value={silverPrice}
                onChange={(e) => setSilverPrice(e.target.value)}
                disabled={!isEditingPrices}
                className={!isEditingPrices ? 'opacity-60 text-neutral-400 cursor-not-allowed' : ''}
              />

              <Input
                label="Gold Premium Tier Pricing ($ / Month)"
                type="text"
                value={goldPrice}
                onChange={(e) => setGoldPrice(e.target.value)}
                disabled={!isEditingPrices}
                className={!isEditingPrices ? 'opacity-60 text-neutral-400 cursor-not-allowed' : ''}
              />
            </div>

            <div className="pt-2">
              {isEditingPrices ? (
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => setIsEditingPrices(false)}
                    className="py-2.5 text-xs font-bold w-full"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => setIsEditingPrices(false)}
                    className="py-2.5 text-xs font-bold w-full"
                  >
                    Save Prices
                  </Button>
                </div>
              ) : (
                <Button
                  variant="primary"
                  onClick={() => setIsEditingPrices(true)}
                  className="py-2.5 text-xs font-bold w-full"
                >
                  Edit Prices
                </Button>
              )}
            </div>
          </div>

          {/* FOOTER (NATURALLY FLUID AND SCROLL-SAFE) */}
          <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-900 flex gap-3 mt-8 xl:mt-auto">
            <HelpCircle size={16} className="text-neutral-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-neutral-500 leading-relaxed">
              Subscription billing adjustments update processing jobs across calculations immediately. Prior invoices remain compiled immutably inside ledger records.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}