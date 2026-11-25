import React, { useState, useEffect } from 'react';
import {
  DownloadIcon,
  ExternalLinkIcon,
  LibraryIcon,
  NoteIcon,
} from '../components/Icons';

const PDF_FILES = {
  grade9SB: '/pdfs/Grade 9 SB.pdf',
  grade9TG: '/pdfs/Grade 9 TG.pdf',
  grade10SB: '/pdfs/Grade 10 SB.pdf',
  grade10TG: '/pdfs/Grade 10 TG.pdf',
  summary: '/pdfs/summary.pdf',
};

const BookViewer = () => {
  const [selectedGrade, setSelectedGrade] = useState(9);
  const [selectedBookType, setSelectedBookType] = useState('SB');
  const [activeTab, setActiveTab] = useState('book'); // 'book' | 'summary'
  const [notes, setNotes] = useState({});
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');
  const [showNotesPanel, setShowNotesPanel] = useState(true);

  useEffect(() => {
    const loadedNotes = {};
    try {
      [9, 10].forEach(grade => {
        ['SB', 'TG'].forEach(bookType => {
          const noteKey = `grade_${grade}_${bookType}`;
          const note = localStorage.getItem(`book_notes_${noteKey}`);
          if (note) {
            loadedNotes[noteKey] = note;
          }
        });
      });

      const summaryNote = localStorage.getItem('book_notes_summary');
      if (summaryNote) {
        loadedNotes.summary = summaryNote;
      }
    } catch (err) {
      console.error('Error loading book notes:', err);
    }
    setNotes(loadedNotes);
  }, []);

  const getCurrentPdfUrl = () => {
    if (activeTab === 'summary') return PDF_FILES.summary;
    return PDF_FILES[`grade${selectedGrade}${selectedBookType}`];
  };

  const getCurrentBookName = () => {
    if (activeTab === 'summary') return 'Book Summary';
    return `Grade ${selectedGrade} ${selectedBookType === 'SB' ? 'Student Book' : 'Teacher Guide'}`;
  };

  const getCurrentNoteKey = () => {
    if (activeTab === 'summary') return 'summary';
    return `grade_${selectedGrade}_${selectedBookType}`;
  };

  const currentNoteKey = getCurrentNoteKey();
  const currentNote = notes[currentNoteKey] || '';
  const currentPdfUrl = getCurrentPdfUrl();
  const currentBookName = getCurrentBookName();

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        if (currentNote.trim() === '') {
          localStorage.removeItem(`book_notes_${currentNoteKey}`);
        } else {
          localStorage.setItem(`book_notes_${currentNoteKey}`, currentNote);
          setSaveStatus('Auto-saved');
          setTimeout(() => setSaveStatus(''), 1800);
        }
      } catch (err) {
        console.error('Error saving note:', err);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [currentNote, currentNoteKey]);

  const handleNoteChange = (value) => {
    setNotes(prev => ({ ...prev, [currentNoteKey]: value }));
  };

  const handleManualSave = () => {
    try {
      if (currentNote.trim() === '') {
        localStorage.removeItem(`book_notes_${currentNoteKey}`);
        setSaveStatus('Cleared');
      } else {
        localStorage.setItem(`book_notes_${currentNoteKey}`, currentNote);
        setSaveStatus('Saved');
      }
      setTimeout(() => setSaveStatus(''), 1800);
    } catch (err) {
      console.error('Error saving note:', err);
    }
  };

  const wordCount = currentNote.trim() ? currentNote.trim().split(/\s+/).length : 0;

  return (
    <div className="flex-1 flex flex-col min-h-0 gap-3.5 animate-fade-up">
      {/* Top Toolbar */}
      <div className="rounded-lg bg-[var(--bg-surface)] border border-[var(--border-hairline)] px-4 sm:px-5 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-[var(--subject-biology-bg)] border border-[var(--subject-biology-border)] text-[var(--subject-biology)] flex items-center justify-center shrink-0">
              <LibraryIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-editorial text-lg sm:text-xl font-semibold text-[var(--ink-primary)] leading-tight">
                Textbooks &amp; Summaries
              </h2>
              <p className="text-xs text-[var(--ink-secondary)]">
                Read syllabus PDFs side-by-side with your personal notebook
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex p-0.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-warm-strong)]">
              <button
                type="button"
                onClick={() => setActiveTab('book')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  activeTab === 'book'
                    ? 'bg-[var(--action-primary-bg)] text-[var(--action-primary-fg)]'
                    : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
                }`}
              >
                Textbooks
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('summary')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  activeTab === 'summary'
                    ? 'bg-[var(--action-primary-bg)] text-[var(--action-primary-fg)]'
                    : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
                }`}
              >
                Book Summary
              </button>
            </div>

            {activeTab === 'book' && (
              <>
                <div className="inline-flex p-0.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-warm-strong)]">
                  {[9, 10].map(grade => (
                    <button
                      key={grade}
                      type="button"
                      onClick={() => setSelectedGrade(grade)}
                      className={`px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                        selectedGrade === grade
                          ? 'bg-[var(--action-primary-bg)] text-[var(--action-primary-fg)]'
                          : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
                      }`}
                    >
                      Grade {grade}
                    </button>
                  ))}
                </div>

                <div className="inline-flex p-0.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-warm-strong)]">
                  {[
                    { code: 'SB', label: 'Student Book' },
                    { code: 'TG', label: 'Teacher Guide' },
                  ].map(bt => (
                    <button
                      key={bt.code}
                      type="button"
                      onClick={() => setSelectedBookType(bt.code)}
                      className={`px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                        selectedBookType === bt.code
                          ? 'bg-[var(--action-primary-bg)] text-[var(--action-primary-fg)]'
                          : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
                      }`}
                    >
                      {bt.label}
                    </button>
                  ))}
                </div>
              </>
            )}

            <button
              type="button"
              onClick={() => setShowNotesPanel(prev => !prev)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                showNotesPanel
                  ? 'bg-[var(--subject-biology-bg)] text-[var(--subject-biology)] border-[var(--subject-biology-border)]'
                  : 'bg-[var(--bg-inset)] text-[var(--ink-secondary)] border-[var(--border-hairline)] hover:text-[var(--ink-primary)]'
              }`}
            >
              <NoteIcon className="w-3.5 h-3.5" />
              <span>{showNotesPanel ? 'Hide Notes' : 'Show Notes'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Split Reader + Notebook */}
      <div className="flex-1 flex flex-col lg:flex-row gap-3.5 min-h-0 min-w-0">
        {/* PDF Viewer */}
        <div className="flex-1 min-w-0 flex flex-col min-h-0 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-hairline)] overflow-hidden">
          <div className="px-4 py-2.5 border-b border-[var(--border-hairline)] bg-[var(--bg-inset)] flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-editorial text-base font-semibold text-[var(--ink-primary)]">
                {currentBookName}
              </h3>
              {pdfError && <p className="text-xs text-red-500 mt-0.5">{pdfError}</p>}
            </div>

            <div className="flex items-center gap-2">
              <a
                href={currentPdfUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-[var(--ink-primary)] hover:border-[var(--border-strong)] transition-colors"
              >
                <ExternalLinkIcon className="w-3.5 h-3.5" />
                <span>Open Tab</span>
              </a>
              <a
                href={currentPdfUrl}
                download
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[var(--action-primary-bg)] text-[var(--action-primary-fg)] hover:bg-[var(--action-primary-hover)] transition-colors"
              >
                <DownloadIcon className="w-3.5 h-3.5" />
                <span>Download</span>
              </a>
            </div>
          </div>

          <div className="flex-1 min-w-0 flex flex-col min-h-[540px] lg:min-h-[640px] relative bg-[var(--bg-paper)] p-2 sm:p-3 overflow-hidden">
            {pdfLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-surface)]/85 z-10">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-7 h-7 rounded-full border-2 border-[var(--border-strong)] border-t-[var(--subject-biology)] animate-spin" />
                  <p className="text-xs font-medium text-[var(--ink-secondary)]">Loading PDF...</p>
                </div>
              </div>
            )}

            <iframe
              key={currentPdfUrl}
              src={currentPdfUrl}
              className="w-full flex-1 rounded-md border border-[var(--border-hairline)] bg-white block"
              title={currentBookName}
              onLoadStart={() => setPdfLoading(true)}
              onLoad={() => {
                setPdfLoading(false);
                setPdfError(null);
              }}
              onError={() => {
                setPdfLoading(false);
                setPdfError(`Failed to load: ${currentBookName}`);
              }}
            />
          </div>
        </div>

        {/* Collapsible Notes Sidebar */}
        {showNotesPanel && (
          <div className="w-full lg:w-96 flex-shrink-0 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-hairline)] flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border-hairline)] bg-[var(--bg-inset)] flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <NoteIcon className="w-4 h-4 text-[var(--subject-biology)] shrink-0" />
                <h3 className="font-editorial text-[15px] font-semibold text-[var(--ink-primary)] truncate">
                  Notes · {currentBookName}
                </h3>
              </div>
              <span className="font-mono-code tabular-nums text-[11px] px-2 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-[var(--ink-muted)] shrink-0">
                {wordCount}w · {currentNote.length}c
              </span>
            </div>

            <div className="p-4 flex-1 flex flex-col">
              <textarea
                value={currentNote}
                onChange={(e) => handleNoteChange(e.target.value)}
                placeholder={`Write study notes for ${currentBookName}...`}
                className="w-full flex-1 min-h-[260px] lg:min-h-[420px] p-3.5 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-inset)] text-sm text-[var(--ink-primary)] placeholder:text-[var(--ink-muted)] leading-relaxed resize-none focus:outline-none focus:border-[var(--subject-biology)] transition-colors"
              />
            </div>

            <div className="px-4 py-2.5 border-t border-[var(--border-hairline)] bg-[var(--bg-inset)] flex items-center justify-between gap-2">
              <span
                className={`text-xs font-medium ${
                  saveStatus ? 'text-[var(--subject-biology)]' : 'text-[var(--ink-muted)]'
                }`}
              >
                {saveStatus || 'Auto-saves locally'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleNoteChange('')}
                  disabled={!currentNote}
                  className="px-3 py-1.5 rounded-md text-xs font-medium border border-[var(--border-hairline)] text-[var(--ink-secondary)] hover:text-red-600 dark:hover:text-red-400 disabled:opacity-40 transition-colors"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={handleManualSave}
                  className="px-3.5 py-1.5 rounded-md text-xs font-medium bg-[var(--action-primary-bg)] text-[var(--action-primary-fg)] hover:bg-[var(--action-primary-hover)] transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookViewer;
