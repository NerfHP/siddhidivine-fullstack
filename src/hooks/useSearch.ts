import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { ContentItem } from '@/types';

// Debounce hook to prevent API calls on every keystroke
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

const fetchSearchResults = async (query: string) => {
  if (!query) return [];
  const { data } = await api.get(`/search?q=${query}`);
  return data as ContentItem[];
};

export function useSearch() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300); // 300ms delay

  const { data: results, isLoading } = useQuery({
    queryKey: ['searchResults', debouncedQuery],
    queryFn: () => fetchSearchResults(debouncedQuery),
    enabled: !!debouncedQuery, // Only run the query if there's a debounced query
  });

  return { query, setQuery, results, isLoading };
}
