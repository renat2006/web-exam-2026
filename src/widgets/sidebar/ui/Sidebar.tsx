import React, { useState, useEffect } from 'react';
import { Map, Award, TrendingUp, Volume2, VolumeX, Bell, Smartphone, Code } from 'lucide-react';
import { vibrateClick, vibrateTick } from '../../../shared/lib/haptics/vibrate';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  vibrationEnabled: boolean;
  setVibrationEnabled: (enabled: boolean) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  soundEnabled,
  setSoundEnabled,
  vibrationEnabled,
  setVibrationEnabled,
  notificationsEnabled,
  setNotificationsEnabled,
}) => {
  const [deviceVibrateSupported, setDeviceVibrateSupported] = useState(false);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      setDeviceVibrateSupported(true);
    }
  }, []);

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

  const handleNavClick = (tabId: string) => {
    setCurrentTab(tabId);
    vibrateTick(vibrationEnabled);
  };

  return (
    <aside className="sidebar">
      <div className="logo-container">
        <div className="logo-icon">
          <Code size={24} className="logo-symbol" />
        </div>
        <h1 className="logo-text">DevLingo</h1>
      </div>

      <nav className="nav-menu">
        <button
          onClick={() => handleNavClick('map')}
          className={`nav-item ${currentTab === 'map' ? 'active' : ''}`}
        >
          <Map size={20} />
          <span>Карта навыков</span>
        </button>

        <button
          onClick={() => handleNavClick('stats')}
          className={`nav-item ${currentTab === 'stats' ? 'active' : ''}`}
        >
          <TrendingUp size={20} />
          <span>Статистика</span>
        </button>

        <button
          onClick={() => handleNavClick('achievements')}
          className={`nav-item ${currentTab === 'achievements' ? 'active' : ''}`}
        >
          <Award size={20} />
          <span>Достижения</span>
        </button>
      </nav>

      <div className="sidebar-footer">
        <div className="settings-panel">
          <p className="settings-title">Настройки Android</p>
          
          <div className="setting-control-row">
            <button
              onClick={() => {
                const nextVal = !soundEnabled;
                setSoundEnabled(nextVal);
                if (nextVal) vibrateClick(vibrationEnabled);
              }}
              className={`setting-btn ${soundEnabled ? 'active' : ''}`}
              title={soundEnabled ? 'Звук включен' : 'Звук выключен'}
            >
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              <span>Звук</span>
            </button>

            <button
              onClick={() => {
                if (deviceVibrateSupported) {
                  const val = !vibrationEnabled;
                  setVibrationEnabled(val);
                  if (val) navigator.vibrate([100]);
                } else {
                  alert('Вибрация не поддерживается этим устройством');
                }
              }}
              className={`setting-btn ${vibrationEnabled ? 'active' : ''} ${!deviceVibrateSupported ? 'disabled' : ''}`}
              title={vibrationEnabled ? 'Виброотклик включен' : 'Виброотклик выключен'}
              disabled={!deviceVibrateSupported}
            >
              <Smartphone size={18} />
              <span>Вибро</span>
            </button>
          </div>

          <button
            onClick={handleRequestNotification}
            className={`btn-secondary notification-btn ${notificationsEnabled ? 'active' : ''}`}
          >
            <Bell size={16} />
            <span>{notificationsEnabled ? 'Напоминания ВКЛ' : 'Включить напоминания'}</span>
          </button>
        </div>
      </div>
      
      <style>{`
        .sidebar {
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          width: 260px;
          background-color: var(--bg-card);
          border-right: 1px solid var(--border-color);
          padding: 24px;
          display: flex;
          flex-direction: column;
          z-index: 100;
          backdrop-filter: blur(20px);
        }

        .logo-container {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 32px;
        }

        .logo-icon {
          width: 40px;
          height: 40px;
          background-color: rgba(99, 102, 241, 0.15);
          border: 1px solid var(--color-accent);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logo-symbol {
          color: var(--color-accent);
        }

        .logo-text {
          font-size: 20px;
          font-weight: 800;
          letter-spacing: -0.5px;
          background: linear-gradient(135deg, var(--text-primary) 30%, var(--text-secondary) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .nav-menu {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 16px;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          padding: 14px 16px;
          border-radius: var(--radius-md);
          cursor: pointer;
          font-size: 15px;
          font-weight: 600;
          text-align: left;
          transition: all var(--transition-fast);
          width: 100%;
        }

        .nav-item:hover {
          color: var(--text-primary);
          background-color: var(--bg-card-hover);
        }

        .nav-item.active {
          color: #fff;
          background-color: var(--color-accent);
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
        }

        .sidebar-footer {
          margin-top: auto;
          padding-top: 16px;
          border-top: 1px solid var(--border-color);
        }

        .settings-panel {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .settings-title {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-muted);
          font-weight: 700;
        }

        .setting-control-row {
          display: flex;
          gap: 8px;
        }

        .setting-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background-color: transparent;
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          padding: 8px 0;
          font-size: 12px;
          font-weight: 600;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .setting-btn:hover:not(.disabled) {
          background-color: var(--bg-card-hover);
          color: var(--text-primary);
        }

        .setting-btn.active {
          background-color: rgba(99, 102, 241, 0.15);
          border-color: var(--color-accent);
          color: var(--color-accent);
        }

        .setting-btn.disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .notification-btn {
          width: 100%;
          font-size: 13px !important;
          padding: 10px !important;
        }

        .notification-btn.active {
          background-color: rgba(16, 185, 129, 0.1) !important;
          border-color: var(--color-success) !important;
          color: var(--color-success) !important;
        }

        @media (max-width: 768px) {
          .sidebar {
            position: fixed;
            left: 0;
            right: 0;
            bottom: 0;
            top: auto;
            width: 100%;
            height: calc(68px + env(safe-area-inset-bottom, 0px));
            flex-direction: column;
            justify-content: center;
            padding: 6px 16px calc(6px + env(safe-area-inset-bottom, 0px)) 16px;
            border-right: none;
            border-top: 1px solid var(--border-color);
            background-color: rgba(15, 23, 42, 0.95);
            backdrop-filter: blur(20px);
          }
 
          .logo-container, .sidebar-footer, .nav-item span {
            display: none;
          }
 
          .nav-menu {
            flex-direction: row;
            justify-content: space-around;
            width: 100%;
            align-items: center;
            gap: 0;
          }
 
          .nav-item {
            justify-content: center;
            padding: 12px 28px;
            border-radius: var(--radius-lg);
            width: auto;
            min-height: 48px;
            min-width: 48px;
          }
        }
      `}</style>
    </aside>
  );
};
