import type { SkillNode } from '../types';

export const CLIENT_SERVER: SkillNode = {
  id: 'client-server',
  title: 'Клиент-серверное взаимодействие и API',
  category: 'Network',
  description: 'REST API, Fetch, Axios, WebSocket, Swagger/OpenAPI, обработка ошибок, передача данных, SSE, Long Polling, архитектура API-слоя.',
  iconName: 'Globe',
  lessons: [
    {
      id: 'rest-fetch-axios',
      title: 'REST API, Fetch и Axios',
      xpReward: 10,
      slides: [
        // ✅ Theory #159 — Что такое REST API? На каких принципах он построен?
        {
          type: 'theory',
          title: 'Что такое REST API?',
          definition:
            'REST API (Representational State Transfer) — это способ организовать HTTP API вокруг ресурсов, адресов и стандартных методов запроса. Не протокол, а архитектурный стиль.',
          keyTerms: [
            { term: 'Ресурс', definition: 'Сущность, с которой работает приложение: users, posts, tasks' },
            { term: 'Эндпоинт', definition: 'Конкретный адрес ресурса: GET /tasks, POST /tasks, DELETE /tasks/12' },
            { term: 'Stateless', definition: 'Сервер не хранит состояние клиента — каждый запрос содержит всю нужную информацию' },
          ],
          comparison: {
            title: 'HTTP-методы REST',
            headers: ['Метод', 'Действие', 'Пример'],
            rows: [
              ['GET', 'Получить данные', 'GET /tasks'],
              ['POST', 'Создать запись', 'POST /tasks'],
              ['PUT', 'Полностью заменить', 'PUT /tasks/12'],
              ['PATCH', 'Частично изменить', 'PATCH /tasks/12'],
              ['DELETE', 'Удалить', 'DELETE /tasks/12'],
            ],
          },
          pitfalls: [
            'REST — архитектурный стиль, а НЕ протокол. Работает поверх HTTP.',
            'Нельзя всё делать через GET — у GET семантика «только чтение», браузеры и прокси могут кешировать, предзагружать.',
            'Коды ответа: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Server Error.',
          ],
        },
        {
          type: 'multiple-choice',
          question: 'Что такое REST API? На каких принципах он построен?',
          options: [
            'REST — это отдельный протокол передачи данных, аналог FTP или SMTP',
            'REST — архитектурный стиль для HTTP API. Принципы: (1) клиент-сервер разделены, (2) stateless — сервер не хранит состояние клиента, (3) кеширование ответов, (4) единый интерфейс (ресурсы по URL + стандартные HTTP-методы), (5) многоуровневая архитектура',
            'REST — это JavaScript-фреймворк для создания серверных приложений',
            'REST — это база данных для хранения JSON-документов',
          ],
          correctIndex: 1,
          explanation: 'REST = архитектурный стиль поверх HTTP. Ключевые принципы: (1) разделение клиента и сервера — независимая разработка, (2) stateless — каждый запрос самодостаточен (содержит токен, параметры), сервер не помнит предыдущие, (3) кеширование — GET-ответы можно кешировать, (4) единый интерфейс — ресурсы (users, posts) адресуются по URL, действия определяются HTTP-методами (GET/POST/PUT/DELETE), (5) многоуровневость — прокси, балансировщики, CDN между клиентом и сервером.',
        },
        // ✅ Theory #160 — Что такое Fetch API и как им сделать простой GET- и POST-запрос?
        {
          type: 'theory',
          title: 'Fetch API: GET и POST',
          definition:
            'Fetch API — встроенный в браузер интерфейс для отправки HTTP-запросов. Основан на Promise, имеет простой синтаксис. Пришёл на замену XMLHttpRequest.',
          codeExample: `// GET-запрос:
const response = await fetch('/api/tasks');
if (!response.ok) throw new Error(\`Ошибка: \${response.status}\`);
const tasks = await response.json();

// POST-запрос:
const response = await fetch('/api/tasks', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title: 'Новая задача' })
});`,
          pitfalls: [
            'Fetch НЕ бросает ошибку при 404/500 — промис резолвится! Нужно проверять response.ok вручную.',
            'Для POST обязательно: (1) method: "POST", (2) headers с Content-Type, (3) body с JSON.stringify().',
            'response.json() тоже возвращает Promise — нужен второй await.',
          ],
        },
        {
          type: 'multiple-choice',
          question: 'Что такое Fetch API и как им сделать простой GET- и POST-запрос?',
          options: [
            'Fetch — сторонняя библиотека, которую нужно устанавливать через npm',
            'Fetch API — встроенный браузерный интерфейс на основе Promise. GET: await fetch(url), POST: await fetch(url, {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(data)}). Важно: Fetch НЕ бросает ошибку при 4xx/5xx — нужно проверять response.ok',
            'Fetch — это метод jQuery для AJAX-запросов',
            'Fetch работает только синхронно и блокирует основной поток',
          ],
          correctIndex: 1,
          explanation: 'Fetch API встроен в браузер (не нужен npm). GET: fetch("/api/data") → Promise<Response>. POST: fetch(url, {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(obj)}). Ключевая особенность: fetch НЕ reject-ит промис при HTTP-ошибках (404, 500) — промис reject-ится только при сетевой ошибке. Нужно проверять: if (!response.ok) throw new Error(response.status). Данные: await response.json().',
        },
        // ✅ Theory #161 — В чём разница между Axios и Fetch? Когда выбрать что?
        {
          type: 'multiple-choice',
          question: 'В чём разница между Axios и Fetch? Когда выбрать что?',
          options: [
            'Нет разницы — Axios это просто обёртка без дополнительных возможностей',
            'Axios: автоматический JSON (не нужен JSON.stringify/response.json()), бросает ошибку при 4xx/5xx, interceptors, timeout, отмена запросов, работает в Node.js. Fetch: встроен в браузер (0 зависимостей), streaming ответов, более низкоуровневый. Fetch — для простых проектов, Axios — для сложных с interceptors и единым API-клиентом',
            'Fetch быстрее Axios в 10 раз',
            'Axios работает только в Node.js, Fetch — только в браузере',
          ],
          correctIndex: 1,
          explanation: 'Fetch: встроен, 0 зависимостей, но нужно вручную: JSON.stringify для body, response.json() для чтения, проверка response.ok, нет timeout из коробки. Axios: автоматический JSON (передаёшь объект — получаешь объект), бросает ошибку при 4xx/5xx, interceptors (добавить токен ко всем запросам), axios.create() для единого клиента с baseURL, timeout. Выбор: маленький проект без сложной логики → Fetch, крупное приложение с авторизацией/retry/interceptors → Axios.',
        },
      ],
    },
    {
      id: 'websocket-swagger',
      title: 'WebSocket, Swagger/OpenAPI',
      xpReward: 10,
      slides: [
        // ✅ Theory #162 — В чём разница между WebSocket и HTTP? В каких случаях нужен WebSocket?
        {
          type: 'theory',
          title: 'WebSocket vs HTTP',
          definition:
            'WebSocket — протокол, обеспечивающий постоянное двустороннее соединение между клиентом и сервером. В отличие от HTTP (запрос-ответ), WebSocket держит открытую «трубу», по которой обе стороны могут отправлять данные в любой момент.',
          comparison: {
            title: 'HTTP vs WebSocket',
            headers: ['Характеристика', 'HTTP', 'WebSocket'],
            rows: [
              ['Модель', 'Запрос → ответ', 'Постоянное соединение'],
              ['Инициатор', 'Только клиент', 'Обе стороны'],
              ['Применение', 'CRUD, REST API', 'Чаты, уведомления, live-данные'],
              ['Заголовки', 'Каждый запрос', 'Только при handshake'],
              ['Установка', 'Каждый запрос отдельно', 'HTTP Upgrade → ws://'],
            ],
          },
          codeExample: `const socket = new WebSocket('ws://localhost:4000');

socket.addEventListener('open', () => {
  socket.send(JSON.stringify({ type: 'ping' }));
});

socket.addEventListener('message', (event) => {
  const data = JSON.parse(event.data);
  console.log('Получено:', data);
});

socket.addEventListener('close', () => {
  console.log('Соединение закрыто');
});`,
        },
        {
          type: 'multiple-choice',
          question: 'В чём разница между WebSocket и HTTP? В каких случаях нужен WebSocket?',
          options: [
            'WebSocket — это более быстрая версия HTTP для обычных запросов',
            'HTTP — модель «запрос-ответ» (клиент инициирует, сервер отвечает, соединение закрывается). WebSocket — постоянное двустороннее соединение, обе стороны могут слать данные в любой момент. WebSocket нужен для: чатов, уведомлений в реальном времени, онлайн-игр, live-данных (биржа, спорт)',
            'WebSocket заменяет HTTP полностью — все современные сайты используют только WebSocket',
            'WebSocket — это просто HTTP с более длинным timeout',
          ],
          correctIndex: 1,
          explanation: 'HTTP: клиент отправил запрос → сервер ответил → соединение закрылось. Для новых данных нужен новый запрос. WebSocket: начинается как HTTP (GET /chat с заголовком Upgrade: websocket), сервер отвечает 101 Switching Protocols → соединение остаётся открытым. Обе стороны обмениваются фреймами без HTTP-заголовков. Нужен когда: сервер должен пушить данные клиенту (чат, уведомления), нужна низкая задержка (онлайн-игры), частый обмен мелкими сообщениями.',
        },
        // ✅ Theory #163 — Что такое Swagger / OpenAPI? Какую задачу они решают?
        {
          type: 'multiple-choice',
          question: 'Что такое Swagger / OpenAPI? Какую задачу они решают?',
          options: [
            'Swagger — это фреймворк для создания REST API на Node.js',
            'OpenAPI — открытая спецификация для описания HTTP API в YAML/JSON (эндпоинты, параметры, схемы запросов/ответов). Swagger — набор инструментов на основе OpenAPI: Swagger UI (интерактивная документация), генерация клиентских SDK, мок-серверов. Решают: единый источник правды по API для frontend, backend и QA',
            'Swagger — это инструмент для тестирования UI, аналог Cypress',
            'OpenAPI — это формат хранения данных, альтернатива SQL',
          ],
          correctIndex: 1,
          explanation: 'OpenAPI (спецификация) описывает API: эндпоинты (/users, /tasks/{id}), методы (GET/POST), параметры (query, path, body), схемы данных (User: {id, name, email}), коды ответов (200, 404, 500). Swagger (инструменты): Swagger UI — интерактивная документация, где можно тестировать запросы прямо из браузера; swagger-codegen — генерация клиентского кода. Зачем: frontend знает точный формат запроса/ответа, backend — что реализовать, QA — что проверять. Единый контракт.',
        },
        // ✅ Theory #164 — В чём отличия XMLHttpRequest, Fetch API и Axios?
        {
          type: 'multiple-choice',
          question: 'В чём отличия XMLHttpRequest, Fetch API и Axios? Какие у каждого плюсы и минусы?',
          options: [
            'Все три — одно и то же, просто разные названия',
            'XMLHttpRequest: старый API на коллбэках, громоздкий, но поддерживает progress-события. Fetch: встроенный, на промисах, чище синтаксис, но не бросает ошибку при 4xx/5xx, нет timeout. Axios: сторонняя библиотека, автоматический JSON, interceptors, timeout, бросает ошибку при 4xx/5xx, работает и в браузере, и в Node.js',
            'XMLHttpRequest — для GET, Fetch — для POST, Axios — для DELETE',
            'Fetch и Axios — устаревшие, XMLHttpRequest — современный стандарт',
          ],
          correctIndex: 1,
          explanation: 'XMLHttpRequest: API на коллбэках (onload/onerror), подвержен callback hell, но есть onprogress для отслеживания загрузки. Fetch: встроен в браузер, Promise-based, чистый синтаксис, но: не reject при 404/500, нет timeout, нет interceptors. Axios: npm-пакет, автоматический JSON.parse/stringify, reject при 4xx/5xx, interceptors (добавить токен), axios.create() для единого клиента, timeout, отмена запросов, работает в Node.js.',
        },
      ],
    },
    {
      id: 'error-handling-data-transfer',
      title: 'Обработка ошибок и передача данных',
      xpReward: 10,
      slides: [
        // ✅ Theory #165 — Как обрабатывать ошибки в Fetch API?
        {
          type: 'theory',
          title: 'Обработка ошибок в Fetch API',
          definition:
            'Fetch API имеет особенную модель ошибок: промис reject-ится ТОЛЬКО при сетевых ошибках (нет интернета, DNS не резолвится). HTTP-ошибки (404, 500) НЕ вызывают reject — промис резолвится с response.ok === false.',
          codeExample: `async function fetchData(url) {
  try {
    const response = await fetch(url);

    // 1. HTTP-ошибки — проверяем вручную
    if (!response.ok) {
      throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
    }

    // 2. Ошибки парсинга — если сервер вернул не JSON
    const data = await response.json();
    return data;

  } catch (error) {
    // 3. Сетевые ошибки (TypeError: Failed to fetch)
    // + наши thrown errors
    console.error('Ошибка:', error.message);
  }
}`,
          pitfalls: [
            'Категория 1: Сетевые ошибки — fetch reject (TypeError). Нет интернета, CORS, DNS.',
            'Категория 2: HTTP-ошибки — fetch resolve, но response.ok === false. Статусы 4xx, 5xx.',
            'Категория 3: Ошибки парсинга — response.json() бросает ошибку, если тело не JSON.',
            'Частая ошибка: сразу вызвать response.json() без проверки response.ok.',
          ],
        },
        {
          type: 'multiple-choice',
          question: 'Как обрабатывать ошибки в Fetch API? Какие категории ошибок надо различать?',
          options: [
            'Fetch автоматически бросает ошибку при любом статусе кроме 200 — достаточно try/catch',
            'Три категории: (1) сетевые ошибки (нет интернета, CORS) — fetch reject-ит промис, (2) HTTP-ошибки (404, 500) — промис resolve, но response.ok === false, нужно проверять вручную, (3) ошибки парсинга — response.json() бросает ошибку если тело не JSON',
            'Fetch не может возвращать ошибки — все запросы всегда успешны',
            'Достаточно обернуть fetch в try/catch — это поймает все ошибки автоматически',
          ],
          correctIndex: 1,
          explanation: 'Fetch reject-ит промис ТОЛЬКО при сетевых ошибках (нет сети, CORS-блокировка). При 404/500 промис resolve-ится! Поэтому: (1) Сетевая ошибка → catch(err) с TypeError, (2) HTTP-ошибка → проверяем if (!response.ok) throw new Error(response.status), (3) Парсинг → response.json() может упасть, если сервер вернул HTML/текст вместо JSON. Правильный порядок: fetch → проверить ok → response.json() → try/catch оборачивает всё.',
        },
        // ✅ Theory #166 — Какие способы передачи данных от клиента к серверу существуют?
        {
          type: 'multiple-choice',
          question: 'Какие способы передачи данных от клиента к серверу существуют (JSON, FormData, query string)? В каких случаях что использовать?',
          options: [
            'Всегда нужно использовать JSON — других способов нет',
            'JSON (Content-Type: application/json) — структурированные данные, API. FormData — файлы, загрузка изображений, multipart/form-data. Query string (?key=value) — фильтры, поиск, пагинация в GET-запросах. URL params (/users/123) — идентификаторы ресурсов',
            'FormData используется только для HTML-форм без JavaScript',
            'Query string — основной способ отправки данных на сервер, JSON — устаревший',
          ],
          correctIndex: 1,
          explanation: 'JSON: тело POST/PUT/PATCH запроса, Content-Type: application/json, JSON.stringify(obj). Используется для: создание/обновление ресурсов, сложные структуры данных. FormData: multipart/form-data, используется для: загрузки файлов (аватар, документы), бинарных данных. new FormData(); fd.append("file", fileInput.files[0]). Query string: ?page=2&sort=name — параметры URL, используется для: фильтрации, сортировки, пагинации в GET-запросах. URL params: /users/123 — идентификаторы ресурса.',
        },
      ],
    },
    {
      id: 'realtime-patterns',
      title: 'Real-time и архитектура API-слоя',
      xpReward: 10,
      slides: [
        // ✅ Theory #167 — В чём разница между WebSocket, Long Polling и SSE?
        {
          type: 'theory',
          title: 'WebSocket vs Long Polling vs SSE',
          definition:
            'Три подхода к получению данных от сервера в реальном времени, каждый со своими компромиссами.',
          comparison: {
            title: 'Сравнение real-time подходов',
            headers: ['Характеристика', 'Long Polling', 'SSE', 'WebSocket'],
            rows: [
              ['Протокол', 'HTTP', 'HTTP', 'WS (поверх TCP)'],
              ['Направление', 'Сервер → клиент', 'Сервер → клиент', 'Двустороннее'],
              ['Соединение', 'Повторные запросы', 'Постоянный поток', 'Постоянное'],
              ['Сложность', 'Простая', 'Средняя', 'Высокая'],
              ['Применение', 'Уведомления, polling', 'Новости, котировки', 'Чаты, игры'],
            ],
          },
        },
        {
          type: 'multiple-choice',
          question: 'В чём разница между WebSocket, Long Polling и Server-Sent Events (SSE)? Как выбрать?',
          options: [
            'Все три — одно и то же, просто разные названия для AJAX',
            'Long Polling: клиент шлёт запрос → сервер держит соединение до появления данных → ответ → клиент повторяет. SSE: однонаправленный поток сервер→клиент через HTTP (EventSource), автоматический переподключение. WebSocket: постоянное двустороннее соединение. Выбор: только чтение (новости) → SSE, двусторонний обмен (чат) → WebSocket, простой fallback → Long Polling',
            'WebSocket работает только в мобильных приложениях',
            'SSE — это устаревший стандарт, заменённый WebSocket',
          ],
          correctIndex: 1,
          explanation: 'Long Polling: клиент отправляет HTTP-запрос, сервер не отвечает пока нет данных. Получив ответ, клиент сразу отправляет новый запрос. Плюс: работает везде. Минус: overhead от HTTP-заголовков, задержки. SSE (EventSource): HTTP-соединение, сервер шлёт events потоком (text/event-stream). Плюсы: автоматический reconnect, простой API. Минус: только сервер→клиент. WebSocket: полный дуплекс, минимальный overhead. Минус: сложнее реализовать (reconnect, heartbeat).',
        },
        // ✅ Theory #168 — Как организовать переход с mock-сервиса на реальный backend?
        {
          type: 'multiple-choice',
          question: 'Как организовать переход с mock-сервиса на реальный backend в процессе разработки?',
          options: [
            'Заменить все URL вручную по всему приложению',
            'Вынести API-вызовы в отдельный сервисный слой (api/tasksApi.ts). Компоненты вызывают абстрактные функции (getTasks, createTask), не зная деталей реализации. При переходе на реальный backend меняется только реализация сервисного слоя — компоненты остаются без изменений. Плюс: environment-переменные для baseURL',
            'Использовать mock-данные в продакшене — переход не нужен',
            'Переписать всё приложение с нуля под реальный backend',
          ],
          correctIndex: 1,
          explanation: 'Паттерн API-слоя: (1) api/tasksApi.ts — файл с функциями getTasks(), createTask(title). (2) Внутри может быть fetch/axios с mock-URL или реальным backend. (3) Компоненты импортируют только абстрактные функции — не знают про URL, заголовки, формат. (4) При переходе: меняем реализацию внутри api/ — baseURL, возможно формат ответа. Компоненты не трогаем. (5) ENV-переменные: VITE_API_URL для разных окружений (dev/staging/prod).',
        },
        // ✅ Theory #169 — Спроектируйте архитектуру API client layer
        {
          type: 'multiple-choice',
          question: 'Спроектируйте архитектуру API client layer для крупного React-приложения. Какие должны быть слои, как обрабатывать токены, ошибки, retry, race conditions, mock?',
          options: [
            'Достаточно одного файла api.ts с fetch-вызовами — архитектура не нужна',
            'Слои: (1) HTTP-клиент (axios.create с baseURL, timeout, interceptors для токенов), (2) API-модули по доменам (usersApi, tasksApi), (3) хуки/thunks для интеграции с React. Interceptors: request — добавление Bearer-токена, response — обработка 401 (refresh token). Retry через axios-retry. Race conditions — AbortController. Mock — подмена реализации через env/DI',
            'Архитектура API — это задача backend-разработчика, не frontend',
            'Нужно делать все запросы через глобальную функцию window.fetch',
          ],
          correctIndex: 1,
          explanation: 'Архитектура API-слоя: (1) HTTP-клиент: axios.create({baseURL, timeout}) + interceptors. Request interceptor: config.headers.Authorization = Bearer token. Response interceptor: при 401 → refresh token → повторить запрос. (2) API-модули: usersApi.getUser(id), tasksApi.create(data) — каждый домен в своём файле. (3) React-слой: кастомные хуки (useFetch), RTK createAsyncThunk. (4) Retry: axios-retry с exponential backoff. (5) Race conditions: AbortController для отмены устаревших запросов. (6) Mock: переключение через env-переменную или DI.',
        },
        // ✅ Theory #170 — Что такое race condition при загрузке данных в SPA?
        {
          type: 'multiple-choice',
          question: 'Что такое race condition при загрузке данных в SPA и какие есть подходы к её предотвращению?',
          options: [
            'Race condition — это когда сервер не успевает обработать запрос',
            'Race condition — ситуация, когда несколько асинхронных запросов «соревнуются» и ответ на устаревший запрос приходит позже актуального, перезаписывая правильные данные. Решения: (1) AbortController — отмена предыдущего запроса, (2) флаг ignore в cleanup useEffect, (3) сравнение ID запроса с текущим, (4) библиотеки (React Query, SWR) с встроенной защитой',
            'Race condition возникает только при использовании WebSocket',
            'Race condition — это проблема многопоточности, которой нет в JavaScript',
          ],
          correctIndex: 1,
          explanation: 'Пример: пользователь быстро переключает фильтр A→B→C. Запрос A отправлен → запрос B → запрос C. Ответ C приходит быстро → отображаем C. Но потом приходит ответ A (медленный сервер) → перезаписывает C → показываем устаревшие данные. Решения: (1) AbortController: const controller = new AbortController(); fetch(url, {signal: controller.signal}); в cleanup: controller.abort(). (2) Флаг: let ignore = false; useEffect(() => { fetch().then(data => { if (!ignore) setData(data) }); return () => { ignore = true }; }). (3) React Query/SWR автоматически отменяют устаревшие запросы.',
        },
        // ✅ Theory #171 — Как сделать надёжное WebSocket-соединение в production?
        {
          type: 'multiple-choice',
          question: 'Как сделать «надёжное» WebSocket-соединение в production-приложении? Какие проблемы надо учесть и как их решать (reconnect, heartbeat, очередь сообщений, идемпотентность)?',
          options: [
            'WebSocket всегда надёжен — дополнительная обработка не нужна',
            'Проблемы и решения: (1) обрыв соединения → автоматический reconnect с exponential backoff, (2) «тихий» разрыв → heartbeat (ping/pong каждые N секунд), (3) потеря сообщений при reconnect → очередь сообщений на клиенте + подтверждения, (4) дублирование → идемпотентность (уникальные ID сообщений, сервер игнорирует дубли), (5) масштабирование → Redis Pub/Sub между серверами',
            'Достаточно обернуть new WebSocket() в try/catch',
            'WebSocket не подходит для production — нужно использовать только HTTP',
          ],
          correctIndex: 1,
          explanation: 'Production WebSocket: (1) Reconnect: при onclose/onerror — переподключение с exponential backoff (1с→2с→4с→8с→max 30с). (2) Heartbeat: клиент шлёт ping каждые 30с, если pong не пришёл за 5с — считаем соединение мёртвым, reconnect. Без heartbeat proxy/firewall могут тихо закрыть idle-соединение. (3) Очередь: при потере соединения сообщения копятся в очереди, при reconnect — отправляются. (4) Идемпотентность: каждое сообщение имеет уникальный messageId, сервер проверяет и игнорирует дубли. (5) При нескольких серверах — Redis Pub/Sub для синхронизации.',
        },
      ],
    },
  ],
};
