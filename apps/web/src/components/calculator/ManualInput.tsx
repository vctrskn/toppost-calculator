'use client';

import { useCalculatorStore } from '@/store/useCalculatorStore';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { Slider } from '@/components/ui/Slider';
import tariffs from '@toppost/config/tariffs';

const categories = (tariffs as { categories: { id: string; label: string }[] }).categories;

export function ManualInput() {
  const itemPrice = useCalculatorStore((s) => s.itemPrice);
  const currency = useCalculatorStore((s) => s.currency);
  const category = useCalculatorStore((s) => s.category);
  const weightKg = useCalculatorStore((s) => s.weightKg);
  const setItemPrice = useCalculatorStore((s) => s.setItemPrice);
  const setCurrency = useCalculatorStore((s) => s.setCurrency);
  const setCategory = useCalculatorStore((s) => s.setCategory);
  const setWeightKg = useCalculatorStore((s) => s.setWeightKg);

  return (
    <div className="space-y-5">
      {/* Price */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Цена товара
        </label>
        <CurrencyInput
          value={itemPrice}
          currency={currency}
          onValueChange={setItemPrice}
          onCurrencyChange={setCurrency}
          placeholder="Введите цену"
        />
      </div>

      {/* Category */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Категория
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Weight */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Вес (кг)
            </label>
            <input
              type="number"
              inputMode="decimal"
              min={0.1}
              max={31}
              step={0.1}
              value={weightKg}
              onChange={(e) =>
                setWeightKg(
                  Math.min(31, Math.max(0.1, parseFloat(e.target.value) || 0.1)),
                )
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </div>
        </div>
        <div className="mt-3">
          <Slider
            value={weightKg}
            min={0.1}
            max={31}
            step={0.1}
            onChange={setWeightKg}
            unit="кг"
          />
        </div>
      </div>
    </div>
  );
}
