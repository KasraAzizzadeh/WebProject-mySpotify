import './globals.css'; 
import { AuthProvider } from '@/contexts/AuthContext';

export const metadata = {
  title: 'Music Streaming App',
  description: 'Frontend Interface',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-neutral-900 text-neutral-100 min-h-screen" suppressHydrationWarning>
        <AuthProvider>
          {/* Renders content cleanly without injecting global sidebars here */}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}