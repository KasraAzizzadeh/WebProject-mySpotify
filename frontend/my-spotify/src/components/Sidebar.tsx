'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Home, Search, Music, Settings, Users, 
  Ticket as TicketIcon, CircleDollarSign, 
  Sliders, ShieldAlert, ArrowLeftRight 
} from 'lucide-react';

export default function Sidebar() {
  const { user: authUser } = useAuth() as any;
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Active support tab driven directly by the URL parameter (defaults to verification)
  const activeSupportTab = searchParams?.get('tab') || 'verification';
  
  // Tracks workspace perspective view (App Navigation vs Support Management)
  const [viewMode, setViewMode] = useState<'app' | 'support'>('support');

  const userRole = authUser?.role || 'user';
  const isSystemAdmin = userRole === 'admin';
  const hasSupportAccess = userRole === 'admin' || userRole === 'supporter';
  const isCurrentlyOnSupportRoute = pathname?.startsWith('/support');

  const appLinks = [
    {
      label: 'Home',
      href: '/home',
      icon: <Home size={18} className="text-emerald-400 group-hover:text-emerald-300 transition-colors" />,
    },
    {
      label: 'Discover',
      href: '/discover',
      icon: <Search size={18} className="text-sky-400 group-hover:text-sky-300 transition-colors" />,
    },
    {
      label: 'Playlists',
      href: '/playlists',
      icon: <Music size={18} className="text-fuchsia-400 group-hover:text-fuchsia-300 transition-colors" />,
    },
    {
      label: 'Settings',
      href: '/settings',
      icon: <Settings size={18} className="text-zinc-400 group-hover:text-white transition-colors" />,
    },
  ];

  const showSupportMenu = hasSupportAccess && isCurrentlyOnSupportRoute && viewMode === 'support';

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-56 lg:w-64 h-screen sticky top-0 shrink-0 bg-neutral-950 border-r border-neutral-800 justify-between">
        
        <div className="flex flex-col flex-1">
          {/* HEADER AREA */}
          <div className="px-6 pt-10 pb-6">
            <div className="text-xl font-bold tracking-wider text-green-500">
              SPOTIFY_DEV
            </div>
            {showSupportMenu && (
              <p className="text-[10px] text-neutral-500 mt-1 uppercase tracking-widest font-mono">
                {isSystemAdmin ? '🛡️ Admin Center' : '💼 Support Desk'}
              </p>
            )}
            <div className="mt-4 h-px w-full bg-neutral-800" />
          </div>

          {/* NAV AREA */}
          <nav className="flex flex-col px-4 gap-1.5 flex-1">
            {!showSupportMenu ? (
              appLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-4 px-4 py-3 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-900 transition-all font-medium group ${
                    pathname === link.href ? 'bg-neutral-900 text-white' : ''
                  }`}
                >
                  <span className="shrink-0 flex items-center justify-center">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              ))
            ) : (
              /* CLEAN MONOCHROME PANEL ITEMS - NO COLOR, NO BORDERS */
              <>
                <Link
                  href="/support?tab=verification"
                  className={`flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium transition-all group ${
                    activeSupportTab === 'verification' 
                      ? 'bg-neutral-900 text-white' 
                      : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
                  }`}
                >
                  <Users size={18} className="text-neutral-400 group-hover:text-white transition-colors" />
                  <span>Verification</span>
                </Link>

                <Link
                  href="/support?tab=tickets"
                  className={`flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium transition-all group ${
                    activeSupportTab === 'tickets' 
                      ? 'bg-neutral-900 text-white' 
                      : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
                  }`}
                >
                  <TicketIcon size={18} className="text-neutral-400 group-hover:text-white transition-colors" />
                  <span>Support Tickets</span>
                </Link>

                <Link
                  href="/support?tab=auditing"
                  className={`flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium transition-all group ${
                    activeSupportTab === 'auditing' 
                      ? 'bg-neutral-900 text-white' 
                      : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
                  }`}
                >
                  <CircleDollarSign size={18} className="text-neutral-400 group-hover:text-white transition-colors" />
                  <span>Artist Auditing</span>
                </Link>

                {isSystemAdmin && (
                  <Link
                    href="/support?tab=settings"
                    className={`flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium transition-all group ${
                      activeSupportTab === 'settings' 
                        ? 'bg-neutral-900 text-white' 
                        : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
                    }`}
                  >
                    <Sliders size={18} className="text-neutral-400 group-hover:text-white transition-colors" />
                    <span>System Settings</span>
                  </Link>
                )}
              </>
            )}
          </nav>
        </div>

        {/* WORKSPACE TOGGLE SWITCH */}
        {hasSupportAccess && (
          <div className="p-4 border-t border-neutral-900 bg-neutral-950/40 flex flex-col gap-2">
            {isCurrentlyOnSupportRoute ? (
              <button
                onClick={() => setViewMode(prev => prev === 'app' ? 'support' : 'app')}
                className="w-full py-2.5 px-3 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-neutral-800"
              >
                <ArrowLeftRight size={14} className="text-neutral-400" />
                {viewMode === 'app' ? 'Show Ops Panels' : 'Show App Navigation'}
              </button>
            ) : (
              <Link
                href="/support"
                className="w-full py-2.5 px-3 bg-neutral-900 hover:bg-red-950/20 text-neutral-400 hover:text-red-400 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-neutral-800/80 hover:border-red-900/50"
              >
                <ShieldAlert size={14} />
                Open Staff Dashboard
              </Link>
            )}
          </div>
        )}
      </aside>

      {/* Mobile Nav Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-neutral-950 border-t border-neutral-800 flex justify-around items-center z-50 px-2">
        {appLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center justify-center text-neutral-400 hover:text-white transition-colors group ${
              pathname === link.href ? 'text-white' : ''
            }`}
          >
            <span className="text-lg flex items-center justify-center">{link.icon}</span>
            <span className="text-[10px] mt-1 font-medium">{link.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}