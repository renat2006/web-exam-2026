import type { SkillNode } from '../types';

// ═══════════════════════════════════════════════
// БЛОК 7: DOM, поиск и манипуляции
// Theory вопросы: #18, #19, #20, #21
// ═══════════════════════════════════════════════
export const JS_DOM: SkillNode = {
  id: 'js-dom',
  title: 'DOM — структура и манипуляции',
  category: 'JavaScript',
  description: 'Что такое DOM, методы поиска элементов, обработчики событий, добавление элементов.',
  iconName: 'Code',
  lessons: [
    {
      id: 'dom-basics',
      title: 'DOM и поиск элементов',
      xpReward: 10,
      slides: [
        {
          type: 'theory',
          title: 'Что такое DOM?',
          definition:
            'DOM (Document Object Model) — объектное представление HTML-документа, предоставляемое браузером. Браузер парсит HTML и создаёт дерево объектов-узлов. JavaScript может читать и изменять этот граф объектов — изменения немедленно отражаются на странице.',
          diagram: {
            type: 'flow',
            title: 'Структура DOM-дерева',
            items: [
              'document (корень)',
              '└── <html>',
              '    ├── <head> → <title>, <meta>',
              '    └── <body>',
              '        ├── <h1 id="title"> → "Привет"',
              '        └── <p class="text"> → "Абзац"',
            ],
          },
          comparison: {
            title: 'Методы поиска элементов в DOM',
            headers: ['Метод', 'Возвращает', 'Живая коллекция?'],
            rows: [
              ['getElementById(id)', 'Один элемент или null', 'Нет'],
              ['querySelector(css)', 'Первый элемент или null', 'Нет'],
              ['querySelectorAll(css)', 'NodeList (все подходящие)', 'Нет (статическая)'],
              ['getElementsByClassName(cls)', 'HTMLCollection (все)', 'Да (автообновляется)'],
              ['getElementsByTagName(tag)', 'HTMLCollection (все)', 'Да'],
            ],
          },
          pitfalls: [
            'HTMLCollection — не массив: у неё нет forEach, map, filter. Конвертируйте через Array.from() или [...collection].',
            'querySelectorAll возвращает NodeList — можно перебирать for...of, но нет .map(). Конвертируйте через Array.from().',
            'querySelector/getElementById возвращают null (не undefined) если элемент не найден.',
            'DOM — интерфейс браузера (Web API), не часть языка JavaScript. Node.js не имеет DOM по умолчанию.',
          ],
          keyTerms: [
            { term: 'DOM', definition: 'Document Object Model — древовидное объектное представление HTML в браузере' },
            { term: 'querySelector', definition: 'Находит первый элемент по CSS-селектору' },
            { term: 'querySelectorAll', definition: 'Находит все элементы по CSS-селектору, возвращает NodeList' },
            { term: 'NodeList', definition: 'Коллекция DOM-узлов — не массив, но поддерживает forEach и for...of' },
            { term: 'HTMLCollection', definition: 'Живая коллекция DOM-элементов — автоматически обновляется при изменении DOM' },
          ],
          mnemonic: 'querySelector — как CSS, только в JS. getElementById — быстро, только для id. querySelectorAll — все совпадения. HTMLCollection — живая (сама обновляется), NodeList — снимок.',
        },
        {
          type: 'theory',
          title: 'Обработчики событий и добавление элементов',
          definition:
            'addEventListener — современный способ добавления обработчиков событий. Создание элементов: createElement → настройка → appendChild/append в DOM. innerHTML — быстро но опасно (XSS). textContent — безопасно для текста.',
          comparison: {
            title: 'innerHTML vs textContent',
            headers: ['Свойство', 'Парсит HTML?', 'Безопасность', 'Когда использовать'],
            rows: [
              ['innerHTML', 'Да', 'Опасно (XSS)', 'Вставка разметки из доверенного источника'],
              ['textContent', 'Нет (текст)', 'Безопасно', 'Вставка пользовательского текста'],
            ],
          },
          pitfalls: [
            'innerHTML с пользовательским вводом → XSS-атака. Злоумышленник внедряет <script>alert(1)</script>.',
            'addEventListener лучше onclick атрибута — можно добавить несколько обработчиков, легче удалить.',
            'createElement создаёт элемент в памяти — он не виден, пока не добавлен в DOM через appendChild/append.',
            'classList.toggle(class) — добавляет класс если нет, удаляет если есть. Удобно для переключений.',
          ],
          keyTerms: [
            { term: 'addEventListener', definition: 'Добавляет обработчик события на элемент: el.addEventListener("click", handler)' },
            { term: 'createElement', definition: 'Создаёт новый DOM-элемент в памяти: document.createElement("div")' },
            { term: 'appendChild / append', definition: 'Вставляет элемент в конец дочерних узлов родителя' },
            { term: 'classList', definition: 'API для работы с классами: add, remove, toggle, contains' },
            { term: 'XSS', definition: 'Cross-Site Scripting — внедрение вредоносного JS через innerHTML' },
          ],
          mnemonic: 'createElement → настроить → appendChild. textContent — безопасно. innerHTML — только если доверяешь источнику. addEventListener — всегда вместо onclick атрибута.',
          codeSnippet: `// Добавление элемента на страницу
const btn = document.createElement('button');
btn.textContent = 'Нажми меня';
btn.classList.add('primary-btn');
document.body.appendChild(btn);

// Обработчик события
btn.addEventListener('click', (event) => {
console.log('Нажали!', event.target);
btn.classList.toggle('active');
});

// Безопасная вставка текста
const output = document.getElementById('output');
const userInput = '<script>alert(1)</script>'; // опасный ввод
output.textContent = userInput; // безопасно — отобразится как текст
// output.innerHTML = userInput; // опасно!`,
        },
        {
          type: 'multiple-choice',
          question: 'Какой метод предпочтительнее для поиска элементов в современном коде?',
          options: [
            'getElementsByClassName — возвращает живую коллекцию, которая всегда актуальна',
            'getElementById — самый быстрый метод для любых задач',
            'querySelector и querySelectorAll — универсальные, поддерживают любые CSS-селекторы',
            'document.all — поддерживается всеми браузерами с IE',
          ],
          correctIndex: 2,
          explanation:
            'querySelector и querySelectorAll предпочтительны: они принимают любой CSS-селектор (класс, id, атрибут, вложенность), что делает их гибкими. getElementById быстрее для поиска по id, но ограничен только id. getElementsByClassName возвращает живую коллекцию (редко нужно) без forEach.',
        },
        {
          type: 'coding',
          title: 'Динамическое добавление элементов',
          description: 'Напишите функцию `addItem(text)`, которая создаёт элемент <li> с переданным текстом и добавляет его в список `#todo-list`. Используйте createElement и textContent (не innerHTML).',
          starterCode: `function addItem(text) {
// Напишите решение здесь

}`,
          domSetup: `
            <ul id="todo-list" style="list-style: none; padding: 10px; border: 1px solid #334155; border-radius: 6px; min-height: 40px;">
            </ul>
            <p id="count" style="color: #94a3b8; margin-top: 8px;">Элементов: 0</p>
          `,
          hints: [
            'Получите список через document.getElementById("todo-list").',
            'Создайте элемент: const li = document.createElement("li").',
            'Задайте текст: li.textContent = text — безопасно, в отличие от innerHTML.',
            'Добавьте в список: list.appendChild(li).',
          ],
          referenceSolution: `function addItem(text) {
const list = document.getElementById('todo-list');
const li = document.createElement('li');
li.textContent = text;
list.appendChild(li);

const count = document.getElementById('count');
if (count) count.textContent = 'Элементов: ' + list.children.length;
}`,
          explanation:
            'Паттерн: 1) найти родителя, 2) создать элемент через createElement, 3) настроить его свойства (textContent, classList, dataset), 4) добавить в DOM через appendChild. textContent безопасен — он экранирует HTML-символы, предотвращая XSS.',
          testSuite: `
            try {
              const userFn = new Function('document', userCode + '\\nreturn addItem;');
              const addItem = userFn(document);
              
              if (typeof addItem !== 'function') {
                return { success: false, logs: ['addItem должна быть функцией'] };
              }

              const list = document.getElementById('todo-list');
              const initialCount = list.children.length;
              
              addItem('Купить продукты');
              
              if (list.children.length !== initialCount + 1) {
                return { success: false, logs: ['После вызова addItem в списке должен появиться новый элемент'] };
              }
              
              const li = list.children[list.children.length - 1];
              if (li.tagName !== 'LI') {
                return { success: false, logs: [\`Добавленный элемент должен быть <li>, получен: \${li.tagName}\`] };
              }
              
              if (li.textContent !== 'Купить продукты') {
                return { success: false, logs: [\`Текст элемента должен быть "Купить продукты", получено: "\${li.textContent}"\`] };
              }
              
              // Проверка безопасности — не должен парсить HTML
              addItem('<b>жирный</b>');
              const li2 = list.children[list.children.length - 1];
              if (li2.innerHTML !== '&lt;b&gt;жирный&lt;/b&gt;' && li2.children.length > 0) {
                return { success: false, logs: ['Используй textContent, а не innerHTML — это небезопасно!'] };
              }
              
              return { success: true, logs: ['Отлично! Элементы добавляются корректно и безопасно.'] };
            } catch (e) {
              return { success: false, logs: [\`Ошибка: \${e.message}\`] };
            }
          `,
        },
        // ✅ Theory #18 — точная формулировка
        {
          type: 'multiple-choice',
          question: 'Что такое DOM?',
          options: [
            'DOM — это язык программирования для браузера',
            'DOM (Document Object Model) — объектная модель документа: древовидное представление HTML в памяти браузера, через которое JS может читать и изменять содержимое, структуру и стили страницы',
            'DOM — это база данных для хранения состояния приложения',
            'DOM — это то же самое, что HTML-файл',
          ],
          correctIndex: 1,
          explanation:
            'DOM (Document Object Model) — API браузера: браузер парсит HTML и строит дерево объектов в памяти. Каждый тег → узел (Node), текст → текстовый узел. Через DOM JS может: читать/изменять содержимое (element.textContent), изменять стили (element.style), добавлять/удалять элементы (appendChild, removeChild), реагировать на события (addEventListener). DOM ≠ HTML: JS может изменить DOM без изменения исходного HTML.',
        },
        // ✅ Theory #19 — точная формулировка
        {
          type: 'multiple-choice',
          question: 'Методы поиска элементов в DOM?',
          options: [
            'Только getElementById',
            'getElementById, getElementsByClassName, getElementsByTagName (устаревшие), querySelector (первый по CSS-селектору), querySelectorAll (все по CSS-селектору, NodeList)',
            'Только querySelector и querySelectorAll',
            'В современном JS элементы ищут только через React refs',
          ],
          correctIndex: 1,
          explanation:
            'Методы поиска в DOM: document.getElementById("id") — быстрый, по id. document.getElementsByClassName("cls") — живая HTMLCollection. document.getElementsByTagName("div") — живая HTMLCollection. document.querySelector(".cls #id") — первый совпадающий, любой CSS-селектор. document.querySelectorAll("li.active") — статический NodeList все совпадающие. Современный код: предпочитают querySelector/querySelectorAll как самые гибкие.',
        },
        // ✅ Theory #20 — точная формулировка
        {
          type: 'multiple-choice',
          question: 'Как добавить обработчик события на DOM-элемент?',
          options: [
            'Только через атрибут onclick="..." в HTML',
            'addEventListener("click", handler) — основной способ; позволяет несколько обработчиков на одно событие и управлять фазой (capturing/bubbling)',
            'Только через element.onclick = fn (перезаписывает предыдущий)',
            'Обработчики можно добавлять только при создании элемента',
          ],
          correctIndex: 1,
          explanation:
            '3 способа: (1) HTML-атрибут: <button onclick="fn()"> — устаревший, смешивает HTML и JS. (2) Свойство: element.onclick = fn — только один обработчик (новый перезаписывает). (3) addEventListener("click", fn, options) — современный: несколько обработчиков на одно событие, управление фазой через { capture: true }, удаление через removeEventListener. Всегда используй addEventListener в современном коде.',
        },
        // ✅ Theory #21 — точная формулировка
        {
          type: 'multiple-choice',
          question: 'Как динамически добавить элемент на HTML-страницу?',
          options: [
            'Только через innerHTML += "<div>..."',
            'document.createElement("div"), затем настроить (textContent, classList), затем parent.appendChild(el) или parent.append(el)',
            'Создать элемент можно только при загрузке страницы',
            'Нужно перезагрузить страницу чтобы добавить элемент',
          ],
          correctIndex: 1,
          explanation:
            'Алгоритм: (1) const el = document.createElement("div") — создать в памяти. (2) Настроить: el.textContent = "текст", el.className = "card", el.setAttribute("id", "my"). (3) Вставить: parent.appendChild(el) — в конец; parent.prepend(el) — в начало; parent.insertBefore(el, ref); el.after(sibling). Альтернатива: innerHTML = "..." — быстро, но опасно (XSS) и удаляет существующих обработчиков. Лучше createElement + appendChild.',
        },
        // ✅ Theory #17 — точная формулировка
        {
          type: 'multiple-choice',
          question: 'Для чего используется цикл for…of?',
          options: [
            'for...of итерирует по ключам объекта (как for...in)',
            'for...of итерирует по значениям любого итерируемого объекта: массив, строка, Map, Set, NodeList — получаем сами значения, а не индексы',
            'for...of работает только с массивами',
            'for...of и for...in — одно и то же',
          ],
          correctIndex: 1,
          explanation:
            'for...of — итерация по значениям итерируемых объектов. Работает с: Array, String, Map, Set, NodeList, arguments, generator. Пример: for (const item of [1,2,3]) → получаем 1, 2, 3 (не индексы). for...in — итерирует по ключам объекта (обходит перечислимые свойства включая унаследованные). Для объектов используй for...in или Object.keys/values/entries. for...of на обычный {} → ошибка (не итерируемый).',
        },
      ],
    },
  ],
};
