import Sidebar from '@/components/Sidebar';

export default function AppGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Sidebar />
      {/* Main Content Container wrapping dashboard and streaming pages */}
      <div className="flex-1 md:ml-64 pb-20 md:pb-6 transition-all duration-300">
        {children}
      </div>
    </div>
  );
}