'use client';

interface CurrencyInputProps {
  value: number;
  currency: 'EUR' | 'GBP' | 'USD';
  onValueChange: (value: number) => void;
  onCurrencyChange: (currency: 'EUR' | 'GBP' | 'USD') => void;
  placeholder?: string;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: '€',
  GBP: '£',
  USD: '$',
};

export function CurrencyInput({
  value,
  currency,
  onValueChange,
  onCurrencyChange,
  placeholder = '0.00',
}: CurrencyInputProps) {
  return (
    <div className="flex overflow-hidden rounded-lg border border-gray-300 bg-white transition-all duration-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
      <div className="flex items-center pl-4 text-gray-400">
        {CURRENCY_SYMBOLS[currency]}
      </div>
      <input
        type="number"
        inputMode="decimal"
        min={0}
        step={0.01}
        value={value || ''}
        onChange={(e) => onValueChange(parseFloat(e.target.value) || 0)}
        placeholder={placeholder}
        className="min-w-0 flex-1 border-0 bg-transparent px-2 py-3 text-lg font-medium text-gray-900 outline-none placeholder:text-gray-300 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <select
        value={currency}
        onChange={(e) =>
          onCurrencyChange(e.target.value as 'EUR' | 'GBP' | 'USD')
        }
        className="cursor-pointer border-l border-gray-200 bg-gray-50 px-3 py-3 text-sm font-medium text-gray-700 outline-none transition-colors hover:bg-gray-100"
      >
        <option value="EUR">EUR</option>
        <option value="GBP">GBP</option>
        <option value="USD">USD</option>
      </select>
    </div>
  );
}
