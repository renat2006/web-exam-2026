import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useUserState } from '../entities/user/model/userState';
import { Sidebar } from '../widgets/sidebar/ui/Sidebar';
import { Header } from '../widgets/header/ui/Header';
import { ExamCountdown } from '../widgets/exam-countdown/ui/ExamCountdown';
import { MapPage } from '../pages/map/ui/MapPage';
import { StatsPage } from '../pages/stats/ui/StatsPage';
import { AchievementsPage } from '../pages/achievements/ui/AchievementsPage';
import { LessonRunner } from '../widgets/lesson-runner/ui/LessonRunner';
import { SettingsModal } from '../features/settings-modal/ui/SettingsModal';
import { Onboarding } from '../features/onboarding/ui/Onboarding';
import { vibrateClick } from '../shared/lib/haptics/vibrate';
import { Trophy, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ACHIEVEMENTS } from '../entities/achievement/model/achievements';
import {
  initNotifications,
  requestNotificationPermission,
  notifyAchievement,
  scheduleStreakReminder,
} from '../shared/lib/notifications/notifications';

export const App: React.FC = () => {
  const {
    xp,
    setXp,
    streak,
    hearts,
    completedSkills,
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
    gems,
    setGems,
    streakFreezes,
    dailyXpEarned,
    dailyXpGoal,
    level,
    levelTitle,
    totalLessons,
    lessonsToday,
    longestStreak,
  } = useUserState();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem('devlingo_onboarded'));
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const [activeToast, setActiveToast] = useState<{ title: string; description: string; xpReward: number } | null>(null);
  const [unlockedSeen, setUnlockedSeen] = useState<string[]>(() => {
    const data = localStorage.getItem('devlingo_unlocked_seen');
    return data ? JSON.parse(data) : [];
  });
  const hasMounted = useRef(false);

  // Capture PWA installation capability
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Sync daily streak with native App Badge icon API
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'setAppBadge' in navigator) {
      if (streak > 0) {
        (navigator as any).setAppBadge(streak).catch((err: any) => {
          console.warn('Error setting badge:', err);
        });
      } else {
        (navigator as any).clearAppBadge().catch((err: any) => {
          console.warn('Error clearing badge:', err);
        });
      }
    }
  }, [streak]);

  // Initialize notifications on mount
  useEffect(() => {
    initNotifications(streak);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-schedule reminders when streak changes
  useEffect(() => {
    if (notificationsEnabled) {
      scheduleStreakReminder(streak);
    }
  }, [streak, notificationsEnabled]);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    vibrateClick(vibrationEnabled);
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User prompt outcome: ${outcome}`);
    setDeferredPrompt(null);
  };

  const handleOnboardingComplete = useCallback(() => {
    setXp(prev => prev + 50);
    setGems(prev => prev + 50);
    localStorage.setItem('devlingo_onboarded', 'true');
    setShowOnboarding(false);
    // Ask for notification permission after onboarding
    setTimeout(() => {
      requestNotificationPermission().then(granted => {
        setNotificationsEnabled(granted);
      });
    }, 2000);
  }, [setXp, setGems, setNotificationsEnabled]);

  // Real-time Achievements unlock tracker and Toast announcer
  useEffect(() => {
    const currentState = { xp, streak, completedSkills, perfectLessons, nightLessons, totalLessons, lessonsToday, longestStreak };
    
    // Find all currently completed achievements
    const completedIds = ACHIEVEMENTS.filter(ach => {
      const progress = ach.getProgress(currentState);
      return progress >= ach.maxProgress;
    }).map(ach => ach.id);

    if (!hasMounted.current) {
      // First mount: register whatever achievements are already finished to seen
      setUnlockedSeen(prev => {
        const merged = Array.from(new Set([...prev, ...completedIds]));
        localStorage.setItem('devlingo_unlocked_seen', JSON.stringify(merged));
        return merged;
      });
      hasMounted.current = true;
      return;
    }

    // Subsequent updates: find newly unlocked achievements
    const newlyCompleted = ACHIEVEMENTS.filter(ach => {
      const progress = ach.getProgress(currentState);
      return progress >= ach.maxProgress && !unlockedSeen.includes(ach.id);
    });

    if (newlyCompleted.length > 0) {
      const ach = newlyCompleted[0];
      
      setActiveToast({
        title: ach.title,
        description: ach.description,
        xpReward: ach.xpReward
      });

      setUnlockedSeen(prev => {
        const updated = [...prev, ach.id];
        localStorage.setItem('devlingo_unlocked_seen', JSON.stringify(updated));
        return updated;
      });

      // Play achievement haptics
      if (vibrationEnabled && navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }

      // Send notification for achievement
      notifyAchievement(ach.title);

      // Celebrate with confetti
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.2 }
      });
    }
  }, [xp, streak, completedSkills, perfectLessons, nightLessons, totalLessons, lessonsToday, longestStreak, unlockedSeen, vibrationEnabled]);

  // Auto-close Toast timer
  useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => {
        setActiveToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [activeToast]);

  return (
    <div className="app-container">
      {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
      {/* Sidebar navigation */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        vibrationEnabled={vibrationEnabled}
        setVibrationEnabled={setVibrationEnabled}
        notificationsEnabled={notificationsEnabled}
        setNotificationsEnabled={setNotificationsEnabled}
      />

      {/* Main Container */}
      <main className="main-content">
        <Header
          xp={xp}
          streak={streak}
          hearts={hearts}
          vibrationEnabled={vibrationEnabled}
          onOpenSettings={() => setIsSettingsOpen(true)}
          gems={gems}
          level={level}
          levelTitle={levelTitle}
          dailyXpEarned={dailyXpEarned}
          dailyXpGoal={dailyXpGoal}
          streakFreezes={streakFreezes}
        />

        <ExamCountdown />

        <div className="scroll-content">
          {/* TAB: Skill Map */}
          {currentTab === 'map' && (
            <MapPage
              completedSkills={completedSkills}
              onStartLesson={handleStartLesson}
              vibrationEnabled={vibrationEnabled}
              masteredSlides={masteredSlides}
            />
          )}

          {/* TAB: Statistics */}
          {currentTab === 'stats' && (
            <StatsPage
              xp={xp}
              streak={streak}
              hearts={hearts}
              completedSkills={completedSkills}
              handleRefillPractice={handleRefillPractice}
              masteredSlides={masteredSlides}
              onStartLesson={handleStartLesson}
            />
          )}

          {/* TAB: Achievements */}
          {currentTab === 'achievements' && (
            <AchievementsPage
              xp={xp}
              streak={streak}
              completedSkills={completedSkills}
              claimedAchievements={claimedAchievements}
              perfectLessons={perfectLessons}
              nightLessons={nightLessons}
              onClaimReward={handleClaimAchievement}
              vibrationEnabled={vibrationEnabled}
              totalLessons={totalLessons}
              lessonsToday={lessonsToday}
              longestStreak={longestStreak}
            />
          )}
        </div>

        {/* PWA Install Banner */}
        {deferredPrompt && (
          <div className="pwa-install-banner">
            <div className="pwa-install-content">
              <div className="pwa-install-text">
                <strong>Установить DevLingo</strong>
                <span>Как приложение на телефон</span>
              </div>
              <button className="btn-primary pwa-install-btn" onClick={handleInstallApp}>
                Установить
              </button>
              <button className="pwa-dismiss-btn" onClick={() => setDeferredPrompt(null)}>
                <X size={16} />
              </button>
            </div>
          </div>
        )}
      </main>
      {/* Fullscreen interactive Lesson View overlay */}
      {activeLesson && (
        <LessonRunner
          lesson={activeLesson.lesson}
          onClose={() => { vibrateClick(vibrationEnabled); setActiveLesson(null); }}
          onComplete={runActiveLessonComplete}
          onLoseHeart={handleLoseHeart}
          hearts={hearts}
          soundEnabled={soundEnabled}
          vibrationEnabled={vibrationEnabled}
          isReviewMode={isReviewMode}
          onMasterSlide={(slideIndex) => {
            if (activeLesson.skillId !== 'review') {
              handleMasterSlide(`${activeLesson.skillId}_${activeLesson.lesson.id}_slide_${slideIndex}`);
            }
          }}
        />
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => { vibrateClick(vibrationEnabled); setIsSettingsOpen(false); }}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        vibrationEnabled={vibrationEnabled}
        setVibrationEnabled={setVibrationEnabled}
        notificationsEnabled={notificationsEnabled}
        setNotificationsEnabled={setNotificationsEnabled}
        deferredPrompt={deferredPrompt}
        onInstallApp={handleInstallApp}
      />

      {/* Achievement Unlocked Toast Notification */}
      {activeToast && (
        <div className="achievement-toast-overlay">
          <div className="achievement-toast card">
            <div className="toast-content">
              <div className="toast-icon-wrapper">
                <Trophy size={20} className="toast-trophy-icon" />
              </div>
              <div className="toast-text">
                <span className="toast-meta">Достижение разблокировано!</span>
                <h4 className="toast-title">{activeToast.title}</h4>
                <p className="toast-desc">{activeToast.description}</p>
              </div>
            </div>
            <button 
              className="toast-close-btn"
              onClick={() => setActiveToast(null)}
              title="Закрыть"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
