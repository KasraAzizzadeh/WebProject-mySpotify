import Sidebar from '@/components/Sidebar';

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 flex flex-col md:flex-row">
      <Sidebar />
      {/* Margin allocation handles desktop offset; bottom padding prevents mobile overlaps */}
      <div className="flex-1 md:ml-64 pb-20 md:pb-6 transition-all duration-300">
        {children}
      </div>
    </div>
  );
}