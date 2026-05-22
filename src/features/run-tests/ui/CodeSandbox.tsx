import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Lightbulb, Terminal, CheckCircle2, AlertTriangle, XCircle, Circle, Copy, Check } from 'lucide-react';
import { vibrateClick, vibrateSuccess, vibrateError } from '../../../shared/lib/haptics/vibrate';

interface CodeSandboxProps {
  starterCode: string;
  testSuite: string;
  domSetup?: string;
  hints: string[];
  onSuccess: () => void;
  onFailure: () => void;
  vibrationEnabled: boolean;
  referenceSolution?: string;
  explanation?: string;
}

const HELPER_KEYS = [
  '{', '}', '(', ')', '[', ']', ';', '=', '<', '>', '"', "'", '`', '/', 'const', 'let', 'function', 'console.log'
];

interface TestCase {
  id: string;
  name: string;
  status: 'passed' | 'failed' | 'pending';
  errorMsg?: string;
}

const getFixingTip = (errorMsg: string): string => {
  if (errorMsg.includes('Promise.race')) {
    return 'Использование встроенного Promise.race категорически запрещено по условию задачи. Реализуйте собственную логику обхода массива промисов и управления новым промисом.';
  }
  if (errorMsg.includes('is not defined')) {
    return 'Ошибка обращения к необъявленной переменной или функции. Проверьте правильность написания имен (например, регистр букв) и убедитесь, что вы объявили переменную через let или const перед использованием.';
  }
  if (errorMsg.includes('is not a function')) {
    return 'Попытка вызвать значение, которое не является функцией. Проверьте, правильно ли возвращается функция из makeCounter или совпадает ли имя вызываемой функции.';
  }
  if (errorMsg.includes('Cannot read properties of') || errorMsg.includes('cannot read property') || errorMsg.includes('is null') || errorMsg.includes('is undefined')) {
    return 'Ошибка обращения к свойству или методу неопределенного значения (null или undefined). Проверьте инициализацию переменных, а также убедитесь, что closest("button") действительно нашел кнопку, перед тем как читать ее dataset.';
  }
  if (errorMsg.includes('Unexpected token') || errorMsg.includes('Unexpected identifier') || errorMsg.includes('SyntaxError')) {
    return 'Синтаксическая ошибка. Убедитесь, что все открытые круглые `(`, квадратные `[` и фигурные `{` скобки имеют парные закрывающие скобки, и проверьте правильность написания ключевых слов и расстановку запятых.';
  }
  if (errorMsg.includes('Unexpected end of input')) {
    return 'Код обрывается неожиданно. Чаще всего это означает, что вы забыли закрыть какую-то круглую, квадратную или фигурную скобку в конце решения.';
  }
  return 'Проверьте логику работы кода, структуру возвращаемых данных и соответствие сигнатуры функций требованиям задания.';
};

const getTestCases = (starterCode: string, logs: string[], success: boolean | null): TestCase[] => {
  const slideType = starterCode.includes('makeCounter') ? 'makeCounter'
                  : (starterCode.includes('btn-container') || starterCode.includes('result')) ? 'delegation'
                  : starterCode.includes('race') ? 'race'
                  : starterCode.includes('swap') ? 'swap'
                  : '';
                  
  let cases: { name: string; checkFailure: (log: string) => boolean }[] = [];
  
  if (slideType === 'makeCounter') {
    cases = [
      {
        name: 'Функция makeCounter объявлена и доступна',
        checkFailure: (l) => l.includes('makeCounter должна быть функцией')
      },
      {
        name: 'makeCounter() возвращает функцию-счетчик',
        checkFailure: (l) => l.includes('должна возвращать функцию-счетчик')
      },
      {
        name: 'Счетчик по умолчанию увеличивает значение: 1, 2...',
        checkFailure: (l) => l.includes('Счетчик по умолчанию должен')
      },
      {
        name: 'Поддерживается начальное значение (например, 10 -> 11, 12)',
        checkFailure: (l) => l.includes('Счетчик с начальным значением 10')
      },
      {
        name: 'Поддерживаются отрицательные значения (например, -5 -> -4)',
        checkFailure: (l) => l.includes('Счетчик с отрицательным значением -5')
      }
    ];
  } else if (slideType === 'delegation') {
    cases = [
      {
        name: 'Клик по вложенному span на кнопке №1 выводит "1"',
        checkFailure: (l) => l.includes('При клике на span внутри')
      },
      {
        name: 'Клик по кнопке №3 выводит "3"',
        checkFailure: (l) => l.includes('При клике на третью кнопку')
      },
      {
        name: 'Клик по самому контейнеру игнорируется (делегирование)',
        checkFailure: (l) => l.includes('Клик по фону контейнера')
      }
    ];
  } else if (slideType === 'race') {
    cases = [
      {
        name: 'Функция race объявлена и доступна',
        checkFailure: (l) => l.includes('race должна быть функцией')
      },
      {
        name: 'Запрещено использование встроенного Promise.race',
        checkFailure: (l) => l.includes('категорически запрещено')
      },
      {
        name: 'Возвращается самый быстрый успешно выполненный промис',
        checkFailure: (l) => l.includes('Должен выиграть быстрый промис')
      },
      {
        name: 'Первый отклоненный промис отклоняет общий результат',
        checkFailure: (l) => l.includes('Промис должен был отклониться') || l.includes('отклониться с ошибкой')
      },
      {
        name: 'Обычные значения (не промисы) обрабатываются мгновенно',
        checkFailure: (l) => l.includes('Обычные значения должны')
      }
    ];
  } else if (slideType === 'swap') {
    cases = [
      {
        name: 'Функция swap объявлена и доступна',
        checkFailure: (l) => l.includes('swap должна быть функцией')
      },
      {
        name: 'swap(42, "hello") возвращает кортеж ["hello", 42]',
        checkFailure: (l) => l.includes('swap(42, \'hello\')') || l.includes('swap(42, "hello")')
      },
      {
        name: 'Структура сложных объектов сохраняется при swap',
        checkFailure: (l) => l.includes('swap не сохранил структуру')
      }
    ];
  }

  if (cases.length === 0) return [];

  if (success === null && logs.length === 0) {
    return cases.map((c, idx) => ({
      id: String(idx),
      name: c.name,
      status: 'pending'
    }));
  }

  if (success === true) {
    return cases.map((c, idx) => ({
      id: String(idx),
      name: c.name,
      status: 'passed'
    }));
  }

  const compilationErrorLog = logs.find(l => l.includes('Ошибка компиляции/выполнения') || l.includes('Ошибка при запуске') || l.includes('Ошибка выполнения тестов'));
  if (compilationErrorLog) {
    return cases.map((c, idx) => ({
      id: String(idx),
      name: c.name,
      status: idx === 0 ? 'failed' : 'pending',
      errorMsg: compilationErrorLog
    }));
  }

  let failedIndex = -1;
  let errorText = '';

  for (let i = 0; i < cases.length; i++) {
    const failureLog = logs.find(l => cases[i].checkFailure(l));
    if (failureLog) {
      failedIndex = i;
      errorText = failureLog;
      break;
    }
  }

  if (failedIndex === -1 && logs.length > 0) {
    const failureLog = logs.find(l => l.includes('не') || l.includes('ошибка') || l.includes('Ошибка') || l.includes('должна') || l.includes('должен'));
    if (failureLog) {
      failedIndex = cases.findIndex(c => c.checkFailure(failureLog));
      if (failedIndex === -1) failedIndex = 0;
      errorText = failureLog;
    } else {
      failedIndex = 0;
      errorText = logs[logs.length - 1];
    }
  }

  return cases.map((c, idx) => {
    let status: 'passed' | 'failed' | 'pending' = 'passed';
    if (idx === failedIndex) {
      status = 'failed';
    } else if (idx > failedIndex) {
      status = 'pending';
    }
    return {
      id: String(idx),
      name: c.name,
      status,
      errorMsg: idx === failedIndex ? errorText : undefined
    };
  });
};

export const CodeSandbox: React.FC<CodeSandboxProps> = ({
  starterCode,
  testSuite,
  domSetup,
  hints,
  onSuccess,
  onFailure,
  vibrationEnabled,
  referenceSolution,
  explanation,
}) => {
  const [code, setCode] = useState(starterCode);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [testSuccess, setTestSuccess] = useState<boolean | null>(null);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [activeConsoleTab, setActiveConsoleTab] = useState<'tests' | 'console' | 'solution'>('tests');
  const [copied, setCopied] = useState(false);
  const domContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightLayerRef = useRef<HTMLPreElement>(null);

  // Sync starter code when switching tasks
  useEffect(() => {
    setCode(starterCode);
    setConsoleLogs([]);
    setTestSuccess(null);
    setShowHint(false);
    setCurrentHintIndex(0);
  }, [starterCode]);

  // Insert character/keyword at current cursor position
  const insertChar = (char: string) => {
    vibrateClick(vibrationEnabled);
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    // Add spaces around helper keywords for better formatting
    const isKeyword = ['const', 'let', 'function'].includes(char);
    const textToInsert = isKeyword ? `${char} ` : char;

    const newCode = code.substring(0, start) + textToInsert + code.substring(end);
    setCode(newCode);
    
    // Reset cursor position to right after the inserted text and re-focus
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + textToInsert.length;
    }, 0);
  };

  // Handle Tab key inside textarea for code indentation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      const newCode = code.substring(0, start) + '  ' + code.substring(end);
      setCode(newCode);
      
      // Reset cursor position
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  // Safe run and evaluate user solution
  const runTests = async () => {
    setConsoleLogs(['Запуск тестов...']);
    setTestSuccess(null);
    vibrateClick(vibrationEnabled);

    // Set up DOM environment inside sandbox container
    if (domSetup && domContainerRef.current) {
      domContainerRef.current.innerHTML = domSetup;
    }

    try {
      const userCodeCleaned = code;

      // Prepare context: capture console logs if user logs anything
      const logsBuffer: string[] = [];
      const customConsole = {
        log: (...args: any[]) => {
          logsBuffer.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
        },
        error: (...args: any[]) => {
          logsBuffer.push('⚠️ ' + args.join(' '));
        }
      };

      // Wrap compilation & testing in a safe promise execution
      const testRunner = new Function('userCode', 'console', 'window', testSuite);
      
      // Execute the test script
      const result = await testRunner(userCodeCleaned, customConsole, window);

      const allLogs = [...logsBuffer, ...(result?.logs || [])];
      setConsoleLogs(allLogs);
      setActiveConsoleTab('tests');

      if (result?.success) {
        setTestSuccess(true);
        vibrateSuccess(vibrationEnabled);
        onSuccess();
      } else {
        setTestSuccess(false);
        vibrateError(vibrationEnabled);
        onFailure();
      }

    } catch (e: any) {
      setConsoleLogs(prev => [...prev, `❌ Ошибка компиляции/выполнения: ${e.message}`]);
      setTestSuccess(false);
      setActiveConsoleTab('tests');
      vibrateError(vibrationEnabled);
      onFailure();
    }
  };

  const handleReset = () => {
    vibrateClick(vibrationEnabled);
    setCode(starterCode);
    setConsoleLogs([]);
    setTestSuccess(null);
  };

  const handleNextHint = () => {
    vibrateClick(vibrationEnabled);
    setShowHint(true);
    if (showHint) {
      setCurrentHintIndex((prev) => (prev + 1) % hints.length);
    }
  };

  const handleCopySolution = () => {
    if (!referenceSolution) return;
    navigator.clipboard.writeText(referenceSolution);
    setCopied(true);
    vibrateClick(vibrationEnabled);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlightCode = (code: string): string => {
    return code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // strings
      .replace(/("[^"]*"|'[^']*'|`[^`]*`)/g, '<span class="hl-string">$1</span>')
      // comments
      .replace(/(\/\/.*)/gm, '<span class="hl-comment">$1</span>')
      // keywords
      .replace(/\b(const|let|var|function|return|if|else|for|while|new|class|import|export|from|async|await|try|catch|throw|typeof|instanceof|in|of|switch|case|break|default|this|null|undefined|true|false)\b/g, '<span class="hl-keyword">$1</span>')
      // numbers
      .replace(/\b(\d+\.?\d*)\b/g, '<span class="hl-number">$1</span>')
      // functions
      .replace(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g, '<span class="hl-function">$1</span>');
  };

  const handleEditorScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (highlightLayerRef.current) {
      highlightLayerRef.current.scrollTop = e.currentTarget.scrollTop;
      highlightLayerRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  return (
    <div className="sandbox-layout">
      {/* Visual Sandbox Container for DOM layout tasks */}
      {domSetup && (
        <div className="sandbox-dom-preview card">
          <p className="preview-title">Интерактивный DOM-контейнер</p>
          <div ref={domContainerRef} dangerouslySetInnerHTML={{ __html: domSetup }} />
        </div>
      )}

      {/* Editor & Console Grid */}
      <div className="editor-grid">
        {/* Editor Area */}
        <div className="editor-container card">
          <div className="editor-header">
            <span>Редактор JavaScript/TypeScript</span>
            <div className="editor-actions">
              <button onClick={handleReset} className="editor-action-btn" title="Сбросить код">
                <RotateCcw size={16} />
              </button>
            </div>
          </div>
          
          {/* Mobile Helper Keyboard Bar */}
          <div className="editor-helper-bar">
            {HELPER_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => insertChar(key)}
                className="helper-key-btn"
              >
                {key}
              </button>
            ))}
          </div>

          <div className="editor-input-wrapper">
            <pre
              ref={highlightLayerRef}
              className="editor-highlight-layer"
              aria-hidden="true"
            ><code dangerouslySetInnerHTML={{ __html: highlightCode(code) + '\n' }} /></pre>
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              onScroll={handleEditorScroll}
              className="editor-textarea"
              placeholder="Напишите решение..."
              spellCheck="false"
            />
          </div>
        </div>

        {/* Console / Output Area */}
        <div className="console-container card">
          <div className="console-header-tabs">
            <button
              type="button"
              onClick={() => { vibrateClick(vibrationEnabled); setActiveConsoleTab('tests'); }}
              className={`console-tab-btn ${activeConsoleTab === 'tests' ? 'active' : ''}`}
            >
              <Terminal size={14} />
              <span>Результаты автотестов</span>
              {testSuccess !== null && (
                <span className={`tab-indicator-count ${testSuccess ? 'success' : 'failure'}`}>
                  {testSuccess ? '✓' : '✗'}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => { vibrateClick(vibrationEnabled); setActiveConsoleTab('console'); }}
              className={`console-tab-btn ${activeConsoleTab === 'console' ? 'active' : ''}`}
            >
              <Terminal size={14} />
              <span>Логи console.log</span>
              {consoleLogs.filter(l => !l.includes('Запуск тестов') && !l.includes('Успешно') && !l.includes('Все тесты')).length > 0 && (
                <span className="tab-indicator-dot"></span>
              )}
            </button>
            {referenceSolution && (
              <button
                type="button"
                onClick={() => { vibrateClick(vibrationEnabled); setActiveConsoleTab('solution'); }}
                className={`console-tab-btn ${activeConsoleTab === 'solution' ? 'active' : ''}`}
              >
                <Lightbulb size={14} />
                <span>Разбор решения</span>
              </button>
            )}
          </div>
          
          <div className="console-body-content">
            {activeConsoleTab === 'tests' ? (
              <div className="test-results-checklist">
                {(() => {
                  const testCases = getTestCases(starterCode, consoleLogs, testSuccess);
                  if (testCases.length === 0) {
                    return <span className="console-placeholder">Запустите тесты для отображения результатов...</span>;
                  }
                  return (
                    <div className="test-cases-list">
                      {testCases.map((tc) => (
                        <div key={tc.id} className={`test-case-row ${tc.status}`}>
                          <div className="test-case-header-row">
                            <span className="test-status-icon-wrapper">
                              {tc.status === 'passed' && <CheckCircle2 size={16} className="text-success glow-success" />}
                              {tc.status === 'failed' && <XCircle size={16} className="text-error glow-error" />}
                              {tc.status === 'pending' && <Circle size={16} className="text-muted" />}
                            </span>
                            <span className="test-case-name">{tc.name}</span>
                          </div>
                          {tc.errorMsg && (
                            <div className="test-case-error-details">
                              <AlertTriangle size={14} className="text-error" style={{ marginTop: '2px' }} />
                              <div className="error-diagnostic-text">
                                <p className="error-diag-title">Диагностика ошибки:</p>
                                <p className="error-diag-body">{tc.errorMsg}</p>
                                <p className="error-tip-title" style={{ marginTop: '8px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-warning)', fontWeight: 800 }}>Совет по исправлению:</p>
                                <p className="error-tip-body" style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4, marginTop: '2px' }}>{getFixingTip(tc.errorMsg)}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            ) : activeConsoleTab === 'console' ? (
              <div className="console-logs">
                {consoleLogs.length === 0 ? (
                  <span className="console-placeholder">Здесь появится вывод console.log после запуска...</span>
                ) : (
                  consoleLogs.map((log, i) => (
                    <div
                      key={i}
                      className={`console-log-line ${
                        log.includes('❌') || log.includes('Ошибка') || log.includes('потерял')
                          ? 'error'
                          : log.includes('Все тесты') || log.includes('Успешно')
                          ? 'success'
                          : ''
                      }`}
                    >
                      {log}
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="solution-tab-content">
                <div className="solution-explanation-card">
                  <h4 className="solution-subtitle">Разбор логики</h4>
                  <p className="solution-explanation-text">{explanation}</p>
                </div>
                
                <div className="solution-code-container">
                  <div className="solution-code-header">
                    <span>Эталонный код</span>
                    <button
                      onClick={handleCopySolution}
                      className="copy-btn-compact"
                      title="Копировать код"
                    >
                      {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                      <span>{copied ? 'Скопировано!' : 'Копировать'}</span>
                    </button>
                  </div>
                  <pre className="solution-pre"><code>{referenceSolution}</code></pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions and Hints Bar */}
      <div className="sandbox-actions-bar">
        {hints.length > 0 && (
          <div className="hint-section">
            <button onClick={handleNextHint} className="btn-secondary hint-trigger-btn">
              <Lightbulb size={16} className="hint-bulb" />
              <span>{showHint ? 'Следующая подсказка' : 'Показать подсказку'}</span>
            </button>
            {showHint && (
              <div className="hint-box-container bounce">
                <p>💡 {hints[currentHintIndex]}</p>
              </div>
            )}
          </div>
        )}

        <button onClick={runTests} className="btn-primary run-tests-btn">
          <Play size={16} fill="currentColor" />
          <span>Запустить тесты</span>
        </button>
      </div>

      <style>{`
        .sandbox-layout {
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 100%;
        }

        .sandbox-dom-preview {
          background-color: #0b1329;
          border-color: var(--border-color);
        }

        .preview-title {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-muted);
          font-weight: 700;
          margin-bottom: 12px;
        }

        .editor-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          min-height: 320px;
        }

        @media (max-width: 900px) {
          .editor-grid {
            grid-template-columns: 1fr;
          }
        }

        .editor-container {
          display: flex;
          flex-direction: column;
          padding: 0 !important;
          overflow: hidden;
          background-color: #020617;
        }

        .editor-input-wrapper {
          position: relative;
          flex: 1;
          overflow: auto;
        }

        .editor-highlight-layer {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          margin: 0;
          font-family: var(--font-mono);
          font-size: 13px;
          line-height: 1.6;
          padding: 16px;
          white-space: pre-wrap;
          word-wrap: break-word;
          color: #e2e8f0;
          overflow: hidden;
          background: transparent;
        }

        .editor-highlight-layer code {
          font-family: inherit;
          font-size: inherit;
          line-height: inherit;
        }

        .hl-keyword { color: #c792ea; }
        .hl-string { color: #c3e88d; }
        .hl-comment { color: #546e7a; font-style: italic; }
        .hl-number { color: #f78c6c; }
        .hl-function { color: #82aaff; }

        .editor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 16px;
          background-color: var(--bg-card);
          border-bottom: 1px solid var(--border-color);
          font-size: 13px;
          color: var(--text-secondary);
          font-weight: 600;
        }

        .editor-helper-bar {
          display: flex;
          gap: 4px;
          padding: 5px 10px;
          background-color: rgba(15, 23, 42, 0.4);
          border-bottom: 1px solid var(--border-color);
          overflow-x: auto;
          white-space: nowrap;
          scrollbar-width: none;
        }

        .editor-helper-bar::-webkit-scrollbar {
          display: none;
        }

        .helper-key-btn {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          padding: 3px 8px;
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 500;
          border-radius: var(--radius-sm);
          cursor: pointer;
          user-select: none;
          transition: all var(--transition-fast);
          touch-action: manipulation;
        }

        .helper-key-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          color: var(--text-primary);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .helper-key-btn:active {
          transform: scale(0.95);
        }

        .editor-action-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 4px;
          border-radius: var(--radius-sm);
          transition: all var(--transition-fast);
          display: flex;
          align-items: center;
        }

        .editor-action-btn:hover {
          color: var(--text-primary);
          background-color: var(--bg-card-hover);
        }

        .editor-textarea {
          position: relative;
          z-index: 1;
          width: 100%;
          height: 200px;
          background: transparent;
          border: none;
          color: transparent;
          caret-color: #e2e8f0;
          font-family: var(--font-mono);
          font-size: 13px;
          padding: 16px;
          resize: none;
          outline: none;
          line-height: 1.6;
          white-space: pre-wrap;
          word-wrap: break-word;
        }

        .console-container {
          display: flex;
          flex-direction: column;
          padding: 0 !important;
          overflow: hidden;
          background-color: #020617;
        }

        .console-header-tabs {
          display: flex;
          background-color: var(--bg-card);
          border-bottom: 1px solid var(--border-color);
        }

        .console-tab-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 16px;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all var(--transition-fast);
        }

        .console-tab-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.02);
        }

        .console-tab-btn.active {
          color: var(--color-accent);
          border-bottom-color: var(--color-accent);
          background: rgba(99, 102, 241, 0.05);
        }

        .tab-indicator-count {
          font-size: 10px;
          font-weight: 800;
          padding: 1px 6px;
          border-radius: var(--radius-full);
        }

        .tab-indicator-count.success {
          background-color: rgba(16, 185, 129, 0.2);
          color: var(--color-success);
        }

        .tab-indicator-count.failure {
          background-color: rgba(239, 68, 68, 0.2);
          color: var(--color-error);
        }

        .tab-indicator-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: var(--color-warning);
          margin-left: 2px;
        }

        .console-body-content {
          flex: 1;
          height: 180px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }

        .test-results-checklist {
          padding: 10px 12px;
          flex: 1;
        }

        .test-cases-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .test-case-row {
          border: 1px solid rgba(255, 255, 255, 0.04);
          background: rgba(255, 255, 255, 0.01);
          border-radius: var(--radius-sm);
          padding: 8px 10px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          transition: all var(--transition-fast);
        }

        .test-case-row.passed {
          border-color: rgba(16, 185, 129, 0.15);
          background: rgba(16, 185, 129, 0.02);
        }

        .test-case-row.failed {
          border-color: rgba(239, 68, 68, 0.2);
          background: rgba(239, 68, 68, 0.03);
        }

        .test-case-row.pending {
          opacity: 0.5;
        }

        .test-case-header-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .test-status-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .test-case-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .test-case-row.passed .test-case-name {
          color: var(--text-primary);
        }

        .test-case-row.failed .test-case-name {
          color: #fca5a5;
        }

        .test-case-error-details {
          margin-top: 4px;
          margin-left: 26px;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: var(--radius-sm);
          padding: 8px 12px;
          display: flex;
          gap: 8px;
        }

        .error-diagnostic-text {
          flex: 1;
        }

        .error-diag-title {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--color-error);
          font-weight: 800;
          margin-bottom: 2px;
        }

        .error-diag-body {
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--text-secondary);
          line-height: 1.4;
          white-space: pre-wrap;
          word-break: break-all;
        }

        .console-logs {
          flex: 1;
          padding: 16px;
          font-family: var(--font-mono);
          font-size: 13px;
          color: var(--text-secondary);
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .console-placeholder {
          color: var(--text-muted);
          font-style: italic;
        }

        .console-log-line {
          line-height: 1.5;
          white-space: pre-wrap;
        }

        .console-log-line.error {
          color: var(--color-error);
        }

        .console-log-line.success {
          color: var(--color-success);
        }

        .solution-tab-content {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          flex: 1;
        }

        .solution-explanation-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: var(--radius-md);
          padding: 14px;
        }

        .solution-subtitle {
          font-size: 11px;
          font-weight: 700;
          color: var(--color-accent);
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .solution-explanation-text {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .solution-code-container {
          display: flex;
          flex-direction: column;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          overflow: hidden;
        }

        .solution-code-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #0f172a;
          padding: 8px 16px;
          border-bottom: 1px solid var(--border-color);
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .copy-btn-compact {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 600;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .copy-btn-compact:hover {
          background: rgba(255, 255, 255, 0.08);
          color: var(--text-primary);
        }

        .solution-pre {
          background: #020617;
          padding: 16px;
          margin: 0;
          overflow-x: auto;
        }

        .solution-pre code {
          font-family: var(--font-mono);
          font-size: 13px;
          color: #e2e8f0;
          line-height: 1.5;
        }

        .sandbox-actions-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          padding-top: 8px;
          border-top: 1px solid var(--border-color);
        }

        .hint-section {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .hint-bulb {
          color: var(--color-warning);
        }

        .hint-box-container {
          padding: 10px 16px;
          border-radius: var(--radius-md);
          background-color: var(--bg-card);
          border: 1px solid var(--border-color);
          font-size: 13px;
          max-width: 320px;
          color: var(--text-secondary);
        }

        .run-tests-btn {
          padding: 14px 28px !important;
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
};
