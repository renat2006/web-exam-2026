import React from 'react';
import { Flame, Zap, Heart, HeartOff, Settings, Code, Gem, Shield } from 'lucide-react';
import { vibrateClick, vibrateTick } from '../../../shared/lib/haptics/vibrate';

interface HeaderProps {
  xp: number;
  streak: number;
  hearts: number;
  vibrationEnabled: boolean;
  onOpenSettings: () => void;
  gems: number;
  level: number;
  levelTitle: string;
  dailyXpEarned: number;
  dailyXpGoal: number;
  streakFreezes: number;
}

export const Header: React.FC<HeaderProps> = ({ xp, streak, hearts, vibrationEnabled, onOpenSettings, gems, level, levelTitle, dailyXpEarned, dailyXpGoal, streakFreezes }) => {
  const triggerHeaderVibe = () => {
    vibrateClick(vibrationEnabled);
  };

  const handleSettingsClick = () => {
    vibrateTick(vibrationEnabled);
    onOpenSettings();
  };

  return (
    <header className="app-header">
      <div className="header-logo">
        <Code size={20} className="logo-symbol" />
        <span className="logo-text">DevLingo</span>
      </div>

      <div className="header-stat-container">
        {/* Level badge */}
        <div className="stat-badge level-badge" onClick={triggerHeaderVibe} title={`${levelTitle} — Уровень ${level}`}>
          <span className="level-num">{level}</span>
          <span className="stat-value">
            <span className="stat-label-text">{levelTitle}</span>
          </span>
        </div>

        {/* Streak */}
        <div className="stat-badge streak-badge" onClick={triggerHeaderVibe} title={`Серия: ${streak} ${getDaysWord(streak)}${streakFreezes > 0 ? ` | Заморозок: ${streakFreezes}` : ''}`}>
          <Flame size={18} className="stat-icon" fill={streak > 0 ? "currentColor" : "none"} />
          <span className="stat-value">
            {streak}
            {streakFreezes > 0 && <Shield size={10} className="freeze-icon" />}
          </span>
        </div>

        {/* Gems */}
        <div className="stat-badge gems-badge" onClick={triggerHeaderVibe} title="Гемы — валюта для заморозок">
          <Gem size={16} className="stat-icon" />
          <span className="stat-value">{gems}</span>
        </div>

        {/* XP with daily progress */}
        <div className="stat-badge xp-badge" onClick={triggerHeaderVibe} title={`${dailyXpEarned}/${dailyXpGoal} XP сегодня`}>
          <Zap size={18} className="stat-icon" fill="currentColor" />
          <span className="stat-value">
            {xp} <span className="stat-label-text">XP</span>
          </span>
          <div className="daily-xp-bar">
            <div className="daily-xp-fill" style={{ width: `${Math.min(100, (dailyXpEarned / dailyXpGoal) * 100)}%` }} />
          </div>
        </div>

        {/* Hearts */}
        <div className="stat-badge hearts-badge" onClick={triggerHeaderVibe} title="Жизни">
          {hearts > 0 ? (
            <>
              <Heart size={18} className="stat-icon heart-active" fill="currentColor" />
              <span className="stat-value">{hearts}</span>
            </>
          ) : (
            <>
              <HeartOff size={18} className="stat-icon heart-empty" />
              <span className="stat-value text-error">0</span>
            </>
          )}
        </div>

        {/* Settings Button */}
        <button className="header-settings-btn" onClick={handleSettingsClick} title="Настройки">
          <Settings size={18} />
        </button>
      </div>

      <style>{`
        .app-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 40px;
          border-bottom: 1px solid var(--border-color);
          background-color: rgba(2, 6, 23, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          position: sticky;
          top: 0;
          z-index: 50;
          height: 64px;
        }

        .header-logo {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .header-logo .logo-symbol {
          color: var(--color-accent);
        }

        .header-logo .logo-text {
          font-size: 18px;
          font-weight: 800;
          letter-spacing: -0.5px;
          background: linear-gradient(135deg, var(--text-primary) 30%, var(--text-secondary) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        @media (min-width: 769px) {
          .header-logo {
            display: none;
          }
          .app-header {
            justify-content: flex-end;
          }
        }

        .header-stat-container {
          display: flex;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
        }

        .stat-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background-color: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          padding: 6px 12px;
          border-radius: var(--radius-full);
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          user-select: none;
          transition: all var(--transition-fast);
        }

        .stat-badge:hover {
          border-color: rgba(255, 255, 255, 0.15);
          background-color: rgba(255, 255, 255, 0.05);
          transform: translateY(-1px);
        }

        .stat-badge:active {
          transform: scale(0.97);
        }

        .streak-badge {
          color: var(--color-warning);
          border-color: rgba(245, 158, 11, 0.2);
        }

        .streak-badge:hover {
          border-color: var(--color-warning);
          background-color: rgba(245, 158, 11, 0.05);
        }

        .xp-badge {
          color: var(--color-accent);
          border-color: rgba(99, 102, 241, 0.2);
          position: relative;
          overflow: hidden;
        }

        .daily-xp-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: rgba(99, 102, 241, 0.15);
        }
        .daily-xp-fill {
          height: 100%;
          background: var(--color-accent);
          border-radius: 0 2px 2px 0;
          transition: width 0.5s ease-out;
        }

        .xp-badge:hover {
          border-color: var(--color-accent);
          background-color: rgba(99, 102, 241, 0.05);
        }

        .level-badge {
          color: #e0e7ff;
          border-color: rgba(139, 92, 246, 0.25);
          gap: 4px;
        }
        .level-badge:hover {
          border-color: rgba(139, 92, 246, 0.5);
          background-color: rgba(139, 92, 246, 0.06);
        }
        .level-num {
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #7c3aed, #6366f1);
          border-radius: var(--radius-full);
          font-size: 11px;
          font-weight: 800;
          color: #fff;
          flex-shrink: 0;
        }

        .gems-badge {
          color: #67e8f9;
          border-color: rgba(34, 211, 238, 0.2);
        }
        .gems-badge:hover {
          border-color: rgba(34, 211, 238, 0.4);
          background-color: rgba(34, 211, 238, 0.05);
        }

        .freeze-icon {
          color: #38bdf8;
          margin-left: 2px;
        }

        .hearts-badge {
          color: var(--color-error);
          border-color: rgba(239, 68, 68, 0.2);
        }

        .hearts-badge:hover {
          border-color: var(--color-error);
          background-color: rgba(239, 68, 68, 0.05);
        }

        .heart-active {
          animation: heart-pulse 2s infinite alternate;
        }

        .heart-empty {
          color: var(--text-muted);
        }

        .text-error {
          color: var(--color-error);
        }

        .stat-label-text-mobile {
          display: none;
        }

        @keyframes heart-pulse {
          0% { transform: scale(1); }
          100% { transform: scale(1.1); }
        }

        .header-settings-btn {
          background-color: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          padding: 8px;
          border-radius: var(--radius-full);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-fast);
        }

        .header-settings-btn:hover {
          border-color: rgba(255, 255, 255, 0.15);
          color: var(--text-primary);
          transform: translateY(-1px);
        }

        .header-settings-btn:active {
          transform: scale(0.95);
        }

        @media (max-width: 768px) {
          .app-header {
            padding: 12px 16px;
          }
        }

        @media (max-width: 600px) {
          .stat-label-text {
            display: none;
          }
          .stat-label-text-mobile {
            display: inline;
          }
          .stat-badge {
            padding: 5px 10px;
            gap: 4px;
            font-size: 13px;
          }
          .header-stat-container {
            gap: 8px;
          }
          .header-logo .logo-text {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .app-header {
            padding: 12px 16px;
          }
          .header-stat-container {
            gap: 8px;
          }
          .header-logo .logo-text {
            font-size: 16px;
          }
        }
      `}</style>
    </header>
  );
};

function getDaysWord(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) {
    return 'день';
  }
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return 'дня';
  }
  return 'дней';
}
