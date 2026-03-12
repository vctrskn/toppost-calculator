'use client';

import { useCalculatorStore } from '@/store/useCalculatorStore';
import { formatEur, formatLocal, formatDays } from '@/lib/format';
import { TariffCards } from './TariffCards';
import { OptionsPanel } from './OptionsPanel';
import { ShareButtons } from './ShareButtons';

export function ResultPanel() {
  const result = useCalculatorStore((s) => s.result);
  const insurance = useCalculatorStore((s) => s.insurance);
  const photoReport = useCalculatorStore((s) => s.photoReport);
  const giftWrap = useCalculatorStore((s) => s.giftWrap);

  if (!result) return null;

  const { breakdown, totalEur, totalLocal, delivery } = result;

  return (
    <div className="space-y-6">
      {/* Breakdown */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
          Расчёт стоимости
        </h3>

        <div className="space-y-3">
          <Row label="Товар" value={formatEur(breakdown.itemPriceEur)} />
          <Row label="Комиссия TopPost (7%)" value={formatEur(breakdown.commission)} />
          <Row label="Обработка заказа" value={formatEur(breakdown.processingFee)} />
          <Row
            label="Доставка"
            value={breakdown.shipping === 0 ? 'БЕСПЛАТНО' : formatEur(breakdown.shipping)}
            valueClassName={breakdown.shipping === 0 ? 'text-green-600 font-semibold' : undefined}
          />
          <Row
            label="Таможенная пошлина"
            value={breakdown.customsDuty === 0 ? 'Без пошлины' : formatEur(breakdown.customsDuty)}
            valueClassName={breakdown.customsDuty === 0 ? 'text-green-600 font-semibold' : undefined}
          />

          {insurance && <Row label="Страховка" value={formatEur(breakdown.insurance)} />}
          {photoReport && <Row label="Фотоотчёт" value={formatEur(breakdown.photoReport)} />}
          {giftWrap && <Row label="Подарочная упаковка" value={formatEur(breakdown.giftWrap)} />}

          {/* Total */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-baseline justify-between">
              <span className="text-base font-bold text-dark">ИТОГО</span>
              <div className="text-right">
                <span className="text-3xl font-bold text-brand transition-all duration-300">
                  {formatEur(totalEur)}
                </span>
                <p className="mt-1 text-sm text-gray-500">
                  {'\u2248'} {formatLocal(totalLocal.amount, totalLocal.symbol)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery time */}
        <div className="mt-5 flex items-center gap-2 rounded-xl bg-brand-50 px-4 py-3">
          <span className="text-lg">{'\uD83D\uDCE6'}</span>
          <span className="text-sm font-semibold text-brand-700">
            {formatDays(delivery.daysMin, delivery.daysMax)}
          </span>
        </div>
      </div>

      {/* Tariff cards */}
      <TariffCards />

      {/* Options */}
      <OptionsPanel />

      {/* CTA buttons */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <a
          href="https://t.me/toppost_de"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-brand px-6 py-4 text-base font-bold text-white shadow-sm transition-all hover:bg-brand-hover active:scale-[0.98]"
        >
          Заказать через Telegram
        </a>
        <a
          href="https://wa.me/4915147300663"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-green-600 bg-white px-6 py-4 text-base font-bold text-green-700 shadow-sm transition-all hover:bg-green-50 active:scale-[0.98]"
        >
          Заказать через WhatsApp
        </a>
      </div>

      {/* Share */}
      <ShareButtons />
    </div>
  );
}

function Row({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      <span
        className={`text-sm font-medium transition-all duration-300 ${valueClassName ?? 'text-gray-900'}`}
      >
        {value}
      </span>
    </div>
  );
}
