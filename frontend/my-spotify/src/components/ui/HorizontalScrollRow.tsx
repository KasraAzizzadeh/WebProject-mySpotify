'use client';

import { useRef, useState, useEffect } from 'react';

interface Props {
  title: string;
  children: React.ReactNode;
  onShowAll?: () => void;
}

export default function HorizontalScrollRow({
  title,
  children,
  onShowAll,
}: Props) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;

    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 5);
  };

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;

    const amount = el.clientWidth * 0.8;

    el.scrollBy({
      left: dir === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener('scroll', updateScrollState);
    window.addEventListener('resize', updateScrollState);

    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, []);

  return (
    <section className="space-y-2">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-white">{title}</h2>

        {onShowAll && (
          <button
            onClick={onShowAll}
            className="text-sm text-neutral-400 hover:text-white"
          >
            Show all
          </button>
        )}
      </div>

      {/* SCROLL AREA */}
      <div className="relative group">
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100"
          >
            ‹
          </button>
        )}

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide py-2"
        >
          {children}
        </div>

        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100"
          >
            ›
          </button>
        )}
      </div>
    </section>
  );
}