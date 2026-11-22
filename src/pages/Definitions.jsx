import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import Select from 'react-select';
import { useTheme } from '../context/ThemeContext';
import definitionsData from '../definitionsData';
import { getScholarSelectStyles } from '../utils/selectTheme';
import ScanStage from '../components/ScanStage';
import NotesDrawer from '../components/NotesDrawer';
import { hasSavedNote } from '../utils/noteUtils';
import ShortcutsModal from '../components/ShortcutsModal';
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  FilterIcon,
  KeyboardIcon,
  NoteIcon,
  ScrollTextIcon,
  SearchIcon,
  StarIcon,
  XIcon,
} from '../components/Icons';

const DEFINITION_SHORTCUTS = [
  { label: 'Previous definition', keys: ['←'] },
  { label: 'Next definition', keys: ['→'] },
  { label: 'Toggle Favorite', keys: ['F'] },
  { label: 'Open / Close Notes', keys: ['N'] },
  { label: 'Focus search bar', keys: ['/'] },
  { label: 'Keyboard shortcuts', keys: ['?'] },
];

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const highlightSearchTerm = (text, searchTerm) => {
  if (!searchTerm.trim()) return text;
  const regex = new RegExp(`(${escapeRegex(searchTerm.trim())})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, index) =>
    part.toLowerCase() === searchTerm.trim().toLowerCase() ? (
      <mark
        key={index}
        className="bg-[var(--accent-gold)] text-white px-1 py-0.2 rounded font-semibold"
      >
        {part}
      </mark>
    ) : (
      part
    )
  );
};

const DefinitionList = ({
  definitions,
  selectedId,
  setSelectedId,
  unitNames,
  favorites,
  toggleFavorite,
  searchTerm,
  noteVersion,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [showFavorites, setShowFavorites] = useState(false);
  const definitionsPerPage = 10;

  const favMatchesCount = useMemo(
    () => definitions.filter(d => favorites.includes(d.id)).length,
    [definitions, favorites]
  );

  const definitionsToDisplay = useMemo(
    () => (showFavorites ? definitions.filter(d => favorites.includes(d.id)) : definitions),
    [showFavorites, definitions, favorites]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [definitions.length, showFavorites]);

  useEffect(() => {
    if (!selectedId) return;
    const idx = definitionsToDisplay.findIndex(d => Number(d.id) === Number(selectedId));
    if (idx !== -1) {
      const targetPage = Math.floor(idx / definitionsPerPage) + 1;
      if (targetPage !== currentPage) {
        setCurrentPage(targetPage);
      }
    }
  }, [selectedId, definitionsToDisplay, currentPage]);

  const totalPages = Math.max(1, Math.ceil(definitionsToDisplay.length / definitionsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * definitionsPerPage;
  const currentDefinitions = definitionsToDisplay.slice(startIndex, startIndex + definitionsPerPage);

  return (
    <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-[var(--shadow-card)] h-full overflow-hidden flex flex-col">
      <div className="p-3.5 border-b border-[var(--border-hairline)] bg-[var(--bg-subtle)]/45 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="font-serif-editorial font-semibold text-base text-[var(--text-primary)] leading-tight">
              Definitions List
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5 font-mono-code">
              {definitionsToDisplay.length === 0
                ? '0 terms'
                : `Page ${safePage}/${totalPages} • ${definitionsToDisplay.length} terms`}
            </p>
          </div>
          <span className="font-mono-code text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--accent-primary-soft)] text-[var(--accent-primary)]">
            {definitionsToDisplay.length}
          </span>
        </div>

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
            All ({definitions.length})
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

      <div
        className="flex-1 overflow-y-auto p-2.5 space-y-2 scholar-scroll"
        style={{ WebkitOverflowScrolling: 'touch', touchAction: 'manipulation' }}
      >
        {currentDefinitions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-5 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[var(--accent-primary-soft)] text-[var(--accent-primary)] flex items-center justify-center mb-3">
              {showFavorites ? (
                <StarIcon className="w-6 h-6 text-[var(--accent-gold)]" filled />
              ) : (
                <ScrollTextIcon className="w-6 h-6" />
              )}
            </div>
            <h4 className="font-serif-editorial text-base font-semibold text-[var(--text-primary)] mb-1">
              {showFavorites ? 'No Saved Definitions' : 'No Definitions Found'}
            </h4>
            <p className="text-xs text-[var(--text-secondary)] max-w-[220px] leading-relaxed">
              {showFavorites
                ? 'Star definitions you want to memorize for quick review.'
                : 'Try another search term or adjust your filters.'}
            </p>
          </div>
        ) : (
          currentDefinitions.map((def) => {
            const isSelected = Number(selectedId) === Number(def.id);
            const isFavorite = favorites.includes(def.id);
            const hasNote = hasSavedNote(`definition_notes_${def.id}`);
            const isDhivehiName = /[\u0780-\u07BF]/.test(def.name);
            void noteVersion;

            return (
              <div
                key={def.id}
                onClick={() => setSelectedId(def.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedId(def.id);
                  }
                }}
                className={`relative cursor-pointer p-3 rounded-xl border transition-all duration-150 ${
                  isSelected
                    ? 'bg-[var(--accent-primary-soft)] border-[var(--accent-primary)] shadow-xs'
                    : 'bg-[var(--bg-surface)] border-[var(--border-hairline)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-subtle)]/40'
                }`}
              >
                {isSelected && (
                  <span className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-[var(--accent-primary)]" />
                )}

                <div className="flex items-start justify-between gap-2.5 pl-1">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span
                        className={`font-mono-code text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${
                          isSelected
                            ? 'bg-[var(--accent-primary)] text-white'
                            : 'bg-[var(--bg-subtle)] text-[var(--text-primary)]'
                        }`}
                      >
                        Book {def.book}
                      </span>
                      <span className="text-[11px] font-semibold text-[var(--accent-primary)] truncate">
                        {unitNames[def.unit] || `Unit ${def.unit}`}
                      </span>
                    </div>

                    <div
                      className={`font-semibold text-sm text-[var(--text-primary)] leading-snug ${
                        isDhivehiName ? 'dhivehi-text text-right' : ''
                      }`}
                      lang={isDhivehiName ? 'dv' : 'en'}
                    >
                      {highlightSearchTerm(def.name, searchTerm)}
                    </div>

                    <div className="text-[11px] text-[var(--text-muted)] mt-1">
                      <span className="arabic-text">
                        {def.type === 'lughavee' ? 'لغوي' : 'اصطلاحي'}
                      </span>{' '}
                      • {def.type === 'lughavee' ? 'Lughavee' : 'Isthilaahee'}
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(def.id);
                      }}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isFavorite
                          ? 'text-[var(--accent-gold)] bg-[var(--accent-gold-soft)]'
                          : 'text-[var(--text-muted)] hover:text-[var(--accent-gold)] hover:bg-[var(--bg-subtle)]'
                      }`}
                    >
                      <StarIcon className="w-4 h-4" filled={isFavorite} />
                    </button>
                    {hasNote && (
                      <span className="p-1 text-[var(--accent-primary)]" title="Has study notes">
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

      {totalPages > 1 && (
        <div className="flex-shrink-0 px-3 py-2.5 border-t border-[var(--border-hairline)] bg-[var(--bg-subtle)]/45 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-[var(--text-primary)] disabled:opacity-40 transition-colors"
          >
            <ChevronLeftIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Prev</span>
          </button>

          <select
            aria-label="Select definition page"
            value={safePage}
            onChange={(e) => setCurrentPage(Number(e.target.value))}
            className="font-mono-code text-xs px-2 py-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-[var(--text-primary)]"
          >
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <option key={p} value={p}>
                {p} / {totalPages}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-[var(--text-primary)] disabled:opacity-40 transition-colors"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

const DefinitionViewer = ({
  definition,
  definitions,
  setSelectedId,
  unitNames,
  onToggleFavorite,
  isFavorite,
  onBackToList,
  onOpenNotes,
  onOpenShortcuts,
  noteExists,
}) => {
  const [showFavoriteFeedback, setShowFavoriteFeedback] = useState(false);

  const currentIndex = definition
    ? definitions.findIndex(d => Number(d.id) === Number(definition.id))
    : -1;
  const totalDefinitions = definitions.length;
  const isFirstDefinition = currentIndex <= 0;
  const isLastDefinition = currentIndex === totalDefinitions - 1;

  const goNext = useCallback(() => {
    if (currentIndex >= 0 && currentIndex < totalDefinitions - 1) {
      setSelectedId(definitions[currentIndex + 1].id);
    }
  }, [currentIndex, totalDefinitions, definitions, setSelectedId]);

  const goPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setSelectedId(definitions[currentIndex - 1].id);
    }
  }, [currentIndex, definitions, setSelectedId]);

  const handleFavorite = useCallback(() => {
    if (!definition) return;
    onToggleFavorite(definition.id);
    setShowFavoriteFeedback(true);
    setTimeout(() => setShowFavoriteFeedback(false), 1800);
  }, [definition, onToggleFavorite]);

  useEffect(() => {
    if (!definition) return;
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
        case 'f':
        case 'F':
          e.preventDefault();
          handleFavorite();
          break;
        case 'n':
        case 'N':
          e.preventDefault();
          onOpenNotes();
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [definition, goNext, goPrevious, handleFavorite, onOpenNotes]);

  if (!definition) {
    return (
      <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-[var(--shadow-card)] h-full flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-[var(--accent-primary-soft)] text-[var(--accent-primary)] flex items-center justify-center mx-auto mb-4">
            <ScrollTextIcon className="w-8 h-8" />
          </div>
          <h3 className="font-serif-editorial text-2xl font-semibold text-[var(--text-primary)] mb-2">
            Select a Definition
          </h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-5">
            Choose a Lughavee or Isthilaahee term from the list to view the syllabus definition scan and write personal cues.
          </p>
          {definitions?.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedId(definitions[0].id)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primary-hover)] transition-colors"
            >
              <span>Open First Definition</span>
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
      <div className="flex-shrink-0 px-4 sm:px-5 py-3.5 border-b border-[var(--border-hairline)] bg-[var(--bg-subtle)]/35 space-y-2.5">
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
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <h2 className="font-serif-editorial text-xl sm:text-2xl font-semibold text-[var(--text-primary)] leading-tight">
                {definition.name}
              </h2>
              <span className="font-mono-code text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--bg-subtle)] border border-[var(--border-hairline)] text-[var(--text-secondary)]">
                {currentIndex + 1} / {totalDefinitions}
              </span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <div className="inline-flex items-center rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-0.5">
              <button
                type="button"
                onClick={goPrevious}
                disabled={isFirstDefinition}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] disabled:opacity-35 transition-colors"
              >
                <ChevronLeftIcon className="w-4 h-4" />
                <span className="hidden md:inline">Prev</span>
              </button>
              <span className="w-px h-4 bg-[var(--border-hairline)]" />
              <button
                type="button"
                onClick={goNext}
                disabled={isLastDefinition}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] disabled:opacity-35 transition-colors"
              >
                <span className="hidden md:inline">Next</span>
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>

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
              onClick={onOpenNotes}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-colors ${
                noteExists
                  ? 'bg-[var(--accent-primary-soft)] border-[var(--accent-primary)]/40 text-[var(--accent-primary)]'
                  : 'bg-[var(--bg-surface)] border-[var(--border-hairline)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              title="Notes (N)"
            >
              <NoteIcon className="w-4 h-4" />
              <span>Notes</span>
              {noteExists && <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" />}
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
            Book {definition.book}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-[var(--accent-primary)] font-semibold">
            Unit {definition.unit}: {unitNames[definition.unit]}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-[var(--accent-gold-soft)] border border-[var(--accent-gold)]/25 text-[var(--accent-gold)] font-semibold">
            <span className="arabic-text">
              {definition.type === 'lughavee' ? 'لغوي' : 'اصطلاحي'}
            </span>{' '}
            ({definition.type === 'lughavee' ? 'Lughavee' : 'Isthilaahee'})
          </span>
        </div>
      </div>

      {/* Document Scan Stage */}
      <ScanStage
        src={definition.image}
        alt={`Definition: ${definition.name}`}
        loadingText="Loading definition..."
        statusBadge={
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--accent-primary-soft)] text-[var(--accent-primary)] border border-[var(--accent-primary)]/25">
            <EyeIcon className="w-3.5 h-3.5" />
            <span>{definition.type === 'lughavee' ? 'Linguistic Meaning' : 'Terminological Meaning'}</span>
          </span>
        }
      />

      {/* Mobile Sticky Action Bar */}
      <div className="sm:hidden flex-shrink-0 px-3 py-2.5 border-t border-[var(--border-hairline)] bg-[var(--bg-surface)] grid grid-cols-4 gap-2 items-center">
        <button
          type="button"
          onClick={goPrevious}
          disabled={isFirstDefinition}
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
          onClick={onOpenNotes}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl text-[10px] font-semibold ${
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
          disabled={isLastDefinition}
          className="flex flex-col items-center justify-center py-1.5 rounded-xl bg-[var(--bg-subtle)] text-[var(--text-primary)] disabled:opacity-35 text-[10px] font-semibold"
        >
          <ChevronRightIcon className="w-4 h-4" />
          <span>Next</span>
        </button>
      </div>
    </div>
  );
};

const Definitions = ({ unitNames, onToggleFavorite, favorites, initialFilters = null }) => {
  const { isDark } = useTheme();
  const searchInputRef = useRef(null);

  const [selectedId, setSelectedId] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState(() => initialFilters || {});
  const [selectedType, setSelectedType] = useState('lughavee');
  const [searchTerm, setSearchTerm] = useState('');
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [noteVersion, setNoteVersion] = useState(0);

  useEffect(() => {
    if (initialFilters && Object.keys(initialFilters).length > 0) {
      setSelectedFilters(initialFilters);
      setSelectedId(null);
    }
  }, [initialFilters]);

  const customStyles = useMemo(() => getScholarSelectStyles(isDark), [isDark]);

  const lughaveeCount = useMemo(
    () => definitionsData.filter(d => d.type === 'lughavee').length,
    []
  );
  const isthilaaheeCount = useMemo(
    () => definitionsData.filter(d => d.type === 'isthilaahee').length,
    []
  );

  const definitionsByType = useMemo(
    () => definitionsData.filter(def => def.type === selectedType),
    [selectedType]
  );

  const options = useMemo(
    () => ({
      book: [...new Set(definitionsByType.map(q => q.book))].sort((a, b) => a - b),
      unit: [...new Set(definitionsByType.map(q => q.unit))].sort((a, b) => a - b),
    }),
    [definitionsByType]
  );

  const formattedOptions = useMemo(
    () => ({
      book: options.book.map(book => ({ value: book, label: `Book ${book}` })),
      unit: options.unit.map(unit => ({
        value: unit,
        label: unitNames[unit] || `Unit ${unit}`,
      })),
    }),
    [options, unitNames]
  );

  const filteredDefinitions = useMemo(() => {
    const filtered = definitionsByType.filter(def => {
      const matchesFilters = Object.entries(selectedFilters).every(([field, values]) => {
        if (!values || values.length === 0) return true;
        return values.map(v => String(v)).includes(String(def[field]));
      });

      if (searchTerm.trim() !== '') {
        return matchesFilters && def.name.toLowerCase().includes(searchTerm.trim().toLowerCase());
      }
      return matchesFilters;
    });

    return filtered.sort((a, b) => {
      if (a.book !== b.book) return a.book - b.book;
      if (a.unit !== b.unit) return a.unit - b.unit;
      return a.name.localeCompare(b.name);
    });
  }, [definitionsByType, selectedFilters, searchTerm]);

  const activeDefinition = useMemo(
    () => filteredDefinitions.find(d => Number(d.id) === Number(selectedId)),
    [filteredDefinitions, selectedId]
  );

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        if (e.key === 'Escape') {
          if (document.activeElement === searchInputRef.current) {
            setSearchTerm('');
            searchInputRef.current.blur();
          }
          setShowNotes(false);
          setShowShortcutsHelp(false);
        }
        return;
      }

      if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === '?') {
        e.preventDefault();
        setShowShortcutsHelp(prev => !prev);
      } else if (e.key === 'Escape') {
        setShowShortcutsHelp(false);
        setShowNotes(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleFilterChange = (field, selectedOptions) => {
    const values = selectedOptions ? selectedOptions.map(opt => opt.value) : [];
    setSelectedFilters(prev => ({ ...prev, [field]: values }));
  };

  const getCurrentValues = (field) =>
    selectedFilters[field]?.map(val => {
      const opt = formattedOptions[field].find(o => o.value === val);
      return opt || { value: val, label: String(val) };
    }) || [];

  const activeFilterCount = (selectedFilters.book?.length || 0) + (selectedFilters.unit?.length || 0);
  const noteStorageKey = activeDefinition ? `definition_notes_${activeDefinition.id}` : null;

  return (
    <div className="flex-1 flex flex-col min-h-0 gap-3 lg:gap-4">
      {/* Compact Header + Lughavee / Isthilaahee Switcher + Search */}
      <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-[var(--shadow-card)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 px-4 py-3">
          {/* Type Switcher */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-9 h-9 rounded-xl bg-[var(--accent-primary-soft)] text-[var(--accent-primary)] flex items-center justify-center flex-shrink-0">
              <ScrollTextIcon className="w-5 h-5" />
            </div>

            <div className="inline-flex p-1 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-hairline)]">
              <button
                type="button"
                onClick={() => {
                  setSelectedType('lughavee');
                  setSelectedId(null);
                }}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  selectedType === 'lughavee'
                    ? 'bg-[var(--accent-primary)] text-white shadow-2xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <span className="arabic-text">لغوي</span>
                <span>Lughavee</span>
                <span
                  className={`font-mono-code text-[11px] px-1.5 rounded-full ${
                    selectedType === 'lughavee' ? 'bg-white/20 text-white' : 'bg-[var(--bg-surface)] text-[var(--text-muted)]'
                  }`}
                >
                  {lughaveeCount}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedType('isthilaahee');
                  setSelectedId(null);
                }}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  selectedType === 'isthilaahee'
                    ? 'bg-[var(--accent-gold)] text-white shadow-2xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <span className="arabic-text">اصطلاحي</span>
                <span>Isthilaahee</span>
                <span
                  className={`font-mono-code text-[11px] px-1.5 rounded-full ${
                    selectedType === 'isthilaahee' ? 'bg-white/20 text-white' : 'bg-[var(--bg-surface)] text-[var(--text-muted)]'
                  }`}
                >
                  {isthilaaheeCount}
                </span>
              </button>
            </div>
          </div>

          {/* Search & Filter Toggle */}
          <div className="flex flex-1 lg:max-w-xl items-center gap-2">
            <div className="relative flex-1">
              <SearchIcon className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder='Search definitions (e.g. Kaiveni, Vari)... press /'
                className="w-full pl-9 pr-8 py-2 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-xs sm:text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary)]/15 transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setFiltersExpanded(prev => !prev)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all flex-shrink-0 ${
                filtersExpanded || activeFilterCount > 0
                  ? 'bg-[var(--accent-primary-soft)] text-[var(--accent-primary)] border-[var(--accent-primary)]/30'
                  : 'bg-[var(--bg-subtle)] text-[var(--text-primary)] border-[var(--border-hairline)]'
              }`}
            >
              <FilterIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Filter</span>
              {activeFilterCount > 0 && (
                <span className="font-mono-code text-[11px] px-1.5 rounded-full bg-[var(--accent-primary)] text-white">
                  {activeFilterCount}
                </span>
              )}
              <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform ${filtersExpanded ? 'rotate-180' : ''}`} />
            </button>

            <button
              type="button"
              onClick={() => setShowShortcutsHelp(true)}
              className="hidden md:inline-flex p-2 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-subtle)]/50 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              title="Keyboard shortcuts (?)"
            >
              <KeyboardIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Active Chips */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 px-4 pb-2.5">
            {selectedFilters.book?.map(book => (
              <button
                key={`b-${book}`}
                type="button"
                onClick={() =>
                  setSelectedFilters(prev => ({
                    ...prev,
                    book: prev.book.filter(b => b !== book),
                  }))
                }
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--accent-primary-soft)] text-[var(--accent-primary)]"
              >
                <span>Book {book}</span>
                <XIcon className="w-3 h-3" />
              </button>
            ))}
            {selectedFilters.unit?.map(unit => (
              <button
                key={`u-${unit}`}
                type="button"
                onClick={() =>
                  setSelectedFilters(prev => ({
                    ...prev,
                    unit: prev.unit.filter(u => u !== unit),
                  }))
                }
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--accent-gold-soft)] text-[var(--accent-gold)]"
              >
                <span>{unitNames[unit]}</span>
                <XIcon className="w-3 h-3" />
              </button>
            ))}
            <button
              type="button"
              onClick={() => setSelectedFilters({})}
              className="text-xs font-semibold text-[var(--text-secondary)] hover:text-red-500 ml-1"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Collapsible Book & Unit Filter Tray */}
        {filtersExpanded && (
          <div className="px-4 pb-4 pt-3 border-t border-[var(--border-hairline)] bg-[var(--bg-subtle)]/35 rounded-b-2xl animate-fade-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
            </div>
          </div>
        )}
      </div>

      {/* Unified Split-Pane Workspace */}
      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0 lg:h-[calc(100vh-14.5rem)]">
        <div
          className={`w-full lg:w-80 xl:w-88 flex-shrink-0 flex flex-col min-h-0 ${
            activeDefinition ? 'hidden lg:flex' : 'flex flex-1 lg:flex-none'
          }`}
        >
          <DefinitionList
            definitions={filteredDefinitions}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            unitNames={unitNames}
            favorites={favorites}
            toggleFavorite={onToggleFavorite}
            searchTerm={searchTerm}
            noteVersion={noteVersion}
          />
        </div>

        <div
          className={
            activeDefinition
              ? 'fixed inset-0 z-40 bg-[var(--bg-canvas)] p-2 flex flex-col lg:static lg:inset-auto lg:z-auto lg:bg-transparent lg:p-0 lg:flex-1 lg:min-w-0 lg:min-h-0'
              : 'hidden lg:flex lg:flex-1 lg:min-w-0 lg:flex-col lg:min-h-0'
          }
        >
          <DefinitionViewer
            definition={activeDefinition}
            definitions={filteredDefinitions}
            setSelectedId={setSelectedId}
            unitNames={unitNames}
            onToggleFavorite={onToggleFavorite}
            isFavorite={selectedId ? favorites.includes(selectedId) : false}
            onBackToList={() => setSelectedId(null)}
            onOpenNotes={() => setShowNotes(true)}
            onOpenShortcuts={() => setShowShortcutsHelp(true)}
            noteExists={hasSavedNote(noteStorageKey)}
          />
        </div>
      </div>

      {/* Docked Notes Drawer */}
      <NotesDrawer
        isOpen={showNotes && Boolean(activeDefinition)}
        onClose={() => setShowNotes(false)}
        storageKey={noteStorageKey}
        title={activeDefinition ? `Notes • ${activeDefinition.name}` : 'Notes'}
        subtitle={
          activeDefinition
            ? `Book ${activeDefinition.book} • ${unitNames[activeDefinition.unit]}`
            : ''
        }
        onNoteChange={() => setNoteVersion(v => v + 1)}
      />

      {/* Keyboard Shortcuts Modal */}
      <ShortcutsModal
        isOpen={showShortcutsHelp}
        onClose={() => setShowShortcutsHelp(false)}
        shortcuts={DEFINITION_SHORTCUTS}
      />
    </div>
  );
};

export default React.memo(Definitions);
