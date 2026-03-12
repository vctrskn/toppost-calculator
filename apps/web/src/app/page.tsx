import { Calculator } from '@/components/Calculator';

export default function HomePage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <section className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900">
          Узнайте стоимость доставки из Европы за 30 секунд
        </h1>
        <p className="text-lg text-gray-600">
          1&nbsp;000&nbsp;000 посылок доставлено. 30 лет опыта.
        </p>
      </section>

      <Calculator />
    </main>
  );
}
