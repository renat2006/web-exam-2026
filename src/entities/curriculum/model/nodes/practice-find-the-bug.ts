import type { SkillNode } from '../types';

// ═══════════════════════════════════════════════
// БЛОК: Найди баг (React) — Practice #56–59
// ═══════════════════════════════════════════════
export const PRACTICE_FIND_THE_BUG: SkillNode = {
  id: 'practice-find-the-bug',
  title: 'Найди баг: React',
  category: 'JavaScript',
  description: 'Реальный код с багами из практики. Найди проблему, выбери правильное исправление.',
  iconName: 'Zap',
  lessons: [
    {
      id: 'react-bugs-lesson',
      title: 'Баги в React-коде',
      xpReward: 15,
      slides: [
        // ─────────────────────────────────────────
        // Practice #56 — мутация state
        // ─────────────────────────────────────────
        {
          type: 'find-the-bug',
          title: 'Practice #56 — Мутация state',
          description: 'Кнопка +1 не увеличивает счёт. Найдите баг в `handlePlusOneClick` и выберите правильное исправление.',
          buggyCode: `function handlePlusOneClick() {
player.score++;  // ❌ что здесь не так?
}`,
          hints: [
            'React перерисовывает компонент только если вызван setState.',
            'Прямое изменение объекта state — мутация, React её не видит.',
            'setPlayer нужно вызвать с НОВЫМ объектом, не изменяя старый.',
          ],
          options: [
            'player.score++ правильный — нужно просто добавить forceUpdate()',
            'Нужно вызвать setPlayer({ ...player, score: player.score + 1 }) — создать новый объект с spread',
            'Нужно использовать useRef вместо useState для числовых значений',
            'player.score += 1 вместо player.score++ — разные операторы',
          ],
          correctIndex: 1,
          explanation: 'React сравнивает ссылки на объекты. player.score++ мутирует существующий объект — ссылка в state не меняется, React не видит изменения и не перерисовывает. Правильно: setPlayer({ ...player, score: player.score + 1 }) — создаём новый объект, React видит смену ссылки и перерисовывает.',
          fixedCode: `function handlePlusOneClick() {
setPlayer({ ...player, score: player.score + 1 });
}`,
        },
        // ─────────────────────────────────────────
        // Practice #57 — stale closure в setState
        // ─────────────────────────────────────────
        {
          type: 'find-the-bug',
          title: 'Practice #57 — Счётчик запросов (stale closure)',
          description: 'При быстрых кликах pending и completed показывают неверные значения. Что не так?',
          buggyCode: `async function handleClick() {
setPending(pending + 1);   // ❌
await sendRequest();
setPending(pending - 1);   // ❌
setCompleted(completed + 1); // ❌
}`,
          hints: [
            'pending и completed — значения из замыкания на момент вызова handleClick.',
            'После await значения в замыкании устарели (stale closure).',
            'setState с колбэком получает актуальное значение из React.',
          ],
          options: [
            'Нужно использовать useRef вместо useState — тогда значения всегда актуальны',
            'Нужно использовать функциональные апдейты: setPending(p => p + 1), setPending(p => p - 1), setCompleted(c => c + 1)',
            'Нужно сделать handleClick синхронной — убрать async/await',
            'Нужно добавить useCallback с [pending, completed] в зависимостях',
          ],
          correctIndex: 1,
          explanation: 'pending + 1 использует значение из замыкания на момент создания handleClick. При быстрых кликах замыкание устаревает — несколько кликов могут читать одно и то же pending=0. Функциональный апдейт setState(prev => prev + 1) гарантирует работу с актуальным значением из очереди React.',
          fixedCode: `async function handleClick() {
setPending(p => p + 1);
await sendRequest();
setPending(p => p - 1);
setCompleted(c => c + 1);
}`,
        },
        // ─────────────────────────────────────────
        // Practice #58 — useEffect без deps
        // ─────────────────────────────────────────
        {
          type: 'find-the-bug',
          title: 'Practice #58 — useEffect без массива зависимостей',
          description: 'ChatRoom переподключается при каждом нажатии клавиши в input. Найдите причину.',
          buggyCode: `useEffect(() => {
const connection = createConnection(roomId);
connection.connect();
return () => connection.disconnect();
});  // ❌ — что здесь не так?`,
          hints: [
            'useEffect без второго аргумента запускается после КАЖДОГО рендера.',
            'setMessage при вводе текста вызывает ренд → useEffect → переподключение.',
            'Нужно указать зависимости явно.',
          ],
          options: [
            'Нужно убрать return () => connection.disconnect() — cleanup мешает',
            'useEffect без зависимостей запускается после каждого рендера — нужно добавить [roomId] как второй аргумент',
            'Нужно передать [] — пустой массив зависимостей, чтобы запускалось один раз',
            'Нужно использовать useLayoutEffect вместо useEffect',
          ],
          correctIndex: 1,
          explanation: 'useEffect без второго аргумента — запускается после каждого рендера. setMessage вызывает ренд → useEffect → disconnect → connect. Правильно: useEffect([fn], [roomId]) — запускается только при смене roomId. [] запустит один раз и не среагирует на смену roomId.',
          fixedCode: `useEffect(() => {
const connection = createConnection(roomId);
connection.connect();
return () => connection.disconnect();
}, [roomId]);  // ✅ — только при смене roomId`,
        },
        // ─────────────────────────────────────────
        // Practice #59 — интервал пересоздаётся
        // ─────────────────────────────────────────
        {
          type: 'find-the-bug',
          title: 'Practice #59 — Интервал сбрасывается каждый рендер',
          description: 'Таймер нестабильно тикает. Интервал пересоздаётся при каждом изменении count. Как исправить?',
          buggyCode: `useEffect(() => {
const id = setInterval(() => {
  setCount(count + step);  // ❌
}, 1000);
return () => clearInterval(id);
}, [count, step]);  // ❌ — count меняется → effect пересоздаётся`,
          hints: [
            'count в зависимостях вызывает пересоздание интервала при каждом тике.',
            'Функциональный апдейт setState(prev => ...) не требует count в deps.',
            'После убирания count из deps — lint может жаловаться, но это правильно.',
          ],
          options: [
            'Нужно убрать return () => clearInterval(id) — чтобы интервал не очищался',
            'Нужно использовать setCount(prev => prev + step) и убрать count из зависимостей: }, [step])',
            'Нужно передать [] пустые зависимости — тогда интервал создаётся один раз',
            'Нужно заменить setInterval на setTimeout внутри рекурсии',
          ],
          correctIndex: 1,
          explanation: 'count в deps → эффект пересоздаётся каждый тик (count меняется → пересоздание интервала → снова меняется). Решение: функциональный апдейт setCount(prev => prev + step) — не захватывает count в замыкание, deps: [step]. Интервал пересоздаётся только при смене step.',
          fixedCode: `useEffect(() => {
const id = setInterval(() => {
  setCount(prev => prev + step);  // ✅
}, 1000);
return () => clearInterval(id);
}, [step]);  // ✅ — только step в deps`,
        },

        // ─────────────────────────────────────────
        // Conceptual: Practice #8 — XSS + innerHTML
        // ─────────────────────────────────────────
        {
          type: 'multiple-choice',
          question: 'Чем опасен код `el.innerHTML = userInput` и как исправить?',
          codeSnippet: `const el = document.getElementById('comment');
el.innerHTML = userInput; // userInput приходит от пользователя`,
          options: [
            'Ничем не опасен — браузер автоматически экранирует HTML',
            'XSS: если userInput содержит <script>alert(1)</script> или <img onerror="...">, он выполнится. Исправление: textContent (только текст) или DOMPurify.sanitize() (разрешённый HTML)',
            'Только проблема производительности — innerHTML медленнее textContent',
            'Опасен только если userInput пришёл с сервера, от своего пользователя — безопасно',
          ],
          correctIndex: 1,
          explanation: 'innerHTML парсит строку как HTML и выполняет вставленные скрипты. Пример: userInput = \'<img src=x onerror="alert(document.cookie)">\'. Два подхода: (1) el.textContent = userInput — безопасно, но показывает только текст (теги не работают). (2) el.innerHTML = DOMPurify.sanitize(userInput) — очищает опасный HTML, оставляя безопасную разметку (жирный, курсив, ссылки). Выбор зависит от требований: нужна ли разметка или только текст.',
        },
        // ─────────────────────────────────────────
        // Conceptual: Practice #40 — где хранить токен
        // ─────────────────────────────────────────
        {
          type: 'multiple-choice',
          question: 'Где хранить access token в браузере — localStorage, sessionStorage или httpOnly cookie?',
          options: [
            'localStorage — самый удобный вариант, используй его',
            'httpOnly cookie — недоступен из JS (защита от XSS), сервер выставляет; для CSRF нужен SameSite=Strict/Lax или CSRF-токен. localStorage и sessionStorage уязвимы для XSS',
            'sessionStorage лучше localStorage — очищается при закрытии вкладки',
            'Все три одинаково безопасны — выбор не имеет значения',
          ],
          correctIndex: 1,
          explanation: 'localStorage: уязвим к XSS (любой JS на странице может прочитать), не очищается. sessionStorage: тоже уязвим к XSS, очищается при закрытии вкладки. httpOnly cookie: JS не может читать (document.cookie не вернёт его) — защита от XSS. Уязвим к CSRF — решается SameSite=Strict/Lax (современные браузеры) + CSRF-токен. Refresh token — всегда в httpOnly cookie. Access token — в памяти (переменная) или httpOnly cookie. Никогда не храни токены в localStorage для продакшена.',
        },
        // ─────────────────────────────────────────
        // Conceptual: Practice #9 — JWT структура
        // ─────────────────────────────────────────
        {
          type: 'multiple-choice',
          question: 'Из каких трёх частей состоит JWT и можно ли доверять данным в payload на клиенте?',
          options: [
            'Из header, body, footer. Payload зашифрован — данные в нём надёжны',
            'Header (алгоритм + тип), Payload (claims: sub, name, exp — Base64URL, не зашифровано), Signature (HMAC/RSA подпись). Payload читается без секрета, но подделать без ключа нельзя. Доверять можно только если подпись верифицирована на сервере',
            'JWT — это шифрование. Данные в нём недоступны без private key',
            'Из username, password и expire time — всё в открытом виде',
          ],
          correctIndex: 1,
          explanation: 'JWT = header.payload.signature (base64url-кодированные части через точку). Header: {"alg":"HS256","typ":"JWT"}. Payload: {"sub":"123","name":"John","exp":1516242622} — читается через atob() или JSON.parse(atob(parts[1])). Signature: HMAC(header+"."+payload, secret) — только сервер знает secret, без него нельзя создать валидную подпись. Клиент МОЖЕТ читать payload (not encrypted!), но НЕЛЬЗЯ доверять без проверки подписи. exp — Unix timestamp: new Date(payload.exp * 1000).',
        },
      ],
    },
  ],
};
