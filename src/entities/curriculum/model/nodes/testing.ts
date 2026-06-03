import type { SkillNode } from '../types';

export const TESTING: SkillNode = {
  id: 'testing',
  title: 'Тестирование веб-приложений',
  category: 'Testing',
  description: 'Jest, React Testing Library, Cypress, моки, unit/E2E тесты, snapshot-тестирование, CI, покрытие кода.',
  iconName: 'CheckCircle',
  lessons: [
    {
      id: 'testing-basics',
      title: 'Jest и React Testing Library',
      xpReward: 10,
      slides: [
        // ✅ Theory #172 — Что такое React Testing Library?
        {
          type: 'theory',
          title: 'React Testing Library',
          definition:
            'React Testing Library (RTL) — библиотека для тестирования React-компонентов с фокусом на пользовательском поведении, а не на деталях реализации. Принцип: «тестируй так, как пользователь взаимодействует с приложением».',
          codeExample: `import { render, screen } from '@testing-library/react';

test('renders city and temperature', () => {
  render(<WeatherWidget city="Москва" temp={20} />);
  expect(screen.getByText('Москва: 20°C')).toBeInTheDocument();
});`,
          keyTerms: [
            { term: 'render()', definition: 'Рендерит React-компонент в виртуальный DOM для тестирования' },
            { term: 'screen', definition: 'Объект с queries для поиска элементов: getByText, getByRole, queryByText и т.д.' },
            { term: 'fireEvent / userEvent', definition: 'Симуляция пользовательских действий: клик, ввод текста, фокус' },
          ],
          pitfalls: [
            'RTL тестирует ПОВЕДЕНИЕ (что видит/делает пользователь), а не реализацию (state, внутренние переменные).',
            'Предпочитай getByRole/getByText вместо getByTestId — ближе к реальному использованию.',
            'RTL работает поверх Jest/Vitest — Jest запускает тесты, RTL предоставляет API для рендера компонентов.',
          ],
        },
        {
          type: 'multiple-choice',
          question: 'Что такое React Testing Library?',
          options: [
            'React Testing Library — фреймворк для E2E-тестирования в реальном браузере',
            'React Testing Library — библиотека для тестирования React-компонентов с фокусом на пользовательском поведении. Рендерит компонент (render), ищет элементы как пользователь (getByText, getByRole), симулирует действия (fireEvent/userEvent). Работает поверх Jest/Vitest',
            'React Testing Library — это инструмент для визуального сравнения скриншотов',
            'React Testing Library — замена React DevTools для отладки',
          ],
          correctIndex: 1,
          explanation: 'RTL = тестирование с точки зрения пользователя. render(<Button />) → рендерит в виртуальный DOM. screen.getByText("Submit") → ищет по тексту (как пользователь). fireEvent.click(button) → симулирует клик. expect(element).toBeInTheDocument() → проверяет наличие. Философия: тестируй ЧТО видит/делает пользователь, а не КАК компонент устроен внутри. Работает в связке с Jest (runner + assertions).',
        },
        // ✅ Theory #173 — Что такое Jest?
        {
          type: 'multiple-choice',
          question: 'Что такое Jest и зачем он используется в тестировании JavaScript?',
          options: [
            'Jest — это линтер для проверки стиля кода',
            'Jest — фреймворк для тестирования JavaScript/TypeScript. Включает: test runner (запуск тестов), assertions (expect/toBe/toEqual), моки (jest.fn, jest.mock), покрытие кода (--coverage), snapshot-тесты. Всё в одном пакете — не нужно устанавливать отдельные библиотеки',
            'Jest — это сборщик модулей, аналог Webpack',
            'Jest — это инструмент для деплоя JavaScript-приложений',
          ],
          correctIndex: 1,
          explanation: 'Jest — all-in-one тестовый фреймворк от Meta. Включает: (1) test runner — находит и запускает .test.js файлы, (2) assertions — expect(value).toBe(42), toEqual, toContain, toThrow, (3) моки — jest.fn(), jest.mock(), jest.spyOn(), (4) покрытие — jest --coverage (строки, ветки, функции), (5) snapshot — toMatchSnapshot(). Альтернатива: Vitest (быстрее, совместим с Vite). Структура теста: describe("модуль", () => { test("что делает", () => { expect(result).toBe(expected) }) }).',
        },
        // ✅ Theory #174 — Что такое моки (mocks) в Jest?
        {
          type: 'theory',
          title: 'Моки (mocks) в Jest',
          definition:
            'Мок — фиктивная реализация зависимости, которая подменяет реальный код в тестах. Позволяет изолировать тестируемый модуль от внешних зависимостей (API, БД, таймеры) и проверять взаимодействие.',
          comparison: {
            title: 'Типы тестовых заглушек',
            headers: ['Тип', 'Назначение', 'Пример'],
            rows: [
              ['Стаб (Stub)', 'Возвращает фиксированные данные', 'getUser: () => ({id: 1, name: "John"})'],
              ['Мок (Mock)', 'Проверяет вызовы (сколько раз, с чем)', 'expect(save).toHaveBeenCalledWith(data)'],
              ['Шпион (Spy)', 'Следит за вызовами реального метода', 'jest.spyOn(obj, "method")'],
              ['Фейк (Fake)', 'Упрощённая рабочая реализация', 'In-memory БД вместо реальной'],
            ],
          },
          codeExample: `// Мок fetch для изоляции от API:
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ temp: 20, city: 'Москва' }),
  })
);

// Проверка взаимодействия:
expect(fetch).toHaveBeenCalledWith('/api/weather?city=Москва');`,
        },
        {
          type: 'multiple-choice',
          question: 'Что такое моки (mocks) в Jest?',
          options: [
            'Моки — реальные данные из production-базы данных',
            'Моки — фиктивные реализации зависимостей. jest.fn() создаёт мок-функцию, jest.mock("module") подменяет модуль. Позволяют: (1) изолировать тест от API/БД, (2) контролировать возвращаемые данные (mockReturnValue), (3) проверять вызовы (toHaveBeenCalledWith). Типы: стаб (данные), мок (проверка вызовов), шпион (spy)',
            'Моки — это CSS-стили для тестовых компонентов',
            'Моки — это скриншоты интерфейса для визуального сравнения',
          ],
          correctIndex: 1,
          explanation: 'jest.fn() — создаёт пустую мок-функцию, можно задать поведение: mockFn.mockReturnValue(42), mockFn.mockResolvedValue(data). jest.mock("./api") — подменяет весь модуль. jest.spyOn(obj, "method") — следит за реальным методом. Зачем: unit-тест должен быть изолирован — не зависеть от API, БД, сети, времени. Мок-функции запоминают вызовы: mockFn.mock.calls, mockFn.mock.results.',
        },
      ],
    },
    {
      id: 'testing-ci-cypress',
      title: 'CI, Cypress, виды тестов',
      xpReward: 10,
      slides: [
        // ✅ Theory #175 — Что такое тестирование в непрерывной интеграции (CI)?
        {
          type: 'multiple-choice',
          question: 'Что такое тестирование в непрерывной интеграции (CI)?',
          options: [
            'CI — это ручное тестирование перед каждым релизом',
            'CI (Continuous Integration) — практика автоматического запуска тестов при каждом коммите/пуше/PR. Тесты прогоняются на CI-сервере (GitHub Actions, GitLab CI, Jenkins). Если тесты упали — PR не мёрджится. Гарантирует: код в main-ветке всегда работает, регрессии ловятся сразу',
            'CI — это фреймворк для написания тестов, аналог Jest',
            'CI — это ручная проверка кода перед деплоем',
          ],
          correctIndex: 1,
          explanation: 'CI автоматизирует: (1) при push/PR запускается pipeline, (2) устанавливаются зависимости (npm ci), (3) прогоняются линтеры, типы, тесты, (4) если что-то упало — PR блокируется, автор видит ошибку. Инструменты: GitHub Actions (yaml-конфиги), GitLab CI, Jenkins, CircleCI. Типичный pipeline: lint → type-check → unit tests → integration tests → build. Тесты в CI = регрессионная защита: каждое изменение проверяется автоматически.',
        },
        // ✅ Theory #176 — Что такое Cypress?
        {
          type: 'multiple-choice',
          question: 'Что такое Cypress?',
          options: [
            'Cypress — это фреймворк для модульного (unit) тестирования',
            'Cypress — фреймворк для E2E-тестирования веб-приложений. Запускает реальный браузер, имитирует действия пользователя (клики, ввод, навигация), проверяет результат. Особенности: автоматические ожидания (не нужны sleep/waitFor), time-travel отладка, скриншоты/видео при падении',
            'Cypress — это CSS-фреймворк для стилизации компонентов',
            'Cypress — это инструмент для деплоя на сервер',
          ],
          correctIndex: 1,
          explanation: 'Cypress запускает реальный браузер (Chromium/Firefox) и выполняет сценарии: cy.visit("/login") → cy.get("#email").type("user@mail.com") → cy.get("button").click() → cy.contains("Добро пожаловать").should("exist"). Плюсы: автоматические retry (ждёт элемент до таймаута), time-travel (можно «отмотать» каждый шаг), скриншоты/видео при падении. Минус: медленнее unit-тестов, хрупкие при изменениях UI. Альтернатива: Playwright (от Microsoft).',
        },
        // ✅ Theory #177 — Как тестируют React-приложения?
        {
          type: 'multiple-choice',
          question: 'Как тестируют React-приложения?',
          options: [
            'React-приложения тестируют только вручную в браузере',
            'Пирамида тестов: (1) Unit — Jest/Vitest для функций, хуков, утилит (основа, быстрые), (2) Компонентные — React Testing Library для рендера компонентов и проверки поведения, (3) Интеграционные — проверка связки компонентов + мок API (Playwright с page.route), (4) E2E — Cypress/Playwright в реальном браузере (вершина, медленные). Большинство тестов — unit и компонентные',
            'React тестируется только через console.log и debugger',
            'Для React используется только Cypress для всех видов тестов',
          ],
          correctIndex: 1,
          explanation: 'Пирамида тестирования React: Unit (основа) — Jest/Vitest: тестируем функции, хуки, утилиты, reducers. Быстрые, дешёвые, много. Компонентные — RTL: render(<Component />), проверяем рендер, события, props. Интеграционные — связка компонентов + мок API, или Playwright с page.route(). E2E (вершина) — Cypress/Playwright: реальный браузер, реальный backend. Медленные, хрупкие, мало. Принцип: чем ниже уровень, тем больше тестов.',
        },
        // ✅ Theory #178 — Какую роль играют queries в React Testing Library?
        {
          type: 'multiple-choice',
          question: 'Какую роль играют queries в React Testing Library?',
          options: [
            'Queries — это SQL-запросы к базе данных компонента',
            'Queries — методы поиска DOM-элементов в RTL. getByRole/getByText — находят элемент (бросают ошибку если нет), queryByText — возвращает null если нет (для проверки отсутствия), findByText — async, ждёт появления. Приоритет: getByRole → getByText → getByTestId (последний — крайний случай)',
            'Queries — это хуки React для запросов к серверу',
            'Queries — это CSS-селекторы для стилизации тестовых компонентов',
          ],
          correctIndex: 1,
          explanation: 'Queries в RTL — способы найти DOM-элемент: (1) getBy* — синхронный, бросает ошибку если нет → для обязательных элементов. (2) queryBy* — синхронный, возвращает null → для проверки отсутствия: expect(queryByText("Error")).toBeNull(). (3) findBy* — async (await), ждёт появления → для элементов после загрузки. Приоритет поиска: getByRole("button") → getByText("Submit") → getByPlaceholderText → getByTestId("submit-btn") (крайний случай). Философия: ищи как пользователь — по роли и тексту.',
        },
      ],
    },
    {
      id: 'testing-advanced',
      title: 'Продвинутое тестирование',
      xpReward: 10,
      slides: [
        // ✅ Theory #179 — beforeEach и afterEach
        {
          type: 'multiple-choice',
          question: 'Для чего в Jest нужны `beforeEach` и `afterEach`? Приведите пример.',
          options: [
            'beforeEach и afterEach — это хуки React для тестирования',
            'beforeEach выполняется ПЕРЕД каждым тестом (подготовка: создание экземпляров, моков, очистка). afterEach — ПОСЛЕ каждого теста (очистка: сброс моков, таймеров). Гарантируют изоляцию тестов друг от друга. Пример: beforeEach(() => jest.clearAllMocks()), afterEach(() => jest.restoreAllMocks())',
            'beforeEach запускает тесты параллельно, afterEach — последовательно',
            'beforeEach и afterEach — аналоги try/catch для тестов',
          ],
          correctIndex: 1,
          explanation: 'beforeEach(() => { service = new UserService(mockStore); }) — перед каждым тестом создаётся свежий экземпляр. afterEach(() => { jest.clearAllMocks(); }) — после каждого теста очищаются счётчики вызовов моков. Также: beforeAll/afterAll — перед/после ВСЕХ тестов в describe (для дорогих операций). Зачем: тесты не должны влиять друг на друга. Если test1 изменил state мока, test2 должен получить чистый мок.',
        },
        // ✅ Theory #180 — В чём разница между юнит- и E2E-тестами?
        {
          type: 'multiple-choice',
          question: 'В чём разница между юнит- и E2E-тестами?',
          options: [
            'Нет разницы — это одно и то же с разными названиями',
            'Unit: тестируют одну функцию/модуль в изоляции, быстрые (мс), пишут разработчики, Jest/Vitest. E2E: тестируют всю систему в реальном браузере (как пользователь), медленные (сек/мин), хрупкие, Cypress/Playwright. Unit — основа пирамиды (много), E2E — вершина (мало)',
            'Unit-тесты запускаются в браузере, E2E — в терминале',
            'E2E-тесты быстрее unit-тестов, потому что тестируют всё сразу',
          ],
          correctIndex: 1,
          explanation: 'Unit: изолированный модуль, моки для зависимостей, мс на тест, тысячи тестов, ловят ошибки в логике. E2E: реальный браузер + реальный/мок backend, сек-минуты на тест, десятки тестов, ловят ошибки интеграции. Пирамида: unit (основа, 70%) → компонентные (20%) → E2E (вершина, 10%). E2E хрупкие: изменился CSS-класс или текст кнопки → тест падает. Unit устойчивы: тестируют логику, не UI.',
        },
        // ✅ Theory #181 — Что такое snapshot-тестирование?
        {
          type: 'multiple-choice',
          question: 'Что такое снимочное (snapshot) тестирование в React?',
          options: [
            'Snapshot — это скриншот страницы в браузере',
            'Snapshot-тестирование: React-компонент рендерится → результат (HTML/JSON) сохраняется в .snap файл. При следующем запуске результат сравнивается с сохранённым. Если отличается — тест падает. Разработчик решает: обновить snapshot (jest --updateSnapshot) или исправить баг',
            'Snapshot — это бэкап базы данных для тестов',
            'Snapshot — это мок-данные для API-запросов',
          ],
          correctIndex: 1,
          explanation: 'Snapshot-тест: expect(render(<Button />)).toMatchSnapshot(). Первый запуск → создаёт __snapshots__/Button.test.js.snap с HTML-разметкой. Следующие запуски → сравнивает текущий рендер с сохранённым. Если отличается → тест падает → разработчик смотрит diff и решает: jest -u (обновить) если изменение намеренное, или исправить баг. Плюсы: ловит непреднамеренные изменения UI. Минусы: snap-файлы быстро устаревают, шумные diff-ы, false positives.',
        },
        // ✅ Theory #182 — Как замокать вызов API в тесте React-компонента?
        {
          type: 'multiple-choice',
          question: 'Как замокать вызов API в тесте React-компонента?',
          options: [
            'Нельзя замокать API — нужен реальный сервер',
            'Способы: (1) jest.mock("./api") — подменить модуль с API-функциями, задать mockResolvedValue, (2) global.fetch = jest.fn() — подменить fetch напрямую, (3) msw (Mock Service Worker) — перехватывает запросы на уровне сети, (4) Playwright: page.route() для перехвата в интеграционных тестах',
            'Достаточно отключить интернет во время тестов',
            'Моки API нужны только для E2E-тестов, в unit-тестах API не мокают',
          ],
          correctIndex: 1,
          explanation: 'Подходы: (1) jest.mock("./api/tasksApi"): import { getTasks } from "./api/tasksApi"; getTasks.mockResolvedValue([{id:1, title:"Test"}]). (2) global.fetch = jest.fn(() => Promise.resolve({ok: true, json: () => Promise.resolve(data)})). (3) MSW (Mock Service Worker) — создаёт перехватчик: rest.get("/api/tasks", (req, res, ctx) => res(ctx.json(mockData))). MSW популярен, так как не зависит от реализации (fetch/axios). (4) В Playwright: page.route("**/api/**", route => route.fulfill({json: mockData})).',
        },
        // ✅ Theory #183 — Является ли покрытие кода на 100% хорошим показателем?
        {
          type: 'multiple-choice',
          question: 'Является ли покрытие кода на 100% хорошим показателем?',
          options: [
            'Да, 100% покрытие гарантирует отсутствие багов',
            'Нет. 100% покрытие ≠ 100% качество. Покрытие показывает, какие СТРОКИ выполнялись, но не проверяет: правильность логики, граничные случаи, пользовательские сценарии. Можно иметь 100% покрытие с бесполезными тестами. Разумная цель: 70-80% с фокусом на бизнес-логику и критические пути',
            'Покрытие кода не имеет значения — важно только количество тестов',
            '100% покрытие невозможно технически — максимум 50%',
          ],
          correctIndex: 1,
          explanation: '100% coverage может быть обманчивым: тест вызывает функцию, но не проверяет результат → строка «покрыта», но баг не пойман. Покрытие — метрика, не цель. Хорошая практика: 70-80% покрытия, фокус на бизнес-логику (скидки, авторизация, формулы), критические пути (оплата, регистрация), граничные случаи (null, пустая строка, отрицательные числа). Погоня за 100% приводит к: тестированию тривиального кода (геттеры/сеттеры), хрупким тестам, потере времени.',
        },
        // ✅ Theory #184 — 2000 E2E-тестов на Cypress, 45 минут в CI
        {
          type: 'multiple-choice',
          question: 'У команды 2000 E2E-тестов на Cypress, прогон в CI занимает 45 минут, разработчики перестали запускать тесты локально. Что вы будете делать?',
          options: [
            'Удалить все тесты и писать код без тестирования',
            'Стратегия: (1) перевести часть тестов в unit/компонентные (пирамида — E2E должно быть мало), (2) параллелизация: Cypress Dashboard/Playwright sharding для запуска на нескольких машинах, (3) приоритизация: smoke-тесты при каждом PR, полный прогон — ночью/на main, (4) удалить дублирующиеся и хрупкие тесты, (5) заменить E2E с реальным API на интеграционные с моками',
            'Увеличить timeout в CI до 2 часов',
            'Перейти с Cypress на Jest — он быстрее',
          ],
          correctIndex: 1,
          explanation: '2000 E2E на Cypress — нарушение пирамиды тестирования (слишком много наверху). Решения: (1) Перевести 70% в unit/компонентные — проверяют ту же логику за мс, а не минуты. (2) Параллелизация: Cypress Cloud или Playwright sharding — распределить тесты на N машин. (3) Smoke vs Full: быстрый набор критических тестов при PR, полный прогон ночью. (4) Удалить дублирующие: если unit-тест покрывает ту же логику → E2E не нужен. (5) Мокировать API в интеграционных тестах — быстрее, стабильнее.',
        },
      ],
    },
  ],
};
