# Raidwise

[English](README.md) | **Русский**

Веб-приложение для учёта рейдовых КД по персонажам и подземельям, с BiS-подсказками по гиру и помощниками для набора в рейд (фокус на WotLK).
Данные хранятся локально в `localStorage`.
Активная ссылка: [sergimax.ru/raidwise](https://sergimax.ru/raidwise)

![Версия приложения](https://img.shields.io/badge/App_version-2.7.0-purple)
![Версия игры](https://img.shields.io/badge/WoW-3.3.5a-brown)

<img src="./public/logo.svg" width="148" height="148">

## Возможности

Панели тулбара взаимоисключающие (открыта только одна).

### Персонажи и подземелья

Добавляйте вручную (**Добавить персонажа** / **Добавить рейд**, пошаговые формы) или загрузите шаблон рейдов WotLK, если список пуст.
Имена новых персонажей — только буквы; в UI первая буква с заглавной.
Позже можно править спеки, гир из WowSims, список «Также есть» (сумки / другой спек / торговцы для подсказок) и данные рейда.
Порядок колонок в таблице — из диалога правки (`Позиция: < n >`).
Кнопка **info** в хедере показывает краткую справку (три способа: КД, план гира или только BIS).

### Переключатели КД

Отмечайте, у кого висит КД на каком рейде.
Сброс одного персонажа — из заголовка таблицы, всех — из панели **Данные**.

### Таблица

Сортировка и поиск рейдов (имя, размер, режим — EN/RU, напр. `ICC25H` / `ЦЛК25хм`).
В заголовках персонажей — имя цветом класса, GS мейна/оффа (или `- / -`), правка / сброс / удаление.
Колонка Complete — прогресс-бар (счётчик при наведении).
На узких экранах — компактный вид.
Широкие колонки персонажей прокручиваются горизонтально внутри таблицы (страница не ездит).

### Управление данными

Массовый сброс КД или удаление всех персонажей / подземелий / локальных BIS (с подтверждением).
Если подземелий нет — **Добавить рейды из шаблона**.

### Подбор персонажа под рейд

Строка набора персонажей без КД по отфильтрованным рейдам — с копированием.
Фильтры: минимальный GS, роль, спеки (сохраняются в сессии браузера при закрытии или смене панели).
Переключатели формата строки (**Спеки** / **GS**); персонажи вида `Имя Спек gs / Спек gs`, через запятую.
Клик по чипу выбранного рейда исключает его из результатов (чип остаётся видимым).
Сброс в заголовке очищает поиск и исключения чипов.

### Подбор софтов под рейд

Софт-резервы для одного персонажа + спека по BiS-апгрейдам из отфильтрованных рейдов (активный список из **BIS сборок**).
Только на сессию (персонаж, правила, софты и исключения рейдов переживают закрытие панели).
Цвет спроса и расчёт шансов помогают выбрать софты; сброс одной строки или всего списка предметов.
В списке для вставки можно скрыть имя персонажа и подробности (боссов).
Шмот со второго спека того же персонажа считается уже имеющимся для софтов и подсказок в таблице.
Те же кликабельные чипы рейдов для исключений (софты по предметам, исчезнувшим из списка, сбрасываются); сброс в заголовке для поиска/исключений.
При узкой панели блоки предметов и списка софтов переносятся на отдельные строки.

### BIS-сборки

Встроенные пресеты по спекам (сначала Kingdom с вариантами слотов, затем Titans/community); локальные копии редактируются и используются в подсказках для выбора гира.
Выбор класса/спека сохраняется в сессии при уходе с панели; выбранный пресет уже пишется в BiS-хранилище.
Раскладка слотов как в интерфейсе игры; альтернативы показываются стеком под основным предметом.
У своих списков — очистка слота / всех слотов; в Items показано имя активного списка; Items и Lists с ограниченной высотой и прокруткой.

### Подсказки гира

Ячейки КД:
- <span style="color:#d97706">янтарный</span> — недостающий BiS
- <span style="color:#0284c7">синий</span> — апгрейд по ilvl.

В тултипе лут распределен по боссам.
Предметы из «Также есть» (редактирование персонажа) учитываются в BiS/ilvl-подсказках, даже если их нет в экспорте WowSims.

### EN / RU

Полный UI и тултипы предметов.
При первом визите по умолчанию русский.

### Тема

Светлая/тёмная тема, сохраняется локально (палитра, типографика и стили ссылок).
В хедере ссылки на GitHub и [sergimax.ru](https://sergimax.ru).
Дизайн-токены / рецепты: [docs/design/design-system.md](docs/design/design-system.md).

## Разработка

![Lighthouse Performance](https://img.shields.io/badge/Performance-93-%230cce6b?logo=lighthouse&logoColor=white)
![Lighthouse Accessibility](https://img.shields.io/badge/Accessibility-98-%230cce6b?logo=lighthouse&logoColor=white)
![Lighthouse Best Practices](https://img.shields.io/badge/Best_Practices-100-%230cce6b?logo=lighthouse&logoColor=white)
![Lighthouse SEO](https://img.shields.io/badge/SEO-100-%230cce6b?logo=lighthouse&logoColor=white)

**Стек:**
React 19, TypeScript, Vite, MUI, Vitest + Testing Library.

**CI:**
Локально `npm run ci` запускает lint + тесты + сборку.
На push/PR в `main` GitHub Actions параллельно запускает **Lint**, **Test** и **Build**, затем **Release files** (проверяет, что версия в `package.json` уже поднята и совпадает с CHANGELOG / бейджами README / lockfile — сам версию не повышает) (`.github/workflows/ci.yml`); push в `main` также загружает артефакт `dist` (`.github/workflows/build-artifacts.yml`).

**Структура:**
`src/components/` (UI), `src/hooks/` (домен + оверлей-панели), `src/utils/`, `src/data/` (бандлы WoW + BiS-пресеты), `src/storage/`.
Тесты рядом: `*.test.ts(x)`.

**Производительность:**
JSON предметов WoW грузится отдельными чанками после оболочки (`WowDataProvider` / `ensure-wow-data`); шрифты локальные в `public/fonts/`; иконки классов/спеков — WebP 32×32; скрипты тултипов предметов — при первом наведении/фокусе на ссылку, только для активной локали.

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
| `npm run test` / `npm run test:run` | Vitest (watch / один прогон) |
| `npm run ci` | Lint + test:run + build (проверки перед push) |
| `npm run build:wow-data` | Пересборка бандлов WoW JSON из `scripts/wow-data/wowsims-db.json` (в т.ч. лут тира VoA из метаданных сетов, если WowSims не отдаёт зону 4603) |
| `npm run generate:bis-presets` | Пересборка встроенных BiS из `scripts/bis/bis-list-sources.md` + `scripts/bis/bis-list-mix.md` |
| `npm run comment:bis-presets` | Комментарии слотов в файлах BiS-пресетов |
| `npm run download:gear-slot-icons` | PNG-заглушки слотов paper-doll в `src/assets/gear-slot-icons/` |
| `npm run download:fonts` | Локальные Onest / Noto Sans / JetBrains Mono woff2 + `src/fonts.css` |
| `npm run compress:class-icons` | Иконки классов/спеков 32×32 WebP в `src/assets/class-icons/` |
| `npm run lighthouse` | Lighthouse desktop для preview/production → `docs/lighthouse/` (для локали сначала `preview`) |
| `npm run lighthouse:mobile` | То же с mobile-пресетом |

Встроенные BiS пишутся в `scripts/bis/bis-list-sources.md` (Titans + community) и `scripts/bis/bis-list-mix.md` (Kingdom. With variants: нумерованное оружие и альтернативы `N-M`).
После правок markdown перегенерируйте TypeScript-пресеты.

### Хранение

| Ключ | Содержимое |
|------|------------|
| `raidwise` | Персонажи, подземелья, переключатели (`schemaVersion` 6) |
| `raidwise-bis-lists` | Выбранные BiS и локальные списки (`schemaVersion` 1; битые записи пропускаются) |
| `raidwise-item-tooltip-locale` | `en` или `ru` (по умолчанию `ru`) |
| `raidwise-color-mode` | Светлая/тёмная тема |
| `raidwise-gear-hint-legend-dismissed` | Скрытая легенда подсказок экипировки над таблицей |

Старые ключи `my-raid-cds*` при первой загрузке копируются в новые и удаляются.

Имена персонажей: при создании — только буквы (Unicode `\p{L}+`); в UI первая буква с заглавной. Старые имена с цифрами/символами по-прежнему загружаются.

Повреждённые данные трекера сбрасываются с алертом.
Старые сейвы мигрируют при загрузке.

### Деплой (кэш и HTTP)

Vite кладёт файлы с хэшем в имени в `assets/` (напр. `/raidwise/assets/index-….js`). Для нормального кэша в Lighthouse на [sergimax.ru/raidwise](https://sergimax.ru/raidwise):

| Путь | Cache-Control | Зачем |
|------|---------------|--------|
| `/raidwise/assets/*` | `public, max-age=31536000, immutable` | Имя файла меняется при каждой сборке |
| `/raidwise/index.html` | `no-cache` или короткий `max-age` (напр. 60) | Клиенты должны подхватывать новые хэши |
| `/raidwise/fonts/*` | `public, max-age=31536000, immutable` | Локальные woff2 |

Также включите **HTTP/2** (или HTTP/3) и **brotli**/**gzip** для JS/CSS/JSON/SVG/woff2.

Пример для Nginx:

```nginx
location /raidwise/assets/ {
  add_header Cache-Control "public, max-age=31536000, immutable";
}
location = /raidwise/index.html {
  add_header Cache-Control "no-cache";
}
location /raidwise/fonts/ {
  add_header Cache-Control "public, max-age=31536000, immutable";
}
```
