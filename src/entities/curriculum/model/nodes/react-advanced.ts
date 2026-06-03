import type { SkillNode } from '../types';

// ═══════════════════════════════════════════════
// БЛОК: Продвинутый React (вопросы #142-158)
// ═══════════════════════════════════════════════
export const REACT_ADVANCED: SkillNode = {
  id: 'react-advanced',
  title: 'React: оптимизация и Redux',
  category: 'React',
  description: 'useCallback, useMemo, React.memo, Context API, Error Boundaries, Redux Toolkit, createSlice, createAsyncThunk.',
  iconName: 'Zap',
  lessons: [
    // ─── Урок 1: useCallback и useMemo ───
    {
      id: 'react-memoization',
      title: 'useCallback и useMemo',
      xpReward: 10,
      slides: [
        // ✅ Theory #142 — Что такое useCallback и когда его использовать?
        {
          type: 'theory',
          title: 'Хук useCallback',
          definition:
            'useCallback — хук, который сохраняет (мемоизирует) функцию между рендерами. Если зависимости не изменились, React возвращает ту же ссылку на функцию, а не создаёт новую.',
          codeExample: `// Без useCallback — новая функция при каждом рендере:
const handleClick = () => console.log(count);

// С useCallback — функция пересоздаётся только при смене count:
const handleClick = useCallback(() => {
  console.log(count);
}, [count]);`,
          pitfalls: [
            'useCallback полезен когда функция передаётся в мемоизированный компонент (React.memo) — без стабильной ссылки memo бесполезен.',
            'useCallback сам по себе НЕ ускоряет компонент — он нужен, чтобы React.memo мог корректно сравнить props.',
            'Если функция используется только внутри компонента и никуда не передаётся — useCallback не нужен.',
            'Массив зависимостей работает так же, как у useEffect: если зависимость изменилась — функция пересоздаётся.',
          ],
        },
        {
          type: 'multiple-choice',
          // ✅ Theory #142
          question: 'Что такое хук `useCallback` в React и когда его использовать?',
          options: [
            'useCallback ускоряет выполнение функции, кешируя её результат',
            'useCallback мемоизирует функцию, сохраняя стабильную ссылку между рендерами. Использовать: (1) при передаче функции в React.memo-компонент, (2) когда функция в зависимостях useEffect, (3) при возврате функций из кастомных хуков',
            'useCallback — это замена addEventListener в React',
            'useCallback нужен для всех функций в React без исключения',
          ],
          correctIndex: 1,
          explanation: 'useCallback(fn, [deps]) — возвращает мемоизированную функцию. Без него: каждый рендер создаёт новую функцию → новая ссылка → React.memo считает props изменившимися → лишний ререндер. С useCallback: если deps не изменились → та же ссылка → React.memo пропускает ререндер. Не нужен, если функция не передаётся в дочерние компоненты.',
        },
        // ✅ Theory #143 — Что такое useMemo и когда его использовать?
        {
          type: 'theory',
          title: 'Хук useMemo',
          definition:
            'useMemo — хук, который мемоизирует результат вычисления. Если зависимости не изменились, React возвращает закешированное значение, не выполняя функцию повторно.',
          codeExample: `// Без useMemo — фильтрация при каждом рендере:
const activeUsers = users.filter(u => u.active);

// С useMemo — фильтрация только при изменении users:
const activeUsers = useMemo(() => {
  return users.filter(u => u.active);
}, [users]);`,
          pitfalls: [
            'useMemo полезен для дорогих вычислений: фильтрация, сортировка, маппинг больших массивов.',
            'Для простых вычислений useMemo не нужен — overhead на мемоизацию может быть дороже самого вычисления.',
            'useMemo также стабилизирует ссылку на объект/массив — полезно для props и зависимостей useEffect.',
          ],
        },
        {
          type: 'multiple-choice',
          // ✅ Theory #143
          question: 'Что такое хук `useMemo` в React и когда его использовать?',
          options: [
            'useMemo сохраняет функцию между рендерами, чтобы не создавать её заново',
            'useMemo мемоизирует результат вычисления. Если зависимости не изменились, React возвращает закешированное значение. Использовать для дорогих вычислений (фильтрация, сортировка), стабилизации ссылок на объекты/массивы',
            'useMemo — это аналог localStorage для хранения данных между сессиями',
            'useMemo нужен для каждой переменной в компоненте',
          ],
          correctIndex: 1,
          explanation: 'useMemo(fn, [deps]) — выполняет fn и кеширует результат. При следующем рендере: если deps не изменились → возвращает закешированное значение. Применять для: (1) дорогих вычислений (filter/sort больших массивов), (2) стабилизации ссылок на объекты/массивы, чтобы React.memo и useEffect работали корректно.',
        },
        // ✅ Theory #147 — Чем useMemo отличается от useCallback?
        {
          type: 'multiple-choice',
          // ✅ Theory #147
          question: 'Чем `useMemo` отличается от `useCallback`?',
          options: [
            'Нет разницы — это синонимы',
            'useMemo мемоизирует РЕЗУЛЬТАТ вычисления (возвращает значение), useCallback мемоизирует САМУ ФУНКЦИЮ (возвращает функцию). useCallback(fn, deps) ≡ useMemo(() => fn, deps)',
            'useMemo для объектов, useCallback для массивов',
            'useMemo работает синхронно, useCallback — асинхронно',
          ],
          correctIndex: 1,
          explanation: 'useMemo(() => compute(), [deps]) — вызывает compute() и кеширует РЕЗУЛЬТАТ. useCallback(fn, [deps]) — кеширует САМУ ФУНКЦИЮ fn. По сути useCallback(fn, deps) — это сокращение для useMemo(() => fn, deps). React.memo — мемоизация компонента, useCallback — мемоизация функции, useMemo — мемоизация значения.',
        },
        // ✅ Theory #153 — Предотвращает ли useMemo повторный рендер дочерних компонентов?
        {
          type: 'multiple-choice',
          // ✅ Theory #153
          question: 'Предотвращает ли `useMemo` повторный рендер дочерних компонентов?',
          options: [
            'Да, useMemo автоматически предотвращает ререндер всех дочерних компонентов',
            'useMemo сам по себе НЕ предотвращает ререндер. Он стабилизирует ссылку на значение. Чтобы предотвратить ререндер, дочерний компонент должен быть обёрнут в React.memo — тогда стабильная ссылка от useMemo позволит memo пропустить ререндер',
            'useMemo предотвращает ререндер только для примитивных props',
            'useMemo и React.memo — это одно и то же',
          ],
          correctIndex: 1,
          explanation: 'useMemo стабилизирует ссылку, но не влияет на ререндер напрямую. Без React.memo дочерний компонент ререндерится при любом ререндере родителя, даже если props те же. Связка: useMemo (стабильная ссылка) + React.memo (пропуск ререндера если props не изменились) = оптимизация.',
        },
      ],
    },
    // ─── Урок 2: Redux Toolkit ───
    {
      id: 'react-redux-toolkit',
      title: 'Redux Toolkit',
      xpReward: 10,
      slides: [
        // ✅ Theory #144 — Что такое Redux Toolkit?
        {
          type: 'theory',
          title: 'Redux Toolkit',
          definition:
            'Redux Toolkit (RTK) — официально рекомендуемый способ использования Redux. Это набор утилит, упрощающих настройку store, создание reducers и actions, работу с асинхронными запросами.',
          keyTerms: [
            { term: 'Store', definition: 'Единое хранилище всего состояния приложения' },
            { term: 'Action', definition: 'Объект {type, payload}, описывающий событие в приложении' },
            { term: 'Reducer', definition: 'Чистая функция (state, action) → newState, определяющая как меняется состояние' },
            { term: 'Dispatch', definition: 'Функция для отправки action в store' },
            { term: 'Slice', definition: 'Часть состояния + reducers + actions, объединённые в одном месте' },
          ],
          diagram: {
            type: 'flow',
            title: 'Поток данных в Redux',
            items: [
              'Компонент вызывает dispatch(action)',
              'Action попадает в reducer',
              'Reducer возвращает новое состояние',
              'Store обновляется',
              'React перерисовывает подписанные компоненты',
            ],
          },
        },
        {
          type: 'multiple-choice',
          // ✅ Theory #144
          question: 'Что такое Redux Toolkit?',
          options: [
            'Redux Toolkit — это отдельный фреймворк, не связанный с Redux',
            'Redux Toolkit — официально рекомендуемый способ использования Redux. Упрощает: configureStore (создание store), createSlice (объединение actions + reducers), createAsyncThunk (асинхронные операции). Решает проблемы классического Redux: много шаблонного кода, сложная настройка',
            'Redux Toolkit — это Context API с другим названием',
            'Redux Toolkit нужен только для серверного рендеринга',
          ],
          correctIndex: 1,
          explanation: 'Redux Toolkit = обёртка над Redux, убирающая бойлерплейт. Классический Redux: вручную писать action types, action creators, reducers с switch/case, настраивать middleware. RTK: configureStore — настройка за 3 строки, createSlice — actions + reducers в одном объекте, createAsyncThunk — асинхронные запросы с pending/fulfilled/rejected.',
        },
        // ✅ Theory #145 — Что такое createSlice?
        {
          type: 'multiple-choice',
          // ✅ Theory #145
          question: 'Что такое `createSlice`?',
          options: [
            'createSlice — это функция для создания React-компонентов',
            'createSlice — функция RTK, объединяющая name, initialState и reducers в одном объекте. Автоматически генерирует action creators и action types. Позволяет «мутировать» state напрямую (Immer под капотом создаёт новый объект)',
            'createSlice — это аналог useState для Redux',
            'createSlice — это middleware для обработки HTTP-запросов',
          ],
          correctIndex: 1,
          explanation: 'createSlice({ name: "counter", initialState: {value: 0}, reducers: { increment(state) { state.value++ } } }) — создаёт slice. Внутри reducers можно «мутировать» state (state.value++) — это безопасно благодаря библиотеке Immer, которая под капотом создаёт иммутабельную копию. RTK автоматически генерирует counterSlice.actions.increment() и counterSlice.reducer.',
        },
        // ✅ Theory #146 — Как настроить store с помощью Redux Toolkit?
        {
          type: 'multiple-choice',
          // ✅ Theory #146
          question: 'Как настроить store с помощью Redux Toolkit?',
          options: [
            'Нужно вручную создать createStore, подключить thunk middleware и devtools',
            'configureStore({ reducer: { counter: counterReducer, user: userReducer } }) — автоматически настраивает store с middleware (thunk), DevTools и объединяет reducers. Затем обернуть приложение в <Provider store={store}>',
            'Store создаётся через new Redux.Store()',
            'Store настраивается в package.json',
          ],
          correctIndex: 1,
          explanation: 'configureStore из RTK: (1) принимает объект с reducer (ключ → reducer), (2) автоматически добавляет thunk middleware для async, (3) подключает Redux DevTools, (4) включает проверки на мутации. Подключение к React: <Provider store={store}><App /></Provider>. Компоненты: useSelector(state => state.counter.value) — чтение, useDispatch() — отправка actions.',
        },
        // ✅ Theory #151 — Что такое createAsyncThunk?
        {
          type: 'multiple-choice',
          // ✅ Theory #151
          question: 'Что такое `createAsyncThunk`?',
          options: [
            'createAsyncThunk — это замена fetch для HTTP-запросов',
            'createAsyncThunk — функция RTK для создания асинхронных action creators. Автоматически генерирует три action: pending (запрос начат), fulfilled (успех), rejected (ошибка). Обрабатываются в extraReducers слайса',
            'createAsyncThunk — это хук React для работы с промисами',
            'createAsyncThunk — это middleware, которое перехватывает все actions',
          ],
          correctIndex: 1,
          explanation: 'createAsyncThunk("users/fetch", async () => { const r = await fetch("/api/users"); return r.json(); }) — создаёт thunk. При dispatch(fetchUsers()): (1) dispatch pending → можно показать loading, (2) выполняет async-функцию, (3) dispatch fulfilled с данными или rejected с ошибкой. В слайсе обрабатывается в extraReducers: builder.addCase(fetchUsers.pending, ...).addCase(fetchUsers.fulfilled, ...).',
        },
        // ✅ Theory #152 — Зачем использовать RTK вместо голого Redux?
        {
          type: 'multiple-choice',
          // ✅ Theory #152
          question: 'Зачем использовать Redux Toolkit вместо «голого» Redux?',
          options: [
            'RTK быстрее работает в рантайме — Redux медленный',
            'RTK убирает бойлерплейт: не нужно вручную писать action types, action creators, switch/case reducers. Включает Immer (безопасные «мутации»), thunk middleware (async), DevTools. createSlice объединяет actions + reducer в одном месте',
            'RTK и голый Redux — одно и то же, просто другое название',
            'RTK нужен только для TypeScript-проектов',
          ],
          correctIndex: 1,
          explanation: 'Классический Redux: отдельно action types (const INCREMENT = "INCREMENT"), отдельно action creators (function increment() { return {type: INCREMENT} }), отдельно reducer с switch/case, вручную настраивать middleware. RTK: createSlice объединяет всё в одном месте, Immer позволяет писать state.value++ вместо {...state, value: state.value + 1}, configureStore автоматически добавляет thunk и DevTools.',
        },
      ],
    },
    // ─── Урок 3: Context, Error Boundaries, оптимизация ───
    {
      id: 'react-context-errors',
      title: 'Context, Error Boundaries, выбор state-менеджера',
      xpReward: 10,
      slides: [
        // ✅ Theory #148 — Типичные проблемы Context
        {
          type: 'multiple-choice',
          // ✅ Theory #148
          question: 'Какие типичные проблемы возникают при использовании Context в React?',
          options: [
            'Context не работает с TypeScript',
            'Проблемы: (1) при изменении значения Context перерендериваются ВСЕ потребители (useContext), даже если они используют лишь часть данных, (2) нет встроенных инструментов для сложной логики обновлений, (3) при росте приложения множество Provider-ов усложняют структуру',
            'Context работает только с примитивными типами данных',
            'Context нельзя использовать вместе с Redux',
          ],
          correctIndex: 1,
          explanation: 'Проблемы Context: (1) Лишние ререндеры — изменилось value провайдера → ВСЕ компоненты с useContext(этот контекст) ререндерятся, даже если используют только user.name, а изменился user.age. (2) Нет сложной логики — нет middleware, нет devtools, нет нормализации. (3) Provider hell — много контекстов = вложенные <ThemeContext><AuthContext><CartContext>...',
        },
        // ✅ Theory #154 — Как оптимизировать Context?
        {
          type: 'multiple-choice',
          // ✅ Theory #154
          question: 'Как оптимизировать работу React Context, чтобы уменьшить число ререндеров?',
          options: [
            'Обернуть все компоненты в React.memo — этого достаточно',
            'Стратегии: (1) разделить контексты по назначению (ThemeContext отдельно от UserContext), (2) мемоизировать value через useMemo, (3) выносить в контекст только редко меняющиеся данные, (4) использовать React.memo для потребителей',
            'Оптимизировать Context невозможно — нужно полностью переходить на Redux',
            'Достаточно использовать useCallback для всех функций в Provider',
          ],
          correctIndex: 1,
          explanation: 'Оптимизация Context: (1) Разделение — <ThemeContext> и <UserContext> отдельно: смена темы не ререндерит компоненты, слушающие только user. (2) useMemo для value: <Provider value={useMemo(() => ({user, theme}), [user, theme])} /> — без useMemo каждый рендер создаёт новый объект → все потребители ререндерятся. (3) Хранить в Context только данные, которые меняются редко (тема, язык).',
        },
        // ✅ Theory #149 — Error Boundaries
        {
          type: 'multiple-choice',
          // ✅ Theory #149
          question: 'Для чего в React нужны Error Boundaries?',
          options: [
            'Error Boundaries ловят ошибки в обработчиках событий и async-коде',
            'Error Boundaries — классовые компоненты, которые перехватывают ошибки рендера в дочерних компонентах и показывают fallback UI вместо падения всего приложения. Используют getDerivedStateFromError и componentDidCatch. Не ловят: ошибки в обработчиках событий, async-коде, на сервере',
            'Error Boundaries — это try/catch для JavaScript, который React добавляет автоматически',
            'Error Boundaries нужны только в продакшене, в разработке они отключены',
          ],
          correctIndex: 1,
          explanation: 'Error Boundary — классовый компонент (нет хукового аналога!). Оборачивает часть UI: <ErrorBoundary><UserProfile /></ErrorBoundary>. При ошибке рендера внутри: (1) getDerivedStateFromError(error) → возвращает {hasError: true}, (2) componentDidCatch(error, info) → логирование (Sentry и т.д.), (3) показывает fallback UI. НЕ ловит: onClick ошибки (нужен try/catch), async ошибки (setTimeout, fetch), ошибки в самом ErrorBoundary.',
        },
        // ✅ Theory #150 — Как отлаживают React-приложения?
        {
          type: 'multiple-choice',
          // ✅ Theory #150
          question: 'Как отлаживают React-приложения?',
          options: [
            'Только через console.log — других способов нет',
            'Инструменты: (1) React DevTools — дерево компонентов, props, state, (2) Redux DevTools — отслеживание actions, состояния store, diff, (3) React Profiler — анализ рендеров, поиск узких мест, (4) Chrome DevTools — Network, Console, Sources для breakpoints. Плюс: StrictMode для выявления проблем в разработке',
            'React-приложения отлаживаются только через unit-тесты',
            'Отладка React не отличается от отладки обычного HTML/CSS',
          ],
          correctIndex: 1,
          explanation: 'Основные инструменты: (1) React DevTools (расширение) — дерево компонентов, просмотр props/state/hooks, поиск компонента, (2) React Profiler (вкладка в React DevTools) — какие компоненты рендерились, сколько времени заняло, причины ререндера, (3) Redux DevTools — список actions, текущий state, diff между состояниями, time-travel debugging, (4) StrictMode — двойной рендер в dev-режиме для обнаружения побочных эффектов.',
        },
        // ✅ Theory #155 — Как выбирать между state, Context и внешними менеджерами?
        {
          type: 'multiple-choice',
          // ✅ Theory #155
          question: 'Как выбирать между локальным state React, Context и внешними state-менеджерами?',
          options: [
            'Всегда использовать Redux — он подходит для всех случаев',
            'Локальный state (useState) — для UI-данных одного компонента (модалка, инпут). Context — для глобальных редко меняющихся данных (тема, язык, текущий юзер). Redux/Zustand — для сложного разделяемого состояния с частыми обновлениями, асинхронной логикой и потребностью в DevTools',
            'Context заменяет Redux полностью — внешние менеджеры не нужны',
            'Нужно хранить всё состояние в localStorage',
          ],
          correctIndex: 1,
          explanation: 'Правило: состояние должно жить как можно ближе к месту использования. useState — открыта ли модалка, значение input, активная вкладка. Context — тема (light/dark), язык, авторизация (меняется редко, нужно многим). Redux/Zustand — корзина, список товаров, фильтры, кеш серверных данных — сложная логика, частые обновления, нужны DevTools и middleware.',
        },
        // ✅ Theory #156 — Когда Redux вместо state/Context?
        {
          type: 'multiple-choice',
          // ✅ Theory #156
          question: 'Когда имеет смысл выбрать Redux вместо встроенных state и Context API React?',
          options: [
            'Всегда — Redux лучше useState и Context во всём',
            'Redux нужен когда: (1) сложное состояние с множеством взаимосвязанных данных, (2) нужна предсказуемая логика обновлений (actions → reducers), (3) нужны DevTools с time-travel debugging, (4) много асинхронных операций (createAsyncThunk), (5) состояние используется во многих несвязанных компонентах',
            'Redux нужен только если в приложении больше 100 компонентов',
            'Redux нужен только для серверных приложений (SSR)',
          ],
          correctIndex: 1,
          explanation: 'Redux оправдан при: (1) сложная бизнес-логика — корзина с промокодами, скидками, доставкой, (2) предсказуемость — единый поток данных action→reducer→state, легко воспроизводить баги, (3) DevTools — time-travel, diff состояний, запись/воспроизведение, (4) команда — единообразный подход к state management. Для маленьких проектов — overkill, достаточно useState + Context.',
        },
        // ✅ Theory #157 — Проблемы производительности Redux
        {
          type: 'multiple-choice',
          // ✅ Theory #157
          question: 'Как решать проблемы производительности и предотвращать лишние ререндеры в Redux?',
          options: [
            'Redux не вызывает проблем производительности — он всегда быстрый',
            'Стратегии: (1) useSelector с точечными селекторами (state.user.name, не весь state), (2) мемоизированные селекторы через createSelector (reselect), (3) нормализация данных (entities вместо вложенных объектов), (4) React.memo для компонентов-потребителей, (5) разделение store на независимые slices',
            'Нужно хранить всё состояние в одном slice — так быстрее',
            'Достаточно добавить useMemo ко всем useSelector',
          ],
          correctIndex: 1,
          explanation: 'Оптимизация Redux: (1) Точечные селекторы — useSelector(s => s.user.name) вместо useSelector(s => s.user), компонент ререндерится только при смене name. (2) createSelector — мемоизирует вычисляемые данные: const getActiveUsers = createSelector(getUsers, users => users.filter(u => u.active)). (3) Нормализация — плоская структура {ids: [...], entities: {id: ...}} вместо вложенных объектов. (4) Разделение slices — изменение cart не затрагивает user.',
        },
        // ✅ Theory #158 — Антипаттерны Redux
        {
          type: 'multiple-choice',
          // ✅ Theory #158
          question: 'Какие антипаттерны при работе с Redux следует избегать?',
          options: [
            'Антипаттернов в Redux не существует — любой подход работает',
            'Антипаттерны: (1) хранение всего в Redux (UI-состояние вроде isModalOpen лучше в useState), (2) мутация state без Immer/RTK, (3) бизнес-логика в компонентах вместо reducers/thunks, (4) один огромный reducer без разделения на slices, (5) хранение вычисляемых данных (filteredList) вместо хранения исходных + вычисления в selector',
            'Главный антипаттерн — использование createSlice вместо ручных reducers',
            'Антипаттерн — разделение state на slices, нужно хранить всё в одном объекте',
          ],
          correctIndex: 1,
          explanation: 'Антипаттерны: (1) Всё в Redux — isMenuOpen, inputValue не нужны глобально → useState. (2) Мутация без Immer — state.items.push(item) в голом Redux ломает обнаружение изменений (в RTK Immer это безопасно). (3) Логика в компонентах — вычисления и условия должны быть в reducers/selectors, не в onClick. (4) Один reducer — сложно поддерживать, разделяй на slices по домену. (5) Дублирование данных — храни источник (items), вычисляй (filteredItems) в селекторах.',
        },
      ],
    },
  ],
};
