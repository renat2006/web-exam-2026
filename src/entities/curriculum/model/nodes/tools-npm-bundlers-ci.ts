import type { SkillNode } from '../types';

// ═══════════════════════════════════════════════
// БЛОК 13: npm, сборщики и CI/CD (Week 04)
// Theory вопросы: #48–63
// ═══════════════════════════════════════════════
export const TOOLS_NPM_BUNDLERS_CI: SkillNode = {
  id: 'tools-npm-bundlers-ci',
  title: 'npm, сборщики и CI/CD',
  category: 'Tools',
  description: 'Node.js, npm-зависимости, Webpack vs Vite, ESLint, Prettier и основы CI/CD с GitLab.',
  iconName: 'Package',
  lessons: [
    {
      id: 'npm-basics',
      title: 'npm: пакетный менеджер',
      xpReward: 10,
      slides: [
        {
          type: 'theory',
          title: 'npm и package.json',
          definition:
            'npm (Node Package Manager) — менеджер пакетов для JavaScript. Управляет зависимостями, версиями и скриптами проекта. package.json — центральный файл конфигурации проекта.',
          comparison: {
            title: 'Ключевые файлы npm-проекта',
            headers: ['Файл', 'Что содержит', 'В Git?'],
            rows: [
              ['package.json', 'Зависимости, скрипты, метаданные проекта', '✅ Да'],
              ['package-lock.json', 'Точные версии всех установленных пакетов', '✅ Да'],
              ['node_modules/', 'Физический код библиотек', '❌ Нет (.gitignore)'],
            ],
          },
          codeExample: `// Основные команды npm
npm init -y                    // Создать package.json
npm install react              // Установить в dependencies
npm install eslint --save-dev  // Установить в devDependencies
npm uninstall react            // Удалить пакет
npm run build                  // Запустить скрипт из package.json
npm ci                         // Чистая установка по package-lock.json (для CI)

// Semver: MAJOR.MINOR.PATCH
// "^18.2.0" → ставит любую 18.x.x (MAJOR фиксирован)
// "~18.2.0" → ставит 18.2.x (MINOR фиксирован)
// "18.2.0"  → строго эта версия`,
          pitfalls: [
            'dependencies — нужны в продакшене (React, Axios). devDependencies — только для разработки (ESLint, Vite, TypeScript).',
            'npm ci ≠ npm install: npm ci строго следует package-lock.json и удаляет node_modules. Используется в CI.',
            'node_modules — в .gitignore. Весит сотни мегабайт.',
          ],
          keyTerms: [
            { term: 'package.json', definition: 'Манифест проекта: зависимости, скрипты, версия, автор' },
            { term: 'dependencies', definition: 'Пакеты, нужные в production (React, Axios)' },
            { term: 'devDependencies', definition: 'Пакеты только для разработки (ESLint, Vite, Jest)' },
            { term: 'Semver', definition: 'Semantic Versioning: MAJOR.MINOR.PATCH — стандарт версионирования' },
            { term: 'npm ci', definition: 'Строгая установка зависимостей по lock-файлу для CI-среды' },
          ],
          mnemonic: 'Semver: MAJOR = сломал обратную совместимость 💥, MINOR = добавил фичу ✨, PATCH = починил баг 🩹. Каретка ^ — держусь за MAJOR, тильда ~ — держусь за MINOR.',
        },
        {
          type: 'theory',
          title: 'Сборщики: Webpack, Vite, Rollup',
          definition:
            'Bundler (сборщик) — инструмент, объединяющий модули (JS, CSS, картинки) в оптимизированный набор файлов для браузера. Выполняет: сборку, минификацию, tree shaking, code splitting.',
          comparison: {
            title: 'Webpack vs Vite vs Rollup',
            headers: ['Инструмент', 'Скорость dev', 'Конфиг', 'Когда выбирать'],
            rows: [
              ['Webpack', '⬛ Медленнее', '⚙️ Сложный', 'Легаси проекты, микрофронтенды, сложная кастомизация'],
              ['Vite', '⚡ Очень быстрый (ESM)', '✅ Минимальный', 'Новые проекты, React/Vue/Svelte — выбор по умолчанию'],
              ['Rollup', '—', '⚙️ Средний', 'Публикация npm-библиотек (маленький бандл)'],
            ],
          },
          codeExample: `// Ключевые концепции Webpack
module.exports = {
entry: './src/main.js',       // точка входа — начало графа модулей
output: { filename: 'bundle.js', path: '/dist' }, // куда класть
module: {
  rules: [
    { test: /\.css$/, use: ['style-loader', 'css-loader'] }, // loader
  ]
},
plugins: [new HtmlWebpackPlugin()] // plugins — мощнее loader'ов
};

// Loaders — преобразуют файлы (CSS → JS, TypeScript → JS)
// Plugins — работают на уровне всей сборки (генерация HTML, очистка dist)

// Tree shaking — автоматически удаляет неиспользуемый код
// import { add } from './math'; // только add попадёт в бандл, не весь math.js

// Code splitting — разбивка бандла на части для lazy loading`,
          pitfalls: [
            'Loaders в Webpack применяются СПРАВА НАЛЕВО в массиве: ["style-loader", "css-loader"] — сначала css-loader, потом style-loader.',
            'Tree shaking работает только с ES-модулями (import/export), не с CommonJS (require).',
            'Vite в dev использует нативные ESM — не собирает бандл. В prod — Rollup.',
          ],
          keyTerms: [
            { term: 'Bundler', definition: 'Инструмент, собирающий модули в оптимизированный набор файлов' },
            { term: 'Entry', definition: 'Точка входа — файл, с которого начинается граф зависимостей' },
            { term: 'Loader', definition: 'Webpack: преобразует файл (TypeScript → JS, CSS → JS-модуль)' },
            { term: 'Plugin', definition: 'Webpack: расширяет сборку (генерация HTML, оптимизация, очистка)' },
            { term: 'Tree shaking', definition: 'Удаление неиспользуемого ("мёртвого") кода из бандла' },
            { term: 'HMR', definition: 'Hot Module Replacement — обновление модуля без перезагрузки страницы' },
            { term: 'Code splitting', definition: 'Разбивка бандла на части для загрузки по мере необходимости' },
          ],
          mnemonic: 'Loader = рабочий 👷 (обрабатывает один файл). Plugin = прораб 👨‍💼 (управляет всей стройкой). Дерево без листьев = Tree shaking: трясём дерево — падают только ненужные листья.',
        },
        {
          type: 'theory',
          title: 'ESLint и Prettier: качество кода',
          definition:
            'ESLint — линтер: анализирует код статически, находит ошибки, плохие практики, нарушения правил. Prettier — форматтер: автоматически приводит код к единому стилю. Они дополняют, а не заменяют друг друга.',
          comparison: {
            title: 'ESLint vs Prettier',
            headers: ['Инструмент', 'Что делает', 'Пример'],
            rows: [
              ['ESLint', 'Находит ошибки и плохой код', 'no-unused-vars, eqeqeq (запрет ==), no-console'],
              ['Prettier', 'Форматирует код (стиль)', 'Заменяет " на \', добавляет точки с запятой, переносит строки'],
            ],
          },
          codeExample: `// Установка
npm install eslint prettier --save-dev

// package.json — npm-скрипты
{
"scripts": {
  "lint": "eslint .",            // найти ошибки
  "lint:fix": "eslint . --fix",  // исправить автоматически
  "format": "prettier . --write" // отформатировать
}
}

// .prettierrc — конфиг форматтера
{
"singleQuote": true,   // одинарные кавычки
"semi": true,          // точки с запятой
"tabWidth": 2,         // 2 пробела
"printWidth": 100      // максимальная длина строки
}

// eslint.config.mjs — конфиг линтера (новый формат)
export default [{ files: ["**/*.js"], rules: { "no-unused-vars": "error" } }]`,
          pitfalls: [
            'ESLint и Prettier могут конфликтовать — установи eslint-config-prettier для отключения правил форматирования ESLint.',
            'Конфиги (.eslintrc, .prettierrc) должны быть в корне проекта.',
            'Линтер работает только при написании кода, не в рантайме — на пользователей не влияет.',
          ],
          keyTerms: [
            { term: 'Линтер (ESLint)', definition: 'Статический анализатор кода — находит ошибки и нарушения правил' },
            { term: 'Форматтер (Prettier)', definition: 'Инструмент приведения кода к единому стилю' },
            { term: 'Статический анализ', definition: 'Анализ кода без его выполнения — находит проблемы на этапе написания' },
            { term: 'AST', definition: 'Abstract Syntax Tree — структура кода, которую строит ESLint для анализа' },
          ],
          mnemonic: 'ESLint = полицейский 👮 (ищет нарушителей). Prettier = уборщик 🧹 (наводит порядок). Оба нужны: один поймал нарушителей, другой — убрал беспорядок.',
        },
        {
          type: 'theory',
          title: 'CI/CD и GitLab Pipeline',
          definition:
            'CI (Continuous Integration) — автоматическая проверка кода при каждом push: сборка, линтинг, тесты. CD (Delivery) — из main всегда можно задеплоить. CD (Deployment) — деплой автоматически. В GitLab всё описывается в .gitlab-ci.yml.',
          diagram: {
            type: 'flow',
            title: 'Типичный frontend CI-пайплайн',
            items: [
              'git push → GitLab запускает пайплайн',
              'Stage: install — npm ci',
              'Stage: test — npm run lint + npm test (параллельно)',
              'Stage: build — npm run build → артефакт dist/',
              'Stage: deploy — деплой на сервер (manual или auto)',
            ],
          },
          codeExample: `# .gitlab-ci.yml — конфиг пайплайна

stages:
- install
- test
- build

default:
image: node:18  # Docker-образ для всех джоб
cache:
  key: \${CI_COMMIT_REF_SLUG}
  paths: [node_modules/]

install_deps:
stage: install
script:
  - npm ci

lint:
stage: test
needs: ["install_deps"]  # ждёт установки зависимостей
script:
  - npm run lint

build:
stage: build
needs: ["install_deps"]
script:
  - npm run build
artifacts:
  paths: [dist/]
  expire_in: 3 days`,
          comparison: {
            title: 'CI vs CD (Delivery) vs CD (Deployment)',
            headers: ['Практика', 'Что делает', 'Ключевой признак'],
            rows: [
              ['CI', 'Автоматически проверяет код при push', 'Линтинг + тесты + сборка на каждый коммит'],
              ['CD Delivery', 'Готовит артефакт для деплоя', 'Деплой — ручной шаг (кнопка)'],
              ['CD Deployment', 'Автоматически деплоит в продакшен', 'Push в main = деплой без участия человека'],
            ],
          },
          pitfalls: [
            'package.json vs .gitlab-ci.yml: package.json описывает скрипты, .gitlab-ci.yml — когда и где их запускать автоматически.',
            'Джобы в одном stage выполняются параллельно, stages — последовательно.',
            'needs: [] позволяет джобе не ждать весь предыдущий stage — только указанные джобы.',
            'Без раннеров пайплайн зависнет в статусе pending.',
          ],
          keyTerms: [
            { term: 'CI', definition: 'Continuous Integration — автоматическая проверка кода при каждом push' },
            { term: 'Pipeline', definition: 'Последовательность стейджей и джоб в CI/CD' },
            { term: 'Stage', definition: 'Этап пайплайна (install, test, build, deploy)' },
            { term: 'Job', definition: 'Конкретная задача: установка, линтинг, сборка' },
            { term: 'Артефакт', definition: 'Результат сборки (dist/), передаваемый между стейджами' },
            { term: 'Runner', definition: 'Исполнитель джоб — процесс, реально запускающий команды' },
          ],
          mnemonic: 'Pipeline = конвейер на заводе 🏭: сырьё (код) → обработка (lint/test) → упаковка (build) → склад/магазин (deploy). Каждый этап (stage) — своя станция. Если одна сломалась — конвейер стоп.',
        },
        // ✅ Theory #50 — точная формулировка
        {
          type: 'multiple-choice',
          question: 'Что такое сборщик модулей (bundler)?',
          options: [
            'Инструмент для автоматического запуска тестов',
            'Инструмент, объединяющий JS/CSS/картинки из отдельных модулей в оптимизированный набор файлов для браузера',
            'Менеджер пакетов, альтернатива npm',
            'Сервер для раздачи статических файлов',
          ],
          correctIndex: 1,
          explanation:
            'Bundler (сборщик модулей) — инструмент, который: (1) строит граф зависимостей из import/require, (2) объединяет все модули в один или несколько файлов, (3) применяет трансформации (TypeScript→JS, CSS→JS), (4) минифицирует и оптимизирует для prod. Примеры: Webpack, Vite (Rollup под капотом), Rollup, Parcel.',
        },
        // ✅ Theory #51 — точная формулировка
        {
          type: 'multiple-choice',
          question: 'Что такое webpack?',
          options: [
            'Менеджер пакетов для Node.js',
            'Статический сборщик модулей: строит граф зависимостей от entry point, трансформирует файлы через loaders и оптимизирует через plugins',
            'Фреймворк для разработки веб-приложений',
            'Инструмент для запуска тестов',
          ],
          correctIndex: 1,
          explanation:
            'Webpack — статический сборщик модулей для JavaScript. Работает так: (1) Берёт точку входа (entry), (2) Строит граф всех зависимостей (import), (3) Применяет loaders для трансформации файлов (css-loader, babel-loader), (4) Применяет plugins для оптимизации (минификация, генерация HTML), (5) Выдаёт бандл в output. Ключевые концепции: entry, output, loaders, plugins, mode.',
        },
        // ✅ Theory #52 — точная формулировка
        {
          type: 'multiple-choice',
          question: 'Что такое точка входа (entry) в webpack?',
          options: [
            'URL по которому доступен dev-сервер webpack',
            'Файл, с которого webpack начинает строить граф зависимостей — отправная точка для сборки',
            'Папка, куда webpack кладёт финальный бандл',
            'Конфигурационный файл webpack.config.js',
          ],
          correctIndex: 1,
          explanation:
            'Entry (точка входа) — файл, с которого webpack начинает анализ. Webpack читает его import-ы, затем import-ы импортированных файлов и так строит полный граф зависимостей. Обычно это src/index.js или src/main.ts. Можно указать несколько entry для разных «точек» (например, отдельный бандл для vendor-библиотек).',
        },
        // ✅ Theory #53 — точная формулировка
        {
          type: 'multiple-choice',
          question: 'Что такое loader в webpack?',
          options: [
            'Плагин для загрузки конфигурации webpack',
            'Трансформатор отдельных файлов: преобразует файл из одного формата в другой (TypeScript→JS, CSS→JS-модуль) до добавления в граф',
            'Менеджер, управляющий порядком загрузки модулей',
            'Инструмент для ленивой загрузки модулей в рантайме',
          ],
          correctIndex: 1,
          explanation:
            'Loader в webpack — функция-трансформер для отдельных файлов. Применяется через rules в конфиге: { test: /\.css$/, use: ["style-loader", "css-loader"] }. Примеры: css-loader (читает CSS), style-loader (вставляет в DOM), babel-loader (ES6→ES5), ts-loader (TypeScript→JS), file-loader (картинки). Loaders применяются справа налево (last-in, first-out).',
        },
        // ✅ Theory #59 — точная формулировка
        {
          type: 'multiple-choice',
          question: 'Как работает Webpack? Какие основные концепции в нём существуют?',
          options: [
            'Webpack запускает JS-файлы в Node.js и склеивает их вывод',
            'Webpack строит граф зависимостей от entry, трансформирует файлы через loaders, оптимизирует через plugins и выдаёт бандл в output. Ключевые концепции: entry, output, loaders, plugins, mode, chunk',
            'Webpack просто копирует файлы в папку dist без обработки',
            'Webpack работает в браузере и собирает модули во время выполнения',
          ],
          correctIndex: 1,
          explanation:
            'Webpack работает так: (1) Entry — точка входа. (2) Граф зависимостей — webpack следует по всем import/require. (3) Loaders — трансформируют файлы (TypeScript→JS, SCSS→CSS). (4) Plugins — работают на уровне всей сборки (HtmlWebpackPlugin, MiniCssExtractPlugin). (5) Output — куда и в каком формате. (6) Mode — development (source maps, быстро) или production (минификация, tree shaking). (7) Chunks — части бандла для code splitting.',
        },
        {
          type: 'multiple-choice',
          question: 'Чем отличаются dependencies от devDependencies в package.json?',
          options: [
            'Нет разницы, просто разные секции для порядка',
            'dependencies нужны только в разработке, devDependencies — в продакшене',
            'dependencies попадают в продакшен-сборку, devDependencies — только для разработки (линтеры, тесты)',
            'devDependencies устанавливаются быстрее',
          ],
          correctIndex: 2,
          explanation:
            'dependencies — библиотеки, нужные в production (React, Axios, lodash). devDependencies — инструменты только для разработки: ESLint, Prettier, Vite, TypeScript, Jest. В production их не нужно устанавливать (npm install --production или npm ci --omit=dev).',
        },
        {
          type: 'multiple-choice',
          question: 'В чём разница между Loader и Plugin в Webpack?',
          options: [
            'Loader быстрее, Plugin медленнее',
            'Loader преобразует отдельные файлы; Plugin работает на уровне всего процесса сборки',
            'Plugin работает с JS, Loader — с CSS',
            'Нет разницы, это синонимы',
          ],
          correctIndex: 1,
          explanation:
            'Loader в Webpack преобразует отдельные файлы перед добавлением в граф модулей: css-loader → читает CSS, babel-loader → компилирует TypeScript/ES6. Plugin расширяет поведение на уровне всей сборки: HtmlWebpackPlugin генерирует index.html, CleanWebpackPlugin очищает dist/ перед сборкой.',
        },
        {
          type: 'multiple-choice',
          question: 'Что такое tree shaking и при каком условии он работает?',
          options: [
            'Удаление комментариев из кода — работает всегда',
            'Удаление неиспользуемого кода из бандла — работает только с ES-модулями (import/export)',
            'Разделение бандла на части — работает с любым модульным кодом',
            'Минификация переменных — требует TypeScript',
          ],
          correctIndex: 1,
          explanation:
            'Tree shaking ("встряхивание дерева") — удаление "мёртвого" кода, который импортируется но не используется. Работает только с ES-модулями (import/export), потому что они статически анализируемы. CommonJS (require) — динамический, анализировать его сложно. Vite и Rollup используют tree shaking по умолчанию.',
        },
        {
          type: 'multiple-choice',
          question: 'Что произойдёт с CI-пайплайном, если стейдж test упал?',
          options: [
            'Пайплайн продолжит выполнение со следующего стейджа',
            'Пайплайн остановится: стейджи build и deploy не запустятся',
            'GitLab автоматически исправит ошибки',
            'Только упавшая джоба помечается как failed, остальные продолжают',
          ],
          correctIndex: 1,
          explanation:
            'Стейджи выполняются последовательно. Если хотя бы одна джоба в стейдже failed — весь пайплайн помечается как failed и следующие стейджи не запускаются. Это ключевая цель CI: не допустить сломанный код в prod.',
        },
        // ✅ Theory #48 — точная формулировка
        {
          type: 'multiple-choice',
          question: 'Что такое npm?',
          options: [
            'Язык программирования для серверной разработки',
            'Node Package Manager — менеджер пакетов для JavaScript: устанавливает библиотеки, управляет зависимостями и запускает скрипты',
            'Инструмент сборки, заменяющий Webpack',
            'База данных для хранения JavaScript-модулей',
          ],
          correctIndex: 1,
          explanation:
            'npm (Node Package Manager) — стандартный менеджер пакетов для JS/Node.js. Три задачи: (1) устанавливать пакеты из реестра npmjs.com (npm install), (2) управлять зависимостями через package.json и package-lock.json, (3) запускать скрипты (npm run build, npm test). Поставляется вместе с Node.js.',
        },
        // ✅ Theory #49 — точная формулировка
        {
          type: 'multiple-choice',
          question: 'В каком файле npm хранит сведения о зависимостях проекта?',
          options: [
            'npm.config.js — конфигурационный файл npm',
            'node_modules/index.json — индекс установленных пакетов',
            'package.json (список зависимостей) и package-lock.json (точные версии)',
            'dependencies.json — специальный файл зависимостей',
          ],
          correctIndex: 2,
          explanation:
            'package.json — основной манифест: хранит dependencies (для prod), devDependencies (для разработки), скрипты, версию проекта. package-lock.json — «слепок»: фиксирует точные версии каждого пакета и его зависимостей. package-lock.json должен быть в Git — он обеспечивает воспроизводимость окружения на всех машинах. node_modules — директория с кодом, в Git НЕ добавляется.',
        },
        // ✅ Theory #54 — точная формулировка
        {
          type: 'multiple-choice',
          question: 'Что такое статический анализ кода?',
          options: [
            'Анализ кода во время его выполнения в браузере',
            'Анализ кода БЕЗ его выполнения — инструмент проверяет синтаксис, типы и правила качества на этапе написания',
            'Анализ производительности сайта через DevTools',
            'Проверка кода только на наличие синтаксических ошибок компилятором',
          ],
          correctIndex: 1,
          explanation:
            'Статический анализ — проверка кода без запуска. Инструменты: ESLint (правила качества: no-unused-vars, eqeqeq), TypeScript (типы), SonarQube. Работают на этапе написания (подсветка в IDE) или в CI-пайплайне. В отличие от динамического анализа — не требуют запуска приложения, не влияют на рантайм.',
        },
        // ✅ Theory #55 — точная формулировка
        {
          type: 'multiple-choice',
          question: 'Где в проекте задаются npm-скрипты?',
          options: [
            'В файле scripts.js в корне проекта',
            'В секции "scripts" файла package.json',
            'В файле .npmrc',
            'В node_modules/.scripts/',
          ],
          correctIndex: 1,
          explanation:
            'npm-скрипты задаются в секции "scripts" файла package.json. Пример: { "scripts": { "dev": "vite", "build": "vite build", "lint": "eslint .", "test": "jest" } }. Запускаются командой npm run <имя>. Специальные скрипты start и test можно запускать без слова run: npm start, npm test.',
        },
        // ✅ Theory #56 — точная формулировка
        {
          type: 'multiple-choice',
          question: 'Какие два режима сборки задаются через mode в webpack?',
          options: [
            'fast и slow',
            'development и production',
            'debug и release',
            'local и remote',
          ],
          correctIndex: 1,
          explanation:
            'Webpack mode: (1) "development" — быстрая сборка, без минификации, с source maps, понятные имена чанков, удобно для отладки. (2) "production" — медленнее, но: минификация (TerserPlugin), tree shaking, оптимизация размера бандла, хэши в именах файлов для кэширования. Задаётся в webpack.config.js: mode: "production" или через --mode production в npm-скрипте.',
        },
        // ✅ Theory #60 — точная формулировка
        {
          type: 'multiple-choice',
          question: 'Какие преимущества даёт Vite перед webpack в современном React-проекте?',
          options: [
            'Vite поддерживает больше плагинов и лучше для легаси-проектов',
            'Vite использует нативные ESM в dev-режиме (не собирает бандл) → мгновенный старт; HMR быстрее; минимальный конфиг; в prod — Rollup',
            'Vite быстрее только в production, в разработке они одинаковые',
            'Vite — просто обёртка над Webpack с другим синтаксисом конфига',
          ],
          correctIndex: 1,
          explanation:
            'Преимущества Vite над Webpack: (1) Dev-сервер на нативных ESM — браузер сам разрешает модули, бандл не нужен → старт за <300мс vs секунды у Webpack. (2) HMR почти мгновенный — обновляет только изменённый модуль. (3) Минимальный конфиг из коробки. (4) Prod-сборка через Rollup — отличный tree shaking. Webpack лучше для легаси-проектов и сложных кастомных конфигураций.',
        },
        // ✅ Theory #61 — точная формулировка
        {
          type: 'multiple-choice',
          question: 'Как объявить и запустить npm-скрипты?',
          options: [
            'Создать файл run.js и запустить node run.js',
            'Объявить в секции scripts в package.json, запустить командой npm run <имя>',
            'Добавить в .bashrc и запускать из терминала напрямую',
            'Прописать в webpack.config.js в секции scripts',
          ],
          correctIndex: 1,
          explanation:
            'Объявляем в package.json: { "scripts": { "build": "vite build" } }. Запускаем: npm run build. npm находит скрипт build → выполняет команду vite build. Скрипты start и test запускаются без run: npm start. В скриптах доступны все пакеты из node_modules/.bin — не нужно писать полный путь.',
        },
        // ✅ Theory #62 — точная формулировка
        {
          type: 'multiple-choice',
          question: 'Какие инструменты вы используете, чтобы найти недостатки в производительности вашего кода?',
          options: [
            'Только console.log и визуальное наблюдение',
            'DevTools → вкладка Performance (запись профиля, Long Tasks, FCP/LCP), Lighthouse (аудит), Coverage (неиспользуемый код), ESLint (статика)',
            'Только Webpack Bundle Analyzer для анализа размера бандла',
            'Производительность кода нельзя измерить инструментами — только нагрузочным тестированием',
          ],
          correctIndex: 1,
          explanation:
            'Инструменты анализа производительности: (1) DevTools → Performance: запись профиля, поиск Long Tasks (>50мс блокируют UI), тайминги FCP/LCP/DCL. (2) DevTools → Coverage: показывает % неиспользованного JS/CSS. (3) Lighthouse: аудит по Core Web Vitals, даёт рекомендации. (4) Webpack Bundle Analyzer: визуализация размера бандла. (5) ESLint: статический анализ плохих практик.',
        },
        // ✅ Theory #63 — точная формулировка
        {
          type: 'multiple-choice',
          question: 'Объясните разницу между раскладкой (layout), painting и композитингом (compositing).',
          options: [
            'Это три разных браузера, каждый использует свой способ отрисовки',
            'Layout — вычисление позиций/размеров элементов; Painting — отрисовка пикселей (цвет, тени); Compositing — объединение слоёв в финальное изображение',
            'Layout = HTML, Painting = CSS, Compositing = JavaScript',
            'Это три фазы загрузки сети, не рендеринга',
          ],
          correctIndex: 1,
          explanation:
            '3 этапа пиксельного пайплайна браузера: (1) Layout (Reflow) — вычисляет геометрию: где элемент, какой его размер. Самый дорогой. Триггерят: изменение width/height/margin/top. (2) Paint — рисует пиксели: цвет фона, тень, текст. Дешевле layout. Триггерят: color, box-shadow, background. (3) Composite — собирает слои (GPU). Самый дешёвый. transform и opacity работают только на этом этапе → используй их для плавных анимаций.',
        },
      ],
    },
  ],
};
