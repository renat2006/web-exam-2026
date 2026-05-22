import React, { useState, useEffect, useMemo } from 'react';
import {
  Flame, Zap, Heart, Share2, Timer, BookOpen, Code, Play,
  RefreshCw, CheckCircle, Target, TrendingUp, Calendar,
  Award, Clock, Brain, Sparkles, ChevronRight
} from 'lucide-react';
import { SKILL_NODES } from '../../../entities/curriculum/model/questions';

interface StatsPageProps {
  xp: number;
  streak: number;
  hearts: number;
  completedSkills: string[];
  handleRefillPractice: () => void;
  masteredSlides: string[];
  onStartLesson?: (skillId: string, lessonId: string) => void;
}

// 7-day activity heatmap from localStorage
function getWeekActivity(): number[] {
  const days: number[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = `devlingo_daily_${d.toISOString().slice(0, 10)}`;
    days.push(Number(localStorage.getItem(key) || '0'));
  }
  return days;
}

const DAY_NAMES = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

function getDayLabels(): string[] {
  const labels: string[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    labels.push(DAY_NAMES[d.getDay() === 0 ? 6 : d.getDay() - 1]);
  }
  return labels;
}

// Motivational insight based on stats
function getInsight(readiness: number, streak: number, weakestTopic: string | null): string {
  if (readiness >= 90) return '🏆 Ты почти готов к зачету! Повтори слабые места для уверенности.';
  if (readiness >= 70) return '💪 Хороший прогресс! Сосредоточься на непройденных темах.';
  if (readiness >= 40) return '📈 На полпути! Занимайся каждый день — привычка = результат.';
  if (streak >= 3) return '🔥 Отличная серия! Не останавливайся — momentum решает.';
  if (weakestTopic) return `🎯 Слабое место: ${weakestTopic}. Начни с него!`;
  return '🚀 Начни с любой темы — первый шаг самый важный!';
}

export const StatsPage: React.FC<StatsPageProps> = ({
  xp, streak, hearts, handleRefillPractice, masteredSlides, onStartLesson,
}) => {
  const [regenMinutes, setRegenMinutes] = useState<number | null>(null);

  useEffect(() => {
    if (hearts >= 5) { setRegenMinutes(null); return; }
    const update = () => {
      const ts = localStorage.getItem('devlingo_hearts_depleted_at');
      if (!ts) { setRegenMinutes(null); return; }
      const elapsed = Date.now() - Number(ts);
      const ms = (10 * 60 * 1000) - (elapsed % (10 * 60 * 1000));
      setRegenMinutes(Math.ceil(ms / 60000));
    };
    update();
    const iv = setInterval(update, 15000);
    return () => clearInterval(iv);
  }, [hearts]);

  // Per-node progress
  const nodeProgress = useMemo(() => SKILL_NODES.map(node => {
    let totalSlides = 0;
    let masteredCount = 0;
    node.lessons.forEach(lesson => {
      lesson.slides.forEach((_, si) => {
        totalSlides++;
        if (masteredSlides.includes(`${node.id}_${lesson.id}_slide_${si}`)) masteredCount++;
      });
    });
    return {
      id: node.id, title: node.title, category: node.category,
      totalSlides, masteredCount,
      percent: totalSlides > 0 ? Math.round((masteredCount / totalSlides) * 100) : 0,
      lessons: node.lessons,
    };
  }), [masteredSlides]);

  // Aggregate stats
  const totalTheory = SKILL_NODES.reduce((a, n) => a + n.lessons.reduce((b, l) => b + l.slides.filter(s => s.type === 'theory').length, 0), 0);
  const masteredTheory = SKILL_NODES.reduce((a, n) => {
    let c = 0;
    n.lessons.forEach(l => l.slides.forEach((s, si) => {
      if (s.type === 'theory' && masteredSlides.includes(`${n.id}_${l.id}_slide_${si}`)) c++;
    }));
    return a + c;
  }, 0);
  const totalPractice = SKILL_NODES.reduce((a, n) => a + n.lessons.reduce((b, l) => b + l.slides.filter(s => s.type !== 'theory').length, 0), 0);
  const masteredPractice = SKILL_NODES.reduce((a, n) => {
    let c = 0;
    n.lessons.forEach(l => l.slides.forEach((s, si) => {
      if (s.type !== 'theory' && masteredSlides.includes(`${n.id}_${l.id}_slide_${si}`)) c++;
    }));
    return a + c;
  }, 0);
  const totalAll = totalTheory + totalPractice;
  const masteredAll = masteredTheory + masteredPractice;
  const readinessPercent = totalAll > 0 ? Math.round((masteredAll / totalAll) * 100) : 0;

  // Weakest topic
  const weakest = nodeProgress.filter(n => n.percent < 100).sort((a, b) => a.percent - b.percent)[0] || null;

  // Activity heatmap
  const weekActivity = getWeekActivity();
  const dayLabels = getDayLabels();
  const maxActivity = Math.max(...weekActivity, 1);

  // Time estimate
  const remainingSlides = totalAll - masteredAll;
  const estimatedMinutes = remainingSlides * 2; // ~2 min per slide

  // SVG ring
  const ringR = 54;
  const ringC = 2 * Math.PI * ringR;
  const ringOffset = ringC - (readinessPercent / 100) * ringC;

  const handleShare = async () => {
    const text = `📚 Моя подготовка к зачету по Web: ${readinessPercent}% готовность.\n🔥 ${streak} дней подряд, ⚡ ${xp} XP\nПопробуй: ${window.location.origin}`;
    if (navigator.share) {
      try { await navigator.share({ title: 'DevLingo', text, url: window.location.origin }); } catch {}
    } else {
      try { await navigator.clipboard.writeText(text); alert('Скопировано!'); } catch {}
    }
  };

  const insight = getInsight(readinessPercent, streak, weakest?.title || null);

  return (
    <div className="sp anim-slide-in">

      {/* === HERO: Readiness Ring + Stats === */}
      <div className="sp-hero">
        <div className="sp-ring-wrap">
          <svg viewBox="0 0 120 120" className="sp-ring-svg">
            <defs>
              <linearGradient id="spGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
            <circle cx="60" cy="60" r={ringR} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" />
            <circle
              cx="60" cy="60" r={ringR} fill="none" stroke="url(#spGrad)" strokeWidth="8"
              strokeLinecap="round" strokeDasharray={ringC} strokeDashoffset={ringOffset}
              transform="rotate(-90 60 60)" className="sp-ring-fill"
            />
          </svg>
          <div className="sp-ring-center">
            <span className="sp-ring-num">{readinessPercent}</span>
            <span className="sp-ring-pct">%</span>
            <span className="sp-ring-label">готовность</span>
          </div>
        </div>

        <div className="sp-hero-stats">
          <div className="sp-stat-card">
            <Flame size={18} className="sp-stat-icon flame" />
            <div className="sp-stat-data">
              <span className="sp-stat-val">{streak}</span>
              <span className="sp-stat-desc">дней подряд</span>
            </div>
          </div>
          <div className="sp-stat-card">
            <Zap size={18} className="sp-stat-icon zap" />
            <div className="sp-stat-data">
              <span className="sp-stat-val">{xp}</span>
              <span className="sp-stat-desc">опыта</span>
            </div>
          </div>
          <div className="sp-stat-card">
            <Heart size={18} className="sp-stat-icon heart" />
            <div className="sp-stat-data">
              <span className="sp-stat-val">{hearts}<span className="sp-stat-sub">/5</span></span>
              <span className="sp-stat-desc">
                {regenMinutes !== null && hearts < 5 ? (
                  <><Timer size={10} /> {regenMinutes} мин</>
                ) : 'жизней'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* === INSIGHT BANNER === */}
      <div className="sp-insight">
        <Brain size={16} />
        <span>{insight}</span>
      </div>

      {/* === THEORY / PRACTICE BARS === */}
      <div className="sp-bars-card">
        <div className="sp-bar-row">
          <div className="sp-bar-icon"><BookOpen size={14} /></div>
          <div className="sp-bar-info">
            <div className="sp-bar-top">
              <span>Теория</span>
              <span className="sp-bar-nums">{masteredTheory}/{totalTheory}</span>
            </div>
            <div className="sp-bar-track">
              <div className="sp-bar-fill theory" style={{ width: `${totalTheory > 0 ? (masteredTheory / totalTheory) * 100 : 0}%` }} />
            </div>
          </div>
        </div>
        <div className="sp-bar-row">
          <div className="sp-bar-icon"><Code size={14} /></div>
          <div className="sp-bar-info">
            <div className="sp-bar-top">
              <span>Практика</span>
              <span className="sp-bar-nums">{masteredPractice}/{totalPractice}</span>
            </div>
            <div className="sp-bar-track">
              <div className="sp-bar-fill practice" style={{ width: `${totalPractice > 0 ? (masteredPractice / totalPractice) * 100 : 0}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* === QUICK STATS ROW === */}
      <div className="sp-quick-row">
        <div className="sp-quick-item">
          <Clock size={14} />
          <span>~{estimatedMinutes} мин</span>
          <span className="sp-quick-label">осталось</span>
        </div>
        <div className="sp-quick-item">
          <Target size={14} />
          <span>{masteredAll}/{totalAll}</span>
          <span className="sp-quick-label">слайдов</span>
        </div>
        <div className="sp-quick-item">
          <Award size={14} />
          <span>{nodeProgress.filter(n => n.percent === 100).length}/{SKILL_NODES.length}</span>
          <span className="sp-quick-label">тем</span>
        </div>
      </div>

      {/* === WEEK ACTIVITY HEATMAP === */}
      <div className="sp-activity-card">
        <div className="sp-activity-header">
          <Calendar size={14} />
          <span>Активность за неделю</span>
        </div>
        <div className="sp-heatmap">
          {weekActivity.map((val, i) => {
            const intensity = val > 0 ? Math.max(0.2, val / maxActivity) : 0;
            return (
              <div key={i} className="sp-heat-col">
                <div
                  className={`sp-heat-cell ${val > 0 ? 'active' : ''}`}
                  style={{
                    background: val > 0
                      ? `rgba(99, 102, 241, ${intensity})`
                      : 'rgba(255,255,255,0.03)',
                    boxShadow: val > 0 ? `0 0 ${intensity * 12}px rgba(99,102,241,${intensity * 0.5})` : 'none',
                  }}
                >
                  {val > 0 && <span>{val}</span>}
                </div>
                <span className="sp-heat-day">{dayLabels[i]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* === TOPIC PROGRESS === */}
      <div className="sp-topics-header">
        <TrendingUp size={15} />
        <span>Прогресс по темам</span>
      </div>
      <div className="sp-topics">
        {nodeProgress.map(np => {
          const r = 22;
          const c = 2 * Math.PI * r;
          const off = c - (np.percent / 100) * c;
          const isDone = np.percent === 100;
          return (
            <div
              key={np.id}
              className={`sp-topic ${isDone ? 'done' : ''}`}
              onClick={() => {
                if (onStartLesson && np.lessons.length > 0) {
                  onStartLesson(np.id, np.lessons[0].id);
                }
              }}
            >
              <div className="sp-topic-ring">
                <svg viewBox="0 0 50 50">
                  <circle cx="25" cy="25" r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="3" />
                  <circle
                    cx="25" cy="25" r={r} fill="none"
                    stroke={isDone ? '#10b981' : '#6366f1'}
                    strokeWidth="3" strokeLinecap="round"
                    strokeDasharray={c} strokeDashoffset={off}
                    transform="rotate(-90 25 25)"
                    className="sp-topic-ring-fill"
                  />
                </svg>
                <span className="sp-topic-pct">{np.percent}%</span>
              </div>
              <div className="sp-topic-info">
                <span className="sp-topic-title">{np.title}</span>
                <span className="sp-topic-sub">{np.masteredCount}/{np.totalSlides} слайдов</span>
              </div>
              <div className="sp-topic-action">
                {isDone ? <CheckCircle size={16} className="sp-done-icon" /> : <ChevronRight size={16} />}
              </div>
            </div>
          );
        })}
      </div>

      {/* === WEAKEST TOPIC SUGGESTION === */}
      {weakest && weakest.percent < 100 && (
        <div
          className="sp-suggest"
          onClick={() => {
            if (onStartLesson && weakest.lessons.length > 0) {
              onStartLesson(weakest.id, weakest.lessons[0].id);
            }
          }}
        >
          <div className="sp-suggest-left">
            <Sparkles size={16} className="sp-suggest-icon" />
            <div>
              <span className="sp-suggest-title">Рекомендация</span>
              <span className="sp-suggest-desc">Подтяни «{weakest.title}» — {weakest.percent}% пройдено</span>
            </div>
          </div>
          <Play size={16} className="sp-suggest-play" />
        </div>
      )}

      {/* === BOTTOM ACTIONS === */}
      <div className="sp-actions">
        {hearts < 5 && (
          <button onClick={handleRefillPractice} className="btn-primary sp-btn-refill">
            <RefreshCw size={14} />
            <span>Повторение (+1 ❤️)</span>
          </button>
        )}
        <button onClick={handleShare} className="btn-secondary sp-btn-share">
          <Share2 size={14} />
          <span>Поделиться</span>
        </button>
      </div>

      <style>{`
        .sp {
          max-width: 680px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        /* === HERO === */
        .sp-hero {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 20px;
          background: linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.04) 50%, transparent 100%);
          border: 1px solid rgba(99,102,241,0.12);
          border-radius: var(--radius-lg);
        }

        .sp-ring-wrap {
          position: relative;
          width: 120px;
          height: 120px;
          flex-shrink: 0;
        }

        .sp-ring-svg { width: 100%; height: 100%; }

        .sp-ring-fill {
          transition: stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .sp-ring-center {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .sp-ring-num {
          font-size: 30px;
          font-weight: 900;
          color: var(--text-primary);
          line-height: 1;
        }

        .sp-ring-pct {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-secondary);
          margin-top: -2px;
        }

        .sp-ring-label {
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--text-muted);
          font-weight: 700;
          margin-top: 2px;
        }

        .sp-hero-stats {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .sp-stat-card {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          transition: border-color 0.2s;
        }

        .sp-stat-card:hover {
          border-color: rgba(255,255,255,0.1);
        }

        .sp-stat-icon.flame { color: #f59e0b; }
        .sp-stat-icon.zap { color: #6366f1; }
        .sp-stat-icon.heart { color: #ef4444; }

        .sp-stat-data {
          display: flex;
          align-items: baseline;
          gap: 6px;
        }

        .sp-stat-val {
          font-size: 18px;
          font-weight: 800;
          color: var(--text-primary);
        }

        .sp-stat-sub {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-muted);
        }

        .sp-stat-desc {
          font-size: 11px;
          color: var(--text-muted);
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 3px;
        }

        /* === INSIGHT === */
        .sp-insight {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: rgba(139,92,246,0.06);
          border: 1px solid rgba(139,92,246,0.12);
          border-radius: var(--radius-md);
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .sp-insight svg { flex-shrink: 0; color: #a78bfa; }

        /* === BARS === */
        .sp-bars-card {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 16px;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
        }

        .sp-bar-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .sp-bar-icon {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-sm);
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: var(--text-secondary);
        }

        .sp-bar-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .sp-bar-top {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          font-weight: 700;
          color: var(--text-secondary);
        }

        .sp-bar-nums {
          color: var(--text-primary);
          font-variant-numeric: tabular-nums;
        }

        .sp-bar-track {
          height: 6px;
          background: rgba(255,255,255,0.04);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .sp-bar-fill {
          height: 100%;
          border-radius: var(--radius-full);
          transition: width 0.6s ease-out;
        }

        .sp-bar-fill.theory {
          background: linear-gradient(90deg, #6366f1, #818cf8);
          box-shadow: 0 0 8px rgba(99,102,241,0.3);
        }

        .sp-bar-fill.practice {
          background: linear-gradient(90deg, #10b981, #34d399);
          box-shadow: 0 0 8px rgba(16,185,129,0.3);
        }

        /* === QUICK ROW === */
        .sp-quick-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }

        .sp-quick-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          padding: 12px 8px;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          text-align: center;
        }

        .sp-quick-item svg {
          color: var(--color-accent);
          margin-bottom: 2px;
        }

        .sp-quick-item > span:nth-child(2) {
          font-size: 16px;
          font-weight: 800;
          color: var(--text-primary);
        }

        .sp-quick-label {
          font-size: 10px;
          color: var(--text-muted);
          font-weight: 600;
        }

        /* === ACTIVITY === */
        .sp-activity-card {
          padding: 16px;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
        }

        .sp-activity-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 700;
          color: var(--text-secondary);
          margin-bottom: 14px;
        }

        .sp-activity-header svg { color: var(--color-accent); }

        .sp-heatmap {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 6px;
        }

        .sp-heat-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }

        .sp-heat-cell {
          width: 100%;
          aspect-ratio: 1;
          border-radius: var(--radius-sm);
          border: 1px solid rgba(255,255,255,0.04);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 800;
          color: var(--text-primary);
          transition: all 0.3s;
        }

        .sp-heat-cell.active {
          border-color: rgba(99,102,241,0.2);
        }

        .sp-heat-day {
          font-size: 9px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        /* === TOPICS === */
        .sp-topics-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 800;
          color: var(--text-primary);
          margin-top: 4px;
        }

        .sp-topics-header svg { color: var(--color-accent); }

        .sp-topics {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .sp-topic {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all 0.15s;
          user-select: none;
        }

        .sp-topic:hover {
          border-color: rgba(99,102,241,0.2);
          background: var(--bg-card-hover);
          transform: translateX(2px);
        }

        .sp-topic:active {
          transform: scale(0.99);
        }

        .sp-topic.done {
          border-color: rgba(16,185,129,0.15);
          opacity: 0.85;
        }

        .sp-topic-ring {
          position: relative;
          width: 44px;
          height: 44px;
          flex-shrink: 0;
        }

        .sp-topic-ring svg {
          width: 100%;
          height: 100%;
        }

        .sp-topic-ring-fill {
          transition: stroke-dashoffset 0.5s ease-out;
        }

        .sp-topic-pct {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 800;
          color: var(--text-primary);
        }

        .sp-topic-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .sp-topic-title {
          font-size: 13px;
          font-weight: 700;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sp-topic-sub {
          font-size: 11px;
          color: var(--text-muted);
          font-weight: 600;
        }

        .sp-topic-action {
          flex-shrink: 0;
          color: var(--text-muted);
          transition: color 0.15s;
        }

        .sp-topic:hover .sp-topic-action { color: var(--color-accent); }

        .sp-done-icon {
          color: var(--color-success);
          filter: drop-shadow(0 0 4px rgba(16,185,129,0.4));
        }

        /* === SUGGEST === */
        .sp-suggest {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 14px 16px;
          background: linear-gradient(135deg, rgba(251,191,36,0.06) 0%, rgba(245,158,11,0.02) 100%);
          border: 1px solid rgba(251,191,36,0.15);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all 0.15s;
        }

        .sp-suggest:hover {
          border-color: rgba(251,191,36,0.3);
          transform: translateY(-1px);
        }

        .sp-suggest:active { transform: scale(0.99); }

        .sp-suggest-left {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .sp-suggest-icon { color: #fbbf24; flex-shrink: 0; }

        .sp-suggest-title {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 800;
          color: #fbbf24;
          display: block;
        }

        .sp-suggest-desc {
          font-size: 12px;
          color: var(--text-secondary);
          font-weight: 600;
          display: block;
        }

        .sp-suggest-play {
          color: #fbbf24;
          flex-shrink: 0;
        }

        /* === ACTIONS === */
        .sp-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .sp-btn-refill { flex: 1; min-width: 160px; }

        .sp-btn-share {
          flex: 1;
          min-width: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
        }

        /* === MOBILE === */
        @media (max-width: 600px) {
          .sp-hero {
            flex-direction: column;
            align-items: center;
            text-align: center;
            padding: 16px;
            gap: 14px;
          }
          .sp-ring-wrap {
            width: 100px;
            height: 100px;
          }
          .sp-ring-num { font-size: 24px; }
          .sp-ring-pct { font-size: 12px; }
          .sp-hero-stats {
            width: 100%;
          }
          .sp-stat-card {
            padding: 8px 12px;
          }
          .sp-stat-val { font-size: 16px; }
          .sp-quick-item {
            padding: 10px 6px;
          }
          .sp-quick-item > span:nth-child(2) {
            font-size: 14px;
          }
          .sp-topic {
            padding: 10px 12px;
          }
          .sp-topic-ring {
            width: 38px;
            height: 38px;
          }
          .sp-heat-cell {
            font-size: 10px;
          }
        }
      `}</style>
    </div>
  );
};
