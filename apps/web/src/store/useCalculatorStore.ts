'use client';

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { CalcInput, CalcResult, FxRates, ParsedProduct } from '@toppost/calc-engine';
import { calculateTotal } from '@toppost/calc-engine';

interface CalculatorState {
  // Input mode
  mode: 'url' | 'manual';

  // URL mode
  url: string;
  isParsing: boolean;
  parseError: string | null;
  parsedProduct: ParsedProduct | null;

  // Manual mode / shared fields
  itemPrice: number;
  currency: 'EUR' | 'GBP' | 'USD';
  category: string;
  weightKg: number;
  country: 'RU' | 'KZ' | 'KG';

  // Tariff & options
  tariff: 'standard' | 'express' | 'economy';
  insurance: boolean;
  photoReport: boolean;
  giftWrap: boolean;

  // Result
  result: CalcResult | null;

  // FX rates
  rates: FxRates | null;

  // Actions
  setMode: (mode: 'url' | 'manual') => void;
  setUrl: (url: string) => void;
  parseUrl: (url: string) => Promise<void>;
  setItemPrice: (price: number) => void;
  setCurrency: (currency: 'EUR' | 'GBP' | 'USD') => void;
  setCategory: (category: string) => void;
  setWeightKg: (weight: number) => void;
  setCountry: (country: 'RU' | 'KZ' | 'KG') => void;
  setTariff: (tariff: 'standard' | 'express' | 'economy') => void;
  toggleInsurance: () => void;
  togglePhotoReport: () => void;
  toggleGiftWrap: () => void;
  recalculate: () => void;
  fetchRates: () => Promise<void>;
}

// Default FX rates (fallback if API unavailable)
const DEFAULT_RATES: FxRates = {
  'GBP/EUR': 1.17,
  'USD/EUR': 0.92,
  'EUR/RUB': 105.0,
  'EUR/KZT': 530.0,
  'EUR/KGS': 97.0,
};

export const useCalculatorStore = create<CalculatorState>()(
  subscribeWithSelector((set, get) => ({
    mode: 'url',
    url: '',
    isParsing: false,
    parseError: null,
    parsedProduct: null,

    itemPrice: 0,
    currency: 'EUR',
    category: 'clothing',
    weightKg: 1.0,
    country: 'RU',

    tariff: 'standard',
    insurance: false,
    photoReport: false,
    giftWrap: false,

    result: null,
    rates: null,

    setMode: (mode) => {
      set({ mode });
    },

    setUrl: (url) => {
      set({ url });
    },

    parseUrl: async (url) => {
      set({ isParsing: true, parseError: null, parsedProduct: null });
      try {
        const res = await fetch('/api/parse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });
        if (!res.ok) {
          throw new Error('Не удалось распознать товар');
        }
        const product: ParsedProduct = await res.json();
        set({
          isParsing: false,
          parsedProduct: product,
          itemPrice: product.price,
          currency: product.currency as 'EUR' | 'GBP' | 'USD',
          category: product.category || 'other',
          weightKg: product.estimatedWeightKg || 1.0,
        });
        get().recalculate();
      } catch {
        set({
          isParsing: false,
          parseError: 'Не удалось распознать товар. Попробуйте указать данные вручную.',
        });
      }
    },

    setItemPrice: (itemPrice) => {
      set({ itemPrice });
      get().recalculate();
    },

    setCurrency: (currency) => {
      set({ currency });
      get().recalculate();
    },

    setCategory: (category) => {
      // Also update default weight for the category
      const categories = [
        { id: 'clothing', weight: 1.0 },
        { id: 'shoes', weight: 1.5 },
        { id: 'bags', weight: 1.0 },
        { id: 'electronics', weight: 2.0 },
        { id: 'cosmetics', weight: 0.5 },
        { id: 'sports', weight: 2.0 },
        { id: 'jewelry', weight: 0.3 },
        { id: 'home', weight: 3.0 },
        { id: 'kids', weight: 1.5 },
        { id: 'supplements', weight: 1.0 },
        { id: 'other', weight: 2.0 },
      ];
      const cat = categories.find((c) => c.id === category);
      set({ category, weightKg: cat?.weight ?? 1.0 });
      get().recalculate();
    },

    setWeightKg: (weightKg) => {
      set({ weightKg });
      get().recalculate();
    },

    setCountry: (country) => {
      set({ country });
      get().recalculate();
    },

    setTariff: (tariff) => {
      set({ tariff });
      get().recalculate();
    },

    toggleInsurance: () => {
      set((s) => ({ insurance: !s.insurance }));
      get().recalculate();
    },

    togglePhotoReport: () => {
      set((s) => ({ photoReport: !s.photoReport }));
      get().recalculate();
    },

    toggleGiftWrap: () => {
      set((s) => ({ giftWrap: !s.giftWrap }));
      get().recalculate();
    },

    recalculate: () => {
      const state = get();
      const rates = state.rates ?? DEFAULT_RATES;

      if (state.itemPrice <= 0) {
        set({ result: null });
        return;
      }

      try {
        const input: CalcInput = {
          itemPrice: state.itemPrice,
          currency: state.currency,
          category: state.category,
          weightKg: state.weightKg,
          country: state.country,
          tariff: state.tariff,
          options: {
            insurance: state.insurance,
            photoReport: state.photoReport,
            giftWrap: state.giftWrap,
          },
        };
        const result = calculateTotal(input, rates);
        set({ result });
      } catch {
        set({ result: null });
      }
    },

    fetchRates: async () => {
      try {
        const res = await fetch('/api/rates');
        if (!res.ok) throw new Error('Failed to fetch rates');
        const data = await res.json();
        set({ rates: data.rates as FxRates });
        get().recalculate();
      } catch {
        // Use default rates as fallback
        set({ rates: DEFAULT_RATES });
      }
    },
  })),
);
