import Link from 'next/link';

export default function Sidebar() {
  const links = [
    { label: 'Discover', href: '/discover', icon: '🔍' },
    { label: 'Playlists', href: '/playlists', icon: '🎶' },
    { label: 'Settings', href: '/settings', icon: '⚙️' },
  ];

  return (
    <>
      {/* Desktop Sidebar Layout */}
      <aside className="hidden md:flex flex-col w-64 bg-neutral-950 p-6 space-y-6 border-r border-neutral-800 h-screen fixed left-0 top-0">
        <div className="text-xl font-bold tracking-wider text-green-500">SPOTIFY_DEV</div>
        <nav className="flex flex-col space-y-2">
          {links.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className="flex items-center space-x-4 px-4 py-3 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-900 transition-all font-medium"
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Mobile Sticky Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-neutral-950 border-t border-neutral-800 flex justify-around items-center z-50 px-2">
        {links.map((link) => (
          <Link 
            key={link.href} 
            href={link.href}
            className="flex flex-col items-center justify-center text-neutral-400 hover:text-white transition-colors"
          >
            <span className="text-lg">{link.icon}</span>
            <span className="text-[10px] mt-0.5">{link.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}