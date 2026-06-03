import type { SkillNode } from '../types';

// ═══════════════════════════════════════════════
// БЛОК 12: Event Loop (Week 03)
// Theory вопросы: #23, #35, #43, #46, #47
// ═══════════════════════════════════════════════
export const EVENT_LOOP: SkillNode = {
  id: 'event-loop',
  title: 'Event Loop',
  category: 'JavaScript',
  description: 'Как JavaScript выполняет асинхронный код: Call Stack, Web APIs, очереди микро- и макрозадач.',
  iconName: 'RefreshCw',
  lessons: [
    {
      id: 'event-loop-core',
      title: 'Event Loop: сердце асинхронного JS',
      xpReward: 15,
      slides: [
        {
          type: 'theory',
          title: 'Модель выполнения JS в браузере',
          definition:
            'JavaScript использует Event Loop для управления асинхронным кодом. Есть 4 компонента: Call Stack (выполняет код), Web APIs (браузерные задачи: таймеры, fetch), Microtask Queue (Promise.then, await), Task Queue (setTimeout, события). Event Loop следит: когда Call Stack пуст — сначала сливает все микрозадачи, потом берёт одну макрозадачу.',
          diagram: {
            type: 'flow',
            title: 'Event Loop — один цикл',
            items: [
              '1. Выполнить весь синхронный код (Call Stack)',
              '2. Очистить Microtask Queue (ВСЕ Promise.then / await)',
              '3. Браузер перерисовывает экран (если нужно)',
              '4. Взять ОДНУ макрозадачу из Task Queue (setTimeout/setInterval)',
              '5. Вернуться к шагу 2',
            ],
          },
          comparison: {
            title: 'Микрозадачи vs Макрозадачи',
            headers: ['Тип', 'Примеры', 'Приоритет', 'Очередь'],
            rows: [
              ['Микрозадачи', 'Promise.then, async/await, queueMicrotask, MutationObserver', 'ВЫШЕ — всегда первыми', 'Microtask Queue'],
              ['Макрозадачи', 'setTimeout, setInterval, DOM-события, fetch (колбэки)', 'НИЖЕ — по одной за раз', 'Task Queue'],
            ],
          },
          pitfalls: [
            'После каждой макрозадачи — полный слив Microtask Queue. Бесконечные микрозадачи заблокируют браузер.',
            'setTimeout(fn, 0) — не "немедленно", а "после всех микрозадач" → минимум несколько миллисекунд.',
            'fetch-запросы — Web API: сам запрос выполняет браузер, а .then() попадает в Microtask Queue.',
          ],
          keyTerms: [
            { term: 'Call Stack', definition: 'Стек вызовов — здесь выполняется синхронный JS-код, LIFO' },
            { term: 'Web APIs', definition: 'Браузерные API (setTimeout, fetch, DOM events) — выполняются вне JS-потока' },
            { term: 'Microtask Queue', definition: 'Очередь микрозадач (Promise, await) — опустошается полностью после каждого синхронного блока' },
            { term: 'Task Queue', definition: 'Очередь макрозадач (setTimeout) — берётся по одной после микрозадач' },
            { term: 'Event Loop', definition: 'Цикл, следящий за Call Stack и перекладывающий задачи из очередей' },
          ],
          mnemonic: 'Запомни порядок через "С-М-М-М": Синхронный код → Микрозадачи (все!) → Макрозадача (одна) → Микрозадачи снова → Макрозадача... как мотор: ц-ц-ц-ц-ц',
        },
        {
          type: 'theory',
          title: 'Race Condition — состояние гонки',
          definition:
            'Race condition (состояние гонки) — ситуация, когда результат зависит от порядка завершения нескольких асинхронных операций, который непредсказуем. Например: пользователь быстро меняет город — два запроса "бегут", и более старый может прийти ПОЗЖЕ нового.',
          codeExample: `// ❌ Проблема: старый запрос может прийти позже нового
let lastRequestId = 0;

async function search(query) {
const requestId = ++lastRequestId;
const data = await fetch(\`/api?q=\${query}\`);

// ❌ Показываем всё подряд — включая устаревшие данные
showResults(data);
}

// ✅ Решение 1: игнорируем устаревшие ответы
async function searchFixed(query) {
const requestId = ++lastRequestId;
const data = await fetch(\`/api?q=\${query}\`);

if (requestId !== lastRequestId) return; // устаревший ответ — игнорируем
showResults(data);
}

// ✅ Решение 2: AbortController — отменяем предыдущий запрос
let controller;
async function searchWithAbort(query) {
controller?.abort(); // отменяем прошлый
controller = new AbortController();
const data = await fetch(\`/api?q=\${query}\`, { signal: controller.signal });
showResults(data);
}`,
          pitfalls: [
            'Race condition чаще всего возникает в поиске, пагинации, табах — везде, где запросы могут "обгонять" друг друга.',
            'AbortController — современный способ отменить fetch-запрос.',
            'Promise.race() — берёт результат первого завершившегося промиса (быстрейшего).',
          ],
          keyTerms: [
            { term: 'Race condition', definition: 'Ошибка когда результат зависит от непредсказуемого порядка асинхронных операций' },
            { term: 'AbortController', definition: 'API для отмены fetch-запросов' },
            { term: 'Promise.race()', definition: 'Возвращает первый завершившийся Promise (любой — успех или ошибка)' },
          ],
          mnemonic: 'Race condition = гонка автобусов 🚌🚌. Ты сел в автобус №2, но приехал автобус №1 (который отправился после). Нужно либо остановить старый автобус (AbortController), либо проверить номер рейса (requestId).',
        },
        {
          type: 'multiple-choice',
          question: 'Что выведет код? console.log("A"); setTimeout(() => console.log("B"), 0); Promise.resolve().then(() => console.log("C")); console.log("D");',
          options: [
            'A → B → C → D',
            'A → D → B → C',
            'A → D → C → B',
            'A → C → D → B',
          ],
          correctIndex: 2,
          explanation:
            'Порядок: A и D — синхронный код (выполняется первым). C — микрозадача (Promise.then, выполняется после всего синхронного кода). B — макрозадача (setTimeout, выполняется после всех микрозадач). Итог: A → D → C → B.',
        },
        {
          type: 'multiple-choice',
          question: 'Почему setTimeout(fn, 0) НЕ выполняется немедленно?',
          options: [
            'Это баг в браузере',
            'Колбэк попадает в Task Queue и ждёт, пока Call Stack и Microtask Queue очистятся',
            'Минимальная задержка setTimeout — 4 мс по спецификации',
            'JavaScript не поддерживает нулевые таймауты',
          ],
          correctIndex: 1,
          explanation:
            'setTimeout(fn, 0) передаёт fn в Web API таймера, и после истечения 0 мс (или 4 мс — минимум по спецификации) колбэк попадает в Task Queue. Event Loop возьмёт его только после того, как Call Stack пуст И Microtask Queue очищена. Поэтому Promise.then() всегда выполнится раньше setTimeout.',
        },
        {
          type: 'multiple-choice',
          question: 'Какую проблему решает Event Loop?',
          options: [
            'Позволяет JS выполнять несколько функций одновременно',
            'Позволяет однопоточному JS не блокировать интерфейс при ожидании асинхронных операций',
            'Ускоряет выполнение синхронного кода',
            'Управляет памятью и сборщиком мусора',
          ],
          correctIndex: 1,
          explanation:
            'Event Loop позволяет JavaScript оставаться однопоточным, но при этом не "замораживать" браузер. Пока идёт, например, fetch-запрос — JS продолжает обрабатывать события интерфейса. Когда данные придут — Event Loop поместит колбэк в очередь и выполнит его.',
        },
        // ✅ Theory #35 — точная формулировка
        {
          type: 'multiple-choice',
          question: 'Объясните, что такое очередь микрозадач (microtask queue).',
          options: [
            'Это очередь для небольших (коротких) функций — setTimeout с маленькой задержкой',
            'Это очередь задач с высоким приоритетом (Promise.then, async/await), которая полностью очищается перед каждой макрозадачей',
            'Это альтернативное название для Task Queue (очереди setTimeout)',
            'Это очередь для микросервисных запросов к API',
          ],
          correctIndex: 1,
          explanation:
            'Microtask Queue — очередь с ВЫСОКИМ приоритетом. В неё попадают: Promise.then/catch/finally, колбэки async/await, queueMicrotask(). Event Loop ПОЛНОСТЬЮ опустошает Microtask Queue после каждого синхронного блока и после каждой макрозадачи — прежде чем взять следующую макрозадачу (setTimeout).',
        },
        // ✅ Theory #46 — точная формулировка
        {
          type: 'multiple-choice',
          question: 'Опишите микрозадачи и макрозадачи и их связь с event loop.',
          options: [
            'Микрозадачи — это задачи меньшего размера, макрозадачи — большого. Event Loop выполняет их вперемешку',
            'Микрозадачи (Promise, await) имеют ВЫСШИЙ приоритет и полностью выполняются после каждого шага; макрозадачи (setTimeout, события DOM) берутся по одной после очистки microtask queue',
            'Макрозадачи всегда выполняются раньше микрозадач',
            'Нет никакой разницы — обе очереди обрабатываются одинаково',
          ],
          correctIndex: 1,
          explanation:
            'Цикл Event Loop: 1) Выполнить синхронный код. 2) Очистить ВСЮ Microtask Queue (Promise.then, await, queueMicrotask). 3) Взять ОДНУ макрозадачу из Task Queue (setTimeout, setInterval, DOM events). 4) Снова к шагу 2. Важно: микрозадачи приоритетнее — setTimeout(0) всегда выполнится ПОСЛЕ Promise.then.',
        },
        // ✅ Theory #47 — точная формулировка
        {
          type: 'multiple-choice',
          question: 'Что такое состояние гонки (race condition) и как его избежать?',
          options: [
            'Состояние гонки — ошибка компилятора при многопоточности. В JS не возникает, т.к. JS однопоточный',
            'Состояние гонки — ситуация, когда результат зависит от непредсказуемого порядка завершения асинхронных операций. Избегают через AbortController, requestId-флаги или Promise.race()',
            'Состояние гонки — когда два пользователя одновременно редактируют один документ',
            'Состояние гонки — это всегда ошибка сервера, на фронтенде не возникает',
          ],
          correctIndex: 1,
          explanation:
            'Race condition в JS: пользователь делает запрос A, потом быстро запрос B. B отвечает первым, UI обновляется. Потом приходит A (старый!) и перезаписывает актуальные данные. Решения: (1) AbortController — отменить предыдущий fetch. (2) Счётчик requestId — игнорировать устаревший ответ. (3) Debounce — подождать паузы перед отправкой запроса.',
        },
        // ✅ Theory #23 — точная формулировка
        {
          type: 'multiple-choice',
          question: 'Опишите модель выполнения JavaScript в браузере: какие у неё основные части и как они взаимодействуют?',
          options: [
            'JS имеет Call Stack и два потока — один для синхронного, другой для асинхронного кода',
            'Call Stack (стек вызовов) + Web APIs (браузерные задачи) + Microtask Queue (Promise) + Task Queue (setTimeout) — Event Loop перекладывает задачи в Stack когда он пуст',
            'JS использует только один объект Queue, куда попадают все задачи по порядку',
            'Браузер запускает отдельный поток для каждого Promise',
          ],
          correctIndex: 1,
          explanation:
            '4 компонента: (1) Call Stack — выполняет синхронный код (LIFO). (2) Web APIs — браузер выполняет таймеры, fetch, события вне JS-потока. (3) Microtask Queue — Promise.then/await, высокий приоритет. (4) Task Queue — setTimeout/setInterval/DOM-события, низкий приоритет. Event Loop: когда Stack пуст → слить всю Microtask Queue → взять одну Task из Task Queue → повтор.',
        },
      ],
    },
  ],
};
