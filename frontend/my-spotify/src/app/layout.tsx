import Sidebar from '@/components/Sidebar';
import './globals.css'; // Make sure your global styles stay imported here!

export const metadata = {
  title: 'Music Streaming App',
  description: 'Frontend Interface',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-neutral-900 text-neutral-100 min-h-screen" suppressHydrationWarning>
        <div className="flex flex-col md:flex-row min-h-screen">
          <Sidebar />
          {/* Main Content Area Container */}
          <div className="flex-1 md:ml-64 pb-20 md:pb-6 transition-all duration-300">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}