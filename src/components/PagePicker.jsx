import React, { useState, useRef, useEffect } from 'react';
import { CheckIcon, ChevronDownIcon } from './Icons';

/**
 * Custom hairline editorial popover replacing native dropdown page pickers.
 */
const PagePicker = ({ currentPage, totalPages, onChange, ariaLabel = 'Select page' }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative inline-block">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(prev => !prev)}
        className="inline-flex items-center gap-1.5 font-mono-code tabular-nums text-xs font-medium px-2.5 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-colors"
      >
        <span>
          {currentPage} / {totalPages}
        </span>
        <ChevronDownIcon
          className={`w-3.5 h-3.5 text-[var(--text-muted)] transition-transform duration-150 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={ariaLabel}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-50 w-28 max-h-52 overflow-y-auto rounded-lg bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-[var(--shadow-popover)] p-1 scholar-scroll"
        >
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
            const active = page === currentPage;
            return (
              <button
                key={page}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(page);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md font-mono-code tabular-nums text-xs transition-colors ${
                  active
                    ? 'bg-[var(--action-primary-bg)] text-[var(--action-primary-fg)] font-semibold'
                    : 'text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
                }`}
              >
                <span>Page {page}</span>
                {active && <CheckIcon className="w-3.5 h-3.5 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PagePicker;
