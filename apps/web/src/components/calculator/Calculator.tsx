'use client';

import { useEffect } from 'react';
import { useCalculatorStore } from '@/store/useCalculatorStore';
import { Tabs } from '@/components/ui/Tabs';
import { UrlInput } from './UrlInput';
import { ManualInput } from './ManualInput';
import { ResultPanel } from './ResultPanel';
import tariffs from '@toppost/config/tariffs';

const countries = (
  tariffs as { countries: { code: string; label: string }[] }
).countries;

const TABS = [
  { id: 'url', label: 'По ссылке' },
  { id: 'manual', label: 'Вручную' },
];

export function Calculator() {
  const mode = useCalculatorStore((s) => s.mode);
  const setMode = useCalculatorStore((s) => s.setMode);
  const country = useCalculatorStore((s) => s.country);
  const setCountry = useCalculatorStore((s) => s.setCountry);
  const fetchRates = useCalculatorStore((s) => s.fetchRates);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <Tabs
          tabs={TABS}
          activeTab={mode}
          onChange={(id) => setMode(id as 'url' | 'manual')}
        />

        <div className="mt-6">
          {mode === 'url' ? <UrlInput /> : <ManualInput />}
        </div>

        {/* Country selector */}
        <div className="mt-6 border-t border-gray-100 pt-6">
          <label className="mb-3 block text-sm font-semibold text-dark">
            Страна доставки
          </label>
          <div className="grid grid-cols-3 gap-2">
            {countries.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() =>
                  setCountry(c.code as 'RU' | 'KZ' | 'KG')
                }
                className={`rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  country === c.code
                    ? 'border-brand bg-brand-50 text-brand-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ResultPanel />
    </div>
  );
}
