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
            body { font-family: 'Plus Jakarta Sans', Arial, sans-serif; margin: 24px; color: #141E1B; }
            img { max-width: 100%; height: auto; display: block; margin: 0 auto; }
            .header { border-bottom: 2px solid #0F5F4C; padding-bottom: 14px; margin-bottom: 20px; }
            .info { margin: 6px 0; color: #52605B; font-size: 14px; }
            .question-number { font-size: 22px; font-weight: bold; margin-bottom: 8px; color: #0F5F4C; }
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
      <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-[var(--shadow-card)] h-full flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-[var(--accent-primary-soft)] text-[var(--accent-primary)] flex items-center justify-center mx-auto mb-4">
            <BookOpenIcon className="w-8 h-8" />
          </div>
          <h3 className="font-serif-editorial text-2xl font-semibold text-[var(--text-primary)] mb-2">
            Select a Question
          </h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-5">
            Choose any past paper question from the sidebar to inspect the scan, reveal its mark scheme, or take study notes.
          </p>
          {questions?.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedQuestionId(questions[0].id)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primary-hover)] transition-colors shadow-xs"
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
    <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-[var(--shadow-card)] h-full flex flex-col min-h-0 overflow-hidden">
      {/* Favorite Toast */}
      {showFavoriteFeedback && (
        <div className="fixed top-20 right-4 z-50 animate-fade-up">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--accent-gold)]/40 shadow-lg text-sm font-semibold text-[var(--text-primary)]">
            <StarIcon className="w-4 h-4 text-[var(--accent-gold)]" filled={isFavorite} />
            <span>{isFavorite ? 'Added to saved questions' : 'Removed from saved questions'}</span>
          </div>
        </div>
      )}

      {/* Workspace Header */}
      <div className="flex-shrink-0 px-4 sm:px-5 py-3.5 border-b border-[var(--border-hairline)] bg-[var(--bg-subtle)]/35 space-y-3">
        {/* Top Action Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {onBackToList && (
              <button
                type="button"
                onClick={onBackToList}
                className="lg:hidden inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-[var(--text-primary)] hover:border-[var(--border-strong)]"
              >
                <ChevronLeftIcon className="w-4 h-4" />
                <span>List</span>
              </button>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-serif-editorial text-xl sm:text-2xl font-semibold text-[var(--text-primary)] leading-none">
                  {showAnswer ? 'Mark Scheme' : 'Question'} {question.questionNumber}
                </h2>
                <span className="font-mono-code text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--bg-subtle)] border border-[var(--border-hairline)] text-[var(--text-secondary)]">
                  {currentIndex + 1} / {totalQuestions}
                </span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-[var(--accent-primary-soft)] text-[var(--accent-primary)]">
                  {getQuestionTypeNames(question.types)}
                </span>
              </div>
            </div>
          </div>

          {/* Primary Controls (Desktop + Tablet) */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="inline-flex items-center rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-0.5">
              <button
                type="button"
                onClick={goPrevious}
                disabled={isFirstQuestion}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
                title="Previous (←)"
              >
                <ChevronLeftIcon className="w-4 h-4" />
                <span className="hidden md:inline">Prev</span>
              </button>
              <span className="w-px h-4 bg-[var(--border-hairline)]" />
              <button
                type="button"
                onClick={goNext}
                disabled={isLastQuestion}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
                title="Next (→)"
              >
                <span className="hidden md:inline">Next</span>
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Flip Q / A Segmented Button */}
            <button
              type="button"
              onClick={() => setShowAnswer(prev => !prev)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs ${
                showAnswer
                  ? 'bg-[var(--accent-gold)] text-white hover:opacity-95'
                  : 'bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primary-hover)]'
              }`}
              title="Toggle Answer (Space)"
            >
              <FlipIcon className="w-4 h-4" />
              <span>{showAnswer ? 'View Question' : 'Reveal Answer'}</span>
            </button>

            <button
              type="button"
              onClick={handleFavorite}
              className={`p-2 rounded-xl border transition-colors ${
                isFavorite
                  ? 'bg-[var(--accent-gold-soft)] border-[var(--accent-gold)]/40 text-[var(--accent-gold)]'
                  : 'bg-[var(--bg-surface)] border-[var(--border-hairline)] text-[var(--text-secondary)] hover:text-[var(--accent-gold)] hover:border-[var(--border-strong)]'
              }`}
              title="Favorite (F)"
            >
              <StarIcon className="w-4 h-4" filled={isFavorite} />
            </button>

            <button
              type="button"
              onClick={() => setShowNotes(prev => !prev)}
              className={`relative inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-colors ${
                showNotes || noteExists
                  ? 'bg-[var(--accent-primary-soft)] border-[var(--accent-primary)]/40 text-[var(--accent-primary)]'
                  : 'bg-[var(--bg-surface)] border-[var(--border-hairline)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)]'
              }`}
              title="Study Notes (N)"
            >
              <NoteIcon className="w-4 h-4" />
              <span className="hidden xl:inline">Notes</span>
              {noteExists && (
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" />
              )}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="p-2 rounded-xl border bg-[var(--bg-surface)] border-[var(--border-hairline)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-colors"
              title="Print (Ctrl+P)"
            >
              <PrinterIcon className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setShowShortcutsHelp(true)}
              className="hidden md:inline-flex p-2 rounded-xl border bg-[var(--bg-surface)] border-[var(--border-hairline)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-colors"
              title="Keyboard shortcuts (?)"
            >
              <KeyboardIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Metadata Strip */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-mono-code px-2.5 py-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-[var(--text-secondary)]">
            <strong className="text-[var(--text-primary)]">{question.year}</strong> • Paper {question.paper} • Book {question.book}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-[var(--accent-primary)] font-semibold">
            Unit {question.unit}: {getUnitName(question.unit)}
          </span>
          <div className="px-3 py-0.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-[var(--text-primary)] max-w-full">
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
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
              showAnswer
                ? 'bg-[var(--accent-gold-soft)] text-[var(--accent-gold)] border border-[var(--accent-gold)]/30'
                : 'bg-[var(--accent-primary-soft)] text-[var(--accent-primary)] border border-[var(--accent-primary)]/25'
            }`}
          >
            <EyeIcon className="w-3.5 h-3.5" />
            <span>{showAnswer ? 'Viewing Mark Scheme' : 'Viewing Question'}</span>
          </span>
        }
      />

      {/* Desktop Keyboard Hint Strip */}
      <div className="hidden lg:flex items-center justify-between px-4 py-2 border-t border-[var(--border-hairline)] bg-[var(--bg-subtle)]/35 text-[11px] text-[var(--text-muted)]">
        <div className="flex items-center gap-3">
          <span><kbd className="font-mono-code px-1.5 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-hairline)]">←</kbd> <kbd className="font-mono-code px-1.5 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-hairline)]">→</kbd> Navigate</span>
          <span><kbd className="font-mono-code px-1.5 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-hairline)]">Space</kbd> Flip Q/A</span>
          <span><kbd className="font-mono-code px-1.5 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-hairline)]">F</kbd> Save</span>
          <span><kbd className="font-mono-code px-1.5 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-hairline)]">N</kbd> Notes</span>
        </div>
        <button
          type="button"
          onClick={() => setShowShortcutsHelp(true)}
          className="hover:text-[var(--text-primary)] transition-colors"
        >
          Press <kbd className="font-mono-code px-1.5 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-hairline)]">?</kbd> for all shortcuts
        </button>
      </div>

      {/* Mobile Sticky Action Bar inside Reader */}
      <div className="sm:hidden flex-shrink-0 px-3 py-2.5 border-t border-[var(--border-hairline)] bg-[var(--bg-surface)] grid grid-cols-5 gap-1.5 items-center">
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
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl text-white text-[10px] font-bold shadow-xs ${
            showAnswer ? 'bg-[var(--accent-gold)]' : 'bg-[var(--accent-primary)]'
          }`}
        >
          <FlipIcon className="w-4 h-4" />
          <span>{showAnswer ? 'Question' : 'Answer'}</span>
        </button>
        <button
          type="button"
          onClick={() => setShowNotes(true)}
          className={`relative flex flex-col items-center justify-center py-1.5 rounded-xl text-[10px] font-semibold ${
            noteExists
              ? 'bg-[var(--accent-primary-soft)] text-[var(--accent-primary)]'
              : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)]'
          }`}
        >
          <NoteIcon className="w-4 h-4" />
          <span>Notes</span>
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

      {/* Notes Drawer */}
      <NotesDrawer
        isOpen={showNotes}
        onClose={() => setShowNotes(false)}
        storageKey={noteStorageKey}
        title={`Notes • Question ${question.questionNumber}`}
        subtitle={`${question.year} Paper ${question.paper} • ${getUnitName(question.unit)}`}
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
