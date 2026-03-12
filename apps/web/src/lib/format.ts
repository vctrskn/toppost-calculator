/**
 * Format amount in euros: "120.00 €"
 */
export function formatEur(amount: number): string {
  return `${amount.toFixed(2)} €`;
}

/**
 * Format amount in local currency: "12 000 ₽"
 * Uses space as thousands separator.
 */
export function formatLocal(amount: number, symbol: string): string {
  const rounded = Math.round(amount);
  const formatted = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${formatted} ${symbol}`;
}

/**
 * Format delivery days range: "10-14 дней"
 */
export function formatDays(min: number, max: number): string {
  return `${min}-${max} дней`;
}
