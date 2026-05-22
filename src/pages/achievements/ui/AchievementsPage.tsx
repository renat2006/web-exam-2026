import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { Lock, Award, CheckCircle, Gift, Crown, Code, BookOpen } from 'lucide-react';
import { ACHIEVEMENTS, getAchievementStatus } from '../../../entities/achievement/model/achievements';
import type { AchievementCategory } from '../../../entities/achievement/model/achievements';
import { vibrateSuccess } from '../../../shared/lib/haptics/vibrate';
import confetti from 'canvas-confetti';

interface AchievementsPageProps {
  xp: number;
  streak: number;
  completedSkills: string[];
  claimedAchievements: string[];
  perfectLessons: number;
  nightLessons: number;
  onClaimReward: (id: string, xpReward: number) => void;
  vibrationEnabled: boolean;
  totalLessons: number;
  lessonsToday: number;
  longestStreak: number;
}

const CATEGORY_LABELS: Record<AchievementCategory, { label: string; icon: string }> = {
  learning: { label: 'Учёба', icon: 'BookOpen' },
  streaks: { label: 'Серии', icon: 'Flame' },
  mastery: { label: 'Мастерство', icon: 'Target' },
  hidden: { label: 'Скрытые', icon: 'Eye' },
};

const RARITY_COLORS = {
  common: { border: 'rgba(148,163,184,0.2)', label: 'Обычное', color: '#94a3b8' },
  rare: { border: 'rgba(99,102,241,0.3)', label: 'Редкое', color: '#818cf8' },
  legendary: { border: 'rgba(251,191,36,0.3)', label: 'Легендарное', color: '#fbbf24' },
};

export const AchievementsPage: React.FC<AchievementsPageProps> = ({
  xp,
  streak,
  completedSkills,
  claimedAchievements,
  perfectLessons,
  nightLessons,
  onClaimReward,
  vibrationEnabled,
  totalLessons,
  lessonsToday,
  longestStreak,
}) => {
  const userState = { xp, streak, completedSkills, perfectLessons, nightLessons, totalLessons, lessonsToday, longestStreak };
  const [activeCategory, setActiveCategory] = useState<AchievementCategory | 'all'>('all');

  // Calculate completed achievements count
  const completedAchievements = ACHIEVEMENTS.map(ach => {
    const { completed } = getAchievementStatus(ach, userState);
    return { id: ach.id, completed, xpReward: ach.xpReward };
  });

  const completedCount = completedAchievements.filter(a => a.completed).length;

  // Rank resolution (Medal details, colors, glowing parameters)
  const getRankDetails = (count: number) => {
    if (count >= 7) {
      return {
        title: 'Академик DevLingo',
        color: '#fbbf24', // Gold
        icon: <Crown size={36} className="rank-icon-glowing" style={{ color: '#fbbf24' }} />,
        bgGlow: 'rgba(251, 191, 36, 0.08)',
        borderColor: 'rgba(251, 191, 36, 0.3)'
      };
    }
    if (count >= 4) {
      return {
        title: 'Ведущий Разработчик',
        color: '#818cf8', // Indigo/Purple
        icon: <Code size={36} className="rank-icon-glowing" style={{ color: '#818cf8' }} />,
        bgGlow: 'rgba(129, 140, 248, 0.08)',
        borderColor: 'rgba(129, 140, 248, 0.3)'
      };
    }
    if (count >= 1) {
      return {
        title: 'Ассистент кафедры',
        color: '#60a5fa', // Blue
        icon: <BookOpen size={36} className="rank-icon-glowing" style={{ color: '#60a5fa' }} />,
        bgGlow: 'rgba(96, 165, 250, 0.08)',
        borderColor: 'rgba(96, 165, 250, 0.3)'
      };
    }
    return {
      title: 'Новичок Web-разработки',
      color: '#64748b', // Slate
      icon: <Award size={36} className="rank-icon-glowing" style={{ color: '#64748b' }} />,
      bgGlow: 'rgba(100, 116, 139, 0.08)',
      borderColor: 'rgba(100, 116, 139, 0.3)'
    };
  };

  const rank = getRankDetails(completedCount);

  const handleClaimClick = (id: string, xpReward: number) => {
    vibrateSuccess(vibrationEnabled);
    onClaimReward(id, xpReward);
    
    // Trigger celebratory confetti burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.8 }
    });
  };

  return (
    <div className="achievements-tab-container anim-slide-in">
      <h2 className="tab-title">Ваши достижения</h2>
      <p className="tab-subtitle">Выполняйте задания на зачете и разблокируйте карточки достижений</p>

      {/* Achievements Dashboard Summary Card */}
      <div className="achievements-dashboard card">
        <div className="dashboard-rank-info">
          <div 
            className="rank-badge-large"
            style={{ 
              backgroundColor: rank.bgGlow, 
              borderColor: rank.borderColor 
            }}
          >
            {rank.icon}
          </div>
          <div>
          <span className="rank-subtitle">Текущее звание:</span>
            <h3 className="rank-title-text" style={{ color: rank.color }}>{rank.title}</h3>
            <p className="rank-progress-desc">Разблокировано {completedCount} из {ACHIEVEMENTS.filter(a => !a.hidden).length}</p>
          </div>
        </div>
        
        <div className="dashboard-progress-bar-container">
          <div className="progress-bar-container">
            <div 
              className="progress-bar-fill" 
              style={{ 
                width: `${(completedCount / ACHIEVEMENTS.length) * 100}%`,
                backgroundColor: rank.color
              }}
            />
          </div>
        </div>
      </div>

      {/* Category filter tabs */}
      <div className="ach-category-tabs">
        <button
          className={`ach-cat-tab ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => setActiveCategory('all')}
        >Все</button>
        {(Object.keys(CATEGORY_LABELS) as AchievementCategory[]).map(cat => {
          const CatIcon = (Icons as any)[CATEGORY_LABELS[cat].icon];
          return (
            <button
              key={cat}
              className={`ach-cat-tab ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {CatIcon && <CatIcon size={12} />}
              {CATEGORY_LABELS[cat].label}
            </button>
          );
        })}
      </div>

      <div className="achievements-grid">
        {ACHIEVEMENTS
          .filter(ach => activeCategory === 'all' || ach.category === activeCategory)
          .map((ach) => {
          const { progress, completed } = getAchievementStatus(ach, userState);
          const isClaimed = claimedAchievements.includes(ach.id);
          const isHiddenLocked = ach.hidden && !completed;
          const IconComponent = (Icons as any)[ach.iconName] || Icons.Award;
          const rarity = RARITY_COLORS[ach.rarity];

          return (
            <div 
              key={ach.id} 
              className={`achievement-card card ${completed ? 'completed' : 'locked'} ${isClaimed ? 'claimed' : ''}`}
              style={{ borderColor: completed ? rarity.border : undefined }}
            >
              {/* Rarity indicator */}
              <span className="rarity-tag" style={{ color: rarity.color }}>{rarity.label}</span>

              <div className="ach-card-header">
                <div className={`ach-card-icon-container ${completed ? 'completed-icon' : ''}`}>
                  {isHiddenLocked ? (
                    <Icons.HelpCircle size={20} className="ach-icon-lock" />
                  ) : completed ? (
                    <IconComponent size={24} className="ach-icon success-glow" />
                  ) : (
                    <Lock size={20} className="ach-icon-lock" />
                  )}
                </div>
                <div className="ach-card-header-texts">
                  <h4>{isHiddenLocked ? '???' : ach.title}</h4>
                  <p>{isHiddenLocked ? 'Скрытое достижение' : ach.description}</p>
                </div>
              </div>

              <div className="ach-card-body">
                {/* Progress bar inside card */}
                <div className="ach-progress-wrapper">
                  <div className="ach-progress-label">
                    <span>Прогресс</span>
                    <span>{progress} / {ach.maxProgress}</span>
                  </div>
                  <div className="ach-progress-bar">
                    <div 
                      className="ach-progress-fill"
                      style={{ 
                        width: `${(progress / ach.maxProgress) * 100}%`,
                        backgroundColor: completed ? 'var(--color-success)' : 'var(--color-accent)'
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="ach-card-footer">
                {!completed ? (
                  <div className="reward-badge-locked">
                    <Gift size={14} />
                    <span>Награда: +{ach.xpReward} XP</span>
                  </div>
                ) : isClaimed ? (
                  <div className="reward-badge-claimed">
                    <CheckCircle size={14} />
                    <span>Получено +{ach.xpReward} XP</span>
                  </div>
                ) : (
                  <button 
                    onClick={() => handleClaimClick(ach.id, ach.xpReward)}
                    className="btn-primary claim-reward-btn"
                  >
                    <Gift size={14} fill="currentColor" />
                    <span>Забрать +{ach.xpReward} XP</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .ach-category-tabs {
          display: flex;
          gap: 6px;
          margin-top: 20px;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          padding-bottom: 4px;
        }
        .ach-category-tabs::-webkit-scrollbar { display: none; }
        .ach-cat-tab {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 6px 14px;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-color);
          background: transparent;
          color: var(--text-secondary);
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          transition: all var(--transition-fast);
          font-family: inherit;
        }
        .ach-cat-tab.active {
          background: rgba(99,102,241,0.1);
          border-color: rgba(99,102,241,0.3);
          color: #a5b4fc;
        }
        .ach-cat-tab:hover:not(.active) {
          border-color: rgba(255,255,255,0.15);
          color: var(--text-primary);
        }

        .rarity-tag {
          position: absolute;
          top: 8px;
          right: 10px;
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .achievements-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 16px;
          margin-top: 16px;
        }

        .achievements-dashboard {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 24px !important;
          margin-bottom: 24px;
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(99, 102, 241, 0.03) 100%) !important;
          border-color: rgba(99, 102, 241, 0.15);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }

        .dashboard-rank-info {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .rank-badge-large {
          width: 64px;
          height: 64px;
          border-radius: var(--radius-md);
          border: 1px solid transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all var(--transition-normal);
          box-shadow: inset 0 0 12px rgba(255, 255, 255, 0.02);
        }

        .rank-icon-glowing {
          filter: drop-shadow(0 0 8px currentColor);
        }

        .rank-subtitle {
          font-size: 11px;
          text-transform: uppercase;
          color: var(--text-muted);
          font-weight: 700;
          letter-spacing: 0.5px;
        }

        .rank-title-text {
          font-size: 20px;
          font-weight: 800;
          margin: 2px 0;
          overflow-wrap: break-word;
        }

        .rank-progress-desc {
          font-size: 13px;
          color: var(--text-secondary);
          overflow-wrap: break-word;
        }

        .dashboard-progress-bar-container {
          width: 100%;
        }

        .achievement-card {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 20px !important;
          transition: all var(--transition-normal);
          height: 100%;
          position: relative;
        }

        .achievement-card.locked {
          opacity: 0.55;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-color: rgba(255, 255, 255, 0.03);
        }

        .achievement-card.locked h4 {
          color: var(--text-muted);
        }

        .achievement-card.completed {
          border-color: rgba(16, 185, 129, 0.3);
          box-shadow: 0 4px 20px rgba(16, 185, 129, 0.04);
        }

        .achievement-card.completed:not(.claimed) {
          border-color: var(--color-warning);
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(245, 158, 11, 0.03) 100%);
          animation: glow-pulse 2s infinite alternate;
        }

        @keyframes glow-pulse {
          0% { 
            box-shadow: 0 0 8px rgba(245, 158, 11, 0.1), inset 0 0 10px rgba(245, 158, 11, 0.05);
            border-color: rgba(245, 158, 11, 0.3);
          }
          100% { 
            box-shadow: 0 0 20px rgba(245, 158, 11, 0.35), inset 0 0 15px rgba(245, 158, 11, 0.15);
            border-color: rgba(245, 158, 11, 0.8);
          }
        }

        .achievement-card.claimed {
          background-color: rgba(15, 23, 42, 0.2);
          border-color: rgba(16, 185, 129, 0.15);
          opacity: 0.85;
        }

        .ach-card-header {
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }

        .ach-card-icon-container {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-md);
          background-color: rgba(15, 23, 42, 0.6);
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .ach-card-icon-container.completed-icon {
          background-color: rgba(16, 185, 129, 0.15);
          border-color: rgba(16, 185, 129, 0.3);
          color: var(--color-success);
        }

        .achievement-card.completed:not(.claimed) .completed-icon {
          background-color: rgba(251, 191, 36, 0.15);
          border-color: rgba(251, 191, 36, 0.4);
          color: #fbbf24;
        }

        .success-glow {
          filter: drop-shadow(0 0 6px currentColor);
        }

        .ach-card-header-texts h4 {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 2px;
          overflow-wrap: break-word;
        }

        .ach-card-header-texts p {
          font-size: 12px;
          color: var(--text-secondary);
          line-height: 1.4;
          overflow-wrap: break-word;
        }

        .ach-progress-wrapper {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .ach-progress-label {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
        }

        .ach-progress-bar {
          height: 6px;
          background-color: rgba(255, 255, 255, 0.05);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .ach-progress-fill {
          height: 100%;
          border-radius: var(--radius-full);
          transition: width 0.4s ease-out;
        }

        .ach-card-footer {
          margin-top: auto;
          display: flex;
          justify-content: flex-end;
          padding-top: 8px;
        }

        .reward-badge-locked {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          color: var(--text-muted);
          padding: 6px 10px;
          border-radius: var(--radius-sm);
          background-color: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
        }

        .reward-badge-claimed {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          color: var(--color-success);
          padding: 6px 12px;
          border-radius: var(--radius-sm);
          background-color: rgba(16, 185, 129, 0.05);
          border: 1px solid rgba(16, 185, 129, 0.1);
        }

        .claim-reward-btn {
          width: 100%;
          padding: 10px 16px !important;
          font-size: 13px !important;
          font-weight: 700 !important;
          background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%) !important;
          color: #1e1b4b !important;
          box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3) !important;
          border-radius: var(--radius-md) !important;
          border: none !important;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: all var(--transition-fast);
          animation: button-bounce 1.2s infinite alternate ease-in-out;
        }

        @keyframes button-bounce {
          0% { 
            transform: translateY(0);
            box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3) !important;
          }
          100% { 
            transform: translateY(-4px);
            box-shadow: 0 8px 16px rgba(251, 191, 36, 0.55) !important;
          }
        }

        .claim-reward-btn:hover {
          filter: brightness(1.05);
        }

        .claim-reward-btn:active {
          transform: translateY(1px);
        }

        @media (max-width: 480px) {
          .achievements-grid {
            grid-template-columns: 1fr;
            gap: 10px;
          }
          .achievement-card {
            padding: 16px !important;
          }
        }
      `}</style>
    </div>
  );
};
