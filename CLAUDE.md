# TopPost Calculator

## Project Overview
Публичный калькулятор стоимости доставки из Европы «под ключ» для toppost.de.
MVP дедлайн: 30 апреля 2026.

## Tech Stack
- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4, Zustand
- **Backend:** Node.js, Express, Playwright (парсинг), Redis (кэш)
- **Infrastructure:** Docker, GitHub Actions CI/CD
- **Monitoring:** Sentry (ошибки), базовая аналитика (Яндекс.Метрика + GA4)

## Project Structure
```
apps/
  web/          — Next.js frontend (калькулятор UI)
  api/          — Express backend (парсинг, расчёты, шеринг)
packages/
  calc-engine/  — логика расчёта (shared между web и api)
  parsers/      — парсеры магазинов (Playwright)
  config/       — тарифы, курсы, категории (JSON)
docs/           — ТЗ, API spec, runbooks
```

## Commands
- `pnpm dev` — запуск dev-окружения (web + api)
- `pnpm build` — production build
- `pnpm test` — тесты
- `pnpm lint` — линтинг
- `pnpm parse:test` — smoke-тест парсеров

## Key Conventions
- Язык кода: English (переменные, комменты)
- Язык UI: Russian
- Все тарифы в `packages/config/tariffs.json` — изменяемы без деплоя
- Парсеры: один файл на магазин в `packages/parsers/stores/`
- Каждый парсер имеет smoke-тест с реальным URL

## GitHub Project
- Owner: `vctrskn`, Project #1 ("Tasks")
- Все задачи трекаются как issues в этом репо
- Labels: `frontend`, `backend`, `parser`, `design`, `qa`, `infra`, `docs`
- Milestones: `Sprint 1` ... `Sprint 7`
