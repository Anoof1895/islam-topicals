import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { topicNames } from '../topicNames';
import ScanStage from '../components/ScanStage';
import ShortcutsModal from '../components/ShortcutsModal';
import {
  BookOpenIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  FlipIcon,
  KeyboardIcon,
  TargetIcon,
  XIcon,
} from '../components/Icons';

const QUIZ_SHORTCUTS = [
  { label: 'Flip Question / Answer', keys: ['Space'] },
  { label: 'Mark as Correct (when answer shown)', keys: ['1', '→'] },
  { label: 'Mark as Incorrect (when answer shown)', keys: ['2', '←'] },
  { label: 'Keyboard shortcuts', keys: ['?'] },
];

const getBaseQuestionNumber = (questionNumber) => String(questionNumber).replace(/[a-z]$/i, '');

const areQuestionsRelated = (q1, q2) =>
  q1.year === q2.year &&
  q1.paper === q2.paper &&
  q1.book === q2.book &&
  q1.unit === q2.unit &&
  getBaseQuestionNumber(q1.questionNumber) === getBaseQuestionNumber(q2.questionNumber);

const groupRelatedQuestions = (questions) => {
  const groups = [];
  const used = new Set();

  questions.forEach(question => {
    if (used.has(question.id)) return;
    const group = [question];
    used.add(question.id);

    questions.forEach(otherQuestion => {
      if (!used.has(otherQuestion.id) && areQuestionsRelated(question, otherQuestion)) {
        group.push(otherQuestion);
        used.add(otherQuestion.id);
      }
    });

    group.sort((a, b) => String(a.questionNumber).localeCompare(String(b.questionNumber)));
    groups.push(group);
  });

  return groups;
};

const filterByQuizConfig = (allQuestions, config) =>
  allQuestions.filter(q => {
    if (config.book.length > 0 && !config.book.includes(q.book)) return false;
    if (config.units.length > 0 && !config.units.includes(q.unit)) return false;

    if (config.types.length > 0) {
      const hasAllSelectedTypes = config.types.every(selectedType => q.types.includes(selectedType));
      if (!hasAllSelectedTypes) return false;
    }

    if (!config.includeSpecimen) {
      const isSpecimen = (q.year === 2021 && q.paperSet === 2) || (q.year === 2020 && q.paperSet === 1);
      if (isSpecimen) return false;
    }

    return true;
  });

const QuizGenerator = ({
  allQuestions,
  unitNames,
  questionTypes,
  setSelectedQuestionId,
  setCurrentView,
}) => {
  const [quizConfig, setQuizConfig] = useState({
    book: [],
    units: [],
    topics: [],
    types: [],
    numberOfQuestions: 10,
    includeSpecimen: true,
  });
  const [generatedQuiz, setGeneratedQuiz] = useState(null);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizNotice, setQuizNotice] = useState('');
  const [confirmEndOpen, setConfirmEndOpen] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);

  const availableUnits = useMemo(() => {
    const units = [];
    Object.keys(topicNames).forEach(book => {
      Object.keys(topicNames[book]).forEach(unit => {
        const uNum = parseInt(unit, 10);
        if (!units.includes(uNum)) units.push(uNum);
      });
    });
    return units.sort((a, b) => a - b);
  }, []);

  const availableQuestionTypes = useMemo(() => {
    const customOrder = [1, 2, 5, 7, 3, 6, 4];
    const allTypes = [...new Set(allQuestions.flatMap(q => q.types))].sort((a, b) => a - b);
    return customOrder
      .filter(typeId => allTypes.includes(typeId))
      .map(typeId => ({
        value: typeId,
        label: questionTypes[typeId] || `Type ${typeId}`,
      }));
  }, [allQuestions, questionTypes]);

  const matchingPool = useMemo(
    () => filterByQuizConfig(allQuestions, quizConfig),
    [allQuestions, quizConfig]
  );

  const generateQuiz = useCallback(
    (overrideConfig = null) => {
      const activeConfig = overrideConfig || quizConfig;
      const filteredQuestions = filterByQuizConfig(allQuestions, activeConfig);

      if (filteredQuestions.length === 0) {
        setQuizNotice('No questions match those criteria. Try broadening your unit or question type selections.');
        return;
      }

      const questionGroups = groupRelatedQuestions(filteredQuestions);
      const shuffledGroups = [...questionGroups].sort(() => 0.5 - Math.random());

      const targetNumberOfQuestions =
        activeConfig.numberOfQuestions === 'all'
          ? filteredQuestions.length
          : activeConfig.numberOfQuestions;

      let selectedQuestions = [];
      for (const group of shuffledGroups) {
        if (selectedQuestions.length + group.length > targetNumberOfQuestions) {
          continue;
        }
        selectedQuestions.push(...group);
        if (selectedQuestions.length >= targetNumberOfQuestions) break;
      }

      if (selectedQuestions.length === 0 && shuffledGroups.length > 0) {
        selectedQuestions = shuffledGroups[0].slice(0, targetNumberOfQuestions);
      }

      if (
        selectedQuestions.length < targetNumberOfQuestions &&
        activeConfig.numberOfQuestions !== 'all'
      ) {
        setQuizNotice(
          `Only ${selectedQuestions.length} matching questions found — starting quiz with all available.`
        );
      } else {
        setQuizNotice('');
      }

      setGeneratedQuiz(selectedQuestions);
      setCurrentQuizIndex(0);
      setShowAnswer(false);
      setUserAnswers({});
      setQuizCompleted(false);
    },
    [allQuestions, quizConfig]
  );

  const toggleBook = (bookValue) => {
    setQuizNotice('');
    setQuizConfig(prev => ({
      ...prev,
      book: bookValue === null ? [] : [bookValue],
    }));
  };

  const toggleMultiField = (field, value) => {
    setQuizNotice('');
    setQuizConfig(prev => {
      const current = prev[field] || [];
      const exists = current.includes(value);
      return {
        ...prev,
        [field]: exists ? current.filter(v => v !== value) : [...current, value],
      };
    });
  };

  const handleAnswerSubmit = useCallback(
    (isCorrect) => {
      if (!generatedQuiz) return;
      const currentQuestion = generatedQuiz[currentQuizIndex];
      setUserAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: isCorrect,
      }));

      if (currentQuizIndex === generatedQuiz.length - 1) {
        setQuizCompleted(true);
      } else {
        setCurrentQuizIndex(prev => prev + 1);
        setShowAnswer(false);
      }
    },
    [generatedQuiz, currentQuizIndex]
  );

  // Active quiz keyboard shortcuts
  useEffect(() => {
    if (!generatedQuiz || quizCompleted) return;
    const handleKey = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      const currentQ = generatedQuiz[currentQuizIndex];
      const alreadyAnswered = userAnswers[currentQ?.id] !== undefined;

      switch (e.key) {
        case ' ':
        case 'Spacebar':
          e.preventDefault();
          setShowAnswer(prev => !prev);
          break;
        case '1':
        case 'ArrowRight':
          if (showAnswer && !alreadyAnswered) {
            e.preventDefault();
            handleAnswerSubmit(true);
          }
          break;
        case '2':
        case 'ArrowLeft':
          if (showAnswer && !alreadyAnswered) {
            e.preventDefault();
            handleAnswerSubmit(false);
          }
          break;
        case '?':
          e.preventDefault();
          setShowShortcutsHelp(prev => !prev);
          break;
        case 'Escape':
          setShowShortcutsHelp(false);
          setConfirmEndOpen(false);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [generatedQuiz, quizCompleted, currentQuizIndex, showAnswer, userAnswers, handleAnswerSubmit]);

  const calculateScore = () => {
    if (!generatedQuiz) return { correct: 0, total: 0, percentage: 0 };
    const correct = generatedQuiz.filter(q => userAnswers[q.id] === true).length;
    const total = generatedQuiz.length;
    const percentage = Math.round((correct / total) * 100);
    return { correct, total, percentage };
  };

  const getRelatedQuestions = (currentQuestion) => {
    if (!generatedQuiz || !currentQuestion) return [];
    const baseNumber = getBaseQuestionNumber(currentQuestion.questionNumber);
    return generatedQuiz.filter(
      q =>
        q.year === currentQuestion.year &&
        q.paper === currentQuestion.paper &&
        q.book === currentQuestion.book &&
        q.unit === currentQuestion.unit &&
        getBaseQuestionNumber(q.questionNumber) === baseNumber
    );
  };

  // ==================== RESULTS VIEW ====================
  if (quizCompleted && generatedQuiz) {
    const { correct, total, percentage } = calculateScore();
    const radius = 44;
    const circumference = 2 * Math.PI * radius;
    const strokeOffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="max-w-4xl mx-auto w-full space-y-5 animate-fade-up">
        <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-[var(--shadow-card)] p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
            {/* SVG Score Ring */}
            <div className="relative w-28 h-28 flex-shrink-0 flex items-center justify-center">
              <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke="var(--border-hairline)"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke={percentage >= 75 ? 'var(--accent-primary)' : percentage >= 50 ? 'var(--accent-gold)' : '#EF4444'}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeOffset}
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono-code text-2xl font-bold text-[var(--text-primary)]">
                  {percentage}%
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">
                  Score
                </span>
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <span className="inline-block text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[var(--accent-primary-soft)] text-[var(--accent-primary)] mb-2">
                Session Complete
              </span>
              <h2 className="font-serif-editorial text-2xl sm:text-3xl font-semibold text-[var(--text-primary)]">
                {percentage >= 80
                  ? 'Excellent Mastery'
                  : percentage >= 60
                  ? 'Solid Progress'
                  : 'Keep Practicing'}
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                You answered <strong className="text-[var(--text-primary)]">{correct}</strong> out of{' '}
                <strong className="text-[var(--text-primary)]">{total}</strong> questions accurately.
              </p>

              <div className="grid grid-cols-3 gap-3 mt-5 max-w-sm mx-auto sm:mx-0">
                <div className="p-3 rounded-xl bg-[var(--accent-primary-soft)] border border-[var(--accent-primary)]/20 text-center">
                  <div className="font-mono-code text-xl font-bold text-[var(--accent-primary)]">
                    {correct}
                  </div>
                  <div className="text-[11px] font-semibold text-[var(--text-secondary)]">Correct</div>
                </div>
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
                  <div className="font-mono-code text-xl font-bold text-red-600 dark:text-red-400">
                    {total - correct}
                  </div>
                  <div className="text-[11px] font-semibold text-[var(--text-secondary)]">Review</div>
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-hairline)] text-center">
                  <div className="font-mono-code text-xl font-bold text-[var(--text-primary)]">
                    {total}
                  </div>
                  <div className="text-[11px] font-semibold text-[var(--text-secondary)]">Total</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Question Review List */}
        <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-[var(--shadow-card)] overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--border-hairline)] bg-[var(--bg-subtle)]/40 flex items-center justify-between">
            <h3 className="font-serif-editorial text-lg font-semibold text-[var(--text-primary)]">
              Question Review
            </h3>
            <span className="text-xs text-[var(--text-muted)]">Click any item to inspect full scan</span>
          </div>

          <div className="divide-y divide-[var(--border-hairline)]">
            {generatedQuiz.map((question, index) => {
              const isCorrect = userAnswers[question.id] === true;
              return (
                <button
                  key={question.id}
                  type="button"
                  onClick={() => {
                    setSelectedQuestionId(question.id);
                    setCurrentView('main');
                  }}
                  className="w-full text-left px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-[var(--bg-subtle)]/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isCorrect
                          ? 'bg-[var(--accent-primary-soft)] text-[var(--accent-primary)]'
                          : 'bg-red-500/10 text-red-600 dark:text-red-400'
                      }`}
                    >
                      {isCorrect ? <CheckIcon className="w-4 h-4" /> : <XIcon className="w-4 h-4" />}
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-[var(--text-primary)] truncate">
                        Q{index + 1}: Unit {question.unit} ({unitNames[question.unit]}) — {question.year} Paper {question.paper}
                      </div>
                      <div className="font-mono-code text-xs text-[var(--text-secondary)] mt-0.5">
                        Book {question.book} • Question {question.questionNumber}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                      isCorrect
                        ? 'bg-[var(--accent-primary-soft)] text-[var(--accent-primary)]'
                        : 'bg-red-500/10 text-red-600 dark:text-red-400'
                    }`}
                  >
                    {isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => {
              setGeneratedQuiz(null);
              setQuizCompleted(false);
            }}
            className="flex-1 py-3 px-5 rounded-xl text-sm font-semibold bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-colors"
          >
            Create Another Quiz
          </button>
          <button
            type="button"
            onClick={() => {
              setGeneratedQuiz(null);
              setQuizCompleted(false);
              setCurrentView('main');
            }}
            className="flex-1 py-3 px-5 rounded-xl text-sm font-semibold bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primary-hover)] transition-colors shadow-xs"
          >
            Browse Past Papers
          </button>
        </div>
      </div>
    );
  }

  // ==================== ACTIVE QUIZ VIEW ====================
  if (generatedQuiz && !quizCompleted) {
    const currentQuestion = generatedQuiz[currentQuizIndex];
    const isLastQuestion = currentQuizIndex === generatedQuiz.length - 1;
    const userAnswer = userAnswers[currentQuestion.id];
    const relatedQuestions = getRelatedQuestions(currentQuestion);
    const hasMultipleParts = relatedQuestions.length > 1;
    const currentPartIndex = relatedQuestions.findIndex(q => q.id === currentQuestion.id);
    const progressPct = Math.round(((currentQuizIndex + 1) / generatedQuiz.length) * 100);

    return (
      <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col min-h-0 gap-3.5 animate-fade-up">
        {/* Quiz Top Bar */}
        <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-[var(--shadow-card)] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[var(--accent-primary-soft)] text-[var(--accent-primary)] flex items-center justify-center">
                <TargetIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif-editorial text-lg sm:text-xl font-semibold text-[var(--text-primary)]">
                    Practice Session
                  </h2>
                  <span className="font-mono-code text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--bg-subtle)] text-[var(--text-primary)]">
                    {currentQuizIndex + 1} / {generatedQuiz.length}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Book {currentQuestion.book} • {unitNames[currentQuestion.unit]} • {currentQuestion.year} Paper {currentQuestion.paper} • Q{currentQuestion.questionNumber}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowShortcutsHelp(true)}
                className="hidden sm:inline-flex p-2 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-subtle)]/50 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                title="Shortcuts (?)"
              >
                <KeyboardIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedQuestionId(currentQuestion.id);
                  setCurrentView('main');
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-colors"
              >
                Open in Archive
              </button>
              <button
                type="button"
                onClick={() => setConfirmEndOpen(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-colors"
              >
                End Quiz
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 rounded-full bg-[var(--bg-subtle)] overflow-hidden">
            <div
              className="h-full bg-[var(--accent-primary)] transition-all duration-300 rounded-full"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {hasMultipleParts && (
            <div className="mt-3 px-3 py-2 rounded-xl bg-[var(--accent-gold-soft)] border border-[var(--accent-gold)]/25 text-xs text-[var(--accent-gold)] font-medium flex items-center justify-between gap-2">
              <span>
                Multi-part Question: <strong>Part {currentPartIndex + 1} of {relatedQuestions.length}</strong> (all related sub-parts are grouped in this quiz)
              </span>
            </div>
          )}
        </div>

        {/* Main Quiz Canvas */}
        <div className="flex-1 min-h-0 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-[var(--shadow-card)] flex flex-col overflow-hidden">
          <ScanStage
            src={showAnswer ? currentQuestion.answerImage : currentQuestion.image}
            alt={showAnswer ? `Answer ${currentQuestion.questionNumber}` : `Question ${currentQuestion.questionNumber}`}
            loadingText={showAnswer ? 'Loading mark scheme...' : 'Loading question...'}
            statusBadge={
              <div className="inline-flex p-0.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hairline)]">
                <button
                  type="button"
                  onClick={() => setShowAnswer(false)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    !showAnswer
                      ? 'bg-[var(--accent-primary)] text-white shadow-2xs'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Question
                </button>
                <button
                  type="button"
                  onClick={() => setShowAnswer(true)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    showAnswer
                      ? 'bg-[var(--accent-gold)] text-white shadow-2xs'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Answer
                </button>
              </div>
            }
          />

          {/* Quiz Action Dock */}
          <div className="flex-shrink-0 p-3.5 sm:p-4 border-t border-[var(--border-hairline)] bg-[var(--bg-subtle)]/40">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Prev / Next */}
              <div className="flex items-center justify-between sm:justify-start gap-2 order-2 sm:order-1">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentQuizIndex(prev => Math.max(0, prev - 1));
                    setShowAnswer(false);
                  }}
                  disabled={currentQuizIndex === 0}
                  className="inline-flex items-center gap-1 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-[var(--text-primary)] disabled:opacity-35"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (isLastQuestion) {
                      setQuizCompleted(true);
                    } else {
                      setCurrentQuizIndex(prev => prev + 1);
                      setShowAnswer(false);
                    }
                  }}
                  disabled={!showAnswer && userAnswer === undefined}
                  className="inline-flex items-center gap-1 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-[var(--text-primary)] disabled:opacity-35"
                >
                  <span>{isLastQuestion ? 'Finish' : 'Skip / Next'}</span>
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Self-grading or Reveal CTA */}
              <div className="flex-1 flex items-center justify-end gap-2.5 order-1 sm:order-2">
                {!showAnswer && userAnswer === undefined && (
                  <button
                    type="button"
                    onClick={() => setShowAnswer(true)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primary-hover)] transition-colors shadow-xs"
                  >
                    <FlipIcon className="w-4 h-4" />
                    <span>Reveal Answer (Space)</span>
                  </button>
                )}

                {showAnswer && userAnswer === undefined && (
                  <div className="w-full sm:w-auto flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleAnswerSubmit(false)}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors shadow-xs"
                    >
                      <XIcon className="w-4 h-4" />
                      <span>Missed It</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAnswerSubmit(true)}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primary-hover)] transition-colors shadow-xs"
                    >
                      <CheckIcon className="w-4 h-4" />
                      <span>Got It Right</span>
                    </button>
                  </div>
                )}

                {userAnswer !== undefined && (
                  <div
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold ${
                      userAnswer
                        ? 'bg-[var(--accent-primary-soft)] text-[var(--accent-primary)]'
                        : 'bg-red-500/10 text-red-600 dark:text-red-400'
                    }`}
                  >
                    {userAnswer ? <CheckIcon className="w-4 h-4" /> : <XIcon className="w-4 h-4" />}
                    <span>{userAnswer ? 'Marked Correct' : 'Marked for Review'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* End Quiz Confirmation Modal */}
        {confirmEndOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/45 flex items-center justify-center p-4">
            <div className="w-full max-w-sm rounded-lg bg-[var(--bg-surface)] border border-[var(--border-hairline)] p-6 shadow-[var(--shadow-popover)] animate-fade-up">
              <h3 className="font-serif-editorial text-xl font-semibold text-[var(--text-primary)] mb-2">
                End current quiz?
              </h3>
              <p className="text-sm text-[var(--text-secondary)] mb-5">
                Your current progress will be discarded and you&apos;ll return to the Quiz Builder.
              </p>
              <div className="flex items-center gap-2.5 justify-end">
                <button
                  type="button"
                  onClick={() => setConfirmEndOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--bg-subtle)] text-[var(--text-primary)]"
                >
                  Keep Studying
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmEndOpen(false);
                    setGeneratedQuiz(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 text-white hover:bg-red-700"
                >
                  End Quiz
                </button>
              </div>
            </div>
          </div>
        )}

        <ShortcutsModal
          isOpen={showShortcutsHelp}
          onClose={() => setShowShortcutsHelp(false)}
          shortcuts={QUIZ_SHORTCUTS}
        />
      </div>
    );
  }

  // ==================== BUILDER VIEW ====================
  return (
    <div className="max-w-5xl mx-auto w-full space-y-5 animate-fade-up">
      {/* Header + Quick Launchers */}
      <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-[var(--shadow-card)] p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[var(--accent-primary-soft)] text-[var(--accent-primary)] flex items-center justify-center flex-shrink-0">
              <TargetIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif-editorial text-2xl font-semibold text-[var(--text-primary)]">
                Custom Practice Quiz
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                Build a tailored test from past papers — related multi-part questions stay grouped together.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                const cfg = {
                  book: [9],
                  units: [],
                  topics: [],
                  types: [],
                  numberOfQuestions: 10,
                  includeSpecimen: true,
                };
                setQuizConfig(cfg);
                generateQuiz(cfg);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[var(--bg-subtle)] border border-[var(--border-hairline)] text-[var(--text-primary)] hover:border-[var(--accent-primary)] transition-colors"
            >
              <BookOpenIcon className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
              <span>Book 9 Quick 10</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const cfg = {
                  book: [10],
                  units: [],
                  topics: [],
                  types: [],
                  numberOfQuestions: 10,
                  includeSpecimen: true,
                };
                setQuizConfig(cfg);
                generateQuiz(cfg);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[var(--bg-subtle)] border border-[var(--border-hairline)] text-[var(--text-primary)] hover:border-[var(--accent-gold)] transition-colors"
            >
              <BookOpenIcon className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
              <span>Book 10 Quick 10</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Pill & Card Configurator */}
      <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-[var(--shadow-card)] p-5 sm:p-6 space-y-6">
        {/* 1. Book Selection Cards */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2.5">
            1. Select Syllabus Book
          </label>
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
            {[
              { value: null, title: 'All Books', sub: 'Grades 9 & 10' },
              { value: 9, title: 'Book 9', sub: 'Grade 9 Topics' },
              { value: 10, title: 'Book 10', sub: 'Grade 10 Topics' },
            ].map(item => {
              const isSelected =
                item.value === null
                  ? quizConfig.book.length === 0
                  : quizConfig.book.length === 1 && quizConfig.book[0] === item.value;
              return (
                <button
                  key={String(item.value)}
                  type="button"
                  onClick={() => toggleBook(item.value)}
                  className={`text-left p-3 sm:p-4 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-[var(--accent-primary-soft)] border-[var(--accent-primary)] shadow-2xs'
                      : 'bg-[var(--bg-canvas)] border-[var(--border-hairline)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <div className="text-sm font-bold text-[var(--text-primary)]">{item.title}</div>
                  <div className="text-xs text-[var(--text-secondary)] mt-0.5 hidden sm:block">{item.sub}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Multi-select Unit Pills */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              2. Units <span className="font-normal text-[var(--text-muted)]">(leave empty for all)</span>
            </label>
            {quizConfig.units.length > 0 && (
              <button
                type="button"
                onClick={() => setQuizConfig(p => ({ ...p, units: [] }))}
                className="text-xs font-semibold text-[var(--accent-primary)] hover:underline"
              >
                Reset Units
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {availableUnits.map(unit => {
              const active = quizConfig.units.includes(unit);
              return (
                <button
                  key={unit}
                  type="button"
                  onClick={() => toggleMultiField('units', unit)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                    active
                      ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)] shadow-2xs'
                      : 'bg-[var(--bg-canvas)] text-[var(--text-primary)] border-[var(--border-hairline)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <span className="font-mono-code text-[11px] opacity-75">U{unit}</span>
                  <span>{unitNames[unit]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Multi-select Question Type Pills */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              3. Question Types <span className="font-normal text-[var(--text-muted)]">(matches all selected)</span>
            </label>
            {quizConfig.types.length > 0 && (
              <button
                type="button"
                onClick={() => setQuizConfig(p => ({ ...p, types: [] }))}
                className="text-xs font-semibold text-[var(--accent-primary)] hover:underline"
              >
                Reset Types
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {availableQuestionTypes.map(type => {
              const active = quizConfig.types.includes(type.value);
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => toggleMultiField('types', type.value)}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                    active
                      ? 'bg-[var(--accent-gold)] text-white border-[var(--accent-gold)] shadow-2xs'
                      : 'bg-[var(--bg-canvas)] text-[var(--text-primary)] border-[var(--border-hairline)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  {type.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Count + Specimen Toggle */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-[var(--border-hairline)]">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2.5">
              4. Number of Questions
            </label>
            <div className="flex flex-wrap gap-2">
              {[5, 10, 15, 20, 30, 'all'].map(count => {
                const active = quizConfig.numberOfQuestions === count;
                return (
                  <button
                    key={String(count)}
                    type="button"
                    onClick={() => setQuizConfig(p => ({ ...p, numberOfQuestions: count }))}
                    className={`font-mono-code px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                      active
                        ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]'
                        : 'bg-[var(--bg-canvas)] text-[var(--text-primary)] border-[var(--border-hairline)] hover:border-[var(--border-strong)]'
                    }`}
                  >
                    {count === 'all' ? 'All' : count}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col justify-end">
            <label className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] cursor-pointer">
              <div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">
                  Include Specimen Papers
                </div>
                <div className="text-xs text-[var(--text-secondary)]">
                  2020 &amp; 2021 specimen practice sets
                </div>
              </div>
              <input
                type="checkbox"
                checked={quizConfig.includeSpecimen}
                onChange={(e) =>
                  setQuizConfig(p => ({ ...p, includeSpecimen: e.target.checked }))
                }
                className="w-5 h-5 accent-[var(--accent-primary)] rounded cursor-pointer"
              />
            </label>
          </div>
        </div>

        {quizNotice && (
          <div className="px-4 py-3 rounded-xl bg-[var(--accent-gold-soft)] border border-[var(--accent-gold)]/30 text-xs sm:text-sm font-medium text-[var(--accent-gold)]">
            {quizNotice}
          </div>
        )}

        {/* Live Matching Pool + Start CTA */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-[var(--border-hairline)]">
          <div className="flex items-center gap-2.5 text-sm">
            <EyeIcon className="w-4 h-4 text-[var(--accent-primary)]" />
            <span className="text-[var(--text-secondary)]">
              Matching pool:{' '}
              <strong className="font-mono-code text-[var(--text-primary)]">
                {matchingPool.length}
              </strong>{' '}
              question{matchingPool.length !== 1 ? 's' : ''}
            </span>
          </div>

          <button
            type="button"
            onClick={() => generateQuiz()}
            disabled={matchingPool.length === 0}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-medium bg-[var(--action-primary-bg)] text-[var(--action-primary-fg)] hover:bg-[var(--action-primary-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <TargetIcon className="w-4 h-4" />
            <span>Start Practice Quiz</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizGenerator;
