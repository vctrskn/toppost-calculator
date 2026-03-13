import { NextResponse } from 'next/server';
import type { FxRates } from '@toppost/calc-engine';
import tariffs from '@toppost/config/tariffs';

const typedTariffs = tariffs as {
  categories: { id: string; label: string; default_weight_kg: number }[];
  countries: { code: string; label: string; currency: string; symbol: string }[];
  shipping: {
    express_meta: { days_min: number; days_max: number };
    standard: { days_min: number; days_max: number };
    economy: { days_min: number; days_max: number };
  };
};

// Mock FX rates — will be replaced with ECB API
const FX_RATES: FxRates = {
  'EUR/RUB': 100,
  'EUR/KZT': 568,
  'EUR/KGS': 101,
  'GBP/EUR': 1.17,
  'USD/EUR': 0.92,
};

export async function GET() {
  return NextResponse.json(
    {
      rates: FX_RATES,
      tariffs: {
        categories: typedTariffs.categories,
        countries: typedTariffs.countries,
        shipping: {
          express: typedTariffs.shipping.express_meta,
          standard: { days_min: typedTariffs.shipping.standard.days_min, days_max: typedTariffs.shipping.standard.days_max },
          economy: { days_min: typedTariffs.shipping.economy.days_min, days_max: typedTariffs.shipping.economy.days_max },
        },
      },
      updatedAt: new Date().toISOString(),
    },
    {
      headers: { 'Cache-Control': 'public, max-age=3600' },
    },
  );
}
