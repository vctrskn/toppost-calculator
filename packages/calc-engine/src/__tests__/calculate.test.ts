import { describe, it, expect } from 'vitest';
import {
  calculateCommission,
  calculateProcessingFee,
  calculateShipping,
  calculateCustomsDuty,
  calculateInsurance,
  calculateTotal,
  convertToEur,
  getDeliveryDays,
} from '../calculate';
import type { CalcInput, FxRates } from '../types';

const DEFAULT_RATES: FxRates = {
  'GBP/EUR': 1.17,
  'USD/EUR': 0.92,
  'EUR/RUB': 105,
  'EUR/KZT': 520,
  'EUR/KGS': 97,
};

// ─── Commission ─────────────────────────────────────────────

describe('calculateCommission', () => {
  it('should return minimum 5€ for 0€ item', () => {
    expect(calculateCommission(0)).toBe(5);
  });

  it('should return minimum 5€ for 50€ item (3.5 < 5)', () => {
    expect(calculateCommission(50)).toBe(5);
  });

  it('should return 5€ at boundary 71.43€ (71.43 * 0.07 = 5.0001)', () => {
    const result = calculateCommission(71.43);
    expect(result).toBeCloseTo(5.0001, 2);
  });

  it('should return 7€ for 100€ item', () => {
    expect(calculateCommission(100)).toBeCloseTo(7, 2);
  });

  it('should return 35€ for 500€ item', () => {
    expect(calculateCommission(500)).toBeCloseTo(35, 2);
  });

  it('should return 105€ for 1500€ item', () => {
    expect(calculateCommission(1500)).toBeCloseTo(105, 2);
  });
});

// ─── Processing Fee ─────────────────────────────────────────

describe('calculateProcessingFee', () => {
  it('should always return 5€', () => {
    expect(calculateProcessingFee()).toBe(5);
  });
});

// ─── Shipping ───────────────────────────────────────────────

describe('calculateShipping', () => {
  // Standard tariff
  it('standard: free when itemPrice >= 100', () => {
    expect(calculateShipping(2, 'RU', 'standard', 100)).toBe(0);
  });

  it('standard: 15€ when itemPrice < 100', () => {
    expect(calculateShipping(2, 'RU', 'standard', 99)).toBe(15);
  });

  // Economy tariff
  it('economy: free when itemPrice >= 100', () => {
    expect(calculateShipping(2, 'KZ', 'economy', 150)).toBe(0);
  });

  it('economy: 10€ when itemPrice < 100', () => {
    expect(calculateShipping(2, 'KZ', 'economy', 50)).toBe(10);
  });

  // Express tariff — above threshold (only express rate)
  it('express RU 0.5kg above threshold: 15€', () => {
    expect(calculateShipping(0.5, 'RU', 'express', 200)).toBe(15);
  });

  it('express RU 2kg above threshold: 20€', () => {
    expect(calculateShipping(2, 'RU', 'express', 100)).toBe(20);
  });

  it('express KZ 4kg above threshold: 30€', () => {
    expect(calculateShipping(4, 'KZ', 'express', 100)).toBe(30);
  });

  it('express KG 7kg above threshold: 48€', () => {
    expect(calculateShipping(7, 'KG', 'express', 100)).toBe(48);
  });

  it('express RU 15kg above threshold: 50€', () => {
    expect(calculateShipping(15, 'RU', 'express', 100)).toBe(50);
  });

  it('express RU 25kg above threshold: 70€', () => {
    expect(calculateShipping(25, 'RU', 'express', 100)).toBe(70);
  });

  // Express tariff — below threshold (15 + express rate)
  it('express RU 0.5kg below threshold: 15 + 15 = 30€', () => {
    expect(calculateShipping(0.5, 'RU', 'express', 50)).toBe(30);
  });

  it('express KZ 2kg below threshold: 15 + 24 = 39€', () => {
    expect(calculateShipping(2, 'KZ', 'express', 50)).toBe(39);
  });

  it('express KG 4kg below threshold: 15 + 35 = 50€', () => {
    expect(calculateShipping(4, 'KG', 'express', 50)).toBe(50);
  });
});

// ─── Customs Duty ───────────────────────────────────────────

describe('calculateCustomsDuty', () => {
  it('should be 0 for 0€ item', () => {
    expect(calculateCustomsDuty(0, 1)).toBe(0);
  });

  it('should be 0 for 200€ item under 31kg (boundary)', () => {
    expect(calculateCustomsDuty(200, 31)).toBe(0);
  });

  it('should charge for 201€ item under 31kg: (201-200)*0.15 = 0.15€', () => {
    expect(calculateCustomsDuty(201, 1)).toBeCloseTo(0.15, 2);
  });

  it('should charge for 500€ item: (500-200)*0.15 = 45€', () => {
    expect(calculateCustomsDuty(500, 1)).toBe(45);
  });

  it('should charge for 100€ item over weight 35kg: (35-31)*2 = 8€', () => {
    expect(calculateCustomsDuty(100, 35)).toBe(8);
  });

  it('should take max of value-based and weight-based duty', () => {
    // 400€, 40kg: value excess = (400-200)*0.15 = 30, weight excess = (40-31)*2 = 18
    expect(calculateCustomsDuty(400, 40)).toBe(30);
  });

  it('should prefer weight-based when higher', () => {
    // 210€, 50kg: value excess = (210-200)*0.15 = 1.5, weight excess = (50-31)*2 = 38
    expect(calculateCustomsDuty(210, 50)).toBe(38);
  });
});

// ─── Insurance ──────────────────────────────────────────────

describe('calculateInsurance', () => {
  it('should return 0 when disabled', () => {
    expect(calculateInsurance(500, false)).toBe(0);
  });

  it('should return minimum 5€ for cheap item when enabled', () => {
    expect(calculateInsurance(50, true)).toBe(5);
  });

  it('should return 5€ at boundary (166.67€ * 0.03 = 5.0001)', () => {
    const result = calculateInsurance(166.67, true);
    expect(result).toBeCloseTo(5.0001, 2);
  });

  it('should return 15€ for 500€ item when enabled', () => {
    expect(calculateInsurance(500, true)).toBe(15);
  });

  it('should return 0 for 0€ item when disabled', () => {
    expect(calculateInsurance(0, false)).toBe(0);
  });
});

// ─── Currency Conversion ────────────────────────────────────

describe('convertToEur', () => {
  it('should return same amount for EUR', () => {
    expect(convertToEur(100, 'EUR', DEFAULT_RATES)).toBe(100);
  });

  it('should convert GBP to EUR (100 GBP * 1.17 = 117 EUR)', () => {
    expect(convertToEur(100, 'GBP', DEFAULT_RATES)).toBe(117);
  });

  it('should convert USD to EUR (100 USD * 0.92 = 92 EUR)', () => {
    expect(convertToEur(100, 'USD', DEFAULT_RATES)).toBe(92);
  });

  it('should throw for unknown currency', () => {
    expect(() => convertToEur(100, 'JPY', DEFAULT_RATES)).toThrow('Missing FX rate');
  });
});

// ─── Delivery Days ──────────────────────────────────────────

describe('getDeliveryDays', () => {
  it('express: 7-10 days', () => {
    expect(getDeliveryDays('express')).toEqual({ daysMin: 7, daysMax: 10 });
  });

  it('standard: 10-14 days', () => {
    expect(getDeliveryDays('standard')).toEqual({ daysMin: 10, daysMax: 14 });
  });

  it('economy: 14-21 days', () => {
    expect(getDeliveryDays('economy')).toEqual({ daysMin: 14, daysMax: 21 });
  });
});

// ─── Full calculateTotal ────────────────────────────────────

describe('calculateTotal', () => {
  const baseInput: CalcInput = {
    itemPrice: 50,
    currency: 'EUR',
    category: 'clothing',
    weightKg: 1,
    country: 'RU',
    tariff: 'standard',
    options: { insurance: false, photoReport: false, giftWrap: false },
  };

  it('cheap item: 50€ standard RU, no options', () => {
    const result = calculateTotal(baseInput, DEFAULT_RATES);
    // commission: max(50*0.07, 5) = 5
    // processing: 5
    // shipping: 15 (below 100)
    // customs: 0
    // insurance: 0
    // total: 50 + 5 + 5 + 15 = 75
    expect(result.breakdown.itemPriceEur).toBe(50);
    expect(result.breakdown.commission).toBe(5);
    expect(result.breakdown.processingFee).toBe(5);
    expect(result.breakdown.shipping).toBe(15);
    expect(result.breakdown.customsDuty).toBe(0);
    expect(result.breakdown.insurance).toBe(0);
    expect(result.totalEur).toBe(75);
    expect(result.delivery.tariff).toBe('standard');
    expect(result.delivery.daysMin).toBe(10);
    expect(result.delivery.daysMax).toBe(14);
    expect(result.totalLocal.currency).toBe('RUB');
    expect(result.totalLocal.symbol).toBe('₽');
    expect(result.totalLocal.rate).toBe(105);
    expect(result.totalLocal.amount).toBe(7875); // 75 * 105
  });

  it('mid-range item: 150€ express KZ with insurance', () => {
    const input: CalcInput = {
      itemPrice: 150,
      currency: 'EUR',
      category: 'shoes',
      weightKg: 1.5,
      country: 'KZ',
      tariff: 'express',
      options: { insurance: true, photoReport: false, giftWrap: false },
    };
    const result = calculateTotal(input, DEFAULT_RATES);
    // commission: max(150*0.07, 5) = 10.5
    // processing: 5
    // shipping: 24 (above 100, express KZ 1-3kg)
    // customs: 0 (150 <= 200)
    // insurance: max(150*0.03, 5) = 5 (4.5 < 5)
    // total: 150 + 10.5 + 5 + 24 + 0 + 5 = 194.5
    expect(result.breakdown.commission).toBe(10.5);
    expect(result.breakdown.shipping).toBe(24);
    expect(result.breakdown.insurance).toBe(5);
    expect(result.totalEur).toBe(194.5);
    expect(result.totalLocal.currency).toBe('KZT');
    expect(result.totalLocal.amount).toBe(101140); // 194.5 * 520
  });

  it('luxury item: 500€ express RU with all options', () => {
    const input: CalcInput = {
      itemPrice: 500,
      currency: 'EUR',
      category: 'jewelry',
      weightKg: 0.3,
      country: 'RU',
      tariff: 'express',
      options: { insurance: true, photoReport: true, giftWrap: true },
    };
    const result = calculateTotal(input, DEFAULT_RATES);
    // commission: max(500*0.07, 5) = 35
    // processing: 5
    // shipping: 15 (above 100, express RU 0-1kg)
    // customs: (500-200)*0.15 = 45
    // insurance: max(500*0.03, 5) = 15
    // photoReport: 3
    // giftWrap: 5
    // total: 500 + 35 + 5 + 15 + 45 + 15 + 3 + 5 = 623
    expect(result.breakdown.commission).toBe(35);
    expect(result.breakdown.shipping).toBe(15);
    expect(result.breakdown.customsDuty).toBe(45);
    expect(result.breakdown.insurance).toBe(15);
    expect(result.breakdown.photoReport).toBe(3);
    expect(result.breakdown.giftWrap).toBe(5);
    expect(result.totalEur).toBe(623);
  });

  it('heavy item with GBP currency: 200 GBP economy KG', () => {
    const input: CalcInput = {
      itemPrice: 200,
      currency: 'GBP',
      category: 'home',
      weightKg: 8,
      country: 'KG',
      tariff: 'economy',
      options: { insurance: false, photoReport: true, giftWrap: false },
    };
    const result = calculateTotal(input, DEFAULT_RATES);
    // 200 GBP * 1.17 = 234 EUR
    // commission: max(234*0.07, 5) = 16.38
    // processing: 5
    // shipping: 0 (above 100, economy)
    // customs: (234-200)*0.15 = 5.1
    // insurance: 0
    // photoReport: 3
    // total: 234 + 16.38 + 5 + 0 + 5.1 + 0 + 3 + 0 = 263.48
    expect(result.breakdown.itemPriceEur).toBe(234);
    expect(result.breakdown.commission).toBe(16.38);
    expect(result.breakdown.customsDuty).toBe(5.1);
    expect(result.totalEur).toBe(263.48);
    expect(result.totalLocal.currency).toBe('KGS');
    expect(result.totalLocal.symbol).toBe('сом');
    expect(result.totalLocal.amount).toBe(25557.56); // 263.48 * 97
  });

  it('USD item below threshold', () => {
    const input: CalcInput = {
      itemPrice: 80,
      currency: 'USD',
      category: 'cosmetics',
      weightKg: 0.5,
      country: 'RU',
      tariff: 'standard',
      options: { insurance: false, photoReport: false, giftWrap: false },
    };
    const result = calculateTotal(input, DEFAULT_RATES);
    // 80 USD * 0.92 = 73.6 EUR
    // commission: max(73.6*0.07, 5) = 5.15
    // processing: 5
    // shipping: 15 (below 100, standard)
    // customs: 0
    // total: 73.6 + 5.15 + 5 + 15 = 98.75
    expect(result.breakdown.itemPriceEur).toBe(73.6);
    expect(result.breakdown.commission).toBe(5.15);
    expect(result.breakdown.shipping).toBe(15);
    expect(result.totalEur).toBe(98.75);
  });

  // Edge cases
  it('edge: 0 weight should use 0-1 range for express', () => {
    const input: CalcInput = {
      ...baseInput,
      tariff: 'express',
      weightKg: 0,
      itemPrice: 200,
    };
    const result = calculateTotal(input, DEFAULT_RATES);
    expect(result.breakdown.shipping).toBe(15); // express RU 0-1kg, above threshold
  });
});
