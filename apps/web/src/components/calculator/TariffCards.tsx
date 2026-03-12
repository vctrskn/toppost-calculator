'use client';

import { useCalculatorStore } from '@/store/useCalculatorStore';
import { calculateTotal } from '@toppost/calc-engine';
import type { CalcInput, FxRates } from '@toppost/calc-engine';

const DEFAULT_RATES: FxRates = {
  'GBP/EUR': 1.17,
  'USD/EUR': 0.92,
  'EUR/RUB': 105.0,
  'EUR/KZT': 530.0,
  'EUR/KGS': 97.0,
};

interface TariffOption {
  id: 'express' | 'standard' | 'economy';
  icon: string;
  label: string;
  daysLabel: string;
}

const TARIFFS: TariffOption[] = [
  { id: 'express', icon: '\u26A1', label: 'Экспресс', daysLabel: '7-10 дней' },
  { id: 'standard', icon: '\uD83D\uDCE6', label: 'Стандарт', daysLabel: '10-14 дней' },
  { id: 'economy', icon: '\uD83D\uDCB0', label: 'Эконом', daysLabel: '14-21 дней' },
];

export function TariffCards() {
  const tariff = useCalculatorStore((s) => s.tariff);
  const setTariff = useCalculatorStore((s) => s.setTariff);
  const itemPrice = useCalculatorStore((s) => s.itemPrice);
  const currency = useCalculatorStore((s) => s.currency);
  const category = useCalculatorStore((s) => s.category);
  const weightKg = useCalculatorStore((s) => s.weightKg);
  const country = useCalculatorStore((s) => s.country);
  const insurance = useCalculatorStore((s) => s.insurance);
  const photoReport = useCalculatorStore((s) => s.photoReport);
  const giftWrap = useCalculatorStore((s) => s.giftWrap);
  const rates = useCalculatorStore((s) => s.rates) ?? DEFAULT_RATES;

  // Calculate shipping price for each tariff
  function getShippingForTariff(
    tariffId: 'express' | 'standard' | 'economy',
  ): number | null {
    if (itemPrice <= 0) return null;
    try {
      const input: CalcInput = {
        itemPrice,
        currency,
        category,
        weightKg,
        country,
        tariff: tariffId,
        options: { insurance, photoReport, giftWrap },
      };
      const result = calculateTotal(input, rates);
      return result.breakdown.shipping;
    } catch {
      return null;
    }
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {TARIFFS.map((t) => {
        const isActive = tariff === t.id;
        const shipping = getShippingForTariff(t.id);
        const isFree = shipping === 0;

        return (
          <button
            key={t.id}
            type="button"
            onClick={() => setTariff(t.id)}
            className={`relative flex flex-col items-center rounded-xl border-2 px-3 py-4 text-center transition-all duration-200 ${
              isActive
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/20'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <span className="text-2xl">{t.icon}</span>
            <span
              className={`mt-1.5 text-sm font-semibold ${isActive ? 'text-blue-700' : 'text-gray-900'}`}
            >
              {t.label}
            </span>
            <span className="mt-0.5 text-xs text-gray-500">{t.daysLabel}</span>
            <span
              className={`mt-2 text-xs font-medium ${
                isFree
                  ? 'text-green-600'
                  : isActive
                    ? 'text-blue-600'
                    : 'text-gray-600'
              }`}
            >
              {shipping === null
                ? '—'
                : isFree
                  ? 'БЕСПЛАТНО'
                  : `+${shipping.toFixed(2)} €`}
            </span>
          </button>
        );
      })}
    </div>
  );
}
