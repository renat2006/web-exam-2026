import type { SkillNode } from '../types';

// ═══════════════════════════════════════════════
// БЛОК: SPA и Web Components (Week 08)
// Theory вопросы: #102–118
// ═══════════════════════════════════════════════
export const SPA_WEB_COMPONENTS: SkillNode = {
  id: 'spa-web-components',
  week: 8,
  title: 'SPA и Web Components',
  description: 'Одностраничные приложения, роутинг, History API, Custom Elements, Shadow DOM, шаблоны',
  lessons: [],
  topics: [
    {
      id: 'spa-routing',
      title: 'SPA, роутинг и Web Components',
      slides: [
        {
          type: 'theory',
          title: 'SPA, History API и Web Components',
          content: `**SPA (Single Page Application)**: одна HTML-страница, JavaScript управляет всем — DOM, данными, навигацией.

**Роутинг:**
- **Hash-роутинг**: URL после \`#\` не уходит на сервер; \`hashchange\` событие; работает на любом static-хостинге
- **History API**: \`pushState()\`, \`replaceState()\`, событие \`popstate\`. "Чистые" URL; сервер должен отдавать index.html для всех маршрутов

**Web Components** — набор нативных браузерных технологий:
- **Custom Elements**: \`customElements.define("my-tag", MyClass)\` — регистрация нового HTML-тега
- Lifecycle: \`connectedCallback\`, \`disconnectedCallback\`, \`attributeChangedCallback\`
- Имя тега **обязательно с дефисом**: \`<movie-card>\`
- **Shadow DOM**: \`attachShadow({ mode: 'open' })\` — изолированный DOM + стили. CSS снаружи не проникает, внутренний CSS не вытекает
- **HTML \`<template>\`**: хранит разметку, не рендерится. \`template.content.cloneNode(true)\` — клонирование
- **\`<slot>\`**: место для вставки контента снаружи в Shadow DOM`,
        },
        // ✅ Theory #118 — точная формулировка
        {
          type: 'multiple-choice',
          question: 'Объясните, что такое одностраничное приложение (SPA) и как сделать его дружественным к SEO.',
          options: [
            'SPA — это сайт с одной страницей без навигации',
            'SPA: одна HTML-страница, JS динамически управляет контентом без перезагрузок. SEO-решения: SSR (сервер сразу отдаёт HTML), пререндеринг/статическая генерация, корректные мета-теги, управление History API для читаемых URL',
            'SPA нельзя сделать SEO-дружественным',
            'Для SEO SPA достаточно добавить sitemap.xml',
          ],
          correctIndex: 1,
          explanation:
            'SPA: браузер загружает HTML+CSS+JS один раз, дальше JS управляет всем. Переходы — без перезагрузки. SEO-проблема: поисковик видит пустую страницу (контент генерирует JS). Решения: (1) SSR (Server-Side Rendering) — сервер отдаёт готовый HTML, клиент его "оживляет" (гидратация). Next.js делает это из коробки. (2) Пререндеринг / Static Generation — заранее генерируем HTML-файлы. (3) Динамический рендеринг — для ботов отдаём пререндер. (4) Читаемые URL через History API (не hash). (5) Корректные title, meta description для каждого маршрута.',
        },
        // ✅ Theory #116 — точная формулировка
        {
          type: 'multiple-choice',
          question: 'В чём разница между hash-based и history-based роутингом в SPA? В каких случаях что выбирать?',
          options: [
            'Hash и history роутинг абсолютно одинаковы',
            'Hash (#/path): часть после # не уходит на сервер, работает на любом хостинге, некрасивые URL, события hashchange. History (/path): красивые URL, history.pushState/popstate, сервер должен уметь отдавать index.html для любого маршрута',
            'History API не поддерживается в современных браузерах',
            'Hash-роутинг используется только для якорей на странице',
          ],
          correctIndex: 1,
          explanation:
            'Hash-роутинг (/#/movies): часть после # не отправляется на сервер — всегда загружается index.html. Событие: hashchange. Плюсы: работает на GitHub Pages, S3 без настройки. Минусы: некрасивые URL, исторически плохо для SEO. History-роутинг (/movies): использует history.pushState() для смены URL без перезагрузки. Событие: popstate (Back/Forward). Плюсы: чистые URL, лучше для SEO. Минусы: сервер должен возвращать index.html для /movies/42 — иначе 404. Настраивают в nginx/apache. Когда выбирать: статический хостинг без настроек → hash; production с настроенным сервером → history.',
        },
        // ✅ Theory #109 — точная формулировка
        {
          type: 'multiple-choice',
          question: 'Что такое History API и как он используется в SPA? Назовите ключевые методы и события.',
          options: [
            'History API — это история браузера, доступная только для чтения',
            'History API позволяет менять URL без перезагрузки страницы. history.pushState(state, "", "/path") — добавляет запись; history.replaceState() — заменяет текущую; событие popstate — срабатывает при Back/Forward',
            'History API работает только в Node.js',
            'Для SPA нужно использовать window.location.href, а не History API',
          ],
          correctIndex: 1,
          explanation:
            'History API — нативный браузерный API (HTML5): history.pushState(stateObj, title, url) — добавляет запись в стек истории, меняет URL без перезагрузки. history.replaceState(stateObj, title, url) — заменяет текущую запись (нет новой записи в Back). window.addEventListener("popstate", e => e.state) — срабатывает при нажатии Back/Forward. Важно: history.pushState НЕ вызывает popstate! Отличие от location.href: location.href = "/page" перезагружает документ; pushState — нет. Типичный SPA-роутер: перехватывает клики на ссылки → pushState → обновляет DOM → при popstate восстанавливает состояние.',
        },
        // ✅ Theory #117 — точная формулировка
        {
          type: 'multiple-choice',
          question: 'Что такое lazy-loading маршрутов в SPA? Какие у него преимущества и какие тонкости в реализации?',
          options: [
            'Lazy-loading — загружает все модули при старте приложения',
            'Lazy-loading: код маршрута загружается только при первом переходе на него (dynamic import). Преимущество: меньше начальный бандл, быстрее первая загрузка. Тонкости: нужен индикатор загрузки, модуль кешируется после первого импорта',
            'Lazy-loading работает только в webpack и не работает в Vite',
            'Lazy-loading замедляет приложение',
          ],
          correctIndex: 1,
          explanation:
            'Lazy-loading маршрутов: const module = await import("./MovieDetails.js") — модуль загружается только когда пользователь переходит на эту страницу. Преимущества: (1) Меньше начальный бандл → быстрее первая загрузка. (2) Код страниц, которые пользователь не посетит, вообще не загружается. (3) Браузер кеширует модуль — второй переход мгновенный. Тонкости: (1) Нужен индикатор загрузки ("Загрузка...") пока модуль грузится. (2) Обработка ошибок загрузки. (3) Функция async — нужен await. В React: React.lazy(() => import("./Page")) + Suspense.',
        },
        // ✅ Theory #103 — точная формулировка
        {
          type: 'multiple-choice',
          question: 'Назовите основные технологии (части платформы веб-компонентов), используемые для их создания.',
          options: [
            'Web Components — это React без JSX',
            'Custom Elements (регистрация нового HTML-тега), Shadow DOM (изолированный DOM и стили), HTML Templates (<template> — скрытый шаблон разметки). Опционально: <slot> для проекции контента',
            'Web Components требуют обязательного использования TypeScript',
            'Единственная технология — Shadow DOM',
          ],
          correctIndex: 1,
          explanation:
            'Три кита Web Components: (1) Custom Elements: customElements.define("movie-card", MovieCard) — регистрирует новый тег, браузер создаёт экземпляр класса при встрече тега. Lifecycle: connectedCallback (добавлен в DOM), disconnectedCallback (удалён), attributeChangedCallback. (2) Shadow DOM: this.attachShadow({mode:"open"}) — изолированный DOM. Стили внутри не вытекают, снаружи не проникают. (3) HTML <template>: хранит разметку, не отображается при загрузке. Клонируется через template.content.cloneNode(true). <slot> — проекция внешнего контента внутрь Shadow DOM. Всё это нативные браузерные API — без фреймворков.',
        },
        // ✅ Theory #104 / #111 — точная формулировка
        {
          type: 'multiple-choice',
          question: 'Что такое Custom Elements в JavaScript? Как объявляют (определяют) Custom Elements?',
          options: [
            'Custom Elements — это обычные div с кастомными CSS-классами',
            'Custom Elements — механизм регистрации нового HTML-тега. Создаётся класс extends HTMLElement с connectedCallback и др., регистрируется через customElements.define("my-tag", MyClass). Имя тега обязательно содержит дефис',
            'Custom Elements нужно объявлять в HTML-файле, а не в JavaScript',
            'Custom Elements поддерживаются только в Chrome',
          ],
          correctIndex: 1,
          explanation:
            'Custom Elements: class MovieCard extends HTMLElement { connectedCallback() { this.innerHTML = "..."; } } customElements.define("movie-card", MovieCard). После регистрации <movie-card title="Inception"></movie-card> в HTML работает как обычный элемент. Lifecycle callbacks: connectedCallback (добавлен в DOM), disconnectedCallback (удалён), attributeChangedCallback(name, old, new) (атрибут изменился — нужно также объявить static observedAttributes). Важное правило: имя ОБЯЗАТЕЛЬНО с дефисом (<movie-card>, не <moviecard>) — чтобы не конфликтовать со стандартными тегами. Класс наследует HTMLElement (или HTMLButtonElement и др. для расширения существующих).',
        },
        // ✅ Theory #105 — точная формулировка
        {
          type: 'multiple-choice',
          question: 'Какое соглашение об именовании должно использоваться для пользовательских элементов в веб-разработке?',
          options: [
            'Имя пользовательского элемента должно начинаться с заглавной буквы',
            'Имя Custom Element ОБЯЗАТЕЛЬНО должно содержать как минимум один дефис (например: movie-card, my-button, user-profile). Это требование стандарта для предотвращения конфликтов с будущими HTML-тегами',
            'Имя должно начинаться с префикса "custom-"',
            'Нет никаких требований к именованию',
          ],
          correctIndex: 1,
          explanation:
            'Правило именования Custom Elements: имя ДОЛЖНО содержать дефис. Примеры: <movie-card>, <user-profile>, <my-button>. Нельзя: <moviecard>, <button> (зарезервировано). Почему: браузер разделяет стандартные теги (нет дефиса: div, span, input) и кастомные (с дефисом). Это гарантирует что будущие стандартные теги не будут конфликтовать с пользовательскими. Если попытаться зарегистрировать "moviecard" — customElements.define выбросит ошибку DOMException.',
        },
        // ✅ Theory #106 / #112 / #113 / #114 — точная формулировка
        {
          type: 'multiple-choice',
          question: 'Что такое Shadow DOM? Какие преимущества даёт его использование? Как дерево Shadow DOM прикрепляется к элементу? Могут ли стили «пробивать» Shadow DOM?',
          options: [
            'Shadow DOM — это просто скрытый div внутри другого div',
            'Shadow DOM — изолированный DOM внутри элемента. Прикрепляется через element.attachShadow({mode:"open"}). Внешние стили не проникают внутрь, внутренние не вытекают наружу. CSS-переменные и наследуемые свойства (color, font) МОГУТ пробиваться',
            'Shadow DOM полностью блокирует все стили, включая CSS-переменные',
            'Shadow DOM прикрепляется только к <div> элементам',
          ],
          correctIndex: 1,
          explanation:
            'Shadow DOM: el.attachShadow({mode:"open"}) создаёт изолированный DOM. mode:"open" — JS снаружи может обратиться через el.shadowRoot; mode:"closed" — нет. Изоляция стилей: (1) Внешние классы (.card) не действуют на элементы внутри Shadow DOM. (2) Стили внутри Shadow DOM не вытекают наружу. (3) НО: CSS-переменные (--color: red) пробиваются через Shadow DOM — это механизм кастомизации. (4) Наследуемые CSS-свойства (color, font-size) тоже наследуются внутрь. Преимущества: инкапсуляция, нет конфликтов CSS, компонент как "чёрный ящик".',
        },
        // ✅ Theory #107 / #115 — точная формулировка
        {
          type: 'multiple-choice',
          question: 'Что такое встроенный HTML-элемент `<template>`? Отображается ли содержимое `<template>` при загрузке страницы?',
          options: [
            '<template> — это то же самое что <div style="display:none">',
            '<template> хранит HTML-разметку, которая НЕ отображается при загрузке страницы и не влияет на DOM. Содержимое доступно через template.content (DocumentFragment) и клонируется через cloneNode(true) для использования',
            '<template> отображается при загрузке, но становится скрытым после JS-обработки',
            '<template> — это серверный шаблон, не браузерная технология',
          ],
          correctIndex: 1,
          explanation:
            '<template>: браузер парсит содержимое, но НЕ рендерит и НЕ выполняет (скрипты внутри не выполняются, картинки не загружаются). Свойство template.content возвращает DocumentFragment с дочерними узлами. Использование: const clone = template.content.cloneNode(true) → заполняем данными → вставляем в DOM. Чем отличается от display:none: (1) Контент не в DOM — не участвует в вычислении стилей. (2) Скрипты/картинки внутри не активны. (3) Можно клонировать много раз эффективно. Типичное применение: шаблон карточки товара, строки таблицы — создаём один раз, клонируем для каждого элемента данных.',
        },
        // ✅ Theory #108 — точная формулировка
        {
          type: 'multiple-choice',
          question: 'Что такое элемент `<slot>` во веб-компонентах?',
          options: [
            '<slot> — это дырка в HTML для вставки рекламы',
            '<slot> — механизм проекции контента в Shadow DOM: позволяет вставлять внешний HTML-контент внутрь компонента на место слота. <slot name="title"> — именованные слоты для разных позиций',
            '<slot> работает только внутри <template>, не в Shadow DOM',
            '<slot> заменяет props в Web Components',
          ],
          correctIndex: 1,
          explanation:
            '<slot> — место для проекции контента снаружи в Shadow DOM. В Shadow DOM: <div class="card"><slot name="title"></slot><slot></slot></div>. Использование: <my-card><h2 slot="title">Заголовок</h2><p>Контент</p></my-card>. Без имени — default slot (принимает весь незаслотированный контент). Именованные слоты — для конкретных позиций. Контент физически остаётся в light DOM (внешнем), но отображается внутри Shadow DOM — это проекция, не перемещение. Аналог в React: children props и named render props. Слоты дают гибкость компоненту без жёстко зашитого HTML.',
        },
        // ✅ Theory #102 — точная формулировка
        {
          type: 'multiple-choice',
          question: 'Как выполнить перенаправление на другую страницу в JavaScript?',
          options: [
            'Только через server-side redirect',
            'window.location.href = "/new-page" (перезагружает страницу); history.pushState({}, "", "/new-page") (без перезагрузки, для SPA); window.location.replace("/") (заменяет в истории, без Back)',
            'Только через <a href="...">, JS-перенаправление не работает',
            'document.redirect("/new-page")',
          ],
          correctIndex: 1,
          explanation:
            'Способы навигации в JS: (1) window.location.href = "/page" — полная перезагрузка документа с новым URL. (2) window.location.replace("/page") — заменяет текущую запись в истории (нет Back). (3) history.pushState(state, "", "/page") — меняет URL без перезагрузки (SPA-навигация), добавляет запись в историю. (4) history.replaceState(state, "", "/page") — меняет URL без перезагрузки, без новой записи. Для SPA: pushState — основной инструмент. Для полного перехода: location.href. Обработка Back/Forward: слушать событие popstate.',
        },
        // ✅ Theory #110 — точная формулировка
        {
          type: 'multiple-choice',
          question: 'Как получить значения query string текущей страницы в JavaScript?',
          options: [
            'Через document.query.get("param")',
            'new URLSearchParams(window.location.search).get("param") — современный способ. Или window.location.search даёт строку "?key=value" для ручного парсинга',
            'Query string доступна только на сервере',
            'Через window.location.hash',
          ],
          correctIndex: 1,
          explanation:
            'Получение query string: window.location.search — возвращает строку вида "?name=John&age=25". Современный способ: const params = new URLSearchParams(window.location.search); params.get("name") → "John"; params.get("age") → "25"; params.has("name") → true; params.getAll("tag") → массив (если несколько одинаковых ключей); Array.from(params.entries()) → [["name","John"], ["age","25"]]. URLSearchParams — нативный API, не нужны библиотеки. Ручной парсинг (старый способ): location.search.substring(1).split("&").reduce(...).',
        },
      ],
    },
  ],
};
