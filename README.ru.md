# My Raid CDs

[English](README.md) | **Русский**

Веб-приложение для учёта рейдовых КД по персонажам и подземельям (фокус на WotLK).
Данные хранятся локально в `localStorage`.
Активная ссылка: [sergimax.ru/my-raid-cds](https://sergimax.ru/my-raid-cds)

![Версия приложения](https://img.shields.io/badge/App_version-1.52.0-purple)
![Версия игры](https://img.shields.io/badge/WoW-3.3.5a-brown)

<img src="./public/logo.svg" width="148" height="148">

## Возможности

Панели тулбара взаимоисключающие (открыта только одна).

### Персонажи и подземелья

Добавляйте вручную или загрузите шаблон рейдов WotLK, если список пуст.
Позже можно править спеки, гир из WowSims и данные рейда.

### Переключатели КД

Отмечайте, у кого висит КД на каком рейде.
Сброс одного персонажа — из заголовка таблицы, всех — из панели **Данные**.

### Таблица

Сортировка и поиск рейдов (имя, размер, режим — EN/RU, напр. `ICC25H` / `ЦЛК25хм`).
На узких экранах — компактный вид.

### Управление данными

Массовый сброс КД или удаление всех персонажей / подземелий / локальных BIS (с подтверждением).
Если подземелий нет — **Добавить из шаблона**.

### Подбор персонажа под рейд

Строка набора персонажей без КД по отфильтрованным рейдам — с копированием.
Фильтры: минимальный GS, роль, спеки.

### Подбор софтов под рейд

Софт-резервы для одного персонажа + спека по BiS-апгрейдам из отфильтрованных рейдов.
Только на сессию; готовые строки для вставки.

### BIS-сборки

Встроенные пресеты по спекам (сначала Kingdom с вариантами слотов, затем Titans/community); локальные копии редактируются и используются в подсказках для выбора гира.
Раскладка слотов как в интерфейсе игры; альтернативы показываются стеком под основным предметом.

### Подсказки гира

Ячейки КД:
- <span style="color:#d97706">янтарный</span> — недостающий BiS
- <span style="color:#0284c7">синий</span> — апгрейд по ilvl.

В тултипе лут распределен по боссам.

### EN / RU

Полный UI и тултипы предметов.
При первом визите по умолчанию русский.

### Тема

Светлая/тёмная тема, сохраняется локально.
В хедере ссылки на GitHub и [sergimax.ru](https://sergimax.ru).

## Разработка

**Стек:**
React 19, TypeScript, Vite, MUI, Vitest + Testing Library.

**CI:**
На push/PR в `main` GitHub Actions параллельно гоняет **Lint**, **Test** и **Build** (`.github/workflows/ci.yml`); push в `main` также загружает артефакт `dist` (`.github/workflows/build-artifacts.yml`).

**Структура:**
`src/components/` (UI), `src/hooks/` (домен + оверлей-панели), `src/utils/`, `src/data/` (бандлы WoW + BiS-пресеты), `src/storage/`. Тесты рядом: `*.test.ts(x)`.

Соглашения для контрибьюторов/агентов: [`.cursor/rules/project-rules.mdc`](.cursor/rules/project-rules.mdc).

**Запланированные фичи:**
[docs/roadmap.md](docs/roadmap.md).

### Быстрый старт

```bash
npm install
npm run dev
```

Откройте [http://localhost:5173](http://localhost:5173).

| Команда | Описание |
|---------|----------|
| `npm run dev` | Dev-сервер |
| `npm run build` | Production-сборка |
| `npm run preview` | Превью production-сборки |
| `npm run lint` | ESLint |
| `npm run test` / `npm run test:run` | Vitest (watch / CI) |
| `npm run build:wow-data` | Пересборка бандлов WoW JSON из `scripts/wowsims-db.json` (в т.ч. лут тира VoA из метаданных сетов, если WowSims не отдаёт зону 4603) |
| `npm run generate:bis-presets` | Пересборка встроенных BiS из `scripts/bis-list-sources.md` + `scripts/bis-list-mix.md` |
| `npm run comment:bis-presets` | Комментарии слотов в файлах BiS-пресетов |
| `npm run download:gear-slot-icons` | PNG-заглушки слотов paper-doll в `src/assets/gear-slot-icons/` |

Встроенные BiS пишутся в `scripts/bis-list-sources.md` (Titans + community) и `scripts/bis-list-mix.md` (Kingdom. With variants: нумерованное оружие и альтернативы `N-M`).
После правок markdown перегенерируйте TypeScript-пресеты.

### Хранение

| Ключ | Содержимое |
|------|------------|
| `my-raid-cds` | Персонажи, подземелья, переключатели (`schemaVersion` 5) |
| `my-raid-cds-bis-lists` | Выбранные BiS и локальные списки (битые записи пропускаются) |
| `my-raid-cds-item-tooltip-locale` | `en` или `ru` (по умолчанию `ru`) |
| `my-raid-cds-color-mode` | Светлая/тёмная тема |

Повреждённые данные трекера сбрасываются с алертом.
Старые сейвы мигрируют при загрузке.
