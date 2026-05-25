export type Difficulty = 'easy' | 'medium' | 'hard';
export type Category = 'javascript' | 'typescript' | 'async' | 'patterns' | 'react' | 'spa';

export interface TestCase {
  name: string;
  /** JS string, has access to `userFn` (the exported value) */
  run: string;
}

export interface Problem {
  id: string;
  number: number;
  title: string;
  difficulty: Difficulty;
  category: Category;
  description: string;   // markdown-ish plain text
  examples: { input: string; output: string; note?: string }[];
  starterCode: string;
  testCases: TestCase[];
  hints: string[];
  solution: string;
  tags: string[];
}

export const PROBLEMS: Problem[] = [
  // ── #1 ──────────────────────────────────────────────────────────
  {
    id: 'btn-click',
    number: 1,
    title: 'Кнопка меняет текст по клику',
    difficulty: 'easy',
    category: 'javascript',
    tags: ['DOM', 'Events', 'addEventListener'],
    description: `Дана функция \`setup(button)\` которая получает DOM-кнопку.

Добавьте обработчик клика через \`addEventListener\`, который при первом клике меняет текст внутри кнопки на **«Clicked!»**.

Инлайн-атрибут \`onclick="..."\` использовать нельзя — только \`addEventListener\`.`,
    examples: [
      { input: 'Начальный текст: "Click me"', output: 'После клика: "Clicked!"' },
    ],
    starterCode: `function setup(button) {
  // добавьте addEventListener
}`,
    hints: [
      'Используйте button.addEventListener("click", fn)',
      'Внутри обработчика измените button.textContent',
      'Нужно именно addEventListener, не onclick',
    ],
    solution: `function setup(button) {
  button.addEventListener('click', function() {
    button.textContent = 'Clicked!';
  });
}`,
    testCases: [
      {
        name: 'Текст меняется на "Clicked!" после клика',
        run: `
          const btn = { textContent: 'Click me', _listeners: [], addEventListener(ev, fn) { this._listeners.push(fn); }, click() { this._listeners.forEach(f => f()); } };
          userFn(btn);
          btn.click();
          if (btn.textContent !== 'Clicked!') throw new Error('Ожидалось "Clicked!", получено "' + btn.textContent + '"');
        `,
      },
      {
        name: 'Использует addEventListener (не onclick)',
        run: `
          const btn = { textContent: 'Click me', _called: false, addEventListener(ev, fn) { this._called = true; }, onclick: null };
          userFn(btn);
          if (!btn._called) throw new Error('addEventListener не был вызван');
          if (btn.onclick !== null) throw new Error('Нельзя использовать onclick напрямую');
        `,
      },
    ],
  },

  // ── #10 ─────────────────────────────────────────────────────────
  {
    id: 'make-counter',
    number: 10,
    title: 'makeCounter — замыкание',
    difficulty: 'easy',
    category: 'javascript',
    tags: ['Closures', 'Functions'],
    description: `Реализуйте функцию \`makeCounter\`, которая принимает необязательное начальное значение и возвращает функцию-счётчик.

Каждый вызов возвращаемой функции должен увеличивать внутреннее значение на 1 и возвращать его.`,
    examples: [
      { input: 'const c = makeCounter(); c(); c();', output: '1, 2' },
      { input: 'const c = makeCounter(10); c(); c();', output: '11, 12' },
    ],
    starterCode: `function makeCounter(initial = 0) {
  // используйте замыкание
}`,
    hints: [
      'Объявите переменную count внутри makeCounter.',
      'Верните функцию, которая увеличивает count и возвращает его.',
      'initial — начальное значение, по умолчанию 0.',
    ],
    solution: `function makeCounter(initial = 0) {
  let count = initial;
  return function() {
    count += 1;
    return count;
  };
}`,
    testCases: [
      {
        name: 'Без аргумента: 1, 2, 3',
        run: `
          const c = userFn();
          const a = c(), b = c(), d = c();
          if (a !== 1) throw new Error('1-й вызов: ожидалось 1, получено ' + a);
          if (b !== 2) throw new Error('2-й вызов: ожидалось 2, получено ' + b);
          if (d !== 3) throw new Error('3-й вызов: ожидалось 3, получено ' + d);
        `,
      },
      {
        name: 'С начальным значением 10: 11, 12',
        run: `
          const c = userFn(10);
          const a = c(), b = c();
          if (a !== 11) throw new Error('1-й вызов: ожидалось 11, получено ' + a);
          if (b !== 12) throw new Error('2-й вызов: ожидалось 12, получено ' + b);
        `,
      },
      {
        name: 'Независимые счётчики',
        run: `
          const c1 = userFn();
          const c2 = userFn(5);
          c1(); c1();
          const x = c1();
          const y = c2();
          if (x !== 3) throw new Error('c1: ожидалось 3, получено ' + x);
          if (y !== 6) throw new Error('c2: ожидалось 6, получено ' + y);
        `,
      },
    ],
  },

  // ── #3 ──────────────────────────────────────────────────────────
  {
    id: 'identity',
    number: 3,
    title: 'identity<T> — базовая generic-функция',
    difficulty: 'easy',
    category: 'typescript',
    tags: ['Generics', 'TypeScript'],
    description: `Напишите generic-функцию \`identity\`, которая принимает аргумент любого типа и возвращает **то же самое значение**, сохраняя его тип.

\`\`\`ts
const a = identity(42);        // a: number
const b = identity('hello');   // b: string
const c = identity({ x: 1 }); // c: { x: number }
\`\`\``,
    examples: [
      { input: 'identity(42)', output: '42' },
      { input: "identity('hello')", output: "'hello'" },
    ],
    starterCode: `function identity<T>(value: T): T {
  // одна строка
}`,
    hints: [
      '<T> — type parameter, объявляется перед скобками параметров.',
      'Реализация тривиальная: return value',
      'Суть задачи — правильно объявить generic-сигнатуру.',
    ],
    solution: `function identity<T>(value: T): T {
  return value;
}`,
    testCases: [
      {
        name: 'identity(42) === 42',
        run: `
          if (userFn(42) !== 42) throw new Error('identity(42) должна вернуть 42');
        `,
      },
      {
        name: "identity('hello') === 'hello'",
        run: `
          if (userFn('hello') !== 'hello') throw new Error('identity("hello") должна вернуть "hello"');
        `,
      },
      {
        name: 'identity(obj) — та же ссылка',
        run: `
          const obj = { x: 1, y: 2 };
          if (userFn(obj) !== obj) throw new Error('identity(obj) должна вернуть тот же объект (по ссылке)');
        `,
      },
    ],
  },

  // ── #23 ─────────────────────────────────────────────────────────
  {
    id: 'class-bus',
    number: 23,
    title: 'Класс Bus',
    difficulty: 'easy',
    category: 'typescript',
    tags: ['Classes', 'TypeScript'],
    description: `Напишите класс \`Bus\` со свойствами \`make: string\`, \`model: string\`, \`year: number\` и методом \`getInfo()\`, возвращающим строку с описанием.

\`\`\`ts
const bus = new Bus('Mercedes', 'Sprinter', 2024);
bus.getInfo(); // "Mercedes Sprinter (2024)"
\`\`\``,
    examples: [
      { input: "new Bus('Volvo', 'B8R', 2022).getInfo()", output: '"Volvo B8R (2022)"' },
    ],
    starterCode: `class Bus {
  // объявите свойства

  constructor(make: string, model: string, year: number) {
    // инициализируйте
  }

  getInfo(): string {
    // верните строку
  }
}`,
    hints: [
      'Shorthand: constructor(public make: string, ...) {} — автоматически создаёт свойства.',
      'getInfo() использует template literal: `${this.make} ${this.model} (${this.year})`',
    ],
    solution: `class Bus {
  constructor(
    public make: string,
    public model: string,
    public year: number
  ) {}

  getInfo(): string {
    return \`\${this.make} \${this.model} (\${this.year})\`;
  }
}`,
    testCases: [
      {
        name: 'getInfo() возвращает правильную строку',
        run: `
          const bus = new userFn('Mercedes', 'Sprinter', 2024);
          const info = bus.getInfo();
          if (info !== 'Mercedes Sprinter (2024)') throw new Error('Ожидалось "Mercedes Sprinter (2024)", получено "' + info + '"');
        `,
      },
      {
        name: 'Свойства make, model, year доступны',
        run: `
          const bus = new userFn('Volvo', 'B8R', 2022);
          if (bus.make !== 'Volvo') throw new Error('make должно быть "Volvo"');
          if (bus.model !== 'B8R') throw new Error('model должно быть "B8R"');
          if (bus.year !== 2022) throw new Error('year должно быть 2022');
        `,
      },
    ],
  },

  // ── #20 ─────────────────────────────────────────────────────────
  {
    id: 'swap',
    number: 20,
    title: 'swap<A, B> — обмен с сохранением типов',
    difficulty: 'medium',
    category: 'typescript',
    tags: ['Generics', 'Tuples', 'TypeScript'],
    description: `Реализуйте функцию \`swap\`, которая принимает два значения произвольных типов и возвращает их в **обратном порядке** как кортеж. Типы должны быть сохранены.

\`\`\`ts
const [b, a] = swap('hello', 42);
// b: string, a: number
\`\`\``,
    examples: [
      { input: "swap(42, 'hello')", output: "['hello', 42]" },
      { input: "swap(true, { x: 1 })", output: "[{ x: 1 }, true]" },
    ],
    starterCode: `function swap<A, B>(a: A, b: B): [B, A] {
  // реализуйте
}`,
    hints: [
      'Возвращаемый тип — кортеж [B, A].',
      'return [b, a] — это всё что нужно.',
    ],
    solution: `function swap<A, B>(a: A, b: B): [B, A] {
  return [b, a];
}`,
    testCases: [
      {
        name: "swap(42, 'hello') → ['hello', 42]",
        run: `
          const [x, y] = userFn(42, 'hello');
          if (x !== 'hello') throw new Error('Первый элемент должен быть "hello"');
          if (y !== 42) throw new Error('Второй элемент должен быть 42');
        `,
      },
      {
        name: 'swap(true, null) → [null, true]',
        run: `
          const [x, y] = userFn(true, null);
          if (x !== null) throw new Error('Первый элемент должен быть null');
          if (y !== true) throw new Error('Второй элемент должен быть true');
        `,
      },
    ],
  },

  // ── #21 ─────────────────────────────────────────────────────────
  {
    id: 'my-pick',
    number: 21,
    title: 'MyPick<T, K> — реализуй Pick',
    difficulty: 'medium',
    category: 'typescript',
    tags: ['Mapped Types', 'Generics', 'Utility Types'],
    description: `Реализуйте встроенный generic \`Pick<T, K>\` **без использования его самого** — назовите \`MyPick<T, K>\`.

\`\`\`ts
interface Todo { title: string; description: string; completed: boolean; }

type TodoPreview = MyPick<Todo, 'title' | 'completed'>;
// { title: string; completed: boolean }
\`\`\``,
    examples: [
      { input: "MyPick<{ a: 1, b: 2, c: 3 }, 'a' | 'c'>", output: '{ a: 1, c: 3 }' },
    ],
    starterCode: `type MyPick<T, K extends keyof T> = {
  // используйте mapped type
}`,
    hints: [
      'Mapped type: [P in K]: T[P]',
      'K extends keyof T ограничивает K ключами T',
      'Итерируйте по P in K и берите тип T[P]',
    ],
    solution: `type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
}`,
    testCases: [
      {
        name: 'Выбирает нужные поля',
        run: `
          // Runtime test: check that MyPick-like function works
          function myPick(obj, keys) {
            return Object.fromEntries(keys.map(k => [k, obj[k]]));
          }
          const todo = { title: 'Clean room', description: 'very messy', completed: false };
          const preview = myPick(todo, ['title', 'completed']);
          if (preview.title !== 'Clean room') throw new Error('title должно быть "Clean room"');
          if (preview.completed !== false) throw new Error('completed должно быть false');
          if ('description' in preview) throw new Error('description не должно быть в результате');
          // Check that user's code compiles (type check)
          if (!userFn || typeof userFn !== 'object') throw new Error('MyPick должен быть type alias — проверьте синтаксис');
        `,
      },
    ],
  },

  // ── #22 ─────────────────────────────────────────────────────────
  {
    id: 'my-readonly',
    number: 22,
    title: 'MyReadonly<T> — реализуй Readonly',
    difficulty: 'medium',
    category: 'typescript',
    tags: ['Mapped Types', 'Generics', 'Utility Types'],
    description: `Реализуйте встроенный generic \`Readonly<T>\` **без использования его самого** — назовите \`MyReadonly<T>\`.

Все свойства объекта должны стать readonly.

\`\`\`ts
interface Todo { title: string; description: string; }
const todo: MyReadonly<Todo> = { title: 'Hey', description: 'bar' };
todo.title = 'Hello'; // Error: cannot assign to 'title' because it is readonly
\`\`\``,
    examples: [
      { input: 'MyReadonly<{ a: string; b: number }>', output: '{ readonly a: string; readonly b: number }' },
    ],
    starterCode: `type MyReadonly<T> = {
  // используйте mapped type с readonly
}`,
    hints: [
      'Mapped type: readonly [K in keyof T]: T[K]',
      'Ключевое слово readonly ставится перед [K in keyof T]',
    ],
    solution: `type MyReadonly<T> = {
  readonly [K in keyof T]: T[K];
}`,
    testCases: [
      {
        name: 'Mapped type с readonly корректен',
        run: `
          // Runtime verification
          function deepFreeze(obj) { return Object.freeze({ ...obj }); }
          const original = { title: 'Hey', description: 'bar' };
          const frozen = deepFreeze(original);
          let threw = false;
          try { frozen.title = 'Changed'; } catch(e) { threw = true; }
          // In non-strict mode assignment silently fails, just check value
          if (frozen.title !== 'Hey') throw new Error('Объект не должен мутироваться');
          if (!userFn || typeof userFn !== 'object') throw new Error('MyReadonly должен быть type alias');
        `,
      },
    ],
  },

  // ── #49 ─────────────────────────────────────────────────────────
  {
    id: 'person-employee',
    number: 49,
    title: 'Person и Employee — наследование классов',
    difficulty: 'medium',
    category: 'typescript',
    tags: ['Classes', 'Inheritance', 'super', 'TypeScript'],
    description: `Напишите класс \`Person\` с полями \`name: string\`, \`age: number\` и методом \`greet()\`. 

Затем создайте \`Employee extends Person\` с дополнительным полем \`salary: number\` и переопределённым \`greet()\`, использующим \`super.greet()\`.`,
    examples: [
      { input: "new Person('Alice', 30).greet()", output: "Hi, I'm Alice, 30 years old" },
      { input: "new Employee('Bob', 25, 5000).greet()", output: "Hi, I'm Bob, 25 years old, salary: 5000" },
    ],
    starterCode: `class Person {
  constructor(public name: string, public age: number) {}

  greet(): string {
    // "Hi, I'm {name}, {age} years old"
  }
}

class Employee extends Person {
  constructor(name: string, age: number, public salary: number) {
    super(name, age);
  }

  greet(): string {
    // используйте super.greet() + добавьте salary
  }
}`,
    hints: [
      'super(name, age) — вызов конструктора родителя, обязателен первым.',
      'super.greet() — вызов метода родителя из переопределённого метода.',
    ],
    solution: `class Person {
  constructor(public name: string, public age: number) {}

  greet(): string {
    return \`Hi, I'm \${this.name}, \${this.age} years old\`;
  }
}

class Employee extends Person {
  constructor(name: string, age: number, public salary: number) {
    super(name, age);
  }

  greet(): string {
    return \`\${super.greet()}, salary: \${this.salary}\`;
  }
}`,
    testCases: [
      {
        name: 'Person.greet() содержит имя',
        run: `
          const { Person } = userFn;
          const p = new Person('Alice', 30);
          const g = p.greet();
          if (!g.includes('Alice')) throw new Error('greet() должен содержать "Alice", получено: "' + g + '"');
          if (!g.includes('30')) throw new Error('greet() должен содержать "30"');
        `,
      },
      {
        name: 'Employee наследует name и добавляет salary',
        run: `
          const { Employee } = userFn;
          const emp = new Employee('Bob', 25, 5000);
          if (emp.name !== 'Bob') throw new Error('emp.name должно быть "Bob"');
          if (emp.salary !== 5000) throw new Error('emp.salary должно быть 5000');
          const g = emp.greet();
          if (!g.includes('Bob')) throw new Error('Employee.greet() должен содержать "Bob"');
          if (!g.includes('5000')) throw new Error('Employee.greet() должен содержать "5000"');
        `,
      },
    ],
  },

  // ── #12 ─────────────────────────────────────────────────────────
  {
    id: 'promise-race',
    number: 12,
    title: 'Свой race(promises)',
    difficulty: 'medium',
    category: 'async',
    tags: ['Promise', 'Async', 'race'],
    description: `Реализуйте функцию \`race(promises)\`, которая работает аналогично \`Promise.race()\`: возвращает промис, разрешающийся (или отклоняющийся) **первым же** settled промисом.

**Использовать сам \`Promise.race\` нельзя.**`,
    examples: [
      { input: 'race([slow(50ms → "slow"), fast(10ms → "fast")])', output: '"fast"' },
      { input: 'race([fast reject, slow resolve])', output: 'rejected with fast error' },
    ],
    starterCode: `function race(promises) {
  return new Promise((resolve, reject) => {
    // итерируйте promises
  });
}`,
    hints: [
      'Для каждого промиса вызовите .then(resolve, reject).',
      'Первый сработавший вызовет resolve/reject — остальные проигнорируются автоматически.',
      'Promise.resolve(p) защищает от не-промисов.',
    ],
    solution: `function race(promises) {
  return new Promise((resolve, reject) => {
    for (const p of promises) {
      Promise.resolve(p).then(resolve, reject);
    }
  });
}`,
    testCases: [
      {
        name: 'Быстрый промис побеждает',
        run: `
          const p1 = new Promise(r => setTimeout(() => r('slow'), 80));
          const p2 = new Promise(r => setTimeout(() => r('fast'), 10));
          const result = await userFn([p1, p2]);
          if (result !== 'fast') throw new Error('Ожидалось "fast", получено "' + result + '"');
        `,
      },
      {
        name: 'Быстрый reject пробрасывается',
        run: `
          const p1 = new Promise((_, r) => setTimeout(() => r(new Error('fail')), 10));
          const p2 = new Promise(r => setTimeout(() => r('ok'), 80));
          try {
            await userFn([p1, p2]);
            throw new Error('Должен был reject');
          } catch(e) {
            if (e.message !== 'fail') throw new Error('Ожидалась ошибка "fail", получено: ' + e.message);
          }
        `,
      },
    ],
  },

  // ── #41 ─────────────────────────────────────────────────────────
  {
    id: 'promise-all',
    number: 41,
    title: 'Свой all(promises)',
    difficulty: 'medium',
    category: 'async',
    tags: ['Promise', 'Async', 'all'],
    description: `Реализуйте \`all(promises)\` — аналог \`Promise.all()\`: ждёт **все** промисы и возвращает массив значений в **исходном порядке**. При первом отказе — отклоняется.

**Использовать \`Promise.all\` нельзя.**`,
    examples: [
      { input: "all([Promise.resolve('a'), Promise.resolve('b')])", output: "['a', 'b']" },
      { input: 'all([ok, reject("err"), ok])', output: 'rejected with "err"' },
    ],
    starterCode: `function all(promises) {
  return new Promise((resolve, reject) => {
    // результаты по индексу, при ошибке — reject
  });
}`,
    hints: [
      'Создайте results = new Array(promises.length).',
      'Считайте resolved. Когда === length → resolve(results).',
      'Сохраняйте results[i] = value, НЕ results.push() — иначе нарушится порядок.',
      'При reject любого → сразу reject(error).',
    ],
    solution: `function all(promises) {
  return new Promise((resolve, reject) => {
    if (promises.length === 0) return resolve([]);
    const results = new Array(promises.length);
    let resolved = 0;
    promises.forEach((p, i) => {
      Promise.resolve(p).then(value => {
        results[i] = value;
        if (++resolved === promises.length) resolve(results);
      }, reject);
    });
  });
}`,
    testCases: [
      {
        name: 'Сохраняет порядок (b resolve быстрее)',
        run: `
          const ps = [
            new Promise(r => setTimeout(() => r('a'), 30)),
            new Promise(r => setTimeout(() => r('b'), 5)),
            new Promise(r => setTimeout(() => r('c'), 15)),
          ];
          const result = await userFn(ps);
          if (!Array.isArray(result)) throw new Error('Должен вернуть массив');
          if (result.join(',') !== 'a,b,c') throw new Error('Порядок должен быть a,b,c, получено: ' + result.join(','));
        `,
      },
      {
        name: 'Отклоняется при первой ошибке',
        run: `
          const ps = [
            new Promise(r => setTimeout(() => r('ok'), 50)),
            new Promise((_, rj) => setTimeout(() => rj(new Error('boom')), 10)),
          ];
          try {
            await userFn(ps);
            throw new Error('Должен был reject');
          } catch(e) {
            if (e.message !== 'boom') throw new Error('Ожидалась ошибка "boom"');
          }
        `,
      },
      {
        name: 'all([]) → []',
        run: `
          const r = await userFn([]);
          if (!Array.isArray(r) || r.length !== 0) throw new Error('all([]) должен вернуть []');
        `,
      },
    ],
  },

  // ── #51 ─────────────────────────────────────────────────────────
  {
    id: 'event-emitter',
    number: 51,
    title: 'EventEmitter — on / off / emit',
    difficulty: 'hard',
    category: 'patterns',
    tags: ['Patterns', 'pub/sub', 'Classes'],
    description: `Реализуйте класс \`EventEmitter\` с методами:
- \`on(event, fn)\` — подписаться
- \`off(event, fn)\` — отписаться **по ссылке**
- \`emit(event, ...args)\` — вызвать всех слушателей

Должно поддерживаться несколько слушателей одного события.`,
    examples: [
      { input: 'emitter.on("foo", fn); emitter.emit("foo", 2, 5)', output: 'fn(2, 5) вызван' },
      { input: 'emitter.off("foo", fn); emitter.emit("foo", ...)', output: 'fn НЕ вызван' },
    ],
    starterCode: `class EventEmitter {
  constructor() {
    // хранилище слушателей
  }

  on(event, fn) {
    // добавить fn для event
  }

  off(event, fn) {
    // удалить fn для event по ссылке
  }

  emit(event, ...args) {
    // вызвать всех слушателей
  }
}`,
    hints: [
      'this._listeners = {} — словарь { event: [fn1, fn2, ...] }',
      'on(): если нет массива — создай, push(fn).',
      'off(): filter(l => l !== fn) по === ссылке.',
      'emit(): forEach(fn => fn(...args)).',
    ],
    solution: `class EventEmitter {
  constructor() {
    this._listeners = {};
  }

  on(event, fn) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(fn);
  }

  off(event, fn) {
    if (!this._listeners[event]) return;
    this._listeners[event] = this._listeners[event].filter(l => l !== fn);
  }

  emit(event, ...args) {
    if (!this._listeners[event]) return;
    [...this._listeners[event]].forEach(fn => fn(...args));
  }
}`,
    testCases: [
      {
        name: 'on + emit вызывает слушателя',
        run: `
          const em = new userFn();
          const calls = [];
          em.on('test', (a, b) => calls.push(a + b));
          em.emit('test', 3, 4);
          if (calls[0] !== 7) throw new Error('Слушатель не вызван, ожидалось 7');
        `,
      },
      {
        name: 'Несколько слушателей одного события',
        run: `
          const em = new userFn();
          const log = [];
          em.on('x', () => log.push('a'));
          em.on('x', () => log.push('b'));
          em.emit('x');
          if (log.join('') !== 'ab') throw new Error('Оба слушателя должны вызваться, получено: ' + log.join(''));
        `,
      },
      {
        name: 'off удаляет слушателя по ссылке',
        run: `
          const em = new userFn();
          const log = [];
          function handler() { log.push('called'); }
          em.on('ev', handler);
          em.emit('ev');
          em.off('ev', handler);
          em.emit('ev');
          if (log.length !== 1) throw new Error('После off handler не должен вызываться, log.length = ' + log.length);
        `,
      },
    ],
  },

  // ── #31 ─────────────────────────────────────────────────────────
  {
    id: 'with-retry',
    number: 31,
    title: 'withRetry — повторные попытки с задержкой',
    difficulty: 'hard',
    category: 'async',
    tags: ['Async', 'Error handling', 'Exponential backoff'],
    description: `Реализуйте \`withRetry(fn, { retries, delayMs })\`, которая вызывает асинхронную \`fn()\` и повторяет до \`retries\` раз при ошибке с **экспоненциальной задержкой** (\`delayMs\`, \`delayMs*2\`, \`delayMs*4\`...).

После исчерпания попыток — пробрасывает последнюю ошибку.`,
    examples: [
      {
        input: 'withRetry(failTwice, { retries: 3, delayMs: 10 })',
        output: 'Успех на 3-й попытке',
      },
      {
        input: 'withRetry(alwaysFail, { retries: 2, delayMs: 10 })',
        output: 'reject с последней ошибкой',
        note: 'Делает 1 + 2 = 3 попытки всего (первая + 2 retry)',
      },
    ],
    starterCode: `async function withRetry(fn, { retries, delayMs }) {
  // попробуйте fn(), при ошибке — ждите и повторите
  // задержка: delayMs * 2^attempt
}`,
    hints: [
      'for (let attempt = 0; attempt <= retries; attempt++)',
      'try { return await fn(); } catch(e) { if (attempt === retries) throw e; }',
      'await new Promise(r => setTimeout(r, delayMs * 2 ** attempt)) перед retry.',
    ],
    solution: `async function withRetry(fn, { retries, delayMs }) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (e) {
      if (attempt === retries) throw e;
      await new Promise(r => setTimeout(r, delayMs * Math.pow(2, attempt)));
    }
  }
}`,
    testCases: [
      {
        name: 'Успешно после 2 неудач',
        run: `
          let calls = 0;
          async function flaky() {
            calls++;
            if (calls < 3) throw new Error('not yet');
            return 'success';
          }
          const result = await userFn(flaky, { retries: 3, delayMs: 1 });
          if (result !== 'success') throw new Error('Ожидался "success"');
          if (calls !== 3) throw new Error('Должно быть 3 вызова, было: ' + calls);
        `,
      },
      {
        name: 'Бросает ошибку после исчерпания попыток',
        run: `
          let calls = 0;
          async function alwaysFail() { calls++; throw new Error('always fail'); }
          try {
            await userFn(alwaysFail, { retries: 2, delayMs: 1 });
            throw new Error('Должен был reject');
          } catch(e) {
            if (e.message !== 'always fail') throw new Error('Неправильная ошибка: ' + e.message);
            if (calls !== 3) throw new Error('retries=2 → 3 вызова, было: ' + calls);
          }
        `,
      },
    ],
  },

  // ── #43 ─────────────────────────────────────────────────────────
  {
    id: 'then-to-await',
    number: 43,
    title: 'Перепишите .then/.catch на async/await',
    difficulty: 'medium',
    category: 'async',
    tags: ['Async', 'await', 'refactoring'],
    description: `Перепишите функцию \`fetchUser(name)\`, реализованную через цепочку \`.then/.catch\`, на \`async/await\`.

Исходный код:
\`\`\`js
function fetchUser(name) {
  return fetch('https://api.github.com/users/' + name)
    .then(res => {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(user => user.login)
    .catch(err => { console.error(err); return null; });
}
\`\`\`

Напишите \`async function fetchUser(name)\` с тем же поведением.`,
    examples: [
      { input: 'fetchUser("octocat")', output: '"octocat" (или null при ошибке)' },
    ],
    starterCode: `async function fetchUser(name) {
  // try/catch + await fetch
}`,
    hints: [
      'try { const res = await fetch(...); ... } catch(err) { ... return null; }',
      'Проверьте res.ok перед res.json().',
      'catch должен логировать ошибку и возвращать null.',
    ],
    solution: `async function fetchUser(name) {
  try {
    const res = await fetch('https://api.github.com/users/' + name);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const user = await res.json();
    return user.login;
  } catch(err) {
    console.error(err);
    return null;
  }
}`,
    testCases: [
      {
        name: 'Функция async и возвращает Promise',
        run: `
          const result = userFn('test');
          if (!(result instanceof Promise)) throw new Error('fetchUser должна возвращать Promise');
        `,
      },
      {
        name: 'При ошибке fetch возвращает null',
        run: `
          // Mock fetch to throw
          const origFetch = globalThis.fetch;
          globalThis.fetch = async () => { throw new Error('Network error'); };
          try {
            const result = await userFn('anyone');
            if (result !== null) throw new Error('При сетевой ошибке должен вернуться null, получено: ' + result);
          } finally {
            globalThis.fetch = origFetch;
          }
        `,
      },
    ],
  },

  // ── #55 ─────────────────────────────────────────────────────────
  {
    id: 'spa-router',
    number: 55,
    title: 'SPA-роутер без фреймворка',
    difficulty: 'hard',
    category: 'spa',
    tags: ['SPA', 'history API', 'routing'],
    description: `Реализуйте класс \`Router\` для SPA-роутинга **без фреймворков**:

- \`addRoute(path, handler)\` — регистрирует маршрут
- \`navigate(path)\` — меняет URL через \`history.pushState\` и вызывает нужный handler
- \`init()\` — инициализирует роутер, слушает \`popstate\`

Кнопки «назад/вперёд» должны работать.`,
    examples: [
      { input: "router.addRoute('/', () => render('Home'))", output: "navigate('/') → render('Home')" },
    ],
    starterCode: `class Router {
  constructor() {
    this.routes = {};
  }

  addRoute(path, handler) {
    // зарегистрировать маршрут
  }

  navigate(path) {
    // history.pushState + вызвать handler
  }

  init() {
    // popstate listener + текущий маршрут
  }
}`,
    hints: [
      'this.routes[path] = handler',
      'navigate: history.pushState({}, "", path); this.routes[path]?.();',
      'init: window.addEventListener("popstate", () => this.routes[location.pathname]?.())',
    ],
    solution: `class Router {
  constructor() {
    this.routes = {};
  }

  addRoute(path, handler) {
    this.routes[path] = handler;
  }

  navigate(path) {
    history.pushState({}, '', path);
    if (this.routes[path]) this.routes[path]();
  }

  init() {
    window.addEventListener('popstate', () => {
      const handler = this.routes[location.pathname];
      if (handler) handler();
    });
    const handler = this.routes[location.pathname];
    if (handler) handler();
  }
}`,
    testCases: [
      {
        name: 'addRoute + navigate вызывает handler',
        run: `
          const router = new userFn();
          const log = [];
          router.addRoute('/test', () => log.push('home'));
          router.navigate('/test');
          if (log[0] !== 'home') throw new Error('navigate должен вызывать handler, log: ' + JSON.stringify(log));
        `,
      },
      {
        name: 'navigate меняет URL',
        run: `
          const router = new userFn();
          router.addRoute('/about', () => {});
          router.navigate('/about');
          if (location.pathname !== '/about') throw new Error('location.pathname должно быть "/about", получено: ' + location.pathname);
        `,
      },
    ],
  },
];

export const getDifficultyColor = (d: Difficulty) => ({
  easy: '#22c55e',
  medium: '#f59e0b',
  hard: '#ef4444',
}[d]);

export const getDifficultyLabel = (d: Difficulty) => ({
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
}[d]);

export const getCategoryLabel = (c: Category) => ({
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  async: 'Async/Promise',
  patterns: 'Patterns',
  react: 'React',
  spa: 'SPA',
}[c]);
