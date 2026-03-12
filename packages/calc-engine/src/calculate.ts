import type { CalcInput, CalcResult, FxRates } from './types';

// Tariff data embedded from tariffs.json
const EXPRESS_RATES: Record<string, Record<string, number>> = {
  RU: { '0-1': 15, '1-3': 20, '3-5': 25, '5-10': 35, '10-20': 50, '20-31': 70 },
  KZ: { '0-1': 18, '1-3': 24, '3-5': 30, '5-10': 42, '10-20': 60, '20-31': 85 },
  KG: { '0-1': 22, '1-3': 28, '3-5': 35, '5-10': 48, '10-20': 70, '20-31': 95 },
};

const DELIVERY_DAYS: Record<string, { daysMin: number; daysMax: number }> = {
  express: { daysMin: 7, daysMax: 10 },
  standard: { daysMin: 10, daysMax: 14 },
  economy: { daysMin: 14, daysMax: 21 },
};

const COUNTRY_META: Record<string, { currency: string; symbol: string }> = {
  RU: { currency: 'RUB', symbol: '₽' },
  KZ: { currency: 'KZT', symbol: '₸' },
  KG: { currency: 'KGS', symbol: 'сом' },
};

const COMMISSION_RATE = 0.07;
const COMMISSION_MIN_EUR = 5;
const PROCESSING_FEE_EUR = 5;
const FREE_SHIPPING_THRESHOLD_EUR = 100;
const SHIPPING_BELOW_THRESHOLD_EUR = 15;
const ECONOMY_BELOW_THRESHOLD_EUR = 10;
const CUSTOMS_DUTY_FREE_THRESHOLD_EUR = 200;
const CUSTOMS_DUTY_FREE_WEIGHT_KG = 31;
const CUSTOMS_OVER_VALUE_RATE = 0.15;
const CUSTOMS_OVER_WEIGHT_RATE_EUR_PER_KG = 2;
const INSURANCE_RATE = 0.03;
const INSURANCE_MIN_EUR = 5;
const PHOTO_REPORT_EUR = 3;
const GIFT_WRAP_EUR = 5;

/**
 * Commission: MAX(itemPrice * 7%, 5€)
 */
export function calculateCommission(itemPrice: number): number {
  return Math.max(itemPrice * COMMISSION_RATE, COMMISSION_MIN_EUR);
}

/**
 * Processing fee: always 5€
 */
export function calculateProcessingFee(): number {
  return PROCESSING_FEE_EUR;
}

/**
 * Look up express shipping rate by country and weight.
 * Weight ranges: "0-1", "1-3", "3-5", "5-10", "10-20", "20-31"
 */
function lookupExpressRate(country: string, weightKg: number): number {
  const countryRates = EXPRESS_RATES[country];
  if (!countryRates) {
    throw new Error(`Unknown country for express shipping: ${country}`);
  }

  for (const [range, rate] of Object.entries(countryRates)) {
    const [minStr, maxStr] = range.split('-');
    const min = parseFloat(minStr);
    const max = parseFloat(maxStr);
    if (weightKg >= min && weightKg <= max) {
      return rate;
    }
  }

  // Handle edge: weight exactly at boundary between ranges uses the lower range
  // If weight is 0, use first range
  if (weightKg <= 0) {
    return countryRates['0-1']!;
  }

  throw new Error(`Weight ${weightKg}kg out of supported range for express shipping`);
}

/**
 * Shipping cost calculation:
 * - If itemPrice >= 100: standard=free, economy=free, express=lookup
 * - If itemPrice < 100: standard=15, economy=10, express=15+lookup
 */
export function calculateShipping(
  weightKg: number,
  country: string,
  tariff: string,
  itemPrice: number,
): number {
  const aboveThreshold = itemPrice >= FREE_SHIPPING_THRESHOLD_EUR;

  if (tariff === 'standard') {
    return aboveThreshold ? 0 : SHIPPING_BELOW_THRESHOLD_EUR;
  }

  if (tariff === 'economy') {
    return aboveThreshold ? 0 : ECONOMY_BELOW_THRESHOLD_EUR;
  }

  if (tariff === 'express') {
    const expressRate = lookupExpressRate(country, weightKg);
    return aboveThreshold ? expressRate : SHIPPING_BELOW_THRESHOLD_EUR + expressRate;
  }

  throw new Error(`Unknown tariff: ${tariff}`);
}

/**
 * Customs duty:
 * - If itemPrice <= 200 AND weight <= 31: 0
 * - Else: MAX(excess_value * 0.15, excess_weight * 2)
 */
export function calculateCustomsDuty(itemPriceEur: number, weightKg: number): number {
  if (itemPriceEur <= CUSTOMS_DUTY_FREE_THRESHOLD_EUR && weightKg <= CUSTOMS_DUTY_FREE_WEIGHT_KG) {
    return 0;
  }

  const excessValue = Math.max(0, itemPriceEur - CUSTOMS_DUTY_FREE_THRESHOLD_EUR);
  const excessWeight = Math.max(0, weightKg - CUSTOMS_DUTY_FREE_WEIGHT_KG);

  return Math.max(
    excessValue * CUSTOMS_OVER_VALUE_RATE,
    excessWeight * CUSTOMS_OVER_WEIGHT_RATE_EUR_PER_KG,
  );
}

/**
 * Insurance: if enabled MAX(itemPrice * 3%, 5€), else 0
 */
export function calculateInsurance(itemPrice: number, enabled: boolean): number {
  if (!enabled) return 0;
  return Math.max(itemPrice * INSURANCE_RATE, INSURANCE_MIN_EUR);
}

/**
 * Convert amount to EUR using provided FX rates.
 * Expects rates like { 'GBP/EUR': 1.17, 'USD/EUR': 0.92 }
 */
export function convertToEur(amount: number, currency: string, rates: FxRates): number {
  if (currency === 'EUR') return amount;

  const rateKey = `${currency}/EUR`;
  const rate = rates[rateKey];
  if (rate === undefined) {
    throw new Error(`Missing FX rate for ${rateKey}`);
  }

  return amount * rate;
}

/**
 * Get delivery time range for a tariff.
 */
export function getDeliveryDays(tariff: string): { daysMin: number; daysMax: number } {
  const days = DELIVERY_DAYS[tariff];
  if (!days) {
    throw new Error(`Unknown tariff: ${tariff}`);
  }
  return { ...days };
}

/**
 * Main orchestration: calculate full cost breakdown.
 */
export function calculateTotal(input: CalcInput, rates: FxRates): CalcResult {
  const itemPriceEur = convertToEur(input.itemPrice, input.currency, rates);

  const commission = calculateCommission(itemPriceEur);
  const processingFee = calculateProcessingFee();
  const shipping = calculateShipping(input.weightKg, input.country, input.tariff, itemPriceEur);
  const customsDuty = calculateCustomsDuty(itemPriceEur, input.weightKg);
  const insurance = calculateInsurance(itemPriceEur, input.options.insurance);
  const photoReport = input.options.photoReport ? PHOTO_REPORT_EUR : 0;
  const giftWrap = input.options.giftWrap ? GIFT_WRAP_EUR : 0;

  const totalEur =
    itemPriceEur + commission + processingFee + shipping + customsDuty + insurance + photoReport + giftWrap;

  // Convert total to local currency
  const countryMeta = COUNTRY_META[input.country];
  if (!countryMeta) {
    throw new Error(`Unknown country: ${input.country}`);
  }

  const localRateKey = `EUR/${countryMeta.currency}`;
  const localRate = rates[localRateKey];
  if (localRate === undefined) {
    throw new Error(`Missing FX rate for ${localRateKey}`);
  }

  const delivery = getDeliveryDays(input.tariff);

  const result: CalcResult = {
    breakdown: {
      itemPriceEur: round2(itemPriceEur),
      commission: round2(commission),
      processingFee: round2(processingFee),
      shipping: round2(shipping),
      customsDuty: round2(customsDuty),
      insurance: round2(insurance),
      photoReport: round2(photoReport),
      giftWrap: round2(giftWrap),
    },
    totalEur: round2(totalEur),
    totalLocal: {
      amount: round2(totalEur * localRate),
      currency: countryMeta.currency,
      symbol: countryMeta.symbol,
      rate: localRate,
    },
    delivery: {
      tariff: input.tariff,
      ...delivery,
    },
  };

  return result;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
