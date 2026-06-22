interface MediaCardProps {
  title: string;
  subtitle?: string;
  badge?: string;
}

export default function MediaCard({ title, subtitle, badge }: MediaCardProps) {
  return (
    <div className="bg-neutral-900 hover:bg-neutral-800 p-4 rounded-xl transition-all duration-200 group cursor-pointer border border-neutral-800/40 relative">
      {badge && (
        <span className="absolute top-2 right-2 bg-yellow-500 text-neutral-950 text-[10px] font-bold px-2 py-0.5 rounded-full z-10 uppercase tracking-wide shadow-md">
          {badge}
        </span>
      )}
      {/* Decorative Placeholder for Cover Album Graphics */}
      <div className="w-full aspect-square bg-neutral-800 rounded-lg mb-4 flex items-center justify-center group-hover:scale-[1.02] transition-transform duration-200 shadow-inner relative">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-neutral-600">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l6.75-3.185a.75.75 0 011.05.685v10.113a.75.75 0 01-1.05.685L9 14.25m0-5.25v5.25m0-5.25L4.265 7.03A.75.75 0 003.333 7.7v8.6a.75.75 0 00.932.727L9 14.25M9 14.25v5.25a.75.75 0 001.25.56l6.75-5.25a.75.75 0 000-1.12L10.25 8.44a.75.75 0 00-1.25.56v5.25Z" />
        </svg>
      </div>
      <h4 className="font-semibold text-white truncate text-sm md:text-base">{title}</h4>
      {subtitle && <p className="text-neutral-400 text-xs md:text-sm truncate mt-1">{subtitle}</p>}
    </div>
  );
}