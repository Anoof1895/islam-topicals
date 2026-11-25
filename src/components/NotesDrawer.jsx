import React, { useEffect, useState } from 'react';
import { NoteIcon, XIcon } from './Icons';

const NotesDrawer = ({
  isOpen,
  onClose,
  storageKey,
  title,
  subtitle,
  placeholder = 'Write your study notes here... (auto-saved)',
  onNoteChange,
}) => {
  const [notes, setNotes] = useState('');
  const [saveIndicator, setSaveIndicator] = useState('');

  useEffect(() => {
    if (!storageKey) {
      setNotes('');
      return;
    }
    try {
      const saved = localStorage.getItem(storageKey) || '';
      setNotes(saved);
      setSaveIndicator('');
    } catch {
      setNotes('');
    }
  }, [storageKey]);

  const handleChange = (val) => {
    setNotes(val);
    if (!storageKey) return;
    try {
      if (val.trim() === '') {
        localStorage.removeItem(storageKey);
        setSaveIndicator('Cleared');
      } else {
        localStorage.setItem(storageKey, val);
        setSaveIndicator('Saved');
      }
      if (onNoteChange) onNoteChange(val);
    } catch (err) {
      console.error('Error saving note:', err);
    }
  };

  const handleClear = () => {
    handleChange('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex justify-end items-end lg:items-stretch">
      {/* Subtle non-blurred backdrop on mobile only */}
      <div
        className="fixed inset-0 bg-slate-950/35 lg:bg-transparent pointer-events-auto lg:pointer-events-none"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <aside
        className="pointer-events-auto relative z-10 w-full lg:w-[400px] xl:w-[440px] max-h-[80vh] lg:max-h-none lg:h-full bg-[var(--bg-surface)] border-t lg:border-t-0 lg:border-l border-[var(--border-hairline)] rounded-t-xl lg:rounded-none shadow-[var(--shadow-popover)] flex flex-col animate-drawer-up lg:animate-drawer-left isolate"
        role="dialog"
        aria-label={title || 'Study Notes'}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-5 py-3.5 border-b border-[var(--border-hairline)] bg-[var(--bg-inset)] rounded-t-xl lg:rounded-none">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-md bg-[var(--subject-biology-bg)] border border-[var(--subject-biology-border)] text-[var(--subject-biology)] flex items-center justify-center shrink-0">
              <NoteIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-editorial text-base font-semibold text-[var(--ink-primary)] truncate">
                {title || 'Study Notes'}
              </h3>
              {subtitle && (
                <p className="text-xs text-[var(--ink-secondary)] truncate">{subtitle}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--bg-surface)] transition-colors"
            title="Close notes (Esc)"
            aria-label="Close notes"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Textarea */}
        <div className="flex-1 p-4 sm:p-5 flex flex-col min-h-[240px] bg-[var(--bg-surface)]">
          <textarea
            value={notes}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
            autoFocus
            className="w-full flex-1 min-h-[220px] p-3.5 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-inset)] text-[var(--ink-primary)] placeholder:text-[var(--ink-muted)] focus:outline-none focus:border-[var(--subject-biology)] resize-none text-sm leading-relaxed transition-colors"
          />
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[var(--border-hairline)] bg-[var(--bg-inset)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-[var(--ink-muted)]">
            <span className="font-mono-code tabular-nums">{notes.length} chars</span>
            {saveIndicator && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--subject-biology-bg)] text-[var(--subject-biology)] border border-[var(--subject-biology-border)] font-medium">
                {saveIndicator}
              </span>
            )}
            <span className="hidden sm:inline">
              · Press{' '}
              <kbd className="font-mono-code px-1.5 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-[11px]">
                Esc
              </kbd>{' '}
              to close
            </span>
          </div>
          <button
            type="button"
            onClick={handleClear}
            disabled={!notes}
            className="px-3 py-1.5 text-xs font-medium rounded-md border border-[var(--border-hairline)] text-[var(--ink-secondary)] hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Clear Note
          </button>
        </div>
      </aside>
    </div>
  );
};

export default NotesDrawer;
