'use client';

import React, { useState, useRef, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useUserDistribution } from '@/hooks/queries/support/useUserDistribution';
import { useSubscriptionSettings } from '@/hooks/queries/support/useSubscriptionSetting';
import { useUpdateSubscriptions } from '@/hooks/queries/support/useUpdateSubscriptions';
import { Layers, HelpCircle, TrendingUp, Users } from 'lucide-react';

export default function SettingsTab() {
  const [isEditingPrices, setIsEditingPrices] = useState(false);
  const [silverPrice, setSilverPrice] = useState('');
  const [goldPrice, setGoldPrice] = useState('');

  const {
    data: analytics,
    isLoading,
    error,
  } = useUserDistribution();

  const {
    data: subscriptions = [],
    isLoading: subsIsLoading,
    error: subsError
  } = useSubscriptionSettings();

  const updateSubscriptions = useUpdateSubscriptions();

  useEffect(() => {
    if (!subscriptions.length) return;

    setSilverPrice(
      subscriptions.find(s => s.id === "silver")?.price.replace("$", "") ?? ""
    );

    setGoldPrice(
      subscriptions.find(s => s.id === "gold")?.price.replace("$", "") ?? ""
    );
  }, [subscriptions]);

  // Programmatic detection of text line wrapping for the revenue value
  const revenueTextRef = useRef<HTMLParagraphElement>(null);
  const [revenueWrapped, setRevenueWrapped] = useState(false);

  useEffect(() => {
    const el = revenueTextRef.current;
    if (!el) return;

    const checkWrapping = () => {
      if (el.offsetHeight > 36) {
        setRevenueWrapped(true);
      } else {
        setRevenueWrapped(false);
      }
    };

    checkWrapping();

    const observer = new ResizeObserver(() => {
      checkWrapping();
    });
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  const handleSave = () => {
    updateSubscriptions.mutate(
      [
        {
          id: "silver",
          price: `$${silverPrice}`,
        },
        {
          id: "gold",
          price: `$${goldPrice}`,
        },
      ],
      {
        onSuccess: () => {
          setIsEditingPrices(false);
        },
      }
    );
  }

  // Helper method to parse out dynamic gradient positions from backend distribution stats
  const getDynamicConicGradient = () => {
    if (!analytics?.distribution) return '';

    // Safeguard lookup to find user percentages dynamically by names matching original items
    const goldPct = analytics.distribution.find(d => d.tier.toLowerCase().includes('gold'))?.percentage ?? 14;
    const silverPct = analytics.distribution.find(d => d.tier.toLowerCase().includes('silver'))?.percentage ?? 14;

    // Calculate sequential gradient cutoff checkpoints based on actual values
    const goldStop = goldPct;
    const silverStop = goldStop + silverPct;

    return `conic-gradient(
      #eab308 0% ${goldStop}%, 
      #a3a3a3 ${goldStop}% ${silverStop}%, 
      #404040 ${silverStop}% 100%
    )`;
  };

  if (isLoading || subsIsLoading) {
    return (
      <div className="p-8 text-center text-neutral-400">
        Loading Analytics...
      </div>
    );
  }

  if (error || subsError) {
    return (
      <div className="p-8 text-center text-red-400">
        Failed to load database distribution statistics.
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-12">
      
      {/* HEADER */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
          System Settings & Analytics
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Monitor global workspace scale distributions and adjust active subscription tier modeling parameters.
        </p>
      </div>

      {/* TWO COLUMN LAYOUT */}
      <div className={`flex gap-6 xl:gap-8 w-full items-stretch ${revenueWrapped ? 'flex-col' : 'flex-col xl:flex-row'}`}>

        {/* LEFT COLUMN */}
        <div className={`space-y-6 flex flex-col justify-between ${revenueWrapped ? 'w-full' : 'xl:w-2/3'}`}>

          {/* TOP CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
            
            <div className="bg-[#121212] border border-neutral-800/50 rounded-2xl p-6 shadow-xl flex items-center gap-5 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0">
                <TrendingUp className="text-green-500" size={22} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider whitespace-nowrap">
                  Monthly Gross Revenue
                </p>
                <p 
                  ref={revenueTextRef} 
                  className={`font-black text-white mt-1 transition-all leading-tight ${
                    revenueWrapped ? 'text-xl md:text-2xl' : 'text-2xl'
                  }`}
                >
                  ${analytics?.monthlyGrossRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <div className="bg-[#121212] border border-neutral-800/50 rounded-2xl p-6 shadow-xl flex items-center gap-5 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
                <Users className="text-sky-400" size={22} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider whitespace-nowrap">
                  Active Premium Users
                </p>
                <p className="text-2xl font-black text-white mt-1">
                  {analytics?.activePremiumUsers.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* USER DISTRIBUTION */}
          <div className="bg-[#121212] border border-neutral-800/50 rounded-2xl p-8 shadow-xl flex-1 flex flex-col justify-between">

            <h3 className="text-base font-bold text-white tracking-tight border-b border-neutral-800 pb-4 mb-6">
              User Base Distribution
            </h3>

            <div className="flex flex-col md:flex-row items-center justify-around gap-8 py-4 flex-1">

              {/* DYNAMIC PIE GRAPH CONTAINER */}
              <div
                className="relative w-44 h-44 rounded-full flex items-center justify-center shrink-0 shadow-2xl bg-neutral-900 border border-neutral-800"
                style={{
                  background: getDynamicConicGradient()
                }}
              >
                <div className="absolute inset-5 bg-[#121212] rounded-full flex flex-col items-center justify-center shadow-inner border border-neutral-800/40">
                  <span className="text-xl font-black text-white">{analytics?.totalUsers?.toLocaleString()}</span>
                  <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest mt-0.5">
                    Total Users
                  </span>
                </div>
              </div>

              <div className="flex-1 max-w-md w-full space-y-4">
                {analytics?.distribution.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-xl bg-neutral-950/40 border border-neutral-900"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-3 h-3 rounded-full ${item.color}`} />
                      <span className="text-sm font-semibold text-neutral-200">
                        {item.tier}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-white font-mono">
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

        {/* RIGHT COLUMN */}
        <div className={`bg-[#121212] border border-neutral-800/50 rounded-2xl p-6 shadow-xl flex flex-col justify-between ${
          revenueWrapped ? 'w-full mt-2' : 'xl:w-1/3'
        }`}>

          {/* TOP CONTENT */}
          <div className="space-y-6 flex-1">

            <div className="border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-2.5">
                <Layers size={18} className="text-neutral-400" />
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
                    className="py-2.5 text-xs font-bold"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSave}
                    className="py-2.5 text-xs font-bold"
                  >
                    Save Prices
                  </Button>
                </div>
              ) : (
                <Button
                  variant="primary"
                  onClick={() => setIsEditingPrices(true)}
                  className="py-2.5 text-xs font-bold"
                >
                  Edit Prices
                </Button>
              )}
            </div>

          </div>

          {/* FOOTER */}
          <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-900 flex gap-3 mt-6">
            <HelpCircle size={16} className="text-neutral-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-neutral-500 leading-normal">
              Subscription billing adjustments update processing jobs across calculations immediately. Prior invoices remain compiled immutably inside ledger records.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}