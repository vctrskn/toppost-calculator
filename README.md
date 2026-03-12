# TopPost Calculator

Публичный калькулятор стоимости доставки товаров из Европы в Россию и СНГ для [toppost.de](https://toppost.de).

## Что это

Клиент вставляет ссылку на товар из европейского магазина → калькулятор мгновенно показывает полную стоимость «под ключ»:
- Цена товара
- Комиссия TopPost
- Стоимость доставки (3 тарифа)
- Таможенная пошлина
- Итого в EUR и ₽

## Quick Start

```bash
pnpm install
pnpm dev
```

## Tech Stack

- Next.js 15 + React 19 + TypeScript
- Tailwind CSS 4
- Express + Playwright (парсинг)
- Redis (кэш)
- Docker

## Документация

- [Техническое задание](docs/TZ.md)
- [API спецификация](docs/API.md)
