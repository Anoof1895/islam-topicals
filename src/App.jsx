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
  BookOpenIcon,
  CardDeckIcon,
  ChevronRightIcon,
  CompassIcon,
  LibraryIcon,
  LightbulbIcon,
  MoonIcon,
  RubElHizbIcon,
  ScrollTextIcon,
  ShuffleIcon,
  SparklesIcon,
  StarIcon,
  SunIcon,
  TargetIcon,
} from './components/Icons';

const MemoizedFilters = React.memo(Filters);
const MemoizedQuestionList = React.memo(QuestionList);
const MemoizedQuestionView = React.memo(QuestionView);
const MemoizedPredictedQuestions = React.memo(PredictedQuestions);
const MemoizedDefinitions = React.memo(Definitions);
const MemoizedHscIslam = React.memo(HscIslam);

const SSC_NAV_ITEMS = [
  { id: 'main', label: 'Questions', shortLabel: 'Papers', icon: BookOpenIcon },
  { id: 'quiz', label: 'Quiz', shortLabel: 'Quiz', icon: TargetIcon },
  { id: 'predicted', label: 'Predicted', shortLabel: 'Predicted', icon: SparklesIcon },
  { id: 'definitions', label: 'Definitions', shortLabel: 'Defs', icon: ScrollTextIcon },
  { id: 'unseen-topics', label: 'Unseen Topics', shortLabel: 'Unseen', icon: CompassIcon },
  { id: 'books', label: 'Textbooks', shortLabel: 'Books', icon: LibraryIcon },
];

const App = () => {
  const [selectedFilters, setSelectedFilters] = useState({});
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [noteVersion, setNoteVersion] = useState(0);

  const [predictedInitialFilters, setPredictedInitialFilters] = useState(null);
  const [definitionsInitialFilters, setDefinitionsInitialFilters] = useState(null);
  const [hscLaunch, setHscLaunch] = useState({ tab: 'mod1', viewMode: 'notes' });

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

  const [currentView, setCurrentView] = useState('landing');
  const { isDark, toggleTheme } = useTheme();

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

  const handleViewChange = useCallback((view) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleFilterSearch = useCallback(() => {
    setSelectedQuestionId(null);
  }, []);

  const openSavedFavorites = useCallback(() => {
    setSelectedFilters({});
    setSelectedQuestionId(null);
    setShowFavoritesOnly(true);
    setCurrentView('main');
  }, []);

  const openHscWith = useCallback((tab = 'mod1', viewMode = 'notes') => {
    setHscLaunch({ tab, viewMode });
    setCurrentView('hsc-islam');
  }, []);

  const isSscView = ['main', 'quiz', 'books', 'predicted', 'definitions', 'unseen-topics'].includes(
    currentView
  );
  const isHscView = currentView === 'hsc-islam';

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
      <div className="max-w-6xl mx-auto w-full space-y-6 py-2 sm:py-6 animate-fade-up">
        {/* Hero Banner */}
        <section className="relative rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-[var(--shadow-card)] overflow-hidden">
          <div className="absolute inset-0 bg-islamic-lattice pointer-events-none" />
          <div className="relative px-6 py-10 sm:px-10 sm:py-12 text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--accent-primary-soft)] border border-[var(--accent-primary)]/20 text-[var(--accent-primary)] text-xs font-semibold mb-4">
              <RubElHizbIcon className="w-4 h-4" />
              <span className="arabic-text text-sm">التَّرْبِيَةُ الإِسْلَامِيَّة</span>
              <span className="opacity-40">•</span>
              <span>Maldives National Syllabus</span>
            </div>

            <h1 className="font-serif-editorial text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[var(--text-primary)] mb-4">
              Islamee Tharubiyyathu
            </h1>

            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto">
              A focused scholarly workspace uniting SSC O-Level topical past papers, teacher predictions, and definitions with HSC AS/A2 modular study notes and active-recall flashcards.
            </p>
          </div>
        </section>

        {/* Two Flagship Syllabus Portal Cards */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* SSC Card */}
          <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] hover:border-[var(--accent-primary)]/50 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] p-6 sm:p-7 flex flex-col justify-between gap-6 transition-all">
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[var(--accent-primary-soft)] text-[var(--accent-primary)] flex items-center justify-center">
                  <BookOpenIcon className="w-6 h-6" />
                </div>
                <span className="font-mono-code text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-hairline)]">
                  Grades 9 &amp; 10
                </span>
              </div>

              <h2 className="font-serif-editorial text-2xl sm:text-3xl font-semibold text-[var(--text-primary)] mb-2">
                SSC (O-Level)
              </h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-5">
                Explore {allQuestions.length} topical past paper questions with mark schemes, {predictedQuestions.length} predicted questions, {definitionsData.length} definitions, custom quizzes, and textbooks.
              </p>

              {/* Quick Mode Pills */}
              <div className="flex flex-wrap gap-1.5">
                {SSC_NAV_ITEMS.filter(item => item.id !== 'main').map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleViewChange(item.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[var(--bg-subtle)] border border-[var(--border-hairline)] text-[var(--text-primary)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] transition-colors"
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
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primary-hover)] transition-colors shadow-xs"
            >
              <span>Open Past Paper Archive</span>
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>

          {/* HSC Card */}
          <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] hover:border-[var(--accent-gold)]/55 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] p-6 sm:p-7 flex flex-col justify-between gap-6 transition-all">
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[var(--accent-gold-soft)] text-[var(--accent-gold)] flex items-center justify-center">
                  <RubElHizbIcon className="w-6 h-6" />
                </div>
                <span className="font-mono-code text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-hairline)]">
                  AS / A2 Modular
                </span>
              </div>

              <h2 className="font-serif-editorial text-2xl sm:text-3xl font-semibold text-[var(--text-primary)] mb-2">
                HSC (AS/A2 Level)
              </h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-5">
                Complete Module 1 (Aqeedha, {hscModulesData.mod1?.topics?.length || 20} chapters) &amp; Module 2 (Hadhees &amp; Akhlaaq, {hscModulesData.mod2?.topics?.length || 28} topics), interactive 2026 Specimen Paper &amp; Mark Scheme practice, flashcards, random facts, and 6-PDF library.
              </p>

              {/* Quick Mode Pills */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => openHscWith('mod1', 'notes')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[var(--bg-subtle)] border border-[var(--border-hairline)] text-[var(--text-primary)] hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)] transition-colors"
                >
                  <BookOpenIcon className="w-3.5 h-3.5" />
                  <span>Module 1</span>
                </button>
                <button
                  type="button"
                  onClick={() => openHscWith('mod2', 'notes')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[var(--bg-subtle)] border border-[var(--border-hairline)] text-[var(--text-primary)] hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)] transition-colors"
                >
                  <BookOpenIcon className="w-3.5 h-3.5" />
                  <span>Module 2</span>
                </button>
                <button
                  type="button"
                  onClick={() => openHscWith('specimen', 'notes')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[var(--bg-subtle)] border border-[var(--border-hairline)] text-[var(--text-primary)] hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)] transition-colors"
                >
                  <ScrollTextIcon className="w-3.5 h-3.5" />
                  <span>Specimen Exam</span>
                </button>
                <button
                  type="button"
                  onClick={() => openHscWith('mod1', 'flashcards')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[var(--bg-subtle)] border border-[var(--border-hairline)] text-[var(--text-primary)] hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)] transition-colors"
                >
                  <CardDeckIcon className="w-3.5 h-3.5" />
                  <span>Flashcard Decks</span>
                </button>
                <button
                  type="button"
                  onClick={() => openHscWith('facts', 'notes')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[var(--bg-subtle)] border border-[var(--border-hairline)] text-[var(--text-primary)] hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)] transition-colors"
                >
                  <LightbulbIcon className="w-3.5 h-3.5" />
                  <span>Random Facts</span>
                </button>
                <button
                  type="button"
                  onClick={() => openHscWith('textbooks', 'notes')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[var(--bg-subtle)] border border-[var(--border-hairline)] text-[var(--text-primary)] hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)] transition-colors"
                >
                  <LibraryIcon className="w-3.5 h-3.5" />
                  <span>PDF Library (6)</span>
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => openHscWith('mod1', 'notes')}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold bg-[var(--accent-gold)] text-white hover:opacity-95 transition-all shadow-xs"
            >
              <span>Open HSC Study Modules</span>
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* Live Study Dashboard Strip */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Saved Favorites */}
          <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-[var(--shadow-card)] p-5 flex flex-col justify-between gap-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Saved Bookmarks
                </div>
                <div className="font-mono-code text-3xl font-bold text-[var(--text-primary)] mt-1">
                  {favorites.length}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[var(--accent-gold-soft)] text-[var(--accent-gold)] flex items-center justify-center">
                <StarIcon className="w-5 h-5" filled={favorites.length > 0} />
              </div>
            </div>
            <button
              type="button"
              onClick={openSavedFavorites}
              className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-[var(--bg-subtle)] text-[var(--text-primary)] hover:bg-[var(--accent-gold-soft)] hover:text-[var(--accent-gold)] transition-colors text-center"
            >
              Review Saved Items →
            </button>
          </div>

          {/* HSC Mastery Progress */}
          <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-[var(--shadow-card)] p-5 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  HSC Mastery
                </span>
                <span className="font-mono-code text-xs font-bold text-[var(--accent-primary)]">
                  {hscMastered.length} / {totalHscTopics} topics
                </span>
              </div>
              <div className="font-mono-code text-3xl font-bold text-[var(--text-primary)] mt-1">
                {hscProgressPct}%
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="w-full h-2 rounded-full bg-[var(--bg-subtle)] overflow-hidden">
                <div
                  className="h-full bg-[var(--accent-primary)] rounded-full transition-all duration-500"
                  style={{ width: `${hscProgressPct}%` }}
                />
              </div>
              <div className="text-[11px] text-[var(--text-secondary)]">
                Module 1 &amp; 2 mastery saved locally
              </div>
            </div>
          </div>

          {/* Syllabus Question Bank Stats */}
          <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-[var(--shadow-card)] p-5 flex flex-col justify-between gap-3">
            <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Content Bank
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-[var(--bg-subtle)]">
                <div className="font-mono-code text-lg font-bold text-[var(--text-primary)]">
                  {allQuestions.length}
                </div>
                <div className="text-[10px] font-semibold text-[var(--text-secondary)]">Past Qs</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--bg-subtle)]">
                <div className="font-mono-code text-lg font-bold text-[var(--text-primary)]">
                  {predictedQuestions.length}
                </div>
                <div className="text-[10px] font-semibold text-[var(--text-secondary)]">Predicted</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--bg-subtle)]">
                <div className="font-mono-code text-lg font-bold text-[var(--text-primary)]">
                  {definitionsData.length}
                </div>
                <div className="text-[10px] font-semibold text-[var(--text-secondary)]">Thaaraf</div>
              </div>
            </div>
          </div>
        </section>

        {/* Daily Scholarly Fact Preview */}
        {currentFact && (
          <section className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-[var(--shadow-card)] p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary-soft)] text-[var(--accent-primary)] flex items-center justify-center">
                  <LightbulbIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="dhivehi-text text-base sm:text-lg font-bold text-[var(--text-primary)]">
                    ތިޔަދަރިވަރުންނަށް އެނގޭތަ!
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={shuffleDailyFact}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[var(--bg-subtle)] border border-[var(--border-hairline)] text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-colors"
                >
                  <ShuffleIcon className="w-3.5 h-3.5" />
                  <span>Another Fact</span>
                </button>
                <button
                  type="button"
                  onClick={() => openHscWith('facts', 'notes')}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[var(--accent-primary)] hover:bg-[var(--accent-primary-soft)] transition-colors"
                >
                  Open Fact Bank →
                </button>
              </div>
            </div>

            <p
              className="dhivehi-text text-base sm:text-lg text-[var(--text-primary)] leading-[2.2] text-right bg-[var(--bg-elevated)] border border-[var(--border-hairline)] rounded-xl px-5 py-4"
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
    <div className="flex-1 flex flex-col min-h-0 gap-3 lg:gap-4">
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

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0 lg:h-[calc(100vh-14.5rem)]">
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
              ? 'fixed inset-0 z-40 bg-[var(--bg-canvas)] p-2 flex flex-col lg:static lg:inset-auto lg:z-auto lg:bg-transparent lg:p-0 lg:flex-1 lg:min-w-0 lg:min-h-0'
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
    <div className="min-h-screen flex flex-col bg-[var(--bg-canvas)] text-[var(--text-primary)] transition-colors duration-200">
      {/* Persistent Scholarly Top Header */}
      <header className="sticky top-0 z-30 border-b border-[var(--border-hairline)] bg-[var(--bg-surface)]/92 backdrop-blur-md">
        <div className="max-w-[1440px] mx-auto px-3 sm:px-5 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Left: Brand Emblem + Title */}
          <button
            type="button"
            onClick={() => handleViewChange('landing')}
            className="flex items-center gap-2.5 text-left group flex-shrink-0"
            title="Return to Study Overview"
          >
            <div className="w-9 h-9 rounded-xl bg-[var(--accent-primary)] text-white flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
              <RubElHizbIcon className="w-5 h-5" />
            </div>
            <div className="hidden xs:block sm:block">
              <div className="font-serif-editorial text-base sm:text-lg font-semibold text-[var(--text-primary)] leading-none">
                Islamee Tharubiyyathu
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mt-1">
                {isSscView ? 'SSC O-Level' : isHscView ? 'HSC AS/A2 Level' : 'Study Portal'}
              </div>
            </div>
          </button>

          {/* Center: Instant Syllabus Switcher */}
          <nav
            aria-label="Syllabus Switcher"
            className="inline-flex items-center p-1 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-hairline)]"
          >
            <button
              type="button"
              onClick={() => handleViewChange('landing')}
              className={`px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentView === 'landing'
                  ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-2xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => handleViewChange(isSscView ? currentView : 'main')}
              className={`px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isSscView
                  ? 'bg-[var(--accent-primary)] text-white shadow-2xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              SSC <span className="hidden md:inline">O-Level</span>
            </button>
            <button
              type="button"
              onClick={() => handleViewChange('hsc-islam')}
              className={`px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isHscView
                  ? 'bg-[var(--accent-gold)] text-white shadow-2xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              HSC <span className="hidden md:inline">AS/A2</span>
            </button>
          </nav>

          {/* Right: Favorites Shortcut + Theme Toggle */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={openSavedFavorites}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[var(--bg-subtle)] border border-[var(--border-hairline)] text-[var(--text-primary)] hover:border-[var(--accent-gold)] transition-colors"
              title="Open saved questions"
            >
              <StarIcon className="w-3.5 h-3.5 text-[var(--accent-gold)]" filled={favorites.length > 0} />
              <span className="font-mono-code">{favorites.length}</span>
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-hairline)] text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-colors"
              title={isDark ? 'Switch to Warm Parchment Light Mode' : 'Switch to Obsidian Dark Mode'}
              aria-label="Toggle theme"
            >
              {isDark ? <SunIcon className="w-4 h-4 text-[var(--accent-gold)]" /> : <MoonIcon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Desktop SSC Study Mode Tab Strip */}
        {isSscView && (
          <div className="hidden lg:block border-t border-[var(--border-hairline)] bg-[var(--bg-subtle)]/40">
            <div className="max-w-[1440px] mx-auto px-8 flex items-center justify-between gap-4">
              <div className="flex items-center gap-1 py-1.5">
                {SSC_NAV_ITEMS.map(item => {
                  const Icon = item.icon;
                  const active = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleViewChange(item.id)}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                        active
                          ? 'bg-[var(--bg-surface)] text-[var(--accent-primary)] border border-[var(--border-hairline)] shadow-2xs'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]/50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="text-xs font-mono-code text-[var(--text-muted)]">
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

      {/* Main Content Area */}
      <main
        className={`flex-1 max-w-[1440px] w-full mx-auto px-3 sm:px-5 lg:px-8 py-4 lg:py-6 flex flex-col min-h-0 ${
          isSscView ? 'pb-20 lg:pb-6' : ''
        }`}
      >
        {renderCurrentView()}
      </main>

      {/* Mobile Bottom Tab Bar (SSC Views) */}
      {isSscView && (
        <nav
          aria-label="Mobile SSC Navigation"
          className="lg:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-[var(--border-hairline)] bg-[var(--bg-surface)]/95 backdrop-blur-md px-1 py-1.5 grid grid-cols-6 gap-0.5"
        >
          {SSC_NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const active = currentView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleViewChange(item.id)}
                className={`flex flex-col items-center justify-center py-1 rounded-xl text-[10px] font-semibold transition-colors ${
                  active
                    ? 'text-[var(--accent-primary)] bg-[var(--accent-primary-soft)]'
                    : 'text-[var(--text-secondary)]'
                }`}
              >
                <Icon className="w-4 h-4 mb-0.5" />
                <span className="truncate max-w-full px-0.5">{item.shortLabel}</span>
              </button>
            );
          })}
        </nav>
      )}

      {/* Subtle Scholarly Footer */}
      <footer
        className={`border-t border-[var(--border-hairline)] py-4 mt-auto bg-[var(--bg-surface)]/60 ${
          isSscView ? 'mb-14 lg:mb-0' : ''
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-[var(--text-muted)]">
          <div>2026 © islam-topicals.vercel.app</div>
          <div>
            Crafted by <span className="font-semibold text-[var(--text-secondary)]">bakari-koshi</span>
          </div>
        </div>
      </footer>

      <Analytics />
    </div>
  );
};

export default App;
