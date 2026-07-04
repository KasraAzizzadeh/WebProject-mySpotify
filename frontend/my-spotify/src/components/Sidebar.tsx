import Link from 'next/link';
import { Home, Search, Music, Settings } from 'lucide-react';

export default function Sidebar() {
  const links = [
    {
      label: 'Home',
      href: '/home',
      icon: (
        <Home
          size={18}
          className="text-emerald-400 group-hover:text-emerald-300 transition-colors"
        />
      ),
    },
    {
      label: 'Discover',
      href: '/discover',
      icon: (
        <Search
          size={18}
          className="text-sky-400 group-hover:text-sky-300 transition-colors"
        />
      ),
    },
    {
      label: 'Playlists',
      href: '/playlists',
      icon: (
        <Music
          size={18}
          className="text-fuchsia-400 group-hover:text-fuchsia-300 transition-colors"
        />
      ),
    },
    {
      label: 'Settings',
      href: '/settings',
      icon: (
        <Settings
          size={18}
          className="text-zinc-400 group-hover:text-white transition-colors"
        />
      ),
    },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-56 lg:w-64 h-screen sticky top-0 shrink-0 bg-neutral-950 border-r border-neutral-800">

        {/* HEADER AREA */}
        <div className="px-6 pt-10 pb-6">
          <div className="text-xl font-bold tracking-wider text-green-500">
            SPOTIFY_DEV
          </div>

          <div className="mt-4 h-px w-full bg-neutral-800" />
        </div>

        {/* NAV AREA */}
        <nav className="flex flex-col px-4 gap-2 flex-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-4 px-4 py-3 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-900 transition-all font-medium group"
            >
              <span className="shrink-0 flex items-center justify-center">
                {link.icon}
              </span>
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        {/* optional bottom padding breathing room */}
        <div className="pb-6" />
      </aside>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-neutral-950 border-t border-neutral-800 flex justify-around items-center z-50 px-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex flex-col items-center justify-center text-neutral-400 hover:text-white transition-colors group"
          >
            <span className="text-lg flex items-center justify-center">
              {link.icon}
            </span>
            <span className="text-[10px] mt-1 font-medium">{link.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}