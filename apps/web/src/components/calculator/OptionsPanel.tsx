'use client';

import { useCalculatorStore } from '@/store/useCalculatorStore';

interface OptionItem {
  id: 'insurance' | 'photoReport' | 'giftWrap';
  label: string;
  description: string;
  priceLabel: string;
}

const OPTIONS: OptionItem[] = [
  {
    id: 'insurance',
    label: 'Страхование',
    description: 'Защита товара на весь путь доставки',
    priceLabel: '3% от стоимости, мин. 5 €',
  },
  {
    id: 'photoReport',
    label: 'Фотоотчёт',
    description: 'Фото товара при получении на складе',
    priceLabel: '3 €',
  },
  {
    id: 'giftWrap',
    label: 'Подарочная упаковка',
    description: 'Оформим посылку как подарок',
    priceLabel: '5 €',
  },
];

export function OptionsPanel() {
  const insurance = useCalculatorStore((s) => s.insurance);
  const photoReport = useCalculatorStore((s) => s.photoReport);
  const giftWrap = useCalculatorStore((s) => s.giftWrap);
  const toggleInsurance = useCalculatorStore((s) => s.toggleInsurance);
  const togglePhotoReport = useCalculatorStore((s) => s.togglePhotoReport);
  const toggleGiftWrap = useCalculatorStore((s) => s.toggleGiftWrap);

  const values: Record<string, boolean> = { insurance, photoReport, giftWrap };
  const toggles: Record<string, () => void> = {
    insurance: toggleInsurance,
    photoReport: togglePhotoReport,
    giftWrap: toggleGiftWrap,
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700">
        Дополнительные услуги
      </h3>
      {OPTIONS.map((opt) => {
        const isActive = values[opt.id];
        return (
          <button
            key={opt.id}
            type="button"
            onClick={toggles[opt.id]}
            className={`flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all duration-200 ${
              isActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            {/* Checkbox */}
            <div
              className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded transition-all ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'border-2 border-gray-300 bg-white'
              }`}
            >
              {isActive && (
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={3}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m4.5 12.75 6 6 9-13.5"
                  />
                </svg>
              )}
            </div>

            {/* Text */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm font-medium ${isActive ? 'text-blue-700' : 'text-gray-900'}`}
                >
                  {opt.label}
                </span>
                <span
                  className={`text-xs font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'}`}
                >
                  {opt.priceLabel}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-gray-500">{opt.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
