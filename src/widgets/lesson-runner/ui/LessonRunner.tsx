import React, { useState, useEffect } from 'react';
import { X, ArrowRight, CheckCircle, XCircle, BookOpen, HelpCircle, ListOrdered, Code, Lightbulb, AlertTriangle, RefreshCw, ChevronRight, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Lesson, Slide } from '../../../entities/curriculum/model/types';
import { CodeSandbox } from '../../../features/run-tests/ui/CodeSandbox';
import { CodeBlock } from '../../../shared/ui/code-block/CodeBlock';
import { Mascot } from '../../../shared/ui/mascot/Mascot';
import type { MascotState } from '../../../shared/ui/mascot/Mascot';
import { vibrateSuccess, vibrateError, vibrateComplete, vibrateClick } from '../../../shared/lib/haptics/vibrate';
import { playSynthesizedSound } from '../../../shared/lib/audio/playAudio';

interface LessonRunnerProps {
  lesson: Lesson;
  onClose: () => void;
  onComplete: (xpEarned: number) => void;
  onLoseHeart: () => void;
  hearts: number;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  onMasterSlide?: (slideIndex: number) => void;
  isReviewMode?: boolean;
}

export const LessonRunner: React.FC<LessonRunnerProps> = ({
  lesson,
  onClose,
  onComplete,
  onLoseHeart,
  hearts,
  soundEnabled,
  vibrationEnabled,
  onMasterSlide,
  isReviewMode = false,
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [selectedBool, setSelectedBool] = useState<boolean | null>(null);
  
  // Reordering state for 'order' slide
  const [orderedItems, setOrderedItems] = useState<string[]>([]);
  
  // Code editor states
  const [codeSuccess, setCodeSuccess] = useState<boolean | null>(null);

  // Lesson progress tracking
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  
  // Mascot states
  const [mascotState, setMascotState] = useState<MascotState>('idle');
  const [mascotSpeech, setMascotSpeech] = useState<string>('Привет! Готовы потренироваться? Изучите теорию и нажмите кнопку внизу.');

  // Combo & bonus state
  const [comboCount, setComboCount] = useState(0);
  const [showComboPopup, setShowComboPopup] = useState<string | null>(null);
  const [showBonusXp, setShowBonusXp] = useState(false);
  const [feedbackEmoji, setFeedbackEmoji] = useState<{icon: string; show: boolean}>({icon: '', show: false});

  const CORRECT_MESSAGES = [
    'Отлично! Абсолютно верно!',
    'Так держать! Правильный ответ!',
    'Великолепно! Вы на верном пути!',
    'Верно! Продолжайте в том же духе!',
    'Точно в цель! Молодец!',
    'Супер! Всё правильно!',
    'Браво! Отличный ответ!',
  ];
  const WRONG_MESSAGES = [
    'Не совсем... Посмотрите объяснение.',
    'Ой, мимо! Ничего, разберёмся.',
    'Почти! Но не в этот раз.',
    'Неверно. Вот как правильно:',
    'Не угадали! Но это полезная ошибка.',
  ];
  const pickRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

  const currentSlide: Slide = lesson.slides[currentSlideIndex];
  const progressPercent = ((currentSlideIndex) / lesson.slides.length) * 100;

  const getSlideIndicatorInfo = () => {
    switch (currentSlide.type) {
      case 'theory':
        return {
          label: 'Теоретический раздел',
          icon: <BookOpen size={13} />,
          className: 'slide-indicator-theory'
        };
      case 'multiple-choice':
        return {
          label: 'Практическое задание: Выбор ответа',
          icon: <HelpCircle size={13} />,
          className: 'slide-indicator-practice'
        };
      case 'true-false':
        return {
          label: 'Практическое задание: Верно или Ложь',
          icon: <HelpCircle size={13} />,
          className: 'slide-indicator-practice'
        };
      case 'order':
        return {
          label: 'Практическое задание: Упорядочивание',
          icon: <ListOrdered size={13} />,
          className: 'slide-indicator-practice'
        };
      case 'coding':
        return {
          label: 'Практическое задание: Написание кода',
          icon: <Code size={13} />,
          className: 'slide-indicator-practice'
        };
      case 'find-the-bug':
        return {
          label: 'Практическое задание: Найди баг',
          icon: <HelpCircle size={13} />,
          className: 'slide-indicator-practice'
        };
      default:
        return {
          label: 'Практическое задание',
          icon: <Code size={13} />,
          className: 'slide-indicator-practice'
        };
    }
  };

  // Setup default state when slide changes
  useEffect(() => {
    setSelectedOption(null);
    setSelectedBool(null);
    setCodeSuccess(null);
    setIsAnswered(false);
    setIsCorrect(false);
    
    if (currentSlide.type === 'theory') {
      setMascotState('idle');
      setMascotSpeech('Внимательно прочитайте теорию. Особое внимание уделите подводным камням — на зачетах часто ловят именно на них!');
      setIsAnswered(true); // Can proceed instantly
      setIsCorrect(true);
    } else if (currentSlide.type === 'multiple-choice') {
      setMascotState('thinking');
      setMascotSpeech('Выберите один правильный вариант ответа.');
    } else if (currentSlide.type === 'true-false') {
      setMascotState('thinking');
      setMascotSpeech('Правда это или ложь? Подумайте над формулировкой.');
    } else if (currentSlide.type === 'order') {
      setMascotState('thinking');
      setMascotSpeech('Кликните по элементам ниже, чтобы расположить их в правильном порядке.');
      setOrderedItems([]);
    } else if (currentSlide.type === 'coding') {
      setMascotState('thinking');
      setMascotSpeech('Время лайвкодинга! Прочтите описание, напишите код и нажмите "Запустить тесты" для проверки.');
    } else if (currentSlide.type === 'find-the-bug') {
      setMascotState('thinking');
      setMascotSpeech('Найди баг! Изучи код с ошибкой и выбери правильное исправление.');
    }
  }, [currentSlideIndex, lesson]);

  useEffect(() => {
    if (showComboPopup) {
      const t = setTimeout(() => setShowComboPopup(null), 1500);
      return () => clearTimeout(t);
    }
  }, [showComboPopup]);

  useEffect(() => {
    if (feedbackEmoji.show) {
      const t = setTimeout(() => setFeedbackEmoji(p => ({...p, show: false})), 1200);
      return () => clearTimeout(t);
    }
  }, [feedbackEmoji.show]);

  useEffect(() => {
    if (showBonusXp) {
      const t = setTimeout(() => setShowBonusXp(false), 1500);
      return () => clearTimeout(t);
    }
  }, [showBonusXp]);

  // Handle reordering clicks
  const handleOrderClick = (itemId: string) => {
    if (isAnswered) return;
    vibrateClick(vibrationEnabled);
    if (orderedItems.includes(itemId)) {
      setOrderedItems(prev => prev.filter(id => id !== itemId));
    } else {
      setOrderedItems(prev => [...prev, itemId]);
    }
  };

  const handleCheckAnswer = () => {
    if (isAnswered && currentSlide.type !== 'coding') return;
    
    let correct = false;
    let feedback = '';

    if (currentSlide.type === 'multiple-choice') {
      if (selectedOption === null) return;
      correct = selectedOption === currentSlide.correctIndex;
      feedback = currentSlide.explanation;
    } else if (currentSlide.type === 'true-false') {
      if (selectedBool === null) return;
      correct = selectedBool === currentSlide.correctValue;
      feedback = currentSlide.explanation;
    } else if (currentSlide.type === 'order') {
      if (orderedItems.length !== currentSlide.items.length) {
        alert('Пожалуйста, выберите все элементы, чтобы упорядочить их.');
        return;
      }
      correct = orderedItems.every((val, index) => val === currentSlide.correctOrder[index]);
      feedback = currentSlide.explanation;
    } else if (currentSlide.type === 'find-the-bug') {
      if (selectedOption === null) return;
      correct = selectedOption === currentSlide.correctIndex;
      feedback = currentSlide.explanation;
    }

    setIsAnswered(true);
    setIsCorrect(correct);

    if (correct) {
      setMascotState('success');
      setMascotSpeech(pickRandom(CORRECT_MESSAGES));
      playSynthesizedSound('correct', soundEnabled);
      vibrateSuccess(vibrationEnabled);
      setFeedbackEmoji({icon: '✓', show: true});
      // Mini sparkle burst
      confetti({
        particleCount: 25,
        spread: 45,
        startVelocity: 20,
        gravity: 0.8,
        scalar: 0.7,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#6ee7b7'],
        disableForReducedMotion: true,
      });
      const newCombo = comboCount + 1;
      setComboCount(newCombo);
      if (newCombo === 3) setShowComboPopup('Combo x3!');
      else if (newCombo === 5) setShowComboPopup('На огне!');
      else if (newCombo === 7) setShowComboPopup('Невероятно!');
      else if (newCombo > 7 && newCombo % 3 === 0) setShowComboPopup(`Combo x${newCombo}!`);
      if (Math.random() < 0.15) setShowBonusXp(true);
    } else {
      setMascotState('error');
      setMascotSpeech(`${pickRandom(WRONG_MESSAGES)} ${feedback}`);
      playSynthesizedSound('incorrect', soundEnabled);
      vibrateError(vibrationEnabled);
      setFeedbackEmoji({icon: '✗', show: true});
      onLoseHeart();
      setComboCount(0);
    }
  };

  const handleNextSlide = () => {
    // In review mode, never force-close
    // In normal mode, also don't force-close anymore (review mode handles it)

    if (onMasterSlide && isCorrect) {
      onMasterSlide(currentSlideIndex);
    }

    if (currentSlideIndex + 1 < lesson.slides.length) {
      setCurrentSlideIndex(prev => prev + 1);
    } else {
      playSynthesizedSound('complete', soundEnabled);
      vibrateComplete(vibrationEnabled);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 }
      });
      const comboMultiplier = comboCount >= 7 ? 3 : comboCount >= 5 ? 2 : comboCount >= 3 ? 1.5 : 1;
      onComplete(Math.round((lesson.xpReward || 30) * comboMultiplier));
    }
  };

  const handleCodeSuccess = () => {
    setCodeSuccess(true);
    setIsAnswered(true);
    setIsCorrect(true);
    setMascotState('success');
    setMascotSpeech('Потрясающе! Ваш код прошел все автоматические тесты! Прекрасная работа.');
    playSynthesizedSound('correct', soundEnabled);
    vibrateSuccess(vibrationEnabled);
    const newCombo = comboCount + 1;
    setComboCount(newCombo);
    if (newCombo === 3) setShowComboPopup('Combo x3!');
    else if (newCombo === 5) setShowComboPopup('На огне!');
    else if (newCombo === 7) setShowComboPopup('Невероятно!');
    else if (newCombo > 7 && newCombo % 3 === 0) setShowComboPopup(`Combo x${newCombo}!`);
    if (Math.random() < 0.15) setShowBonusXp(true);
  };

  const handleCodeFailure = () => {
    setCodeSuccess(false);
    setIsAnswered(false);
    setMascotState('error');
    setMascotSpeech('Тесты упали. Проверьте сообщения об ошибках в консоли и исправьте код.');
    playSynthesizedSound('incorrect', soundEnabled);
    vibrateError(vibrationEnabled);
    onLoseHeart();
    setComboCount(0);
  };

  return (
    <div className="lesson-fullscreen">
      {/* Top Navbar */}
      <div className="lesson-navbar">
        <button onClick={onClose} className="close-lesson-btn" title="Выйти из урока">
          <X size={20} />
        </button>

        <div className="lesson-progress-container">
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
          </div>
          <span className="progress-label">{currentSlideIndex + 1} / {lesson.slides.length}</span>
        </div>

        {isReviewMode ? (
          <div className="lesson-review-badge">
            <RefreshCw size={14} />
            <span>Режим повторения</span>
          </div>
        ) : (
          <div className="lesson-hearts">
            <span className="heart-count">{hearts}</span>
            <span className="heart-icon">❤️</span>
          </div>
        )}
      </div>

      {showComboPopup && (
        <div className="combo-popup">
          <Zap size={16} />
          <span>{showComboPopup}</span>
        </div>
      )}
      {showBonusXp && (
        <div className="bonus-xp-popup">
          <span>Бонус! Двойной XP</span>
        </div>
      )}

      {/* Main Slide Panel */}
      <div className="lesson-workspace">
        <div className="lesson-slide-body">
          {/* Slide Type Indicator Pill */}
          {(() => {
            const info = getSlideIndicatorInfo();
            return (
              <div className={`slide-type-indicator ${info.className}`}>
                {info.icon}
                <span>{info.label}</span>
              </div>
            );
          })()}

          {/* Theory Slide */}
          {currentSlide.type === 'theory' && (
            <div className="theory-slide anim-slide-in">
              <h2 className="slide-title">{currentSlide.title}</h2>
              {currentSlide.definition && (
                <div className="theory-definition card">
                  <p className="section-label">Определение</p>
                  <p className="definition-text">{currentSlide.definition}</p>
                </div>
              )}

              {currentSlide.content && (
                <div className="theory-definition card">
                  <pre className="definition-text content-text">{currentSlide.content}</pre>
                </div>
              )}

              {/* Key Terms Cards */}
              {currentSlide.keyTerms && currentSlide.keyTerms.length > 0 && (
                <div className="key-terms-container">
                  <p className="section-label">Ключевые понятия</p>
                  <div className="key-terms-grid">
                    {currentSlide.keyTerms.map((kt, i) => (
                      <div key={i} className="key-term-card card">
                        <span className="key-term-name">{kt.term}</span>
                        <span className="key-term-def">{kt.definition}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mnemonic Block */}
              {currentSlide.mnemonic && (
                <div className="mnemonic-block">
                  <div className="mnemonic-icon-wrapper">
                    <Lightbulb size={20} />
                  </div>
                  <div className="mnemonic-content">
                    <span className="mnemonic-label">Запомни</span>
                    <p className="mnemonic-text">{currentSlide.mnemonic}</p>
                  </div>
                </div>
              )}

              {/* Visual Diagram */}
              {currentSlide.diagram && (
                <div className="diagram-container card">
                  {currentSlide.diagram.title && (
                    <p className="section-label">{currentSlide.diagram.title}</p>
                  )}
                  {currentSlide.diagram.type === 'flow' && (
                    <div className="diagram-flow">
                      {currentSlide.diagram.items.map((item, i) => (
                        <React.Fragment key={i}>
                          <div className="flow-step">
                            <span className="flow-step-num">{i + 1}</span>
                            <span className="flow-step-text">{item}</span>
                          </div>
                          {i < currentSlide.diagram!.items.length - 1 && (
                            <div className="flow-arrow">
                              <ChevronRight size={16} />
                            </div>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                  {currentSlide.diagram.type === 'layers' && (
                    <div className="diagram-layers">
                      {currentSlide.diagram.items.map((item, i) => (
                        <div key={i} className="layer-row" style={{ opacity: 1 - (i * 0.1) }}>
                          <span className="layer-index">{i + 1}</span>
                          <span className="layer-text">{item}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {currentSlide.diagram.type === 'comparison' && (
                    <div className="diagram-comparison">
                      <div className="comparison-col col-before">
                        <span className="col-header">До</span>
                        {currentSlide.diagram.items.map((item, i) => (
                          <div key={i} className="comp-line">{item}</div>
                        ))}
                      </div>
                      <div className="comparison-col col-after">
                        <span className="col-header">После</span>
                        {(currentSlide.diagram.secondColumn || []).map((item, i) => (
                          <div key={i} className="comp-line">{item}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {currentSlide.comparison && (
                <div className="comparison-table-container card">
                  <p className="section-label">{currentSlide.comparison.title}</p>
                  <table className="comparison-table">
                    <thead>
                      <tr>
                        {currentSlide.comparison.headers.map((h, i) => <th key={i}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {currentSlide.comparison.rows.map((row, i) => (
                        <tr key={i}>
                          {row.map((cell, j) => <td key={j}>{cell}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {currentSlide.codeSnippet && (
                <div className="theory-code-section">
                  <p className="section-label">
                    <Code size={13} />
                    <span>Пример кода</span>
                  </p>
                  <CodeBlock code={currentSlide.codeSnippet} />
                </div>
              )}


              {currentSlide.pitfalls && currentSlide.pitfalls.length > 0 && (
                <div className="theory-pitfalls card">
                  <p className="section-label pitfalls-label">
                    <AlertTriangle size={14} />
                    <span>Подводные камни и типичные грабли</span>
                  </p>
                  <ul>
                    {currentSlide.pitfalls.map((p, i) => <li key={i}>{p}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Multiple Choice Slide */}
          {currentSlide.type === 'multiple-choice' && (
            <div className="quiz-slide anim-slide-in">
              <h2 className="slide-title">{currentSlide.question}</h2>
              {currentSlide.codeSnippet && (
                <div className="theory-code card" style={{ marginBottom: '1rem' }}>
                  <pre className="code-block"><code>{currentSlide.codeSnippet}</code></pre>
                </div>
              )}
              <div className="quiz-options-list">
                {currentSlide.options.map((option, index) => {
                  const isSelected = selectedOption === index;
                  let optionClass = '';
                  if (isSelected) optionClass = 'selected';
                  if (isAnswered) {
                    if (index === currentSlide.correctIndex) optionClass = 'correct';
                    else if (isSelected) optionClass = 'incorrect';
                    else optionClass = 'disabled';
                  }

                  return (
                    <button
                      key={index}
                      disabled={isAnswered}
                      onClick={() => {
                        setSelectedOption(index);
                        vibrateClick(vibrationEnabled);
                        playSynthesizedSound('tap', soundEnabled);
                      }}
                      className={`quiz-option ${optionClass}`}
                    >
                      <span>{option}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Find the Bug Slide */}
          {currentSlide.type === 'find-the-bug' && (
            <div className="quiz-slide anim-slide-in">
              <div style={{ marginBottom: '0.75rem' }}>
                <span style={{
                  background: 'rgba(239,68,68,0.15)',
                  color: '#ef4444',
                  borderRadius: '6px',
                  padding: '3px 10px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.05em'
                }}>🐛 НАЙДИ БАГ</span>
              </div>
              <h2 className="slide-title">{currentSlide.title}</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                {currentSlide.description}
              </p>
              {currentSlide.hints && currentSlide.hints.length > 0 && (
                <div style={{ marginBottom: '0.75rem' }}>
                  {currentSlide.hints.map((hint, i) => (
                    <div key={i} style={{
                      display: 'flex', gap: '8px', alignItems: 'flex-start',
                      color: 'var(--text-secondary)', fontSize: '0.82rem',
                      marginBottom: '4px'
                    }}>
                      <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>💡</span>
                      <span>{hint}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="theory-code card" style={{ marginBottom: '1rem', borderLeft: '3px solid #ef4444' }}>
                <div style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 700, marginBottom: '6px', letterSpacing: '0.05em' }}>
                  ❌ КОД С ОШИБКОЙ
                </div>
                <pre className="code-block"><code>{currentSlide.buggyCode}</code></pre>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                Что нужно исправить?
              </p>
              <div className="quiz-options-list">
                {currentSlide.options.map((option, index) => {
                  const isSelected = selectedOption === index;
                  let optionClass = '';
                  if (isSelected) optionClass = 'selected';
                  if (isAnswered) {
                    if (index === currentSlide.correctIndex) optionClass = 'correct';
                    else if (isSelected) optionClass = 'incorrect';
                    else optionClass = 'disabled';
                  }
                  return (
                    <button
                      key={index}
                      disabled={isAnswered}
                      onClick={() => {
                        setSelectedOption(index);
                        vibrateClick(vibrationEnabled);
                        playSynthesizedSound('tap', soundEnabled);
                      }}
                      className={`quiz-option ${optionClass}`}
                    >
                      <span>{option}</span>
                    </button>
                  );
                })}
              </div>
              {isAnswered && (
                <div className="theory-code card" style={{ marginTop: '1rem', borderLeft: '3px solid #22c55e' }}>
                  <div style={{ fontSize: '0.75rem', color: '#22c55e', fontWeight: 700, marginBottom: '6px', letterSpacing: '0.05em' }}>
                    ✅ ПРАВИЛЬНОЕ ИСПРАВЛЕНИЕ
                  </div>
                  <pre className="code-block"><code>{currentSlide.fixedCode}</code></pre>
                </div>
              )}
            </div>
          )}

          {/* True / False Slide */}
          {currentSlide.type === 'true-false' && (
            <div className="true-false-slide anim-slide-in">
              <h2 className="slide-title">{currentSlide.question}</h2>
              <div className="tf-options">
                {[true, false].map((val) => {
                  const isSelected = selectedBool === val;
                  let btnClass = '';
                  if (isSelected) btnClass = 'selected';
                  if (isAnswered) {
                    if (val === currentSlide.correctValue) btnClass = 'correct';
                    else if (isSelected) btnClass = 'incorrect';
                    else btnClass = 'disabled';
                  }

                  return (
                    <button
                      key={val ? 'true' : 'false'}
                      disabled={isAnswered}
                      onClick={() => {
                        setSelectedBool(val);
                        vibrateClick(vibrationEnabled);
                        playSynthesizedSound('tap', soundEnabled);
                      }}
                      className={`quiz-option tf-btn ${btnClass}`}
                    >
                      <span>{val ? 'ПРАВДА' : 'ЛОЖЬ'}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Order Slide */}
          {currentSlide.type === 'order' && (
            <div className="order-slide anim-slide-in">
              <h2 className="slide-title">{currentSlide.question}</h2>
              
              {/* Active list showing ordered status */}
              <div className="ordered-basket card">
                <p className="basket-label">Ваша последовательность:</p>
                {orderedItems.length === 0 ? (
                  <span className="basket-empty-text">Нажмите на карточки внизу, чтобы упорядочить их...</span>
                ) : (
                  <div className="basket-items">
                    {orderedItems.map((id, index) => {
                      const item = currentSlide.items.find(i => i.id === id);
                      return (
                        <div key={id} className="basket-item card">
                          <span className="item-number">{index + 1}</span>
                          <span>{item?.text}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Input Cards */}
              <div className="order-pool">
                {currentSlide.items.map((item) => {
                  const isPlaced = orderedItems.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      disabled={isAnswered}
                      onClick={() => handleOrderClick(item.id)}
                      className={`order-pool-card card-interactive card ${isPlaced ? 'placed' : ''}`}
                    >
                      {item.text}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Coding Slide */}
          {currentSlide.type === 'coding' && (
            <div className="coding-slide anim-slide-in">
              <div className="coding-intro">
                <h2 className="slide-title">{currentSlide.title}</h2>
                <p className="coding-description">{currentSlide.description}</p>
              </div>

              <CodeSandbox
                starterCode={currentSlide.starterCode}
                testSuite={currentSlide.testSuite}
                domSetup={currentSlide.domSetup}
                hints={currentSlide.hints}
                onSuccess={handleCodeSuccess}
                onFailure={handleCodeFailure}
                vibrationEnabled={vibrationEnabled}
                referenceSolution={currentSlide.referenceSolution}
                explanation={currentSlide.explanation}
              />
            </div>
          )}
        </div>

        {/* Right Side: Animated Mascot feedback */}
        <div className="lesson-side-mascot">
          <Mascot state={mascotState} speechText={mascotSpeech} />
        </div>
      </div>

      {/* Floating reaction bubble — visible on mobile where mascot sidebar is hidden */}
      {feedbackEmoji.show && (
        <div className={`floating-reaction ${isCorrect ? 'reaction-correct' : 'reaction-incorrect'}`}>
          <span className="reaction-icon">{feedbackEmoji.icon}</span>
          <span className="reaction-text">{isCorrect ? pickRandom(CORRECT_MESSAGES) : 'Неверно...'}</span>
        </div>
      )}
      {/* Slide validation Bottom panel */}
      {currentSlide.type !== 'coding' ? (
        <div className={`lesson-footer-panel ${currentSlide.type === 'theory' ? '' : isAnswered ? (isCorrect ? 'correct' : 'incorrect') : ''}`}>
          <div className="footer-panel-content-vertical">
            {isAnswered && currentSlide.type !== 'theory' && (
              <div className="feedback-strip">
                <div className={`feedback-indicator ${isCorrect ? 'text-success' : 'text-error'}`}>
                  {isCorrect ? <CheckCircle size={18} /> : <XCircle size={18} />}
                  <span>{isCorrect ? 'Верно' : 'Неверно'}</span>
                </div>
                  {/* Compact explanation only — no duplicated option cards */}
                  {'explanation' in currentSlide && currentSlide.explanation && (
                    <p className="feedback-explanation">
                      {currentSlide.explanation.split(/(`[^`]+`)/g).map((part, index) => {
                        if (part.startsWith('`') && part.endsWith('`')) {
                          return <code key={index} className="inline-code">{part.slice(1, -1)}</code>;
                        }
                        return part;
                      })}
                    </p>
                  )}
              </div>
            )}

            <div className="footer-actions-row">
              {!isAnswered ? (
                <button
                  disabled={
                    (currentSlide.type === 'multiple-choice' && selectedOption === null) ||
                    (currentSlide.type === 'true-false' && selectedBool === null) ||
                    (currentSlide.type === 'order' && orderedItems.length !== currentSlide.items.length)
                  }
                  onClick={handleCheckAnswer}
                  className="btn-primary check-btn"
                >
                  <span>Проверить</span>
                </button>
              ) : (
                <button onClick={handleNextSlide} className="btn-primary next-btn">
                  <span>Продолжить</span>
                  <ArrowRight size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Simple spacing bottom footer for coding slides */
        <div className="coding-footer-spacer">
          {codeSuccess && (
            <div className="coding-slide-success-panel">
              <div className="feedback-headline text-success">
                <CheckCircle size={20} />
                <span>Задание выполнено успешно!</span>
              </div>
              <button onClick={handleNextSlide} className="btn-primary coding-continue-btn">
                <span>Продолжить</span>
                <ArrowRight size={18} />
              </button>
            </div>
          )}
        </div>
      )}

      <style>{`
        .lesson-fullscreen {
          position: fixed;
          left: 0;
          top: 0;
          right: 0;
          bottom: 0;
          background-color: var(--bg-main);
          z-index: 1000;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .lesson-navbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          padding-top: calc(16px + env(safe-area-inset-top, 0px));
          border-bottom: 1px solid var(--border-color);
          background-color: var(--bg-card);
          box-sizing: border-box;
        }

        .close-lesson-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 8px;
          border-radius: var(--radius-full);
          transition: all var(--transition-fast);
        }

        .close-lesson-btn:hover {
          color: var(--text-primary);
          background-color: var(--bg-card-hover);
        }

        .lesson-progress-container {
          flex: 1;
          max-width: 50%;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .progress-label {
          font-size: 13px;
          font-weight: 700;
          color: var(--text-secondary);
          white-space: nowrap;
        }

        .lesson-hearts {
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 800;
          font-size: 16px;
          color: var(--color-error);
        }

        .lesson-workspace {
          flex: 1;
          display: grid;
          grid-template-columns: 1fr 300px;
          overflow-y: auto;
          padding: 30px 40px;
          padding-bottom: 120px;
          gap: 40px;
        }

        @media (max-width: 960px) {
          .lesson-workspace {
            grid-template-columns: 1fr;
            padding: 16px 12px;
            padding-bottom: 110px;
          }
          .lesson-side-mascot {
            display: none;
          }
        }

        .lesson-slide-body {
          display: flex;
          flex-direction: column;
          width: 100%;
          max-width: 780px;
          margin: 0 auto;
          padding: 24px 16px;
          box-sizing: border-box;
        }

        @media (max-width: 600px) {
          .lesson-slide-body {
            padding: 12px 4px;
          }
        }

        .slide-title {
          font-size: 22px;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 16px;
          line-height: 1.3;
        }

        @media (max-width: 600px) {
          .slide-title {
            font-size: 18px;
            margin-bottom: 10px;
          }
        }

        .anim-slide-in {
          animation: slide-in 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes slide-in {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Theory Styles */
        .theory-slide {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .section-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 800;
          color: var(--color-accent);
          margin-bottom: 6px;
        }

        .definition-text {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.6;
          word-break: break-word;
          overflow-wrap: break-word;
        }

        .content-text {
          font-family: inherit;
          font-size: 13px;
          white-space: pre-wrap;
          word-break: break-word;
          overflow-wrap: break-word;
          margin: 0;
          line-height: 1.7;
        }

        @media (max-width: 600px) {
          .theory-slide {
            gap: 10px;
          }
          .definition-text {
            font-size: 13px;
          }
          .section-label {
            font-size: 10px;
          }
        }

        .comparison-table-container {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        .comparison-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 12px;
        }

        .comparison-table th {
          border-bottom: 2px solid var(--border-color);
          padding: 6px 8px;
          font-weight: 700;
          color: var(--text-primary);
          white-space: nowrap;
        }

        .comparison-table td {
          border-bottom: 1px solid var(--border-color);
          padding: 6px 8px;
          color: var(--text-secondary);
          word-break: break-word;
        }

        @media (max-width: 600px) {
          .comparison-table {
            font-size: 11px;
          }
          .comparison-table th, .comparison-table td {
            padding: 4px 6px;
          }
        }

        .theory-code-section {
          margin: 12px 0;
        }

        .theory-code-section .section-label {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 8px;
        }

        @media (max-width: 600px) {
          .theory-code-section {
            margin: 8px 0;
          }
          .theory-code.card, .theory-pitfalls.card, .diagram-container.card, .theory-definition.card {
            padding: 10px 12px !important;
          }
        }

        .theory-pitfalls li {
          margin-left: 16px;
          font-size: 13px;
          color: var(--text-secondary);
          margin-top: 4px;
          word-break: break-word;
        }

        .pitfalls-label {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--color-error) !important;
        }

        /* Review Mode Badge */
        .lesson-review-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: var(--radius-full);
          background-color: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.25);
          color: var(--color-warning);
          font-size: 12px;
          font-weight: 700;
        }

        /* Key Terms Cards */
        .key-terms-container {
          margin-top: 4px;
        }

        .key-terms-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 8px;
        }

        @media (max-width: 600px) {
          .key-terms-grid {
            grid-template-columns: 1fr;
            gap: 6px;
          }
          .lesson-navbar {
            padding: 10px 12px;
          }
          .lesson-slide-body {
            padding: 10px 2px;
          }
          .flow-step {
            white-space: normal;
            padding: 6px 10px;
          }
          .flow-step-text {
            font-size: 11px;
          }
        }

        .key-term-card {
          padding: 10px 12px !important;
          display: flex;
          flex-direction: column;
          gap: 2px;
          border-left: 3px solid var(--color-accent) !important;
        }

        .key-term-name {
          font-size: 13px;
          font-weight: 800;
          color: var(--text-primary);
          font-family: var(--font-mono);
        }

        .key-term-def {
          font-size: 11px;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        /* Mnemonic Block */
        .mnemonic-block {
          display: flex;
          gap: 12px;
          padding: 12px 14px;
          border-radius: var(--radius-lg);
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(245, 158, 11, 0.02) 100%);
          border: 1px solid rgba(245, 158, 11, 0.2);
          align-items: flex-start;
        }

        .mnemonic-icon-wrapper {
          color: var(--color-warning);
          flex-shrink: 0;
          margin-top: 2px;
        }

        .mnemonic-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .mnemonic-label {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--color-warning);
        }

        .mnemonic-text {
          font-size: 13px;
          color: var(--text-primary);
          line-height: 1.5;
          font-weight: 500;
          word-break: break-word;
        }

        @media (max-width: 600px) {
          .mnemonic-block {
            gap: 8px;
            padding: 10px 12px;
          }
          .mnemonic-text {
            font-size: 12px;
          }
        }

        /* Diagram: Flow */
        .diagram-flow {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 6px;
          padding: 4px 0;
        }

        .flow-step {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          background: rgba(99, 102, 241, 0.06);
          border: 1px solid rgba(99, 102, 241, 0.15);
          border-radius: var(--radius-md);
          white-space: nowrap;
          min-width: 0;
        }

        .flow-step-num {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--color-accent);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 800;
          flex-shrink: 0;
        }

        .flow-step-text {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .flow-arrow {
          color: var(--text-muted);
          display: flex;
          align-items: center;
        }

        /* Diagram: Layers */
        .diagram-layers {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .layer-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 16px;
          background: rgba(99, 102, 241, 0.04);
          border: 1px solid rgba(99, 102, 241, 0.1);
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
        }

        .layer-row:first-child {
          background: rgba(244, 63, 94, 0.08);
          border-color: rgba(244, 63, 94, 0.2);
        }

        .layer-row:first-child .layer-index {
          background: var(--color-error);
        }

        .layer-index {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: var(--color-accent);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 800;
          flex-shrink: 0;
        }

        .layer-text {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
          font-family: var(--font-mono);
        }

        /* Diagram: Comparison */
        .diagram-comparison {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        @media (max-width: 600px) {
          .diagram-comparison {
            grid-template-columns: 1fr;
          }
        }

        .comparison-col {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 12px;
          border-radius: var(--radius-md);
        }

        .col-before {
          background: rgba(244, 63, 94, 0.04);
          border: 1px solid rgba(244, 63, 94, 0.15);
        }

        .col-after {
          background: rgba(16, 185, 129, 0.04);
          border: 1px solid rgba(16, 185, 129, 0.15);
        }

        .col-header {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
        }

        .col-before .col-header {
          color: var(--color-error);
        }

        .col-after .col-header {
          color: var(--color-success);
        }

        .comp-line {
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--text-secondary);
          line-height: 1.5;
          white-space: pre-wrap;
        }

        /* Quiz Choice layout */
        .quiz-options-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        /* True False options */
        .tf-options {
          display: flex;
          gap: 16px;
        }

        .tf-btn {
          flex: 1;
          justify-content: center !important;
          padding: 24px !important;
          font-size: 16px !important;
        }

        /* Order sequence layout */
        .ordered-basket {
          background-color: #0b1329;
          margin-bottom: 20px;
        }

        .basket-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-muted);
          font-weight: 700;
          margin-bottom: 12px;
        }

        .basket-empty-text {
          font-size: 14px;
          color: var(--text-muted);
          font-style: italic;
        }

        .basket-items {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .basket-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 16px !important;
          background-color: var(--bg-card-hover) !important;
          animation: pop-item 0.15s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes pop-item {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .item-number {
          background-color: var(--color-accent);
          color: #fff;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 800;
        }

        .order-pool {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .order-pool-card.placed {
          opacity: 0.3;
          border-style: dashed;
          cursor: pointer;
          transform: none;
        }

        /* Coding screen layout customizations */
        .coding-intro {
          margin-bottom: 12px;
        }

        .coding-description {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        /* Footer Check Panels */
        .lesson-footer-panel {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: var(--bg-card);
          border-top: 1px solid var(--border-color);
          padding: 16px 40px;
          padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px));
          z-index: 90;
          max-height: 50vh;
          overflow-y: auto;
          box-shadow: 0 -10px 25px -5px rgba(0, 0, 0, 0.5);
          transition: background-color var(--transition-medium);
        }

        .lesson-footer-panel.correct {
          background-color: #042419;
          border-top-color: var(--color-success);
        }

        .lesson-footer-panel.incorrect {
          background-color: #340c0c;
          border-top-color: var(--color-error);
        }

        .footer-panel-content-vertical {
          display: flex;
          flex-direction: column;
          max-width: 800px;
          margin: 0 auto;
          gap: 12px;
        }

        .feedback-strip {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .feedback-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 15px;
          font-weight: 700;
        }

        .feedback-explanation {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.6;
          margin: 0;
        }

        .solution-analysis-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: var(--radius-md);
          overflow: hidden;
        }

        .analysis-header {
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.02);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .feedback-headline {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 800;
          font-size: 16px;
        }

        .glow-success {
          filter: drop-shadow(0 0 4px var(--color-success));
        }

        .glow-error {
          filter: drop-shadow(0 0 4px var(--color-error));
        }

        .analysis-body {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 35vh;
          overflow-y: auto;
        }

        .analysis-comparison {
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: rgba(0, 0, 0, 0.2);
          padding: 12px;
          border-radius: var(--radius-sm);
        }

        .option-previews-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 100%;
        }

        .true-false-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        @media (max-width: 600px) {
          .true-false-grid {
            grid-template-columns: 1fr;
          }
        }

        .option-preview-card {
          border-radius: var(--radius-md);
          padding: 12px 16px;
          border: 1px solid var(--border-color);
          background: rgba(255, 255, 255, 0.02);
          transition: all var(--transition-fast);
        }

        .preview-card-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
        }

        .preview-option-text {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .preview-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: var(--radius-full);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .badge-success {
          background-color: var(--color-success);
          color: #ffffff;
        }

        .badge-success-outline {
          border: 1px solid var(--color-success);
          color: var(--color-success);
          background: rgba(16, 185, 129, 0.05);
        }

        .badge-error {
          background-color: var(--color-error);
          color: #ffffff;
        }

        .preview-card-neutral {
          border-color: rgba(255, 255, 255, 0.06);
          background: rgba(255, 255, 255, 0.01);
          opacity: 0.7;
        }

        .preview-card-success {
          border-color: rgba(16, 185, 129, 0.3);
          background: rgba(16, 185, 129, 0.03);
        }

        .preview-card-success-selected {
          border-color: var(--color-success);
          background: rgba(16, 185, 129, 0.08);
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.1);
        }

        .preview-card-error {
          border-color: var(--color-error);
          background: rgba(239, 68, 68, 0.08);
          box-shadow: 0 0 10px rgba(239, 68, 68, 0.1);
        }

        .comparison-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          font-size: 13px;
        }

        .comparison-label {
          color: var(--text-muted);
          font-weight: 600;
        }

        .comparison-value {
          text-align: right;
          word-break: break-all;
        }

        .order-comparison-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        @media (max-width: 600px) {
          .order-comparison-grid {
            grid-template-columns: 1fr;
          }
        }

        .order-column {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .order-comparison-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .order-comparison-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          border-radius: var(--radius-sm);
          font-size: 12px;
          font-weight: 500;
          background: rgba(0, 0, 0, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .order-comparison-item.correct {
          border-color: rgba(16, 185, 129, 0.3);
          background: rgba(16, 185, 129, 0.08);
          color: #6ee7b7;
        }

        .order-comparison-item.incorrect {
          border-color: rgba(239, 68, 68, 0.3);
          background: rgba(239, 68, 68, 0.08);
          color: #fca5a5;
        }

        .order-comparison-item.reference {
          border-color: rgba(99, 102, 241, 0.3);
          background: rgba(99, 102, 241, 0.08);
          color: #a5b4fc;
        }

        .order-index {
          background: rgba(255, 255, 255, 0.1);
          color: var(--text-secondary);
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 800;
        }

        .order-text {
          flex: 1;
        }

        .order-status-icon {
          font-weight: bold;
        }

        .explanation-text-section {
          border-left: 3px solid var(--color-accent);
          padding-left: 14px;
          margin-top: 4px;
        }

        .explanation-section-title {
          display: block;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 800;
          color: var(--color-accent);
          margin-bottom: 6px;
        }

        .explanation-paragraph {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .inline-code {
          background-color: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-sm);
          padding: 2px 6px;
          font-family: var(--font-mono);
          font-size: 12px;
          color: #ff79c6;
        }

        .footer-actions-row {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        @media (max-width: 768px) {
          .lesson-footer-panel {
            max-height: 35vh;
            overflow-y: auto;
            padding: 14px 20px;
            padding-bottom: calc(14px + env(safe-area-inset-bottom, 0px));
          }
        }

        @media (max-width: 600px) {
          .lesson-footer-panel {
            padding: 12px 16px;
            padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px));
            max-height: 30vh;
          }
          .footer-actions-row {
            justify-content: stretch;
          }
          .check-btn, .next-btn {
            width: 100%;
            min-width: unset;
          }
          .feedback-indicator {
            font-size: 13px;
          }
          .explanation-paragraph {
            font-size: 12px;
          }
        }

        .check-btn, .next-btn {
          min-width: 160px;
        }

        .check-btn {
          background-color: var(--color-success);
        }

        .check-btn:hover {
          filter: brightness(1.1);
        }

        /* Coding screen specific success drawer */
        .coding-footer-spacer {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          padding: 24px 40px;
          padding-bottom: calc(24px + env(safe-area-inset-bottom, 0px));
          z-index: 90;
          background-color: transparent;
          pointer-events: none;
        }

        @media (max-width: 600px) {
          .coding-footer-spacer {
            padding: 16px;
            padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px));
          }
        }

        .coding-slide-success-panel {
          pointer-events: auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 800px;
          margin: 0 auto;
          background-color: #062f21;
          border: 1px solid var(--color-success);
          border-radius: var(--radius-md);
          padding: 16px 24px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.4);
          animation: slide-in 0.2s;
        }

        .coding-continue-btn {
          min-width: 160px;
        }

        .slide-type-indicator {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: var(--radius-full);
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 20px;
          align-self: flex-start;
          border: 1px solid transparent;
        }

        .slide-indicator-theory {
          background-color: rgba(99, 102, 241, 0.1);
          color: #a5b4fc;
          border-color: rgba(99, 102, 241, 0.2);
        }

        .slide-indicator-practice {
          background-color: rgba(16, 185, 129, 0.1);
          color: #6ee7b7;
          border-color: rgba(16, 185, 129, 0.2);
        }

        .combo-popup {
          position: fixed;
          top: 70px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, rgba(245,158,11,0.2), rgba(245,158,11,0.05));
          border: 1px solid rgba(245,158,11,0.3);
          color: #fbbf24;
          padding: 8px 20px;
          border-radius: 100px;
          font-size: 14px;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 6px;
          z-index: 1100;
          animation: combo-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          backdrop-filter: blur(12px);
        }

        .bonus-xp-popup {
          position: fixed;
          top: 110px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(99,102,241,0.05));
          border: 1px solid rgba(99,102,241,0.3);
          color: #a5b4fc;
          padding: 6px 16px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 700;
          z-index: 1100;
          animation: combo-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          backdrop-filter: blur(12px);
        }

        @keyframes combo-in {
          from { transform: translateX(-50%) scale(0.5); opacity: 0; }
          to { transform: translateX(-50%) scale(1); opacity: 1; }
        }

        /* Floating reaction bubble — Duolingo-style */
        .floating-reaction {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 24px;
          border-radius: 100px;
          font-weight: 800;
          font-size: 15px;
          z-index: 1200;
          pointer-events: none;
          animation: reaction-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), reaction-fade 1.2s ease forwards;
          backdrop-filter: blur(16px);
        }

        .reaction-correct {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(16, 185, 129, 0.08));
          border: 2px solid rgba(16, 185, 129, 0.4);
          color: #6ee7b7;
          box-shadow: 0 8px 40px rgba(16, 185, 129, 0.25);
        }

        .reaction-incorrect {
          background: linear-gradient(135deg, rgba(244, 63, 94, 0.25), rgba(244, 63, 94, 0.08));
          border: 2px solid rgba(244, 63, 94, 0.4);
          color: #fda4af;
          box-shadow: 0 8px 40px rgba(244, 63, 94, 0.25);
        }

        .reaction-icon {
          font-size: 22px;
          font-weight: 900;
        }

        .reaction-text {
          max-width: 200px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        @keyframes reaction-pop {
          0% { transform: translate(-50%, -50%) scale(0); }
          60% { transform: translate(-50%, -50%) scale(1.15); }
          100% { transform: translate(-50%, -50%) scale(1); }
        }

        @keyframes reaction-fade {
          0%, 60% { opacity: 1; }
          100% { opacity: 0; transform: translate(-50%, -65%) scale(0.9); }
        }

        /* Quiz option micro-animations */
        .quiz-option.correct {
          animation: option-correct 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .quiz-option.incorrect {
          animation: option-shake 0.4s ease;
        }

        @keyframes option-correct {
          0% { transform: scale(1); }
          50% { transform: scale(1.03); }
          100% { transform: scale(1); }
        }

        @keyframes option-shake {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-6px); }
          30% { transform: translateX(6px); }
          45% { transform: translateX(-4px); }
          60% { transform: translateX(4px); }
          75% { transform: translateX(-2px); }
          90% { transform: translateX(2px); }
        }

        /* Hide floating reaction on desktop (mascot sidebar is visible) */
        @media (min-width: 961px) {
          .floating-reaction {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};
