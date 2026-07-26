import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import TanstackProvider from '@/contexts/TanstackContext';
import PWARegister from '@/components/PWARegister';

import { Plus_Jakarta_Sans } from 'next/font/google';

const font = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata = {
  title: 'Music Streaming App',
  description: 'Frontend Interface',
  manifest: '/manifest.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={font.variable}>
      <body className="bg-neutral-900 text-neutral-100 min-h-screen font-sans">
        <PWARegister />
        <TanstackProvider>
          <AuthProvider>{children}</AuthProvider>
        </TanstackProvider>
      </body>
    </html>
  );
}