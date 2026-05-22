export interface AchievementState {
  xp: number;
  streak: number;
  completedSkills: string[];
  perfectLessons: number;
  nightLessons: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  maxProgress: number;
  xpReward: number;
  getProgress: (userState: AchievementState) => number;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-step',
    title: 'Первый шаг',
    description: 'Наберите первые 50 XP',
    iconName: 'Compass',
    maxProgress: 50,
    xpReward: 30,
    getProgress: (state) => Math.min(50, state.xp),
  },
  {
    id: 'xp-collector',
    title: 'Коллекционер опыта',
    description: 'Наберите 500 XP в системе',
    iconName: 'Award',
    maxProgress: 500,
    xpReward: 150,
    getProgress: (state) => Math.min(500, state.xp),
  },
  {
    id: 'streak-master-3',
    title: 'Тройной удар',
    description: 'Поддерживайте стрик 3 дня',
    iconName: 'Flame',
    maxProgress: 3,
    xpReward: 50,
    getProgress: (state) => Math.min(3, state.streak),
  },
  {
    id: 'streak-legend-7',
    title: 'Недельный забег',
    description: 'Поддерживайте стрик 7 дней',
    iconName: 'Zap',
    maxProgress: 7,
    xpReward: 100,
    getProgress: (state) => Math.min(7, state.streak),
  },
  {
    id: 'skill-learner-1',
    title: 'Веб-исследователь',
    description: 'Изучите полностью 1 навык',
    iconName: 'BookOpen',
    maxProgress: 1,
    xpReward: 50,
    getProgress: (state) => Math.min(1, state.completedSkills.length),
  },
  {
    id: 'skill-master-5',
    title: 'Мастер разметки и кода',
    description: 'Изучите полностью 5 навыков',
    iconName: 'Crown',
    maxProgress: 5,
    xpReward: 150,
    getProgress: (state) => Math.min(5, state.completedSkills.length),
  },
  {
    id: 'perfect-run',
    title: 'Отличник зачета',
    description: 'Пройдите урок без единой ошибки',
    iconName: 'Sparkles',
    maxProgress: 1,
    xpReward: 50,
    getProgress: (state) => Math.min(1, state.perfectLessons),
  },
  {
    id: 'night-coder',
    title: 'Полуночный кодер',
    description: 'Завершите урок с 22:00 до 6:00',
    iconName: 'Moon',
    maxProgress: 1,
    xpReward: 40,
    getProgress: (state) => Math.min(1, state.nightLessons),
  }
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
