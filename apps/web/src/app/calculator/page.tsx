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
      'Стоимость складывается из цены товара, комиссии сервиса (7%, мин. 5\u20ac), сбора за обработку (5\u20ac), стоимости доставки (зависит от тарифа и веса) и таможенной пошлины (при стоимости свыше 200\u20ac).',
  },
  {
    question: 'Какие сроки доставки?',
    answer:
      'Экспресс: 7\u201310 дней, Стандарт: 10\u201314 дней, Эконом: 14\u201321 день. Сроки указаны с момента получения товара на нашем складе в Германии.',
  },
  {
    question: 'В какие страны вы доставляете?',
    answer:
      'Мы доставляем в Россию, Казахстан и Киргизию. Для каждой страны действуют свои тарифы на доставку.',
  },
  {
    question: 'Нужно ли платить таможенную пошлину?',
    answer:
      'Таможенная пошлина начисляется, если стоимость товара превышает 200\u20ac или вес превышает 31 кг. Ставка \u2014 15% от суммы превышения по стоимости или 2\u20ac за каждый килограмм превышения по весу.',
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
      <section className="mb-10 text-center">
        <h1 className="mb-3 text-3xl font-bold tracking-tight text-dark sm:text-4xl">
          Калькулятор доставки из Европы
        </h1>
        <p className="text-base text-gray-500">
          Рассчитайте полную стоимость с учётом всех сборов и пошлин
        </p>
      </section>

      <Calculator />

      <section className="mt-16">
        <h2 className="mb-8 text-2xl font-bold text-dark">
          Часто задаваемые вопросы
        </h2>
        <div className="space-y-4">
          {FAQ_ITEMS.map((item, index) => (
            <details
              key={index}
              className="group rounded-xl border border-gray-200 bg-white p-5 transition-all open:shadow-sm"
            >
              <summary className="cursor-pointer text-base font-semibold text-dark">
                {item.question}
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
