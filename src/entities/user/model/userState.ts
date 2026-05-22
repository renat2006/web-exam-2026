import { useState, useEffect, useRef } from 'react';
import type { Lesson } from '../../curriculum/model/types';
import { SKILL_NODES } from '../../curriculum/model/questions';
import { vibrateClick, vibrateError } from '../../../shared/lib/haptics/vibrate';

export const useUserState = () => {
  // Stats & Progress States
  const [xp, setXp] = useState<number>(() => {
    return Number(localStorage.getItem('devlingo_xp') || '0');
  });
  const [streak, setStreak] = useState<number>(() => {
    return Number(localStorage.getItem('devlingo_streak') || '1');
  });
  const [hearts, setHearts] = useState<number>(() => {
    // Auto-regenerate hearts based on elapsed time since last depletion
    const stored = Number(localStorage.getItem('devlingo_hearts') || '5');
    if (stored >= 5) return 5;
    const lastDepletionStr = localStorage.getItem('devlingo_hearts_depleted_at');
    if (!lastDepletionStr) return stored;
    const elapsed = Date.now() - Number(lastDepletionStr);
    const regenCount = Math.floor(elapsed / (10 * 60 * 1000)); // 1 heart per 10 min
    return Math.min(5, stored + regenCount);
  });
  const [completedSkills, setCompletedSkills] = useState<string[]>(() => {
    const data = localStorage.getItem('devlingo_completed_skills');
    return data ? JSON.parse(data) : [];
  });
  const [lastActiveDate, setLastActiveDate] = useState<string>(() => {
    return localStorage.getItem('devlingo_last_active') || '';
  });
  const [claimedAchievements, setClaimedAchievements] = useState<string[]>(() => {
    const data = localStorage.getItem('devlingo_claimed_achievements');
    return data ? JSON.parse(data) : [];
  });
  const [perfectLessons, setPerfectLessons] = useState<number>(() => {
    return Number(localStorage.getItem('devlingo_perfect_lessons') || '0');
  });
  const [nightLessons, setNightLessons] = useState<number>(() => {
    return Number(localStorage.getItem('devlingo_night_lessons') || '0');
  });
  const [masteredSlides, setMasteredSlides] = useState<string[]>(() => {
    const data = localStorage.getItem('devlingo_mastered_slides');
    return data ? JSON.parse(data) : [];
  });

  const lostHeartInCurrentLesson = useRef<boolean>(false);

  // Settings
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('devlingo_sound') !== 'false';
  });
  const [vibrationEnabled, setVibrationEnabled] = useState<boolean>(() => {
    return localStorage.getItem('devlingo_vibration') !== 'false';
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => {
    return localStorage.getItem('devlingo_notifications') === 'true';
  });

  // UI Navigation Tabs
  const [currentTab, setCurrentTab] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab === 'map' || tab === 'stats' || tab === 'achievements') {
        return tab;
      }
    }
    return 'map';
  });
  const [activeLesson, setActiveLesson] = useState<{ skillId: string; lesson: Lesson } | null>(null);

  // Sync state changes with localStorage
  useEffect(() => {
    localStorage.setItem('devlingo_xp', xp.toString());
  }, [xp]);

  useEffect(() => {
    localStorage.setItem('devlingo_streak', streak.toString());
  }, [streak]);

  useEffect(() => {
    localStorage.setItem('devlingo_hearts', hearts.toString());
    // Track when hearts dropped below max for auto-regen calculation
    if (hearts < 5) {
      if (!localStorage.getItem('devlingo_hearts_depleted_at')) {
        localStorage.setItem('devlingo_hearts_depleted_at', Date.now().toString());
      }
    } else {
      localStorage.removeItem('devlingo_hearts_depleted_at');
    }
  }, [hearts]);

  // Auto-regen timer: check every 30 seconds
  useEffect(() => {
    if (hearts >= 5) return;
    const interval = setInterval(() => {
      const lastDepletionStr = localStorage.getItem('devlingo_hearts_depleted_at');
      if (!lastDepletionStr) return;
      const elapsed = Date.now() - Number(lastDepletionStr);
      const regenCount = Math.floor(elapsed / (10 * 60 * 1000));
      if (regenCount > 0) {
        setHearts(prev => {
          const newVal = Math.min(5, prev + regenCount);
          if (newVal >= 5) {
            localStorage.removeItem('devlingo_hearts_depleted_at');
          } else {
            // Reset the depletion timestamp to account for consumed regen
            localStorage.setItem('devlingo_hearts_depleted_at', 
              (Date.now() - (elapsed % (10 * 60 * 1000))).toString());
          }
          return newVal;
        });
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [hearts]);

  useEffect(() => {
    localStorage.setItem('devlingo_completed_skills', JSON.stringify(completedSkills));
  }, [completedSkills]);

  useEffect(() => {
    localStorage.setItem('devlingo_sound', soundEnabled.toString());
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem('devlingo_vibration', vibrationEnabled.toString());
  }, [vibrationEnabled]);

  useEffect(() => {
    localStorage.setItem('devlingo_notifications', notificationsEnabled.toString());
  }, [notificationsEnabled]);

  useEffect(() => {
    localStorage.setItem('devlingo_claimed_achievements', JSON.stringify(claimedAchievements));
  }, [claimedAchievements]);

  useEffect(() => {
    localStorage.setItem('devlingo_perfect_lessons', perfectLessons.toString());
  }, [perfectLessons]);

  useEffect(() => {
    localStorage.setItem('devlingo_night_lessons', nightLessons.toString());
  }, [nightLessons]);

  useEffect(() => {
    localStorage.setItem('devlingo_mastered_slides', JSON.stringify(masteredSlides));
  }, [masteredSlides]);

  const handleClaimAchievement = (id: string, xpReward: number) => {
    if (claimedAchievements.includes(id)) return;
    setXp(prev => prev + xpReward);
    setClaimedAchievements(prev => [...prev, id]);
  };

  const handleMasterSlide = (slideId: string) => {
    setMasteredSlides(prev => {
      if (prev.includes(slideId)) return prev;
      return [...prev, slideId];
    });
  };

  // Daily Streak Engine
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (lastActiveDate) {
      if (lastActiveDate !== todayStr) {
        const lastDate = new Date(lastActiveDate);
        const todayDate = new Date(todayStr);
        const diffTime = Math.abs(todayDate.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          // Returned consecutive day - increment streak
          const newStreak = streak + 1;
          setStreak(newStreak);
        } else if (diffDays > 1) {
          // Missed a day - reset streak
          setStreak(1);
        }
        setLastActiveDate(todayStr);
        localStorage.setItem('devlingo_last_active', todayStr);
      }
    } else {
      // First launch
      setLastActiveDate(todayStr);
      localStorage.setItem('devlingo_last_active', todayStr);
    }
  }, []);

  // Review mode: when hearts === 0, user can still learn but earns no XP
  const isReviewMode = hearts <= 0;

  // Time until next heart regeneration
  const heartsNextRegenAt = (() => {
    if (hearts >= 5) return null;
    const lastDepletionStr = localStorage.getItem('devlingo_hearts_depleted_at');
    if (!lastDepletionStr) return null;
    const elapsed = Date.now() - Number(lastDepletionStr);
    const msUntilNext = (10 * 60 * 1000) - (elapsed % (10 * 60 * 1000));
    return Math.ceil(msUntilNext / 60000); // minutes
  })();

  const handleStartLesson = (skillId: string, lessonId: string) => {
    const node = SKILL_NODES.find(n => n.id === skillId);
    const lesson = node?.lessons.find(l => l.id === lessonId);
    
    if (lesson) {
      lostHeartInCurrentLesson.current = false;
      setActiveLesson({ skillId, lesson });
    }
  };

  const handleLessonComplete = (xpEarned: number) => {
    if (!activeLesson) return;
    
    // In review mode, no XP earned
    if (!isReviewMode) {
      setXp(prev => prev + xpEarned);
    }

    // If all lessons in skill node completed, mark skill completed
    const node = SKILL_NODES.find(n => n.id === activeLesson.skillId);
    if (node) {
      if (!completedSkills.includes(activeLesson.skillId)) {
        setCompletedSkills(prev => [...prev, activeLesson.skillId]);
      }
    }

    // Track statistics for achievements
    if (activeLesson.skillId !== 'review') {
      if (!lostHeartInCurrentLesson.current) {
        setPerfectLessons(prev => prev + 1);
      }
      const hour = new Date().getHours();
      if (hour >= 22 || hour < 6) {
        setNightLessons(prev => prev + 1);
      }
    }

    setActiveLesson(null);
  };

  const handleLoseHeart = () => {
    lostHeartInCurrentLesson.current = true;
    // In review mode, don't lose hearts (they're already 0)
    if (isReviewMode) return;
    setHearts(prev => {
      const newVal = Math.max(0, prev - 1);
      if (newVal === 0) {
        vibrateError(vibrationEnabled);
      }
      return newVal;
    });
  };

  // Hearts refill practice — uses random slides from the actual curriculum
  const handleRefillPractice = () => {
    vibrateClick(vibrationEnabled);
    if (hearts >= 5) {
      alert('У вас уже максимальное количество жизней!');
      return;
    }

    // Collect all non-theory, non-coding slides from curriculum
    const allPracticeSlides = SKILL_NODES.flatMap(n =>
      n.lessons.flatMap(l => l.slides.filter(s => s.type !== 'theory' && s.type !== 'coding'))
    );

    // Pick 2 random slides (or all if fewer)
    const shuffled = [...allPracticeSlides].sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, Math.min(2, shuffled.length));

    // Fallback if no practice slides exist
    if (picked.length === 0) {
      picked.push({
        type: 'true-false' as const,
        question: 'HTTP-метод GET является идемпотентным.',
        correctValue: true,
        explanation: 'GET не изменяет состояние сервера, поэтому повторные вызовы дают тот же результат.'
      });
    }

    const mockReviewLesson: Lesson = {
      id: 'refill-review',
      title: 'Повторение для восстановления',
      xpReward: 5,
      slides: picked,
    };

    setActiveLesson({ skillId: 'review', lesson: mockReviewLesson });
    
    const restoreHeart = () => {
      setHearts(prev => Math.min(5, prev + 1));
      setXp(prev => prev + 5);
      setActiveLesson(null);
    };
    
    activeLessonRef.current = restoreHeart;
  };

  const activeLessonRef = useRef<(() => void) | null>(null);

  const runActiveLessonComplete = (xpReward: number) => {
    if (activeLessonRef.current && activeLesson?.lesson.id === 'refill-review') {
      activeLessonRef.current();
      activeLessonRef.current = null;
    } else {
      handleLessonComplete(xpReward);
    }
  };

  return {
    xp,
    setXp,
    streak,
    setStreak,
    hearts,
    setHearts,
    completedSkills,
    setCompletedSkills,
    soundEnabled,
    setSoundEnabled,
    vibrationEnabled,
    setVibrationEnabled,
    notificationsEnabled,
    setNotificationsEnabled,
    currentTab,
    setCurrentTab,
    activeLesson,
    setActiveLesson,
    handleStartLesson,
    handleLoseHeart,
    handleRefillPractice,
    runActiveLessonComplete,
    claimedAchievements,
    handleClaimAchievement,
    perfectLessons,
    nightLessons,
    masteredSlides,
    handleMasterSlide,
    isReviewMode,
    heartsNextRegenAt,
  };
};
