import { Calculator } from '@/components/Calculator';

export default function HomePage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-6 sm:py-12">
      <section className="mb-10 text-center">
        <h1 className="mb-3 text-3xl font-bold tracking-tight text-dark sm:text-4xl">
          Узнайте стоимость доставки из Европы за 30 секунд
        </h1>
        <p className="text-base text-gray-500">
          Вставьте ссылку на товар или введите данные вручную — калькулятор рассчитает всё автоматически
        </p>
      </section>

      <Calculator />
    </main>
  );
}
