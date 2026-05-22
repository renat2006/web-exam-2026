import React, { useState } from 'react';
import { Rocket, Zap, Gift, BookOpen, Code, Award, ChevronRight, Sparkles } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

const steps = [
  {
    icon: Rocket,
    title: 'Добро пожаловать в DevLingo!',
    subtitle: 'Тренажёр для подготовки к зачёту по Web-разработке',
    color: '#6366f1',
  },
  {
    icon: Zap,
    title: 'Как это работает',
    subtitle: 'Проходите уроки, зарабатывайте XP, поддерживайте серию дней',
    color: '#f59e0b',
    pills: [
      { icon: BookOpen, label: 'Теория с мнемониками' },
      { icon: Code, label: 'Практика с кодом' },
      { icon: Award, label: 'Достижения и уровни' },
    ],
  },
  {
    icon: Gift,
    title: 'Ваш стартовый бонус!',
    subtitle: 'За регистрацию вы получаете:',
    color: '#10b981',
    bonuses: ['+50 XP', '+50 гемов', '1 Streak Freeze'],
  },
];

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const current = steps[step];
  const isLast = step === steps.length - 1;
  const Icon = current.icon;

  const next = () => {
    if (isLast) { onComplete(); return; }
    setAnimKey(k => k + 1);
    setStep(s => s + 1);
  };

  return (
    <>
      <style>{`
        @keyframes ob-fade-up {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes ob-scale-in {
          from { opacity: 0; transform: scale(0.7); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes ob-pulse-glow {
          0%, 100% { box-shadow: 0 0 20px ${current.color}33, 0 0 60px ${current.color}11; }
          50% { box-shadow: 0 0 30px ${current.color}55, 0 0 80px ${current.color}22; }
        }
        .ob-overlay {
          position: fixed; inset: 0; z-index: 10000;
          background: rgba(2, 6, 23, 0.92);
          backdrop-filter: blur(20px);
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 24px;
          font-family: var(--font-sans);
        }
        .ob-card {
          animation: ob-fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
          display: flex; flex-direction: column; align-items: center;
          text-align: center; max-width: 420px; width: 100%;
          gap: 20px;
        }
        .ob-icon-ring {
          width: 88px; height: 88px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          animation: ob-scale-in 0.45s 0.15s cubic-bezier(0.16, 1, 0.3, 1) both,
                     ob-pulse-glow 3s infinite ease-in-out;
        }
        .ob-title {
          font-size: 24px; font-weight: 800; color: var(--text-primary);
          letter-spacing: -0.5px; line-height: 1.2;
        }
        .ob-subtitle {
          font-size: 15px; color: var(--text-secondary); line-height: 1.5;
          margin-top: -8px;
        }
        .ob-pills {
          display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;
          animation: ob-fade-up 0.5s 0.25s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .ob-pill {
          display: flex; align-items: center; gap: 8px;
          background: var(--bg-card); border: 1px solid var(--border-color);
          border-radius: var(--radius-full); padding: 10px 16px;
          font-size: 13px; font-weight: 600; color: var(--text-primary);
        }
        .ob-bonuses {
          display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;
          animation: ob-fade-up 0.5s 0.25s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .ob-bonus {
          display: flex; align-items: center; justify-content: center;
          gap: 6px; padding: 12px 20px;
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: var(--radius-md);
          font-size: 15px; font-weight: 700; color: #6ee7b7;
        }
        .ob-btn {
          background: linear-gradient(135deg, var(--color-accent) 0%, #4f46e5 100%);
          color: #fff; border: none; border-radius: var(--radius-md);
          padding: 14px 36px; font-weight: 700; font-size: 15px;
          cursor: pointer; display: flex; align-items: center; gap: 8px;
          box-shadow: 0 4px 20px rgba(99, 102, 241, 0.35);
          transition: all 0.2s ease; margin-top: 8px;
          user-select: none; touch-action: manipulation;
        }
        .ob-btn:hover { box-shadow: 0 6px 28px rgba(99, 102, 241, 0.55); transform: translateY(-1px); }
        .ob-btn:active { transform: translateY(1px); }
        .ob-dots {
          display: flex; gap: 8px; margin-top: 28px;
        }
        .ob-dot {
          width: 8px; height: 8px; border-radius: 50%;
          transition: all 0.3s ease;
        }
      `}</style>
      <div className="ob-overlay">
        <div className="ob-card" key={animKey}>
          <div className="ob-icon-ring" style={{
            background: `${current.color}15`,
            border: `2px solid ${current.color}40`,
          }}>
            <Icon size={36} color={current.color} />
          </div>

          <h1 className="ob-title">{current.title}</h1>
          <p className="ob-subtitle">{current.subtitle}</p>

          {current.pills && (
            <div className="ob-pills">
              {current.pills.map(p => (
                <div className="ob-pill" key={p.label}>
                  <p.icon size={16} color={current.color} />
                  {p.label}
                </div>
              ))}
            </div>
          )}

          {current.bonuses && (
            <div className="ob-bonuses">
              {current.bonuses.map(b => (
                <div className="ob-bonus" key={b}>
                  <Sparkles size={14} />
                  {b}
                </div>
              ))}
            </div>
          )}

          <button className="ob-btn" onClick={next}>
            {isLast ? 'Начать обучение' : 'Далее'}
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="ob-dots">
          {steps.map((_, i) => (
            <div key={i} className="ob-dot" style={{
              background: i === step ? current.color : 'rgba(255,255,255,0.15)',
              transform: i === step ? 'scale(1.3)' : 'scale(1)',
            }} />
          ))}
        </div>
      </div>
    </>
  );
};
