'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import Input from '@/components/ui/Input';

interface Props {
  initialQuery?: string;
}

export default function DiscoverSearch({
  initialQuery = '',
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(initialQuery);

  // Keep the input in sync when the URL changes
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  // Debounce for 800ms before updating the URL
  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (query.trim()) {
        params.set('q', query.trim());
      } else {
        params.delete('q');
      }

      router.replace(`/discover?${params.toString()}`);
    }, 800);

    return () => clearTimeout(timeout);
  }, [query, router, searchParams]);

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (query.trim()) {
      params.set('q', query.trim());
    } else {
      params.delete('q');
    }

    router.replace(`/discover?${params.toString()}`);
  };

  return (
    <Input
      variant="search"
      placeholder="Search songs, artists, albums..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onSearch={handleSearch}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          handleSearch();
        }
      }}
    />
  );
}