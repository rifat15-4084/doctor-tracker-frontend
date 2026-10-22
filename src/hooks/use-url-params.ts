'use client';

import { useCallback, useMemo, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type ParamValue = string | undefined;

function parseSearch(search: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!search) return out;

  search.split('&').forEach((pair) => {
    if (!pair) return;
    const index = pair.indexOf('=');
    const key = decodeURIComponent(index === -1 ? pair : pair.slice(0, index));
    const value = index === -1 ? '' : decodeURIComponent(pair.slice(index + 1).replace(/\+/g, ' '));
    if (key) out[key] = value;
  });

  return out;
}

/**
 * Keeps filter state inside the URL query string so that refreshing or sharing
 * a link restores the exact same view. Every write uses `router.replace` with
 * `scroll: false` to avoid history spam and scroll jumps.
 */
export function useUrlParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchKey = searchParams.toString();

  const params = useMemo(() => parseSearch(searchKey), [searchKey]);

  const write = useCallback(
    (updates: Record<string, ParamValue>, resetPage = true) => {
      const next = new URLSearchParams(searchKey);
      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === '') next.delete(key);
        else next.set(key, value);
      });
      if (resetPage) next.delete('page');

      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [router, pathname, searchKey],
  );

  const setParam = useCallback(
    (key: string, value: ParamValue, resetPage = true) => write({ [key]: value }, resetPage),
    [write],
  );

  const setParams = useCallback(
    (updates: Record<string, ParamValue>, resetPage = true) => write(updates, resetPage),
    [write],
  );

  const removeParams = useCallback(
    (keys: string[]) => {
      const updates: Record<string, ParamValue> = {};
      keys.forEach((key) => {
        updates[key] = undefined;
      });
      write(updates, true);
    },
    [write],
  );

  const page = Math.max(1, Number(params.page) || 1);

  const setPage = useCallback(
    (nextPage: number) => write({ page: nextPage > 1 ? String(nextPage) : undefined }, false),
    [write],
  );

  return { params, setParam, setParams, removeParams, page, setPage, searchParams };
}
