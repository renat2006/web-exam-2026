import type { SkillNode } from '../types';

// ═══════════════════════════════════════════════
// БЛОК 8: Классы и ООП в JavaScript
// Theory вопросы: #31
// ═══════════════════════════════════════════════
export const JS_CLASSES: SkillNode = {
  id: 'js-classes',
  title: 'Классы и ООП в JavaScript',
  category: 'JavaScript',
  description: 'ES6-классы, конструктор, наследование extends/super, статические методы, прототипы.',
  iconName: 'Code',
  lessons: [
    {
      id: 'classes-lesson',
      title: 'Классы vs конструкторы функций',
      xpReward: 10,
      slides: [
        {
          type: 'theory',
          title: 'ES6-классы и прототипное наследование',
          definition:
            'class в JavaScript — синтаксический сахар над прототипным наследованием. «Под капотом» методы хранятся в prototype объекта, а не в каждом экземпляре. Классы не вводят новую модель ООП — они лишь удобная форма старой прототипной системы.',
          comparison: {
            title: 'ES6-класс vs функция-конструктор',
            headers: ['Аспект', 'ES6 class', 'Функция-конструктор'],
            rows: [
              ['Синтаксис', 'Понятный, декларативный', 'Громоздкий, через prototype'],
              ['Hoisting', 'Нет (как let)', 'Да (function declaration)'],
              ['Строгий режим', 'Всегда strict mode', 'Только если указан'],
              ['Наследование', 'extends + super', 'Object.create() + call()'],
              ['Статические методы', 'static keyword', 'ClassName.method = ...'],
              ['Под капотом', 'Тот же прототип!', 'Тот же прототип!'],
            ],
          },
          pitfalls: [
            'super() ДОЛЖЕН быть вызван в конструкторе дочернего класса ДО обращения к this.',
            'Статические методы (static) принадлежат классу, не экземплярам. user.describe() — TypeError.',
            'Классы НЕ всплывают — нельзя использовать до объявления (в отличие от function declaration).',
            'Методы класса не перечисляемы (non-enumerable) — for...in их не выведет.',
          ],
          keyTerms: [
            { term: 'constructor', definition: 'Метод класса для инициализации экземпляра — вызывается при new ClassName()' },
            { term: 'extends', definition: 'Наследование: дочерний класс получает все методы родителя' },
            { term: 'super()', definition: 'Вызов конструктора родительского класса — обязателен в дочернем конструкторе' },
            { term: 'static', definition: 'Статический метод/свойство принадлежит классу, а не экземплярам' },
            { term: 'prototype', definition: 'Объект, в котором хранятся методы класса — разделяются всеми экземплярами' },
          ],
          mnemonic: 'class = красивая обёртка над прототипами. new = «создай экземпляр». extends = «наследую родителя». super() = «сначала инициализируй родителя, потом я».',
          codeSnippet: `class User {
constructor(name, email) {
  this.name = name;
  this.email = email;
}
login() { console.log(\`\${this.name} вошёл\`); }
static create(name) { return new User(name, ''); }
}

class Admin extends User {
constructor(name, email, permissions) {
  super(name, email); // СНАЧАЛА super!
  this.permissions = permissions;
}
ban(userId) { console.log(\`Пользователь \${userId} забанен\`); }
}

const admin = new Admin('Анна', 'a@b.com', ['edit']);
admin.login(); // унаследован от User
admin.ban(42);
User.create('Гость'); // статический метод`,
        },
        {
          type: 'multiple-choice',
          question: 'В чём принципиальная разница между ES6-классами и функциями-конструкторами в JavaScript?',
          options: [
            'Классы вводят полноценную классическую ООП-модель, функции-конструкторы используют прототипы',
            'Нет принципиальной разницы — классы это синтаксический сахар над той же прототипной системой',
            'Функции-конструкторы поддерживают наследование, классы — нет',
            'Классы работают быстрее функций-конструкторов в современных браузерах',
          ],
          correctIndex: 1,
          explanation:
            'ES6-классы — синтаксический сахар. Под капотом: методы класса хранятся в User.prototype, конструктор — обычная функция. При наследовании Admin.prototype.__proto__ = User.prototype — та же цепочка прототипов. Отличия: классы не всплывают, всегда в строгом режиме, удобнее для extends.',
        },
        {
          type: 'multiple-choice',
          question: 'Что произойдёт если вызвать this.role = "admin" ПЕРЕД super() в конструкторе дочернего класса?',
          options: [
            'this.role установится в "admin", затем вызовется конструктор родителя',
            'ReferenceError — this недоступен до вызова super()',
            'SyntaxError — super() должен быть последней строкой конструктора',
            'super() проигнорируется, если this уже инициализирован',
          ],
          correctIndex: 1,
          explanation:
            'В конструкторе дочернего класса this недоступен до вызова super(). Сначала должен быть инициализирован родительский объект. Обращение к this до super() вызывает ReferenceError: Must call super constructor in derived class before accessing \'this\'.',
        },
        {
          type: 'true-false',
          question: 'Статический метод класса можно вызвать на экземпляре: const user = new User(); user.staticMethod();',
          correctValue: false,
          explanation:
            'Статические методы принадлежат классу, а не экземплярам. user.staticMethod() вызовет TypeError: user.staticMethod is not a function. Правильный вызов: User.staticMethod(). Статические методы типично используют для фабрик (User.createGuest()) или утилит (User.validate(data)).',
        },
      ],
    },
  ],
};
