import React, { useState, useEffect } from 'react';
import { Calendar, AlertTriangle, Flame } from 'lucide-react';

const EXAM_DATE = new Date('2026-06-05T09:00:00+03:00');

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

function getTimeLeft(): TimeLeft {
  const now = new Date();
  const total = EXAM_DATE.getTime() - now.getTime();
  if (total <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  return {
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((total / (1000 * 60)) % 60),
    seconds: Math.floor((total / 1000) % 60),
    total,
  };
}

function getUrgencyLevel(days: number): 'chill' | 'soon' | 'urgent' | 'critical' {
  if (days > 14) return 'chill';
  if (days > 7) return 'soon';
  if (days > 3) return 'urgent';
  return 'critical';
}

function getMotivation(days: number): string {
  if (days <= 0) return 'Экзамен сегодня! Удачи! 🍀';
  if (days === 1) return 'Завтра экзамен! Повторяй ключевые темы.';
  if (days <= 3) return 'Осталось совсем чуть-чуть! Фокус на слабых местах.';
  if (days <= 7) return 'Пора усиливать подготовку. Решай практику каждый день!';
  if (days <= 14) return 'Хорошее время чтобы закрыть пробелы в теории.';
  return 'Начни готовиться заранее — потом скажешь себе спасибо.';
}

export const ExamCountdown: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft);
  const [dismissed] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (dismissed || timeLeft.total <= 0) return null;

  const urgency = getUrgencyLevel(timeLeft.days);
  const motivation = getMotivation(timeLeft.days);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className={`exam-countdown urgency-${urgency}`}>
      <div className="countdown-left">
        <div className="countdown-icon">
          {urgency === 'critical' ? <AlertTriangle size={18} /> :
           urgency === 'urgent' ? <Flame size={18} /> :
           <Calendar size={18} />}
        </div>
        <div className="countdown-info">
          <div className="countdown-label">
            Зачёт по Web — <strong>5 июня</strong>
          </div>
          <div className="countdown-motivation">{motivation}</div>
        </div>
      </div>

      <div className="countdown-timer">
        <div className="timer-block">
          <span className="timer-num">{timeLeft.days}</span>
          <span className="timer-unit">дн</span>
        </div>
        <span className="timer-sep">:</span>
        <div className="timer-block">
          <span className="timer-num">{pad(timeLeft.hours)}</span>
          <span className="timer-unit">ч</span>
        </div>
        <span className="timer-sep">:</span>
        <div className="timer-block">
          <span className="timer-num">{pad(timeLeft.minutes)}</span>
          <span className="timer-unit">м</span>
        </div>
        <span className="timer-sep">:</span>
        <div className="timer-block">
          <span className="timer-num tick-anim">{pad(timeLeft.seconds)}</span>
          <span className="timer-unit">с</span>
        </div>
      </div>

      <style>{`
        .exam-countdown {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 10px 24px;
          border-bottom: 1px solid var(--border-color);
          animation: countdown-slide-in 0.3s ease;
          transition: background-color 0.3s;
        }

        .urgency-chill {
          background: linear-gradient(90deg, rgba(99, 102, 241, 0.06) 0%, transparent 100%);
          border-bottom-color: rgba(99, 102, 241, 0.15);
        }
        .urgency-soon {
          background: linear-gradient(90deg, rgba(245, 158, 11, 0.06) 0%, transparent 100%);
          border-bottom-color: rgba(245, 158, 11, 0.15);
        }
        .urgency-urgent {
          background: linear-gradient(90deg, rgba(249, 115, 22, 0.08) 0%, transparent 100%);
          border-bottom-color: rgba(249, 115, 22, 0.2);
        }
        .urgency-critical {
          background: linear-gradient(90deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.02) 100%);
          border-bottom-color: rgba(239, 68, 68, 0.3);
          animation: countdown-slide-in 0.3s ease, critical-pulse 2s infinite alternate;
        }

        @keyframes critical-pulse {
          0% { background-color: rgba(239, 68, 68, 0.06); }
          100% { background-color: rgba(239, 68, 68, 0.12); }
        }

        .countdown-left {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
          min-width: 0;
        }

        .countdown-icon {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: var(--radius-md);
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border-color);
        }

        .urgency-chill .countdown-icon { color: var(--color-accent); }
        .urgency-soon .countdown-icon { color: #f59e0b; }
        .urgency-urgent .countdown-icon { color: #f97316; }
        .urgency-critical .countdown-icon { color: #ef4444; }

        .countdown-info {
          display: flex;
          flex-direction: column;
          gap: 1px;
          min-width: 0;
        }

        .countdown-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
        }

        .countdown-motivation {
          font-size: 11px;
          color: var(--text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .countdown-timer {
          display: flex;
          align-items: center;
          gap: 2px;
          flex-shrink: 0;
        }

        .timer-block {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 32px;
          padding: 4px 6px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
        }

        .timer-num {
          font-size: 16px;
          font-weight: 800;
          color: var(--text-primary);
          font-variant-numeric: tabular-nums;
          font-family: var(--font-mono);
          line-height: 1;
        }

        .timer-unit {
          font-size: 9px;
          color: var(--text-muted);
          font-weight: 600;
          text-transform: uppercase;
          margin-top: 1px;
        }

        .timer-sep {
          font-size: 14px;
          font-weight: 800;
          color: var(--text-muted);
          margin: 0 1px;
        }

        .urgency-critical .timer-num { color: #fca5a5; }
        .urgency-urgent .timer-num { color: #fdba74; }
        .urgency-soon .timer-num { color: #fcd34d; }
        .urgency-chill .timer-num { color: #a5b4fc; }

        @keyframes countdown-slide-in {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @media (max-width: 600px) {
          .exam-countdown {
            padding: 8px 12px;
            gap: 8px;
          }
          .countdown-icon {
            width: 28px;
            height: 28px;
          }
          .countdown-icon svg {
            width: 14px;
            height: 14px;
          }
          .countdown-label {
            font-size: 12px;
          }
          .countdown-motivation {
            display: none;
          }
          .timer-block {
            min-width: 26px;
            padding: 3px 4px;
          }
          .timer-num {
            font-size: 13px;
          }
          .timer-unit {
            font-size: 8px;
          }
          .timer-sep {
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
};
