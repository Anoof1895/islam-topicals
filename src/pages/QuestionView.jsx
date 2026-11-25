import React, { useState, useEffect, useCallback } from 'react';
import SmartText from '../components/SmartText';
import ScanStage from '../components/ScanStage';
import NotesDrawer from '../components/NotesDrawer';
import { hasSavedNote } from '../utils/noteUtils';
import ShortcutsModal from '../components/ShortcutsModal';
import {
  BookOpenIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  FlipIcon,
  KeyboardIcon,
  NoteIcon,
  PrinterIcon,
  StarIcon,
} from '../components/Icons';

const SHORTCUTS_LIST = [
  { label: 'Previous question', keys: ['←'] },
  { label: 'Next question', keys: ['→'] },
  { label: 'Toggle Question / Answer', keys: ['Space'] },
  { label: 'Toggle Favorite', keys: ['F'] },
  { label: 'Open / Close Notes', keys: ['N'] },
  { label: 'Print current view', keys: ['Ctrl', 'P'] },
  { label: 'Keyboard shortcuts', keys: ['?'] },
];

const QuestionView = ({
  question,
  questions,
  setSelectedQuestionId,
  unitNames,
  questionTypes,
  getTopicName,
  onToggleFavorite,
  isFavorite,
  onBackToList,
  onNoteUpdated,
}) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [showFavoriteFeedback, setShowFavoriteFeedback] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [noteExists, setNoteExists] = useState(false);

  const noteStorageKey = question ? `question_notes_${question.id}` : null;

  useEffect(() => {
    setShowAnswer(false);
    setNoteExists(hasSavedNote(noteStorageKey));
  }, [question, noteStorageKey]);

  const goNext = useCallback(() => {
    if (!question || !questions?.length) return;
    const currentIndex = questions.findIndex(q => Number(q.id) === Number(question.id));
    if (currentIndex < questions.length - 1) {
      setSelectedQuestionId(questions[currentIndex + 1].id);
    }
  }, [question, questions, setSelectedQuestionId]);

  const goPrevious = useCallback(() => {
    if (!question || !questions?.length) return;
    const currentIndex = questions.findIndex(q => Number(q.id) === Number(question.id));
    if (currentIndex > 0) {
      setSelectedQuestionId(questions[currentIndex - 1].id);
    }
  }, [question, questions, setSelectedQuestionId]);

  const getUnitName = useCallback(
    (unitNumber) => unitNames[unitNumber] || `Unit ${unitNumber}`,
    [unitNames]
  );

  const handlePrint = useCallback(() => {
    if (!question) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const unitName = getUnitName(question.unit);
    const topicName = getTopicName(question.book, question.unit, question.topic);

    printWindow.document.write(`
      <html>
        <head>
          <title>Question ${question.questionNumber}</title>
          <style>
            body { font-family: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 24px; color: #0F172A; }
            img { max-width: 100%; height: auto; display: block; margin: 0 auto; filter: none !important; }
            .header { border-bottom: 2px solid #B45309; padding-bottom: 14px; margin-bottom: 20px; }
            .info { margin: 6px 0; color: #334155; font-size: 14px; }
            .question-number { font-family: 'Source Serif 4', Georgia, serif; font-size: 22px; font-weight: 600; margin-bottom: 8px; color: #0F172A; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="question-number">${showAnswer ? 'Mark Scheme / Answer' : 'Question'} ${question.questionNumber}</div>
            <div class="info">
              <strong>Year:</strong> ${question.year} |
              <strong>Paper:</strong> ${question.paper} |
              <strong>Book:</strong> ${question.book}
            </div>
            <div class="info">
              <strong>Unit:</strong> ${unitName} |
              <strong>Topic:</strong> ${topicName}
            </div>
          </div>
          <img src="${showAnswer ? question.answerImage : question.image}" alt="${showAnswer ? 'Answer' : 'Question'} ${question.questionNumber}" />
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }, [question, showAnswer, getTopicName, getUnitName]);

  const handleFavorite = useCallback(() => {
    if (onToggleFavorite && question) {
      onToggleFavorite(question.id);
      setShowFavoriteFeedback(true);
      setTimeout(() => setShowFavoriteFeedback(false), 1800);
    }
  }, [onToggleFavorite, question]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        if (e.key === 'Escape') {
          setShowNotes(false);
          setShowShortcutsHelp(false);
        }
        return;
      }

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
        case 'p':
        case 'P':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handlePrint();
          }
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          handleFavorite();
          break;
        case 'n':
        case 'N':
          e.preventDefault();
          setShowNotes(prev => !prev);
          break;
        case '?':
          e.preventDefault();
          setShowShortcutsHelp(prev => !prev);
          break;
        case 'Escape':
          setShowShortcutsHelp(false);
          setShowNotes(false);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [goNext, goPrevious, handlePrint, handleFavorite]);

  if (!question) {
    return (
      <div className="rounded-lg bg-[var(--bg-surface)] border border-[var(--border-hairline)] h-full flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 rounded-lg bg-[var(--subject-biology-bg)] border border-[var(--subject-biology-border)] text-[var(--subject-biology)] flex items-center justify-center mx-auto mb-4">
            <BookOpenIcon className="w-7 h-7" />
          </div>
          <h3 className="font-editorial text-2xl font-semibold text-[var(--ink-primary)] mb-2">
            Select a Question
          </h3>
          <p className="text-sm text-[var(--ink-secondary)] leading-relaxed mb-5">
            Choose any past paper question from the sidebar to inspect the scan, reveal its mark scheme, or take study notes.
          </p>
          {questions?.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedQuestionId(questions[0].id)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-[var(--action-primary-bg)] text-[var(--action-primary-fg)] hover:bg-[var(--action-primary-hover)] transition-colors"
            >
              <span>Open First Question</span>
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  const currentIndex = questions.findIndex(q => Number(q.id) === Number(question.id));
  const totalQuestions = questions.length;
  const isLastQuestion = currentIndex === totalQuestions - 1;
  const isFirstQuestion = currentIndex === 0;

  const getQuestionTypeNames = (typeNumbers) => {
    const displayOrder = [1, 2, 5, 7, 3, 6, 4];
    const sortedTypes = [...typeNumbers].sort(
      (a, b) => displayOrder.indexOf(a) - displayOrder.indexOf(b)
    );
    return sortedTypes.map(type => questionTypes[type] || `Type ${type}`).join(', ');
  };

  return (
    <div className="rounded-lg bg-[var(--bg-surface)] border border-[var(--border-hairline)] h-full flex flex-col min-h-0 overflow-hidden">
      {/* Favorite Toast */}
      {showFavoriteFeedback && (
        <div className="fixed top-16 right-4 z-50 animate-fade-up">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--subject-islam-border)] shadow-[var(--shadow-popover)] text-xs font-medium text-[var(--ink-primary)]">
            <StarIcon className="w-4 h-4 text-[var(--subject-islam)]" filled={isFavorite} />
            <span>{isFavorite ? 'Added to saved questions' : 'Removed from saved questions'}</span>
          </div>
        </div>
      )}

      {/* Workspace Header */}
      <div className="flex-shrink-0 px-4 sm:px-5 py-3 border-b border-[var(--border-hairline)] bg-[var(--bg-surface)] space-y-2.5">
        {/* Top Action Row */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 min-w-0">
            {onBackToList && (
              <button
                type="button"
                onClick={onBackToList}
                className="lg:hidden inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium bg-[var(--bg-inset)] border border-[var(--border-hairline)] text-[var(--ink-primary)]"
              >
                <ChevronLeftIcon className="w-3.5 h-3.5" />
                <span>List</span>
              </button>
            )}

            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <h2 className="font-editorial text-lg sm:text-xl font-semibold text-[var(--ink-primary)] leading-none">
                {showAnswer ? 'Mark Scheme' : 'Question'} {question.questionNumber}
              </h2>
              <span className="font-mono-code tabular-nums text-xs font-medium px-2 py-0.5 rounded bg-[var(--bg-inset)] border border-[var(--border-hairline)] text-[var(--ink-secondary)]">
                {currentIndex + 1} / {totalQuestions}
              </span>
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-[var(--subject-biology-bg)] text-[var(--subject-biology)] border border-[var(--subject-biology-border)]">
                {getQuestionTypeNames(question.types)}
              </span>
            </div>
          </div>

          {/* Primary Controls (Desktop + Tablet) */}
          <div className="hidden sm:flex items-center gap-1.5">
            <div className="inline-flex items-center rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-0.5">
              <button
                type="button"
                onClick={goPrevious}
                disabled={isFirstQuestion}
                className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-[var(--ink-primary)] hover:bg-[var(--bg-subtle)] disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
                title="Previous (←)"
              >
                <ChevronLeftIcon className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Prev</span>
              </button>
              <span className="w-px h-4 bg-[var(--border-hairline)]" />
              <button
                type="button"
                onClick={goNext}
                disabled={isLastQuestion}
                className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-[var(--ink-primary)] hover:bg-[var(--bg-subtle)] disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
                title="Next (→)"
              >
                <span className="hidden md:inline">Next</span>
                <ChevronRightIcon className="w-3.5 h-3.5" />
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
              title="Toggle Answer (Space)"
            >
              <FlipIcon className="w-3.5 h-3.5" />
              <span>{showAnswer ? 'View Question' : 'Reveal Answer'}</span>
            </button>

            <button
              type="button"
              onClick={handleFavorite}
              className={`p-1.5 rounded-md border transition-colors ${
                isFavorite
                  ? 'bg-[var(--subject-islam-bg)] border-[var(--subject-islam-border)] text-[var(--subject-islam)]'
                  : 'bg-[var(--bg-surface)] border-[var(--border-hairline)] text-[var(--ink-secondary)] hover:text-[var(--subject-islam)] hover:border-[var(--border-strong)]'
              }`}
              title="Favorite (F)"
            >
              <StarIcon className="w-4 h-4" filled={isFavorite} />
            </button>

            <button
              type="button"
              onClick={() => setShowNotes(prev => !prev)}
              className={`relative inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs font-medium transition-colors ${
                showNotes || noteExists
                  ? 'bg-[var(--subject-biology-bg)] border-[var(--subject-biology-border)] text-[var(--subject-biology)]'
                  : 'bg-[var(--bg-surface)] border-[var(--border-hairline)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:border-[var(--border-strong)]'
              }`}
              title="Study Notes (N)"
            >
              <NoteIcon className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Notes</span>
              {noteExists && (
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--subject-biology)]" />
              )}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="p-1.5 rounded-md border bg-[var(--bg-surface)] border-[var(--border-hairline)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:border-[var(--border-strong)] transition-colors"
              title="Print (Ctrl+P)"
            >
              <PrinterIcon className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setShowShortcutsHelp(true)}
              className="hidden md:inline-flex p-1.5 rounded-md border bg-[var(--bg-surface)] border-[var(--border-hairline)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:border-[var(--border-strong)] transition-colors"
              title="Keyboard shortcuts (?)"
            >
              <KeyboardIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Metadata Strip */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="font-mono-code tabular-nums px-2 py-0.5 rounded bg-[var(--bg-inset)] border border-[var(--border-hairline)] text-[var(--ink-secondary)]">
            <strong className="text-[var(--ink-primary)]">{question.year}</strong> · Paper{' '}
            {question.paper} · Book {question.book}
          </span>
          <span className="px-2 py-0.5 rounded bg-[var(--bg-inset)] border border-[var(--border-hairline)] text-[var(--subject-biology)] font-medium">
            Unit {question.unit}: {getUnitName(question.unit)}
          </span>
          <div className="px-2.5 py-0.5 rounded bg-[var(--bg-inset)] border border-[var(--border-hairline)] text-[var(--ink-primary)] max-w-full">
            <SmartText className="text-xs sm:text-[13px] leading-[1.9]">
              {getTopicName(question.book, question.unit, question.topic)}
            </SmartText>
          </div>
        </div>
      </div>

      {/* Document Scan Stage */}
      <ScanStage
        src={showAnswer ? question.answerImage : question.image}
        alt={showAnswer ? `Answer ${question.questionNumber}` : `Question ${question.questionNumber}`}
        loadingText={showAnswer ? 'Loading mark scheme...' : 'Loading question...'}
        statusBadge={
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium border ${
              showAnswer
                ? 'bg-[var(--subject-islam-bg)] text-[var(--subject-islam)] border-[var(--subject-islam-border)]'
                : 'bg-[var(--subject-biology-bg)] text-[var(--subject-biology)] border-[var(--subject-biology-border)]'
            }`}
          >
            <EyeIcon className="w-3.5 h-3.5" />
            <span>{showAnswer ? 'Viewing Mark Scheme' : 'Viewing Question'}</span>
          </span>
        }
      />

      {/* Desktop Keyboard Hint Strip */}
      <div className="hidden lg:flex items-center justify-between px-4 py-2 border-t border-[var(--border-hairline)] bg-[var(--bg-inset)] text-[11px] text-[var(--ink-muted)]">
        <div className="flex items-center gap-3">
          <span>
            <kbd className="font-mono-code px-1.5 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-hairline)]">
              ←
            </kbd>{' '}
            <kbd className="font-mono-code px-1.5 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-hairline)]">
              →
            </kbd>{' '}
            Navigate
          </span>
          <span>
            <kbd className="font-mono-code px-1.5 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-hairline)]">
              Space
            </kbd>{' '}
            Flip Q/A
          </span>
          <span>
            <kbd className="font-mono-code px-1.5 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-hairline)]">
              F
            </kbd>{' '}
            Save
          </span>
          <span>
            <kbd className="font-mono-code px-1.5 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-hairline)]">
              N
            </kbd>{' '}
            Notes
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowShortcutsHelp(true)}
          className="hover:text-[var(--ink-primary)] transition-colors"
        >
          Press{' '}
          <kbd className="font-mono-code px-1.5 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-hairline)]">
            ?
          </kbd>{' '}
          for all shortcuts
        </button>
      </div>

      {/* Mobile Sticky Action Bar inside Reader */}
      <div className="sm:hidden flex-shrink-0 px-2.5 py-2 border-t border-[var(--border-hairline)] bg-[var(--bg-surface)] grid grid-cols-5 gap-1.5 items-center">
        <button
          type="button"
          onClick={goPrevious}
          disabled={isFirstQuestion}
          className="flex flex-col items-center justify-center py-1.5 rounded-md bg-[var(--bg-inset)] border border-[var(--border-hairline)] text-[var(--ink-primary)] disabled:opacity-35 text-[10px] font-medium"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          <span>Prev</span>
        </button>
        <button
          type="button"
          onClick={handleFavorite}
          className={`flex flex-col items-center justify-center py-1.5 rounded-md border text-[10px] font-medium ${
            isFavorite
              ? 'bg-[var(--subject-islam-bg)] border-[var(--subject-islam-border)] text-[var(--subject-islam)]'
              : 'bg-[var(--bg-inset)] border-[var(--border-hairline)] text-[var(--ink-secondary)]'
          }`}
        >
          <StarIcon className="w-4 h-4" filled={isFavorite} />
          <span>Save</span>
        </button>
        <button
          type="button"
          onClick={() => setShowAnswer(prev => !prev)}
          className={`flex flex-col items-center justify-center py-1.5 rounded-md text-[10px] font-semibold ${
            showAnswer
              ? 'bg-[var(--subject-islam)] text-white'
              : 'bg-[var(--action-primary-bg)] text-[var(--action-primary-fg)]'
          }`}
        >
          <FlipIcon className="w-4 h-4" />
          <span>{showAnswer ? 'Question' : 'Answer'}</span>
        </button>
        <button
          type="button"
          onClick={() => setShowNotes(true)}
          className={`relative flex flex-col items-center justify-center py-1.5 rounded-md border text-[10px] font-medium ${
            noteExists
              ? 'bg-[var(--subject-biology-bg)] border-[var(--subject-biology-border)] text-[var(--subject-biology)]'
              : 'bg-[var(--bg-inset)] border-[var(--border-hairline)] text-[var(--ink-secondary)]'
          }`}
        >
          <NoteIcon className="w-4 h-4" />
          <span>Notes</span>
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={isLastQuestion}
          className="flex flex-col items-center justify-center py-1.5 rounded-md bg-[var(--bg-inset)] border border-[var(--border-hairline)] text-[var(--ink-primary)] disabled:opacity-35 text-[10px] font-medium"
        >
          <ChevronRightIcon className="w-4 h-4" />
          <span>Next</span>
        </button>
      </div>

      {/* Notes Drawer */}
      <NotesDrawer
        isOpen={showNotes}
        onClose={() => setShowNotes(false)}
        storageKey={noteStorageKey}
        title={`Notes · Question ${question.questionNumber}`}
        subtitle={`${question.year} Paper ${question.paper} · ${getUnitName(question.unit)}`}
        onNoteChange={(val) => {
          setNoteExists(val.trim().length > 0);
          if (onNoteUpdated) onNoteUpdated();
        }}
      />

      {/* Keyboard Shortcuts Modal */}
      <ShortcutsModal
        isOpen={showShortcutsHelp}
        onClose={() => setShowShortcutsHelp(false)}
        shortcuts={SHORTCUTS_LIST}
      />
    </div>
  );
};

export default React.memo(QuestionView);
