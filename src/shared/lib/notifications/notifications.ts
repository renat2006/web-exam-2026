/**
 * Local notification system for DevLingo PWA
 * 
 * Uses the Notification API + setTimeout for scheduled reminders.
 * No push server needed — all runs client-side.
 * 
 * Features:
 * - Permission request with smart timing
 * - Streak reminders (evening if user hasn't practiced today)
 * - Session completion celebration
 * - Comeback reminders after inactivity
 * - Exam countdown alerts
 */

const STORAGE_KEY = 'devlingo_notif_state';
const LAST_PRACTICE_KEY = 'devlingo_last_practice_date';

interface NotifState {
  permission: NotificationPermission | 'not-asked';
  enabled: boolean;
  lastReminder: number; // timestamp
  reminderHour: number; // 0-23
  streak: number;
}

function getState(): NotifState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    permission: 'not-asked',
    enabled: true,
    lastReminder: 0,
    reminderHour: 19, // default 7pm
    streak: 0,
  };
}

function saveState(state: NotifState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/** Check if user practiced today */
export function markPracticeToday() {
  const today = new Date().toISOString().slice(0, 10);
  localStorage.setItem(LAST_PRACTICE_KEY, today);
  
  // Also update daily counter for heatmap
  const dailyKey = `devlingo_daily_${today}`;
  const current = Number(localStorage.getItem(dailyKey) || '0');
  localStorage.setItem(dailyKey, String(current + 1));
}

function didPracticeToday(): boolean {
  const today = new Date().toISOString().slice(0, 10);
  return localStorage.getItem(LAST_PRACTICE_KEY) === today;
}

function daysSinceLastPractice(): number {
  const last = localStorage.getItem(LAST_PRACTICE_KEY);
  if (!last) return 999;
  const lastDate = new Date(last);
  const now = new Date();
  const diff = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

/** Request notification permission with a nice UX delay */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  
  if (Notification.permission === 'granted') {
    const state = getState();
    state.permission = 'granted';
    state.enabled = true;
    saveState(state);
    return true;
  }
  
  if (Notification.permission === 'denied') {
    const state = getState();
    state.permission = 'denied';
    saveState(state);
    return false;
  }
  
  // Ask permission
  const result = await Notification.requestPermission();
  const state = getState();
  state.permission = result;
  state.enabled = result === 'granted';
  saveState(state);
  return result === 'granted';
}

/** Check if notifications are available and enabled */
export function isNotificationsEnabled(): boolean {
  if (!('Notification' in window)) return false;
  if (Notification.permission !== 'granted') return false;
  const state = getState();
  return state.enabled;
}

/** Toggle notifications on/off */
export function toggleNotifications(enabled: boolean) {
  const state = getState();
  state.enabled = enabled;
  saveState(state);
}

/** Send a local notification immediately */
function showNotification(title: string, body: string, tag?: string) {
  if (!isNotificationsEnabled()) return;
  
  try {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      // Use SW for better reliability (works even when tab is inactive)
      navigator.serviceWorker.ready.then(reg => {
        reg.showNotification(title, {
          body,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          tag: tag || 'devlingo-general',
          data: { url: '/' }
        } as NotificationOptions);
      });
    } else {
      // Fallback to regular Notification
      new Notification(title, {
        body,
        icon: '/icon-192.png',
        tag: tag || 'devlingo-general',
      });
    }
  } catch (e) {
    console.warn('Notification failed:', e);
  }
}

// === Notification content generators ===

const STREAK_MESSAGES = [
  { title: '🔥 Не потеряй серию!', body: 'Один урок — 5 минут. Сохрани свой прогресс!' },
  { title: '⚡ Зачет всё ближе!', body: 'Быстрый урок вечером закрепит знания.' },
  { title: '📚 Время web-dev!', body: 'Маленькие шаги каждый день = большой результат.' },
  { title: '🎯 Цель на сегодня', body: 'Пройди хотя бы 1 тему — ты справишься!' },
  { title: '💪 Ты на правильном пути!', body: 'Ещё один урок и серия продолжится.' },
];

const COMEBACK_MESSAGES = [
  { title: '😢 Мы скучаем!', body: 'Ты не заходил уже несколько дней. Зачет ждёт!' },
  { title: '📖 Вернись к учёбе!', body: 'Даже 5 минут в день лучше, чем ничего.' },
  { title: '🚀 Время нагонять!', body: 'Каждый день без практики — шаг назад.' },
];

function getExamDaysLeft(): number {
  const exam = new Date('2026-06-05T09:00:00+03:00');
  const now = new Date();
  return Math.max(0, Math.ceil((exam.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

const EXAM_MESSAGES = [
  (days: number) => ({ title: `📅 До зачета ${days} дней!`, body: 'Повтори слабые темы — это самая эффективная стратегия.' }),
  (days: number) => ({ title: `⏰ Осталось ${days} дней`, body: 'Практика каждый день = уверенность на экзамене.' }),
  (days: number) => ({ title: `🎓 ${days} дней до зачета`, body: 'Сосредоточься на непройденных темах!' }),
];

/** Schedule evening reminder if user hasn't practiced today */
export function scheduleStreakReminder(currentStreak: number) {
  if (!isNotificationsEnabled()) return;
  
  const state = getState();
  state.streak = currentStreak;
  saveState(state);
  
  // Calculate ms until reminder hour today
  const now = new Date();
  const reminderTime = new Date();
  reminderTime.setHours(state.reminderHour, 0, 0, 0);
  
  // If reminder time already passed today, skip
  if (now >= reminderTime) return;
  
  const msUntilReminder = reminderTime.getTime() - now.getTime();
  
  // Schedule check
  setTimeout(() => {
    if (didPracticeToday()) return; // Already practiced, no need
    
    const daysLeft = getExamDaysLeft();
    
    // Pick message based on context
    if (daysLeft <= 7) {
      // Exam is very close — exam urgency message
      const msgFn = EXAM_MESSAGES[Math.floor(Math.random() * EXAM_MESSAGES.length)];
      const msg = msgFn(daysLeft);
      showNotification(msg.title, msg.body, 'streak-reminder');
    } else if (currentStreak >= 3) {
      // Has a good streak going — motivate to keep it
      const msg = STREAK_MESSAGES[Math.floor(Math.random() * STREAK_MESSAGES.length)];
      showNotification(msg.title, msg.body, 'streak-reminder');
    } else {
      // General reminder
      const msg = STREAK_MESSAGES[0];
      showNotification(msg.title, msg.body, 'streak-reminder');
    }
    
    state.lastReminder = Date.now();
    saveState(state);
  }, msUntilReminder);
}

/** Check for comeback notification (called on app open) */
export function checkComebackNotification() {
  if (!isNotificationsEnabled()) return;
  
  const days = daysSinceLastPractice();
  if (days >= 2) {
    const msg = COMEBACK_MESSAGES[Math.floor(Math.random() * COMEBACK_MESSAGES.length)];
    // Delay slightly so it doesn't fire immediately on open
    setTimeout(() => {
      showNotification(msg.title, msg.body, 'comeback');
    }, 3000);
  }
}

/** Show lesson completion notification */
export function notifyLessonComplete(xpEarned: number, streak: number) {
  if (!isNotificationsEnabled()) return;
  
  const messages = [
    { title: '✅ Урок пройден!', body: `+${xpEarned} XP | Серия: ${streak} дней 🔥` },
    { title: '🎉 Отлично!', body: `Заработано ${xpEarned} XP! Серия ${streak} дней!` },
    { title: '💪 Так держать!', body: `+${xpEarned} XP! ${streak} дней подряд — молодец!` },
  ];
  
  const msg = messages[Math.floor(Math.random() * messages.length)];
  showNotification(msg.title, msg.body, 'lesson-complete');
}

/** Show achievement unlocked notification */
export function notifyAchievement(title: string) {
  if (!isNotificationsEnabled()) return;
  showNotification('🏆 Достижение разблокировано!', title, 'achievement');
}

/** Initialize notifications — call once on app start */
export function initNotifications(streak: number) {
  // If permission was already granted, schedule reminders
  if (isNotificationsEnabled()) {
    scheduleStreakReminder(streak);
    checkComebackNotification();
  }
}
