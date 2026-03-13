import { NextRequest, NextResponse } from 'next/server';
import { calculateTotal } from '@toppost/calc-engine';
import type { CalcInput, FxRates } from '@toppost/calc-engine';

const FX_RATES: FxRates = {
  'EUR/RUB': 100,
  'EUR/KZT': 568,
  'EUR/KGS': 101,
  'GBP/EUR': 1.17,
  'USD/EUR': 0.92,
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { itemPrice, currency, category, weightKg, country, tariff, options } = body;

    if (typeof itemPrice !== 'number' || itemPrice <= 0) {
      return NextResponse.json({ error: 'itemPrice must be a positive number' }, { status: 400 });
    }

    const input: CalcInput = {
      itemPrice,
      currency: currency || 'EUR',
      category: category || 'other',
      weightKg: weightKg || 1,
      country: country || 'RU',
      tariff: tariff || 'standard',
      options: {
        insurance: Boolean(options?.insurance),
        photoReport: Boolean(options?.photoReport),
        giftWrap: Boolean(options?.giftWrap),
      },
    };

    const result = calculateTotal(input, FX_RATES);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: 'Calculation failed', message: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
