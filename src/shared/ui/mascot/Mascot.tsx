import React from 'react';

export type MascotState = 'idle' | 'thinking' | 'success' | 'error' | 'cheering';

interface MascotProps {
  state: MascotState;
  speechText?: string;
}

export const Mascot: React.FC<MascotProps> = ({ state, speechText }) => {
  const getEyeStyles = () => {
    switch (state) {
      case 'success':
        return {
          left: <path d="M12 24 L18 18 L24 24" stroke="#10b981" strokeWidth="4" strokeLinecap="round" fill="none" />,
          right: <path d="M36 24 L42 18 L48 24" stroke="#10b981" strokeWidth="4" strokeLinecap="round" fill="none" />
        };
      case 'error':
        return {
          left: <path d="M12 22 L24 26" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" fill="none" />,
          right: <path d="M36 26 L48 22" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" fill="none" />
        };
      case 'thinking':
        return {
          left: <circle cx="18" cy="24" r="3" fill="#818cf8" className="thinking-eye" />,
          right: <circle cx="42" cy="24" r="3" fill="#818cf8" className="thinking-eye" />
        };
      case 'cheering':
        return {
          left: <path d="M14 20 C 14 16, 22 16, 22 20" stroke="#818cf8" strokeWidth="4" strokeLinecap="round" fill="none" />,
          right: <path d="M38 20 C 38 16, 46 16, 46 20" stroke="#818cf8" strokeWidth="4" strokeLinecap="round" fill="none" />
        };
      case 'idle':
      default:
        return {
          left: <ellipse cx="18" cy="24" rx="4" ry="6" fill="#94a3b8" className="blinking-eye" />,
          right: <ellipse cx="42" cy="24" rx="4" ry="6" fill="#94a3b8" className="blinking-eye" />
        };
    }
  };

  const getMouth = () => {
    switch (state) {
      case 'success':
      case 'cheering':
        return <path d="M22 36 Q 30 44, 38 36" stroke="#10b981" strokeWidth="4" strokeLinecap="round" fill="none" />;
      case 'error':
        return <path d="M22 40 Q 30 34, 38 40" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" fill="none" />;
      case 'thinking':
        return <line x1="24" y1="36" x2="36" y2="36" stroke="#818cf8" strokeWidth="4" strokeLinecap="round" />;
      case 'idle':
      default:
        return <path d="M24 36 Q 30 39, 36 36" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" fill="none" />;
    }
  };

  const getGlowColor = () => {
    switch (state) {
      case 'success': return 'rgba(16, 185, 129, 0.5)';
      case 'error': return 'rgba(244, 63, 94, 0.5)';
      case 'thinking': return 'rgba(129, 140, 248, 0.5)';
      case 'cheering': return 'rgba(129, 140, 248, 0.5)';
      case 'idle':
      default:
        return 'rgba(148, 163, 184, 0.2)';
    }
  };

  const eyes = getEyeStyles();

  return (
    <div className={`mascot-container ${state}`}>
      {speechText && (
        <div className={`speech-bubble ${state}`}>
          <p>{speechText}</p>
          <div className="speech-arrow"></div>
        </div>
      )}
      
      <div className="mascot-robot">
        <div className="mascot-antenna">
          <div className="antenna-ball" style={{ boxShadow: `0 0 12px ${getGlowColor()}` }}></div>
          <div className="antenna-line"></div>
        </div>

        <div className="mascot-head" style={{ boxShadow: `inset 0 0 15px rgba(0,0,0,0.5), 0 0 20px ${getGlowColor()}` }}>
          <svg viewBox="0 0 60 48" className="face-screen">
            {eyes.left}
            {eyes.right}
            {getMouth()}
          </svg>
        </div>

        <div className="mascot-neck"></div>

        <div className="mascot-body">
          <div className="body-screen" style={{ borderColor: getGlowColor() }}>
            <div className="screen-wave"></div>
          </div>
        </div>
      </div>

      <style>{`
        .mascot-container {
          display: flex;
          align-items: center;
          gap: 20px;
          margin: 16px 0;
          user-select: none;
          width: 100%;
        }

        .mascot-robot {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 80px;
          flex-shrink: 0;
          animation: idle-float 3s infinite ease-in-out;
        }

        .cheering .mascot-robot {
          animation: cheer-jump 0.5s infinite alternate ease-in-out;
        }

        /* Speech bubble - glassmorphic glass */
        .speech-bubble {
          flex: 1;
          position: relative;
          padding: 16px 20px;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-color);
          background: rgba(30, 41, 59, 0.7);
          backdrop-filter: blur(12px);
          font-size: 14px;
          font-weight: 500;
          line-height: 1.5;
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2);
          transition: all var(--transition-normal);
        }

        .speech-bubble.success {
          border-color: var(--color-success);
          background: rgba(16, 185, 129, 0.08);
          box-shadow: 0 8px 32px 0 rgba(16, 185, 129, 0.1);
        }

        .speech-bubble.error {
          border-color: var(--color-error);
          background: rgba(244, 63, 94, 0.08);
          box-shadow: 0 8px 32px 0 rgba(244, 63, 94, 0.1);
        }

        .speech-bubble.thinking {
          border-color: var(--color-accent);
          background: rgba(99, 102, 241, 0.08);
        }

        .speech-arrow {
          position: absolute;
          right: -8px;
          top: 50%;
          transform: translateY(-50%) rotate(45deg);
          width: 14px;
          height: 14px;
          background: inherit;
          border-right: 1px solid var(--border-color);
          border-top: 1px solid var(--border-color);
          z-index: 10;
        }

        .success .speech-arrow { border-color: var(--color-success); }
        .error .speech-arrow { border-color: var(--color-error); }
        .thinking .speech-arrow { border-color: var(--color-accent); }

        /* Antenna */
        .mascot-antenna {
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 20px;
        }

        .antenna-ball {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: var(--text-primary);
          transition: background-color 0.3s;
        }

        .idle .antenna-ball { background-color: var(--text-muted); }
        .success .antenna-ball { background-color: var(--color-success); }
        .error .antenna-ball { background-color: var(--color-error); }
        .thinking .antenna-ball { background-color: var(--color-accent); animation: pulse-glow 1s infinite alternate; }

        .antenna-line {
          width: 3px;
          height: 12px;
          background-color: var(--border-color);
        }

        /* Head */
        .mascot-head {
          width: 64px;
          height: 52px;
          background-color: #1e293b;
          border: 3px solid var(--border-color);
          border-radius: 14px;
          padding: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
        }

        .face-screen {
          width: 100%;
          height: 100%;
        }

        /* Neck */
        .mascot-neck {
          width: 16px;
          height: 6px;
          background-color: var(--border-color);
          border-radius: 3px;
          margin-top: -2px;
        }

        /* Body */
        .mascot-body {
          width: 48px;
          height: 38px;
          background-color: #1e293b;
          border: 3px solid var(--border-color);
          border-radius: 8px 8px 14px 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: -2px;
        }

        .body-screen {
          width: 30px;
          height: 20px;
          background-color: #0f172a;
          border: 2px solid var(--border-color);
          border-radius: 4px;
          overflow: hidden;
          position: relative;
        }

        .screen-wave {
          position: absolute;
          width: 100%;
          height: 2px;
          background-color: var(--text-muted);
          top: 50%;
          transform: translateY(-50%);
          opacity: 0.3;
        }

        @keyframes pulse-glow {
          0% { filter: brightness(1); }
          100% { filter: brightness(1.4); }
        }

        .thinking-eye {
          animation: eye-roll 1.5s infinite linear;
          transform-origin: center;
        }

        @keyframes eye-roll {
          0% { transform: translate(0, 0); }
          25% { transform: translate(1px, -1px); }
          50% { transform: translate(0, -2px); }
          75% { transform: translate(-1px, -1px); }
          100% { transform: translate(0, 0); }
        }

        .blinking-eye {
          animation: blink 4s infinite;
        }

        @keyframes blink {
          0%, 96%, 100% { transform: scaleY(1); }
          98% { transform: scaleY(0.1); }
        }

        @keyframes idle-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        @keyframes cheer-jump {
          0% { transform: translateY(0); }
          100% { transform: translateY(-8px); }
        }

        /* Responsive adaptations */
        @media (max-width: 768px) {
          .mascot-container {
            flex-direction: column-reverse;
            gap: 12px;
          }
          .speech-bubble {
            width: 100%;
          }
          .speech-arrow {
            right: auto;
            left: 50%;
            top: auto;
            bottom: -8px;
            transform: translateX(-50%) rotate(45deg);
            border-right: 1px solid var(--border-color);
            border-top: 1px solid var(--border-color);
            border-left: none;
            border-bottom: none;
          }
        }
      `}</style>
    </div>
  );
};
