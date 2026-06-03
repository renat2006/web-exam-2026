import type { SkillNode } from '../types';

// ═══════════════════════════════════════════════
// БЛОК 9: DevTools и инструменты разработки
// Theory вопросы: #7
// ═══════════════════════════════════════════════
export const DEVTOOLS: SkillNode = {
  id: 'devtools',
  title: 'DevTools и отладка',
  category: 'HTML/CSS',
  description: 'Использование браузерных DevTools для работы с HTML, CSS, сетью и JavaScript.',
  iconName: 'Settings',
  lessons: [
    {
      id: 'devtools-lesson',
      title: 'Практические сценарии DevTools',
      xpReward: 10,
      slides: [
        {
          type: 'theory',
          title: 'Браузерные DevTools — что умеют?',
          definition:
            'DevTools (F12) — встроенные инструменты браузера для отладки веба. Ключевые вкладки: Elements (HTML/CSS), Console (JS-логи, ошибки), Network (запросы), Sources (отладка JS), Performance, Application (хранилища).',
          comparison: {
            title: 'Основные вкладки DevTools',
            headers: ['Вкладка', 'Что делает', 'Типичный сценарий'],
            rows: [
              ['Elements', 'HTML-дерево, CSS-стили, Box Model', 'Почему кнопка не по центру? Какой вес у стиля?'],
              ['Console', 'JS-логи, ошибки, выполнение кода', 'console.log(), отладка переменных, ошибки JS'],
              ['Network', 'HTTP-запросы: статус, заголовки, тело', 'Почему API не отвечает? Что приходит в ответе?'],
              ['Sources', 'Исходники, breakpoints, step-by-step', 'Пошаговая отладка JS, точки останова'],
              ['Application', 'localStorage, sessionStorage, Cookies', 'Что сохранено? Очистить хранилище.'],
            ],
          },
          pitfalls: [
            'В Elements можно редактировать HTML/CSS прямо в браузере — изменения временные, не сохраняются в файлы.',
            'Network: 304 Not Modified — ресурс взят из кеша браузера. Нажмите Ctrl+Shift+R для hard reload.',
            'Console: красные ошибки — критические; жёлтые предупреждения — некритические. Всегда проверяйте перед сдачей.',
          ],
          keyTerms: [
            { term: 'Elements', definition: 'Панель HTML/CSS — инспектировать, редактировать, смотреть Box Model и специфичность' },
            { term: 'Console', definition: 'JavaScript-консоль: логи, ошибки, выполнение кода в runtime' },
            { term: 'Network', definition: 'Сетевые запросы: метод, URL, статус, заголовки, тело запроса и ответа' },
            { term: 'Breakpoint', definition: 'Точка останова в Sources — код приостанавливается, можно смотреть переменные' },
          ],
          mnemonic: 'Elements = смотри DOM. Console = смотри JS. Network = смотри запросы. Sources = отлаживай код. F12 — открыть. Ctrl+Shift+R — жёсткое обновление без кеша.',
        },
        {
          type: 'multiple-choice',
          question: 'Как с помощью DevTools выяснить, почему элемент стилизован не так как ожидалось?',
          options: [
            'Открыть вкладку Network и посмотреть CSS-файл',
            'Открыть вкладку Elements → выбрать элемент → в панели Styles посмотреть какие правила применены, какие перечёркнуты (переопределены)',
            'Запустить console.log(element.style) в консоли',
            'Открыть Sources и найти CSS-файл вручную',
          ],
          correctIndex: 1,
          explanation:
            'Вкладка Elements → выбор элемента → панель Styles показывает все CSS-правила, применённые к элементу, в порядке приоритета. Перечёркнутые правила переопределены другими (более специфичными). Computed показывает итоговые значения. Box Model — визуально margin/border/padding/content.',
        },
        {
          type: 'multiple-choice',
          question: 'Какую вкладку DevTools использовать для анализа почему API-запрос возвращает 401?',
          options: [
            'Elements — там видно HTML-форму с параметрами запроса',
            'Sources — там можно найти функцию, делающую запрос',
            'Network — там видны все HTTP-запросы, их заголовки, статус и тело ответа',
            'Application — там хранятся токены авторизации',
          ],
          correctIndex: 2,
          explanation:
            'Network — правильный ответ. Открываем вкладку → находим нужный запрос → смотрим: Status (401), Headers (есть ли Authorization), Response (текст ошибки). Application может помочь проверить наличие токена в localStorage/cookies, но Network покажет сам факт запроса и ответа.',
        },
      ],
    },
  ],
};
