import React from 'react';
import { KeyboardIcon, XIcon } from './Icons';

const ShortcutsModal = ({ isOpen, onClose, shortcuts }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/45 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-[var(--shadow-popover)] overflow-hidden animate-fade-up"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Keyboard Shortcuts"
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border-hairline)] bg-[var(--bg-inset)]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-[var(--subject-biology-bg)] border border-[var(--subject-biology-border)] text-[var(--subject-biology)] flex items-center justify-center">
              <KeyboardIcon className="w-4 h-4" />
            </div>
            <h3 className="font-editorial text-base font-semibold text-[var(--ink-primary)]">
              Keyboard Shortcuts
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--bg-subtle)] transition-colors"
            aria-label="Close shortcuts"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-3 divide-y divide-[var(--border-hairline)]">
          {shortcuts.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between py-2.5 text-sm">
              <span className="text-[var(--ink-secondary)]">{item.label}</span>
              <div className="flex items-center gap-1">
                {item.keys.map((k, kIdx) => (
                  <kbd
                    key={kIdx}
                    className="font-mono-code px-2 py-0.5 text-xs font-medium rounded bg-[var(--bg-inset)] border border-[var(--border-strong)] text-[var(--ink-primary)]"
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 py-2.5 bg-[var(--bg-inset)] border-t border-[var(--border-hairline)] text-center">
          <p className="text-xs text-[var(--ink-muted)]">
            Press{' '}
            <kbd className="font-mono-code px-1.5 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-hairline)]">
              Esc
            </kbd>{' '}
            to dismiss
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShortcutsModal;
