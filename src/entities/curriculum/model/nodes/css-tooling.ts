import type { SkillNode } from '../types';

// ═══════════════════════════════════════════════
// БЛОК 4: CSS Modules и UI-библиотеки
// Theory вопросы: #5, #6, #13, #15
// ═══════════════════════════════════════════════
export const CSS_TOOLING: SkillNode = {
  id: 'css-tooling',
  title: 'CSS: Sass, Modules и UI-библиотеки',
  category: 'HTML/CSS',
  description: 'Инструменты CSS, CSS Modules, Sass, PostCSS, сравнение UI-библиотек.',
  iconName: 'Layout',
  lessons: [
    {
      id: 'css-modules-sass',
      title: 'Sass, PostCSS и CSS Modules',
      xpReward: 10,
      slides: [
        {
          type: 'theory',
          title: 'Современные инструменты CSS',
          definition:
            'Sass — препроцессор CSS: добавляет переменные, вложенность, миксины, наследование. PostCSS — постпроцессор: обрабатывает готовый CSS через плагины (Autoprefixer, cssnano). CSS Modules — изолирует стили на уровне модуля, исключая конфликты классов.',
          comparison: {
            title: 'Подходы к организации CSS в проектах',
            headers: ['Подход', 'Решаемая проблема', 'Риски'],
            rows: [
              ['BEM', 'Именование классов (Block__Element--Modifier)', 'Длинные имена классов'],
              ['CSS Modules', 'Изоляция стилей — нет глобальных конфликтов классов', 'Сложнее переопределять стили извне'],
              ['CSS-in-JS (styled-components)', 'Стили вместе с компонентом, динамически', 'Медленнее (runtime), сложный DX'],
              ['Utility-first (Tailwind)', 'Готовые утилитарные классы — быстрая разработка', 'Грязный HTML, трудно кастомизировать'],
            ],
          },
          pitfalls: [
            'CSS Modules генерирует уникальные хеши к именам классов: .button → .button_a1b2c3. Нельзя использовать в JS как просто строку.',
            'Tailwind и MUI/Ant Design — разные подходы: Tailwind даёт примитивы, компонентные библиотеки — готовые компоненты со своим дизайном.',
            'Sass-переменные ($color: #333) и CSS-переменные (--color: #333) — разные механизмы. CSS-переменные доступны в runtime.',
          ],
          keyTerms: [
            { term: 'Sass', definition: 'Препроцессор CSS: добавляет переменные, миксины, вложенность — компилируется в чистый CSS' },
            { term: 'PostCSS', definition: 'Постпроцессор: применяет плагины к готовому CSS (Autoprefixer, cssnano)' },
            { term: 'CSS Modules', definition: 'Локальная область видимости стилей — классы уникальны для каждого модуля' },
            { term: 'Autoprefixer', definition: 'PostCSS-плагин, добавляющий вендорные префиксы (-webkit-, -moz-) автоматически' },
            { term: 'Utility-first', definition: 'Подход Tailwind: применяй готовые атомарные классы прямо в HTML' },
          ],
          mnemonic: 'Sass → пишешь удобнее → компилируется в CSS. PostCSS → берёт CSS → обрабатывает плагинами. CSS Modules → твой .button + хеш → никаких конфликтов.',
        },
        {
          type: 'multiple-choice',
          question: 'Какую проблему решают CSS Modules?',
          options: [
            'Добавляют переменные и вложенность в CSS, как Sass',
            'Устраняют глобальные конфликты имён классов — каждый модуль получает изолированные уникальные классы',
            'Минифицируют и оптимизируют CSS-файлы для продакшна',
            'Позволяют писать CSS прямо в JavaScript-компонентах',
          ],
          correctIndex: 1,
          explanation:
            'CSS Modules решают проблему глобального пространства имён в CSS: класс .button в одном файле может случайно затронуть .button в другом. CSS Modules автоматически генерируют уникальные имена классов (например, .button_a1b2c3), изолируя стили в рамках модуля.',
        },
        {
          type: 'multiple-choice',
          question: 'В чём принципиальная разница между Material UI и Tailwind CSS?',
          options: [
            'Material UI — бесплатный, Tailwind — платный',
            'Material UI — готовые компоненты с дизайном (кнопки, диалоги); Tailwind — набор атомарных утилит для построения своего дизайна',
            'Tailwind работает только с React, Material UI — с любым фреймворком',
            'Нет разницы — оба предоставляют готовые UI-компоненты',
          ],
          correctIndex: 1,
          explanation:
            'Компонентные библиотеки (Material UI, Ant Design, Semantic UI) предоставляют готовые компоненты со встроенным дизайном: Button, Modal, Table. Вы быстро собираете UI, но ограничены их дизайном. Tailwind — utility-first: даёт атомарные классы (flex, p-4, text-blue-500), из которых вы строите свой дизайн. Максимальная гибкость, но медленнее на старте.',
        },
        // ✅ Theory #13 — точная формулировка
        {
          type: 'multiple-choice',
          question: 'Какие есть современные инструменты CSS? Для чего используется Sass и PostCSS?',
          options: [
            'Sass и PostCSS — одно и то же',
            'Sass — CSS-препроцессор: добавляет переменные, вложенность, миксины, функции. PostCSS — постпроцессор: трансформирует CSS через плагины (autoprefixer, CSS Modules, минификация)',
            'PostCSS заменяет CSS полностью, Sass — только для цветов',
            'Оба инструмента нужны только для IE11',
          ],
          correctIndex: 1,
          explanation:
            'Sass — препроцессор: пишешь .scss, компилируется в CSS. Фичи: переменные ($color: red), вложенность (.parent { .child {} }), миксины (@mixin), наследование (@extend), функции. PostCSS — не препроцессор, а трансформатор готового CSS через плагины: Autoprefixer (добавляет -webkit- префиксы), css-modules (изолирует классы), cssnano (минификация), postcss-preset-env (современный CSS в старых браузерах). Vite и Webpack оба поддерживают оба инструмента.',
        },
        // ✅ Theory #15 — точная формулировка
        {
          type: 'multiple-choice',
          question: 'Какие подходы к организации CSS в крупных проектах вы знаете (BEM, CSS Modules, CSS-in-JS, utility-first)? Сравните их.',
          options: [
            'Существует только один правильный подход — CSS-in-JS',
            'BEM (соглашение об именовании, нет изоляции), CSS Modules (изоляция компилятором, .module.css), CSS-in-JS (стили в JS, динамика, runtime), Tailwind/utility-first (атомарные классы, нет конфликтов)',
            'BEM и CSS Modules — одно и то же',
            'Utility-first подход нельзя использовать в больших проектах',
          ],
          correctIndex: 1,
          explanation:
            'Сравнение: BEM (Block__Element--Modifier) — соглашение об именовании (.card__title--active), изоляции нет, только дисциплина. CSS Modules — компилятор делает классы уникальными (.title → .title_hash123), нет конфликтов, работает с любым фреймворком. CSS-in-JS (styled-components, emotion) — стили в JS, динамические стили через props, критически важный CSS в SSR, runtime-стоимость. Utility-first (Tailwind) — атомарные классы прямо в HTML, не надо придумывать имена, но длинные строки className.',
        },
      ],
    },
  ],
};
