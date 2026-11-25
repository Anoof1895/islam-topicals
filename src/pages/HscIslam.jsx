import React, { useState, useMemo, useEffect, useCallback } from 'react';
import './HscIslam.css';
import { hscModulesData } from '../hscModulesData';
import { hscModule1SpecimenData } from '../hscSpecimenData';
import {
  BookOpenIcon,
  CardDeckIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  ExternalLinkIcon,
  EyeIcon,
  FlipIcon,
  GridIcon,
  LibraryIcon,
  LightbulbIcon,
  NoteIcon,
  RubElHizbIcon,
  ScrollTextIcon,
  SearchIcon,
  ShuffleIcon,
  XIcon,
} from '../components/Icons';

const HSC_PDF_DOCUMENTS = [
  {
    id: 'mod1-book',
    title: 'Module 1: Islamic Aqeedha (Textbook Draft)',
    subtitle: 'މޮޑިއުލް 1: އިސްލާމީ ޢަޤީދާ — ދަރިވަރުންގެ ފޮތް (ޑްރާފްޓް)',
    url: '/pdfs/HSC Islam Module 1.pdf',
    badge: 'Textbook',
    meta: '114 Pages • Chapters 1–20',
  },
  {
    id: 'mod2-spec',
    title: 'Module 2: Hadhees & Akhlaaq Specification',
    subtitle: 'މޮޑިއުލް 2: ޙަދީޘް ޢިލްމާއި އިސްލާމީ އަޚްލާޤު — ސްޕެސިފިކޭޝަން',
    url: '/pdfs/HSC Islam - Module 2 Specification.pdf',
    badge: 'Specification',
    meta: '23 Pages • 28 Outcomes',
  },
  {
    id: 'mod1-specimen-paper',
    title: 'Module 1: Specimen Exam Paper (2026)',
    subtitle: 'މޮޑިއުލް 1: އެޗް.އެސް.ސީ އިމްތިޙާން — ނަމޫނާ ކަރުދާސް 2026',
    url: '/pdfs/HSC Islam - Module 1 Specimen Paper.pdf',
    badge: 'Specimen Exam',
    meta: '18 Pages • 60 Marks',
    pairId: 'mod1-specimen-ms',
    pairLabel: 'Switch to Mark Scheme',
  },
  {
    id: 'mod1-specimen-ms',
    title: 'Module 1: Specimen Mark Scheme (2026)',
    subtitle: 'މޮޑިއުލް 1: ނަމޫނާ ކަރުދާހުގެ ރަސްމީ މާކިންގ ސްކީމް 2026',
    url: '/pdfs/HSC Islam - Module 1 Specimen Paper Mark Scheme.pdf',
    badge: 'Mark Scheme',
    meta: '20 Pages • Official Rubric',
    pairId: 'mod1-specimen-paper',
    pairLabel: 'Switch to Question Paper',
  },
  {
    id: 'grade-11-sb',
    title: 'Islam Grade 11 Student Book (Reference)',
    subtitle: 'އިސްލާމީ ތަރުބިޔަތު — ގްރޭޑް 11 ދަރިވަރުންގެ ފޮތް',
    url: '/pdfs/Islam Grade 11 SB.pdf',
    badge: 'Reference SB',
    meta: '316 Pages • Covers ޙދ 1, 4–6.1, 8–11 & އޚ 1–7, 13',
  },
  {
    id: 'grade-12-sb',
    title: 'Islam Grade 12 Student Book (Reference)',
    subtitle: 'އިސްލާމީ ތަރުބިޔަތު — ގްރޭޑް 12 ދަރިވަރުންގެ ފޮތް',
    url: '/pdfs/Islam Grade 12 SB.pdf',
    badge: 'Reference SB',
    meta: '293 Pages • Covers ޙދ 2–3, 6.2–7, 12–15 & އޚ 8–12',
  },
];

const cleanText = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/\]*\]/gi, '')
    .replace(/【[^】]*】/g, '')
    .replace(/\[\d+\]/g, '')
    .replace(/\|/g, '')
    .trim();
};

const renderPromptWithUnderline = (text, underlinedText) => {
  if (!underlinedText || typeof text !== 'string' || !text.includes(underlinedText)) {
    return text;
  }
  const idx = text.indexOf(underlinedText);
  const before = text.slice(0, idx);
  const after = text.slice(idx + underlinedText.length);
  return (
    <>
      {before}
      <span className="underline decoration-2 decoration-[var(--accent-gold)] underline-offset-4 font-semibold">
        {underlinedText}
      </span>
      {after}
    </>
  );
};

const HscFlashcard = ({ term, paragraphs, large = false, isFlipped: controlledFlip, onFlip }) => {
  const [internalFlip, setInternalFlip] = useState(false);
  const isFlipped = controlledFlip !== undefined ? controlledFlip : internalFlip;

  useEffect(() => {
    setInternalFlip(false);
  }, [term]);

  const handleToggle = () => {
    if (onFlip) onFlip();
    else setInternalFlip(prev => !prev);
  };

  return (
    <div
      onClick={handleToggle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleToggle();
        }
      }}
      className={`perspective-1000 cursor-pointer select-none ${large ? 'h-[320px] sm:h-[360px]' : 'h-[280px]'}`}
    >
      <div
        className={`relative w-full h-full preserve-3d transition-transform duration-500 ease-out ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* Front Face */}
        <div className="absolute inset-0 backface-hidden rounded-lg bg-[var(--bg-surface)] border border-[var(--border-hairline)] border-t-[3px] border-t-[var(--subject-islam)] hover:border-[var(--subject-islam)]/60 p-6 sm:p-8 flex flex-col items-center justify-center text-center gap-4 transition-colors">
          <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded bg-[var(--subject-islam-bg)] text-[var(--subject-islam)] border border-[var(--subject-islam-border)]">
            Term
          </span>
          <h3
            className={`dhivehi-text font-bold text-[var(--ink-primary)] leading-[2] ${
              large ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'
            }`}
            dir="rtl"
          >
            {cleanText(term)}
          </h3>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--ink-muted)] bg-[var(--bg-inset)] border border-[var(--border-hairline)] px-3 py-1 rounded-md">
            <FlipIcon className="w-3.5 h-3.5" />
            <span>{large ? 'Click or press Space to flip' : 'Tap to reveal'}</span>
          </span>
        </div>

        {/* Back Face */}
        <div
          className="absolute inset-0 backface-hidden rotate-y-180 rounded-lg bg-[var(--bg-inset)] border border-[var(--subject-islam)] border-t-[3px] border-t-[var(--subject-islam)] p-6 sm:p-8 flex flex-col justify-center overflow-y-auto scholar-scroll"
          dir="rtl"
        >
          <div className="space-y-3 text-center">
            <div className="dhivehi-text text-sm font-bold text-[var(--subject-islam)]">
              {cleanText(term)}
            </div>
            {paragraphs.map((paragraph, idx) => (
              <p
                key={idx}
                className={`dhivehi-text text-[var(--ink-primary)] leading-[2.15] ${
                  large ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'
                }`}
              >
                {cleanText(paragraph)}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const AccordionCard = ({ badgeLabel, variant = 'def', title, children, isOpen, onToggle }) => {
  const isDef = variant === 'def';

  return (
    <div
      className={`rounded-lg bg-[var(--bg-surface)] border transition-colors duration-150 overflow-hidden ${
        isOpen
          ? isDef
            ? 'border-[var(--subject-islam)]/65'
            : 'border-[var(--subject-biology)]/65'
          : 'border-[var(--border-hairline)] hover:border-[var(--border-strong)]'
      }`}
    >
      {/* Canonical 2px Top Accent Rule */}
      <div
        className={`h-[2px] w-full ${
          isDef ? 'bg-[var(--subject-islam)]' : 'bg-[var(--subject-biology)]'
        }`}
      />

      <button
        type="button"
        onClick={onToggle}
        dir="rtl"
        className="w-full flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 text-right hover:bg-[var(--bg-inset)] transition-colors"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span
            className={`shrink-0 px-2 py-0.5 rounded text-xs font-semibold border ${
              isDef
                ? 'arabic-text bg-[var(--subject-islam-bg)] text-[var(--subject-islam)] border-[var(--subject-islam-border)]'
                : 'dhivehi-text bg-[var(--subject-biology-bg)] text-[var(--subject-biology)] border-[var(--subject-biology-border)]'
            }`}
          >
            {badgeLabel}
          </span>
          <h3 className="dhivehi-text text-base sm:text-lg font-bold text-[var(--ink-primary)] leading-[1.95] text-right">
            {cleanText(title)}
          </h3>
        </div>

        <ChevronDownIcon
          className={`w-4 h-4 shrink-0 text-[var(--ink-muted)] transition-transform duration-150 ${
            isOpen ? 'rotate-180 text-[var(--ink-primary)]' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          dir="rtl"
          className="px-5 sm:px-6 pb-5 pt-3 border-t border-[var(--border-hairline)] bg-[var(--bg-inset)]/45 animate-fade-up"
        >
          {children}
        </div>
      )}
    </div>
  );
};

const SpecimenExamView = ({ onOpenPdf, onOpenModule }) => {
  const [sectionFilter, setSectionFilter] = useState('all'); // 'all' | 'part1' | 'part2'
  const [mcqAnswers, setMcqAnswers] = useState({});
  const [revealedPart2, setRevealedPart2] = useState({});
  const [showInstructions, setShowInstructions] = useState(false);

  const mcqs = hscModule1SpecimenData.part1Mcqs;
  const part2Questions = hscModule1SpecimenData.part2Questions;

  const answeredCount = Object.keys(mcqAnswers).length;
  const correctCount = mcqs.filter(q => mcqAnswers[q.id] === q.answer).length;
  const allPart2Revealed =
    part2Questions.length > 0 && part2Questions.every(q => Boolean(revealedPart2[q.id]));

  const toggleAllPart2 = () => {
    if (allPart2Revealed) {
      setRevealedPart2({});
      return;
    }
    const next = {};
    part2Questions.forEach(q => {
      next[q.id] = true;
    });
    setRevealedPart2(next);
  };

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Specimen Paper Header Card */}
      <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-[var(--shadow-card)] p-5 sm:p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5" dir="rtl">
            <div className="flex flex-wrap items-center gap-2" dir="ltr">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--accent-gold-soft)] text-[var(--accent-gold)] border border-[var(--accent-gold)]/25">
                NIE 2026 Official Specimen
              </span>
              <span className="font-mono-code px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-hairline)]">
                {hscModule1SpecimenData.totalMarks} Marks
              </span>
              <span className="dhivehi-text px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--accent-primary-soft)] text-[var(--accent-primary)]">
                ވަގުތު: {hscModule1SpecimenData.duration}
              </span>
            </div>
            <h2 className="dhivehi-text text-xl sm:text-2xl font-bold text-[var(--text-primary)] leading-[1.9] text-right">
              {hscModule1SpecimenData.title}
            </h2>
            <p className="dhivehi-text text-sm sm:text-base text-[var(--text-secondary)] text-right">
              {hscModule1SpecimenData.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => onOpenPdf('mod1-specimen-paper')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[var(--bg-subtle)] border border-[var(--border-hairline)] text-[var(--text-primary)] hover:border-[var(--accent-primary)] transition-colors"
            >
              <LibraryIcon className="w-3.5 h-3.5" />
              <span>Question Paper PDF</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenPdf('mod1-specimen-ms')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primary-hover)] transition-colors"
            >
              <CheckIcon className="w-3.5 h-3.5" />
              <span>Mark Scheme PDF</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenModule('mod1')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[var(--bg-subtle)] border border-[var(--border-hairline)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <BookOpenIcon className="w-3.5 h-3.5" />
              <span>Module 1 Notes</span>
            </button>
          </div>
        </div>

        {/* Cover Instructions Toggle + Section Switcher */}
        <div className="pt-3 border-t border-[var(--border-hairline)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="inline-flex p-1 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-hairline)] self-start">
            {[
              { id: 'all', label: 'All Sections (60m)' },
              { id: 'part1', label: 'Part 1: MCQs (15m)' },
              { id: 'part2', label: 'Part 2: Structured (45m)' },
            ].map(opt => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSectionFilter(opt.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  sectionFilter === opt.id
                    ? 'bg-[var(--bg-surface)] text-[var(--accent-primary)] shadow-2xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowInstructions(prev => !prev)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent-primary)] hover:underline self-start sm:self-auto"
          >
            <span>{showInstructions ? 'Hide Exam Instructions' : 'View Exam Cover Instructions'}</span>
            <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform ${showInstructions ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {showInstructions && (
          <div
            className="rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-hairline)] p-4 space-y-2 animate-fade-up"
            dir="rtl"
          >
            {hscModule1SpecimenData.instructions.map((inst, idx) => (
              <p key={idx} className="dhivehi-text text-sm sm:text-base text-[var(--text-primary)] leading-[2]">
                • {inst}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* PART 1: MULTIPLE CHOICE QUESTIONS */}
      {(sectionFilter === 'all' || sectionFilter === 'part1') && (
        <section className="space-y-4">
          <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5" dir="rtl">
              <span className="dhivehi-text whitespace-nowrap flex-shrink-0 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--accent-gold-soft)] text-[var(--accent-gold)]">
                1 ވަނަ ބައި
              </span>
              <h3 className="dhivehi-text text-base sm:text-lg font-bold text-[var(--text-primary)]">
                މަލްޓިޕްލް ޗޮއިސް (15 ސުވާލު — 15 މާކުސް)
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-xs font-semibold text-[var(--text-secondary)]">
                Score:{' '}
                <span className="font-mono-code text-sm font-bold text-[var(--accent-primary)]">
                  {correctCount} / {mcqs.length}
                </span>{' '}
                <span className="text-[var(--text-muted)]">({answeredCount} answered)</span>
              </div>
              {answeredCount > 0 && (
                <button
                  type="button"
                  onClick={() => setMcqAnswers({})}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--bg-subtle)] border border-[var(--border-hairline)] text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-colors"
                >
                  Reset MCQs
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {mcqs.map(q => {
              const selectedKey = mcqAnswers[q.id];
              const isAnswered = selectedKey !== undefined;
              const isCorrect = selectedKey === q.answer;

              return (
                <div
                  key={q.id}
                  className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-[var(--shadow-card)] p-5 space-y-4"
                  dir="rtl"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="dhivehi-text px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--accent-primary-soft)] text-[var(--accent-primary)]">
                        ސުވާލު {q.number}
                      </span>
                      <span className="dhivehi-text text-xs font-semibold text-[var(--text-muted)]">
                        (1 މާކުސް)
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5" dir="ltr">
                      <span className="font-mono-code text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-hairline)]">
                        Outcome {q.outcome}
                      </span>
                      <span className="dhivehi-text text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[var(--accent-gold-soft)] text-[var(--accent-gold)]">
                        {q.cognitiveLevel}
                      </span>
                    </div>
                  </div>

                  <p className="dhivehi-text text-base sm:text-lg text-[var(--text-primary)] leading-[2.2] font-medium">
                    {renderPromptWithUnderline(q.question, q.underlinedText)}
                  </p>

                  <div className="space-y-2">
                    {q.options.map(opt => {
                      const chosen = selectedKey === opt.key;
                      const isRightOption = opt.key === q.answer;

                      let btnStyle =
                        'bg-[var(--bg-subtle)]/60 border-[var(--border-hairline)] text-[var(--text-primary)] hover:border-[var(--accent-primary)]/50';
                      if (isAnswered) {
                        if (isRightOption) {
                          btnStyle =
                            'bg-[var(--accent-primary-soft)] border-[var(--accent-primary)] text-[var(--text-primary)] font-semibold';
                        } else if (chosen && !isRightOption) {
                          btnStyle =
                            'bg-red-500/10 border-red-500/70 text-[var(--text-primary)]';
                        } else {
                          btnStyle =
                            'bg-[var(--bg-subtle)]/30 border-[var(--border-hairline)] text-[var(--text-secondary)] opacity-75';
                        }
                      }

                      return (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() =>
                            setMcqAnswers(prev => ({ ...prev, [q.id]: opt.key }))
                          }
                          className={`w-full flex items-start justify-between gap-3 px-4 py-3 rounded-xl border text-right transition-all ${btnStyle}`}
                        >
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <span
                              className={`dhivehi-text w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5 ${
                                isAnswered && isRightOption
                                  ? 'bg-[var(--accent-primary)] text-white'
                                  : isAnswered && chosen && !isRightOption
                                  ? 'bg-red-600 text-white'
                                  : 'bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-[var(--text-secondary)]'
                              }`}
                            >
                              {opt.key}
                            </span>
                            <span className="dhivehi-text text-sm sm:text-base leading-[2]">
                              {opt.text}
                            </span>
                          </div>

                          {isAnswered && isRightOption && (
                            <CheckIcon className="w-4 h-4 text-[var(--accent-primary)] flex-shrink-0 mt-1.5" />
                          )}
                          {isAnswered && chosen && !isRightOption && (
                            <XIcon className="w-4 h-4 text-red-600 flex-shrink-0 mt-1.5" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {isAnswered && (
                    <div className="space-y-2 pt-2 border-t border-[var(--border-hairline)] animate-fade-up">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span
                          className={`dhivehi-text inline-flex items-center gap-1.5 font-bold ${
                            isCorrect ? 'text-[var(--subject-biology)]' : 'text-red-600 dark:text-red-400'
                          }`}
                        >
                          {isCorrect ? (
                            <>
                              <CheckIcon className="w-4 h-4 shrink-0" />
                              <span>ރަނގަޅު ޖަވާބު!</span>
                            </>
                          ) : (
                            <>
                              <XIcon className="w-4 h-4 shrink-0" />
                              <span>{`ރަނގަޅު ޖަވާބަކީ "${q.answer}" އެވެ.`}</span>
                            </>
                          )}
                        </span>
                        <span className="dhivehi-text text-[var(--text-muted)]">
                          {q.outcomeNote}
                        </span>
                      </div>

                      {q.studyNote && (
                        <div className="rounded-xl bg-[var(--accent-gold-soft)] border border-[var(--accent-gold)]/35 px-4 py-3">
                          <p className="dhivehi-text text-xs sm:text-sm text-[var(--text-primary)] leading-[2]">
                            {q.studyNote}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* PART 2: STRUCTURED & ESSAY QUESTIONS */}
      {(sectionFilter === 'all' || sectionFilter === 'part2') && (
        <section className="space-y-4">
          <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5" dir="rtl">
              <span className="dhivehi-text whitespace-nowrap flex-shrink-0 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--accent-primary-soft)] text-[var(--accent-primary)]">
                2 ވަނަ ބައި
              </span>
              <h3 className="dhivehi-text text-base sm:text-lg font-bold text-[var(--text-primary)]">
                ޢާއްމު ސުވާލާއި އިޚްތިޔާރީ ސުވާލު (18 ސުވާލު — 45 މާކުސް)
              </h3>
            </div>

            <button
              type="button"
              onClick={toggleAllPart2}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[var(--bg-subtle)] border border-[var(--border-hairline)] text-[var(--text-primary)] hover:border-[var(--accent-primary)] transition-colors"
            >
              <EyeIcon className="w-3.5 h-3.5" />
              <span>{allPart2Revealed ? 'Hide All Mark Schemes' : 'Reveal All Mark Schemes'}</span>
            </button>
          </div>

          <div className="space-y-4">
            {part2Questions.map((q, idx) => {
              const prevQ = idx > 0 ? part2Questions[idx - 1] : null;
              const showSectionBanner =
                !prevQ ||
                prevQ.section !== q.section ||
                prevQ.groupInstruction !== q.groupInstruction;
              const isRevealed = Boolean(revealedPart2[q.id]);

              return (
                <React.Fragment key={q.id}>
                  {showSectionBanner && (
                    <div
                      className="rounded-xl bg-[var(--accent-primary-soft)] border border-[var(--accent-primary)]/25 px-4 py-3"
                      dir="rtl"
                    >
                      <h4 className="dhivehi-text text-sm sm:text-base font-bold text-[var(--accent-primary)]">
                        {q.groupInstruction || q.sectionTitle}
                      </h4>
                    </div>
                  )}

                  <div
                    className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-[var(--shadow-card)] p-5 space-y-4"
                    dir="rtl"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="dhivehi-text px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--accent-primary-soft)] text-[var(--accent-primary)]">
                          ސުވާލު {q.number}
                        </span>
                        <span className="dhivehi-text text-xs font-semibold text-[var(--accent-gold)] bg-[var(--accent-gold-soft)] px-2.5 py-0.5 rounded-full">
                          {q.marks} މާކުސް
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5" dir="ltr">
                        <span className="font-mono-code text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-hairline)]">
                          Outcome {q.outcome}
                        </span>
                        <span className="dhivehi-text text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[var(--bg-subtle)] text-[var(--text-secondary)]">
                          {q.cognitiveLevel}
                        </span>
                      </div>
                    </div>

                    <p className="dhivehi-text text-base sm:text-lg text-[var(--text-primary)] leading-[2.2] font-medium">
                      {renderPromptWithUnderline(q.question, q.underlinedText)}
                    </p>

                    {q.subQuestions && q.subQuestions.length > 0 && (
                      <div className="space-y-2.5 pr-3 border-r-2 border-[var(--border-strong)]">
                        {q.subQuestions.map(sub => (
                          <div
                            key={sub.key}
                            className="rounded-xl bg-[var(--bg-subtle)]/55 px-4 py-3 space-y-1"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="dhivehi-text text-xs font-bold text-[var(--accent-primary)]">
                                {sub.key}.
                              </span>
                              <span className="dhivehi-text text-xs font-semibold text-[var(--text-muted)]">
                                ({sub.marks} މާކުސް)
                              </span>
                            </div>
                            <p className="dhivehi-text text-sm sm:text-base text-[var(--text-primary)] leading-[2.1]">
                              {sub.text}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="pt-1 flex justify-end" dir="ltr">
                      <button
                        type="button"
                        onClick={() =>
                          setRevealedPart2(prev => ({ ...prev, [q.id]: !prev[q.id] }))
                        }
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                          isRevealed
                            ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]'
                            : 'bg-[var(--bg-subtle)] text-[var(--text-primary)] border-[var(--border-hairline)] hover:border-[var(--accent-primary)]'
                        }`}
                      >
                        <EyeIcon className="w-3.5 h-3.5" />
                        <span>
                          {isRevealed ? 'Hide Official Mark Scheme' : 'Reveal Official Mark Scheme'}
                        </span>
                      </button>
                    </div>

                    {isRevealed && (
                      <div className="rounded-xl bg-[var(--bg-elevated)] border border-[var(--accent-primary)]/40 p-4 sm:p-5 space-y-3 animate-fade-up">
                        {q.modelAnswers.map((ansGroup, gIdx) => (
                          <div key={gIdx} className="space-y-1.5">
                            <div className="dhivehi-text text-xs sm:text-sm font-bold text-[var(--accent-primary)]">
                              {ansGroup.label}
                            </div>
                            <div className="space-y-1">
                              {ansGroup.points.map((pt, pIdx) => (
                                <p
                                  key={pIdx}
                                  className="dhivehi-text text-sm sm:text-base text-[var(--text-primary)] leading-[2.1]"
                                >
                                  {pt}
                                </p>
                              ))}
                            </div>
                          </div>
                        ))}
                        <div className="pt-2 border-t border-[var(--border-hairline)]">
                          <p className="dhivehi-text text-xs text-[var(--text-muted)]">
                            {q.outcomeNote}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};

export default function HscIslam({
  initialTab = 'mod1',
  initialViewMode = 'notes',
  onMasteryChange,
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [mod2Strand, setMod2Strand] = useState('all'); // 'all' | 1 | 2
  const [activeTopicTitle, setActiveTopicTitle] = useState('');
  const [factModuleFilter, setFactModuleFilter] = useState('all'); // 'all' | 'mod1' | 'mod2'
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [selectedPdfId, setSelectedPdfId] = useState('mod1-book');
  const [viewMode, setViewMode] = useState(initialViewMode); // 'notes' | 'flashcards'
  const [flashcardMode, setFlashcardMode] = useState('deck'); // 'deck' | 'grid'
  const [deckIndex, setDeckIndex] = useState(0);
  const [deckFlipped, setDeckFlipped] = useState(false);
  const [shuffledDefs, setShuffledDefs] = useState(null);
  const [openAccordions, setOpenAccordions] = useState({});
  const [mobileTopicDrawerOpen, setMobileTopicDrawerOpen] = useState(false);

  const [masteredTopics, setMasteredTopics] = useState(() => {
    try {
      const saved = localStorage.getItem('hscMasteredTopics');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (initialViewMode) setViewMode(initialViewMode);
  }, [initialViewMode]);

  const tabs = [
    { id: 'mod1', label: 'Module 1' },
    { id: 'mod2', label: 'Module 2' },
    { id: 'mod3', label: 'Module 3' },
    { id: 'mod4', label: 'Module 4' },
    { id: 'specimen', label: 'Specimen Exam', icon: ScrollTextIcon },
    { id: 'facts', label: 'Random Facts', icon: LightbulbIcon },
    { id: 'textbooks', label: 'PDF Library', icon: LibraryIcon },
  ];

  const factPool = useMemo(() => {
    const mod1Facts = (hscModulesData.mod1?.randomFacts || []).map(text => ({
      moduleId: 'mod1',
      moduleLabel: 'މޮޑިއުލް 1: އިސްލާމީ ޢަޤީދާ',
      text,
    }));
    const mod2Facts = (hscModulesData.mod2?.randomFacts || []).map(text => ({
      moduleId: 'mod2',
      moduleLabel: 'މޮޑިއުލް 2: ޙަދީޘް ޢިލްމާއި އިސްލާމީ އަޚްލާޤު',
      text,
    }));
    if (factModuleFilter === 'mod1') return mod1Facts;
    if (factModuleFilter === 'mod2') return mod2Facts;
    return [...mod1Facts, ...mod2Facts];
  }, [factModuleFilter]);

  useEffect(() => {
    setCurrentFactIndex(0);
  }, [factModuleFilter]);

  const displayedTopics = useMemo(() => {
    if (!activeTab.startsWith('mod')) return [];
    const moduleInfo = hscModulesData[activeTab];
    if (!moduleInfo) return [];
    let topics = moduleInfo.topics || [];

    if (activeTab === 'mod2' && mod2Strand !== 'all') {
      topics = topics.filter(t => t.strand === mod2Strand);
    }

    if (!searchQuery.trim()) return topics;
    const q = searchQuery.trim();

    return topics.filter(t => {
      const matchTitle = t.topicTitle.includes(q);
      const matchDefs = (t.definitions || []).some(
        d => d.term.includes(q) || d.paragraphs.some(p => p.includes(q))
      );
      const matchPoints = (t.keyPoints || []).some(
        kp => kp.heading.includes(q) || kp.points.some(p => p.includes(q))
      );
      return matchTitle || matchDefs || matchPoints;
    });
  }, [activeTab, mod2Strand, searchQuery]);

  useEffect(() => {
    if (activeTab.startsWith('mod')) {
      if (displayedTopics.length > 0) {
        if (!displayedTopics.find(t => t.topicTitle === activeTopicTitle)) {
          setActiveTopicTitle(displayedTopics[0].topicTitle);
        }
      } else {
        setActiveTopicTitle('');
      }
    }
  }, [displayedTopics, activeTopicTitle, activeTab]);

  // Reset accordion & deck state when changing topic
  useEffect(() => {
    setOpenAccordions({});
    setDeckIndex(0);
    setDeckFlipped(false);
    setShuffledDefs(null);
  }, [activeTopicTitle]);

  const activeTopicData = useMemo(
    () => displayedTopics.find(t => t.topicTitle === activeTopicTitle),
    [displayedTopics, activeTopicTitle]
  );

  const deckCards = useMemo(() => {
    if (shuffledDefs) return shuffledDefs;
    return activeTopicData?.definitions || [];
  }, [shuffledDefs, activeTopicData]);

  // Keyboard shortcuts for Focused Deck Flashcards
  useEffect(() => {
    if (!activeTab.startsWith('mod')) return;
    if (viewMode !== 'flashcards' || flashcardMode !== 'deck' || deckCards.length === 0) return;

    const handleKey = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        setDeckFlipped(prev => !prev);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setDeckFlipped(false);
        setDeckIndex(prev => (prev < deckCards.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setDeckFlipped(false);
        setDeckIndex(prev => (prev > 0 ? prev - 1 : deckCards.length - 1));
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeTab, viewMode, flashcardMode, deckCards.length]);

  const toggleMastered = (topicTitle) => {
    const newMastered = masteredTopics.includes(topicTitle)
      ? masteredTopics.filter(t => t !== topicTitle)
      : [...masteredTopics, topicTitle];
    setMasteredTopics(newMastered);
    try {
      localStorage.setItem('hscMasteredTopics', JSON.stringify(newMastered));
    } catch (err) {
      console.error('Error saving mastery:', err);
    }
    if (onMasteryChange) onMasteryChange(newMastered);
  };

  const generateRandomFact = useCallback(() => {
    if (factPool.length > 0) {
      let newIndex = currentFactIndex;
      while (newIndex === currentFactIndex && factPool.length > 1) {
        newIndex = Math.floor(Math.random() * factPool.length);
      }
      setCurrentFactIndex(newIndex);
    }
  }, [currentFactIndex, factPool.length]);

  const toggleAccordionKey = (key) => {
    setOpenAccordions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const setAllAccordions = (expanded) => {
    if (!activeTopicData) return;
    if (!expanded) {
      setOpenAccordions({});
      return;
    }
    const next = {};
    (activeTopicData.keyPoints || []).forEach((_, idx) => {
      next[`kp-${idx}`] = true;
    });
    (activeTopicData.definitions || []).forEach((_, idx) => {
      next[`def-${idx}`] = true;
    });
    setOpenAccordions(next);
  };

  const shuffleDeck = () => {
    const base = activeTopicData?.definitions || [];
    if (base.length <= 1) return;
    const copy = [...base].sort(() => Math.random() - 0.5);
    setShuffledDefs(copy);
    setDeckIndex(0);
    setDeckFlipped(false);
  };

  const openPdfDocument = (pdfId) => {
    setSelectedPdfId(pdfId);
    setActiveTab('textbooks');
  };

  const renderTabContent = () => {
    // ==================== SPECIMEN EXAM PRACTICE ====================
    if (activeTab === 'specimen') {
      return (
        <SpecimenExamView
          onOpenPdf={openPdfDocument}
          onOpenModule={(modId) => setActiveTab(modId)}
        />
      );
    }

    // ==================== PDF LIBRARY ====================
    if (activeTab === 'textbooks') {
      const selectedDoc =
        HSC_PDF_DOCUMENTS.find(doc => doc.id === selectedPdfId) || HSC_PDF_DOCUMENTS[0];
      const safePdfUrl = encodeURI(selectedDoc.url);

      return (
        <div className="space-y-4 animate-fade-up">
          {/* Document Selector Grid (All 6 HSC PDFs) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {HSC_PDF_DOCUMENTS.map(doc => {
              const isSelected = doc.id === selectedDoc.id;
              return (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => setSelectedPdfId(doc.id)}
                  className={`rounded-lg p-4 text-left border transition-colors flex flex-col justify-between gap-2 ${
                    isSelected
                      ? 'bg-[var(--bg-surface)] border-[var(--subject-islam)] border-t-[3px] border-t-[var(--subject-islam)]'
                      : 'bg-[var(--bg-surface)] border-[var(--border-hairline)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        isSelected
                          ? 'bg-[var(--subject-islam)] text-white'
                          : 'bg-[var(--bg-inset)] text-[var(--ink-secondary)] border border-[var(--border-hairline)]'
                      }`}
                    >
                      {doc.badge}
                    </span>
                    <span className="font-mono-code tabular-nums text-[11px] text-[var(--ink-muted)] truncate">
                      {doc.meta.split('•')[0].trim()}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-[var(--ink-primary)] leading-snug">
                      {doc.title}
                    </h3>
                    <p
                      className="dhivehi-text text-xs text-[var(--ink-secondary)] text-right leading-[1.85]"
                      dir="rtl"
                    >
                      {doc.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active PDF Toolbar */}
          <div className="rounded-lg bg-[var(--bg-surface)] border border-[var(--border-hairline)] p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-[var(--subject-islam-bg)] border border-[var(--subject-islam-border)] text-[var(--subject-islam)] flex items-center justify-center shrink-0">
                <LibraryIcon className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-editorial text-lg sm:text-xl font-semibold text-[var(--ink-primary)]">
                  {selectedDoc.title}
                </h2>
                <p className="text-xs text-[var(--ink-secondary)]">{selectedDoc.meta}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {selectedDoc.pairId && (
                <button
                  type="button"
                  onClick={() => setSelectedPdfId(selectedDoc.pairId)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[var(--subject-islam-bg)] border border-[var(--subject-islam-border)] text-[var(--subject-islam)] hover:opacity-90 transition-opacity"
                >
                  <FlipIcon className="w-3.5 h-3.5" />
                  <span>{selectedDoc.pairLabel}</span>
                </button>
              )}
              {(selectedDoc.id === 'mod1-specimen-paper' ||
                selectedDoc.id === 'mod1-specimen-ms') && (
                <button
                  type="button"
                  onClick={() => setActiveTab('specimen')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[var(--subject-biology-bg)] border border-[var(--subject-biology-border)] text-[var(--subject-biology)] hover:opacity-90 transition-opacity"
                >
                  <ScrollTextIcon className="w-3.5 h-3.5" />
                  <span>Interactive Specimen Practice</span>
                </button>
              )}
              <a
                href={safePdfUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[var(--bg-inset)] border border-[var(--border-hairline)] text-[var(--ink-primary)] hover:border-[var(--border-strong)] transition-colors"
              >
                <ExternalLinkIcon className="w-3.5 h-3.5" />
                <span>Open in New Tab</span>
              </a>
              <a
                href={safePdfUrl}
                download
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[var(--action-primary-bg)] text-[var(--action-primary-fg)] hover:bg-[var(--action-primary-hover)] transition-colors"
              >
                <DownloadIcon className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </a>
            </div>
          </div>

          <div className="rounded-lg bg-[var(--bg-surface)] border border-[var(--border-hairline)] p-2 sm:p-3 overflow-hidden">
            <iframe
              key={selectedDoc.id}
              src={safePdfUrl}
              title={selectedDoc.title}
              className="w-full h-[640px] lg:h-[75vh] rounded-md border border-[var(--border-hairline)] bg-white block"
            />
          </div>
        </div>
      );
    }

    // ==================== RANDOM FACTS ====================
    if (activeTab === 'facts') {
      const mod1Count = hscModulesData.mod1?.randomFacts?.length || 0;
      const mod2Count = hscModulesData.mod2?.randomFacts?.length || 0;
      const safeIdx = currentFactIndex < factPool.length ? currentFactIndex : 0;
      const currentFact = factPool[safeIdx];

      return (
        <div className="max-w-3xl mx-auto py-4 space-y-5 animate-fade-up">
          {/* Fact Source Filter Segmented Control */}
          <div className="flex justify-center">
            <div className="inline-flex flex-wrap items-center justify-center gap-1 p-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-warm-strong)]">
              {[
                { id: 'all', label: `All HSC Facts (${mod1Count + mod2Count})` },
                { id: 'mod1', label: `Module 1: Aqeedha (${mod1Count})` },
                { id: 'mod2', label: `Module 2: Hadhees & Akhlaaq (${mod2Count})` },
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFactModuleFilter(item.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    factModuleFilter === item.id
                      ? 'bg-[var(--action-primary-bg)] text-[var(--action-primary-fg)]'
                      : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--bg-subtle)]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {!currentFact ? (
            <div className="rounded-lg bg-[var(--bg-surface)] border border-[var(--border-hairline)] p-10 text-center text-[var(--ink-secondary)]">
              No facts available.
            </div>
          ) : (
            <>
              <div
                className="rounded-lg bg-[var(--bg-surface)] border border-[var(--border-hairline)] border-t-[3px] border-t-[var(--subject-islam)] overflow-hidden"
                dir="rtl"
              >
                {/* Scholarly Header */}
                <div className="px-5 sm:px-6 py-4 bg-[var(--bg-surface)] border-b border-[var(--border-hairline)] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-md bg-[var(--subject-islam-bg)] border border-[var(--subject-islam-border)] text-[var(--subject-islam)] flex items-center justify-center shrink-0">
                      <RubElHizbIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="dhivehi-text text-lg sm:text-xl font-bold text-[var(--ink-primary)] leading-tight">
                        ތިޔަދަރިވަރުންނަށް އެނގޭތަ!
                      </h2>
                      <div className="dhivehi-text text-xs text-[var(--ink-muted)]">
                        {currentFact.moduleLabel}
                      </div>
                    </div>
                  </div>
                  <span
                    className="font-mono-code tabular-nums text-xs px-2.5 py-0.5 rounded bg-[var(--bg-inset)] border border-[var(--border-hairline)] text-[var(--ink-secondary)]"
                    dir="ltr"
                  >
                    {safeIdx + 1} / {factPool.length}
                  </span>
                </div>

                {/* Fact Inset Body */}
                <div className="px-6 sm:px-10 py-10 sm:py-14 text-center bg-[var(--bg-inset)]">
                  <p className="dhivehi-text text-xl sm:text-2xl text-[var(--ink-primary)] leading-[2.3]">
                    {cleanText(currentFact.text)}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentFactIndex(prev => (prev > 0 ? prev - 1 : factPool.length - 1))
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-[var(--ink-primary)] hover:border-[var(--border-strong)] transition-colors"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                  <span>Previous</span>
                </button>
                <button
                  type="button"
                  onClick={generateRandomFact}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium bg-[var(--action-primary-bg)] text-[var(--action-primary-fg)] hover:bg-[var(--action-primary-hover)] transition-colors"
                >
                  <ShuffleIcon className="w-4 h-4" />
                  <span>Random Fact</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentFactIndex(prev => (prev < factPool.length - 1 ? prev + 1 : 0))
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-[var(--ink-primary)] hover:border-[var(--border-strong)] transition-colors"
                >
                  <span>Next</span>
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      );
    }

    // ==================== MODULE CONTENT ====================
    const moduleInfo = hscModulesData[activeTab];
    if (!moduleInfo || moduleInfo.topics.length === 0) {
      return (
        <div className="rounded-2xl bg-[var(--bg-surface)] border border-dashed border-[var(--border-strong)] p-12 text-center animate-fade-up">
          <div className="w-14 h-14 rounded-2xl bg-[var(--accent-gold-soft)] text-[var(--accent-gold)] flex items-center justify-center mx-auto mb-4">
            <BookOpenIcon className="w-7 h-7" />
          </div>
          <h2 className="dhivehi-text text-2xl font-bold text-[var(--text-primary)] mb-2" dir="rtl">
            {moduleInfo?.title || 'Coming Soon'}
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Study notes and flashcards for this AS/A2 module will be added soon.
          </p>
        </div>
      );
    }

    const isMastered = masteredTopics.includes(activeTopicTitle);
    const moduleTopics = moduleInfo.topics;
    const masteredInModule = moduleTopics.filter(t => masteredTopics.includes(t.topicTitle)).length;
    const progressPercent = Math.round((masteredInModule / moduleTopics.length) * 100) || 0;

    return (
      <div className="space-y-4 animate-fade-up">
        {/* RTL Search Bar */}
        <div className="relative">
          <SearchIcon className="w-4 h-4 text-[var(--ink-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="ނޯޓުތަކާއި ތަޢުރީފުތައް ހޯއްދަވާ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            dir="rtl"
            className="dhivehi-text w-full pl-10 pr-4 py-2.5 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--ink-primary)] placeholder:text-[var(--ink-muted)] text-base focus:outline-none focus:border-[var(--subject-islam)] transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute left-9 top-1/2 -translate-y-1/2 p-1 text-[var(--ink-muted)] hover:text-[var(--ink-primary)]"
              title="Clear search"
            >
              <XIcon className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Module 2 Strand Filter Bar */}
        {activeTab === 'mod2' && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-hairline)] px-4 py-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
              Module 2 Strands
            </span>
            <div className="flex flex-wrap items-center gap-1.5" dir="rtl">
              {[
                { id: 'all', label: `All Topics (${moduleTopics.length})`, isDhivehi: false },
                { id: 1, label: 'ބައި 1: ޙަދީޘް ޢިލްމު (15)', isDhivehi: true },
                { id: 2, label: 'ބައި 2: އިސްލާމީ އަޚްލާޤު (13)', isDhivehi: true },
              ].map(st => {
                const active = mod2Strand === st.id;
                return (
                  <button
                    key={String(st.id)}
                    type="button"
                    onClick={() => setMod2Strand(st.id)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors border ${
                      st.isDhivehi ? 'dhivehi-text' : ''
                    } ${
                      active
                        ? 'bg-[var(--subject-islam)] text-white border-[var(--subject-islam)]'
                        : 'bg-[var(--bg-inset)] text-[var(--ink-secondary)] border-[var(--border-hairline)] hover:text-[var(--ink-primary)]'
                    }`}
                  >
                    {st.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Mobile Quick Topic Picker Bar */}
        <div className="lg:hidden rounded-lg bg-[var(--bg-surface)] border border-[var(--border-hairline)] p-3 space-y-2.5 max-w-full overflow-hidden">
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs font-medium text-[var(--ink-secondary)]">
              Mastery:{' '}
              <span className="font-mono-code tabular-nums font-semibold text-[var(--subject-islam)]">
                {progressPercent}%
              </span>{' '}
              <span className="font-mono-code tabular-nums">
                ({masteredInModule}/{moduleTopics.length})
              </span>
            </div>
            <button
              type="button"
              onClick={() => setMobileTopicDrawerOpen(prev => !prev)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-[var(--subject-islam-bg)] border border-[var(--subject-islam-border)] text-[var(--subject-islam)] shrink-0"
            >
              <span>All Topics ({displayedTopics.length})</span>
              <ChevronDownIcon
                className={`w-3.5 h-3.5 transition-transform ${
                  mobileTopicDrawerOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
          </div>

          {/* Horizontal scrollable pills */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5 max-w-full" dir="rtl">
            {displayedTopics.map((topic, idx) => {
              const active = activeTopicTitle === topic.topicTitle;
              const mastered = masteredTopics.includes(topic.topicTitle);
              return (
                <button
                  key={topic.topicTitle || idx}
                  type="button"
                  onClick={() => setActiveTopicTitle(topic.topicTitle)}
                  className={`dhivehi-text shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-sm transition-colors border whitespace-nowrap ${
                    active
                      ? 'bg-[var(--subject-islam)] text-white border-[var(--subject-islam)] font-bold'
                      : mastered
                      ? 'bg-[var(--subject-biology-bg)] text-[var(--subject-biology)] border-[var(--subject-biology-border)]'
                      : 'bg-[var(--bg-inset)] text-[var(--ink-primary)] border-[var(--border-hairline)]'
                  }`}
                >
                  {mastered && <CheckIcon className="w-3.5 h-3.5 shrink-0" />}
                  <span>{cleanText(topic.topicTitle)}</span>
                </button>
              );
            })}
          </div>

          {mobileTopicDrawerOpen && (
            <div
              className="pt-2 border-t border-[var(--border-hairline)] max-h-64 overflow-y-auto space-y-1 scholar-scroll"
              dir="rtl"
            >
              {displayedTopics.map((topic, idx) => {
                const active = activeTopicTitle === topic.topicTitle;
                const mastered = masteredTopics.includes(topic.topicTitle);
                return (
                  <button
                    key={topic.topicTitle || idx}
                    type="button"
                    onClick={() => {
                      setActiveTopicTitle(topic.topicTitle);
                      setMobileTopicDrawerOpen(false);
                    }}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md text-right dhivehi-text text-sm transition-colors ${
                      active
                        ? 'bg-[var(--subject-islam-bg)] text-[var(--subject-islam)] font-bold'
                        : 'text-[var(--ink-primary)] hover:bg-[var(--bg-subtle)]'
                    }`}
                  >
                    <span>{cleanText(topic.topicTitle)}</span>
                    {mastered && (
                      <CheckIcon className="w-4 h-4 text-[var(--subject-biology)] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Desktop Master-Detail Layout (RTL Syllabus Rail on Right) */}
        <div className="flex flex-col lg:flex-row-reverse gap-5 items-start">
          {/* Sticky RTL Syllabus Topics Rail (Desktop) */}
          <aside
            className="hidden lg:flex flex-col w-80 xl:w-[340px] flex-shrink-0 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-hairline)] overflow-hidden sticky top-[72px] max-h-[calc(100dvh-5.5rem)]"
            dir="rtl"
          >
            <div
              className="px-4 py-3 border-b border-[var(--border-hairline)] bg-[var(--bg-inset)] flex items-center justify-between"
              dir="ltr"
            >
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
                Syllabus Topics
              </span>
              <span className="font-mono-code tabular-nums text-xs font-medium px-2 py-0.5 rounded bg-[var(--subject-islam-bg)] text-[var(--subject-islam)] border border-[var(--subject-islam-border)]">
                {displayedTopics.length}
              </span>
            </div>

            {/* Mastery Progress */}
            <div
              className="px-4 py-3 border-b border-[var(--border-hairline)] bg-[var(--bg-surface)]"
              dir="ltr"
            >
              <div className="flex justify-between text-xs font-medium text-[var(--ink-secondary)] mb-1.5">
                <span>Module Mastery</span>
                <span className="font-mono-code tabular-nums text-[var(--subject-islam)]">
                  {masteredInModule}/{moduleTopics.length} ({progressPercent}%)
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[var(--bg-subtle)] overflow-hidden">
                <div
                  className="h-full bg-[var(--subject-islam)] rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="overflow-y-auto p-2 space-y-1 scholar-scroll">
              {displayedTopics.map((topic, index) => {
                const mastered = masteredTopics.includes(topic.topicTitle);
                const active = activeTopicTitle === topic.topicTitle;
                return (
                  <button
                    key={topic.topicTitle || index}
                    type="button"
                    onClick={() => {
                      setActiveTopicTitle(topic.topicTitle);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-full flex items-center justify-between gap-2.5 text-right px-3 py-2 rounded-md dhivehi-text text-[15px] leading-[1.9] transition-colors ${
                      active
                        ? 'bg-[var(--subject-islam-bg)] text-[var(--subject-islam)] font-bold border-r-[3px] border-[var(--subject-islam)]'
                        : mastered
                        ? 'text-[var(--ink-secondary)] hover:bg-[var(--bg-inset)]'
                        : 'text-[var(--ink-primary)] hover:bg-[var(--bg-inset)]'
                    }`}
                  >
                    <span className="flex-1 text-right">{cleanText(topic.topicTitle)}</span>
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                        mastered
                          ? 'bg-[var(--subject-biology)] text-white'
                          : active
                          ? 'bg-[var(--subject-islam)]/15 text-[var(--subject-islam)]'
                          : 'bg-[var(--bg-subtle)] text-[var(--ink-muted)]'
                      }`}
                    >
                      {mastered ? (
                        <CheckIcon className="w-3 h-3" />
                      ) : (
                        <BookOpenIcon className="w-3 h-3" />
                      )}
                    </span>
                  </button>
                );
              })}

              {displayedTopics.length === 0 && (
                <p className="text-center py-6 text-xs text-[var(--ink-muted)]" dir="ltr">
                  No matching topics found.
                </p>
              )}
            </div>
          </aside>

          {/* Topic Content Stage */}
          <section className="flex-1 w-full min-w-0">
            {activeTopicData ? (
              <div className="space-y-4">
                {/* Topic Header Bar */}
                <div className="rounded-lg bg-[var(--bg-surface)] border border-[var(--border-hairline)] p-4 sm:p-5">
                  <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-4">
                    {/* Controls: Notes vs Flashcards + Expand/Collapse */}
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="inline-flex p-0.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-warm-strong)]">
                        <button
                          type="button"
                          onClick={() => setViewMode('notes')}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                            viewMode === 'notes'
                              ? 'bg-[var(--action-primary-bg)] text-[var(--action-primary-fg)]'
                              : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
                          }`}
                        >
                          <NoteIcon className="w-3.5 h-3.5" />
                          <span>Notes</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewMode('flashcards')}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                            viewMode === 'flashcards'
                              ? 'bg-[var(--action-primary-bg)] text-[var(--action-primary-fg)]'
                              : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
                          }`}
                        >
                          <CardDeckIcon className="w-3.5 h-3.5" />
                          <span>
                            Flashcards ({activeTopicData.definitions?.length || 0})
                          </span>
                        </button>
                      </div>

                      {viewMode === 'notes' &&
                        (activeTopicData.keyPoints?.length > 0 ||
                          activeTopicData.definitions?.length > 0) && (
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setAllAccordions(true)}
                              className="px-2.5 py-1.5 rounded-md text-xs font-medium bg-[var(--bg-inset)] border border-[var(--border-hairline)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] transition-colors"
                            >
                              Expand All
                            </button>
                            <button
                              type="button"
                              onClick={() => setAllAccordions(false)}
                              className="px-2.5 py-1.5 rounded-md text-xs font-medium bg-[var(--bg-inset)] border border-[var(--border-hairline)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] transition-colors"
                            >
                              Collapse All
                            </button>
                          </div>
                        )}

                      {viewMode === 'flashcards' && (activeTopicData.definitions?.length || 0) > 0 && (
                        <div className="inline-flex p-0.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-warm-strong)]">
                          <button
                            type="button"
                            onClick={() => setFlashcardMode('deck')}
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                              flashcardMode === 'deck'
                                ? 'bg-[var(--action-primary-bg)] text-[var(--action-primary-fg)]'
                                : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
                            }`}
                          >
                            <CardDeckIcon className="w-3.5 h-3.5" />
                            <span>Deck</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setFlashcardMode('grid')}
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                              flashcardMode === 'grid'
                                ? 'bg-[var(--action-primary-bg)] text-[var(--action-primary-fg)]'
                                : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
                            }`}
                          >
                            <GridIcon className="w-3.5 h-3.5" />
                            <span>Grid</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Topic Title & Badges in Faruma */}
                    <div className="text-right space-y-1.5" dir="rtl">
                      {(activeTopicData.strandTitle || activeTopicData.isMemorization) && (
                        <div className="flex flex-wrap items-center gap-1.5">
                          {activeTopicData.strandTitle && (
                            <span className="dhivehi-text px-2 py-0.5 rounded text-xs font-medium bg-[var(--subject-biology-bg)] text-[var(--subject-biology)] border border-[var(--subject-biology-border)]">
                              {activeTopicData.strandTitle}
                            </span>
                          )}
                          {activeTopicData.isMemorization && (
                            <span className="dhivehi-text px-2 py-0.5 rounded text-xs font-semibold bg-[var(--subject-islam-bg)] text-[var(--subject-islam)] border border-[var(--subject-islam-border)]">
                              ހިތުދަސްކުރަންޖެހޭ ޙަދީޘް
                            </span>
                          )}
                        </div>
                      )}
                      <h2 className="dhivehi-text text-xl sm:text-2xl font-bold text-[var(--ink-primary)] text-right leading-[1.95]">
                        {cleanText(activeTopicData.topicTitle)}
                      </h2>
                    </div>
                  </div>
                </div>

                {/* FLASHCARDS VIEW */}
                {viewMode === 'flashcards' && (
                  <div className="space-y-4">
                    {deckCards.length === 0 ? (
                      <div className="rounded-2xl bg-[var(--bg-surface)] border border-dashed border-[var(--border-strong)] p-10 text-center text-sm text-[var(--text-secondary)]">
                        No definitions to memorize in this topic. Switch to Notes to read key points.
                      </div>
                    ) : flashcardMode === 'deck' ? (
                      <div className="max-w-2xl mx-auto space-y-4">
                        <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] px-1">
                          <span className="font-mono-code font-semibold">
                            Card {deckIndex + 1} of {deckCards.length}
                          </span>
                          <button
                            type="button"
                            onClick={shuffleDeck}
                            disabled={deckCards.length <= 1}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-xs font-semibold text-[var(--text-primary)] hover:border-[var(--border-strong)] disabled:opacity-40"
                          >
                            <ShuffleIcon className="w-3.5 h-3.5" />
                            <span>Shuffle Deck</span>
                          </button>
                        </div>

                        <HscFlashcard
                          large
                          term={deckCards[deckIndex]?.term}
                          paragraphs={deckCards[deckIndex]?.paragraphs || []}
                          isFlipped={deckFlipped}
                          onFlip={() => setDeckFlipped(prev => !prev)}
                        />

                        <div className="flex items-center justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setDeckFlipped(false);
                              setDeckIndex(prev => (prev > 0 ? prev - 1 : deckCards.length - 1));
                            }}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-[var(--text-primary)] hover:border-[var(--border-strong)]"
                          >
                            <ChevronLeftIcon className="w-4 h-4" />
                            <span>Previous</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeckFlipped(prev => !prev)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-[var(--action-primary-bg)] text-[var(--action-primary-fg)] hover:bg-[var(--action-primary-hover)] transition-colors"
                          >
                            <FlipIcon className="w-4 h-4" />
                            <span>Flip Card</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setDeckFlipped(false);
                              setDeckIndex(prev => (prev < deckCards.length - 1 ? prev + 1 : 0));
                            }}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-[var(--text-primary)] hover:border-[var(--border-strong)]"
                          >
                            <span>Next</span>
                            <ChevronRightIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeTopicData.definitions.map((def, idx) => (
                          <HscFlashcard
                            key={`fc-${activeTopicTitle}-${idx}`}
                            term={def.term}
                            paragraphs={def.paragraphs}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* NOTES VIEW */}
                {viewMode === 'notes' && (
                  <div className="space-y-4">
                    {activeTopicData.keyPoints?.length > 0 && (
                      <div className="space-y-3">
                        {activeTopicData.keyPoints.map((kp, idx) => {
                          const key = `kp-${idx}`;
                          return (
                            <AccordionCard
                              key={`${activeTopicTitle}-${key}`}
                              badgeLabel="ނުކުތާ"
                              variant="list"
                              title={kp.heading}
                              isOpen={Boolean(openAccordions[key])}
                              onToggle={() => toggleAccordionKey(key)}
                            >
                              <ol className="hsc-bullet-list space-y-2.5 text-[var(--text-primary)]" dir="rtl">
                                {kp.points.map((point, pIdx) => (
                                  <li
                                    key={pIdx}
                                    className="dhivehi-text text-base sm:text-lg leading-[2.2]"
                                  >
                                    {cleanText(point)}
                                  </li>
                                ))}
                              </ol>
                            </AccordionCard>
                          );
                        })}
                      </div>
                    )}

                    {activeTopicData.definitions?.length > 0 && (
                      <div className="space-y-3">
                        {activeTopicData.definitions.map((def, idx) => {
                          const key = `def-${idx}`;
                          return (
                            <AccordionCard
                              key={`${activeTopicTitle}-${key}`}
                              badgeLabel="تعريف"
                              variant="def"
                              title={def.term}
                              isOpen={Boolean(openAccordions[key])}
                              onToggle={() => toggleAccordionKey(key)}
                            >
                              <div className="space-y-3" dir="rtl">
                                {def.paragraphs.map((paragraph, pIdx) => (
                                  <p
                                    key={pIdx}
                                    className="dhivehi-text text-base sm:text-lg text-[var(--text-primary)] leading-[2.2]"
                                  >
                                    {cleanText(paragraph)}
                                  </p>
                                ))}
                              </div>
                            </AccordionCard>
                          );
                        })}
                      </div>
                    )}

                    {!activeTopicData.keyPoints?.length && !activeTopicData.definitions?.length && (
                      <div className="rounded-2xl bg-[var(--bg-surface)] border border-dashed border-[var(--border-strong)] p-10 text-center text-sm text-[var(--text-secondary)]">
                        No study material listed for this topic yet.
                      </div>
                    )}
                  </div>
                )}

                {/* Mastery Footer */}
                <div className="pt-4 border-t border-dashed border-[var(--border-hairline)] flex justify-center">
                  <button
                    type="button"
                    onClick={() => toggleMastered(activeTopicTitle)}
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold border-2 transition-all ${
                      isMastered
                        ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)] text-white shadow-sm'
                        : 'bg-[var(--bg-surface)] border-[var(--border-strong)] text-[var(--text-secondary)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]'
                    }`}
                  >
                    <CheckIcon className="w-4 h-4" />
                    <span>{isMastered ? 'Topic Mastered' : 'Mark Topic as Mastered'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-[var(--bg-surface)] border border-dashed border-[var(--border-strong)] p-10 text-center text-sm text-[var(--text-secondary)]">
                Select a topic from the syllabus menu to begin studying.
              </div>
            )}
          </section>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full space-y-5">
      {/* Connected HSC Underline Sub-Tabs Bar */}
      <div className="border-b border-[var(--border-hairline)] bg-[var(--bg-surface)] rounded-t-lg px-2 sm:px-4">
        <div
          role="tablist"
          aria-label="HSC AS/A2 Modules and Tools"
          className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-full"
        >
          {tabs.map(tab => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearchQuery('');
                  if (tab.id === 'facts') generateRandomFact();
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-3 text-[13.5px] font-medium whitespace-nowrap border-b-[2.5px] -mb-px transition-colors shrink-0 ${
                  isActive
                    ? 'border-[var(--subject-islam)] text-[var(--subject-islam)] font-semibold'
                    : 'border-transparent text-[var(--ink-muted)] hover:text-[var(--ink-primary)]'
                }`}
              >
                {TabIcon && <TabIcon className="w-3.5 h-3.5 shrink-0" />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>{renderTabContent()}</div>
    </div>
  );
}
