'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { isUnauthorized } from '@/lib/api';

interface AdminResourceState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Small data-loading hook for admin tabs.
 * Calls onUnauthorized when the API returns 401.
 */
export function useAdminResource<T>(
  loader: () => Promise<T>,
  onUnauthorized: () => void
): AdminResourceState<T> & { reload: () => Promise<void> } {
  const loaderRef = useRef(loader);
  loaderRef.current = loader;
  const onUnauthorizedRef = useRef(onUnauthorized);
  onUnauthorizedRef.current = onUnauthorized;

  const [state, setState] = useState<AdminResourceState<T>>({
    data: null,
    loading: true,
    error: null
  });

  const reload = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const data = await loaderRef.current();
      setState({ data, loading: false, error: null });
    } catch (err) {
      if (isUnauthorized(err)) {
        onUnauthorizedRef.current();
        return;
      }
      setState({
        data: null,
        loading: false,
        error: err instanceof Error ? err.message : 'Request failed'
      });
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { ...state, reload };
}
