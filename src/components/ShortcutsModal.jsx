import React from 'react';
import { KeyboardIcon, XIcon } from './Icons';

const ShortcutsModal = ({ isOpen, onClose, shortcuts }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-2xl overflow-hidden animate-fade-up"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Keyboard Shortcuts"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-hairline)] bg-[var(--bg-subtle)]/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary-soft)] text-[var(--accent-primary)] flex items-center justify-center">
              <KeyboardIcon className="w-4 h-4" />
            </div>
            <h3 className="font-serif-editorial text-lg font-semibold text-[var(--text-primary)]">
              Keyboard Shortcuts
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4 divide-y divide-[var(--border-hairline)]">
          {shortcuts.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between py-2.5 text-sm">
              <span className="text-[var(--text-secondary)]">{item.label}</span>
              <div className="flex items-center gap-1">
                {item.keys.map((k, kIdx) => (
                  <kbd
                    key={kIdx}
                    className="font-mono-code px-2 py-1 text-xs font-medium rounded-md bg-[var(--bg-subtle)] border border-[var(--border-strong)] text-[var(--text-primary)] shadow-2xs"
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 py-3 bg-[var(--bg-subtle)]/40 border-t border-[var(--border-hairline)] text-center">
          <p className="text-xs text-[var(--text-muted)]">
            Press <kbd className="font-mono-code px-1.5 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-hairline)]">Esc</kbd> to dismiss
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShortcutsModal;
