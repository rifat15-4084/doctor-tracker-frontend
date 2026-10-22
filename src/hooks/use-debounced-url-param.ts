'use client';

import { useDebounce } from './use-debounce';
import { useUrlParams } from './use-url-params';
import { useEffect, useRef, useState } from 'react';

/**
 * A search box value that lives in the URL.
 *
 * - The input updates instantly (local state).
 * - The URL (and therefore the query) is only updated after the debounce.
 * - External URL changes (e.g. "Clear filters") are reflected back in the input.
 */
export function useDebouncedUrlParam(key = 'q', delay = 400) {
  const { params, setParam } = useUrlParams();
  const urlValue = params[key] ?? '';

  const [value, setValue] = useState(urlValue);
  const debounced = useDebounce(value, delay);

  const lastPushed = useRef(urlValue);
  const valueRef = useRef(value);
  valueRef.current = value;

  // Push the debounced value into the URL.
  useEffect(() => {
    if (debounced === lastPushed.current) return;
    lastPushed.current = debounced;
    setParam(key, debounced || undefined);
  }, [debounced, key, setParam]);

  // Pull external changes (clear filters, browser navigation) back into the input.
  useEffect(() => {
    if (urlValue === valueRef.current) return;
    if (urlValue === lastPushed.current) return;
    lastPushed.current = urlValue;
    setValue(urlValue);
  }, [urlValue]);

  return { value, setValue, debounced };
}
