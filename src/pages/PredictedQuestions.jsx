import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Select from 'react-select';
import { useTheme } from '../context/ThemeContext';
import { topicNames, getTopicName } from '../topicNames';
import { getScholarSelectStyles } from '../utils/selectTheme';
import SmartText from '../components/SmartText';
import ScanStage from '../components/ScanStage';
import PagePicker from '../components/PagePicker';
import ShortcutsModal from '../components/ShortcutsModal';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  FilterIcon,
  ChevronDownIcon,
  FlipIcon,
  KeyboardIcon,
  SparklesIcon,
  StarIcon,
  XIcon,
} from '../components/Icons';

const PREDICTED_SHORTCUTS = [
  { label: 'Previous question', keys: ['←'] },
  { label: 'Next question', keys: ['→'] },
  { label: 'Toggle Question / Answer', keys: ['Space'] },
  { label: 'Toggle Favorite', keys: ['F'] },
  { label: 'Keyboard shortcuts', keys: ['?'] },
];

const PredictedQuestionList = ({
  questions,
  selectedQuestionId,
  setSelectedQuestionId,
  unitNames,
  getTopicName: getTopicNameFn,
  favorites,
  toggleFavorite,
  questionTypes,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [showFavorites, setShowFavorites] = useState(false);
  const questionsPerPage = 10;

  const favMatchesCount = useMemo(
    () => questions.filter(q => favorites.includes(q.id)).length,
    [questions, favorites]
  );

  const questionsToDisplay = useMemo(
    () => (showFavorites ? questions.filter(q => favorites.includes(q.id)) : questions),
    [showFavorites, questions, favorites]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [questions.length, showFavorites]);

  useEffect(() => {
    if (!selectedQuestionId) return;
    const idx = questionsToDisplay.findIndex(q => Number(q.id) === Number(selectedQuestionId));
    if (idx !== -1) {
      const targetPage = Math.floor(idx / questionsPerPage) + 1;
      if (targetPage !== currentPage) {
        setCurrentPage(targetPage);
      }
    }
  }, [selectedQuestionId, questionsToDisplay, currentPage]);

  const totalPages = Math.max(1, Math.ceil(questionsToDisplay.length / questionsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * questionsPerPage;
  const currentQuestions = questionsToDisplay.slice(startIndex, startIndex + questionsPerPage);

  return (
    <div className="rounded-lg bg-[var(--bg-surface)] border border-[var(--border-hairline)] h-full overflow-hidden flex flex-col">
      <div className="p-3 border-b border-[var(--border-hairline)] bg-[var(--bg-inset)] space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="font-editorial font-semibold text-[15px] text-[var(--ink-primary)] leading-tight">
              Predicted Bank
            </h3>
            <p className="text-[11px] text-[var(--ink-muted)] mt-0.5 font-mono-code tabular-nums">
              {questionsToDisplay.length === 0
                ? '0 items'
                : `Page ${safePage}/${totalPages} · ${questionsToDisplay.length} items`}
            </p>
          </div>
          <span className="font-mono-code tabular-nums text-xs font-medium px-2 py-0.5 rounded bg-[var(--subject-islam-bg)] text-[var(--subject-islam)] border border-[var(--subject-islam-border)]">
            {questionsToDisplay.length}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-0.5 p-0.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-warm-strong)]">
          <button
            type="button"
            onClick={() => setShowFavorites(false)}
            className={`inline-flex items-center justify-center px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
              !showFavorites
                ? 'bg-[var(--action-primary-bg)] text-[var(--action-primary-fg)]'
                : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
            }`}
          >
            All ({questions.length})
          </button>
          <button
            type="button"
            onClick={() => setShowFavorites(true)}
            className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
              showFavorites
                ? 'bg-[var(--action-primary-bg)] text-[var(--action-primary-fg)]'
                : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
            }`}
          >
            <StarIcon
              className={`w-3.5 h-3.5 shrink-0 ${showFavorites ? '' : 'text-[var(--subject-islam)]'}`}
              filled={showFavorites}
            />
            <span>Saved ({favMatchesCount})</span>
          </button>
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto p-2.5 space-y-2 scholar-scroll"
        style={{ WebkitOverflowScrolling: 'touch', touchAction: 'manipulation' }}
      >
        {currentQuestions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-5 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[var(--accent-gold-soft)] text-[var(--accent-gold)] flex items-center justify-center mb-3">
              {showFavorites ? <StarIcon className="w-6 h-6" filled /> : <SparklesIcon className="w-6 h-6" />}
            </div>
            <h4 className="font-serif-editorial text-base font-semibold text-[var(--text-primary)] mb-1">
              {showFavorites ? 'No Saved Predictions' : 'No Questions Found'}
            </h4>
            <p className="text-xs text-[var(--text-secondary)] max-w-[220px] leading-relaxed">
              {showFavorites
                ? 'Star predicted questions to bookmark them for quick revision.'
                : 'Try adjusting your filters to see more predicted questions.'}
            </p>
          </div>
        ) : (
          currentQuestions.map((q) => {
            const isSelected = Number(selectedQuestionId) === Number(q.id);
            const isFavorite = favorites.includes(q.id);

            return (
              <div
                key={q.id}
                onClick={() => setSelectedQuestionId(q.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedQuestionId(q.id);
                  }
                }}
                className={`relative cursor-pointer p-3 rounded-xl border transition-all duration-150 ${
                  isSelected
                    ? 'bg-[var(--accent-gold-soft)] border-[var(--accent-gold)] shadow-xs'
                    : 'bg-[var(--bg-surface)] border-[var(--border-hairline)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-subtle)]/40'
                }`}
              >
                {isSelected && (
                  <span className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-[var(--accent-gold)]" />
                )}

                <div className="flex items-start justify-between gap-2.5 pl-1">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <span
                        className={`font-mono-code text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${
                          isSelected
                            ? 'bg-[var(--accent-gold)] text-white'
                            : 'bg-[var(--bg-subtle)] text-[var(--text-primary)]'
                        }`}
                      >
                        Book {q.book}
                      </span>
                      <span className="text-[11px] font-semibold text-[var(--accent-primary)]">
                        {unitNames[q.unit] || `Unit ${q.unit}`}
                      </span>
                    </div>

                    <SmartText
                      as="div"
                      className="text-[13px] text-[var(--text-primary)] leading-[1.9] line-clamp-2 text-right w-full"
                    >
                      {getTopicNameFn(q.book, q.unit, q.topic)}
                    </SmartText>

                    <div className="font-mono-code text-[11px] text-[var(--text-muted)] mt-1">
                      {q.types.map(type => questionTypes[type] || `Type ${type}`).join(' • ')}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(q.id);
                    }}
                    className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${
                      isFavorite
                        ? 'text-[var(--accent-gold)] bg-[var(--accent-gold-soft)]'
                        : 'text-[var(--text-muted)] hover:text-[var(--accent-gold)] hover:bg-[var(--bg-subtle)]'
                    }`}
                  >
                    <StarIcon className="w-4 h-4" filled={isFavorite} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex-shrink-0 px-3 py-2 border-t border-[var(--border-hairline)] bg-[var(--bg-inset)] flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-[var(--ink-primary)] disabled:opacity-40 transition-colors"
          >
            <ChevronLeftIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Prev</span>
          </button>

          <PagePicker
            currentPage={safePage}
            totalPages={totalPages}
            onChange={setCurrentPage}
            ariaLabel="Select predicted page"
          />

          <button
            type="button"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-[var(--ink-primary)] disabled:opacity-40 transition-colors"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRightIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

const PredictedQuestionViewer = ({
  question,
  questions,
  setSelectedQuestionId,
  unitNames,
  questionTypes,
  getTopicName: getTopicNameFn,
  onToggleFavorite,
  isFavorite,
  onBackToList,
  onOpenShortcuts,
}) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const [showFavoriteFeedback, setShowFavoriteFeedback] = useState(false);

  useEffect(() => {
    setShowAnswer(false);
  }, [question]);

  const currentIndex = question
    ? questions.findIndex(q => Number(q.id) === Number(question.id))
    : -1;
  const totalQuestions = questions.length;
  const isFirstQuestion = currentIndex <= 0;
  const isLastQuestion = currentIndex === totalQuestions - 1;

  const goNext = useCallback(() => {
    if (currentIndex >= 0 && currentIndex < totalQuestions - 1) {
      setSelectedQuestionId(questions[currentIndex + 1].id);
    }
  }, [currentIndex, totalQuestions, questions, setSelectedQuestionId]);

  const goPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setSelectedQuestionId(questions[currentIndex - 1].id);
    }
  }, [currentIndex, questions, setSelectedQuestionId]);

  const handleFavorite = useCallback(() => {
    if (!question) return;
    onToggleFavorite(question.id);
    setShowFavoriteFeedback(true);
    setTimeout(() => setShowFavoriteFeedback(false), 1800);
  }, [question, onToggleFavorite]);

  useEffect(() => {
    if (!question) return;
    const handleKeyPress = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          goPrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goNext();
          break;
        case ' ':
        case 'Spacebar':
          e.preventDefault();
          setShowAnswer(prev => !prev);
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          handleFavorite();
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [question, goNext, goPrevious, handleFavorite]);

  if (!question) {
    return (
      <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-[var(--shadow-card)] h-full flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-[var(--accent-gold-soft)] text-[var(--accent-gold)] flex items-center justify-center mx-auto mb-4">
            <SparklesIcon className="w-8 h-8" />
          </div>
          <h3 className="font-serif-editorial text-2xl font-semibold text-[var(--text-primary)] mb-2">
            Teacher&apos;s Predictions
          </h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-5">
            Select a predicted question from the list to practice high-likelihood exam topics and check answers.
          </p>
          {questions?.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedQuestionId(questions[0].id)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-[var(--action-primary-bg)] text-[var(--action-primary-fg)] hover:bg-[var(--action-primary-hover)] transition-colors"
            >
              <span>Open First Prediction</span>
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-[var(--shadow-card)] h-full flex flex-col min-h-0 overflow-hidden">
      {showFavoriteFeedback && (
        <div className="fixed top-20 right-4 z-50 animate-fade-up">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--accent-gold)]/40 shadow-lg text-sm font-semibold text-[var(--text-primary)]">
            <StarIcon className="w-4 h-4 text-[var(--accent-gold)]" filled={isFavorite} />
            <span>{isFavorite ? 'Added to saved items' : 'Removed from saved items'}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex-shrink-0 px-4 sm:px-5 py-3.5 border-b border-[var(--border-hairline)] bg-[var(--bg-subtle)]/35 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {onBackToList && (
              <button
                type="button"
                onClick={onBackToList}
                className="lg:hidden inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-[var(--text-primary)]"
              >
                <ChevronLeftIcon className="w-4 h-4" />
                <span>List</span>
              </button>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-serif-editorial text-xl sm:text-2xl font-semibold text-[var(--text-primary)] leading-none">
                {showAnswer ? 'Predicted Answer' : 'Predicted Question'}
              </h2>
              <span className="font-mono-code text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--accent-gold-soft)] text-[var(--accent-gold)]">
                {currentIndex + 1} / {totalQuestions}
              </span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <div className="inline-flex items-center rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-0.5">
              <button
                type="button"
                onClick={goPrevious}
                disabled={isFirstQuestion}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] disabled:opacity-35 transition-colors"
              >
                <ChevronLeftIcon className="w-4 h-4" />
                <span className="hidden md:inline">Prev</span>
              </button>
              <span className="w-px h-4 bg-[var(--border-hairline)]" />
              <button
                type="button"
                onClick={goNext}
                disabled={isLastQuestion}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] disabled:opacity-35 transition-colors"
              >
                <span className="hidden md:inline">Next</span>
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowAnswer(prev => !prev)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                showAnswer
                  ? 'bg-[var(--subject-islam)] text-white hover:opacity-90'
                  : 'bg-[var(--action-primary-bg)] text-[var(--action-primary-fg)] hover:bg-[var(--action-primary-hover)]'
              }`}
            >
              <FlipIcon className="w-3.5 h-3.5" />
              <span>{showAnswer ? 'View Question' : 'Reveal Answer'}</span>
            </button>

            <button
              type="button"
              onClick={handleFavorite}
              className={`p-2 rounded-xl border transition-colors ${
                isFavorite
                  ? 'bg-[var(--accent-gold-soft)] border-[var(--accent-gold)]/40 text-[var(--accent-gold)]'
                  : 'bg-[var(--bg-surface)] border-[var(--border-hairline)] text-[var(--text-secondary)] hover:text-[var(--accent-gold)]'
              }`}
              title="Favorite (F)"
            >
              <StarIcon className="w-4 h-4" filled={isFavorite} />
            </button>

            <button
              type="button"
              onClick={onOpenShortcuts}
              className="hidden md:inline-flex p-2 rounded-xl border bg-[var(--bg-surface)] border-[var(--border-hairline)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              title="Keyboard shortcuts (?)"
            >
              <KeyboardIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Metadata Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-mono-code px-2.5 py-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-[var(--text-primary)] font-semibold">
            Book {question.book}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-[var(--accent-primary)] font-semibold">
            Unit {question.unit}: {unitNames[question.unit]}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-[var(--text-secondary)] font-medium">
            {question.types.map(type => questionTypes[type]).join(', ')}
          </span>
          <div className="px-3 py-0.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-[var(--text-primary)] max-w-full">
            <SmartText className="text-xs sm:text-[13px] leading-[1.9]">
              {getTopicNameFn(question.book, question.unit, question.topic)}
            </SmartText>
          </div>
        </div>
      </div>

      {/* Document Scan Stage */}
      <ScanStage
        src={showAnswer ? question.answerImage : question.image}
        alt={showAnswer ? 'Predicted Answer' : 'Predicted Question'}
        loadingText={showAnswer ? 'Loading answer...' : 'Loading predicted question...'}
        statusBadge={
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
              showAnswer
                ? 'bg-[var(--accent-gold-soft)] text-[var(--accent-gold)] border border-[var(--accent-gold)]/30'
                : 'bg-[var(--accent-primary-soft)] text-[var(--accent-primary)] border border-[var(--accent-primary)]/25'
            }`}
          >
            <EyeIcon className="w-3.5 h-3.5" />
            <span>{showAnswer ? 'Viewing Answer' : 'Viewing Prediction'}</span>
          </span>
        }
      />

      {/* Mobile Sticky Action Bar */}
      <div className="sm:hidden flex-shrink-0 px-3 py-2.5 border-t border-[var(--border-hairline)] bg-[var(--bg-surface)] grid grid-cols-4 gap-2 items-center">
        <button
          type="button"
          onClick={goPrevious}
          disabled={isFirstQuestion}
          className="flex flex-col items-center justify-center py-1.5 rounded-xl bg-[var(--bg-subtle)] text-[var(--text-primary)] disabled:opacity-35 text-[10px] font-semibold"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          <span>Prev</span>
        </button>
        <button
          type="button"
          onClick={handleFavorite}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl text-[10px] font-semibold ${
            isFavorite
              ? 'bg-[var(--accent-gold-soft)] text-[var(--accent-gold)]'
              : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)]'
          }`}
        >
          <StarIcon className="w-4 h-4" filled={isFavorite} />
          <span>Save</span>
        </button>
        <button
          type="button"
          onClick={() => setShowAnswer(prev => !prev)}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl text-white text-[10px] font-bold ${
            showAnswer ? 'bg-[var(--accent-gold)]' : 'bg-[var(--accent-primary)]'
          }`}
        >
          <FlipIcon className="w-4 h-4" />
          <span>{showAnswer ? 'Question' : 'Answer'}</span>
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={isLastQuestion}
          className="flex flex-col items-center justify-center py-1.5 rounded-xl bg-[var(--bg-subtle)] text-[var(--text-primary)] disabled:opacity-35 text-[10px] font-semibold"
        >
          <ChevronRightIcon className="w-4 h-4" />
          <span>Next</span>
        </button>
      </div>
    </div>
  );
};

const PredictedQuestions = ({
  predictedQuestions,
  unitNames,
  questionTypes,
  getTopicName: getTopicNameProp,
  onToggleFavorite,
  favorites,
  initialFilters = null,
}) => {
  const { isDark } = useTheme();
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState(() => initialFilters || {});
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  useEffect(() => {
    if (initialFilters && Object.keys(initialFilters).length > 0) {
      setSelectedFilters(initialFilters);
      setSelectedQuestionId(null);
    }
  }, [initialFilters]);

  const customStyles = useMemo(() => getScholarSelectStyles(isDark), [isDark]);

  const options = useMemo(
    () => ({
      book: [...new Set(predictedQuestions.map(q => q.book))].sort((a, b) => a - b),
      unit: [...new Set(predictedQuestions.map(q => q.unit))].sort((a, b) => a - b),
      types: [...new Set(predictedQuestions.flatMap(q => q.types))].sort((a, b) => a - b),
    }),
    [predictedQuestions]
  );

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      if (e.key === '?') {
        e.preventDefault();
        setShowShortcutsHelp(prev => !prev);
      } else if (e.key === 'Escape') {
        setShowShortcutsHelp(false);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const getAvailableTopics = useCallback(() => {
    const selectedBook = selectedFilters.book?.[0];
    const selectedUnit = selectedFilters.unit?.[0];
    if (selectedBook && selectedUnit && topicNames?.[selectedBook]?.[selectedUnit]) {
      return Object.keys(topicNames[selectedBook][selectedUnit]).map(topicId => {
        const topicName = topicNames[selectedBook][selectedUnit][topicId];
        return {
          value: topicId,
          label: (
            <span className="inline-flex items-center gap-1.5">
              <span className="font-mono-code text-xs opacity-70">{topicId}.</span>
              <span className="dhivehi-text" lang="dv" dir="rtl">{topicName}</span>
            </span>
          ),
        };
      });
    }
    return [];
  }, [selectedFilters.book, selectedFilters.unit]);

  const formattedOptions = useMemo(
    () => ({
      book: options.book.map(book => ({ value: book, label: `Book ${book}` })),
      unit: options.unit.map(unit => ({ value: unit, label: unitNames[unit] || `Unit ${unit}` })),
      topic: getAvailableTopics(),
      types: options.types.map(type => ({
        value: type,
        label: questionTypes[type] || `Type ${type}`,
      })),
    }),
    [options, unitNames, questionTypes, getAvailableTopics]
  );

  const filteredQuestions = useMemo(() => {
    return predictedQuestions.filter(q =>
      Object.entries(selectedFilters).every(([field, values]) => {
        if (!values || values.length === 0) return true;
        if (field === 'types') {
          return values.every(selectedType => q.types.includes(selectedType));
        }
        if (field === 'topic') {
          const questionTopic = String(q.topic);
          const selectedTopics = values.map(v => String(v));
          return selectedTopics.some(selectedTopic => {
            if (questionTopic.includes('_')) {
              return questionTopic.split('_').includes(selectedTopic);
            }
            return questionTopic === selectedTopic;
          });
        }
        return values.map(v => String(v)).includes(String(q[field]));
      })
    );
  }, [predictedQuestions, selectedFilters]);

  const activeQuestion = useMemo(
    () => filteredQuestions.find(q => Number(q.id) === Number(selectedQuestionId)),
    [filteredQuestions, selectedQuestionId]
  );

  const handleFilterChange = (field, selectedOptions) => {
    const values = selectedOptions ? selectedOptions.map(o => o.value) : [];
    setSelectedFilters(prev => {
      const next = { ...prev, [field]: values };
      if (field === 'book' || field === 'unit') next.topic = [];
      return next;
    });
  };

  const removeChip = (field, val) => {
    setSelectedFilters(prev => {
      const updated = (prev[field] || []).filter(v => String(v) !== String(val));
      const next = { ...prev, [field]: updated };
      if ((field === 'book' || field === 'unit') && updated.length === 0) next.topic = [];
      return next;
    });
  };

  const getCurrentValues = (field) => {
    if (field === 'topic') {
      const availableTopics = getAvailableTopics();
      return (
        selectedFilters.topic?.map(topicId => {
          const found = availableTopics.find(t => String(t.value) === String(topicId));
          return found || { value: topicId, label: `Topic ${topicId}` };
        }) || []
      );
    }
    return (
      selectedFilters[field]?.map(value => {
        const opt = formattedOptions[field].find(o => o.value === value);
        return opt || { value, label: String(value) };
      }) || []
    );
  };

  const activeFilterCount = Object.values(selectedFilters).reduce((acc, arr) => acc + (arr?.length || 0), 0);

  return (
    <div className="flex-1 flex flex-col min-h-0 gap-3 lg:gap-4">
      {/* Compact Header & Collapsible Filter Bar */}
      <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-[var(--shadow-card)]">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--accent-gold-soft)] text-[var(--accent-gold)] flex items-center justify-center flex-shrink-0">
              <SparklesIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif-editorial text-lg sm:text-xl font-semibold text-[var(--text-primary)] leading-tight">
                Predicted Questions
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                High-likelihood exam topics curated by teachers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={() => setFiltersExpanded(prev => !prev)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                filtersExpanded || activeFilterCount > 0
                  ? 'bg-[var(--accent-gold-soft)] text-[var(--accent-gold)] border-[var(--accent-gold)]/35'
                  : 'bg-[var(--bg-subtle)] text-[var(--text-primary)] border-[var(--border-hairline)]'
              }`}
            >
              <FilterIcon className="w-3.5 h-3.5" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="font-mono-code text-[11px] px-1.5 rounded-full bg-[var(--accent-gold)] text-white">
                  {activeFilterCount}
                </span>
              )}
              <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform ${filtersExpanded ? 'rotate-180' : ''}`} />
            </button>

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={() => setSelectedFilters({})}
                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                Clear
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowShortcutsHelp(true)}
              className="hidden sm:inline-flex p-2 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-subtle)]/50 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              title="Keyboard shortcuts (?)"
            >
              <KeyboardIcon className="w-4 h-4" />
            </button>

            <span className="font-mono-code text-xs font-semibold px-2.5 py-1 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-hairline)] text-[var(--text-secondary)]">
              {filteredQuestions.length} / {predictedQuestions.length}
            </span>
          </div>
        </div>

        {/* Active Chips */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 px-4 pb-2.5">
            {selectedFilters.book?.map(book => (
              <button
                key={`b-${book}`}
                type="button"
                onClick={() => removeChip('book', book)}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--accent-primary-soft)] text-[var(--accent-primary)] hover:bg-[var(--accent-primary)] hover:text-white transition-colors"
              >
                <span>Book {book}</span>
                <XIcon className="w-3 h-3" />
              </button>
            ))}
            {selectedFilters.unit?.map(unit => (
              <button
                key={`u-${unit}`}
                type="button"
                onClick={() => removeChip('unit', unit)}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--accent-primary-soft)] text-[var(--accent-primary)] hover:bg-[var(--accent-primary)] hover:text-white transition-colors"
              >
                <span>{unitNames[unit]}</span>
                <XIcon className="w-3 h-3" />
              </button>
            ))}
            {selectedFilters.topic?.map(topic => {
              const b = selectedFilters.book?.[0];
              const u = selectedFilters.unit?.[0];
              const tName = b && u ? getTopicName(b, u, topic) : `Topic ${topic}`;
              return (
                <button
                  key={`t-${topic}`}
                  type="button"
                  onClick={() => removeChip('topic', topic)}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--accent-gold-soft)] text-[var(--accent-gold)] hover:bg-[var(--accent-gold)] hover:text-white transition-colors"
                >
                  <SmartText>{tName}</SmartText>
                  <XIcon className="w-3 h-3" />
                </button>
              );
            })}
            {selectedFilters.types?.map(type => (
              <button
                key={`tp-${type}`}
                type="button"
                onClick={() => removeChip('types', type)}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--bg-subtle)] text-[var(--text-primary)] border border-[var(--border-hairline)] hover:border-red-400 transition-colors"
              >
                <span>{questionTypes[type]}</span>
                <XIcon className="w-3 h-3" />
              </button>
            ))}
          </div>
        )}

        {/* Filter Select Tray */}
        {filtersExpanded && (
          <div className="px-4 pb-4 pt-3 border-t border-[var(--border-hairline)] bg-[var(--bg-subtle)]/35 rounded-b-2xl animate-fade-up">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                  Book
                </label>
                <Select
                  options={formattedOptions.book}
                  isMulti
                  placeholder="All Books"
                  value={getCurrentValues('book')}
                  onChange={sel => handleFilterChange('book', sel)}
                  styles={customStyles}
                  className="text-xs sm:text-sm"
                  menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                  Unit
                </label>
                <Select
                  options={formattedOptions.unit}
                  isMulti
                  placeholder="All Units"
                  value={getCurrentValues('unit')}
                  onChange={sel => handleFilterChange('unit', sel)}
                  styles={customStyles}
                  className="text-xs sm:text-sm"
                  menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                  Topic
                </label>
                <Select
                  options={formattedOptions.topic}
                  isMulti
                  placeholder={!selectedFilters.book?.length || !selectedFilters.unit?.length ? 'Pick book & unit' : 'All Topics'}
                  value={getCurrentValues('topic')}
                  onChange={sel => handleFilterChange('topic', sel)}
                  styles={customStyles}
                  className="text-xs sm:text-sm"
                  isDisabled={!selectedFilters.book?.length || !selectedFilters.unit?.length}
                  menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                  Question Type
                </label>
                <Select
                  options={formattedOptions.types}
                  isMulti
                  placeholder="All Types"
                  value={getCurrentValues('types')}
                  onChange={sel => handleFilterChange('types', sel)}
                  styles={customStyles}
                  className="text-xs sm:text-sm"
                  menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Unified Split-Pane Workspace with Mobile Master-Detail Drill-Down */}
      <div className="flex flex-col lg:flex-row gap-3.5 flex-1 min-h-0 lg:h-[calc(100dvh-13.25rem)]">
        <div
          className={`w-full lg:w-80 xl:w-96 flex-shrink-0 flex flex-col min-h-0 ${
            activeQuestion ? 'hidden lg:flex' : 'flex flex-1 lg:flex-none'
          }`}
        >
          <PredictedQuestionList
            questions={filteredQuestions}
            selectedQuestionId={selectedQuestionId}
            setSelectedQuestionId={setSelectedQuestionId}
            unitNames={unitNames}
            getTopicName={getTopicNameProp}
            favorites={favorites}
            toggleFavorite={onToggleFavorite}
            questionTypes={questionTypes}
          />
        </div>

        <div
          className={
            activeQuestion
              ? 'fixed inset-0 z-40 bg-[var(--bg-canvas)] p-2 flex flex-col lg:static lg:inset-auto lg:z-auto lg:bg-transparent lg:p-0 lg:flex-1 lg:min-w-0 lg:min-h-0'
              : 'hidden lg:flex lg:flex-1 lg:min-w-0 lg:flex-col lg:min-h-0'
          }
        >
          <PredictedQuestionViewer
            question={activeQuestion}
            questions={filteredQuestions}
            setSelectedQuestionId={setSelectedQuestionId}
            unitNames={unitNames}
            questionTypes={questionTypes}
            getTopicName={getTopicNameProp}
            onToggleFavorite={onToggleFavorite}
            isFavorite={selectedQuestionId ? favorites.includes(selectedQuestionId) : false}
            onBackToList={() => setSelectedQuestionId(null)}
            onOpenShortcuts={() => setShowShortcutsHelp(true)}
          />
        </div>
      </div>

      <ShortcutsModal
        isOpen={showShortcutsHelp}
        onClose={() => setShowShortcutsHelp(false)}
        shortcuts={PREDICTED_SHORTCUTS}
      />
    </div>
  );
};

export default PredictedQuestions;
