'use client';

import { useState, useCallback } from 'react';
import { useCalculatorStore } from '@/store/useCalculatorStore';
import { formatEur, formatLocal } from '@/lib/format';

export function ShareButtons() {
  const result = useCalculatorStore((s) => s.result);
  const [copied, setCopied] = useState(false);

  const getShareText = useCallback(() => {
    if (!result) return '';
    const lines = [
      `TopPost \u2014 \u041a\u0430\u043b\u044c\u043a\u0443\u043b\u044f\u0442\u043e\u0440 \u0434\u043e\u0441\u0442\u0430\u0432\u043a\u0438 \u0438\u0437 \u0415\u0432\u0440\u043e\u043f\u044b`,
      ``,
      `\u0418\u0442\u043e\u0433\u043e: ${formatEur(result.totalEur)}`,
      `(${formatLocal(result.totalLocal.amount, result.totalLocal.symbol)})`,
      `\u0414\u043e\u0441\u0442\u0430\u0432\u043a\u0430: ${result.delivery.daysMin}\u2013${result.delivery.daysMax} \u0434\u043d\u0435\u0439`,
      ``,
      `\u0420\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u0442\u044c: ${typeof window !== 'undefined' ? window.location.href : ''}`,
    ];
    return lines.join('\n');
  }, [result]);

  const handleTelegram = useCallback(() => {
    const text = encodeURIComponent(getShareText());
    window.open(`https://t.me/share/url?text=${text}`, '_blank');
  }, [getShareText]);

  const handleWhatsApp = useCallback(() => {
    const text = encodeURIComponent(getShareText());
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }, [getShareText]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(getShareText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }, [getShareText]);

  if (!result) return null;

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={handleTelegram}
        className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#2AABEE] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#229ED9]"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
        Telegram
      </button>

      <button
        type="button"
        onClick={handleWhatsApp}
        className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#20BD5A]"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
        </svg>
        WhatsApp
      </button>

      <button
        type="button"
        onClick={handleCopy}
        className={`flex items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition-all ${
          copied
            ? 'border-green-300 bg-green-50 text-green-700'
            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
        }`}
      >
        {copied ? (
          <>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
            <span className="hidden sm:inline">Скопировано!</span>
          </>
        ) : (
          <>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5A3.375 3.375 0 0 0 6.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0 0 13.5 2.25H10.5a2.25 2.25 0 0 0-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 0 0-9-9Z" />
            </svg>
            <span className="hidden sm:inline">Скопировать</span>
          </>
        )}
      </button>
    </div>
  );
}
