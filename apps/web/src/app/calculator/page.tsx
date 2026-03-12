import type { Metadata } from 'next';
import { Calculator } from '@/components/Calculator';

export const metadata: Metadata = {
  title: 'Калькулятор доставки из Европы — TopPost.de',
  description:
    'Рассчитайте полную стоимость доставки товара из интернет-магазинов Европы в Россию, Казахстан и Киргизию. Калькулятор учитывает таможенные пошлины, комиссию и доставку.',
};

const FAQ_ITEMS = [
  {
    question: 'Как рассчитывается стоимость доставки?',
    answer:
      'Стоимость складывается из цены товара, комиссии сервиса (7%, мин. 5€), сбора за обработку (5€), стоимости доставки (зависит от тарифа и веса) и таможенной пошлины (при стоимости свыше 200€).',
  },
  {
    question: 'Какие сроки доставки?',
    answer:
      'Экспресс: 7–10 дней, Стандарт: 10–14 дней, Эконом: 14–21 день. Сроки указаны с момента получения товара на нашем складе в Германии.',
  },
  {
    question: 'В какие страны вы доставляете?',
    answer:
      'Мы доставляем в Россию, Казахстан и Киргизию. Для каждой страны действуют свои тарифы на доставку.',
  },
  {
    question: 'Нужно ли платить таможенную пошлину?',
    answer:
      'Таможенная пошлина начисляется, если стоимость товара превышает 200€ или вес превышает 31 кг. Ставка — 15% от суммы превышения по стоимости или 2€ за каждый килограмм превышения по весу.',
  },
  {
    question: 'Из каких магазинов можно заказать?',
    answer:
      'Мы работаем с большинством европейских интернет-магазинов: Zalando, Amazon.de, Nike, Adidas, Zara, H&M, ASOS, Mytheresa и другими. Вставьте ссылку на товар, и мы автоматически определим магазин.',
  },
];

export default function CalculatorPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <section className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900">
          Калькулятор доставки из Европы
        </h1>
        <p className="text-lg text-gray-600">
          Рассчитайте полную стоимость с учётом всех сборов и пошлин
        </p>
      </section>

      <Calculator />

      <section className="mt-16">
        <h2 className="mb-8 text-2xl font-bold text-gray-900">
          Часто задаваемые вопросы
        </h2>
        <div className="space-y-6">
          {FAQ_ITEMS.map((item, index) => (
            <details
              key={index}
              className="rounded-lg border border-gray-200 p-4"
            >
              <summary className="cursor-pointer text-lg font-medium text-gray-900">
                {item.question}
              </summary>
              <p className="mt-3 text-gray-600">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
