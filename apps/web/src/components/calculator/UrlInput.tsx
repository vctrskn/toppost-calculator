'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useCalculatorStore } from '@/store/useCalculatorStore';
import { ProductCard } from './ProductCard';

export function UrlInput() {
  const url = useCalculatorStore((s) => s.url);
  const setUrl = useCalculatorStore((s) => s.setUrl);
  const parseUrl = useCalculatorStore((s) => s.parseUrl);
  const isParsing = useCalculatorStore((s) => s.isParsing);
  const parseError = useCalculatorStore((s) => s.parseError);
  const parsedProduct = useCalculatorStore((s) => s.parsedProduct);
  const setMode = useCalculatorStore((s) => s.setMode);

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleChange = useCallback(
    (value: string) => {
      setUrl(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (value.startsWith('http')) {
        debounceRef.current = setTimeout(() => {
          parseUrl(value);
        }, 500);
      }
    },
    [setUrl, parseUrl],
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      handleChange(text);
    } catch {
      // Clipboard access denied
    }
  }, [handleChange]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="url"
          value={url}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Вставьте ссылку на товар из европейского магазина"
          className="w-full rounded-xl border border-gray-300 bg-white py-3.5 pr-12 pl-4 text-sm text-gray-900 transition-all placeholder:text-gray-400 focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none"
        />
        <button
          type="button"
          onClick={handlePaste}
          className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-brand"
          title="Вставить из буфера"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184"
            />
          </svg>
        </button>
      </div>

      {isParsing && (
        <div className="animate-pulse rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex gap-4">
            <div className="h-20 w-20 rounded-lg bg-gray-200" />
            <div className="flex-1 space-y-3 py-2">
              <div className="h-4 w-3/4 rounded bg-gray-200" />
              <div className="h-5 w-1/3 rounded bg-gray-200" />
              <div className="h-4 w-1/4 rounded bg-gray-200" />
            </div>
          </div>
        </div>
      )}

      {parseError && !isParsing && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-4">
          <p className="text-sm text-red-700">{parseError}</p>
          <button
            type="button"
            onClick={() => setMode('manual')}
            className="mt-2 text-sm font-semibold text-brand underline-offset-2 hover:underline"
          >
            Укажите данные вручную
          </button>
        </div>
      )}

      {parsedProduct && !isParsing && <ProductCard product={parsedProduct} />}
    </div>
  );
}
