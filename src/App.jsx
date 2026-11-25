import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import allQuestions from './questionsData';
import predictedQuestions from './predictedQuestionsData';
import definitionsData from './definitionsData';
import { hscModulesData } from './hscModulesData';
import Filters from './components/Filters';
import QuestionList from './components/QuestionList';
import QuestionView from './pages/QuestionView';
import UnseenTopics from './pages/UnseenTopics';
import QuizGenerator from './pages/QuizGenerator';
import BookViewer from './pages/BookViewer';
import PredictedQuestions from './pages/PredictedQuestions';
import Definitions from './pages/Definitions';
import HscIslam from './pages/HscIslam';
import { topicNames, getTopicName } from './topicNames';
import { useTheme } from './context/ThemeContext';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BookOpenIcon,
  CardDeckIcon,
  ChevronRightIcon,
  CompassIcon,
  LibraryIcon,
  LightbulbIcon,
  MenuIcon,
  MoonIcon,
  RubElHizbIcon,
  ScrollTextIcon,
  ShuffleIcon,
  SparklesIcon,
  StarIcon,
  SunIcon,
  TargetIcon,
  XIcon,
} from './components/Icons';

const MemoizedFilters = React.memo(Filters);
const MemoizedQuestionList = React.memo(QuestionList);
const MemoizedQuestionView = React.memo(QuestionView);
const MemoizedPredictedQuestions = React.memo(PredictedQuestions);
const MemoizedDefinitions = React.memo(Definitions);
const MemoizedHscIslam = React.memo(HscIslam);

const SSC_VIEWS = ['main', 'quiz', 'books', 'predicted', 'definitions', 'unseen-topics'];

const SSC_NAV_ITEMS = [
  { id: 'main', label: 'Questions', icon: BookOpenIcon },
  { id: 'quiz', label: 'Quiz', icon: TargetIcon },
  { id: 'predicted', label: 'Predicted', icon: SparklesIcon },
  { id: 'definitions', label: 'Definitions', icon: ScrollTextIcon },
  { id: 'unseen-topics', label: 'Unseen Topics', icon: CompassIcon },
  { id: 'books', label: 'Textbooks', icon: LibraryIcon },
];

const STUDY_HUB_URL = (
  import.meta.env.VITE_STUDY_HUB_URL ||
  import.meta.env.NEXT_PUBLIC_STUDY_HUB_URL ||
  (import.meta.env.DEV ? 'http://localhost:3000' : 'https://igcse-interactive-labs.vercel.app')
).replace(/\/+$/, '');

function parseHashToView(rawHash) {
  const cleaned = (rawHash || '').replace(/^#/, '').replace(/\/+$/, '').toLowerCase();
  if (!cleaned || cleaned === '' || cleaned === '/overview' || cleaned === 'overview') {
    return 'landing';
  }
  if (cleaned === '/hsc' || cleaned.startsWith('/hsc/')) {
    return 'hsc-islam';
  }
  if (cleaned === '/ssc') {
    return 'main';
  }
  if (cleaned.startsWith('/ssc/')) {
    const sub = cleaned.slice('/ssc/'.length);
    if (sub === 'quiz') return 'quiz';
    if (sub === 'predicted') return 'predicted';
    if (sub === 'definitions') return 'definitions';
    if (sub === 'unseen' || sub === 'unseen-topics') return 'unseen-topics';
    if (sub === 'books' || sub === 'textbooks') return 'books';
    return 'main';
  }
  return 'landing';
}

function viewToCanonicalHash(view) {
  if (view === 'landing') return '#/overview';
  if (view === 'hsc-islam') return '#/hsc';
  return '#/ssc';
}

const App = () => {
  const [selectedFilters, setSelectedFilters] = useState({});
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [noteVersion, setNoteVersion] = useState(0);

  const [predictedInitialFilters, setPredictedInitialFilters] = useState(null);
  const [definitionsInitialFilters, setDefinitionsInitialFilters] = useState(null);
  const [hscLaunch, setHscLaunch] = useState({ tab: 'mod1', viewMode: 'notes' });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('favoriteQuestions') || '[]');
    } catch (error) {
      console.error('Error loading favorites:', error);
      return [];
    }
  });

  const [hscMastered, setHscMastered] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('hscMasteredTopics') || '[]');
    } catch {
      return [];
    }
  });

  const [currentView, setCurrentView] = useState(() =>
    typeof window !== 'undefined' ? parseHashToView(window.location.hash) : 'landing'
  );
  const { isDark, toggleTheme } = useTheme();

  // Listen to browser Back/Forward & direct hash navigation
  useEffect(() => {
    const syncFromHash = () => {
      const nextView = parseHashToView(window.location.hash);
      setCurrentView(prev => {
        if (nextView === 'main' && SSC_VIEWS.includes(prev)) {
          return prev;
        }
        return nextView;
      });
      setMobileMenuOpen(false);
    };

    window.addEventListener('hashchange', syncFromHash);
    window.addEventListener('popstate', syncFromHash);
    return () => {
      window.removeEventListener('hashchange', syncFromHash);
      window.removeEventListener('popstate', syncFromHash);
    };
  }, []);

  // Subtle navbar scroll shadow
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const allHscFacts = useMemo(
    () => [
      ...(hscModulesData.mod1?.randomFacts || []),
      ...(hscModulesData.mod2?.randomFacts || []),
    ],
    []
  );

  const [dailyFactIndex, setDailyFactIndex] = useState(() => {
    const facts = [
      ...(hscModulesData.mod1?.randomFacts || []),
      ...(hscModulesData.mod2?.randomFacts || []),
    ];
    return facts.length > 0 ? Math.floor(Math.random() * facts.length) : 0;
  });

  // Sync HSC mastered count whenever landing view becomes active
  useEffect(() => {
    if (currentView === 'landing') {
      try {
        setHscMastered(JSON.parse(localStorage.getItem('hscMasteredTopics') || '[]'));
      } catch {
        // ignore
      }
    }
  }, [currentView]);

  const totalHscTopics = useMemo(
    () =>
      Object.values(hscModulesData).reduce(
        (sum, mod) => sum + (mod.topics?.length || 0),
        0
      ),
    []
  );

  const hscProgressPct = totalHscTopics
    ? Math.round((hscMastered.length / totalHscTopics) * 100)
    : 0;

  const unitNames = useMemo(
    () => ({
      1: 'Aqeedha',
      2: 'Khadhees',
      3: 'Fiqh',
      4: 'Thaareekh',
      5: 'Saqaafa',
      6: 'Akhlaaq',
    }),
    []
  );

  const questionTypes = useMemo(
    () => ({
      1: 'Thaaraf',
      2: 'Dheyha',
      3: 'Haadhisaa',
      4: 'Gina Marks',
      5: 'Mauloomaathu',
      6: 'Dhiraasaa',
      7: 'Beynun Kurun',
    }),
    []
  );

  const toggleFavorite = useCallback((questionId) => {
    setFavorites(prev => {
      const next = prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId];
      try {
        localStorage.setItem('favoriteQuestions', JSON.stringify(next));
      } catch (error) {
        console.error('Error saving favorites:', error);
      }
      return next;
    });
  }, []);

  const options = useMemo(
    () => ({
      book: [...new Set(allQuestions.map(q => q.book))].sort((a, b) => a - b),
      year: [...new Set(allQuestions.map(q => q.year))].sort((a, b) => b - a),
      paper: [...new Set(allQuestions.map(q => q.paper))].sort((a, b) => a - b),
      unit: [...new Set(allQuestions.map(q => q.unit))].sort((a, b) => a - b),
      topic: [
        ...new Set(
          allQuestions
            .flatMap(q => String(q.topic).split('_').map(t => parseInt(t, 10)))
            .filter(t => !isNaN(t))
        ),
      ].sort((a, b) => a - b),
      types: [...new Set(allQuestions.flatMap(q => q.types))].sort((a, b) => a - b),
      paperType: ['specimen', 'actual'],
    }),
    []
  );

  const filteredQuestions = useMemo(() => {
    const filtered = allQuestions.filter(q =>
      Object.entries(selectedFilters).every(([field, values]) => {
        if (!values || values.length === 0) return true;

        if (field === 'types') {
          return values.every(selectedType => q.types.includes(selectedType));
        }

        if (field === 'topic') {
          const questionTopic = String(q.topic);
          const selectedTopics = values.map(v => String(v));
          return selectedTopics.some(selectedTopic => {
            if (questionTopic.includes('_')) {
              return questionTopic.split('_').includes(selectedTopic);
            }
            return questionTopic === selectedTopic;
          });
        }

        if (field === 'paperType') {
          const isSpecimen =
            (q.year === 2021 && q.paperSet === 2) || (q.year === 2020 && q.paperSet === 1);
          if (values.includes('specimen') && values.includes('actual')) return true;
          if (values.includes('specimen')) return isSpecimen;
          if (values.includes('actual')) return !isSpecimen;
        }

        return values.map(v => String(v)).includes(String(q[field]));
      })
    );

    return filtered.sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year;
      const aNum = parseInt(a.questionNumber, 10) || 0;
      const bNum = parseInt(b.questionNumber, 10) || 0;
      return aNum - bNum;
    });
  }, [selectedFilters]);

  const currentQuestion = useMemo(
    () => filteredQuestions.find(q => Number(q.id) === Number(selectedQuestionId)),
    [filteredQuestions, selectedQuestionId]
  );

  const syncHashForView = useCallback((view, pushHistory = true) => {
    if (typeof window === 'undefined') return;
    const targetHash = viewToCanonicalHash(view);
    const currentHash = window.location.hash;
    if (currentHash !== targetHash) {
      if (pushHistory) {
        window.history.pushState(null, '', targetHash);
      } else {
        window.history.replaceState(null, '', targetHash);
      }
    }
  }, []);

  const handleViewChange = useCallback(
    (view) => {
      setCurrentView(view);
      setMobileMenuOpen(false);
      syncHashForView(view, true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [syncHashForView]
  );

  const handleFilterSearch = useCallback(() => {
    setSelectedQuestionId(null);
  }, []);

  const openSavedFavorites = useCallback(() => {
    setSelectedFilters({});
    setSelectedQuestionId(null);
    setShowFavoritesOnly(true);
    setCurrentView('main');
    setMobileMenuOpen(false);
    syncHashForView('main', true);
  }, [syncHashForView]);

  const openHscWith = useCallback(
    (tab = 'mod1', viewMode = 'notes') => {
      setHscLaunch({ tab, viewMode });
      setCurrentView('hsc-islam');
      setMobileMenuOpen(false);
      syncHashForView('hsc-islam', true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [syncHashForView]
  );

  const isSscView = SSC_VIEWS.includes(currentView);
  const isHscView = currentView === 'hsc-islam';
  const isWorkbenchFullBleed = ['main', 'predicted', 'definitions', 'books'].includes(currentView);
  const studyHubHref = isHscView ? `${STUDY_HUB_URL}/hsc/islam` : `${STUDY_HUB_URL}/islam`;

  const shuffleDailyFact = () => {
    if (allHscFacts.length <= 1) return;
    let next = dailyFactIndex;
    while (next === dailyFactIndex) {
      next = Math.floor(Math.random() * allHscFacts.length);
    }
    setDailyFactIndex(next);
  };

  const renderLandingPage = () => {
    const currentFact = allHscFacts[dailyFactIndex] || '';

    return (
      <div className="max-w-6xl mx-auto w-full space-y-6 py-2 sm:py-5 animate-fade-up">
        {/* Editorial Masthead */}
        <section className="relative rounded-lg bg-[var(--bg-surface)] border border-[var(--border-hairline)] border-t-[3px] border-t-[var(--subject-islam)] overflow-hidden">
          <div className="absolute inset-0 bg-islamic-lattice pointer-events-none" />
          <div className="relative px-6 py-8 sm:px-10 sm:py-10 max-w-3xl">
            <h1 className="font-editorial text-[30px] sm:text-[40px] font-semibold tracking-[-0.025em] leading-[1.1] text-[var(--ink-primary)]">
              Islamee Tharubiyyathu
            </h1>

            <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[13px] font-medium text-[var(--ink-muted)]">
              <span
                className="inline-block h-2.5 w-2.5 shrink-0 rounded-[2px]"
                style={{ backgroundColor: 'var(--subject-islam)' }}
                aria-hidden="true"
              />
              <span className="arabic-text text-[15px] font-medium text-[var(--ink-secondary)]" dir="rtl">
                التَّرْبِيَةُ الإِسْلَامِيَّةُ
              </span>
              <span aria-hidden="true">·</span>
              <span>Maldives National Syllabus</span>
            </div>

            <p className="mt-3.5 text-[15px] text-[var(--ink-secondary)] leading-[1.6] max-w-[62ch]">
              A focused scholarly workspace uniting SSC O-Level topical past papers, teacher predictions, and definitions with HSC AS/A2 modular study notes and active-recall flashcards.
            </p>
          </div>
        </section>

        {/* Two Canonical Track Cards */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* SSC (O-Level) Card — Botanical Emerald 3px top rule */}
          <div className="rounded-lg bg-[var(--bg-surface)] border border-[var(--border-hairline)] border-t-[3px] border-t-[var(--subject-biology)] hover:border-[var(--ink-primary)]/45 p-5 sm:p-6 flex flex-col justify-between gap-6 transition-[border-color] duration-150">
            <div>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-2 text-xs font-medium text-[var(--ink-muted)]">
                  <span
                    className="inline-block h-2.5 w-2.5 shrink-0 rounded-[2px]"
                    style={{ backgroundColor: 'var(--subject-biology)' }}
                    aria-hidden="true"
                  />
                  <span>Maldives SSC · National Subject</span>
                </div>
                <span className="font-mono-code text-[11px] font-medium px-2 py-0.5 rounded bg-[var(--subject-biology-bg)] text-[var(--subject-biology)] border border-[var(--subject-biology-border)] shrink-0">
                  Grades 9 &amp; 10
                </span>
              </div>

              <h2 className="font-editorial text-[22px] sm:text-[26px] font-semibold tracking-[-0.02em] leading-[1.2] text-[var(--ink-primary)] mb-2">
                SSC (O-Level)
              </h2>
              <p className="text-[14px] text-[var(--ink-secondary)] leading-[1.6] mb-5">
                Explore{' '}
                <span className="font-mono-code font-medium text-[var(--ink-primary)]">
                  {allQuestions.length}
                </span>{' '}
                topical past paper questions with mark schemes,{' '}
                <span className="font-mono-code font-medium text-[var(--ink-primary)]">
                  {predictedQuestions.length}
                </span>{' '}
                predicted questions,{' '}
                <span className="font-mono-code font-medium text-[var(--ink-primary)]">
                  {definitionsData.length}
                </span>{' '}
                definitions, custom quizzes, and textbooks.
              </p>

              {/* Quick Mode Links */}
              <div className="flex flex-wrap gap-1.5">
                {SSC_NAV_ITEMS.filter(item => item.id !== 'main').map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleViewChange(item.id)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-[var(--bg-inset)] border border-[var(--border-hairline)] text-[var(--ink-primary)] hover:border-[var(--subject-biology)] hover:text-[var(--subject-biology)] transition-colors"
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowFavoritesOnly(false);
                handleViewChange('main');
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-[var(--action-primary-bg)] text-[var(--action-primary-fg)] hover:bg-[var(--action-primary-hover)] transition-colors"
            >
              <span>Open Past Paper Archive</span>
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>

          {/* HSC (AS/A2 Level) Card — Warm Amber-Bronze 3px top rule */}
          <div className="rounded-lg bg-[var(--bg-surface)] border border-[var(--border-hairline)] border-t-[3px] border-t-[var(--subject-islam)] hover:border-[var(--ink-primary)]/45 p-5 sm:p-6 flex flex-col justify-between gap-6 transition-[border-color] duration-150">
            <div>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-2 text-xs font-medium text-[var(--ink-muted)]">
                  <span
                    className="inline-block h-2.5 w-2.5 shrink-0 rounded-[2px]"
                    style={{ backgroundColor: 'var(--subject-islam)' }}
                    aria-hidden="true"
                  />
                  <span>Maldives HSC · National Subject</span>
                </div>
                <span className="font-mono-code text-[11px] font-medium px-2 py-0.5 rounded bg-[var(--subject-islam-bg)] text-[var(--subject-islam)] border border-[var(--subject-islam-border)] shrink-0">
                  AS / A2 Modular
                </span>
              </div>

              <h2 className="font-editorial text-[22px] sm:text-[26px] font-semibold tracking-[-0.02em] leading-[1.2] text-[var(--ink-primary)] mb-2">
                HSC (AS/A2 Level)
              </h2>
              <p className="text-[14px] text-[var(--ink-secondary)] leading-[1.6] mb-5">
                Complete Module 1 (Aqeedha,{' '}
                <span className="font-mono-code font-medium text-[var(--ink-primary)]">
                  {hscModulesData.mod1?.topics?.length || 20}
                </span>{' '}
                chapters) &amp; Module 2 (Hadhees &amp; Akhlaaq,{' '}
                <span className="font-mono-code font-medium text-[var(--ink-primary)]">
                  {hscModulesData.mod2?.topics?.length || 28}
                </span>{' '}
                topics), interactive 2026 Specimen Paper &amp; Mark Scheme practice, flashcards, random facts, and 6-PDF library.
              </p>

              {/* Quick Mode Links */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: 'Module 1', icon: BookOpenIcon, tab: 'mod1', mode: 'notes' },
                  { label: 'Module 2', icon: BookOpenIcon, tab: 'mod2', mode: 'notes' },
                  { label: 'Specimen Exam', icon: ScrollTextIcon, tab: 'specimen', mode: 'notes' },
                  { label: 'Flashcard Decks', icon: CardDeckIcon, tab: 'mod1', mode: 'flashcards' },
                  { label: 'Random Facts', icon: LightbulbIcon, tab: 'facts', mode: 'notes' },
                  { label: 'PDF Library (6)', icon: LibraryIcon, tab: 'textbooks', mode: 'notes' },
                ].map(btn => {
                  const Icon = btn.icon;
                  return (
                    <button
                      key={btn.label}
                      type="button"
                      onClick={() => openHscWith(btn.tab, btn.mode)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-[var(--bg-inset)] border border-[var(--border-hairline)] text-[var(--ink-primary)] hover:border-[var(--subject-islam)] hover:text-[var(--subject-islam)] transition-colors"
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{btn.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={() => openHscWith('mod1', 'notes')}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-[var(--action-primary-bg)] text-[var(--action-primary-fg)] hover:bg-[var(--action-primary-hover)] transition-colors"
            >
              <span>Open HSC Study Modules</span>
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* Calm Hairline Study Telemetry Strip */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Saved Bookmarks */}
          <div className="rounded-lg bg-[var(--bg-surface)] border border-[var(--border-hairline)] p-5 flex flex-col justify-between gap-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
                  Saved Bookmarks
                </div>
                <div className="font-mono-code text-3xl font-semibold text-[var(--ink-primary)] mt-1">
                  {favorites.length}
                </div>
              </div>
              <div className="w-9 h-9 rounded-lg bg-[var(--subject-islam-bg)] border border-[var(--subject-islam-border)] text-[var(--subject-islam)] flex items-center justify-center">
                <StarIcon className="w-4 h-4" filled={favorites.length > 0} />
              </div>
            </div>
            <button
              type="button"
              onClick={openSavedFavorites}
              className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-medium bg-[var(--bg-inset)] border border-[var(--border-hairline)] text-[var(--ink-primary)] hover:border-[var(--subject-islam)] hover:text-[var(--subject-islam)] transition-colors"
            >
              <span>Review Saved Items</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* HSC Mastery Progress */}
          <div className="rounded-lg bg-[var(--bg-surface)] border border-[var(--border-hairline)] p-5 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
                  HSC Mastery
                </span>
                <span className="font-mono-code text-xs font-medium text-[var(--subject-islam)]">
                  {hscMastered.length} / {totalHscTopics} topics
                </span>
              </div>
              <div className="font-mono-code text-3xl font-semibold text-[var(--ink-primary)] mt-1">
                {hscProgressPct}%
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="w-full h-1.5 rounded-full bg-[var(--bg-subtle)] overflow-hidden">
                <div
                  className="h-full bg-[var(--subject-islam)] rounded-full transition-all duration-300"
                  style={{ width: `${hscProgressPct}%` }}
                />
              </div>
              <div className="text-[11px] text-[var(--ink-muted)]">
                Module 1 &amp; 2 mastery saved locally
              </div>
            </div>
          </div>

          {/* Content Bank Stats */}
          <div className="rounded-lg bg-[var(--bg-surface)] border border-[var(--border-hairline)] p-5 flex flex-col justify-between gap-3">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
              Content Bank
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-md bg-[var(--bg-inset)] border border-[var(--border-hairline)]">
                <div className="font-mono-code text-lg font-semibold text-[var(--ink-primary)]">
                  {allQuestions.length}
                </div>
                <div className="text-[10px] font-medium text-[var(--ink-muted)] mt-0.5">
                  Past Qs
                </div>
              </div>
              <div className="p-2.5 rounded-md bg-[var(--bg-inset)] border border-[var(--border-hairline)]">
                <div className="font-mono-code text-lg font-semibold text-[var(--ink-primary)]">
                  {predictedQuestions.length}
                </div>
                <div className="text-[10px] font-medium text-[var(--ink-muted)] mt-0.5">
                  Predicted
                </div>
              </div>
              <div className="p-2.5 rounded-md bg-[var(--bg-inset)] border border-[var(--border-hairline)]">
                <div className="font-mono-code text-lg font-semibold text-[var(--ink-primary)]">
                  {definitionsData.length}
                </div>
                <div className="text-[10px] font-medium text-[var(--ink-muted)] mt-0.5">
                  Thaaraf
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* RTL Thaana Random Fact Card */}
        {currentFact && (
          <section className="rounded-lg bg-[var(--bg-surface)] border border-[var(--border-hairline)] p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-md bg-[var(--subject-islam-bg)] border border-[var(--subject-islam-border)] text-[var(--subject-islam)] flex items-center justify-center shrink-0">
                  <LightbulbIcon className="w-4 h-4" />
                </div>
                <h3
                  className="dhivehi-text text-base sm:text-lg font-bold text-[var(--ink-primary)]"
                  dir="rtl"
                >
                  ތިޔަދަރިވަރުންނަށް އެނގޭތަ!
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={shuffleDailyFact}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[var(--bg-inset)] border border-[var(--border-hairline)] text-[var(--ink-primary)] hover:border-[var(--border-strong)] transition-colors"
                >
                  <ShuffleIcon className="w-3.5 h-3.5" />
                  <span>Another Fact</span>
                </button>
                <button
                  type="button"
                  onClick={() => openHscWith('facts', 'notes')}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium text-[var(--subject-islam)] hover:bg-[var(--subject-islam-bg)] transition-colors"
                >
                  <span>Open Fact Bank</span>
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <p
              className="dhivehi-text text-base sm:text-lg text-[var(--ink-primary)] leading-[2.2] text-right bg-[var(--bg-inset)] border border-[var(--border-hairline)] rounded-md px-5 py-4"
              dir="rtl"
            >
              {currentFact}
            </p>
          </section>
        )}
      </div>
    );
  };

  const renderMainView = () => (
    <div className="flex-1 flex flex-col min-h-0 gap-3">
      <MemoizedFilters
        options={options}
        selectedFilters={selectedFilters}
        setSelectedFilters={setSelectedFilters}
        onSearch={handleFilterSearch}
        unitNames={unitNames}
        questionTypes={questionTypes}
        topicNames={topicNames}
        totalCount={filteredQuestions.length}
      />

      <div className="flex flex-col lg:flex-row gap-3.5 flex-1 min-h-0 lg:h-[calc(100dvh-13.25rem)]">
        <div
          className={`w-full lg:w-80 xl:w-96 flex-shrink-0 flex flex-col min-h-0 ${
            currentQuestion ? 'hidden lg:flex' : 'flex flex-1 lg:flex-none'
          }`}
        >
          <MemoizedQuestionList
            questions={filteredQuestions}
            selectedQuestionId={selectedQuestionId}
            setSelectedQuestionId={setSelectedQuestionId}
            unitNames={unitNames}
            getTopicName={getTopicName}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            showFavorites={showFavoritesOnly}
            setShowFavorites={setShowFavoritesOnly}
            noteVersion={noteVersion}
          />
        </div>

        <div
          className={
            currentQuestion
              ? 'fixed inset-0 z-40 bg-[var(--bg-paper)] p-2 flex flex-col lg:static lg:inset-auto lg:z-auto lg:bg-transparent lg:p-0 lg:flex-1 lg:min-w-0 lg:min-h-0'
              : 'hidden lg:flex lg:flex-1 lg:min-w-0 lg:flex-col lg:min-h-0'
          }
        >
          <MemoizedQuestionView
            question={currentQuestion}
            questions={filteredQuestions}
            setSelectedQuestionId={setSelectedQuestionId}
            unitNames={unitNames}
            questionTypes={questionTypes}
            getTopicName={getTopicName}
            onToggleFavorite={toggleFavorite}
            isFavorite={selectedQuestionId ? favorites.includes(selectedQuestionId) : false}
            onBackToList={() => setSelectedQuestionId(null)}
            onNoteUpdated={() => setNoteVersion(v => v + 1)}
          />
        </div>
      </div>
    </div>
  );

  const renderCurrentView = () => {
    switch (currentView) {
      case 'landing':
        return renderLandingPage();
      case 'quiz':
        return (
          <QuizGenerator
            allQuestions={allQuestions}
            unitNames={unitNames}
            questionTypes={questionTypes}
            setSelectedQuestionId={setSelectedQuestionId}
            setCurrentView={handleViewChange}
          />
        );
      case 'unseen-topics':
        return (
          <UnseenTopics
            allQuestions={allQuestions}
            predictedQuestions={predictedQuestions}
            unitNames={unitNames}
            onOpenPastPapers={(filters) => {
              setSelectedFilters(filters);
              setSelectedQuestionId(null);
              setShowFavoritesOnly(false);
              handleViewChange('main');
            }}
            onOpenPredicted={(filters) => {
              setPredictedInitialFilters({ ...filters });
              handleViewChange('predicted');
            }}
            onOpenDefinitions={(filters) => {
              setDefinitionsInitialFilters({ ...filters });
              handleViewChange('definitions');
            }}
            onOpenTextbooks={() => handleViewChange('books')}
          />
        );
      case 'books':
        return <BookViewer />;
      case 'predicted':
        return (
          <MemoizedPredictedQuestions
            predictedQuestions={predictedQuestions}
            unitNames={unitNames}
            questionTypes={questionTypes}
            getTopicName={getTopicName}
            onToggleFavorite={toggleFavorite}
            favorites={favorites}
            initialFilters={predictedInitialFilters}
          />
        );
      case 'definitions':
        return (
          <MemoizedDefinitions
            unitNames={unitNames}
            onToggleFavorite={toggleFavorite}
            favorites={favorites}
            setCurrentView={handleViewChange}
            initialFilters={definitionsInitialFilters}
          />
        );
      case 'hsc-islam':
        return (
          <MemoizedHscIslam
            initialTab={hscLaunch.tab}
            initialViewMode={hscLaunch.viewMode}
            onMasteryChange={setHscMastered}
          />
        );
      default:
        return renderMainView();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-paper)] text-[var(--ink-primary)] transition-colors duration-150">
      {/* Full-Bleed Editorial Navbar */}
      <header
        className={`sticky top-0 z-30 bg-[var(--bg-surface)] border-b border-[var(--border-hairline)] transition-shadow duration-150 ${
          isScrolled ? 'shadow-[var(--shadow-header-scrolled)]' : ''
        }`}
      >
        {/* 2px Canonical Warm Amber-Bronze Top Accent Rule */}
        <div
          className="h-[2px] w-full"
          style={{ backgroundColor: 'var(--subject-islam)' }}
          aria-hidden="true"
        />

        <div className="w-full px-3 sm:px-5 lg:px-6 h-[56px] flex items-center justify-between gap-3">
          {/* Left: Contextual Study Hub Bridge + Divider + Brand Wordmark */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <a
              href={studyHubHref}
              className="hidden sm:inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--ink-muted)] hover:text-[var(--ink-primary)] transition-colors shrink-0 whitespace-nowrap"
              title={`Return to Study Hub (${isHscView ? 'HSC Islam' : 'SSC Islam'})`}
            >
              <ArrowLeftIcon className="w-3.5 h-3.5 shrink-0" />
              <span>Study Hub</span>
            </a>

            <span
              className="hidden sm:block h-4 w-px bg-[var(--border-hairline)] shrink-0"
              aria-hidden="true"
            />

            <button
              type="button"
              onClick={() => handleViewChange('landing')}
              className="inline-flex items-center gap-2 text-left group shrink-0 whitespace-nowrap"
              title="Return to Study Overview"
            >
              <RubElHizbIcon className="w-4 h-4 text-[var(--subject-islam)] shrink-0" />
              <span className="font-editorial text-[16px] sm:text-[18px] font-semibold tracking-[-0.02em] text-[var(--ink-primary)] leading-none shrink-0 whitespace-nowrap">
                Islamee Tharubiyyathu
              </span>
            </button>
          </div>

          {/* Center: Flush Bottom-Underline Primary Tabs (Desktop & Tablet) */}
          <nav
            aria-label="Primary Navigation"
            className="hidden md:flex items-stretch h-full gap-1"
          >
            <button
              type="button"
              onClick={() => handleViewChange('landing')}
              className={`inline-flex items-center px-3.5 text-[13.5px] font-medium border-b-[2.5px] -mb-px transition-colors whitespace-nowrap ${
                currentView === 'landing'
                  ? 'border-[var(--subject-islam)] text-[var(--ink-primary)] font-semibold'
                  : 'border-transparent text-[var(--ink-muted)] hover:text-[var(--ink-primary)]'
              }`}
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => handleViewChange(isSscView ? currentView : 'main')}
              className={`inline-flex items-center px-3.5 text-[13.5px] font-medium border-b-[2.5px] -mb-px transition-colors whitespace-nowrap ${
                isSscView
                  ? 'border-[var(--subject-biology)] text-[var(--ink-primary)] font-semibold'
                  : 'border-transparent text-[var(--ink-muted)] hover:text-[var(--ink-primary)]'
              }`}
            >
              SSC O-Level
            </button>
            <button
              type="button"
              onClick={() => handleViewChange('hsc-islam')}
              className={`inline-flex items-center px-3.5 text-[13.5px] font-medium border-b-[2.5px] -mb-px transition-colors whitespace-nowrap ${
                isHscView
                  ? 'border-[var(--subject-islam)] text-[var(--ink-primary)] font-semibold'
                  : 'border-transparent text-[var(--ink-muted)] hover:text-[var(--ink-primary)]'
              }`}
            >
              HSC AS/A2
            </button>
          </nav>

          {/* Right: Saved Counter + Theme Toggle + Mobile Menu */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={openSavedFavorites}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-[var(--bg-inset)] border border-[var(--border-hairline)] text-[var(--ink-primary)] hover:border-[var(--subject-islam)] transition-colors"
              title="Open saved questions"
            >
              <StarIcon className="w-3.5 h-3.5 text-[var(--subject-islam)]" filled={favorites.length > 0} />
              <span className="font-mono-code tabular-nums">{favorites.length}</span>
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-md bg-[var(--bg-inset)] border border-[var(--border-hairline)] text-[var(--ink-primary)] hover:border-[var(--border-strong)] transition-colors"
              title={isDark ? 'Switch to Light Editorial Mode' : 'Switch to Oxford Slate Dark Mode'}
              aria-label="Toggle theme"
            >
              {isDark ? (
                <SunIcon className="w-4 h-4 text-[var(--subject-islam)]" />
              ) : (
                <MoonIcon className="w-4 h-4 text-[var(--ink-secondary)]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="md:hidden p-2 rounded-md bg-[var(--bg-inset)] border border-[var(--border-hairline)] text-[var(--ink-primary)] hover:border-[var(--border-strong)] transition-colors"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <XIcon className="w-4 h-4" /> : <MenuIcon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu with Study Hub at Top */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[var(--border-hairline)] bg-[var(--bg-surface)] px-3 py-3 space-y-1.5 animate-fade-up">
            <a
              href={studyHubHref}
              className="flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium bg-[var(--bg-inset)] border border-[var(--border-hairline)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
            >
              <span className="inline-flex items-center gap-1.5">
                <ArrowLeftIcon className="w-3.5 h-3.5" />
                <span>Study Hub ({isHscView ? 'HSC Islam' : 'SSC Islam'})</span>
              </span>
            </a>

            <div className="grid grid-cols-3 gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => handleViewChange('landing')}
                className={`px-3 py-2 rounded-md text-xs font-medium border text-center transition-colors ${
                  currentView === 'landing'
                    ? 'bg-[var(--action-primary-bg)] text-[var(--action-primary-fg)] border-[var(--action-primary-bg)]'
                    : 'bg-[var(--bg-surface)] text-[var(--ink-secondary)] border-[var(--border-hairline)]'
                }`}
              >
                Overview
              </button>
              <button
                type="button"
                onClick={() => handleViewChange(isSscView ? currentView : 'main')}
                className={`px-3 py-2 rounded-md text-xs font-medium border text-center transition-colors ${
                  isSscView
                    ? 'bg-[var(--subject-biology)] text-white border-[var(--subject-biology)]'
                    : 'bg-[var(--bg-surface)] text-[var(--ink-secondary)] border-[var(--border-hairline)]'
                }`}
              >
                SSC O-Level
              </button>
              <button
                type="button"
                onClick={() => handleViewChange('hsc-islam')}
                className={`px-3 py-2 rounded-md text-xs font-medium border text-center transition-colors ${
                  isHscView
                    ? 'bg-[var(--subject-islam)] text-white border-[var(--subject-islam)]'
                    : 'bg-[var(--bg-surface)] text-[var(--ink-secondary)] border-[var(--border-hairline)]'
                }`}
              >
                HSC AS/A2
              </button>
            </div>

            <button
              type="button"
              onClick={openSavedFavorites}
              className="w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium text-[var(--ink-secondary)] hover:bg-[var(--bg-subtle)]"
            >
              <span className="inline-flex items-center gap-1.5">
                <StarIcon className="w-3.5 h-3.5 text-[var(--subject-islam)]" filled={favorites.length > 0} />
                <span>Saved Bookmarks</span>
              </span>
              <span className="font-mono-code tabular-nums text-[var(--ink-primary)]">
                {favorites.length}
              </span>
            </button>
          </div>
        )}

        {/* Connected SSC Underline Sub-Tabs (Desktop & Mobile with hidden scrollbar) */}
        {isSscView && (
          <div className="border-t border-[var(--border-hairline)] bg-[var(--bg-surface)]">
            <div className="w-full px-3 sm:px-5 lg:px-6 flex items-center justify-between gap-4">
              <div
                role="tablist"
                aria-label="SSC O-Level Sections"
                className="flex items-center gap-1 overflow-x-auto no-scrollbar"
              >
                {SSC_NAV_ITEMS.map(item => {
                  const Icon = item.icon;
                  const active = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => handleViewChange(item.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-2.5 text-[13px] font-medium whitespace-nowrap border-b-[2.5px] -mb-px transition-colors shrink-0 ${
                        active
                          ? 'border-[var(--subject-biology)] text-[var(--subject-biology)] font-semibold'
                          : 'border-transparent text-[var(--ink-muted)] hover:text-[var(--ink-primary)]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="hidden lg:block text-xs font-mono-code tabular-nums text-[var(--ink-muted)] shrink-0 whitespace-nowrap">
                {currentView === 'main'
                  ? `${filteredQuestions.length} matching questions`
                  : currentView === 'quiz'
                  ? 'Practice Mode'
                  : currentView === 'predicted'
                  ? `${predictedQuestions.length} predicted items`
                  : currentView === 'definitions'
                  ? `${definitionsData.length} definitions`
                  : currentView === 'unseen-topics'
                  ? 'Syllabus Coverage'
                  : 'Textbooks & Summaries'}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area — Full-Viewport Workbench Density vs Editorial Landing */}
      <main
        className={`flex-1 w-full flex flex-col min-h-0 ${
          isWorkbenchFullBleed
            ? 'px-3 sm:px-5 lg:px-6 py-3 lg:py-4'
            : 'max-w-7xl mx-auto px-3 sm:px-5 lg:px-8 py-4 lg:py-6'
        }`}
      >
        {renderCurrentView()}
      </main>

      {/* Calm Hairline Editorial Footer */}
      <footer className="border-t border-[var(--border-hairline)] py-3.5 mt-auto bg-[var(--bg-surface)]">
        <div className="w-full px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-[var(--ink-muted)]">
          <div className="font-mono-code tabular-nums">2026 © islam-topicals.vercel.app</div>
          <div>
            Crafted by <span className="font-medium text-[var(--ink-secondary)]">bakari-koshi</span>
          </div>
        </div>
      </footer>

      <Analytics />
    </div>
  );
};

export default App;
