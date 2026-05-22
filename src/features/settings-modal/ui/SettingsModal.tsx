import React, { useState, useEffect } from 'react';
import { X, Volume2, VolumeX, Smartphone, Bell, RefreshCw, AlertTriangle, Download } from 'lucide-react';
import { vibrateClick, vibrateTick, vibrateError } from '../../../shared/lib/haptics/vibrate';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  vibrationEnabled: boolean;
  setVibrationEnabled: (enabled: boolean) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
  deferredPrompt: any;
  onInstallApp: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  soundEnabled,
  setSoundEnabled,
  vibrationEnabled,
  setVibrationEnabled,
  notificationsEnabled,
  setNotificationsEnabled,
  deferredPrompt,
  onInstallApp,
}) => {
  const [deviceVibrateSupported, setDeviceVibrateSupported] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      setDeviceVibrateSupported(true);
    }
  }, []);

  if (!isOpen) return null;

  const handleRequestNotification = async () => {
    if (!('Notification' in window)) {
      alert('Уведомления не поддерживаются вашим браузером');
      return;
    }
    
    if (Notification.permission === 'granted') {
      setNotificationsEnabled(true);
      vibrateClick(vibrationEnabled);
      alert('Уведомления уже включены!');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        vibrateTick(vibrationEnabled);
        new Notification('DevLingo', {
          body: 'Уведомления успешно настроены! Готовьтесь к зачету ежедневно.',
        });
      } else {
        alert('Разрешение на отправку уведомлений отклонено.');
      }
    } catch (e) {
      console.error('Error requesting notifications', e);
    }
  };

  const handleResetProgress = () => {
    vibrateError(vibrationEnabled);
    localStorage.clear();
    alert('Прогресс сброшен. Страница будет перезагружена.');
    window.location.reload();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container card anim-slide-in" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Настройки DevLingo</h3>
          <button onClick={onClose} className="modal-close-btn" title="Закрыть">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Sound Toggle */}
          <div className="setting-row">
            <div className="setting-info">
              <div className="setting-title-with-icon">
                {soundEnabled ? <Volume2 size={20} className="icon-accent" /> : <VolumeX size={20} className="icon-muted" />}
                <h4>Звуковые эффекты</h4>
              </div>
              <p>Озвучивание ответов, завершения уровней и ошибок с помощью синтеза Web Audio API</p>
            </div>
            <button
              onClick={() => {
                const nextVal = !soundEnabled;
                setSoundEnabled(nextVal);
                if (nextVal) vibrateClick(vibrationEnabled);
              }}
              className={`toggle-switch ${soundEnabled ? 'active' : ''}`}
            >
              <div className="switch-handle" />
            </button>
          </div>

          {/* Vibration Toggle */}
          <div className="setting-row">
            <div className="setting-info">
              <div className="setting-title-with-icon">
                <Smartphone size={20} className={vibrationEnabled ? 'icon-success' : 'icon-muted'} />
                <h4>Виброотклик (Android)</h4>
              </div>
              <p>Вибрация телефона при правильных и неправильных ответах, кликах и ошибках</p>
            </div>
            <button
              disabled={!deviceVibrateSupported}
              onClick={() => {
                if (deviceVibrateSupported) {
                  const val = !vibrationEnabled;
                  setVibrationEnabled(val);
                  if (val) navigator.vibrate([15]); // light click vibe
                }
              }}
              className={`toggle-switch ${vibrationEnabled ? 'active' : ''} ${!deviceVibrateSupported ? 'disabled' : ''}`}
            >
              <div className="switch-handle" />
            </button>
          </div>

          {/* Notifications Toggle */}
          <div className="setting-row">
            <div className="setting-info">
              <div className="setting-title-with-icon">
                <Bell size={20} className={notificationsEnabled ? 'icon-warning' : 'icon-muted'} />
                <h4>Напоминания о зачете</h4>
              </div>
              <p>Системные Push-уведомления для напоминания о регулярной подготовке</p>
            </div>
            <button
              onClick={() => {
                if (notificationsEnabled) {
                  setNotificationsEnabled(false);
                  vibrateClick(vibrationEnabled);
                } else {
                  handleRequestNotification();
                }
              }}
              className={`toggle-switch ${notificationsEnabled ? 'active' : ''}`}
            >
              <div className="switch-handle" />
            </button>
          </div>

          {/* PWA Install Button Row */}
          {deferredPrompt && (
            <>
              <div className="divider" />
              <div className="setting-row">
                <div className="setting-info">
                  <div className="setting-title-with-icon">
                    <Download size={20} className="icon-accent" />
                    <h4>Установить на телефон</h4>
                  </div>
                  <p>Добавить DevLingo на рабочий стол для быстрого оффлайн-запуска</p>
                </div>
                <button
                  onClick={onInstallApp}
                  className="btn-primary btn-sm"
                  style={{ padding: '10px 20px', fontSize: '13px', whiteSpace: 'nowrap', height: '40px' }}
                >
                  Установить
                </button>
              </div>
            </>
          )}

          <div className="divider" />

          {/* Reset progress */}
          <div className="reset-section">
            {!showResetConfirm ? (
              <button onClick={() => { vibrateClick(vibrationEnabled); setShowResetConfirm(true); }} className="btn-reset-danger">
                <RefreshCw size={16} />
                <span>Сбросить весь прогресс</span>
              </button>
            ) : (
              <div className="confirm-reset-box card">
                <div className="confirm-header">
                  <AlertTriangle size={20} className="icon-error" />
                  <h5>Вы уверены?</h5>
                </div>
                <p>Все ваши очки опыта (XP), сердца, достижения и пройденные уроки будут навсегда удалены.</p>
                <div className="confirm-actions">
                  <button onClick={() => { vibrateClick(vibrationEnabled); setShowResetConfirm(false); }} className="btn-secondary btn-sm">
                    Отмена
                  </button>
                  <button onClick={handleResetProgress} className="btn-danger btn-sm">
                    Да, сбросить
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(2, 6, 23, 0.8);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 20px;
        }

        .modal-container {
          width: 100%;
          max-width: 520px;
          background: rgba(15, 23, 42, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 0 40px rgba(99, 102, 241, 0.15);
          padding: 28px !important;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 16px;
        }

        .modal-header h3 {
          font-size: 20px;
          font-weight: 800;
          letter-spacing: -0.5px;
          background: linear-gradient(135deg, var(--text-primary) 30%, var(--text-secondary) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .modal-close-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 6px;
          border-radius: var(--radius-full);
          transition: all var(--transition-fast);
        }

        .modal-close-btn:hover {
          color: var(--text-primary);
          background-color: var(--bg-card-hover);
        }

        .modal-body {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .setting-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
          padding-bottom: 4px;
        }

        .setting-info {
          flex: 1;
        }

        .setting-title-with-icon {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 4px;
        }

        .setting-title-with-icon h4 {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .setting-info p {
          font-size: 12px;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        /* Toggle switches styling */
        .toggle-switch {
          width: 46px;
          height: 26px;
          border-radius: var(--radius-full);
          background-color: #1e293b;
          border: 1px solid var(--border-color);
          position: relative;
          cursor: pointer;
          transition: all var(--transition-normal);
          flex-shrink: 0;
        }

        .toggle-switch:hover:not(:disabled) {
          border-color: rgba(255, 255, 255, 0.2);
        }

        .toggle-switch.active {
          background-color: var(--color-success);
          border-color: rgba(16, 185, 129, 0.3);
        }

        .switch-handle {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background-color: #fff;
          position: absolute;
          top: 2px;
          left: 2px;
          transition: transform var(--transition-normal);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .toggle-switch.active .switch-handle {
          transform: translateX(20px);
        }

        .toggle-switch.disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .divider {
          height: 1px;
          background-color: var(--border-color);
          margin: 8px 0;
        }

        .icon-accent { color: var(--color-accent); }
        .icon-success { color: var(--color-success); }
        .icon-warning { color: var(--color-warning); }
        .icon-muted { color: var(--text-muted); }
        .icon-error { color: var(--color-error); }

        .btn-reset-danger {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          background: rgba(244, 63, 94, 0.05);
          color: var(--color-error);
          border: 1px dashed rgba(244, 63, 94, 0.3);
          border-radius: var(--radius-md);
          padding: 12px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .btn-reset-danger:hover {
          background: rgba(244, 63, 94, 0.1);
          border-color: var(--color-error);
        }

        .confirm-reset-box {
          background-color: rgba(244, 63, 94, 0.03);
          border-color: rgba(244, 63, 94, 0.2);
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .confirm-header {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .confirm-header h5 {
          font-size: 14px;
          font-weight: 700;
          color: var(--color-error);
        }

        .confirm-reset-box p {
          font-size: 12px;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .confirm-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }

        .btn-sm {
          padding: 6px 12px !important;
          font-size: 12px !important;
        }

        .btn-danger {
          background-color: var(--color-error);
          color: #fff;
          border: none;
          border-radius: var(--radius-sm);
          font-weight: 600;
          cursor: pointer;
        }

        .btn-danger:hover {
          filter: brightness(1.1);
        }

        @media (max-width: 480px) {
          .modal-container {
            padding: 20px !important;
          }
          .setting-row {
            gap: 12px;
          }
          .setting-title-with-icon h4 {
            font-size: 13px;
          }
          .setting-info p {
            font-size: 11px;
          }
          .modal-header h3 {
            font-size: 18px;
          }
        }
      `}</style>
    </div>
  );
};
