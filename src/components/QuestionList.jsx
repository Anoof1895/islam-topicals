import React, { useEffect, useRef, useState, useMemo } from 'react';
import SmartText from './SmartText';
import PagePicker from './PagePicker';
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
  const showFavorites =
    controlledShowFavorites !== undefined ? controlledShowFavorites : internalShowFavorites;
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

  const goToPage = (page) => {
    setCurrentPage(page);
    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToNextPage = () => {
    if (safePage < totalPages) goToPage(safePage + 1);
  };

  const goToPrevPage = () => {
    if (safePage > 1) goToPage(safePage - 1);
  };

  return (
    <div className="rounded-lg bg-[var(--bg-surface)] border border-[var(--border-hairline)] h-full overflow-hidden flex flex-col">
      {/* Pane Sub-Header + Single-Line All | Saved Control */}
      <div className="p-3 border-b border-[var(--border-hairline)] bg-[var(--bg-inset)] space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-editorial font-semibold text-[15px] text-[var(--ink-primary)] leading-tight">
              Past Paper Questions
            </h3>
            <p className="text-[11px] text-[var(--ink-muted)] mt-0.5 font-mono-code tabular-nums">
              {questionsToDisplay.length === 0
                ? '0 items'
                : `Page ${safePage}/${totalPages} · ${questionsToDisplay.length} items`}
            </p>
          </div>
          <span className="font-mono-code tabular-nums text-xs font-medium px-2 py-0.5 rounded bg-[var(--subject-biology-bg)] text-[var(--subject-biology)] border border-[var(--subject-biology-border)] shrink-0">
            {questionsToDisplay.length}
          </span>
        </div>

        {/* Single-line All | Saved Segmented Control */}
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

      {/* Scrollable Question Cards */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-2 space-y-1.5 scholar-scroll"
        style={{ WebkitOverflowScrolling: 'touch', touchAction: 'manipulation' }}
      >
        {currentQuestions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-5 text-center">
            <div className="w-11 h-11 rounded-lg bg-[var(--bg-inset)] border border-[var(--border-hairline)] text-[var(--ink-muted)] flex items-center justify-center mb-3">
              {showFavorites ? (
                <StarIcon className="w-5 h-5 text-[var(--subject-islam)]" filled />
              ) : (
                <BookOpenIcon className="w-5 h-5" />
              )}
            </div>
            <h4 className="font-editorial text-base font-semibold text-[var(--ink-primary)] mb-1">
              {showFavorites ? 'No Saved Questions' : 'No Questions Found'}
            </h4>
            <p className="text-xs text-[var(--ink-secondary)] max-w-[220px] leading-relaxed">
              {showFavorites
                ? 'Star any question while studying to bookmark it here.'
                : 'Try adjusting your active filter criteria to broaden results.'}
            </p>
          </div>
        ) : (
          currentQuestions.map((q) => {
            const isSelected = Number(selectedQuestionId) === Number(q.id);
            const isFavorite = favorites.includes(q.id);
            const isSpecimen =
              (q.year === 2021 && q.paperSet === 2) || (q.year === 2020 && q.paperSet === 1);
            const hasNote = hasSavedNote(`question_notes_${q.id}`);
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
                className={`group relative cursor-pointer p-3 rounded-lg border transition-colors duration-150 ${
                  isSelected
                    ? 'bg-[var(--subject-biology-bg)] border-[var(--subject-biology)] border-l-[3px]'
                    : 'bg-[var(--bg-surface)] border-[var(--border-hairline)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-inset)]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <span
                        className={`font-mono-code tabular-nums text-[11px] font-semibold px-1.5 py-0.5 rounded ${
                          isSelected
                            ? 'bg-[var(--subject-biology)] text-white'
                            : 'bg-[var(--bg-subtle)] text-[var(--ink-primary)]'
                        }`}
                      >
                        Q{q.questionNumber}
                      </span>
                      <span className="font-mono-code tabular-nums text-[11px] text-[var(--ink-muted)]">
                        {q.year} · P{q.paper} · B{q.book}
                      </span>
                      {isSpecimen && (
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--subject-islam-bg)] text-[var(--subject-islam)] border border-[var(--subject-islam-border)]">
                          Specimen
                        </span>
                      )}
                    </div>

                    {/* Unit name */}
                    <div className="text-xs font-semibold text-[var(--subject-biology)] mb-0.5">
                      Unit {q.unit}: {unitNames[q.unit] || `Unit ${q.unit}`}
                    </div>

                    {/* Dhivehi Topic */}
                    <SmartText
                      as="div"
                      className="text-[13px] text-[var(--ink-primary)] leading-[1.9] line-clamp-2 text-right w-full"
                    >
                      {getTopicName(q.book, q.unit, q.topic)}
                    </SmartText>
                  </div>

                  {/* Right Actions */}
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(q.id);
                      }}
                      className={`p-1.5 rounded-md transition-colors ${
                        isFavorite
                          ? 'text-[var(--subject-islam)] bg-[var(--subject-islam-bg)]'
                          : 'text-[var(--ink-muted)] hover:text-[var(--subject-islam)] hover:bg-[var(--bg-subtle)]'
                      }`}
                      title={isFavorite ? 'Remove bookmark' : 'Bookmark question'}
                    >
                      <StarIcon className="w-4 h-4" filled={isFavorite} />
                    </button>
                    {hasNote && (
                      <span className="p-1 text-[var(--subject-biology)]" title="Has personal notes">
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
        <div className="flex-shrink-0 px-3 py-2 border-t border-[var(--border-hairline)] bg-[var(--bg-inset)] flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={goToPrevPage}
            disabled={safePage === 1}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-[var(--ink-primary)] hover:border-[var(--border-strong)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeftIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Prev</span>
          </button>

          <PagePicker
            currentPage={safePage}
            totalPages={totalPages}
            onChange={goToPage}
            ariaLabel="Select question list page"
          />

          <button
            type="button"
            onClick={goToNextPage}
            disabled={safePage === totalPages}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-[var(--ink-primary)] hover:border-[var(--border-strong)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRightIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default QuestionList;
