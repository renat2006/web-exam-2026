import type { SkillNode } from '../types';

// ═══════════════════════════════════════════════
// БЛОК: TypeScript (Week 05)
// Theory вопросы: #64–82
// ═══════════════════════════════════════════════
export const TYPESCRIPT: SkillNode = {
  id: 'typescript',
  week: 5,
  title: 'TypeScript',
  description: 'Типизация, интерфейсы, дженерики, утилитарные типы, ООП в TypeScript',
  lessons: [],
  topics: [
    {
      id: 'ts-basics',
      title: 'Основы TypeScript',
      slides: [
        {
          type: 'theory',
          title: 'Что такое TypeScript и зачем он нужен?',
          content: `**TypeScript** — надстройка над JavaScript, добавляющая **статическую типизацию**. Компилируется в обычный JS.

**Принципы:**
- Статическая типизация — ошибки ловятся на этапе сборки
- Структурная типизация — важна форма объекта, а не его происхождение
- Типы можно добавлять постепенно (отлично для миграции)

**Базовые типы:** \`string\`, \`number\`, \`boolean\`, \`any\`, \`unknown\`, \`void\`, \`never\`, \`null\`, \`undefined\`

**Запуск:** \`ts-node\` (без компиляции) или \`tsc\` + \`node\`

**tsconfig.json** — главный конфиг: \`target\`, \`module\`, \`strict\`, \`esModuleInterop\`

**Интерфейсы** описывают форму объекта, поддерживают \`extends\` и декларативное слияние.
**Type** — псевдоним типа, нельзя переоткрывать. Поддерживает объединения (\`|\`) и пересечения (\`&\`).

**Дженерики** — параметры типа \`<T>\`, позволяют писать универсальный код без потери типизации.

**Утилитарные типы:** \`Partial<T>\`, \`Required<T>\`, \`Readonly<T>\`, \`Pick<T,K>\`, \`Omit<T,K>\`, \`Record<K,V>\`, \`Exclude<T,U>\`, \`Extract<T,U>\`, \`NonNullable<T>\`, \`ReturnType<T>\`

**Модификаторы доступа:** \`public\`, \`private\`, \`protected\`, \`readonly\` — работают на уровне компиляции.`,
        },
        // ✅ Theory #75 — точная формулировка
        {
          type: 'multiple-choice',
          question: 'Что такое TypeScript и зачем использовать его вместо JavaScript?',
          options: [
            'TypeScript — это новый язык программирования, несовместимый с JavaScript',
            'TypeScript — надстройка над JavaScript со статической типизацией; ошибки ловятся на этапе разработки, улучшается автодополнение, код проще поддерживать в команде',
            'TypeScript работает только на бэкенде с Node.js',
            'TypeScript заменяет JavaScript только в больших проектах, а в маленьких бесполезен',
          ],
          correctIndex: 1,
          explanation:
            'TypeScript = JavaScript + статическая типизация. Компилируется в обычный JS. Преимущества: (1) Ошибки ловятся на этапе разработки, а не в браузере у пользователя. (2) Автодополнение и рефакторинг в редакторе. (3) Код становится самодокументируемым. (4) Единые правила для всей команды. (5) Постепенная миграция: можно добавлять типы по частям. Файлы .ts компилируются через tsc в .js. Runtime у TypeScript нет — всё выполняет обычный JS-движок.',
        },
        // ✅ Theory #64 — точная формулировка
        {
          type: 'multiple-choice',
          question: 'Каковы основные особенности TypeScript?',
          options: [
            'Только статическая типизация',
            'Статическая типизация, структурная типизация, интерфейсы, дженерики, утилитарные типы, модификаторы доступа (public/private/protected), компиляция в JS, совместимость с JS-кодом',
            'TypeScript добавляет новые возможности в рантайме',
            'TypeScript — это фреймворк для React',
          ],
          correctIndex: 1,
          explanation:
            'Основные особенности TypeScript: (1) Статическая типизация — проверка типов при компиляции. (2) Структурная типизация — важна форма, а не имя типа. (3) Интерфейсы и типы для описания структур данных. (4) Дженерики для универсального кода. (5) Утилитарные типы (Partial, Pick, Omit и др.). (6) Модификаторы доступа для ООП. (7) Компилируется в JavaScript — не добавляет новых возможностей в рантайме. (8) Совместимость: любой JS-файл — валидный TypeScript.',
        },
        // ✅ Theory #65 — точная формулировка
        {
          type: 'multiple-choice',
          question: 'Какие типы данных встроены в TypeScript?',
          options: [
            'Только string, number, boolean',
            'Примитивы: string, number, bigint, boolean, null, undefined, symbol; объектные: object, array, function; специальные: any, unknown, void, never',
            'В TypeScript нет своих типов — только из JavaScript',
            'TypeScript добавляет только any и unknown',
          ],
          correctIndex: 1,
          explanation:
            'Встроенные типы TypeScript: Примитивы: string, number, bigint, boolean, null, undefined, symbol. Объектные: object ({}), Array<T> или T[], Function. Специальные: any (отключает проверки), unknown (безопасная альтернатива any — нужна проверка перед использованием), void (нет возвращаемого значения у функции), never (невозможное значение — throw/бесконечный цикл). Также: tuple ([string, number]), enum, литеральные типы ("a" | "b" | "c").',
        },
        // ✅ Theory #66 / #69 — точная формулировка
        {
          type: 'multiple-choice',
          question: 'Что такое интерфейс в TypeScript?',
          options: [
            'Интерфейс — это то же самое что класс в TypeScript',
            'Интерфейс описывает форму объекта или класса: какие поля и методы должны быть. Поддерживает extends, необязательные поля (?), и декларативное слияние (можно объявить несколько раз)',
            'Интерфейсы используются только для типизации функций',
            'Интерфейс — это runtime-объект, который существует в скомпилированном JS',
          ],
          correctIndex: 1,
          explanation:
            'interface в TypeScript описывает форму данных (контракт). Особенности: (1) Описывает поля и методы объекта. (2) extends — расширение: interface Admin extends User { role: string }. (3) Необязательные поля: discount?: number. (4) Декларативное слияние: два interface с одним именем объединяются в один (полезно для расширения типов библиотек). (5) Нельзя использовать для union/intersection — только extends. Отличие от type: interface можно "переоткрыть", type — нет.',
        },
        // ✅ Theory #77 — точная формулировка
        {
          type: 'multiple-choice',
          question: 'В чём разница между `interface` и `type` в TypeScript?',
          options: [
            'Они абсолютно одинаковы',
            'interface поддерживает декларативное слияние и extends; type поддерживает union (|) и intersection (&), нельзя переоткрыть. В реальных проектах: interface — для моделей данных, type — для union и утилит',
            'type устаревший синтаксис, нужно использовать только interface',
            'interface только для классов, type только для примитивов',
          ],
          correctIndex: 1,
          explanation:
            'Сравнение interface и type: interface — декларативное слияние (можно объявить 2 раза, объединятся), extends для наследования, подходит для объектов и классов. type — псевдоним любого типа (union: A | B, intersection: A & B, примитивы, tuple), нельзя переоткрыть, не поддерживает слияние. Общее: оба описывают структуру объекта, оба поддерживают implements в классах. Практика: interface для User, Product (модели данных); type для ApiResponse = Success | Error (union), для утилитарных комбинаций.',
        },
        // ✅ Theory #67 — точная формулировка
        {
          type: 'multiple-choice',
          question: 'Как компилировать TypeScript файл?',
          options: [
            'TypeScript компилируется автоматически в браузере без команд',
            'npx tsc (компилирует все файлы по tsconfig.json) или npx tsc файл.ts. Альтернатива — ts-node для запуска без явной компиляции',
            'Только через Webpack, вручную скомпилировать нельзя',
            'Командой node file.ts',
          ],
          correctIndex: 1,
          explanation:
            'Компиляция TypeScript: (1) npx tsc — компилирует весь проект по tsconfig.json, создаёт .js файлы. (2) npx tsc src/index.ts — компилирует конкретный файл. (3) ts-node src/index.ts — компилирует в память и сразу выполняет (без .js на диске). (4) Сборщики (Webpack + ts-loader, Vite) — компилируют при сборке проекта. tsconfig.json задаёт: target (версия JS), module, strict, outDir (куда класть .js). После компиляции node src/index.js запускает результат.',
        },
        // ✅ Theory #78 — точная формулировка
        {
          type: 'multiple-choice',
          question: 'Чем тип `unknown` в TypeScript отличается от `any`?',
          options: [
            'unknown и any — синонимы',
            'unknown требует проверки типа перед использованием (type narrowing); any отключает все проверки — с ним можно делать что угодно. unknown безопаснее',
            'unknown только для async функций, any для sync',
            'any устаревший, unknown заменяет его везде',
          ],
          correctIndex: 1,
          explanation:
            'any vs unknown: any — "всё разрешено": можно вызывать методы, обращаться к полям, TypeScript молчит. Теряется вся типобезопасность. unknown — "неизвестный тип": перед использованием нужна проверка типа (typeof x === "string", instanceof, type guard). Без проверки — ошибка компилятора. Правило: никогда не используй any без крайней необходимости. unknown — безопасная альтернатива когда тип действительно неизвестен (JSON.parse возвращает any, лучше явно указать unknown).',
        },
        // ✅ Theory #68 / #79 — точная формулировка
        {
          type: 'multiple-choice',
          question: 'Объясните, что такое дженерики (generics) в TypeScript.',
          options: [
            'Дженерики — это обычные функции без типов',
            'Дженерик — параметр типа <T>: позволяет написать функцию/класс/интерфейс, работающий с разными типами, сохраняя типобезопасность без дублирования кода и без any',
            'Дженерики используются только в массивах',
            'Дженерики — это утилитарные типы Partial и Pick',
          ],
          correctIndex: 1,
          explanation:
            'Дженерик = "параметр типа". function identity<T>(arg: T): T — принимает любой тип, возвращает тот же. Использование: identity<string>("hello") или identity(42) (TypeScript выводит T=number сам). Применение в классе: class Box<T> { content: T }. Ограничения: <T extends { length: number }> — T обязан иметь length. Array<T>, Promise<T>, Map<K,V> — всё это встроенные дженерики. Когда использовать: когда логика одинаковая, но тип данных разный (сортировка, контейнеры, API-обёртки).',
        },
        // ✅ Theory #70 — точная формулировка
        {
          type: 'multiple-choice',
          question: 'Что такое утилитарные типы (utility types)?',
          options: [
            'Утилитарные типы — это пользовательские функции для работы с данными',
            'Встроенные в TypeScript типы, создающие новые типы на основе существующих: Partial<T>, Required<T>, Readonly<T>, Pick<T,K>, Omit<T,K>, Record<K,V>, Exclude, Extract, NonNullable, ReturnType',
            'Утилитарные типы — это типы только из сторонних библиотек',
            'Утилитарные типы работают только с примитивами',
          ],
          correctIndex: 1,
          explanation:
            'Утилитарные типы — встроенные "функции над типами": Partial<T> — все поля необязательными. Required<T> — все поля обязательными. Readonly<T> — запрещает изменение. Pick<T, "a"|"b"> — берёт только указанные поля. Omit<T, "email"> — убирает указанные поля. Record<K, V> — объект с ключами типа K и значениями типа V. Exclude<A|B|C, B> → A|C. Extract<A|B, A|C> → A. NonNullable<T|null> → T. ReturnType<typeof fn> — тип возврата функции. Зачем: избегать дублирования типов.',
        },
        // ✅ Theory #72 — точная формулировка
        {
          type: 'multiple-choice',
          question: 'Что делает тип Omit?',
          options: [
            'Omit добавляет новые поля к типу',
            'Omit<T, K> создаёт новый тип на основе T, исключая указанные ключи K. Например: Omit<User, "email"> — тип User без поля email',
            'Omit делает все поля необязательными',
            'Omit<T, K> оставляет только указанные ключи (это Pick)',
          ],
          correctIndex: 1,
          explanation:
            'Omit<T, K> — обратный Pick: исключает ключи. Пример: interface User { id: number; name: string; email: string; }. type UserWithoutEmail = Omit<User, "email"> → { id: number; name: string }. Можно исключить несколько: Omit<User, "email" | "id">. Типичный use case: создать DTO для создания записи без поля id (оно генерируется на сервере): type CreateUser = Omit<User, "id">. Pick — обратный: оставляет только указанные поля.',
        },
        // ✅ Theory #71 — точная формулировка
        {
          type: 'multiple-choice',
          question: 'В чем преимущества использования TypeScript?',
          options: [
            'TypeScript только замедляет разработку без реальных преимуществ',
            'Раннее обнаружение ошибок, улучшенное автодополнение, самодокументируемый код, безопасный рефакторинг, единые правила в команде, структурная типизация',
            'TypeScript ускоряет работу приложения в браузере',
            'TypeScript полезен только в очень крупных проектах (500+ компонентов)',
          ],
          correctIndex: 1,
          explanation:
            'Преимущества TypeScript: (1) Ранние ошибки: опечатки, неверные типы данных — ещё в редакторе. (2) IDE-поддержка: автодополнение, переход к определению, рефакторинг. (3) Самодокументируемость: типы — документация к API/функциям. (4) Безопасный рефакторинг: переименование поля сразу видно во всех местах. (5) Командная разработка: явный контракт между частями кода. (6) Постепенная миграция: любой JS-код — валидный TypeScript. Минусы: дополнительная настройка, время на написание типов, компиляция.',
        },
        // ✅ Theory #73 — точная формулировка
        {
          type: 'multiple-choice',
          question: 'В чем разница между implements и extends?',
          options: [
            'Они делают одно и то же',
            'extends — наследование (класс от класса или интерфейс от интерфейса); implements — реализация контракта (класс обязуется иметь все поля/методы интерфейса)',
            'implements только для абстрактных классов',
            'extends только для интерфейсов, implements только для классов',
          ],
          correctIndex: 1,
          explanation:
            'extends: класс наследует класс (class Dog extends Animal) — получает его поля и методы. интерфейс расширяет интерфейс (interface Admin extends User). implements: класс реализует интерфейс (class UserService implements IUserService) — обязуется иметь все поля и методы интерфейса. Если не реализует — ошибка компиляции. Ключевое отличие: extends даёт реализацию по наследству, implements задаёт контракт без реализации. Класс может одновременно: class A extends B implements C, D.',
        },
        // ✅ Theory #76 — точная формулировка
        {
          type: 'multiple-choice',
          question: 'Когда использовать интерфейсы, а когда — классы в TypeScript?',
          options: [
            'Всегда использовать классы — они мощнее',
            'Интерфейс — для описания формы данных (контракт, DTO, модель API) без логики. Класс — когда нужно состояние + методы + наследование + создание экземпляров через new',
            'Интерфейсы устарели — только type alias',
            'Классы только для React-компонентов',
          ],
          correctIndex: 1,
          explanation:
            'Интерфейс: описывает структуру данных без реализации. Компилируется в ничто (в JS не существует). Используй для: типизации объектов (User, Product), контрактов API (ResponseDTO), параметров функций. Класс: создаёт конструктор, методы, поля — существует в JS-рантайме. Используй для: создания экземпляров (new), инкапсуляции состояния и логики, наследования с реализацией. Золотое правило: если нужно только описать форму данных — interface. Если нужно поведение и состояние — class.',
        },
        // ✅ Theory #80 — точная формулировка
        {
          type: 'multiple-choice',
          question: 'Что такое структурная типизация (structural typing) в TypeScript? Чем она отличается от номинальной типизации в Java/C#?',
          options: [
            'Структурная типизация — это когда тип определяется именем класса',
            'В TypeScript важна форма (структура полей) объекта, а не его имя/происхождение. Если объект имеет нужные поля — он совместим. В Java/C# нужно явно объявить implements',
            'Структурная типизация запрещает использовать интерфейсы',
            'Структурная и номинальная типизация — одно и то же',
          ],
          correctIndex: 1,
          explanation:
            'Структурная типизация (duck typing): TypeScript проверяет форму объекта — есть ли нужные поля. Если объект имеет все поля интерфейса — он ему соответствует, даже без явного implements. Пример: interface Printable { print(): void }. Класс Dog { print() { console.log("woof") } } — Dog совместим с Printable без объявления. Номинальная типизация (Java, C#): нужно явно написать implements Printable. Практическое следствие: в TypeScript можно передавать "чужие" объекты там, где ожидается интерфейс — если структура совпадает.',
        },
        // ✅ Theory #81 — точная формулировка
        {
          type: 'multiple-choice',
          question: 'Что такое discriminated unions и как с их помощью обеспечить exhaustiveness check через тип `never`?',
          options: [
            'Discriminated unions — это просто union типов без особых правил',
            'Discriminated union — union с общим полем-дискриминатором (kind/type). TypeScript сужает тип в switch/if. Exhaustiveness check: в default ветке присваиваем значение переменной типа never — если какой-то case пропущен, будет ошибка',
            'never используется только в функциях, которые бросают ошибку',
            'Exhaustiveness check не нужен если есть default в switch',
          ],
          correctIndex: 1,
          explanation:
            'Discriminated union: type Shape = { kind: "circle"; r: number } | { kind: "square"; x: number }. Поле kind — дискриминатор. В switch(shape.kind) { case "circle": /* TypeScript знает r доступен */ }. Exhaustiveness check через never: в default: const _: never = shape; — если добавить новый вид фигуры и забыть обработать его в switch, TypeScript выдаст ошибку (нельзя присвоить новый тип к never). Паттерн защищает от "забытых" веток при расширении union.',
        },
        // ✅ Theory #74 — точная формулировка
        {
          type: 'multiple-choice',
          question: 'Когда нужно использовать ключевое слово declare?',
          options: [
            'declare используется для объявления приватных переменных класса',
            'declare говорит TypeScript: «эта переменная/функция/модуль существует во время выполнения, но определена вне этого файла (например, в глобальном скрипте или внешней библиотеке)». Создаёт типы без генерации JS-кода',
            'declare нужен для объявления всех глобальных переменных',
            'declare — синоним const, только для TypeScript',
          ],
          correctIndex: 1,
          explanation:
            'declare используется в .d.ts файлах (declaration files) и в коде для описания вещей, которые существуют в runtime, но TypeScript о них не знает. Примеры: declare const __DEV__: boolean (webpack-переменная); declare module "*.svg" { const c: string; export default c } (импорт SVG); declare global { interface Window { myLib: MyLib } } (расширение глобального Window). declare НЕ генерирует JavaScript-код — только добавляет информацию о типах для компилятора.',
        },
        // ✅ Theory #82 — точная формулировка
        {
          type: 'multiple-choice',
          question: 'Что такое conditional types и ключевое слово `infer`? Реализуйте `ReturnType<T>` самостоятельно.',
          options: [
            'Conditional types — это if/else в TypeScript только для значений, а не для типов',
            'Conditional types: T extends U ? X : Y — тип-выражение «если T совместим с U — тип X, иначе Y». infer — извлекает тип из шаблона: type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never',
            'infer — ключевое слово для вывода типов в функциях (как let для значений)',
            'Conditional types работают только с примитивами',
          ],
          correctIndex: 1,
          explanation:
            'Conditional types: T extends U ? X : Y — на уровне системы типов. Пример: type IsString<T> = T extends string ? true : false. infer внутри extends-условия извлекает тип: type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never. Здесь infer R «захватывает» возвращаемый тип функции T. Если T — функция, R = её return type; иначе — never. Реализация: type MyReturnType<T extends (...args: any[]) => any> = T extends (...args: any[]) => infer R ? R : never. Это мощный инструмент для создания утилитарных типов.',
          codeSnippet: `// Conditional types + infer
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

type R1 = ReturnType<() => string>;        // string
type R2 = ReturnType<(x: number) => boolean>; // boolean

// Ещё пример — извлечь тип Promise
type Awaited<T> = T extends Promise<infer V> ? V : T;
type A = Awaited<Promise<number>>; // number`,
        },
      ],
    },
  ],
};
