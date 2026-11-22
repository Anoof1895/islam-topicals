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

  // Auto-save with proper empty-note removal
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
    <div className="flex-1 flex flex-col min-h-0 gap-4 animate-fade-up">
      {/* Top Toolbar */}
      <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-[var(--shadow-card)] px-4 sm:px-5 py-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary-soft)] text-[var(--accent-primary)] flex items-center justify-center flex-shrink-0">
              <LibraryIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif-editorial text-xl sm:text-2xl font-semibold text-[var(--text-primary)] leading-tight">
                Textbooks &amp; Summaries
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Read syllabus PDFs side-by-side with your personal notebook
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Book vs Summary Segmented Control */}
            <div className="inline-flex p-1 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-hairline)]">
              <button
                type="button"
                onClick={() => setActiveTab('book')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'book'
                    ? 'bg-[var(--accent-primary)] text-white shadow-2xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Textbooks
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('summary')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'summary'
                    ? 'bg-[var(--accent-gold)] text-white shadow-2xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Book Summary
              </button>
            </div>

            {activeTab === 'book' && (
              <>
                <div className="inline-flex p-1 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-hairline)]">
                  {[9, 10].map(grade => (
                    <button
                      key={grade}
                      type="button"
                      onClick={() => setSelectedGrade(grade)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        selectedGrade === grade
                          ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-2xs'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      Grade {grade}
                    </button>
                  ))}
                </div>

                <div className="inline-flex p-1 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-hairline)]">
                  {[
                    { code: 'SB', label: 'Student Book' },
                    { code: 'TG', label: 'Teacher Guide' },
                  ].map(bt => (
                    <button
                      key={bt.code}
                      type="button"
                      onClick={() => setSelectedBookType(bt.code)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        selectedBookType === bt.code
                          ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-2xs'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
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
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                showNotesPanel
                  ? 'bg-[var(--accent-primary-soft)] text-[var(--accent-primary)] border-[var(--accent-primary)]/30'
                  : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-[var(--border-hairline)] hover:text-[var(--text-primary)]'
              }`}
            >
              <NoteIcon className="w-3.5 h-3.5" />
              <span>{showNotesPanel ? 'Hide Notes' : 'Show Notes'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Split Reader + Notebook */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0 min-w-0">
        {/* PDF Viewer */}
        <div className="flex-1 min-w-0 flex flex-col min-h-0 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-[var(--shadow-card)] overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--border-hairline)] bg-[var(--bg-subtle)]/40 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-serif-editorial text-lg font-semibold text-[var(--text-primary)]">
                {currentBookName}
              </h3>
              {pdfError && <p className="text-xs text-red-500 mt-0.5">{pdfError}</p>}
            </div>

            <div className="flex items-center gap-2">
              <a
                href={currentPdfUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-colors"
              >
                <ExternalLinkIcon className="w-3.5 h-3.5" />
                <span>Open Tab</span>
              </a>
              <a
                href={currentPdfUrl}
                download
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primary-hover)] transition-colors"
              >
                <DownloadIcon className="w-3.5 h-3.5" />
                <span>Download</span>
              </a>
            </div>
          </div>

          <div className="flex-1 min-w-0 flex flex-col min-h-[540px] lg:min-h-[640px] relative bg-[var(--bg-subtle)]/50 p-2 sm:p-3 overflow-hidden">
            {pdfLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-surface)]/80 z-10">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 rounded-full border-2 border-[var(--border-strong)] border-t-[var(--accent-primary)] animate-spin" />
                  <p className="text-xs font-medium text-[var(--text-secondary)]">Loading PDF...</p>
                </div>
              </div>
            )}

            <iframe
              key={currentPdfUrl}
              src={currentPdfUrl}
              className="w-full flex-1 rounded-xl border border-[var(--border-hairline)] bg-white block"
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
          <div className="w-full lg:w-96 flex-shrink-0 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-[var(--shadow-card)] flex flex-col overflow-hidden">
            <div className="px-4 py-3.5 border-b border-[var(--border-hairline)] bg-[var(--bg-subtle)]/40 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <NoteIcon className="w-4 h-4 text-[var(--accent-primary)] flex-shrink-0" />
                <h3 className="font-serif-editorial text-base font-semibold text-[var(--text-primary)] truncate">
                  Notes • {currentBookName}
                </h3>
              </div>
              <span className="font-mono-code text-[11px] px-2 py-0.5 rounded-md bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-[var(--text-muted)] flex-shrink-0">
                {wordCount}w • {currentNote.length}c
              </span>
            </div>

            <div className="p-4 flex-1 flex flex-col">
              <textarea
                value={currentNote}
                onChange={(e) => handleNoteChange(e.target.value)}
                placeholder={`Write study notes for ${currentBookName}...`}
                className="w-full flex-1 min-h-[260px] lg:min-h-[420px] p-3.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] leading-relaxed resize-none focus:outline-none focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary)]/15 transition-all"
              />
            </div>

            <div className="px-4 py-3 border-t border-[var(--border-hairline)] bg-[var(--bg-subtle)]/35 flex items-center justify-between gap-2">
              <span
                className={`text-xs font-medium ${
                  saveStatus ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'
                }`}
              >
                {saveStatus || 'Auto-saves locally'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleNoteChange('')}
                  disabled={!currentNote}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-[var(--border-hairline)] text-[var(--text-secondary)] hover:text-red-500 disabled:opacity-40 transition-colors"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={handleManualSave}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primary-hover)] transition-colors"
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
