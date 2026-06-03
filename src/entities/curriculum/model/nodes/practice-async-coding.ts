import type { SkillNode } from '../types';

// ═══════════════════════════════════════════════
// БЛОК: Практика Async/Promise (Practice.md)
// ═══════════════════════════════════════════════
export const PRACTICE_ASYNC_CODING: SkillNode = {
  id: 'practice-async-coding',
  title: 'Практика: Async/Promise',
  category: 'JavaScript',
  description: 'Реализация Promise-утилит с нуля. race(), all(), async/await рефакторинг.',
  iconName: 'RefreshCw',
  lessons: [
    {
      id: 'async-practice-lesson',
      title: 'Promise под капотом',
      xpReward: 20,
      slides: [
        // ─────────────────────────────────────────
        // Practice #12 — race()
        // ─────────────────────────────────────────
        {
          type: 'coding',
          title: 'Practice #12 — свой race(promises)',
          description: 'Реализуйте `race(promises)` — аналог `Promise.race()`: возвращает промис, который resolve/reject-ится первым из массива. Сам `Promise.race` использовать нельзя.',
          starterCode: `function race(promises) {
return new Promise((resolve, reject) => {
  // итерируйте promises и подпишитесь на каждый
});
}`,
          hints: [
            'Используйте new Promise() и внутри переберите массив.',
            'Для каждого promise вызовите .then(resolve, reject).',
            'Первый сработавший вызовет resolve или reject — остальные проигнорируются.',
            'Promise можно разрешить или отклонить только один раз.',
          ],
          referenceSolution: `function race(promises) {
return new Promise((resolve, reject) => {
  for (const p of promises) {
    Promise.resolve(p).then(resolve, reject);
  }
});
}`,
          explanation: 'race() использует тот факт, что Promise можно разрешить/отклонить только один раз. Первый вызов resolve() или reject() "побеждает", остальные игнорируются. Promise.resolve(p) защищает от не-промисов в массиве.',
          testSuite: `
            try {
              const userFn = new Function(userCode + '\\nreturn race;')();
              
              if (typeof userFn !== 'function') {
                return { success: false, logs: ['race должна быть функцией'] };
              }
              
              // Test 1: first resolve wins
              const p1 = new Promise(resolve => setTimeout(() => resolve('slow'), 50));
              const p2 = new Promise(resolve => setTimeout(() => resolve('fast'), 10));
              
              const result = await userFn([p1, p2]);
              if (result !== 'fast') {
                return { success: false, logs: [\`Быстрый промис должен победить. Ожидалось "fast", получено: "\${result}"\`] };
              }
              
              // Test 2: reject propagates
              const p3 = new Promise((_, reject) => setTimeout(() => reject(new Error('fail')), 10));
              const p4 = new Promise(resolve => setTimeout(() => resolve('ok'), 50));
              
              try {
                await userFn([p3, p4]);
                return { success: false, logs: ['Должен был отклониться от p3, но разрешился'] };
              } catch (e) {
                if (e.message !== 'fail') {
                  return { success: false, logs: [\`Ошибка должна быть "fail", получено: "\${e.message}"\`] };
                }
              }
              
              return { success: true, logs: ['Отлично! race() работает: побеждает самый быстрый, ошибки тоже проксируются.'] };
            } catch (e) {
              return { success: false, logs: [\`Ошибка: \${e.message}\`] };
            }
          `,
        },
        // ─────────────────────────────────────────
        // Practice #41 — all()
        // ─────────────────────────────────────────
        {
          type: 'coding',
          title: 'Practice #41 — свой all(promises)',
          description: 'Реализуйте `all(promises)` — аналог `Promise.all()`: ждёт все промисы и возвращает массив значений в **исходном порядке**. При первом отказе — отклоняется. Сам `Promise.all` нельзя.',
          starterCode: `function all(promises) {
return new Promise((resolve, reject) => {
  // результаты в правильном порядке
  // при первой ошибке — reject
});
}`,
          hints: [
            'Создайте массив results длиной promises.length для хранения результатов.',
            'Используйте счётчик resolved. Когда он равен promises.length — resolve(results).',
            'Сохраняйте результаты по индексу: results[i] = value.',
            'При reject любого промиса — сразу reject(error).',
          ],
          referenceSolution: `function all(promises) {
return new Promise((resolve, reject) => {
  if (promises.length === 0) return resolve([]);
  
  const results = new Array(promises.length);
  let resolved = 0;
  
  promises.forEach((p, i) => {
    Promise.resolve(p).then(value => {
      results[i] = value;
      resolved++;
      if (resolved === promises.length) resolve(results);
    }, reject);
  });
});
}`,
          explanation: 'all() должен: (1) сохранять результаты по индексу (не по порядку прихода), (2) resolve только когда ВСЕ выполнены, (3) reject при первой ошибке. Ключевое: results[i] = value, не results.push(). Иначе порядок нарушится.',
          testSuite: `
            try {
              const userFn = new Function(userCode + '\\nreturn all;')();
              
              // Test 1: all resolve
              const promises = [
                new Promise(r => setTimeout(() => r('a'), 30)),
                new Promise(r => setTimeout(() => r('b'), 10)),
                new Promise(r => setTimeout(() => r('c'), 20)),
              ];
              
              const result = await userFn(promises);
              if (!Array.isArray(result)) {
                return { success: false, logs: ['all() должна возвращать массив'] };
              }
              if (result[0] !== 'a' || result[1] !== 'b' || result[2] !== 'c') {
                return { success: false, logs: [\`Порядок должен быть ["a","b","c"], получено: [\${result}]\`] };
              }
              
              // Test 2: reject on first failure
              const promises2 = [
                new Promise(r => setTimeout(() => r('ok'), 30)),
                new Promise((_, reject) => setTimeout(() => reject(new Error('oops')), 10)),
              ];
              
              try {
                await userFn(promises2);
                return { success: false, logs: ['При отклонённом промисе all() должен отклониться'] };
              } catch (e) {
                if (e.message !== 'oops') {
                  return { success: false, logs: [\`Ошибка должна быть "oops", получено: "\${e.message}"\`] };
                }
              }
              
              // Test 3: empty array
              const empty = await userFn([]);
              if (!Array.isArray(empty) || empty.length !== 0) {
                return { success: false, logs: ['all([]) должен вернуть []'] };
              }
              
              return { success: true, logs: ['Отлично! all() сохраняет порядок и падает при первой ошибке.'] };
            } catch (e) {
              return { success: false, logs: [\`Ошибка: \${e.message}\`] };
            }
          `,
        },
      ],
    },
  ],
};
