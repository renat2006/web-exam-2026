import type { SkillNode } from '../types';

// ═══════════════════════════════════════════════
// БЛОК 11: Асинхронность и Promise (Week 03)
// Theory вопросы: #34, #37, #38, #39, #45
// ═══════════════════════════════════════════════
export const ASYNC_PROMISE: SkillNode = {
  id: 'async-promise',
  title: 'Асинхронность и Promise',
  category: 'JavaScript',
  description: 'Колбэки, промисы, async/await — три эпохи асинхронного JS. Плюсы, минусы, обработка ошибок.',
  iconName: 'Zap',
  lessons: [
    {
      id: 'async-fundamentals',
      title: 'От колбэков к async/await',
      xpReward: 15,
      slides: [
        {
          type: 'theory',
          title: 'Синхронный vs Асинхронный код',
          definition:
            'JavaScript — однопоточный язык. Синхронный код выполняется строка за строкой, блокируя поток. Асинхронный код позволяет "отложить" задачу и продолжить работу — браузер не замерзает.',
          codeExample: `// Синхронный — блокирует поток
console.log('1');
// heavyComputation(); // заморозит браузер
console.log('2');

// Асинхронный — не блокирует
console.log('1');
setTimeout(() => console.log('таймер'), 0);
console.log('2');
// Вывод: 1 → 2 → таймер`,
          pitfalls: [
            'setTimeout(fn, 0) не гарантирует мгновенное выполнение — fn попадает в очередь макрозадач.',
            'Синхронный "тяжёлый" код заморозит вкладку — долгие вычисления нужно переносить в Web Worker.',
            'JS однопоточный — параллельности нет, есть только асинхронность через очереди.',
          ],
          keyTerms: [
            { term: 'Однопоточность', definition: 'JS выполняет только одну задачу в единицу времени' },
            { term: 'Асинхронность', definition: 'Способ запустить операцию и продолжить работу, не дожидаясь её завершения' },
            { term: 'setTimeout', definition: 'Функция, откладывающая выполнение колбэка на указанное время (макрозадача)' },
          ],
          mnemonic: 'Синхрон = очередь в банке: стоишь и ждёшь. Асинхрон = взял талончик и пошёл пить кофе — тебя вызовут когда придёт очередь ☕',
        },
        {
          type: 'theory',
          title: 'Callback Hell и как из него выйти',
          definition:
            'Callback (колбэк) — функция, передаваемая как аргумент и вызываемая позже. При цепочке асинхронных операций возникает "ад колбэков" — глубокая вложенность, которую тяжело читать и отлаживать.',
          codeExample: `// ❌ Callback Hell — "Пирамида смерти"
getUser(1, function(user) {
getPosts(user, function(posts) {
  getComments(posts[0], function(comments) {
    // Логика всё глубже...
    updateUI(comments);  // А если ошибка?
  });
});
});

// ✅ Promise — плоские цепочки
getUser(1)
.then(user => getPosts(user))
.then(posts => getComments(posts[0]))
.then(comments => updateUI(comments))
.catch(error => handleError(error));

// ✅✅ async/await — как синхронный код
async function loadData() {
try {
  const user = await getUser(1);
  const posts = await getPosts(user);
  const comments = await getComments(posts[0]);
  updateUI(comments);
} catch (error) {
  handleError(error);
}
}`,
          comparison: {
            title: 'Три способа работы с асинхронностью',
            headers: ['Подход', 'Плюсы', 'Минусы'],
            rows: [
              ['Callbacks', 'Просто, нет зависимостей', 'Callback hell, сложная обработка ошибок'],
              ['Promise', 'Плоские цепочки, .catch() централизует ошибки, Promise.all()', 'Синтаксис .then() непривычен новичкам'],
              ['async/await', 'Читается как синхронный код, try/catch, легко дебажить', 'await нельзя на верхнем уровне (ES2022 — можно), нужен async-контекст'],
            ],
          },
          pitfalls: [
            'await можно использовать только внутри async-функции — иначе SyntaxError.',
            'async-функция ВСЕГДА возвращает Promise — даже если внутри return 42.',
            'Забытый await: const data = fetchData() вернёт Promise, а не данные.',
          ],
          keyTerms: [
            { term: 'Callback hell', definition: 'Глубокая вложенность асинхронных колбэков — "пирамида смерти"' },
            { term: 'Promise', definition: 'Объект-обещание: будет выполнен успешно (resolve) или с ошибкой (reject)' },
            { term: 'async/await', definition: 'Синтаксический сахар над Promise — асинхронный код в синхронном стиле' },
          ],
          mnemonic: 'Callback — матрёшка 🪆 (функция в функции в функции). Promise — конвейер 🏭 (.then → .then → .catch). async/await — обычный код с волшебным словом await.',
        },
        {
          type: 'theory',
          title: 'Promise: состояния и методы',
          definition:
            'Promise — объект с тремя состояниями: pending (ожидание), fulfilled (успех), rejected (ошибка). Переход необратим: из pending можно попасть только в fulfilled или rejected.',
          diagram: {
            type: 'flow',
            title: 'Жизненный цикл Promise',
            items: ['new Promise(...)', 'PENDING (ожидание)', 'resolve() → FULFILLED', 'reject() → REJECTED', '.then(result)', '.catch(error)', '.finally() — всегда'],
          },
          codeExample: `const promise = new Promise((resolve, reject) => {
const success = Math.random() > 0.3;
setTimeout(() => {
  if (success) resolve({ data: 'Всё ок' }); // → fulfilled
  else reject(new Error('Что-то пошло не так')); // → rejected
}, 1000);
});

// Promise.all — ждёт ВСЕ, падает если ХОТЯ БЫ ОДИН упал
Promise.all([fetch('/api/users'), fetch('/api/posts')])
.then(([users, posts]) => { /* оба готовы */ });

// Promise.allSettled — ждёт все, не падает при ошибке
Promise.allSettled([p1, p2])
.then(results => results.forEach(r => console.log(r.status)));`,
          pitfalls: [
            'Promise.all() провалится при первой же ошибке — для "подождать всех несмотря на ошибки" используй Promise.allSettled().',
            '.catch() ловит ошибки из всей предшествующей цепочки .then().',
            '.finally() не принимает аргументы — данные из resolve/reject туда не передаются.',
          ],
          keyTerms: [
            { term: 'pending', definition: 'Начальное состояние Promise — операция ещё не завершена' },
            { term: 'fulfilled', definition: 'Promise выполнен успешно — вызван resolve()' },
            { term: 'rejected', definition: 'Promise завершился ошибкой — вызван reject()' },
            { term: 'Promise.all()', definition: 'Ждёт все промисы; падает, если хотя бы один отклонён' },
          ],
          mnemonic: 'Три состояния: жду (pending) → получил (fulfilled) → облом (rejected). Как заказ еды: жду → привезли → не привезли.',
        },
        {
          type: 'theory',
          title: 'Обработка ошибок в асинхронном коде',
          definition:
            'В Promise ошибки ловятся через .catch(). В async/await — через try/catch. Важно: try/catch НЕ ловит ошибки в колбэках setTimeout и addEventListener — только синхронные и await-выражения.',
          codeExample: `// ✅ Promise — .catch ловит ошибки всей цепочки
fetch('/api/data')
.then(res => res.json())
.then(data => processData(data))
.catch(err => console.error('Любая ошибка:', err));

// ✅ async/await — try/catch
async function loadData() {
try {
  const res = await fetch('/api/data');
  const data = await res.json();
  return processData(data);
} catch (err) {
  console.error('Ошибка:', err);
}
}

// ❌ try/catch НЕ поймает ошибку внутри setTimeout
try {
setTimeout(() => { throw new Error('не поймаю!'); }, 0);
} catch (e) {
console.log('никогда не сработает');
}`,
          pitfalls: [
            'try/catch не ловит ошибки в асинхронных колбэках (setTimeout, addEventListener).',
            'Если не поставить await перед async-функцией — ошибка уйдёт в unhandledRejection.',
            'Всегда добавляй .catch() или try/catch — необработанный rejected Promise крашит Node.js.',
          ],
          keyTerms: [
            { term: 'try/catch', definition: 'Конструкция для перехвата синхронных ошибок и ошибок из await-выражений' },
            { term: '.catch()', definition: 'Метод Promise для перехвата rejected-состояния' },
            { term: 'unhandledRejection', definition: 'Событие: Promise отклонён, но .catch() не добавлен' },
          ],
          mnemonic: 'try/catch — страховочная сетка 🪢. Но она натянута только под синхронным канатом! Под setTimeout — другая арена, там нужен свой try/catch внутри колбэка.',
        },
        {
          type: 'multiple-choice',
          question: 'async-функция всегда возвращает...',
          options: [
            'Значение, которое указано в return',
            'Promise, обёртывающий возвращаемое значение',
            'undefined, если нет явного return',
            'Зависит от того, есть ли внутри await',
          ],
          correctIndex: 1,
          explanation:
            'async-функция ВСЕГДА возвращает Promise. Если внутри написать return 42 — вернётся Promise.resolve(42). Если выбросить ошибку — вернётся Promise.reject(error). Это фундаментальное свойство async/await.',
        },
        {
          type: 'multiple-choice',
          question: 'Что выведет код: Promise.resolve().then(() => console.log("A")).then(() => console.log("B")); console.log("C");',
          options: [
            'A → B → C',
            'C → A → B',
            'A → C → B',
            'C → B → A',
          ],
          correctIndex: 1,
          explanation:
            'Порядок: C (синхронный код выполняется первым) → A → B (микрозадачи после очистки стека). Promise.then добавляет колбэки в Microtask Queue, которая обрабатывается после завершения синхронного кода.',
        },
        {
          type: 'multiple-choice',
          question: 'В чём главное отличие Promise.all() от Promise.allSettled()?',
          options: [
            'Promise.all() быстрее',
            'Promise.all() падает при первой ошибке; Promise.allSettled() ждёт всех и возвращает статусы',
            'Promise.allSettled() падает при первой ошибке',
            'Нет разницы, только синтаксис отличается',
          ],
          correctIndex: 1,
          explanation:
            'Promise.all() — режим "все или ничего": если хотя бы один Promise отклонён, весь Promise.all переходит в rejected. Promise.allSettled() ждёт завершения всех промисов и возвращает массив объектов {status: "fulfilled"|"rejected", value/reason}.',
        },
        // ✅ Theory #44 — точная формулировка
        {
          type: 'multiple-choice',
          question: 'Когда try/catch перехватывает ошибки асинхронного кода, а когда — нет?',
          options: [
            'try/catch ловит любые ошибки — и синхронные, и в колбэках setTimeout',
            'try/catch ловит ошибки в await-выражениях и синхронном коде, но НЕ ловит ошибки в колбэках setTimeout и addEventListener',
            'try/catch вообще не работает с асинхронным кодом — нужен только .catch()',
            'try/catch ловит ошибки везде, если функция помечена async',
          ],
          correctIndex: 1,
          explanation:
            'try/catch ловит: (1) синхронные ошибки, (2) ошибки из await-выражений внутри async-функции. НЕ ловит: ошибки в колбэках setTimeout, setInterval, addEventListener — они выполняются позже, уже вне блока try. Для них нужен свой try/catch внутри колбэка или обработчик window.onerror.',
        },
        // ✅ Theory #45 — точная формулировка
        {
          type: 'multiple-choice',
          question: 'В чём разница между колбэками, промисами, async/await и событиями как способами описать асинхронность?',
          options: [
            'Это одно и то же, просто разный синтаксис',
            'Колбэки — простые но создают вложенность; Promise — плоские цепочки; async/await — синхронный стиль; события — паттерн publish/subscribe для многократных уведомлений',
            'async/await — единственный правильный способ, остальные устарели',
            'События заменяют Promise, а колбэки заменяют async/await',
          ],
          correctIndex: 1,
          explanation:
            'Все четыре решают асинхронность, но по-разному: Callbacks — просто, но callback hell при цепочках. Promise — плоские .then() цепочки, .catch() для ошибок. async/await — читается как синхронный код, try/catch для ошибок. События (EventEmitter/addEventListener) — паттерн pub/sub: подписчики могут быть много, событие может произойти много раз (например, click).',
        },
      ],
    },
  ],
};
