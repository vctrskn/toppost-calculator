import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Калькулятор стоимости доставки из Европы | TopPost.de',
  description:
    'Рассчитайте полную стоимость доставки товаров из Европы в Россию, Казахстан и Киргизию. Все сборы и пошлины включены.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-surface font-[Arial,Helvetica,sans-serif] antialiased">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
            <a href="https://toppost.de" className="flex items-center gap-2">
              <img
                src="https://toppost.de/images/logo/svg/Toppost_logo_color.svg"
                alt="TopPost.de"
                className="h-8"
              />
            </a>
            <nav className="flex items-center gap-4">
              <a
                href="https://toppost.de"
                className="text-sm text-gray-600 transition-colors hover:text-brand"
              >
                На сайт
              </a>
              <a
                href="https://t.me/toppost_de"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
              >
                Telegram
              </a>
            </nav>
          </div>
        </header>

        {children}

        {/* Footer */}
        <footer className="mt-16 border-t border-gray-200 bg-white py-8">
          <div className="mx-auto max-w-4xl px-4 text-center text-sm text-gray-500">
            <p>TopPost.de &mdash; доставка товаров из Европы с 1994 года</p>
            <p className="mt-1">1 000 000+ посылок доставлено</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
