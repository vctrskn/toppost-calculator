export interface CalcInput {
  itemPrice: number;
  currency: 'EUR' | 'GBP' | 'USD';
  category: string;
  weightKg: number;
  country: 'RU' | 'KZ' | 'KG';
  tariff: 'express' | 'standard' | 'economy';
  options: {
    insurance: boolean;
    photoReport: boolean;
    giftWrap: boolean;
  };
}

export interface CalcResult {
  breakdown: {
    itemPriceEur: number;
    commission: number;
    processingFee: number;
    shipping: number;
    customsDuty: number;
    insurance: number;
    photoReport: number;
    giftWrap: number;
  };
  totalEur: number;
  totalLocal: {
    amount: number;
    currency: string;
    symbol: string;
    rate: number;
  };
  delivery: {
    tariff: string;
    daysMin: number;
    daysMax: number;
  };
}

export interface ParsedProduct {
  name: string;
  price: number;
  currency: string;
  imageUrl: string;
  category: string;
  estimatedWeightKg: number;
  store: string;
  parsedAt: string;
  cached: boolean;
}

export type FxRates = Record<string, number>;
