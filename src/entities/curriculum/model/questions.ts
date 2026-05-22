import type { SkillNode } from './types';

export const SKILL_NODES: SkillNode[] = [
  {
    id: 'http-basics',
    title: 'Протокол HTTP',
    category: 'HTTP',
    description: 'Взаимодействие клиента и сервера, методы запросов, заголовки и циклы запроса-ответа.',
    iconName: 'Globe',
    lessons: [
      {
        id: 'http-intro',
        title: 'Основы HTTP и запросы',
        xpReward: 10,
        slides: [
          {
            type: 'theory',
            title: 'Что такое HTTP?',
            definition: 'HTTP (Hypertext Transfer Protocol) — прикладной протокол передачи данных. Клиент (браузер) инициирует TCP-соединение, отправляет HTTP-запрос, а сервер обрабатывает его и возвращает HTTP-ответ.',
            comparison: {
              title: 'Основные методы HTTP',
              headers: ['Метод', 'Идемпотентность', 'Безопасность', 'Типичное использование'],
              rows: [
                ['GET', 'Да', 'Да', 'Запрос данных без изменения состояния.'],
                ['POST', 'Нет', 'Нет', 'Создание новых ресурсов или отправка данных.'],
                ['PUT', 'Да', 'Нет', 'Полная перезапись ресурса.'],
                ['DELETE', 'Да', 'Нет', 'Удаление указанного ресурса.'],
                ['PATCH', 'Нет', 'Нет', 'Частичное обновление ресурса.']
              ]
            },
            pitfalls: [
              'GET-запросы не должны изменять данные на сервере (нарушение идемпотентности).',
              'Параметры GET передаются в URL (лимит длины, логирование сервером), конфиденциальные данные шлите только в теле POST/PUT.'
            ],
            keyTerms: [
              { term: 'HTTP', definition: 'Протокол передачи гипертекста — правила обмена данными между клиентом и сервером' },
              { term: 'Идемпотентность', definition: 'Многократный вызов дает тот же результат, что и однократный' },
              { term: 'GET', definition: 'Безопасный запрос данных без изменения состояния сервера' },
              { term: 'POST', definition: 'Создание ресурса или отправка данных — не идемпотентный' },
            ],
            mnemonic: 'CRUD = Create (POST), Read (GET), Update (PUT), Delete (DELETE). Безопасные методы — только те, что не меняют данные: GET и HEAD.',
            diagram: {
              type: 'flow',
              title: 'Жизненный цикл HTTP-запроса',
              items: ['Клиент (браузер)', 'DNS-резолвинг', 'TCP-соединение', 'HTTP-запрос', 'Сервер обрабатывает', 'HTTP-ответ'],
            },
          },
          {
            type: 'multiple-choice',
            question: 'Какое из следующих утверждений верно относительно идемпотентности метода HTTP?',
            options: [
              'Метод POST идемпотентен, так как он отправляет одни и те же данные.',
              'Метод GET идемпотентен, потому что многократный вызов возвращает один результат без изменения состояния сервера.',
              'Все небезопасные методы являются неидемпотентными.',
              'DELETE не является идемпотентным, так как при втором вызове вернется ошибка 404.'
            ],
            correctIndex: 1,
            explanation: 'Метод является идемпотентным, если многократные повторные запросы приводят к тому же состоянию сервера, что и один запрос. GET, PUT, DELETE — идемпотентны. Второе удаление оставляет ресурс удаленным, состояние не меняется (хотя HTTP-код ответа может отличаться).'
          }
        ]
      }
    ]
  },
  {
    id: 'css-specifics',
    title: 'CSS Specificity & Семантика',
    category: 'HTML/CSS',
    description: 'Способы подключения стилей, вес селекторов и основы семантической верстки.',
    iconName: 'Layout',
    lessons: [
      {
        id: 'css-selectors',
        title: 'Приоритет CSS',
        xpReward: 10,
        slides: [
          {
            type: 'theory',
            title: 'Приоритет селекторов CSS',
            definition: 'Специфичность (specificity) определяет, какое правило применится к элементу. Она рассчитывается как кортеж весов: (inline-стили, IDs, классы/псевдоклассы/атрибуты, теги).',
            comparison: {
              title: 'Вес селекторов',
              headers: ['Тип селектора', 'Пример', 'Вес'],
              rows: [
                ['Инлайн стиль', 'style="..."', '1000'],
                ['Идентификатор (ID)', '#main-nav', '100'],
                ['Класс / Псевдокласс / Атрибут', '.item, :hover, [type="text"]', '10'],
                ['Тег / Псевдоэлемент', 'div, ::before', '1']
              ]
            },
            pitfalls: [
              'Селектор `*` имеет нулевой вес (0).',
              '`!important` не увеличивает специфичность, но принудительно перебивает любые веса. Использовать его — антипаттерн, ломающий каскад.',
              'Стили подключаются через тег <link>, inline в <style>, или атрибут style="". Инлайн имеет наивысший приоритет.'
            ],
            keyTerms: [
              { term: 'Специфичность', definition: 'Числовой вес селектора, определяющий приоритет применения стилей' },
              { term: '!important', definition: 'Принудительное перебивание каскада — антипаттерн, ломает предсказуемость' },
              { term: 'Каскад', definition: 'Механизм определения итоговых стилей из нескольких источников по приоритету' },
            ],
            mnemonic: 'Специфичность — это армия: 1 генерал (inline, 1000) побеждает 100 офицеров (ID, 100), 100 офицеров побеждают 10 сержантов (class, 10), а сержанты — рядовых (tag, 1). Универсальный селектор * — дезертир с весом 0.',
            diagram: {
              type: 'layers',
              title: 'Стек приоритетов CSS (сверху — высший)',
              items: ['!important (вне каскада)', 'inline style="..." — вес 1000', '#id селектор — вес 100', '.class / :pseudo / [attr] — вес 10', 'tag / ::pseudo-element — вес 1', '* (универсальный) — вес 0'],
            },
          },
          {
            type: 'order',
            question: 'Упорядочите CSS-селекторы по возрастанию их специфичности (от самого слабого к самому сильному):',
            items: [
              { id: 'tag', text: 'div' },
              { id: 'class-tag', text: 'div.active' },
              { id: 'id', text: '#title' },
              { id: 'inline', text: 'style="..." (инлайн)' },
              { id: 'universal', text: '*' }
            ],
            correctOrder: ['universal', 'tag', 'class-tag', 'id', 'inline'],
            explanation: 'Универсальный селектор (*) имеет вес 0. Селектор тега `div` имеет вес 1. Класс с тегом `div.active` имеет вес 11. Идентификатор `#title` — 100. Инлайн-стиль — 1000.'
          }
        ]
      }
    ]
  },
  {
    id: 'js-closures',
    title: 'Замыкания & Счётчики',
    category: 'JavaScript',
    description: 'Что такое замыкание, область видимости, лексическое окружение и как устроен счетчик.',
    iconName: 'Code',
    lessons: [
      {
        id: 'closures-lesson',
        title: 'Понятие замыкания',
        xpReward: 10,
        slides: [
          {
            type: 'theory',
            title: 'Замыкание (Closure)',
            definition: 'Замыкание — это способность функции запоминать свое лексическое окружение (Scope) и иметь к нему доступ даже после того, как она была вызвана вне своей исходной области видимости.',
            pitfalls: [
              'Использование переменной var в цикле с асинхронными вызовами (создается одна общая переменная на весь цикл). Решается заменой на let (блочная область видимости) или замыканием (IIFE).',
              'Утечки памяти: замыкания могут удерживать тяжелые переменные родительского скоупа, если ссылка на дочернюю функцию все еще жива.'
            ],
            keyTerms: [
              { term: 'Замыкание', definition: 'Функция + ссылка на лексическое окружение, в котором она была создана' },
              { term: 'Лексический scope', definition: 'Область видимости переменных, определяемая местом написания кода, а не вызова' },
              { term: 'IIFE', definition: 'Immediately Invoked Function Expression — немедленно вызываемая функция для изоляции scope' },
            ],
            mnemonic: 'Замыкание — это рюкзак функции: куда бы функция ни ушла, она несет с собой переменные из места рождения. Даже если родительская функция давно завершилась.',
            diagram: {
              type: 'flow',
              title: 'Как работает замыкание',
              items: ['Вызов createCounter()', 'Создается scope с count=0', 'Возвращается inner-функция', 'inner-функция уносит ссылку на scope', 'Каждый вызов inner() читает/меняет count'],
            },
            codeSnippet: `function createCounter() {
  let count = 0;
  return function() {
    return ++count;
  };
}
const counter = createCounter();
console.log(counter()); // 1
console.log(counter()); // 2`
          },
          {
            type: 'coding',
            title: 'Реализуйте makeCounter',
            description: 'Реализуйте функцию `makeCounter`, которая принимает необязательное начальное целое значение и возвращает функцию-счётчик. Каждый вызов возвращаемой функции должен увеличивать внутреннее значение на 1 и возвращать его.',
            starterCode: `function makeCounter(initialValue = 0) {
  // Напишите ваше решение здесь
  
}`,
            hints: [
              'Используйте внутреннюю переменную для хранения текущего значения.',
              'Возвращаемая функция должна увеличивать эту переменную на 1 при каждом вызове.',
              'Обратите внимание на начальное значение: если передано 10, первый вызов должен вернуть 11.'
            ],
            referenceSolution: `function makeCounter(initialValue = 0) {
  let count = initialValue;
  return function() {
    return ++count;
  };
}`,
            explanation: 'Функция `makeCounter` возвращает внутреннюю функцию. Благодаря механизму **замыкания (closure)**, эта внутренняя функция сохраняет доступ к переменной `count` из родительской области видимости. Переменная `count` живет в памяти между вызовами, и каждый запуск увеличивает её значение на 1.',
            testSuite: `
              try {
                const userFn = new Function(userCode + '\\nreturn makeCounter;');
                const makeCounter = userFn();
                
                if (typeof makeCounter !== 'function') {
                  return { success: false, logs: ['makeCounter должна быть функцией'] };
                }

                const c1 = makeCounter();
                if (typeof c1 !== 'function') {
                  return { success: false, logs: ['makeCounter() должна возвращать функцию-счетчик'] };
                }
                
                const val1 = c1();
                const val2 = c1();
                if (val1 !== 1 || val2 !== 2) {
                  return { success: false, logs: [\`Счетчик по умолчанию должен возвращать 1, затем 2. Получено: \${val1}, \${val2}\`] };
                }

                const c2 = makeCounter(10);
                const val3 = c2();
                const val4 = c2();
                if (val3 !== 11 || val4 !== 12) {
                  return { success: false, logs: [\`Счетчик с начальным значением 10 должен возвращать 11, затем 12. Получено: \${val3}, \${val4}\`] };
                }

                const c3 = makeCounter(-5);
                const val5 = c3();
                if (val5 !== -4) {
                  return { success: false, logs: [\`Счетчик с отрицательным значением -5 должен возвращать -4. Получено: \${val5}\`] };
                }

                return { success: true, logs: ['Все тесты пройдены успешно! Вы отлично справились с замыканиями.'] };
              } catch (e) {
                return { success: false, logs: [\`Ошибка при выполнении: \${e.message}\`] };
              }
            `
          }
        ]
      }
    ]
  },
  {
    id: 'js-delegation',
    title: 'Делегирование событий',
    category: 'JavaScript',
    description: 'Обработка событий на контейнере вместо сотен дочерних элементов.',
    iconName: 'Code',
    lessons: [
      {
        id: 'delegation-lesson',
        title: 'Event Delegation',
        xpReward: 10,
        slides: [
          {
            type: 'theory',
            title: 'Делегирование событий',
            definition: 'Делегирование событий использует всплытие (event bubbling): мы вешаем один обработчик на общего предка и проверяем `event.target`, чтобы понять, на каком конкретно элементе произошло событие.',
            pitfalls: [
              'Если внутри кнопки есть вложенный тег (например, <i>), `event.target` укажет на `<i>`, а не на `<button>`. Нужно использовать метод `.closest("button")` для поиска целевого элемента.',
              'Не все события всплывают (например, `focus`, `blur`, `load` не всплывают).'
            ],
            keyTerms: [
              { term: 'Всплытие (bubbling)', definition: 'Событие поднимается от целевого элемента вверх по DOM-дереву к document' },
              { term: 'event.target', definition: 'Элемент, на котором событие фактически произошло (клик по кнопке внутри div)' },
              { term: '.closest()', definition: 'Метод поиска ближайшего предка (включая сам элемент), подходящего под селектор' },
            ],
            mnemonic: 'Событие — камень в пруд: ныряет сверху вниз (capturing), достигает дна (target), всплывает обратно наверх (bubbling). Делегирование — ловить рябь на поверхности вместо погружения за каждым камнем.',
            diagram: {
              type: 'flow',
              title: 'Фазы обработки события',
              items: ['Document', 'Capture (сверху вниз)', 'Target (целевой элемент)', 'Bubble (снизу вверх)', 'Document'],
            },
            codeSnippet: `container.addEventListener('click', (event) => {
  const btn = event.target.closest('.btn');
  if (btn) {
    console.log(btn.dataset.index);
  }
});`
          },
          {
            type: 'coding',
            title: 'Делегирование событий на кнопках',
            description: 'Дана HTML разметка с контейнером `#btn-container`, внутри которого лежит несколько кнопок с атрибутами `data-index="1"`, `data-index="2"` и т.д. Напишите код, который вешает ОДИН обработчик на контейнер. При клике на кнопку нужно вывести её номер (значение атрибута `data-index`) в элемент `<output id="result">`. Учтите, что внутри кнопки могут быть вложенные теги, например `<i>` или `<span>`.',
            starterCode: `const container = document.getElementById('btn-container');
const output = document.getElementById('result');

container.addEventListener('click', (event) => {
  // Напишите решение через делегирование здесь
  
});`,
            domSetup: `
              <div id="btn-container" style="padding: 10px; border: 1px solid #334155; border-radius: 6px;">
                <button data-index="1" class="test-btn">Кнопка <span>№1</span></button>
                <button data-index="2" class="test-btn">Кнопка <i>№2</i></button>
                <button data-index="3" class="test-btn">Кнопка №3</button>
              </div>
              <output id="result" style="display: block; margin-top: 10px; font-weight: bold; color: #10b981;"></output>
            `,
            hints: [
              'Используйте event.target для получения элемента, по которому кликнули.',
              'Метод event.target.closest("button") поможет найти кнопку, даже если клик пришелся на тег <span> внутри.',
              'Проверьте, найдена ли кнопка и находится ли она внутри вашего контейнера, перед тем как читать dataset.index.'
            ],
            referenceSolution: `container.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (button && container.contains(button)) {
    output.textContent = button.dataset.index;
  }
});`,
            explanation: 'Мы вешаем один обработчик `click` на общий контейнер. При клике событие всплывает. Мы находим саму кнопку через `event.target.closest("button")` (это корректно обрабатывает вложенные теги `span` или `i`), проверяем, что кнопка лежит внутри контейнера, и выводим её `dataset.index` в `output`.',
            testSuite: `
              try {
                const container = document.getElementById('btn-container');
                const output = document.getElementById('result');
                
                // Очищаем предыдущие обработчики путем клонирования
                const newContainer = container.cloneNode(true);
                container.parentNode.replaceChild(newContainer, container);
                
                const scriptFn = new Function('container', 'output', 'event', userCode + '\\n');
                
                // Вешаем обработчик, написанный пользователем
                newContainer.addEventListener('click', (e) => {
                  scriptFn(newContainer, output, e);
                });
                
                // Симулируем клик по первой кнопке (клик прямо по span внутри)
                const span = newContainer.querySelector('button[data-index="1"] span');
                span.click();
                if (output.textContent !== '1') {
                  return { success: false, logs: [\`При клике на span внутри первой кнопки output должен быть "1". Получено: "\${output.textContent}"\`] };
                }

                // Симулируем клик по кнопке 3
                const btn3 = newContainer.querySelector('button[data-index="3"]');
                btn3.click();
                if (output.textContent !== '3') {
                  return { success: false, logs: [\`При клике на третью кнопку output должен быть "3". Получено: "\${output.textContent}"\`] };
                }

                // Симулируем клик по самому контейнеру
                output.textContent = '';
                newContainer.click();
                if (output.textContent !== '') {
                  return { success: false, logs: ['Клик по фону контейнера (не по кнопке) не должен менять output!'] };
                }

                return { success: true, logs: ['Отлично! Делегирование событий реализовано корректно и устойчиво к вложенным тегам.'] };
              } catch(e) {
                return { success: false, logs: [\`Ошибка выполнения тестов: \${e.message}\`] };
              }
            `
          }
        ]
      }
    ]
  },
  {
    id: 'js-async',
    title: 'Асинхронность & Promise.race',
    category: 'JavaScript',
    description: 'Жизненный цикл промисов и реализация собственной функции гонки.',
    iconName: 'Code',
    lessons: [
      {
        id: 'async-race',
        title: 'Пишем свой Promise.race',
        xpReward: 10,
        slides: [
          {
            type: 'theory',
            title: 'Асинхронность и гонки промисов',
            definition: 'Promise.race(promises) возвращает промис, который разрешается или отклоняется, как только один из промисов во входящем массиве переходит в состояние settled (выполнен или отклонен).',
            pitfalls: [
              'Передача пустого массива в Promise.race приведет к созданию промиса, который навечно зависнет в состоянии pending.',
              'Каждый промис в массиве нужно обернуть в Promise.resolve(p), так как в массиве могут быть не-промис значения.'
            ],
            keyTerms: [
              { term: 'Promise', definition: 'Объект-обертка для асинхронного результата: pending, fulfilled или rejected' },
              { term: 'Promise.race()', definition: 'Возвращает промис, который завершается вместе с первым завершившимся из массива' },
              { term: 'resolve / reject', definition: 'Функции для перевода промиса из pending в fulfilled (успех) или rejected (ошибка)' },
            ],
            mnemonic: 'Promise — квитанция из прачечной: pending = стирается, fulfilled = готово к выдаче, rejected = вещь потеряна. Promise.race — кто первый из прачечных закончит (или потеряет), тот и определяет результат.',
            diagram: {
              type: 'comparison',
              title: 'Callback Hell vs Promise Chain',
              items: ['getData(cb1 =>', '  getUser(cb2 =>', '    getPosts(cb3 =>', '      // вложенность...', '    )', '  )', ')'],
              secondColumn: ['getData()', '  .then(getUser)', '  .then(getPosts)', '  .then(render)', '  .catch(handleErr)', '', '// плоская цепочка'],
            },
            codeSnippet: `// Идея реализации:
function race(promises) {
  return new Promise((resolve, reject) => {
    promises.forEach(p => Promise.resolve(p).then(resolve, reject));
  });
}`
          },
          {
            type: 'coding',
            title: 'Свой race()',
            description: 'Реализуйте функцию `race(promises)`, которая работает аналогично `Promise.race()`. Она принимает массив промисов (или обычных значений) и возвращает новый промис, разрешающийся или отклоняющийся первым же завершившимся промисом. Использовать встроенный `Promise.race` запрещено.',
            starterCode: `function race(promises) {
  // Напишите решение здесь
  
}`,
            hints: [
              'Функция должна возвращать новый Promise: return new Promise((resolve, reject) => { ... })',
              'Переберите переданные элементы. Для каждого элемента вызовите Promise.resolve(item) на случай, если это простое значение.',
              'Вызовите .then(resolve, reject) у каждого обернутого промиса. Первый выполнившийся автоматически разрешит/отклонит внешний промис.'
            ],
            referenceSolution: `function race(promises) {
  return new Promise((resolve, reject) => {
    promises.forEach(p => {
      Promise.resolve(p).then(resolve, reject);
    });
  });
}`,
            explanation: 'Мы возвращаем новый `Promise`. Внутри перебираем массив промисов и оборачиваем каждый в `Promise.resolve(p)`, чтобы безопасно обрабатывать не-промис значения. Для каждого промиса вызываем `.then(resolve, reject)`. Первый завершившийся промис переведет наш внешний промис в состояние выполнен/отклонен.',
            testSuite: `
              try {
                const userFn = new Function(userCode + '\\nreturn race;');
                const race = userFn();
                
                if (typeof race !== 'function') {
                  return { success: false, logs: ['race должна быть функцией'] };
                }

                if (userCode.includes('Promise.race')) {
                  return { success: false, logs: ['Использование встроенного Promise.race категорически запрещено!'] };
                }

                // Тест 1: Успешное выполнение первого
                const p1 = new Promise(r => setTimeout(() => r('slow'), 30));
                const p2 = new Promise(r => setTimeout(() => r('fast'), 10));
                
                return race([p1, p2]).then(result => {
                  if (result !== 'fast') {
                    return { success: false, logs: [\`Должен выиграть быстрый промис со значением 'fast'. Получено: '\${result}'\`] };
                  }
                  
                  // Тест 2: Отклонение первого
                  const p3 = new Promise((_, rej) => setTimeout(() => rej(new Error('fail')), 10));
                  const p4 = new Promise(r => setTimeout(() => r('ok'), 30));
                  
                  return race([p3, p4]).then(
                    () => ({ success: false, logs: ['Промис должен был отклониться из-за ошибки в p3!'] }),
                    (err) => {
                      if (!err || err.message !== 'fail') {
                        return { success: false, logs: [\`Промис должен отклониться с ошибкой 'fail'. Получено: \${err}\`] };
                      }
                      
                      // Тест 3: Обычные значения
                      return race(['instant', Promise.resolve('later')]).then(res => {
                        if (res !== 'instant') {
                          return { success: false, logs: [\`Обычные значения должны обрабатываться мгновенно. Ожидалось 'instant', получено: \${res}\`] };
                        }
                        return { success: true, logs: ['Замечательно! Ваш кастомный race() работает идеально во всех кейсах!'] };
                      });
                    }
                  );
                });
              } catch(e) {
                return Promise.resolve({ success: false, logs: [\`Ошибка при запуске: \${e.message}\`] });
              }
            `
          }
        ]
      }
    ]
  },
  {
    id: 'typescript-basics',
    title: 'TypeScript Типизация',
    category: 'TypeScript',
    description: 'Интерфейсы, типы, дженерики, разница между unknown и any.',
    iconName: 'Shield',
    lessons: [
      {
        id: 'ts-generics',
        title: 'Дженерики и Swap',
        xpReward: 10,
        slides: [
          {
            type: 'theory',
            title: 'TypeScript: unknown vs any',
            definition: '`any` отключает любые проверки типов компилятором. `unknown` — это безопасный аналог any: он разрешает присвоить значение любого типа, но запрещает совершать действия с ним (вызов методов, доступ к свойствам) без предварительного сужения типа (type narrowing).',
            comparison: {
              title: 'type vs interface',
              headers: ['Критерий', 'interface', 'type'],
              rows: [
                ['Слияние объявлений', 'Да (Declaration Merging)', 'Нет'],
                ['Синтаксис', 'interface X { ... }', 'type X = ...'],
                ['Сложные типы (union)', 'Нет', 'Да (X | Y)'],
                ['Назначение', 'Определяет форму объекта/API', 'Псевдонимы типов, комбинации']
              ]
            },
            pitfalls: [
              'Использование any в коде лишает вас преимуществ TypeScript. Старайтесь использовать unknown, дженерики или явные интерфейсы.',
              'Дженерики (Generic Types) позволяют создавать компоненты, работающие с различными типами, сохраняя типобезопасность.'
            ],
            keyTerms: [
              { term: 'any', definition: 'Отключает проверку типов — компилятор разрешает всё, теряется защита' },
              { term: 'unknown', definition: 'Безопасный тип: требует явного сужения (narrowing) перед использованием' },
              { term: 'Generic <T>', definition: 'Параметр типа — одна функция работает с любым типом, сохраняя типобезопасность' },
            ],
            mnemonic: 'Generic — форма для печенья: одна и та же форма (функция), разное тесто (типы). any — бросить всё тесто в одну миску без разбора. unknown — подписать каждую миску и проверить перед использованием.',
            diagram: {
              type: 'comparison',
              title: 'Без дженериков vs С дженериками',
              items: ['function swapNum(a: number, b: number)', '  return [b, a]', 'function swapStr(a: string, b: string)', '  return [b, a]', '// дублирование для каждого типа'],
              secondColumn: ['function swap<T, U>(a: T, b: U): [U, T]', '  return [b, a]', '', '// один раз — работает с любыми типами', '// компилятор знает точные типы'],
            },
          },
          {
            type: 'coding',
            title: 'Generic-функция swap',
            description: 'Реализуйте функцию `swap`, которая принимает два значения произвольных типов и возвращает их в обратном порядке как кортеж (массив из двух элементов). Типы возвращаемого кортежа должны выводиться автоматически из типов переданных аргументов. Напишите код на TypeScript (в песочнице мы проверяем JS-реализацию, но типы запишите правильно в виде комментариев или стандартного синтаксиса).',
            starterCode: `// Напишите TS функцию swap
function swap(a, b) {
  // Ваше решение здесь
  
}`,
            hints: [
              'Используйте дженерики <T, U> для сохранения типов параметров.',
              'Возвращаемый тип должен быть строго кортежем: [U, T].',
              'Возвращайте массив: return [b, a].'
            ],
            referenceSolution: `function swap<T, U>(a: T, b: U): [U, T] {
  return [b, a];
}`,
            explanation: 'В TypeScript дженерики `<T, U>` позволяют объявить типы параметров, которые будут выведены автоматически при вызове функции. Возвращаемый тип `[U, T]` описывает кортеж, содержащий элементы в обратном порядке.',
            testSuite: `
              try {
                const userFn = new Function(userCode + '\\nreturn swap;');
                const swap = userFn();
                
                if (typeof swap !== 'function') {
                  return { success: false, logs: ['swap должна быть функцией'] };
                }

                const res1 = swap(42, 'hello');
                if (!Array.isArray(res1) || res1[0] !== 'hello' || res1[1] !== 42) {
                  return { success: false, logs: [\`swap(42, 'hello') должна вернуть ['hello', 42]. Получено: \${JSON.stringify(res1)}\`] };
                }

                const res2 = swap({x: 1}, true);
                if (res2[0] !== true || res2[1].x !== 1) {
                  return { success: false, logs: ['swap не сохранил структуру объектов!'] };
                }

                return { success: true, logs: ['Ура! Swap успешно меняет местами элементы и сохраняет типы.'] };
              } catch(e) {
                return { success: false, logs: [\`Ошибка выполнения тестов: \${e.message}\`] };
              }
            `
          }
        ]
      }
    ]
  },
  {
    id: 'build-tooling',
    title: 'Сборщики & Линтеры',
    category: 'Tooling',
    description: 'Понимание Webpack, отличие плагина от лоадера, настройка Prettier и ESLint.',
    iconName: 'Settings',
    lessons: [
      {
        id: 'webpack-config',
        title: 'Анатомия Webpack',
        xpReward: 10,
        slides: [
          {
            type: 'theory',
            title: 'Webpack: Разбор конфига',
            definition: 'Webpack — это сборщик модулей. Он строит граф зависимостей (dependency graph), начиная с entry-файла, и собирает ассеты в единый бандл в папку output.',
            pitfalls: [
              'Разница между Loaders и Plugins: Loader работает на уровне отдельных файлов во время сборки графа (например, переводит CSS в JS). Plugin имеет доступ к компилятору и жизненному циклу Webpack и выполняет общие задачи (оптимизация бандла, генерация HTML, очистка dist).',
              'style-loader vs css-loader: css-loader собирает импорты `@import` и `url()`, переводя CSS в JS-строку. style-loader берет этот CSS и внедряет в DOM через тег <style> во время выполнения.'
            ],
            keyTerms: [
              { term: 'Entry', definition: 'Точка входа — файл, с которого Webpack начинает построение графа зависимостей' },
              { term: 'Loader', definition: 'Трансформатор файлов: преобразует не-JS ресурсы (CSS, изображения) в модули' },
              { term: 'Plugin', definition: 'Расширение сборки: доступ к хукам компилятора для оптимизации, инъекции HTML и т.д.' },
            ],
            mnemonic: 'Webpack — конвейер на заводе: Entry — ворота, куда приходит сырье. Loaders — станки, превращающие сырье (CSS, картинки) в детали (JS-модули). Plugins — контролеры качества, работающие над всей сборкой.',
            diagram: {
              type: 'flow',
              title: 'Конвейер Webpack',
              items: ['Entry (index.js)', 'Граф зависимостей', 'Loaders (файл → модуль)', 'Plugins (оптимизация)', 'Output (bundle.js)'],
            },
            codeSnippet: `module.exports = {
  entry: './src/index.js',
  output: { filename: 'bundle.[contenthash].js', clean: true },
  module: {
    rules: [{ test: /\\.css$/i, use: ['style-loader', 'css-loader'] }]
  },
  plugins: [new HtmlWebpackPlugin()]
};`
          },
          {
            type: 'multiple-choice',
            question: 'В чем основное отличие Plugin от Loader в Webpack?',
            options: [
              'Loader используется для минификации кода, а Plugin — для транспиляции.',
              'Loader преобразует конкретные типы файлов на этапе сборки графа, а Plugin выполняет глобальные задачи сборки, имея доступ к хукам компилятора.',
              'Loader работает только на сервере разработки (webpack-dev-server), а Plugin — только для production сборки.',
              'Нет никакой разницы, это взаимозаменяемые термины.'
            ],
            correctIndex: 1,
            explanation: 'Лоадеры преобразуют файлы (например, .css -> JS модули, TS -> JS) и применяются к отдельным файлам. Плагины шире — они внедряются в сам процесс сборки, могут сжимать бандлы, генерировать HTML-файлы, чистить папки и оптимизировать ресурсы.'
          }
        ]
      }
    ]
  }
];
