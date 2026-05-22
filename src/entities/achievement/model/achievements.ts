export interface AchievementState {
  xp: number;
  streak: number;
  completedSkills: string[];
  perfectLessons: number;
  nightLessons: number;
  totalLessons: number;
  lessonsToday: number;
  longestStreak: number;
}

export type AchievementCategory = 'learning' | 'streaks' | 'mastery' | 'hidden';
export type AchievementRarity = 'common' | 'rare' | 'legendary';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  maxProgress: number;
  xpReward: number;
  gemsReward?: number;
  category: AchievementCategory;
  rarity: AchievementRarity;
  hidden?: boolean;
  getProgress: (userState: AchievementState) => number;
}

export const ACHIEVEMENTS: Achievement[] = [
  // === LEARNING ===
  {
    id: 'first-step',
    title: 'Первый шаг',
    description: 'Наберите первые 50 XP',
    iconName: 'Compass',
    maxProgress: 50,
    xpReward: 30,
    category: 'learning',
    rarity: 'common',
    getProgress: (state) => Math.min(50, state.xp),
  },
  {
    id: 'xp-collector',
    title: 'Коллекционер опыта',
    description: 'Наберите 500 XP',
    iconName: 'Award',
    maxProgress: 500,
    xpReward: 150,
    category: 'learning',
    rarity: 'rare',
    getProgress: (state) => Math.min(500, state.xp),
  },
  {
    id: 'marathon',
    title: 'Марафонец',
    description: 'Пройдите 3 урока за один день',
    iconName: 'Timer',
    maxProgress: 3,
    xpReward: 50,
    category: 'learning',
    rarity: 'common',
    getProgress: (state) => Math.min(3, state.lessonsToday),
  },
  {
    id: 'bookworm',
    title: 'Книжный червь',
    description: 'Пройдите 10 уроков суммарно',
    iconName: 'BookOpen',
    maxProgress: 10,
    xpReward: 80,
    category: 'learning',
    rarity: 'rare',
    getProgress: (state) => Math.min(10, state.totalLessons),
  },

  // === STREAKS ===
  {
    id: 'streak-master-3',
    title: 'Тройной удар',
    description: 'Поддерживайте серию 3 дня',
    iconName: 'Flame',
    maxProgress: 3,
    xpReward: 50,
    category: 'streaks',
    rarity: 'common',
    getProgress: (state) => Math.min(3, state.streak),
  },
  {
    id: 'streak-legend-7',
    title: 'Недельный забег',
    description: 'Поддерживайте серию 7 дней',
    iconName: 'Zap',
    maxProgress: 7,
    xpReward: 100,
    category: 'streaks',
    rarity: 'common',
    getProgress: (state) => Math.min(7, state.streak),
  },
  {
    id: 'streak-unstoppable',
    title: 'Неудержимый',
    description: 'Поддерживайте серию 14 дней',
    iconName: 'TrendingUp',
    maxProgress: 14,
    xpReward: 100,
    gemsReward: 20,
    category: 'streaks',
    rarity: 'rare',
    getProgress: (state) => Math.min(14, state.streak),
  },
  {
    id: 'streak-legend-30',
    title: 'Легенда',
    description: 'Поддерживайте серию 30 дней',
    iconName: 'Crown',
    maxProgress: 30,
    xpReward: 200,
    gemsReward: 50,
    category: 'streaks',
    rarity: 'legendary',
    getProgress: (state) => Math.min(30, state.streak),
  },

  // === MASTERY ===
  {
    id: 'skill-learner-1',
    title: 'Веб-исследователь',
    description: 'Пройдите 1 тему полностью',
    iconName: 'Map',
    maxProgress: 1,
    xpReward: 50,
    category: 'mastery',
    rarity: 'common',
    getProgress: (state) => Math.min(1, state.completedSkills.length),
  },
  {
    id: 'skill-master-5',
    title: 'Мастер кода',
    description: 'Пройдите 5 тем полностью',
    iconName: 'Star',
    maxProgress: 5,
    xpReward: 150,
    category: 'mastery',
    rarity: 'rare',
    getProgress: (state) => Math.min(5, state.completedSkills.length),
  },
  {
    id: 'complete-all',
    title: 'Полный цикл',
    description: 'Пройдите все темы',
    iconName: 'Trophy',
    maxProgress: 9,
    xpReward: 300,
    gemsReward: 100,
    category: 'mastery',
    rarity: 'legendary',
    getProgress: (state) => Math.min(9, state.completedSkills.length),
  },
  {
    id: 'perfect-run',
    title: 'Отличник',
    description: 'Пройдите урок без ошибок',
    iconName: 'Sparkles',
    maxProgress: 1,
    xpReward: 50,
    category: 'mastery',
    rarity: 'common',
    getProgress: (state) => Math.min(1, state.perfectLessons),
  },
  {
    id: 'perfectionist',
    title: 'Перфекционист',
    description: 'Пройдите 5 уроков без ошибок',
    iconName: 'Target',
    maxProgress: 5,
    xpReward: 100,
    category: 'mastery',
    rarity: 'rare',
    getProgress: (state) => Math.min(5, state.perfectLessons),
  },

  // === HIDDEN ===
  {
    id: 'night-coder',
    title: 'Полуночный кодер',
    description: 'Завершите урок с 22:00 до 6:00',
    iconName: 'Moon',
    maxProgress: 1,
    xpReward: 40,
    category: 'hidden',
    rarity: 'common',
    hidden: true,
    getProgress: (state) => Math.min(1, state.nightLessons),
  },
  {
    id: 'night-owl',
    title: 'Полуночник 2.0',
    description: 'Пройдите 3 ночных урока',
    iconName: 'Eye',
    maxProgress: 3,
    xpReward: 50,
    category: 'hidden',
    rarity: 'rare',
    hidden: true,
    getProgress: (state) => Math.min(3, state.nightLessons),
  },
  {
    id: 'xp-rich',
    title: 'XP-магнат',
    description: 'Наберите 1000 XP',
    iconName: 'Gem',
    maxProgress: 1000,
    xpReward: 200,
    gemsReward: 30,
    category: 'hidden',
    rarity: 'legendary',
    hidden: true,
    getProgress: (state) => Math.min(1000, state.xp),
  },

  // === NEW ACHIEVEMENTS ===
  {
    id: 'speed-learner',
    title: 'Молниеносный',
    description: 'Пройдите 5 уроков за один день',
    iconName: 'Rocket',
    maxProgress: 5,
    xpReward: 80,
    gemsReward: 10,
    category: 'learning',
    rarity: 'rare',
    getProgress: (state) => Math.min(5, state.lessonsToday),
  },
  {
    id: 'xp-collector-2k',
    title: 'Опытный боец',
    description: 'Наберите 2000 XP',
    iconName: 'Shield',
    maxProgress: 2000,
    xpReward: 250,
    gemsReward: 40,
    category: 'learning',
    rarity: 'legendary',
    getProgress: (state) => Math.min(2000, state.xp),
  },
  {
    id: 'twenty-lessons',
    title: 'Упорный',
    description: 'Пройдите 20 уроков суммарно',
    iconName: 'Layers',
    maxProgress: 20,
    xpReward: 120,
    category: 'learning',
    rarity: 'rare',
    getProgress: (state) => Math.min(20, state.totalLessons),
  },
  {
    id: 'perfectionist-10',
    title: 'Бриллиант',
    description: 'Пройдите 10 уроков без ошибок',
    iconName: 'Diamond',
    maxProgress: 10,
    xpReward: 200,
    gemsReward: 30,
    category: 'mastery',
    rarity: 'legendary',
    getProgress: (state) => Math.min(10, state.perfectLessons),
  },
  {
    id: 'streak-fire-5',
    title: 'Пять дней огня',
    description: 'Поддерживайте серию 5 дней',
    iconName: 'Flame',
    maxProgress: 5,
    xpReward: 60,
    category: 'streaks',
    rarity: 'common',
    getProgress: (state) => Math.min(5, state.streak),
  },
  {
    id: 'streak-10',
    title: 'Десять дней подряд',
    description: 'Поддерживайте серию 10 дней',
    iconName: 'Calendar',
    maxProgress: 10,
    xpReward: 80,
    gemsReward: 10,
    category: 'streaks',
    rarity: 'rare',
    getProgress: (state) => Math.min(10, state.streak),
  },
  {
    id: 'night-owl-5',
    title: 'Сова-мастер',
    description: 'Пройдите 5 ночных уроков',
    iconName: 'Moon',
    maxProgress: 5,
    xpReward: 80,
    gemsReward: 15,
    category: 'hidden',
    rarity: 'legendary',
    hidden: true,
    getProgress: (state) => Math.min(5, state.nightLessons),
  },
];

export const getAchievementStatus = (
  achievement: Achievement,
  userState: AchievementState
) => {
  const progress = achievement.getProgress(userState);
  const completed = progress >= achievement.maxProgress;
  return {
    progress,
    completed,
  };
};
