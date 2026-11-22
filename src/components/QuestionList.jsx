import React, { useEffect, useRef, useState, useMemo } from 'react';
import SmartText from './SmartText';
import { hasSavedNote } from '../utils/noteUtils';
import { ChevronLeftIcon, ChevronRightIcon, NoteIcon, StarIcon, BookOpenIcon } from './Icons';

const QuestionList = ({
  questions,
  selectedQuestionId,
  setSelectedQuestionId,
  unitNames,
  getTopicName,
  favorites,
  toggleFavorite,
  showFavorites: controlledShowFavorites,
  setShowFavorites: setControlledShowFavorites,
  noteVersion = 0,
}) => {
  const containerRef = useRef(null);
  const itemRefs = useRef({});

  const [currentPage, setCurrentPage] = useState(1);
  const [internalShowFavorites, setInternalShowFavorites] = useState(false);
  const showFavorites = controlledShowFavorites !== undefined ? controlledShowFavorites : internalShowFavorites;
  const setShowFavorites = setControlledShowFavorites || setInternalShowFavorites;

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

  // If selectedQuestionId changes externally (e.g. Next/Prev), sync page to keep it visible
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

  const goToNextPage = () => {
    if (safePage < totalPages) {
      setCurrentPage(safePage + 1);
      containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPrevPage = () => {
    if (safePage > 1) {
      setCurrentPage(safePage - 1);
      containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-[var(--shadow-card)] h-full overflow-hidden flex flex-col">
      {/* Header + Segmented Toggle */}
      <div className="p-3.5 border-b border-[var(--border-hairline)] bg-[var(--bg-subtle)]/45 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="font-serif-editorial font-semibold text-base text-[var(--text-primary)] leading-tight">
              Past Paper Questions
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5 font-mono-code">
              {questionsToDisplay.length === 0
                ? '0 items'
                : `Page ${safePage}/${totalPages} • ${questionsToDisplay.length} items`}
            </p>
          </div>
          <span className="font-mono-code text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--accent-primary-soft)] text-[var(--accent-primary)]">
            {questionsToDisplay.length}
          </span>
        </div>

        {/* All vs Favorites Segmented Control */}
        <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-hairline)]">
          <button
            type="button"
            onClick={() => setShowFavorites(false)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              !showFavorites
                ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-2xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            All ({questions.length})
          </button>
          <button
            type="button"
            onClick={() => setShowFavorites(true)}
            className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              showFavorites
                ? 'bg-[var(--accent-gold-soft)] text-[var(--accent-gold)] border border-[var(--accent-gold)]/25 shadow-2xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <StarIcon className="w-3.5 h-3.5" filled={showFavorites} />
            <span>Saved ({favMatchesCount})</span>
          </button>
        </div>
      </div>

      {/* Scrollable Question Cards */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-2.5 space-y-2 scholar-scroll"
        style={{ WebkitOverflowScrolling: 'touch', touchAction: 'manipulation' }}
      >
        {currentQuestions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-5 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[var(--bg-subtle)] text-[var(--text-muted)] flex items-center justify-center mb-3">
              {showFavorites ? (
                <StarIcon className="w-6 h-6 text-[var(--accent-gold)]" filled />
              ) : (
                <BookOpenIcon className="w-6 h-6" />
              )}
            </div>
            <h4 className="font-serif-editorial text-base font-semibold text-[var(--text-primary)] mb-1">
              {showFavorites ? 'No Saved Questions' : 'No Questions Found'}
            </h4>
            <p className="text-xs text-[var(--text-secondary)] max-w-[220px] leading-relaxed">
              {showFavorites
                ? 'Star any question while studying to bookmark it here.'
                : 'Try adjusting your active filter criteria to broaden results.'}
            </p>
          </div>
        ) : (
          currentQuestions.map((q) => {
            const isSelected = Number(selectedQuestionId) === Number(q.id);
            const isFavorite = favorites.includes(q.id);
            const isSpecimen = (q.year === 2021 && q.paperSet === 2) || (q.year === 2020 && q.paperSet === 1);
            const hasNote = hasSavedNote(`question_notes_${q.id}`);
            // Read noteVersion to keep lint happy and ensure live re-evaluation
            void noteVersion;

            return (
              <div
                key={q.id}
                ref={(el) => (itemRefs.current[q.id] = el)}
                onClick={() => setSelectedQuestionId(q.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedQuestionId(q.id);
                  }
                }}
                className={`group relative cursor-pointer p-3 rounded-xl border transition-all duration-150 ${
                  isSelected
                    ? 'bg-[var(--accent-primary-soft)] border-[var(--accent-primary)] shadow-xs'
                    : 'bg-[var(--bg-surface)] border-[var(--border-hairline)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-subtle)]/40'
                }`}
              >
                {/* Active vertical indicator */}
                {isSelected && (
                  <span className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-[var(--accent-primary)]" />
                )}

                <div className="flex items-start justify-between gap-2.5 pl-1">
                  <div className="flex-1 min-w-0">
                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                      <span
                        className={`font-mono-code text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${
                          isSelected
                            ? 'bg-[var(--accent-primary)] text-white'
                            : 'bg-[var(--bg-subtle)] text-[var(--text-primary)]'
                        }`}
                      >
                        Q{q.questionNumber}
                      </span>
                      <span className="font-mono-code text-[11px] text-[var(--text-secondary)]">
                        {q.year} • P{q.paper} • B{q.book}
                      </span>
                      {isSpecimen && (
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--accent-gold-soft)] text-[var(--accent-gold)]">
                          Specimen
                        </span>
                      )}
                    </div>

                    {/* Unit name */}
                    <div className="text-xs font-bold text-[var(--accent-primary)] mb-0.5">
                      Unit {q.unit}: {unitNames[q.unit] || `Unit ${q.unit}`}
                    </div>

                    {/* Dhivehi Topic */}
                    <SmartText
                      as="div"
                      className="text-[13px] text-[var(--text-primary)] leading-[1.9] line-clamp-2 text-right w-full"
                    >
                      {getTopicName(q.book, q.unit, q.topic)}
                    </SmartText>
                  </div>

                  {/* Right Actions */}
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(q.id);
                      }}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isFavorite
                          ? 'text-[var(--accent-gold)] bg-[var(--accent-gold-soft)]'
                          : 'text-[var(--text-muted)] hover:text-[var(--accent-gold)] hover:bg-[var(--bg-subtle)]'
                      }`}
                      title={isFavorite ? 'Remove favorite' : 'Add to favorites'}
                    >
                      <StarIcon className="w-4 h-4" filled={isFavorite} />
                    </button>
                    {hasNote && (
                      <span
                        className="p-1 text-[var(--accent-primary)]"
                        title="Has personal notes"
                      >
                        <NoteIcon className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex-shrink-0 px-3 py-2.5 border-t border-[var(--border-hairline)] bg-[var(--bg-subtle)]/45 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={goToPrevPage}
            disabled={safePage === 1}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-[var(--text-primary)] hover:border-[var(--border-strong)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeftIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Prev</span>
          </button>

          <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
            <select
              aria-label="Select page"
              value={safePage}
              onChange={(e) => {
                setCurrentPage(Number(e.target.value));
                containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="font-mono-code text-xs px-2 py-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
            >
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <option key={p} value={p}>
                  {p} / {totalPages}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={goToNextPage}
            disabled={safePage === totalPages}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-[var(--text-primary)] hover:border-[var(--border-strong)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default QuestionList;
