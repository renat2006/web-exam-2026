import React, { useState, useCallback, useRef, useEffect, Suspense } from 'react';
import { PROBLEMS, getDifficultyColor, getDifficultyLabel, getCategoryLabel } from '../model/problems';
import type { Problem, Difficulty, Category } from '../model/problems';
import { CheckCircle, Search, ChevronRight, ChevronLeft, Play, Lightbulb, BookOpen, RotateCcw, Terminal, Code2, Eye, X } from 'lucide-react';

// Lazy-load Monaco to keep initial bundle small
const MonacoEditor = React.lazy(() => import('@monaco-editor/react'));

// ─── Types ────────────────────────────────────────────────────────
type TestStatus = 'idle' | 'running' | 'passed' | 'failed';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'error';
  message?: string;
  duration?: number;
}

// ─── Storage helpers ───────────────────────────────────────────────
const STORAGE_KEY = 'devlingo_practice_solved';
const CODE_STORAGE_PREFIX = 'devlingo_practice_code_';
const getSolved = (): Set<string> => {
  try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')); }
  catch { return new Set(); }
};
const saveSolved = (set: Set<string>) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
};
const getSavedCode = (id: string): string | null => {
  try { return localStorage.getItem(CODE_STORAGE_PREFIX + id); }
  catch { return null; }
};
const saveCode = (id: string, code: string) => {
  localStorage.setItem(CODE_STORAGE_PREFIX + id, code);
};

// ─── Test Runner ───────────────────────────────────────────────────
async function runTests(code: string, problem: Problem): Promise<TestResult[]> {
  const results: TestResult[] = [];

  for (const tc of problem.testCases) {
    const start = performance.now();
    try {
      // Strip TypeScript annotations for runtime evaluation
      const jsCode = code
        .replace(/:\s*\w+(\[\])?(\s*\|\s*\w+(\[\])?)*(?=\s*[,)=;{])/g, '')
        .replace(/<[^>]+>/g, '')
        .replace(/:\s*\w+\s*{/g, ' {')
        .replace(/^type\s+\w+.+$/gm, '')
        .replace(/^interface\s+\w[\s\S]*?^}/gm, '');

      const exportedName = problem.starterCode
        .match(/(?:function|class|type|const)\s+(\w+)/)?.[1] || 'userFn';

      const wrappedCode = `
        ${jsCode}
        const __exported__ = (typeof ${exportedName} !== 'undefined') ? ${exportedName} : undefined;
        __exported__;
      `;

      let userFn: unknown;
      try {
        userFn = new Function(wrappedCode)();
      } catch {
        userFn = {};
      }

      const testFn = new Function('userFn', `
        return (async () => {
          ${tc.run}
        })();
      `);

      await testFn(userFn);
      results.push({ name: tc.name, status: 'pass', duration: Math.round(performance.now() - start) });
    } catch (e: unknown) {
      const err = e instanceof Error ? e : new Error(String(e));
      results.push({ name: tc.name, status: 'fail', message: err.message, duration: Math.round(performance.now() - start) });
    }
  }

  return results;
}

// ─── Main PracticePage ────────────────────────────────────────────
export const PracticePage: React.FC = () => {
  const [selected, setSelected] = useState<Problem | null>(null);
  const [solved, setSolved] = useState<Set<string>>(getSolved);

  const handleSolve = useCallback((id: string) => {
    setSolved(prev => {
      const next = new Set(prev);
      next.add(id);
      saveSolved(next);
      return next;
    });
  }, []);

  return (
    <div className="pract">
      {!selected ? (
        <ProblemListView problems={PROBLEMS} solved={solved} onSelect={setSelected} />
      ) : (
        <ProblemSolveView
          key={selected.id}
          problem={selected}
          solved={solved}
          onSolve={handleSolve}
          onBack={() => setSelected(null)}
        />
      )}

      <style>{practiceCSS}</style>
    </div>
  );
};

// ─── Problem List View ────────────────────────────────────────────
interface ProblemListViewProps {
  problems: Problem[];
  solved: Set<string>;
  onSelect: (p: Problem) => void;
}

const ProblemListView: React.FC<ProblemListViewProps> = ({ problems, solved, onSelect }) => {
  const [search, setSearch] = useState('');
  const [filterDiff, setFilterDiff] = useState<Difficulty | 'all'>('all');
  const [filterCat, setFilterCat] = useState<Category | 'all'>('all');

  const filtered = problems.filter(p => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) &&
        !p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))) return false;
    if (filterDiff !== 'all' && p.difficulty !== filterDiff) return false;
    if (filterCat !== 'all' && p.category !== filterCat) return false;
    return true;
  });

  const solvedCount = problems.filter(p => solved.has(p.id)).length;
  const pct = Math.round((solvedCount / problems.length) * 100);

  return (
    <div className="pract-list-view">
      {/* Hero header */}
      <div className="pract-hero">
        <div className="pract-hero-glow" />
        <div className="pract-hero-content">
          <div className="pract-hero-icon-wrap">
            <Terminal size={28} />
          </div>
          <div>
            <h1 className="pract-hero-title">Практикум</h1>
            <p className="pract-hero-sub">Решай задачи • Пиши код • Готовься к зачёту</p>
          </div>
        </div>

        {/* Big progress */}
        <div className="pract-hero-progress">
          <div className="pract-hero-stats">
            <div className="pract-stat">
              <span className="pract-stat-num">{solvedCount}</span>
              <span className="pract-stat-label">решено</span>
            </div>
            <div className="pract-stat">
              <span className="pract-stat-num">{problems.length}</span>
              <span className="pract-stat-label">всего</span>
            </div>
            <div className="pract-stat">
              <span className="pract-stat-num">{pct}%</span>
              <span className="pract-stat-label">прогресс</span>
            </div>
          </div>
          <div className="pract-progress-track">
            <div className="pract-progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="pract-controls">
        <div className="pract-search">
          <Search size={18} className="pract-search-icon" />
          <input
            className="pract-search-input"
            placeholder="Поиск по названию или тегу..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="pract-search-clear" onClick={() => setSearch('')}>
              <X size={16} />
            </button>
          )}
        </div>

        <div className="pract-filter-row">
          <div className="pract-pills">
            {(['all', 'easy', 'medium', 'hard'] as const).map(d => (
              <button
                key={d}
                className={`pract-pill ${filterDiff === d ? 'active' : ''}`}
                onClick={() => setFilterDiff(d)}
                style={d !== 'all' && filterDiff === d ? { background: getDifficultyColor(d) + '22', color: getDifficultyColor(d), borderColor: getDifficultyColor(d) + '55' } : undefined}
              >
                {d === 'all' ? '🔥 Все' : d === 'easy' ? '🟢 Easy' : d === 'medium' ? '🟡 Medium' : '🔴 Hard'}
              </button>
            ))}
          </div>
          <select
            className="pract-cat-sel"
            value={filterCat}
            onChange={e => setFilterCat(e.target.value as Category | 'all')}
          >
            <option value="all">Все темы</option>
            {(['javascript', 'typescript', 'async', 'patterns', 'react', 'spa'] as Category[]).map(c => (
              <option key={c} value={c}>{getCategoryLabel(c)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Problem cards */}
      <div className="pract-card-grid">
        {filtered.map(p => {
          const done = solved.has(p.id);
          return (
            <button key={p.id} className={`pract-card ${done ? 'done' : ''}`} onClick={() => onSelect(p)}>
              <div className="pract-card-top">
                <span className="pract-card-num">#{p.number}</span>
                <span className="pract-card-diff" style={{ color: getDifficultyColor(p.difficulty), background: getDifficultyColor(p.difficulty) + '18' }}>
                  {getDifficultyLabel(p.difficulty)}
                </span>
                {done && <CheckCircle size={16} className="pract-card-check" />}
              </div>
              <h3 className="pract-card-title">{p.title}</h3>
              <div className="pract-card-tags">
                {p.tags.slice(0, 3).map(t => <span key={t} className="pract-card-tag">{t}</span>)}
              </div>
              <div className="pract-card-bottom">
                <span className="pract-card-cat">{getCategoryLabel(p.category)}</span>
                <span className="pract-card-tests">{p.testCases.length} тестов</span>
              </div>
              <ChevronRight size={18} className="pract-card-arrow" />
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="pract-empty">
          <Search size={32} />
          <p>Задачи не найдены</p>
        </div>
      )}
    </div>
  );
};

// ─── Problem Solve View (fullscreen) ──────────────────────────────
interface ProblemSolveViewProps {
  problem: Problem;
  solved: Set<string>;
  onSolve: (id: string) => void;
  onBack: () => void;
}

const ProblemSolveView: React.FC<ProblemSolveViewProps> = ({ problem, solved, onSolve, onBack }) => {
  const [code, setCode] = useState(() => getSavedCode(problem.id) || problem.starterCode);
  const [status, setStatus] = useState<TestStatus>('idle');
  const [results, setResults] = useState<TestResult[]>([]);
  const [hintsShown, setHintsShown] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [activePanel, setActivePanel] = useState<'desc' | 'editor' | 'tests'>('desc');
  const attempts = useRef(0);
  const isSolved = solved.has(problem.id);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Save code as user types
  useEffect(() => {
    const t = setTimeout(() => saveCode(problem.id, code), 500);
    return () => clearTimeout(t);
  }, [code, problem.id]);

  const handleRun = useCallback(async () => {
    setStatus('running');
    setActivePanel('tests');
    attempts.current++;
    try {
      const res = await runTests(code, problem);
      setResults(res);
      const allPassed = res.every(r => r.status === 'pass');
      setStatus(allPassed ? 'passed' : 'failed');
      if (allPassed) onSolve(problem.id);
    } catch (e) {
      setResults([{ name: 'Runtime error', status: 'error', message: String(e) }]);
      setStatus('failed');
    }
  }, [code, problem, onSolve]);

  const handleReset = () => {
    setCode(problem.starterCode);
    saveCode(problem.id, problem.starterCode);
  };

  const passCount = results.filter(r => r.status === 'pass').length;

  // Tab bar for mobile
  const panelTabs = (
    <div className="psolve-tabs">
      {([
        { key: 'desc' as const, icon: <BookOpen size={16} />, label: 'Задача' },
        { key: 'editor' as const, icon: <Code2 size={16} />, label: 'Код' },
        { key: 'tests' as const, icon: <Terminal size={16} />, label: `Тесты${results.length > 0 ? ` (${passCount}/${results.length})` : ''}` },
      ]).map(tab => (
        <button
          key={tab.key}
          className={`psolve-tab ${activePanel === tab.key ? 'active' : ''} ${tab.key === 'tests' && status === 'passed' ? 'success' : ''} ${tab.key === 'tests' && status === 'failed' ? 'fail' : ''}`}
          onClick={() => setActivePanel(tab.key)}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );

  return (
    <div className="psolve">
      {/* Top bar */}
      <div className="psolve-topbar">
        <button className="psolve-back" onClick={onBack}>
          <ChevronLeft size={20} />
          <span>Назад</span>
        </button>
        <div className="psolve-topbar-info">
          <span className="psolve-topbar-num">#{problem.number}</span>
          <span className="psolve-topbar-diff" style={{ color: getDifficultyColor(problem.difficulty) }}>
            {getDifficultyLabel(problem.difficulty)}
          </span>
          {isSolved && <span className="psolve-topbar-solved">✅ Решено</span>}
        </div>
        <button
          className={`psolve-run-fab ${status === 'running' ? 'running' : ''} ${status === 'passed' ? 'success' : ''}`}
          onClick={handleRun}
          disabled={status === 'running'}
        >
          <Play size={16} />
          <span>{status === 'running' ? 'Запуск...' : 'Тесты'}</span>
        </button>
      </div>

      {/* Mobile tabs */}
      {isMobile && panelTabs}

      <div className="psolve-body">
        {/* ═══ Description panel ═══ */}
        <div className={`psolve-panel psolve-desc ${!isMobile || activePanel === 'desc' ? 'visible' : 'hidden'}`}>
          <div className="psolve-desc-inner">
            {/* Title */}
            <h2 className="psolve-title">{problem.title}</h2>
            <div className="psolve-meta-row">
              <span className="psolve-diff-badge" style={{ color: getDifficultyColor(problem.difficulty), background: getDifficultyColor(problem.difficulty) + '18' }}>
                {getDifficultyLabel(problem.difficulty)}
              </span>
              <span className="psolve-cat-badge">{getCategoryLabel(problem.category)}</span>
              {problem.tags.map(t => <span key={t} className="psolve-tag">{t}</span>)}
            </div>

            {/* Description */}
            <div className="psolve-desc-text">{problem.description}</div>

            {/* Examples */}
            {problem.examples.length > 0 && (
              <div className="psolve-section">
                <h4 className="psolve-section-title">💡 Примеры</h4>
                {problem.examples.map((ex, i) => (
                  <div key={i} className="psolve-example">
                    <div className="psolve-ex-row">
                      <span className="psolve-ex-label">Input</span>
                      <code>{ex.input}</code>
                    </div>
                    <div className="psolve-ex-row">
                      <span className="psolve-ex-label">Output</span>
                      <code>{ex.output}</code>
                    </div>
                    {ex.note && <div className="psolve-ex-note">{ex.note}</div>}
                  </div>
                ))}
              </div>
            )}

            {/* Hints */}
            <div className="psolve-section">
              <h4 className="psolve-section-title">🔑 Подсказки</h4>
              {problem.hints.slice(0, hintsShown).map((h, i) => (
                <div key={i} className="psolve-hint">
                  <Lightbulb size={15} className="psolve-hint-icon" />
                  <span>{h}</span>
                </div>
              ))}
              {hintsShown < problem.hints.length ? (
                <button className="psolve-hint-btn" onClick={() => setHintsShown(n => n + 1)}>
                  <Lightbulb size={15} />
                  Показать подсказку {hintsShown + 1} из {problem.hints.length}
                </button>
              ) : hintsShown > 0 ? (
                <div className="psolve-hint-done">✓ Все подсказки показаны</div>
              ) : null}
            </div>

            {/* Solution (after 3 attempts or solved) */}
            <div className="psolve-section">
              <h4 className="psolve-section-title">📖 Решение</h4>
              {showSolution || isSolved ? (
                <pre className="psolve-solution-code"><code>{problem.solution}</code></pre>
              ) : (
                <button
                  className="psolve-solution-btn"
                  onClick={() => {
                    if (attempts.current < 3) {
                      alert(`Решение откроется после 3 попыток запуска тестов.\nПопыток: ${attempts.current}/3`);
                      return;
                    }
                    setShowSolution(true);
                  }}
                >
                  <Eye size={15} />
                  {attempts.current < 3
                    ? `Нужно ${3 - attempts.current} попыток 🔒`
                    : 'Показать решение'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ═══ Right column: Editor + Tests ═══ */}
        <div className={`psolve-right-col ${!isMobile || activePanel !== 'desc' ? 'visible' : 'hidden'}`}>
          {/* Editor panel */}
          <div className={`psolve-editor ${!isMobile || activePanel === 'editor' ? 'visible' : 'hidden'}`}>
            {/* Toolbar */}
            <div className="psolve-editor-toolbar">
              <span className="psolve-editor-filename">
                <Code2 size={14} /> solution.ts
              </span>
              <div className="psolve-editor-actions">
                <button className="psolve-editor-btn" onClick={handleReset}>
                  <RotateCcw size={14} /> Сброс
                </button>
                {!isMobile && (
                  <button
                    className={`psolve-editor-run ${status === 'running' ? 'running' : ''} ${status === 'passed' ? 'success' : ''}`}
                    onClick={handleRun}
                    disabled={status === 'running'}
                  >
                    <Play size={14} />
                    {status === 'running' ? 'Запуск...' : '▶ Запустить тесты'}
                  </button>
                )}
              </div>
            </div>

            {/* Editor: native textarea on mobile, Monaco on desktop */}
            <div className="psolve-editor-area">
              {isMobile ? (
                <textarea
                  className="psolve-textarea"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  spellCheck={false}
                  autoCapitalize="off"
                  autoCorrect="off"
                  autoComplete="off"
                  data-gramm="false"
                />
              ) : (
                <Suspense fallback={
                  <div className="psolve-editor-loading">
                    <div className="psolve-spinner" />
                    <span>Загрузка редактора...</span>
                  </div>
                }>
                  <MonacoEditor
                    height="100%"
                    language="typescript"
                    theme="vs-dark"
                    value={code}
                    onChange={(val) => setCode(val || '')}
                    options={{
                      fontSize: 14,
                      fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                      minimap: { enabled: false },
                      lineNumbers: 'on',
                      roundedSelection: true,
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 2,
                      wordWrap: 'on',
                      padding: { top: 12, bottom: 12 },
                      cursorBlinking: 'smooth',
                      cursorSmoothCaretAnimation: 'on',
                      smoothScrolling: true,
                      bracketPairColorization: { enabled: true },
                      suggest: { showKeywords: true },
                      overviewRulerLanes: 0,
                      hideCursorInOverviewRuler: true,
                      scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
                      folding: false,
                      glyphMargin: false,
                    }}
                  />
                </Suspense>
              )}
            </div>
          </div>

          {/* Tests panel */}
          <div className={`psolve-tests ${!isMobile || activePanel === 'tests' ? 'visible' : 'hidden'}`}>
            <div className="psolve-tests-header">
              <Terminal size={16} />
              <span>Результаты</span>
              {status !== 'idle' && (
                <span className={`psolve-tests-badge ${status}`}>
                  {status === 'running' ? '⏳ Запуск...'
                    : status === 'passed' ? `✅ ${passCount}/${problem.testCases.length}`
                    : `❌ ${passCount}/${problem.testCases.length}`}
                </span>
              )}
            </div>

            <div className="psolve-tests-body">
              {status === 'idle' && (
                <div className="psolve-tests-empty">
                  <Play size={28} className="psolve-tests-empty-icon" />
                  <p className="psolve-tests-empty-title">Нажми «Тесты» для проверки</p>
                  <p className="psolve-tests-empty-sub">Напиши решение и запусти тесты</p>
                </div>
              )}

              {status === 'running' && (
                <div className="psolve-tests-empty">
                  <div className="psolve-spinner" />
                  <p className="psolve-tests-empty-title">Выполнение тестов...</p>
                </div>
              )}

              {(status === 'passed' || status === 'failed') && (
                <>
                  {results.map((r, i) => (
                    <div key={i} className={`psolve-test-row ${r.status}`}>
                      <span className="psolve-test-icon">{r.status === 'pass' ? '✅' : '❌'}</span>
                      <div className="psolve-test-info">
                        <span className="psolve-test-name">{r.name}</span>
                        {r.message && <span className="psolve-test-err">{r.message}</span>}
                      </div>
                      {r.duration !== undefined && (
                        <span className="psolve-test-time">{r.duration}ms</span>
                      )}
                    </div>
                  ))}

                  {status === 'passed' && (
                    <div className="psolve-success-banner">
                      <span className="psolve-success-emoji">🎉</span>
                      <span>Все тесты пройдены!</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile FAB for Run */}
      {isMobile && (
        <button
          className={`psolve-mobile-fab ${status === 'running' ? 'running' : ''} ${status === 'passed' ? 'success' : ''}`}
          onClick={handleRun}
          disabled={status === 'running'}
        >
          <Play size={22} />
        </button>
      )}
    </div>
  );
};

// ─── CSS ──────────────────────────────────────────────────────────
const practiceCSS = `
/* ====== ROOT ====== */
.pract {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--bg-primary);
  font-family: var(--font-primary, 'Inter', system-ui, sans-serif);
}

/* ====== LIST VIEW ====== */
.pract-list-view {
  flex: 1;
  overflow-y: auto;
  padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px));
}

/* Hero */
.pract-hero {
  position: relative;
  padding: 32px 32px 24px;
  background: linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.08) 50%, transparent 100%);
  border-bottom: 1px solid var(--border-color);
  overflow: hidden;
}
.pract-hero-glow {
  position: absolute;
  top: -60px; right: -40px;
  width: 200px; height: 200px;
  background: radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%);
  pointer-events: none;
}
.pract-hero-content {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  position: relative;
  z-index: 1;
}
.pract-hero-icon-wrap {
  width: 52px; height: 52px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  color: white;
  box-shadow: 0 4px 20px rgba(99,102,241,0.35);
}
.pract-hero-title {
  font-size: 26px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.5px;
}
.pract-hero-sub {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 4px 0 0;
}

.pract-hero-progress { position: relative; z-index: 1; }
.pract-hero-stats {
  display: flex;
  gap: 24px;
  margin-bottom: 10px;
}
.pract-stat { display: flex; flex-direction: column; align-items: center; }
.pract-stat-num {
  font-size: 24px;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1;
}
.pract-stat-label {
  font-size: 11px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
  margin-top: 2px;
}
.pract-progress-track {
  height: 6px;
  background: var(--border-color);
  border-radius: 99px;
  overflow: hidden;
}
.pract-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #a78bfa);
  border-radius: 99px;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Controls */
.pract-controls {
  padding: 16px 32px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-bottom: 1px solid var(--border-color);
}
.pract-search {
  display: flex; align-items: center; gap: 10px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 12px 16px;
  transition: border-color 0.2s;
}
.pract-search:focus-within { border-color: var(--color-accent); }
.pract-search-icon { color: var(--text-muted); flex-shrink: 0; }
.pract-search-input {
  background: none; border: none; outline: none; width: 100%;
  color: var(--text-primary); font-size: 15px;
}
.pract-search-input::placeholder { color: var(--text-muted); }
.pract-search-clear {
  background: none; border: none; color: var(--text-muted); cursor: pointer;
  padding: 4px; display: flex;
}

.pract-filter-row {
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
}
.pract-pills { display: flex; gap: 6px; flex-wrap: wrap; flex: 1; }
.pract-pill {
  padding: 7px 14px;
  border-radius: 99px;
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.pract-pill.active {
  background: rgba(99,102,241,0.15);
  border-color: rgba(99,102,241,0.4);
  color: var(--color-accent);
}

.pract-cat-sel {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 600;
  outline: none;
  cursor: pointer;
  min-width: 120px;
}

/* Card grid */
.pract-card-grid {
  padding: 20px 32px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
}

.pract-card {
  position: relative;
  display: flex;
  flex-direction: column;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 18px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
  overflow: hidden;
}
.pract-card:hover {
  border-color: rgba(99,102,241,0.4);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}
.pract-card.done {
  border-color: rgba(34,197,94,0.25);
}
.pract-card.done::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(34,197,94,0.04) 0%, transparent 50%);
  pointer-events: none;
}

.pract-card-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}
.pract-card-num {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-muted);
}
.pract-card-diff {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 99px;
}
.pract-card-check { color: #22c55e; margin-left: auto; }
.pract-card-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 10px;
  line-height: 1.35;
}
.pract-card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 12px;
}
.pract-card-tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 99px;
  background: rgba(99,102,241,0.08);
  color: #818cf8;
  font-weight: 600;
}
.pract-card-bottom {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: auto;
}
.pract-card-cat {
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 600;
}
.pract-card-tests {
  font-size: 11px;
  color: var(--text-muted);
  margin-left: auto;
}
.pract-card-arrow {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  opacity: 0;
  transition: opacity 0.2s;
}
.pract-card:hover .pract-card-arrow { opacity: 1; }

.pract-empty {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 64px 20px; color: var(--text-muted); gap: 12px;
}

/* ====== SOLVE VIEW ====== */
.psolve {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--bg-primary);
}

.psolve-topbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 20px;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
  min-height: 48px;
}
.psolve-back {
  display: flex; align-items: center; gap: 4px;
  background: none; border: none; color: var(--text-secondary);
  cursor: pointer; font-size: 14px; font-weight: 600;
  padding: 6px 10px; border-radius: 8px;
  transition: all 0.15s;
}
.psolve-back:hover { color: var(--text-primary); background: var(--bg-card-hover); }
.psolve-topbar-info {
  display: flex; align-items: center; gap: 8px; flex: 1;
}
.psolve-topbar-num { font-size: 13px; color: var(--text-muted); font-weight: 700; }
.psolve-topbar-diff { font-size: 12px; font-weight: 700; }
.psolve-topbar-solved { font-size: 12px; font-weight: 600; }

.psolve-run-fab {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 18px;
  background: linear-gradient(135deg, #6366f1, #7c3aed);
  border: none; border-radius: 10px;
  color: white; font-size: 13px; font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(99,102,241,0.35);
  transition: all 0.2s;
}
.psolve-run-fab:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(99,102,241,0.45); }
.psolve-run-fab.running { background: #555; box-shadow: none; cursor: wait; }
.psolve-run-fab.success { background: linear-gradient(135deg, #16a34a, #22c55e); box-shadow: 0 4px 14px rgba(34,197,94,0.35); }
.psolve-run-fab:disabled { opacity: 0.7; }

/* Mobile tabs */
.psolve-tabs {
  display: none;
  padding: 8px 12px;
  gap: 6px;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}
.psolve-tab {
  flex: 1;
  display: flex; align-items: center; justify-content: center; gap: 6px;
  padding: 10px 8px;
  border-radius: 10px;
  border: 1.5px solid var(--border-color);
  background: transparent;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.psolve-tab.active { background: rgba(99,102,241,0.12); color: var(--color-accent); border-color: rgba(99,102,241,0.4); }
.psolve-tab.success { background: rgba(34,197,94,0.1); color: #22c55e; border-color: rgba(34,197,94,0.4); }
.psolve-tab.fail { background: rgba(239,68,68,0.08); color: #ef4444; border-color: rgba(239,68,68,0.3); }

/* Body: 3 panels side by side on desktop */
.psolve-body {
  flex: 1;
  display: flex;
  overflow: hidden;
  min-height: 0;
}
.psolve-panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.psolve-panel.hidden { display: none; }
.psolve-panel.visible { display: flex; }

/* Description panel */
.psolve-desc {
  width: 380px;
  min-width: 280px;
  border-right: 1px solid var(--border-color);
  overflow: hidden;
}
.psolve-desc-inner {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  -webkit-overflow-scrolling: touch;
}
.psolve-title {
  font-size: 20px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 12px;
  line-height: 1.3;
  letter-spacing: -0.3px;
}
.psolve-meta-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 20px;
}
.psolve-diff-badge {
  font-size: 12px; font-weight: 700;
  padding: 3px 12px; border-radius: 99px;
}
.psolve-cat-badge {
  font-size: 11px;
  color: var(--text-muted);
  background: var(--bg-primary);
  padding: 3px 10px;
  border-radius: 99px;
  border: 1px solid var(--border-color);
  font-weight: 600;
}
.psolve-tag {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 99px;
  background: rgba(99,102,241,0.08);
  color: #818cf8;
  font-weight: 600;
}
.psolve-desc-text {
  font-size: 15px;
  line-height: 1.75;
  color: var(--text-secondary);
  white-space: pre-wrap;
  word-break: break-word;
}

.psolve-section { margin-top: 24px; }
.psolve-section-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 10px;
}

.psolve-example {
  background: rgba(99,102,241,0.04);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 8px;
}
.psolve-ex-row {
  display: flex; gap: 10px; align-items: baseline; margin-bottom: 6px;
  font-size: 13px;
}
.psolve-ex-label {
  font-weight: 700; color: var(--text-muted);
  min-width: 50px; flex-shrink: 0;
  font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;
}
.psolve-ex-row code {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  color: var(--text-primary);
  font-size: 12px;
  word-break: break-word;
}
.psolve-ex-note { font-size: 12px; color: var(--text-muted); margin-top: 4px; font-style: italic; }

.psolve-hint {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 10px 14px;
  background: rgba(245,158,11,0.06);
  border: 1px solid rgba(245,158,11,0.15);
  border-radius: 10px;
  margin-bottom: 6px;
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
}
.psolve-hint-icon { color: #f59e0b; flex-shrink: 0; margin-top: 2px; }
.psolve-hint-btn {
  display: flex; align-items: center; gap: 8px; justify-content: center;
  padding: 10px 16px;
  background: rgba(245,158,11,0.08);
  border: 1px solid rgba(245,158,11,0.2);
  border-radius: 10px;
  color: #f59e0b;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  transition: all 0.15s;
}
.psolve-hint-btn:hover { background: rgba(245,158,11,0.15); }
.psolve-hint-done { font-size: 12px; color: var(--text-muted); text-align: center; padding: 6px; }

.psolve-solution-code {
  background: #0d1117;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  padding: 18px;
  overflow-x: auto;
  font-size: 13px;
  line-height: 1.65;
  color: #e6edf3;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  white-space: pre;
  margin: 0;
}
.psolve-solution-btn {
  display: flex; align-items: center; gap: 8px; justify-content: center;
  padding: 10px 16px;
  background: rgba(99,102,241,0.06);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  transition: all 0.15s;
}
.psolve-solution-btn:hover { background: rgba(99,102,241,0.12); color: var(--text-secondary); }

/* Right column: editor + tests stacked */
.psolve-right-col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.psolve-right-col.hidden { display: none; }
.psolve-right-col.visible { display: flex; }

/* Editor panel */
.psolve-editor {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.psolve-editor-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: #1a1b2e;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  flex-shrink: 0;
}
.psolve-editor-filename {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; color: #666; font-family: monospace;
}
.psolve-editor-actions { display: flex; gap: 8px; }
.psolve-editor-btn {
  display: flex; align-items: center; gap: 5px;
  padding: 6px 12px;
  background: transparent; border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  color: #888; font-size: 12px; font-weight: 600; cursor: pointer;
  transition: all 0.15s;
}
.psolve-editor-btn:hover { background: rgba(255,255,255,0.06); color: #ccc; }
.psolve-editor-run {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 18px;
  background: linear-gradient(135deg, #6366f1, #7c3aed);
  border: none; border-radius: 8px;
  color: white; font-size: 12px; font-weight: 700; cursor: pointer;
  box-shadow: 0 2px 12px rgba(99,102,241,0.3);
  transition: all 0.2s;
}
.psolve-editor-run:hover:not(:disabled) { transform: translateY(-1px); }
.psolve-editor-run.running { background: #555; box-shadow: none; }
.psolve-editor-run.success { background: linear-gradient(135deg, #16a34a, #22c55e); }
.psolve-editor-run:disabled { opacity: 0.7; }

.psolve-editor-area { flex: 1; min-height: 0; overflow: hidden; background: #1e1e2e; }

.psolve-editor-loading {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  height: 100%; gap: 14px; background: #1e1e2e; color: #666; font-size: 13px;
}

/* Tests panel */
.psolve-tests {
  border-top: 1px solid var(--border-color);
  min-height: 160px;
  max-height: 220px;
  flex-shrink: 0;
}
.psolve-tests-header {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 16px;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-color);
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  flex-shrink: 0;
}
.psolve-tests-badge {
  margin-left: auto;
  font-size: 12px;
  font-weight: 700;
  padding: 3px 12px;
  border-radius: 99px;
}
.psolve-tests-badge.passed { background: rgba(34,197,94,0.12); color: #22c55e; }
.psolve-tests-badge.failed { background: rgba(239,68,68,0.12); color: #ef4444; }
.psolve-tests-badge.running { background: rgba(245,158,11,0.12); color: #f59e0b; }

.psolve-tests-body { flex: 1; overflow-y: auto; }

.psolve-tests-empty {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  height: 100%; gap: 8px; padding: 24px; text-align: center;
}
.psolve-tests-empty-icon { color: var(--text-muted); opacity: 0.35; }
.psolve-tests-empty-title { font-size: 14px; font-weight: 600; color: var(--text-secondary); margin: 0; }
.psolve-tests-empty-sub { font-size: 12px; color: var(--text-muted); margin: 0; }

.psolve-test-row {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  transition: background 0.15s;
}
.psolve-test-row.pass { background: rgba(34,197,94,0.03); }
.psolve-test-row.fail, .psolve-test-row.error { background: rgba(239,68,68,0.03); }
.psolve-test-icon { font-size: 14px; flex-shrink: 0; margin-top: 1px; }
.psolve-test-info { flex: 1; min-width: 0; }
.psolve-test-name { font-size: 14px; font-weight: 500; color: var(--text-primary); display: block; }
.psolve-test-err {
  font-size: 12px; color: #ef4444; font-family: monospace;
  display: block; margin-top: 4px; word-break: break-word; line-height: 1.5;
}
.psolve-test-time { font-size: 11px; color: var(--text-muted); flex-shrink: 0; }

.psolve-success-banner {
  display: flex; align-items: center; justify-content: center; gap: 10px;
  margin: 12px 16px; padding: 14px;
  background: linear-gradient(135deg, rgba(34,197,94,0.1) 0%, rgba(34,197,94,0.06) 100%);
  border: 1px solid rgba(34,197,94,0.25);
  border-radius: 12px;
  color: #22c55e;
  font-size: 15px;
  font-weight: 700;
}
.psolve-success-emoji { font-size: 22px; }

/* Spinner */
.psolve-spinner {
  width: 28px; height: 28px;
  border: 3px solid rgba(255,255,255,0.1);
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: psolve-spin 0.7s linear infinite;
}
@keyframes psolve-spin { to { transform: rotate(360deg); } }

/* Mobile FAB */
.psolve-mobile-fab {
  position: fixed;
  right: 20px;
  bottom: calc(88px + env(safe-area-inset-bottom, 0px));
  width: 56px; height: 56px;
  background: linear-gradient(135deg, #6366f1, #7c3aed);
  border: none;
  border-radius: 50%;
  color: white;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  box-shadow: 0 6px 24px rgba(99,102,241,0.45);
  z-index: 50;
  transition: all 0.2s;
}
.psolve-mobile-fab:active { transform: scale(0.92); }
.psolve-mobile-fab.running { background: #555; box-shadow: none; }
.psolve-mobile-fab.success { background: linear-gradient(135deg, #16a34a, #22c55e); box-shadow: 0 6px 24px rgba(34,197,94,0.45); }

/* ====== MOBILE ====== */
@media (max-width: 768px) {
  .pract-hero {
    padding: 20px 16px 16px;
  }
  .pract-hero-title { font-size: 22px; }
  .pract-hero-stats { gap: 16px; }
  .pract-stat-num { font-size: 20px; }
  .pract-controls { padding: 12px 16px; }
  .pract-pills { gap: 4px; }
  .pract-pill { padding: 6px 10px; font-size: 12px; }
  .pract-card-grid {
    padding: 12px 16px;
    grid-template-columns: 1fr;
    gap: 10px;
  }
  .pract-card { padding: 16px; }
  .pract-card-title { font-size: 15px; }

  /* Solve view: FULLSCREEN panels on mobile */
  .psolve-topbar {
    padding: 8px 12px;
  }
  .psolve-run-fab { display: none; }
  .psolve-tabs { display: flex; }

  .psolve-body {
    flex: 1;
    position: relative;
    overflow: hidden;
  }

  .psolve-desc {
    position: absolute;
    inset: 0;
    width: 100%;
    border-right: none;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    z-index: 1;
  }
  .psolve-desc.hidden { display: none; }
  .psolve-desc-inner { padding: 20px 16px 100px; }
  .psolve-title { font-size: 20px; }
  .psolve-desc-text { font-size: 15px; line-height: 1.7; }

  .psolve-right-col {
    position: absolute;
    inset: 0;
    width: 100%;
    z-index: 1;
  }
  .psolve-right-col.hidden { display: none !important; }

  .psolve-editor {
    position: absolute;
    inset: 0;
    z-index: 1;
  }
  .psolve-editor.hidden { display: none !important; }
  .psolve-editor-area {
    flex: 1;
    min-height: 0;
  }
  .psolve-editor-toolbar { padding: 8px 12px; }

  .psolve-textarea {
    width: 100%;
    height: 100%;
    display: block;
    background: #0d1117;
    color: #e6edf3;
    border: none;
    padding: 16px;
    font-family: 'JetBrains Mono', 'Fira Code', 'SF Mono', 'Cascadia Code', ui-monospace, monospace;
    font-size: 15px;
    line-height: 1.7;
    resize: none;
    outline: none;
    -webkit-text-size-adjust: 100%;
    tab-size: 2;
    caret-color: #6366f1;
    letter-spacing: 0.02em;
    box-sizing: border-box;
    -webkit-overflow-scrolling: touch;
  }
  .psolve-textarea::placeholder { color: #444; }
  .psolve-textarea:focus {
    outline: none;
  }

  .psolve-tests {
    position: absolute;
    inset: 0;
    z-index: 1;
    max-height: none;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
  .psolve-tests.hidden { display: none !important; }
  .psolve-tests-body {
    padding-bottom: 100px;
  }
}

@media (max-width: 480px) {
  .pract-hero-title { font-size: 20px; }
  .pract-hero-sub { font-size: 12px; }
  .pract-hero-icon-wrap { width: 44px; height: 44px; border-radius: 12px; }
  .pract-card-grid { padding: 10px 12px; }
  .pract-card { padding: 14px; border-radius: 12px; }
  .pract-card-title { font-size: 14px; }
}

/* ====== DESKTOP ====== */
@media (min-width: 769px) {
  .psolve-tabs { display: none !important; }

  .psolve-body {
    flex-direction: row;
  }

  .psolve-desc { display: flex; }
  .psolve-right-col { display: flex !important; }
  .psolve-editor { display: flex !important; }
  .psolve-tests { display: flex !important; }
}
`;
