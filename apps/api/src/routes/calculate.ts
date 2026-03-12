import { Router } from 'express';
import { calculateTotal } from '@toppost/calc-engine';
import type { CalcInput, FxRates } from '@toppost/calc-engine';

export const calculateRouter = Router();

// Mock FX rates — same as rates route
const FX_RATES: FxRates = {
  'EUR/RUB': 100,
  'EUR/KZT': 568,
  'EUR/KGS': 101,
  'GBP/EUR': 1.17,
  'USD/EUR': 0.92,
};

const VALID_CURRENCIES = ['EUR', 'GBP', 'USD'] as const;
const VALID_COUNTRIES = ['RU', 'KZ', 'KG'] as const;
const VALID_TARIFFS = ['express', 'standard', 'economy'] as const;

function isValidCurrency(v: string): v is CalcInput['currency'] {
  return (VALID_CURRENCIES as readonly string[]).includes(v);
}

function isValidCountry(v: string): v is CalcInput['country'] {
  return (VALID_COUNTRIES as readonly string[]).includes(v);
}

function isValidTariff(v: string): v is CalcInput['tariff'] {
  return (VALID_TARIFFS as readonly string[]).includes(v);
}

calculateRouter.post('/', (req, res) => {
  try {
    const { itemPrice, currency, category, weightKg, country, tariff, options } = req.body;

    // Validate required fields
    if (typeof itemPrice !== 'number' || itemPrice <= 0) {
      res.status(400).json({ error: 'itemPrice must be a positive number' });
      return;
    }

    if (!currency || !isValidCurrency(currency)) {
      res.status(400).json({ error: `currency must be one of: ${VALID_CURRENCIES.join(', ')}` });
      return;
    }

    if (!category || typeof category !== 'string') {
      res.status(400).json({ error: 'category is required' });
      return;
    }

    if (typeof weightKg !== 'number' || weightKg <= 0) {
      res.status(400).json({ error: 'weightKg must be a positive number' });
      return;
    }

    if (!country || !isValidCountry(country)) {
      res.status(400).json({ error: `country must be one of: ${VALID_COUNTRIES.join(', ')}` });
      return;
    }

    if (!tariff || !isValidTariff(tariff)) {
      res.status(400).json({ error: `tariff must be one of: ${VALID_TARIFFS.join(', ')}` });
      return;
    }

    const input: CalcInput = {
      itemPrice,
      currency,
      category,
      weightKg,
      country,
      tariff,
      options: {
        insurance: Boolean(options?.insurance),
        photoReport: Boolean(options?.photoReport),
        giftWrap: Boolean(options?.giftWrap),
      },
    };

    const result = calculateTotal(input, FX_RATES);
    res.json(result);
  } catch (err) {
    console.error('Calculate error:', err);
    res.status(500).json({
      error: 'Calculation failed',
      message: err instanceof Error ? err.message : 'Unknown error',
    });
  }
});
