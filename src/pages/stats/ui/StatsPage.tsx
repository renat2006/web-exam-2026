import React, { useState, useEffect } from 'react';
import { Flame, Zap, Heart, Share2, Timer, BookOpen, Code, Play, RefreshCw, CheckCircle } from 'lucide-react';
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

export const StatsPage: React.FC<StatsPageProps> = ({
  xp,
  streak,
  hearts,
  handleRefillPractice,
  masteredSlides,
  onStartLesson,
}) => {
  // Regen countdown timer
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

  // Build per-node progress data
  const nodeProgress = SKILL_NODES.map(node => {
    let totalSlides = 0;
    let masteredCount = 0;
    node.lessons.forEach(lesson => {
      lesson.slides.forEach((_, si) => {
        totalSlides++;
        const key = `${node.id}_${lesson.id}_slide_${si}`;
        if (masteredSlides.includes(key)) masteredCount++;
      });
    });
    return {
      id: node.id,
      title: node.title,
      category: node.category,
      totalSlides,
      masteredCount,
      percent: totalSlides > 0 ? Math.round((masteredCount / totalSlides) * 100) : 0,
      lessons: node.lessons,
    };
  });

  const totalTheory = SKILL_NODES.reduce((acc, n) => acc + n.lessons.reduce((a, l) => a + l.slides.filter(s => s.type === 'theory').length, 0), 0);
  const masteredTheory = SKILL_NODES.reduce((acc, n) => {
    let c = 0;
    n.lessons.forEach(l => l.slides.forEach((s, si) => {
      if (s.type === 'theory' && masteredSlides.includes(`${n.id}_${l.id}_slide_${si}`)) c++;
    }));
    return acc + c;
  }, 0);
  const totalPractice = SKILL_NODES.reduce((acc, n) => acc + n.lessons.reduce((a, l) => a + l.slides.filter(s => s.type !== 'theory').length, 0), 0);
  const masteredPractice = SKILL_NODES.reduce((acc, n) => {
    let c = 0;
    n.lessons.forEach(l => l.slides.forEach((s, si) => {
      if (s.type !== 'theory' && masteredSlides.includes(`${n.id}_${l.id}_slide_${si}`)) c++;
    }));
    return acc + c;
  }, 0);
  const totalAll = totalTheory + totalPractice;
  const masteredAll = masteredTheory + masteredPractice;
  const readinessPercent = totalAll > 0 ? Math.round((masteredAll / totalAll) * 100) : 0;

  // SVG ring params
  const ringR = 52;
  const ringC = 2 * Math.PI * ringR;
  const ringOffset = ringC - (readinessPercent / 100) * ringC;

  const handleShare = async () => {
    const text = `Моя подготовка к зачету по Web-разработке: ${readinessPercent}% готовность. ${streak} дней подряд, ${xp} XP!`;
    if (navigator.share) {
      try { await navigator.share({ title: 'DevLingo', text, url: window.location.origin }); } catch {}
    } else {
      try { await navigator.clipboard.writeText(text); alert('Скопировано в буфер обмена!'); } catch {}
    }
  };

  return (
    <div className="stats-compact anim-slide-in">
      {/* Top compact overview — fits in one screen */}
      <div className="stats-overview-row">
        {/* Big ring */}
        <div className="ring-wrapper">
          <svg className="ring-svg" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r={ringR} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" />
            <circle
              cx="60" cy="60" r={ringR}
              fill="none" stroke="url(#ringGrad)" strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={ringC}
              strokeDashoffset={ringOffset}
              transform="rotate(-90 60 60)"
              style={{ transition: 'stroke-dashoffset 0.6s ease-out' }}
            />
            <defs>
              <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
          </svg>
          <div className="ring-center-text">
            <span className="ring-percent">{readinessPercent}%</span>
            <span className="ring-sub">к зачету</span>
          </div>
        </div>

        {/* Mini stat pills */}
        <div className="mini-stats-col">
          <div className="mini-stat-pill">
            <Flame size={16} className="mini-icon warning" />
            <span className="mini-val">{streak}</span>
            <span className="mini-unit">дн.</span>
          </div>
          <div className="mini-stat-pill">
            <Zap size={16} className="mini-icon accent" />
            <span className="mini-val">{xp}</span>
            <span className="mini-unit">XP</span>
          </div>
          <div className="mini-stat-pill">
            <Heart size={16} className="mini-icon error" />
            <span className="mini-val">{hearts}/5</span>
            {regenMinutes !== null && hearts < 5 && (
              <span className="regen-timer">
                <Timer size={10} />
                {regenMinutes} мин
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Double progress bars */}
      <div className="double-bars">
        <div className="bar-row">
          <div className="bar-label">
            <BookOpen size={12} />
            <span>Теория</span>
          </div>
          <div className="bar-track">
            <div className="bar-fill theory" style={{ width: `${totalTheory > 0 ? (masteredTheory / totalTheory) * 100 : 0}%` }} />
          </div>
          <span className="bar-count">{masteredTheory}/{totalTheory}</span>
        </div>
        <div className="bar-row">
          <div className="bar-label">
            <Code size={12} />
            <span>Практика</span>
          </div>
          <div className="bar-track">
            <div className="bar-fill practice" style={{ width: `${totalPractice > 0 ? (masteredPractice / totalPractice) * 100 : 0}%` }} />
          </div>
          <span className="bar-count">{masteredPractice}/{totalPractice}</span>
        </div>
      </div>

      {/* Section progress rings grid */}
      <h3 className="section-title">Разделы программы</h3>
      <div className="nodes-rings-grid">
        {nodeProgress.map(np => {
          const r = 28;
          const c = 2 * Math.PI * r;
          const off = c - (np.percent / 100) * c;
          return (
            <div
              key={np.id}
              className={`node-ring-card ${np.percent === 100 ? 'completed' : ''}`}
              onClick={() => {
                if (onStartLesson && np.lessons.length > 0) {
                  onStartLesson(np.id, np.lessons[0].id);
                }
              }}
            >
              <div className="node-ring-svg-wrap">
                <svg viewBox="0 0 64 64" className="node-ring-svg">
                  <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="4" />
                  <circle
                    cx="32" cy="32" r={r}
                    fill="none"
                    stroke={np.percent === 100 ? '#10b981' : '#6366f1'}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={c}
                    strokeDashoffset={off}
                    transform="rotate(-90 32 32)"
                    style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
                  />
                </svg>
                <span className="node-ring-percent">{np.percent}%</span>
              </div>
              <div className="node-ring-info">
                <span className="node-ring-title">{np.title}</span>
                <span className="node-ring-badge">{np.category}</span>
              </div>
              <div className="node-ring-action">
                {np.percent === 100 ? (
                  <CheckCircle size={16} className="action-done" />
                ) : (
                  <Play size={14} className="action-play" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom actions */}
      <div className="stats-bottom-actions">
        {hearts < 5 && (
          <button onClick={handleRefillPractice} className="btn-primary refill-compact-btn">
            <RefreshCw size={14} />
            <span>Повторение (+1 жизнь)</span>
          </button>
        )}
        <button onClick={handleShare} className="btn-secondary share-compact-btn">
          <Share2 size={14} />
          <span>Поделиться</span>
        </button>
      </div>

      <style>{`
        .stats-compact {
          max-width: 680px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .stats-overview-row {
          display: flex;
          align-items: center;
          gap: 24px;
          padding: 20px 24px;
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.4), rgba(15, 23, 42, 0.6));
          border: 1px solid rgba(99, 102, 241, 0.15);
          border-radius: var(--radius-lg);
          box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        }

        .ring-wrapper {
          position: relative;
          width: 120px;
          height: 120px;
          flex-shrink: 0;
        }

        .ring-svg {
          width: 100%;
          height: 100%;
        }

        .ring-center-text {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .ring-percent {
          font-size: 26px;
          font-weight: 800;
          color: var(--text-primary);
        }

        .ring-sub {
          font-size: 11px;
          color: var(--text-muted);
          font-weight: 600;
        }

        .mini-stats-col {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
        }

        .mini-stat-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
        }

        .mini-icon.warning { color: var(--color-warning); }
        .mini-icon.accent { color: var(--color-accent); }
        .mini-icon.error { color: var(--color-error); }

        .mini-val {
          font-size: 16px;
          font-weight: 800;
          color: var(--text-primary);
        }

        .mini-unit {
          font-size: 12px;
          color: var(--text-muted);
          font-weight: 500;
        }

        .regen-timer {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-left: auto;
          font-size: 11px;
          color: var(--color-warning);
          font-weight: 600;
        }

        /* Double bars */
        .double-bars {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 16px 20px;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
        }

        .bar-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .bar-label {
          display: flex;
          align-items: center;
          gap: 6px;
          width: 90px;
          flex-shrink: 0;
          font-size: 12px;
          font-weight: 700;
          color: var(--text-secondary);
        }

        .bar-track {
          flex: 1;
          height: 8px;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          border-radius: var(--radius-full);
          transition: width 0.5s ease-out;
        }

        .bar-fill.theory {
          background: linear-gradient(90deg, #6366f1, #818cf8);
          box-shadow: 0 0 6px rgba(99,102,241,0.4);
        }

        .bar-fill.practice {
          background: linear-gradient(90deg, #10b981, #34d399);
          box-shadow: 0 0 6px rgba(16,185,129,0.4);
        }

        .bar-count {
          font-size: 12px;
          font-weight: 700;
          color: var(--text-primary);
          width: 36px;
          text-align: right;
        }

        /* Section title */
        .section-title {
          font-size: 16px;
          font-weight: 800;
          color: var(--text-primary);
          margin-top: 4px;
        }

        /* Node rings grid */
        .nodes-rings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 10px;
        }

        @media (max-width: 640px) {
          .nodes-rings-grid {
            grid-template-columns: 1fr;
          }
          .stats-overview-row {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
          .mini-stats-col {
            width: 100%;
          }
        }

        .node-ring-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 16px;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          cursor: pointer;
          transition: all var(--transition-fast);
          user-select: none;
        }

        .node-ring-card:hover {
          border-color: rgba(99,102,241,0.3);
          background: var(--bg-card-hover);
          transform: translateY(-1px);
        }

        .node-ring-card.completed {
          border-color: rgba(16,185,129,0.2);
        }

        .node-ring-card.completed:hover {
          border-color: rgba(16,185,129,0.4);
        }

        .node-ring-svg-wrap {
          position: relative;
          width: 56px;
          height: 56px;
          flex-shrink: 0;
        }

        .node-ring-svg {
          width: 100%;
          height: 100%;
        }

        .node-ring-percent {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 800;
          color: var(--text-primary);
        }

        .node-ring-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 3px;
          min-width: 0;
        }

        .node-ring-title {
          font-size: 13px;
          font-weight: 700;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .node-ring-badge {
          font-size: 10px;
          font-weight: 700;
          color: var(--color-accent);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .node-ring-action {
          flex-shrink: 0;
        }

        .action-done {
          color: var(--color-success);
          filter: drop-shadow(0 0 4px rgba(16,185,129,0.4));
        }

        .action-play {
          color: var(--text-muted);
          transition: color var(--transition-fast);
        }

        .node-ring-card:hover .action-play {
          color: var(--color-accent);
        }

        /* Bottom actions */
        .stats-bottom-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .refill-compact-btn {
          flex: 1;
          min-width: 180px;
        }

        .share-compact-btn {
          flex: 1;
          min-width: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
        }

        @media (max-width: 480px) {
          .stats-overview-row {
            padding: 16px;
            gap: 16px;
          }
          .ring-wrapper {
            width: 100px;
            height: 100px;
          }
          .ring-percent {
            font-size: 22px;
          }
          .nodes-rings-grid {
            grid-template-columns: 1fr;
          }
          .double-bars {
            padding: 12px 14px;
          }
          .bar-label {
            width: 70px;
            font-size: 11px;
          }
        }
      `}</style>
    </div>
  );
};
