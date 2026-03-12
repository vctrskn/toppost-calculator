import { Router } from 'express';
import { createRequire } from 'module';
import type { FxRates } from '@toppost/calc-engine';

const require = createRequire(import.meta.url);
const tariffs = require('@toppost/config/tariffs');

export const ratesRouter = Router();

// Mock FX rates — will be replaced with real API (e.g., ECB)
const MOCK_FX_RATES: FxRates = {
  'EUR/RUB': 100,
  'EUR/KZT': 568,
  'EUR/KGS': 101,
  'GBP/EUR': 1.17,
  'USD/EUR': 0.92,
};

ratesRouter.get('/', (_req, res) => {
  res.set('Cache-Control', 'public, max-age=3600');
  res.json({
    rates: MOCK_FX_RATES,
    tariffs: {
      categories: tariffs.categories,
      countries: tariffs.countries,
      shipping: {
        express: tariffs.shipping.express_meta,
        standard: { days_min: tariffs.shipping.standard.days_min, days_max: tariffs.shipping.standard.days_max },
        economy: { days_min: tariffs.shipping.economy.days_min, days_max: tariffs.shipping.economy.days_max },
      },
    },
    updatedAt: new Date().toISOString(),
  });
});
