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

  // Load saved note whenever storageKey changes
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
      {/* Subtle backdrop on mobile only so desktop users can read the question alongside */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-[1px] lg:bg-transparent lg:backdrop-blur-none pointer-events-auto lg:pointer-events-none"
        onClick={onClose}
      />

      {/* Drawer Panel: Bottom sheet on mobile, right-side docked panel on desktop */}
      <aside
        className="pointer-events-auto relative z-10 w-full lg:w-[400px] xl:w-[440px] max-h-[80vh] lg:max-h-none lg:h-full bg-[var(--bg-surface)] border-t lg:border-t-0 lg:border-l border-[var(--border-hairline)] rounded-t-2xl lg:rounded-none shadow-2xl flex flex-col animate-drawer-up lg:animate-drawer-left isolate"
        style={{ backgroundColor: 'var(--bg-surface)' }}
        role="dialog"
        aria-label={title || 'Study Notes'}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between gap-3 px-5 py-4 border-b border-[var(--border-hairline)] bg-[var(--bg-subtle)] rounded-t-2xl lg:rounded-none"
          style={{ backgroundColor: 'var(--bg-subtle)' }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[var(--accent-primary-soft)] text-[var(--accent-primary)] flex items-center justify-center flex-shrink-0">
              <NoteIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-serif-editorial text-lg font-semibold text-[var(--text-primary)] truncate">
                {title || 'Study Notes'}
              </h3>
              {subtitle && (
                <p className="text-xs text-[var(--text-secondary)] truncate">{subtitle}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
            title="Close notes (Esc)"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Textarea */}
        <div
          className="flex-1 p-5 flex flex-col min-h-[240px] bg-[var(--bg-surface)]"
          style={{ backgroundColor: 'var(--bg-surface)' }}
        >
          <textarea
            value={notes}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
            autoFocus
            style={{ backgroundColor: 'var(--bg-canvas)' }}
            className="w-full flex-1 min-h-[220px] p-4 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary)]/15 resize-none text-sm leading-relaxed transition-all"
          />
        </div>

        {/* Footer */}
        <div
          className="px-5 py-3.5 border-t border-[var(--border-hairline)] bg-[var(--bg-subtle)] flex items-center justify-between gap-3"
          style={{ backgroundColor: 'var(--bg-subtle)' }}
        >
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <span className="font-mono-code">{notes.length} chars</span>
            {saveIndicator && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--accent-primary-soft)] text-[var(--accent-primary)] font-medium">
                {saveIndicator}
              </span>
            )}
            <span className="hidden sm:inline">• Press <kbd className="font-mono-code px-1.5 py-0.5 rounded bg-[var(--bg-subtle)] border border-[var(--border-hairline)] text-[11px]">Esc</kbd> to close</span>
          </div>
          <button
            onClick={handleClear}
            disabled={!notes}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-[var(--border-hairline)] text-[var(--text-secondary)] hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Clear Note
          </button>
        </div>
      </aside>
    </div>
  );
};

export default NotesDrawer;
