import type { SkillNode } from '../types';

// ═══════════════════════════════════════════════
// БЛОК: Практические задачи (Practice.md)
// Coding + Find-the-Bug задачи из банка зачёта
// ═══════════════════════════════════════════════
export const PRACTICE_TS_CODING: SkillNode = {
  id: 'practice-ts-coding',
  title: 'Практика: TypeScript',
  category: 'TypeScript',
  description: 'Реальные практические задачи из банка зачёта. Generics, utility types, классы.',
  iconName: 'Code',
  lessons: [
    {
      id: 'ts-practice-lesson',
      title: 'TypeScript на практике',
      xpReward: 20,
      slides: [
        // ─────────────────────────────────────────
        // Practice #3 — identity generic
        // ─────────────────────────────────────────
        {
          type: 'coding',
          title: 'Practice #3 — identity<T>',
          description: 'Напишите generic-функцию `identity`, которая принимает аргумент любого типа и возвращает то же самое значение, сохраняя его тип.\n\n```ts\nconst a = identity(42);       // a: number\nconst b = identity("hello");  // b: string\n```',
          starterCode: `function identity<T>(value: T): T {
// напишите решение
}`,
          hints: [
            'Используйте T как тип и для аргумента, и для возвращаемого значения.',
            'Generic-функция объявляется с <T> перед скобками параметров.',
            'Реализация одна строка: return value;',
          ],
          referenceSolution: `function identity<T>(value: T): T {
return value;
}`,
          explanation: 'identity — базовая generic-функция. <T> — type parameter, "захватывает" тип аргумента. Без generics пришлось бы использовать any, что потеряло бы типовую информацию. Применение: type-safe утилиты, фабрики, HOC-паттерны.',
          testSuite: `
            try {
              const userFn = new Function(userCode + '\\nreturn identity;')();
              
              if (typeof userFn !== 'function') {
                return { success: false, logs: ['identity должна быть функцией'] };
              }
              
              const num = userFn(42);
              if (num !== 42) {
                return { success: false, logs: [\`identity(42) должна вернуть 42, получено: \${num}\`] };
              }
              
              const str = userFn('hello');
              if (str !== 'hello') {
                return { success: false, logs: [\`identity("hello") должна вернуть "hello", получено: \${str}\`] };
              }
              
              const obj = { x: 1, y: 2 };
              const result = userFn(obj);
              if (result !== obj) {
                return { success: false, logs: ['identity(obj) должна вернуть тот же объект (по ссылке)'] };
              }
              
              return { success: true, logs: ['Отлично! identity<T> работает корректно для number, string и object.'] };
            } catch (e) {
              return { success: false, logs: [\`Ошибка: \${e.message}\`] };
            }
          `,
        },
        // ─────────────────────────────────────────
        // Practice #23 — class Bus
        // ─────────────────────────────────────────
        {
          type: 'coding',
          title: 'Practice #23 — класс Bus',
          description: 'Напишите класс `Bus` со свойствами `make`, `model`, `year` и методом `getInfo()`.\n\n```ts\nconst bus = new Bus("Mercedes", "Sprinter", 2024);\nbus.getInfo(); // "Mercedes Sprinter (2024)"\n```',
          starterCode: `class Bus {
// объявите свойства и конструктор

getInfo(): string {
  // верните строку формата "make model (year)"
}
}`,
          hints: [
            'Конструктор принимает три аргумента: make, model, year.',
            'getInfo() возвращает строку через шаблонный литерал.',
            'Можно использовать shorthand: constructor(public make: string, ...) {}',
          ],
          referenceSolution: `class Bus {
constructor(
  public make: string,
  public model: string,
  public year: number
) {}

getInfo(): string {
  return \`\${this.make} \${this.model} (\${this.year})\`;
}
}`,
          explanation: 'TypeScript-классы используют shorthand public/private в конструкторе для автоматического создания свойств. getInfo() использует template literal для форматирования строки.',
          testSuite: `
            try {
              const userFn = new Function(userCode + '\\nreturn Bus;')();
              
              if (typeof userFn !== 'function') {
                return { success: false, logs: ['Bus должен быть классом (функцией-конструктором)'] };
              }
              
              const bus = new userFn('Mercedes', 'Sprinter', 2024);
              
              if (bus.make !== 'Mercedes') {
                return { success: false, logs: [\`bus.make должно быть 'Mercedes', получено: \${bus.make}\`] };
              }
              if (bus.model !== 'Sprinter') {
                return { success: false, logs: [\`bus.model должно быть 'Sprinter', получено: \${bus.model}\`] };
              }
              if (bus.year !== 2024) {
                return { success: false, logs: [\`bus.year должно быть 2024, получено: \${bus.year}\`] };
              }
              
              const info = bus.getInfo();
              if (info !== 'Mercedes Sprinter (2024)') {
                return { success: false, logs: [\`getInfo() должен вернуть "Mercedes Sprinter (2024)", получено: "\${info}"\`] };
              }
              
              // Test with different values
              const bus2 = new userFn('Volvo', 'B8R', 2022);
              if (bus2.getInfo() !== 'Volvo B8R (2022)') {
                return { success: false, logs: [\`Для Volvo B8R 2022 ожидается "Volvo B8R (2022)", получено: "\${bus2.getInfo()}"\`] };
              }
              
              return { success: true, logs: ['Отлично! Класс Bus работает корректно.'] };
            } catch (e) {
              return { success: false, logs: [\`Ошибка: \${e.message}\`] };
            }
          `,
        },
        // ─────────────────────────────────────────
        // Practice #49 — Person + Employee
        // ─────────────────────────────────────────
        {
          type: 'coding',
          title: 'Practice #49 — Person и Employee extends Person',
          description: 'Напишите класс `Person` с полями `name`, `age` и методом `greet()`. Создайте класс `Employee extends Person` с полем `salary` и переопределённым `greet()`, использующим `super.greet()`.',
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
            'super(name, age) — вызов конструктора родителя обязателен первым.',
            'super.greet() — вызов метода родителя из переопределённого метода.',
            'Employee.greet() должен содержать информацию и из Person.greet(), и о salary.',
          ],
          referenceSolution: `class Person {
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
          explanation: 'extends позволяет наследовать методы и свойства родителя. super() в конструкторе — обязательный вызов родительского конструктора. super.greet() — вызов перекрытого метода родителя (аналог parent:: в PHP, super() в Java).',
          testSuite: `
            try {
              const userFn = new Function(userCode + '\\nreturn { Person, Employee };')();
              const { Person, Employee } = userFn;
              
              if (!Person || !Employee) {
                return { success: false, logs: ['Оба класса Person и Employee должны быть объявлены'] };
              }
              
              const person = new Person('Alice', 30);
              if (person.name !== 'Alice') return { success: false, logs: ['person.name должно быть "Alice"'] };
              if (person.age !== 30) return { success: false, logs: ['person.age должно быть 30'] };
              
              const personGreet = person.greet();
              if (typeof personGreet !== 'string' || !personGreet.includes('Alice')) {
                return { success: false, logs: [\`Person.greet() должен содержать имя "Alice", получено: "\${personGreet}"\`] };
              }
              
              const emp = new Employee('Bob', 25, 5000);
              if (emp.salary !== 5000) return { success: false, logs: ['emp.salary должно быть 5000'] };
              if (emp.name !== 'Bob') return { success: false, logs: ['Employee должен наследовать name от Person'] };
              
              const empGreet = emp.greet();
              if (!empGreet.includes('Bob')) {
                return { success: false, logs: [\`Employee.greet() должен содержать имя "Bob", получено: "\${empGreet}"\`] };
              }
              if (!empGreet.includes('5000')) {
                return { success: false, logs: [\`Employee.greet() должен содержать salary "5000", получено: "\${empGreet}"\`] };
              }
              
              return { success: true, logs: ['Отлично! Классы Person и Employee работают корректно с наследованием и super.'] };
            } catch (e) {
              return { success: false, logs: [\`Ошибка: \${e.message}\`] };
            }
          `,
        },
        // ─────────────────────────────────────────
        // Practice #51 — EventEmitter
        // ─────────────────────────────────────────
        {
          type: 'coding',
          title: 'Practice #51 — EventEmitter (on / off / emit)',
          description: 'Реализуйте класс `EventEmitter` с методами `on(event, fn)`, `off(event, fn)`, `emit(event, ...args)`. Должно поддерживаться несколько слушателей и аккуратное удаление по ссылке.\n\n```js\nconst emitter = new EventEmitter();\nemitter.on("data", fn);\nemitter.emit("data", 1, 2); // вызывает fn(1, 2)\nemitter.off("data", fn);\nemitter.emit("data", 1, 2); // fn не вызывается\n```',
          starterCode: `class EventEmitter {
// хранилище слушателей

on(event, fn) {
  // подписать fn на event
}

off(event, fn) {
  // отписать fn от event (по ссылке)
}

emit(event, ...args) {
  // вызвать всех слушателей event с аргументами args
}
}`,
          hints: [
            'Используйте объект {} или Map для хранения: { eventName: [fn1, fn2, ...] }',
            'on() — добавить fn в массив слушателей события.',
            'off() — отфильтровать fn из массива (по === ссылке).',
            'emit() — перебрать массив и вызвать каждый fn(...args).',
          ],
          referenceSolution: `class EventEmitter {
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
  this._listeners[event].forEach(fn => fn(...args));
}
}`,
          explanation: 'EventEmitter — паттерн publish/subscribe. Хранит слушателей в словаре {event: [fn, ...]}. off() использует filter() с проверкой по ссылке (===). emit() вызывает копию массива слушателей — защита от изменений во время итерации.',
          testSuite: `
            try {
              const userFn = new Function(userCode + '\\nreturn EventEmitter;')();
              
              const emitter = new userFn();
              const results = [];
              
              function addSum(a, b) { results.push(\`sum:\${a + b}\`); }
              function addProduct(a, b) { results.push(\`product:\${a * b}\`); }
              
              emitter.on('foo', addSum);
              emitter.emit('foo', 2, 5);
              if (!results.includes('sum:7')) {
                return { success: false, logs: [\`emit('foo', 2, 5) должен вызвать on-слушатель. Результаты: [\${results}]\`] };
              }
              
              emitter.on('foo', addProduct);
              emitter.emit('foo', 4, 5);
              if (!results.includes('sum:9')) return { success: false, logs: ['Второй emit должен вызвать addSum(4,5)=9'] };
              if (!results.includes('product:20')) return { success: false, logs: ['Второй emit должен вызвать addProduct(4,5)=20'] };
              
              emitter.off('foo', addSum);
              const beforeOff = results.length;
              emitter.emit('foo', -3, 9);
              if (!results.includes('product:-27')) return { success: false, logs: ['После off(addSum), addProduct(-3,9)=-27 должен вызваться'] };
              
              // Проверим что addSum НЕ вызывался после off
              const sumAfterOff = results.filter(r => r === 'sum:6'); // -3+9=6
              if (sumAfterOff.length > 0) {
                return { success: false, logs: ['addSum вызвался после off() — он должен быть удалён'] };
              }
              
              return { success: true, logs: ['Отлично! EventEmitter работает: on, off, emit с несколькими слушателями.'] };
            } catch (e) {
              return { success: false, logs: [\`Ошибка: \${e.message}\`] };
            }
          `,
        },
      ],
    },
  ],
};
