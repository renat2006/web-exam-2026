import React, { useState, useCallback, useRef, useEffect, Suspense } from 'react';
import { PROBLEMS, getDifficultyColor, getDifficultyLabel, getCategoryLabel } from '../model/problems';
import type { Problem, Difficulty, Category } from '../model/problems';
import { CheckCircle, Circle, Search, ChevronRight, Play, Lightbulb, BookOpen, RotateCcw, Terminal, Code2, Filter, Trophy } from 'lucide-react';

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
const getSolved = (): Set<string> => {
  try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')); }
  catch { return new Set(); }
};
const saveSolved = (set: Set<string>) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
};

// ─── Test Runner ───────────────────────────────────────────────────
async function runTests(code: string, problem: Problem): Promise<TestResult[]> {
  const results: TestResult[] = [];

  for (const tc of problem.testCases) {
    const start = performance.now();
    try {
      // Strip TypeScript annotations for runtime evaluation
      const jsCode = code
        .replace(/:\s*\w+(\[\])?(\s*\|\s*\w+(\[\])?)*(?=\s*[,)=;{])/g, '')  // param types
        .replace(/<[^>]+>/g, '')   // generic brackets
        .replace(/:\s*\w+\s*{/g, ' {')  // return type before brace
        .replace(/^type\s+\w+.+$/gm, '')  // type aliases
        .replace(/^interface\s+\w[\s\S]*?^}/gm, ''); // interfaces

      const exportedName = problem.starterCode
        .match(/(?:function|class|type|const)\s+(\w+)/)?.[1] || 'userFn';

      // Build evaluator: extract the user's main export
      const wrappedCode = `
        ${jsCode}
        const __exported__ = (typeof ${exportedName} !== 'undefined') ? ${exportedName} : undefined;
        __exported__;
      `;

      let userFn: unknown;
      try {
        userFn = new Function(wrappedCode)();
      } catch {
        // For type aliases and interfaces, provide a mock object
        userFn = {};
      }

      // Build async test runner
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

// ─── ProblemList component ────────────────────────────────────────
interface ProblemListProps {
  problems: Problem[];
  solved: Set<string>;
  selected: Problem | null;
  onSelect: (p: Problem) => void;
}
const ProblemList: React.FC<ProblemListProps> = ({ problems, solved, selected, onSelect }) => {
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

  return (
    <div className="practice-list">
      {/* Progress header */}
      <div className="practice-list-header">
        <div className="practice-progress-bar-wrap">
          <div className="practice-progress-label">
            <Trophy size={14} />
            <span>{solvedCount} / {problems.length} solved</span>
          </div>
          <div className="practice-progress-track">
            <div className="practice-progress-fill" style={{ width: `${(solvedCount / problems.length) * 100}%` }} />
          </div>
        </div>

        {/* Search */}
        <div className="practice-search-wrap">
          <Search size={14} className="practice-search-icon" />
          <input
            className="practice-search-input"
            placeholder="Поиск задач..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="practice-filters">
          <div className="practice-filter-group">
            <Filter size={12} />
            {(['all', 'easy', 'medium', 'hard'] as const).map(d => (
              <button
                key={d}
                className={`practice-filter-btn ${filterDiff === d ? 'active' : ''}`}
                onClick={() => setFilterDiff(d)}
                style={d !== 'all' ? { color: filterDiff === d ? getDifficultyColor(d) : undefined } : undefined}
              >
                {d === 'all' ? 'Все' : getDifficultyLabel(d)}
              </button>
            ))}
          </div>
          <select
            className="practice-cat-select"
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

      {/* Problem rows */}
      <div className="practice-problem-rows">
        {filtered.map(p => {
          const isSolved = solved.has(p.id);
          const isActive = selected?.id === p.id;
          return (
            <button
              key={p.id}
              className={`practice-problem-row ${isActive ? 'active' : ''} ${isSolved ? 'solved' : ''}`}
              onClick={() => onSelect(p)}
            >
              <span className="prow-number">#{p.number}</span>
              <span className="prow-status">
                {isSolved
                  ? <CheckCircle size={14} className="icon-solved" />
                  : <Circle size={14} className="icon-unsolved" />
                }
              </span>
              <span className="prow-title">{p.title}</span>
              <span className="prow-diff" style={{ color: getDifficultyColor(p.difficulty) }}>
                {getDifficultyLabel(p.difficulty)}
              </span>
              <ChevronRight size={14} className="prow-arrow" />
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="practice-empty">Задачи не найдены</div>
        )}
      </div>
    </div>
  );
};

// ─── CodePanel component ──────────────────────────────────────────
interface CodePanelProps {
  problem: Problem;
  solved: Set<string>;
  onSolve: (id: string) => void;
}
const CodePanel: React.FC<CodePanelProps> = ({ problem, solved, onSolve }) => {
  const [code, setCode] = useState(problem.starterCode);
  const [status, setStatus] = useState<TestStatus>('idle');
  const [results, setResults] = useState<TestResult[]>([]);
  const [hintsShown, setHintsShown] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [activeTab, setActiveTab] = useState<'problem' | 'solution'>('problem');
  const [mobilePanel, setMobilePanel] = useState<'desc' | 'editor' | 'tests'>('desc');
  const attempts = useRef(0);
  const isSolved = solved.has(problem.id);

  // Reset when problem changes
  useEffect(() => {
    setCode(problem.starterCode);
    setStatus('idle');
    setResults([]);
    setHintsShown(0);
    setShowSolution(false);
    setActiveTab('problem');
    attempts.current = 0;
  }, [problem.id]);

  const handleRun = useCallback(async () => {
    setStatus('running');
    attempts.current++;
    try {
      const res = await runTests(code, problem);
      setResults(res);
      const allPassed = res.every(r => r.status === 'pass');
      setStatus(allPassed ? 'passed' : 'failed');
      if (allPassed) onSolve(problem.id);
    } catch(e) {
      setResults([{ name: 'Runtime error', status: 'error', message: String(e) }]);
      setStatus('failed');
    }
  }, [code, problem, onSolve]);

  const passCount = results.filter(r => r.status === 'pass').length;

  return (
    <div className="practice-code-panel">
      {/* Mobile tab switcher */}
      <div className="practice-mobile-tabs">
        {(['desc', 'editor', 'tests'] as const).map(t => (
          <button key={t} className={`pmtab ${mobilePanel === t ? 'active' : ''}`} onClick={() => setMobilePanel(t)}>
            {t === 'desc' ? '📋 Задача' : t === 'editor' ? '💻 Редактор' : '🧪 Тесты'}
          </button>
        ))}
      </div>

      <div className="practice-split">
        {/* ── Left: Problem Description ── */}
        <div className={`practice-desc-pane ${mobilePanel !== 'desc' ? 'mobile-hidden' : ''}`}>
          {/* Problem header */}
          <div className="pdesc-header">
            <div className="pdesc-meta">
              <span className="pdesc-num">#{problem.number}</span>
              <span className="pdesc-diff" style={{ color: getDifficultyColor(problem.difficulty), background: getDifficultyColor(problem.difficulty) + '22' }}>
                {getDifficultyLabel(problem.difficulty)}
              </span>
              <span className="pdesc-cat">{getCategoryLabel(problem.category)}</span>
            </div>
            <h2 className="pdesc-title">{problem.title}</h2>
            <div className="pdesc-tags">
              {problem.tags.map(tag => <span key={tag} className="pdesc-tag">{tag}</span>)}
            </div>
          </div>

          {/* Tabs: Problem / Solution */}
          <div className="pdesc-tabs">
            <button className={`pdesc-tab ${activeTab === 'problem' ? 'active' : ''}`} onClick={() => setActiveTab('problem')}>
              <BookOpen size={14} /> Описание
            </button>
            <button
              className={`pdesc-tab ${activeTab === 'solution' ? 'active' : ''} ${!showSolution && !isSolved ? 'locked' : ''}`}
              onClick={() => {
                if (!showSolution && !isSolved && attempts.current < 3) {
                  alert(`Решение откроется после 3 попыток. Попыток: ${attempts.current}/3`);
                  return;
                }
                setShowSolution(true);
                setActiveTab('solution');
              }}
            >
              <Code2 size={14} /> Решение {!showSolution && !isSolved && attempts.current < 3 ? `(🔒 ${attempts.current}/3)` : ''}
            </button>
          </div>

          <div className="pdesc-body">
            {activeTab === 'problem' ? (
              <>
                <p className="pdesc-description">{problem.description}</p>

                {/* Examples */}
                {problem.examples.length > 0 && (
                  <div className="pdesc-section">
                    <h4 className="pdesc-section-title">Примеры</h4>
                    {problem.examples.map((ex, i) => (
                      <div key={i} className="pdesc-example">
                        <div className="pex-row"><span className="pex-label">Input:</span><code className="pex-code">{ex.input}</code></div>
                        <div className="pex-row"><span className="pex-label">Output:</span><code className="pex-code">{ex.output}</code></div>
                        {ex.note && <div className="pex-note">{ex.note}</div>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Hints */}
                {problem.hints.length > 0 && (
                  <div className="pdesc-section">
                    <h4 className="pdesc-section-title">Подсказки</h4>
                    {problem.hints.slice(0, hintsShown).map((h, i) => (
                      <div key={i} className="pdesc-hint">
                        <Lightbulb size={13} className="hint-icon" />
                        <span>{h}</span>
                      </div>
                    ))}
                    {hintsShown < problem.hints.length && (
                      <button className="btn-hint" onClick={() => setHintsShown(n => n + 1)}>
                        <Lightbulb size={13} /> Показать подсказку {hintsShown + 1}/{problem.hints.length}
                      </button>
                    )}
                    {hintsShown >= problem.hints.length && hintsShown > 0 && (
                      <span className="hint-done">Все подсказки показаны</span>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="pdesc-section">
                <h4 className="pdesc-section-title">Эталонное решение</h4>
                <pre className="solution-code"><code>{problem.solution}</code></pre>
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Editor + Tests ── */}
        <div className={`practice-editor-pane ${mobilePanel === 'desc' ? 'mobile-hidden' : ''}`}>
          {/* Editor toolbar */}
          <div className={`peditor-toolbar ${mobilePanel === 'tests' ? 'mobile-hidden' : ''}`}>
            <span className="peditor-filename">solution.ts</span>
            <div className="peditor-actions">
              <button className="peditor-btn" onClick={() => setCode(problem.starterCode)} title="Сбросить">
                <RotateCcw size={14} /> Сброс
              </button>
              <button
                className={`peditor-run-btn ${status === 'running' ? 'running' : ''} ${status === 'passed' ? 'passed' : ''}`}
                onClick={handleRun}
                disabled={status === 'running'}
              >
                <Play size={14} />
                {status === 'running' ? 'Запуск...' : '▶ Запустить тесты'}
              </button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className={`peditor-monaco ${mobilePanel === 'tests' ? 'mobile-hidden' : ''}`}>
            <Suspense fallback={<div className="monaco-loading"><div className="monaco-loading-spinner" /><span>Загрузка редактора...</span></div>}>
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
                  padding: { top: 16, bottom: 16 },
                  cursorBlinking: 'smooth',
                  cursorSmoothCaretAnimation: 'on',
                  smoothScrolling: true,
                  bracketPairColorization: { enabled: true },
                  suggest: { showKeywords: true },
                }}
              />
            </Suspense>
          </div>

          {/* ── Test Results ── */}
          <div className={`ptest-panel ${mobilePanel === 'editor' ? 'mobile-hidden' : ''}`}>
            <div className="ptest-header">
              <Terminal size={14} />
              <span>Результаты тестов</span>
              {status !== 'idle' && (
                <span className={`ptest-badge ${status}`}>
                  {status === 'running' ? '⏳ Запуск...'
                    : status === 'passed' ? `✅ ${passCount}/${problem.testCases.length} passed`
                    : `❌ ${passCount}/${problem.testCases.length} passed`}
                </span>
              )}
              {isSolved && <span className="ptest-solved-badge">🏆 Решено!</span>}
            </div>

            <div className="ptest-results">
              {status === 'idle' && (
                <div className="ptest-idle">
                  <Play size={20} className="ptest-idle-icon" />
                  <p>Нажмите «Запустить тесты» для проверки</p>
                </div>
              )}
              {status === 'running' && (
                <div className="ptest-idle">
                  <div className="ptest-spinner" />
                  <p>Выполнение тестов...</p>
                </div>
              )}
              {(status === 'passed' || status === 'failed') && results.map((r, i) => (
                <div key={i} className={`ptest-result-row ${r.status}`}>
                  <span className="ptest-result-icon">
                    {r.status === 'pass' ? '✅' : '❌'}
                  </span>
                  <div className="ptest-result-info">
                    <span className="ptest-result-name">{r.name}</span>
                    {r.message && <span className="ptest-result-msg">{r.message}</span>}
                  </div>
                  {r.duration !== undefined && (
                    <span className="ptest-result-time">{r.duration}ms</span>
                  )}
                </div>
              ))}
              {status === 'passed' && (
                <div className="ptest-success-banner">
                  🎉 Все тесты пройдены! Задача решена.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main PracticePage ────────────────────────────────────────────
export const PracticePage: React.FC = () => {
  const [selected, setSelected] = useState<Problem | null>(PROBLEMS[0]);
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
    <div className="practice-page">
      <ProblemList
        problems={PROBLEMS}
        solved={solved}
        selected={selected}
        onSelect={setSelected}
      />
      {selected
        ? <CodePanel key={selected.id} problem={selected} solved={solved} onSolve={handleSolve} />
        : (
          <div className="practice-placeholder">
            <Code2 size={48} className="practice-placeholder-icon" />
            <h3>Выберите задачу</h3>
            <p>Выберите задачу из списка слева чтобы начать</p>
          </div>
        )
      }

      <style>{`
        .practice-page {
          display: flex;
          height: 100%;
          overflow: hidden;
          background: var(--bg-primary);
          font-family: var(--font-primary, 'Inter', sans-serif);
        }

        /* ── Problem List ── */
        .practice-list {
          width: 320px;
          min-width: 260px;
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: var(--bg-card);
        }

        .practice-list-header {
          padding: 16px;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .practice-progress-bar-wrap { display: flex; flex-direction: column; gap: 6px; }
        .practice-progress-label {
          display: flex; align-items: center; gap: 6px;
          font-size: 12px; font-weight: 600; color: var(--text-secondary);
        }
        .practice-progress-track {
          height: 4px; background: var(--border-color); border-radius: 99px; overflow: hidden;
        }
        .practice-progress-fill {
          height: 100%; background: linear-gradient(90deg, #6366f1, #8b5cf6);
          border-radius: 99px; transition: width 0.4s ease;
        }

        .practice-search-wrap {
          display: flex; align-items: center; gap: 8px;
          background: var(--bg-primary); border: 1px solid var(--border-color);
          border-radius: 8px; padding: 8px 12px;
        }
        .practice-search-icon { color: var(--text-muted); flex-shrink: 0; }
        .practice-search-input {
          background: none; border: none; outline: none; width: 100%;
          color: var(--text-primary); font-size: 13px;
        }

        .practice-filters { display: flex; flex-direction: column; gap: 8px; }
        .practice-filter-group {
          display: flex; align-items: center; gap: 4px; flex-wrap: wrap;
        }
        .practice-filter-btn {
          padding: 3px 10px; border-radius: 99px; border: 1px solid var(--border-color);
          background: transparent; color: var(--text-secondary); font-size: 11px; font-weight: 600;
          cursor: pointer; transition: all 0.15s;
        }
        .practice-filter-btn.active {
          background: rgba(99,102,241,0.15); border-color: var(--color-accent); color: var(--color-accent);
        }
        .practice-cat-select {
          background: var(--bg-primary); border: 1px solid var(--border-color);
          color: var(--text-secondary); border-radius: 8px; padding: 6px 10px; font-size: 12px;
          outline: none; cursor: pointer; width: 100%;
        }

        .practice-problem-rows {
          flex: 1; overflow-y: auto; padding: 8px 0;
        }
        .practice-problem-row {
          display: flex; align-items: center; gap: 8px; width: 100%;
          padding: 10px 16px; background: none; border: none; text-align: left;
          cursor: pointer; transition: background 0.15s; color: var(--text-primary);
        }
        .practice-problem-row:hover { background: var(--bg-card-hover); }
        .practice-problem-row.active { background: rgba(99,102,241,0.12); border-left: 3px solid var(--color-accent); }
        .practice-problem-row.solved .prow-title { color: var(--text-secondary); }

        .prow-number { font-size: 11px; color: var(--text-muted); width: 28px; flex-shrink: 0; }
        .prow-status { flex-shrink: 0; }
        .icon-solved { color: #22c55e; }
        .icon-unsolved { color: var(--text-muted); }
        .prow-title { flex: 1; font-size: 13px; font-weight: 500; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
        .prow-diff { font-size: 11px; font-weight: 700; flex-shrink: 0; }
        .prow-arrow { color: var(--text-muted); flex-shrink: 0; }
        .practice-empty { padding: 32px; text-align: center; color: var(--text-muted); font-size: 13px; }

        /* ── Code Panel ── */
        .practice-code-panel {
          flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0;
        }

        .practice-mobile-tabs {
          display: none;
          padding: 8px 12px; gap: 6px; background: var(--bg-card);
          border-bottom: 1px solid var(--border-color);
        }
        .pmtab {
          flex: 1; padding: 8px; border-radius: 8px; border: 1px solid var(--border-color);
          background: transparent; color: var(--text-secondary); font-size: 12px; font-weight: 600;
          cursor: pointer; transition: all 0.15s;
        }
        .pmtab.active { background: rgba(99,102,241,0.15); color: var(--color-accent); border-color: var(--color-accent); }

        .practice-split {
          flex: 1; display: flex; overflow: hidden; min-height: 0;
        }

        /* ── Description Pane ── */
        .practice-desc-pane {
          width: 380px; min-width: 300px; display: flex; flex-direction: column;
          border-right: 1px solid var(--border-color); overflow: hidden;
        }

        .pdesc-header {
          padding: 20px 20px 0; border-bottom: 1px solid var(--border-color); padding-bottom: 16px;
        }
        .pdesc-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
        .pdesc-num { font-size: 12px; color: var(--text-muted); font-weight: 700; }
        .pdesc-diff {
          font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 99px;
        }
        .pdesc-cat {
          font-size: 11px; color: var(--text-muted); background: var(--bg-primary);
          padding: 2px 8px; border-radius: 99px; border: 1px solid var(--border-color);
        }
        .pdesc-title { font-size: 16px; font-weight: 700; color: var(--text-primary); margin: 0 0 10px; }
        .pdesc-tags { display: flex; flex-wrap: wrap; gap: 4px; }
        .pdesc-tag {
          font-size: 10px; padding: 2px 7px; border-radius: 99px;
          background: rgba(99,102,241,0.1); color: #818cf8; font-weight: 600;
        }

        .pdesc-tabs {
          display: flex; border-bottom: 1px solid var(--border-color);
          padding: 0 20px; gap: 0; flex-shrink: 0;
        }
        .pdesc-tab {
          display: flex; align-items: center; gap: 6px; padding: 10px 0; margin-right: 20px;
          background: none; border: none; color: var(--text-muted); font-size: 13px; font-weight: 600;
          cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.15s;
        }
        .pdesc-tab.active { color: var(--color-accent); border-bottom-color: var(--color-accent); }
        .pdesc-tab.locked { opacity: 0.5; }

        .pdesc-body { flex: 1; overflow-y: auto; padding: 20px; }
        .pdesc-description { font-size: 14px; line-height: 1.7; color: var(--text-secondary); white-space: pre-wrap; }
        .pdesc-section { margin-top: 20px; }
        .pdesc-section-title { font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); font-weight: 700; margin-bottom: 10px; }

        .pdesc-example {
          background: var(--bg-primary); border: 1px solid var(--border-color);
          border-radius: 8px; padding: 12px; margin-bottom: 8px;
        }
        .pex-row { display: flex; gap: 8px; align-items: baseline; margin-bottom: 4px; font-size: 13px; }
        .pex-label { font-weight: 700; color: var(--text-muted); width: 50px; flex-shrink: 0; }
        .pex-code { font-family: monospace; color: var(--text-primary); font-size: 12px; }
        .pex-note { font-size: 11px; color: var(--text-muted); margin-top: 4px; font-style: italic; }

        .pdesc-hint {
          display: flex; align-items: flex-start; gap: 8px; padding: 8px 12px;
          background: rgba(99,102,241,0.08); border-radius: 8px; margin-bottom: 6px;
          font-size: 13px; color: var(--text-secondary); line-height: 1.5;
        }
        .hint-icon { color: #f59e0b; flex-shrink: 0; margin-top: 2px; }
        .btn-hint {
          display: flex; align-items: center; gap: 6px; padding: 8px 14px;
          background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.3);
          border-radius: 8px; color: #f59e0b; font-size: 12px; font-weight: 600;
          cursor: pointer; transition: all 0.15s; width: 100%; justify-content: center;
        }
        .btn-hint:hover { background: rgba(245,158,11,0.2); }
        .hint-done { font-size: 12px; color: var(--text-muted); }

        .solution-code {
          background: #0d1117; border: 1px solid var(--border-color); border-radius: 8px;
          padding: 16px; overflow-x: auto; font-size: 13px; line-height: 1.6;
          color: #e6edf3; font-family: 'JetBrains Mono', 'Fira Code', monospace; white-space: pre;
        }

        /* ── Editor Pane ── */
        .practice-editor-pane {
          flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0;
        }

        .peditor-toolbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 16px; background: #1e1e2e; border-bottom: 1px solid #30303a;
          flex-shrink: 0;
        }
        .peditor-filename { font-size: 12px; color: #888; font-family: monospace; }
        .peditor-actions { display: flex; gap: 8px; }
        .peditor-btn {
          display: flex; align-items: center; gap: 6px; padding: 6px 12px;
          background: transparent; border: 1px solid #444; border-radius: 6px;
          color: #aaa; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.15s;
        }
        .peditor-btn:hover { background: rgba(255,255,255,0.05); color: #fff; }
        .peditor-run-btn {
          display: flex; align-items: center; gap: 6px; padding: 6px 16px;
          background: #6366f1; border: none; border-radius: 6px;
          color: white; font-size: 12px; font-weight: 700; cursor: pointer;
          transition: all 0.15s; box-shadow: 0 0 12px rgba(99,102,241,0.3);
        }
        .peditor-run-btn:hover:not(:disabled) { background: #818cf8; transform: translateY(-1px); }
        .peditor-run-btn.running { background: #555; box-shadow: none; cursor: wait; }
        .peditor-run-btn.passed { background: #16a34a; box-shadow: 0 0 12px rgba(22,163,74,0.3); }
        .peditor-run-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .peditor-monaco {
          flex: 1; min-height: 0; overflow: hidden;
        }

        .monaco-loading {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          height: 100%; gap: 16px; background: #1e1e2e; color: #888; font-size: 14px;
        }
        .monaco-loading-spinner {
          width: 32px; height: 32px; border: 3px solid #333;
          border-top-color: #6366f1; border-radius: 50%; animation: spin 0.8s linear infinite;
        }

        /* ── Test Results ── */
        .ptest-panel {
          height: 200px; border-top: 1px solid var(--border-color); display: flex; flex-direction: column; flex-shrink: 0;
        }
        .ptest-header {
          display: flex; align-items: center; gap: 8px; padding: 10px 16px;
          background: var(--bg-card); border-bottom: 1px solid var(--border-color);
          font-size: 13px; font-weight: 600; color: var(--text-secondary); flex-shrink: 0;
        }
        .ptest-badge {
          margin-left: auto; font-size: 12px; font-weight: 700; padding: 2px 10px; border-radius: 99px;
        }
        .ptest-badge.passed { background: rgba(34,197,94,0.15); color: #22c55e; }
        .ptest-badge.failed { background: rgba(239,68,68,0.15); color: #ef4444; }
        .ptest-badge.running { background: rgba(245,158,11,0.15); color: #f59e0b; }
        .ptest-solved-badge { font-size: 12px; font-weight: 700; color: #f59e0b; }

        .ptest-results { flex: 1; overflow-y: auto; padding: 8px 0; }

        .ptest-idle {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          height: 100%; gap: 8px; color: var(--text-muted); font-size: 13px;
        }
        .ptest-idle-icon { color: var(--text-muted); opacity: 0.5; }
        .ptest-spinner {
          width: 24px; height: 24px; border: 2px solid var(--border-color);
          border-top-color: var(--color-accent); border-radius: 50%; animation: spin 0.7s linear infinite;
        }

        .ptest-result-row {
          display: flex; align-items: flex-start; gap: 10px; padding: 8px 16px;
          border-bottom: 1px solid var(--border-color);
        }
        .ptest-result-row.pass { background: rgba(34,197,94,0.04); }
        .ptest-result-row.fail, .ptest-result-row.error { background: rgba(239,68,68,0.04); }
        .ptest-result-icon { font-size: 14px; flex-shrink: 0; margin-top: 1px; }
        .ptest-result-info { flex: 1; min-width: 0; }
        .ptest-result-name { font-size: 13px; font-weight: 500; color: var(--text-primary); display: block; }
        .ptest-result-msg { font-size: 12px; color: #ef4444; font-family: monospace; display: block; margin-top: 2px; word-break: break-word; }
        .ptest-result-time { font-size: 11px; color: var(--text-muted); flex-shrink: 0; }

        .ptest-success-banner {
          margin: 8px 16px; padding: 10px 16px; background: rgba(34,197,94,0.1);
          border: 1px solid rgba(34,197,94,0.3); border-radius: 8px;
          color: #22c55e; font-size: 14px; font-weight: 700; text-align: center;
        }

        /* ── Placeholder ── */
        .practice-placeholder {
          flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 12px; color: var(--text-muted);
        }
        .practice-placeholder-icon { opacity: 0.3; }
        .practice-placeholder h3 { font-size: 18px; font-weight: 700; color: var(--text-secondary); margin: 0; }
        .practice-placeholder p { font-size: 14px; margin: 0; }

        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Mobile ── */
        @media (max-width: 768px) {
          .practice-page { flex-direction: column; }
          .practice-list {
            width: 100%; height: 220px; border-right: none; border-bottom: 1px solid var(--border-color);
          }
          .practice-list-header { padding: 10px 12px; gap: 8px; }
          .practice-mobile-tabs { display: flex; }
          .practice-split { flex-direction: column; }
          .practice-desc-pane { width: 100%; height: 100%; border-right: none; }
          .mobile-hidden { display: none !important; }
          .ptest-panel { height: 180px; }
        }

        @media (min-width: 769px) {
          .practice-mobile-tabs { display: none !important; }
          .mobile-hidden { display: flex !important; }
        }
      `}</style>
    </div>
  );
};
