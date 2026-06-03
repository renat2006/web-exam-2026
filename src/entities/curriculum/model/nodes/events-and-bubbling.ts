import type { SkillNode } from '../types';

// ═══════════════════════════════════════════════
// БЛОК 10: События и всплытие (Week 03)
// Theory вопросы: #22, #29, #33, #40, #41
// ═══════════════════════════════════════════════
export const EVENTS_AND_BUBBLING: SkillNode = {
  id: 'events-and-bubbling',
  title: 'События и всплытие',
  category: 'JavaScript',
  description: 'Как работают DOM-события, всплытие, делегирование и разница между preventDefault и stopPropagation.',
  iconName: 'MousePointer',
  lessons: [
    {
      id: 'events-core',
      title: 'DOM-события: от клика до делегирования',
      xpReward: 10,
      slides: [
        {
          type: 'theory',
          title: 'Как добавить обработчик события?',
          definition:
            'Событие в JavaScript — сигнал браузера о действии пользователя или браузера. Подписываемся через addEventListener(тип, функция). Объект event внутри обработчика содержит все детали: target, key, clientX и т.д.',
          codeExample: `// ✅ Правильно — именованная функция (можно удалить)
function handleClick(event) {
console.log('Клик на:', event.target);
}
button.addEventListener('click', handleClick);
button.removeEventListener('click', handleClick); // удаляем

// ❌ Анонимную функцию удалить нельзя!
button.addEventListener('click', () => alert('навсегда'));`,
          comparison: {
            title: 'Популярные события',
            headers: ['Событие', 'Когда срабатывает', 'Ключевые данные в event'],
            rows: [
              ['click', 'Клик мышью', 'target, clientX/Y'],
              ['keydown', 'Нажатие клавиши', 'event.key, event.code'],
              ['submit', 'Отправка формы', 'target (форма)'],
              ['DOMContentLoaded', 'HTML разобран (без картинок)', '—'],
              ['mouseover / mouseout', 'Наведение / уход мыши', 'relatedTarget'],
            ],
          },
          pitfalls: [
            'removeEventListener требует ту же самую функцию — анонимные не удаляются.',
            'DOMContentLoaded ≠ load. load ждёт картинки и стили, DOMContentLoaded — только HTML.',
            'Если скрипт в <head> без defer — getElementById вернёт null, DOM ещё не построен.',
          ],
          keyTerms: [
            { term: 'addEventListener', definition: 'Метод, подписывающий функцию на событие элемента' },
            { term: 'event.target', definition: 'Элемент, на котором фактически произошло событие (цель)' },
            { term: 'event.currentTarget', definition: 'Элемент, на котором висит обработчик (может быть родителем)' },
            { term: 'DOMContentLoaded', definition: 'Событие: HTML разобран и DOM построен, стили/картинки ещё грузятся' },
          ],
          mnemonic: 'target — это ЦЕЛЬ (куда кликнули), currentTarget — это ХОЗЯИН обработчика (на ком висит слушатель). Запомни: target = точка попадания, currentTarget = владелец.',
        },
        {
          type: 'theory',
          title: 'Всплытие (bubbling) и перехват (capturing)',
          definition:
            'Событие в браузере проходит три фазы: 1) Захват (capturing) — сверху от window вниз к цели; 2) Цель (target) — на самом элементе; 3) Всплытие (bubbling) — обратно вверх до window. По умолчанию обработчики срабатывают в фазе всплытия.',
          diagram: {
            type: 'flow',
            title: 'Путь события при клике на <button> внутри <div>',
            items: [
              'window (capturing ↓)',
              'document (capturing ↓)',
              '<div> (capturing ↓)',
              '<button> — TARGET PHASE',
              '<div> (bubbling ↑)',
              'document (bubbling ↑)',
              'window (bubbling ↑)',
            ],
          },
          codeExample: `// Обработчик в фазе всплытия (по умолчанию, 3-й аргумент false/отсутствует)
div.addEventListener('click', fn);        // bubbling
div.addEventListener('click', fn, false); // то же самое

// Обработчик в фазе захвата (3-й аргумент true)
div.addEventListener('click', fn, true);  // capturing

// Остановить всплытие — событие не пойдёт дальше вверх
event.stopPropagation();

// Отменить действие браузера по умолчанию (переход по ссылке, submit формы)
event.preventDefault();`,
          comparison: {
            title: 'preventDefault vs stopPropagation',
            headers: ['Метод', 'Что делает', 'Когда применять'],
            rows: [
              ['event.preventDefault()', 'Отменяет действие браузера по умолчанию', 'Форма без перезагрузки страницы, ссылка без перехода'],
              ['event.stopPropagation()', 'Останавливает всплытие события вверх по DOM', 'Кнопка внутри кликабельного блока — чтобы не сработал родитель'],
            ],
          },
          pitfalls: [
            'stopPropagation не отменяет действие браузера — для этого нужен preventDefault.',
            'preventDefault не останавливает всплытие — событие продолжит идти вверх.',
            'stopImmediatePropagation — останавливает ещё и остальные обработчики на том же элементе.',
          ],
          keyTerms: [
            { term: 'Bubbling (всплытие)', definition: 'Событие поднимается от целевого элемента вверх по DOM-дереву' },
            { term: 'Capturing (захват)', definition: 'Событие опускается от window вниз к целевому элементу' },
            { term: 'preventDefault()', definition: 'Отменяет поведение браузера по умолчанию (переход, отправка формы)' },
            { term: 'stopPropagation()', definition: 'Останавливает распространение события по DOM-дереву' },
          ],
          mnemonic: 'Bubble = пузырёк поднимается ВВЕРХ 🫧. Capture = захватываем при СПУСКЕ вниз. Две разные стрелки — одна вниз, другая вверх.',
        },
        {
          type: 'theory',
          title: 'Делегирование событий',
          definition:
            'Делегирование событий — паттерн: вместо навешивания обработчика на каждый дочерний элемент, вешаем ОДИН обработчик на родителя и определяем цель через event.target. Работает благодаря всплытию.',
          codeExample: `// ❌ Без делегирования — N обработчиков
document.querySelectorAll('.item').forEach(item => {
item.addEventListener('click', handleItemClick);
});

// ✅ С делегированием — 1 обработчик на родителе
document.querySelector('.list').addEventListener('click', (event) => {
// event.target — элемент, по которому кликнули
if (event.target.classList.contains('item')) {
  handleItemClick(event.target);
}
});
// Работает даже для элементов, добавленных ПОСЛЕ!`,
          pitfalls: [
            'event.target может быть дочерним элементом внутри .item — используй closest() для надёжности.',
            'Не все события всплывают (blur, focus, scroll). Для них делегирование не работает.',
            'Делегирование не поможет, если событие остановлено через stopPropagation внутри дочернего элемента.',
          ],
          keyTerms: [
            { term: 'Делегирование событий', definition: 'Один обработчик на родителе вместо обработчиков на каждом дочернем элементе' },
            { term: 'event.target', definition: 'Фактический элемент, вызвавший событие (дочерний)' },
            { term: 'closest(selector)', definition: 'Метод, идущий вверх по DOM и находящий ближайший подходящий предок' },
          ],
          mnemonic: 'Делегирование = «начальник (родитель) принимает все задачи, а потом разбирается кто прислал». Один обработчик — порядок, N обработчиков — хаос.',
        },
        // ✅ Theory #29 — точная формулировка
        {
          type: 'multiple-choice',
          question: 'Разница между event.target и event.currentTarget?',
          options: [
            'Нет разницы, это синонимы',
            'target — элемент с обработчиком, currentTarget — элемент-цель клика',
            'target — элемент, на котором произошло событие (цель); currentTarget — элемент, на котором висит обработчик',
            'currentTarget всегда равен document',
          ],
          correctIndex: 2,
          explanation:
            'event.target — элемент, на котором ФАКТИЧЕСКИ произошло событие (куда кликнули). event.currentTarget — элемент, на котором ЗАРЕГИСТРИРОВАН обработчик. При делегировании они разные: кликаем на <li> (target), а обработчик на <ul> (currentTarget). На целевом элементе target === currentTarget.',
        },
        // ✅ Theory #33 — точная формулировка
        {
          type: 'multiple-choice',
          question: 'В чём разница между event.preventDefault() и event.stopPropagation()?',
          options: [
            'Это одно и то же — оба метода останавливают событие полностью',
            'preventDefault() отменяет действие браузера по умолчанию; stopPropagation() останавливает всплытие события по DOM-дереву',
            'stopPropagation() отменяет действие браузера; preventDefault() останавливает всплытие',
            'preventDefault() работает только на формах, stopPropagation() — только на ссылках',
          ],
          correctIndex: 1,
          explanation:
            'preventDefault() — отменяет стандартное поведение браузера: переход по ссылке, отправку формы с перезагрузкой, контекстное меню. stopPropagation() — останавливает всплытие: событие не пойдёт к родительским элементам. Они независимы: можно вызвать оба, один из них, или ни одного.',
        },
        // ✅ Theory #22 — точная формулировка
        {
          type: 'multiple-choice',
          question: 'Объясните, что такое делегирование событий (event delegation).',
          options: [
            'Передача обработчика события другому элементу через removeEventListener',
            'Паттерн: один обработчик на родителе ловит события от всех дочерних элементов благодаря всплытию; используем event.target чтобы определить источник',
            'Автоматическое копирование обработчиков на дочерние элементы',
            'Делегирование — это когда событие передаётся из дочернего элемента сразу в window',
          ],
          correctIndex: 1,
          explanation:
            'Делегирование событий — паттерн: вместо N обработчиков на N дочерних элементах, вешаем ОДИН обработчик на родителя. Работает потому что события всплывают (bubbling). Проверяем event.target (или event.target.closest()) чтобы понять на каком дочернем сработало. Плюсы: меньше памяти, работает для динамически добавляемых элементов.',
        },
        // ✅ Theory #40 — точная формулировка
        {
          type: 'multiple-choice',
          question: 'Опишите всплытие событий (bubbling) в JavaScript и в браузере.',
          options: [
            'Всплытие — это когда событие передаётся от window вниз к целевому элементу',
            'Всплытие — распространение события от целевого элемента вверх по DOM-дереву до window; каждый предок получает это событие',
            'Всплытие — это когда setTimeout выполняется раньше Promise',
            'Всплытие происходит только для click-событий',
          ],
          correctIndex: 1,
          explanation:
            'Bubbling (всплытие): после срабатывания на целевом элементе событие поднимается вверх — к родителю, его родителю и так до window. Все обработчики на пути срабатывают. Остановить можно через event.stopPropagation(). Большинство событий всплывают (click, keydown, input), но не все (blur, focus, scroll).',
        },
        // ✅ Theory #41 — точная формулировка
        {
          type: 'multiple-choice',
          question: 'Опишите перехват событий (capturing) в JavaScript и в браузере.',
          options: [
            'Capturing — то же самое что и bubbling, но в обратном порядке',
            'Capturing — фаза распространения события сверху вниз: от window к целевому элементу; активируется третьим аргументом true в addEventListener',
            'Capturing — перехват события до того как оно попало в очередь задач',
            'Capturing используется только для отмены событий через preventDefault()',
          ],
          correctIndex: 1,
          explanation:
            'Capturing (захват): событие сначала идёт сверху вниз — от window к целевому элементу. По умолчанию обработчики срабатывают в фазе bubbling. Чтобы перехватить в фазе capturing: addEventListener("click", fn, true) или addEventListener("click", fn, { capture: true }). На практике capturing используется редко — когда нужно перехватить событие ДО того как оно достигнет цели.',
        },
        // ✅ Theory #23 (полная формулировка из банка)
        {
          type: 'multiple-choice',
          question: 'Какую задачу решает event loop?',
          options: [
            'Обеспечивает параллельное выполнение нескольких функций',
            'Позволяет однопоточному JS не блокировать интерфейс: когда Call Stack пуст — перекладывает задачи из очередей в стек',
            'Управляет сборкой мусора и освобождением памяти',
            'Синхронизирует выполнение кода между вкладками браузера',
          ],
          correctIndex: 1,
          explanation:
            'Event Loop решает задачу: как однопоточному JS обрабатывать асинхронные операции не замораживая браузер. Алгоритм: смотрит на Call Stack — если пуст, берёт задачи из очередей (сначала все микрозадачи, потом одну макрозадачу) и помещает в Stack на выполнение. Так JS может "ждать" fetch-ответа, продолжая реагировать на клики пользователя.',
        },
      ],
    },
  ],
};
