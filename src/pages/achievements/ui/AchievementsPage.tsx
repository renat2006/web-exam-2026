import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { Lock, CheckCircle, Gift, Crown, Code, BookOpen, Trophy, Gem } from 'lucide-react';
import { ACHIEVEMENTS, getAchievementStatus } from '../../../entities/achievement/model/achievements';
import type { AchievementCategory } from '../../../entities/achievement/model/achievements';
import { vibrateSuccess, vibrateClick } from '../../../shared/lib/haptics/vibrate';
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

const CATEGORY_META: Record<AchievementCategory, { label: string; icon: string; color: string }> = {
  learning: { label: 'Учёба', icon: 'BookOpen', color: '#60a5fa' },
  streaks: { label: 'Серии', icon: 'Flame', color: '#f59e0b' },
  mastery: { label: 'Мастерство', icon: 'Target', color: '#10b981' },
  hidden: { label: 'Секреты', icon: 'Eye', color: '#a78bfa' },
};

const RARITY_STYLE = {
  common: { glow: 'rgba(148,163,184,0.15)', shimmer: '#94a3b8', label: 'Обычное', ring: '#64748b' },
  rare: { glow: 'rgba(129,140,248,0.2)', shimmer: '#818cf8', label: 'Редкое', ring: '#6366f1' },
  legendary: { glow: 'rgba(251,191,36,0.25)', shimmer: '#fbbf24', label: 'Легендарное', ring: '#f59e0b' },
};

// 3D tilt handler (disabled on touch)
const isTouchDevice = typeof window !== 'undefined' && 'ontouchstart' in window;

export const AchievementsPage: React.FC<AchievementsPageProps> = ({
  xp, streak, completedSkills, claimedAchievements, perfectLessons, nightLessons,
  onClaimReward, vibrationEnabled, totalLessons, lessonsToday, longestStreak,
}) => {
  const userState = { xp, streak, completedSkills, perfectLessons, nightLessons, totalLessons, lessonsToday, longestStreak };
  const [activeCategory, setActiveCategory] = useState<AchievementCategory | 'all'>('all');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Stats
  const allStatuses = ACHIEVEMENTS.map(a => ({
    ...a,
    ...getAchievementStatus(a, userState),
    isClaimed: claimedAchievements.includes(a.id),
  }));
  const completedCount = allStatuses.filter(a => a.completed).length;
  const totalVisible = ACHIEVEMENTS.filter(a => !a.hidden).length;
  const totalXpEarned = allStatuses.filter(a => a.isClaimed).reduce((sum, a) => sum + a.xpReward, 0);
  const progressPercent = Math.round((completedCount / ACHIEVEMENTS.length) * 100);

  // Rank
  const getRank = (count: number) => {
    if (count >= 10) return { title: 'Гранд-мастер', color: '#fbbf24', icon: <Crown size={28} />, emoji: '👑' };
    if (count >= 7) return { title: 'Академик', color: '#a78bfa', icon: <Trophy size={28} />, emoji: '🏆' };
    if (count >= 4) return { title: 'Разработчик', color: '#818cf8', icon: <Code size={28} />, emoji: '💎' };
    if (count >= 1) return { title: 'Исследователь', color: '#60a5fa', icon: <BookOpen size={28} />, emoji: '📖' };
    return { title: 'Новичок', color: '#64748b', icon: <BookOpen size={28} />, emoji: '🌱' };
  };
  const rank = getRank(completedCount);

  // Filter
  const filtered = allStatuses.filter(a => activeCategory === 'all' || a.category === activeCategory);
  const getCategoryCount = (cat: AchievementCategory) => allStatuses.filter(a => a.category === cat && a.completed).length;

  // Tilt
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouchDevice) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = ((y - rect.height / 2) / 14);
    const rotateY = ((rect.width / 2 - x) / 14);
    e.currentTarget.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03,1.03,1.03)`;
  };
  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = 'perspective(600px) rotateX(0) rotateY(0) scale3d(1,1,1)';
  };

  const handleClaim = (id: string, xpReward: number) => {
    vibrateSuccess(vibrationEnabled);
    onClaimReward(id, xpReward);
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.7 } });
  };

  return (
    <div className="ach-page anim-slide-in">
      {/* === HERO CARD === */}
      <div className="ach-hero">
        <div className="ach-hero-trophy-wrap">
          <div className="ach-hero-trophy-ring">
            <svg viewBox="0 0 100 100" className="ach-ring-svg">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
              <circle
                cx="50" cy="50" r="42" fill="none"
                stroke={rank.color}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${progressPercent * 2.64} 264`}
                transform="rotate(-90 50 50)"
                className="ach-ring-progress"
              />
            </svg>
            <div className="ach-hero-trophy-inner">
              <span className="ach-hero-emoji">{rank.emoji}</span>
            </div>
          </div>
          <div className="ach-hero-info">
            <span className="ach-hero-rank-label">Текущее звание</span>
            <h2 className="ach-hero-rank-title" style={{ color: rank.color }}>{rank.title}</h2>
            <div className="ach-hero-stats-row">
              <div className="ach-hero-stat">
                <Trophy size={14} />
                <span>{completedCount}/{totalVisible}</span>
              </div>
              <div className="ach-hero-stat">
                <Icons.Zap size={14} />
                <span>+{totalXpEarned} XP</span>
              </div>
              <div className="ach-hero-stat">
                <Gem size={14} />
                <span>{progressPercent}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* === CATEGORY TABS === */}
      <div className="ach-tabs">
        <button
          className={`ach-tab ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => { setActiveCategory('all'); vibrateClick(vibrationEnabled); }}
        >
          Все <span className="ach-tab-count">{completedCount}</span>
        </button>
        {(Object.keys(CATEGORY_META) as AchievementCategory[]).map(cat => {
          const CatIcon = (Icons as any)[CATEGORY_META[cat].icon];
          const cnt = getCategoryCount(cat);
          return (
            <button
              key={cat}
              className={`ach-tab ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => { setActiveCategory(cat); vibrateClick(vibrationEnabled); }}
              style={activeCategory === cat ? { borderColor: CATEGORY_META[cat].color, color: CATEGORY_META[cat].color } : {}}
            >
              {CatIcon && <CatIcon size={13} />}
              {CATEGORY_META[cat].label}
              {cnt > 0 && <span className="ach-tab-count">{cnt}</span>}
            </button>
          );
        })}
      </div>

      {/* === CARDS GRID === */}
      <div className="ach-grid">
        {filtered.map((ach, i) => {
          const isHiddenLocked = ach.hidden && !ach.completed;
          const IconComponent = (Icons as any)[ach.iconName] || Icons.Award;
          const rarity = RARITY_STYLE[ach.rarity];
          const pct = Math.round((ach.progress / ach.maxProgress) * 100);
          const dashLen = pct * 1.57; // circumference for r=25 ≈ 157

          return (
            <div
              key={ach.id}
              className={`ach-card ${ach.completed ? 'completed' : 'locked'} ${ach.isClaimed ? 'claimed' : ''} rarity-${ach.rarity}`}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{
                animationDelay: mounted ? `${i * 60}ms` : '0ms',
                borderColor: ach.completed ? rarity.glow : undefined,
              }}
            >
              {/* Shimmer for legendary */}
              {ach.rarity === 'legendary' && ach.completed && <div className="ach-shimmer" />}

              {/* Rarity label */}
              <span className="ach-rarity" style={{ color: rarity.shimmer }}>{rarity.label}</span>

              {/* Icon with progress ring */}
              <div className="ach-icon-wrap">
                <svg viewBox="0 0 60 60" className="ach-icon-ring-svg">
                  <circle cx="30" cy="30" r="25" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                  {!isHiddenLocked && (
                    <circle
                      cx="30" cy="30" r="25" fill="none"
                      stroke={ach.completed ? 'var(--color-success)' : rarity.ring}
                      strokeWidth="3" strokeLinecap="round"
                      strokeDasharray={`${dashLen} 157`}
                      transform="rotate(-90 30 30)"
                      className="ach-icon-ring-fill"
                    />
                  )}
                </svg>
                <div className={`ach-icon-inner ${ach.completed ? 'done' : ''}`}>
                  {isHiddenLocked ? (
                    <Icons.HelpCircle size={22} className="ach-icon-locked" />
                  ) : ach.completed ? (
                    <IconComponent size={22} style={{ color: rarity.shimmer, filter: `drop-shadow(0 0 6px ${rarity.shimmer})` }} />
                  ) : (
                    <Lock size={18} className="ach-icon-locked" />
                  )}
                </div>
              </div>

              {/* Text */}
              <div className="ach-text">
                <h4>{isHiddenLocked ? '???' : ach.title}</h4>
                <p>{isHiddenLocked ? 'Скрытое достижение' : ach.description}</p>
              </div>

              {/* Progress */}
              <div className="ach-progress-line">
                <span>{ach.progress}/{ach.maxProgress}</span>
                <div className="ach-progress-track">
                  <div
                    className="ach-progress-fill"
                    style={{
                      width: `${pct}%`,
                      background: ach.completed
                        ? 'linear-gradient(90deg, var(--color-success), #34d399)'
                        : `linear-gradient(90deg, ${rarity.ring}, ${rarity.shimmer})`
                    }}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="ach-footer">
                {!ach.completed ? (
                  <div className="ach-reward-locked">
                    <Gift size={12} />
                    <span>+{ach.xpReward} XP</span>
                    {ach.gemsReward && <><Gem size={10} /><span>+{ach.gemsReward}</span></>}
                  </div>
                ) : ach.isClaimed ? (
                  <div className="ach-reward-claimed">
                    <CheckCircle size={13} />
                    <span>Получено +{ach.xpReward} XP</span>
                  </div>
                ) : (
                  <button
                    className="ach-claim-btn"
                    onClick={() => handleClaim(ach.id, ach.xpReward)}
                  >
                    <Gift size={14} fill="currentColor" />
                    Забрать +{ach.xpReward} XP
                    {ach.gemsReward && <span className="ach-claim-gems">+{ach.gemsReward} 💎</span>}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .ach-page {
          padding-bottom: 40px;
        }

        /* ===== HERO ===== */
        .ach-hero {
          background: linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.04) 50%, transparent 100%);
          border: 1px solid rgba(99,102,241,0.12);
          border-radius: var(--radius-lg);
          padding: 24px;
          margin-bottom: 20px;
        }

        .ach-hero-trophy-wrap {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .ach-hero-trophy-ring {
          position: relative;
          width: 88px;
          height: 88px;
          flex-shrink: 0;
        }

        .ach-ring-svg {
          width: 100%;
          height: 100%;
        }

        .ach-ring-progress {
          transition: stroke-dasharray 1.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .ach-hero-trophy-inner {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ach-hero-emoji {
          font-size: 34px;
          animation: ach-float 3s ease-in-out infinite;
        }

        @keyframes ach-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        .ach-hero-info {
          flex: 1;
          min-width: 0;
        }

        .ach-hero-rank-label {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--text-muted);
          font-weight: 700;
        }

        .ach-hero-rank-title {
          font-size: 22px;
          font-weight: 800;
          margin: 2px 0 8px;
          line-height: 1.2;
        }

        .ach-hero-stats-row {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
        }

        .ach-hero-stat {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          font-weight: 700;
          color: var(--text-secondary);
        }

        /* ===== TABS ===== */
        .ach-tabs {
          display: flex;
          gap: 6px;
          overflow-x: auto;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
          margin-bottom: 16px;
          padding-bottom: 4px;
        }
        .ach-tabs::-webkit-scrollbar { display: none; }

        .ach-tab {
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
          transition: all 0.2s;
          font-family: inherit;
        }

        .ach-tab.active {
          background: rgba(99,102,241,0.1);
          border-color: rgba(99,102,241,0.3);
          color: #a5b4fc;
        }

        .ach-tab:active { transform: scale(0.96); }

        .ach-tab-count {
          background: rgba(255,255,255,0.08);
          padding: 1px 6px;
          border-radius: var(--radius-full);
          font-size: 10px;
          font-weight: 800;
        }

        /* ===== GRID ===== */
        .ach-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 14px;
        }

        /* ===== CARD ===== */
        .ach-card {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 10px;
          padding: 20px 16px 16px;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-color);
          background: rgba(15,23,42,0.6);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          transition: transform 0.15s ease-out, box-shadow 0.3s;
          will-change: transform;
          animation: ach-card-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
          overflow: hidden;
        }

        @keyframes ach-card-in {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .ach-card.locked {
          opacity: 0.5;
          filter: saturate(0.3);
        }

        .ach-card.completed {
          opacity: 1;
          filter: none;
          box-shadow: 0 4px 24px rgba(0,0,0,0.2);
        }

        .ach-card.completed:not(.claimed) {
          animation: ach-card-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both, ach-glow 2s infinite alternate;
        }

        @keyframes ach-glow {
          0% { box-shadow: 0 0 12px rgba(251,191,36,0.1); }
          100% { box-shadow: 0 0 28px rgba(251,191,36,0.35); }
        }

        .ach-card.claimed {
          opacity: 0.8;
        }

        /* Shimmer for legendary */
        .ach-shimmer {
          position: absolute;
          inset: 0;
          background: linear-gradient(105deg, transparent 30%, rgba(251,191,36,0.06) 45%, rgba(251,191,36,0.12) 50%, rgba(251,191,36,0.06) 55%, transparent 70%);
          background-size: 200% 100%;
          animation: ach-shimmer-sweep 3s infinite linear;
          pointer-events: none;
        }

        @keyframes ach-shimmer-sweep {
          from { background-position: 200% 0; }
          to { background-position: -200% 0; }
        }

        /* Rarity tag */
        .ach-rarity {
          position: absolute;
          top: 8px;
          right: 10px;
          font-size: 8px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          opacity: 0.7;
        }

        /* Icon ring */
        .ach-icon-wrap {
          position: relative;
          width: 56px;
          height: 56px;
        }

        .ach-icon-ring-svg {
          width: 100%;
          height: 100%;
        }

        .ach-icon-ring-fill {
          transition: stroke-dasharray 0.8s ease-out;
        }

        .ach-icon-inner {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ach-icon-inner.done {
          animation: ach-icon-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes ach-icon-pop {
          0% { transform: scale(0.6); }
          100% { transform: scale(1); }
        }

        .ach-icon-locked {
          color: var(--text-muted);
          opacity: 0.4;
        }

        /* Text */
        .ach-text h4 {
          font-size: 14px;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 2px;
          line-height: 1.3;
        }

        .ach-card.locked .ach-text h4 {
          color: var(--text-muted);
        }

        .ach-text p {
          font-size: 11px;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        /* Progress */
        .ach-progress-line {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .ach-progress-line > span {
          font-size: 10px;
          font-weight: 700;
          color: var(--text-muted);
          white-space: nowrap;
          min-width: 40px;
        }

        .ach-progress-track {
          flex: 1;
          height: 4px;
          background: rgba(255,255,255,0.05);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .ach-progress-fill {
          height: 100%;
          border-radius: var(--radius-full);
          transition: width 0.6s ease-out;
        }

        /* Footer */
        .ach-footer {
          width: 100%;
          margin-top: auto;
        }

        .ach-reward-locked {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          font-size: 10px;
          font-weight: 700;
          color: var(--text-muted);
          padding: 6px;
          border-radius: var(--radius-sm);
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--border-color);
        }

        .ach-reward-claimed {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 700;
          color: var(--color-success);
          padding: 6px;
          border-radius: var(--radius-sm);
          background: rgba(16,185,129,0.06);
          border: 1px solid rgba(16,185,129,0.12);
        }

        .ach-claim-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px;
          border: none;
          border-radius: var(--radius-md);
          background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%);
          color: #1e1b4b;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.15s;
          animation: ach-btn-pulse 1.5s infinite alternate;
          box-shadow: 0 4px 16px rgba(251,191,36,0.3);
        }

        @keyframes ach-btn-pulse {
          0% { box-shadow: 0 4px 12px rgba(251,191,36,0.2); transform: translateY(0); }
          100% { box-shadow: 0 6px 20px rgba(251,191,36,0.5); transform: translateY(-2px); }
        }

        .ach-claim-btn:active {
          transform: translateY(1px) !important;
          box-shadow: 0 2px 8px rgba(251,191,36,0.3) !important;
        }

        .ach-claim-gems {
          opacity: 0.8;
          font-size: 11px;
        }

        /* ===== MOBILE ===== */
        @media (max-width: 600px) {
          .ach-hero {
            padding: 16px;
          }
          .ach-hero-trophy-ring {
            width: 68px;
            height: 68px;
          }
          .ach-hero-emoji { font-size: 26px; }
          .ach-hero-rank-title { font-size: 18px; }
          .ach-hero-stats-row { gap: 10px; }
          .ach-hero-stat { font-size: 11px; }
          .ach-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }
          .ach-card {
            padding: 14px 10px 12px;
            gap: 8px;
          }
          .ach-icon-wrap {
            width: 44px;
            height: 44px;
          }
          .ach-text h4 { font-size: 12px; }
          .ach-text p { font-size: 10px; }
          .ach-claim-btn { padding: 8px; font-size: 11px; }
        }

        @media (max-width: 380px) {
          .ach-grid {
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
};
