import React, { useState, useMemo, useCallback } from "react";
import { Analytics } from "@vercel/analytics/react"
import allQuestions from "./questionsData";
import predictedQuestions from "./predictedQuestionsData";
import definitionsData from "./definitionsData";
import Filters from "./components/Filters";
import QuestionList from "./components/QuestionList";
import QuestionView from "./pages/QuestionView";
import UnseenTopics from "./pages/UnseenTopics";
import QuizGenerator from "./pages/QuizGenerator";
import BookViewer from "./pages/BookViewer";
import PredictedQuestions from "./pages/PredictedQuestions";
import Definitions from "./pages/Definitions";
import { topicNames, getTopicName } from "./topicNames";
import { useTheme } from "./context/ThemeContext";
import HscIslam from './pages/HscIslam'; 


// Memoized components
const MemoizedFilters = React.memo(Filters);
const MemoizedQuestionList = React.memo(QuestionList);
const MemoizedQuestionView = React.memo(QuestionView);
const MemoizedPredictedQuestions = React.memo(PredictedQuestions);
const MemoizedDefinitions = React.memo(Definitions);
const MemoizedHscIslam = React.memo(HscIslam); 

const App = () => {
  const [selectedFilters, setSelectedFilters] = useState({});
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('favoriteQuestions') || '[]');
    } catch (error) {
      console.error('Error loading favorites:', error);
      return [];
    }
  });
  
  // Set default view to our landing page
  const [currentView, setCurrentView] = useState('landing'); 
  const { isDark, toggleTheme } = useTheme();

  // Unit name mapping
  const unitNames = useMemo(() => ({
    1: "Aqeedha",
    2: "Khadhees", 
    3: "Fiqh",
    4: "Thaareekh",
    5: "Saqaafa",
    6: "Akhlaaq"
  }), []);

  // Question type mapping
  const questionTypes = useMemo(() => ({
    1: "Thaaraf",
    2: "Dheyha",
    3: "Haadhisaa", 
    4: "Gina Marks",
    5: "Mauloomaathu",
    6: "Dhiraasaa",
    7: "Beynun Kurun"
  }), []);

  const toggleFavorite = useCallback((questionId) => {
    try {
      const newFavorites = favorites.includes(questionId)
        ? favorites.filter(id => id !== questionId)
        : [...favorites, questionId];
      setFavorites(newFavorites);
      localStorage.setItem('favoriteQuestions', JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  }, [favorites]);

  const options = useMemo(() => ({
    book: [...new Set(allQuestions.map(q => q.book))].sort((a, b) => a - b),
    year: [...new Set(allQuestions.map(q => q.year))].sort((a, b) => b - a),
    paper: [...new Set(allQuestions.map(q => q.paper))].sort((a, b) => a - b),
    unit: [...new Set(allQuestions.map(q => q.unit))].sort((a, b) => a - b),
    topic: [...new Set(allQuestions.flatMap(q => 
      String(q.topic).split('_').map(t => parseInt(t))
    ).filter(t => !isNaN(t)))].sort((a, b) => a - b),
    types: [...new Set(allQuestions.flatMap(q => q.types))].sort((a, b) => a - b),
    paperType: ['specimen', 'actual'],
  }), []);

  const filteredQuestions = useMemo(() => {
    const filtered = allQuestions.filter(q =>
      Object.entries(selectedFilters).every(([field, values]) => {
        if (values.length === 0) return true;
        
        if (field === 'types') {
          return values.every(selectedType => q.types.includes(selectedType));
        }
        
        if (field === 'topic') {
          const questionTopic = String(q.topic);
          const selectedTopics = values.map(v => String(v));
          
          return selectedTopics.some(selectedTopic => {
            if (questionTopic.includes('_')) {
              const questionTopics = questionTopic.split('_');
              return questionTopics.includes(selectedTopic);
            }
            return questionTopic === selectedTopic;
          });
        }
        
        if (field === 'paperType') {
          const isSpecimen = (q.year === 2021 && q.paperSet === 2) || (q.year === 2020 && q.paperSet === 1);
          
          if (values.includes('specimen') && values.includes('actual')) {
            return true;
          }
          if (values.includes('specimen')) {
            return isSpecimen;
          }
          if (values.includes('actual')) {
            return !isSpecimen;
          }
        }
        
        return values.map(v => String(v)).includes(String(q[field]));
      })
    );

    return filtered.sort((a, b) => {
      if (b.year !== a.year) {
        return b.year - a.year;
      }
      const aNum = parseInt(a.questionNumber) || 0;
      const bNum = parseInt(b.questionNumber) || 0;
      return aNum - bNum;
    });
  }, [selectedFilters]);

  const currentQuestion = useMemo(() => 
    filteredQuestions.find(q => q.id === selectedQuestionId),
    [filteredQuestions, selectedQuestionId]
  );

  const handleViewChange = useCallback((view) => {
    setCurrentView(view);
  }, []);

  const handleFilterSearch = useCallback(() => {
    setSelectedQuestionId(null);
  }, []);

  // Check if we are currently in an SSC specific view
  const isSscView = ['main', 'quiz', 'books', 'predicted', 'definitions', 'unseen-topics'].includes(currentView);

  const renderLandingPage = useCallback(() => (
    <div className="flex flex-col items-center justify-center min-h-[75vh] gap-8 px-4">
      <div className="text-center mb-8">
        <h1 className={`text-5xl md:text-7xl font-extrabold mb-4 ${isDark ? 'text-white' : 'text-blue-900'}`}>
          Islamee Tharubiyyathu
        </h1>
        <p className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Select your syllabus to begin studying
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 w-full max-w-4xl">
        {/* SSC (O-Level) Card */}
        <button 
          onClick={() => handleViewChange('main')}
          className={`flex-1 text-left p-8 rounded-2xl border-2 transition-all duration-300 transform hover:-translate-y-2 ${
            isDark 
              ? 'bg-gray-800 border-blue-500/30 hover:border-blue-400 hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]' 
              : 'bg-white border-blue-200 hover:border-blue-500 hover:shadow-xl'
          }`}
        >
          <div className="text-5xl mb-4">📚</div>
          <h2 className={`text-3xl font-bold mb-3 ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
            SSC (O-Level)
          </h2>
          <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Access topical past papers, definitions, and quizzes for the Grade 10 syllabus.
          </p>
        </button>

        {/* HSC (AS Level) Card */}
        <button 
          onClick={() => handleViewChange('hsc-islam')}
          className={`flex-1 text-left p-8 rounded-2xl border-2 transition-all duration-300 transform hover:-translate-y-2 ${
            isDark 
              ? 'bg-gray-800 border-indigo-500/30 hover:border-indigo-400 hover:shadow-[0_0_30px_rgba(99,102,241,0.2)]' 
              : 'bg-white border-indigo-200 hover:border-indigo-500 hover:shadow-xl'
          }`}
        >
          <div className="text-5xl mb-4">☪️</div>
          <h2 className={`text-3xl font-bold mb-3 ${isDark ? 'text-indigo-400' : 'text-indigo-700'}`}>
            HSC (AS/A2 Level)
          </h2>
          <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Interactive flashcards, definitions, and active recall testing for the new modular syllabus.
          </p>
        </button>
      </div>
    </div>
  ), [isDark, handleViewChange]);

  const renderMainView = useCallback(() => (
    <>
      <MemoizedFilters
        options={options}
        selectedFilters={selectedFilters}
        setSelectedFilters={setSelectedFilters}
        onSearch={handleFilterSearch}
        unitNames={unitNames}
        questionTypes={questionTypes}
        topicNames={topicNames}
      />
      
      <div className="flex flex-col lg:flex-row gap-3 lg:gap-6 mt-3 lg:mt-6 flex-1 min-h-0">
        <div className="w-full lg:w-96 xl:w-80 2xl:w-96 flex-shrink-0 flex flex-col min-h-0">
          <MemoizedQuestionList
            questions={filteredQuestions}
            selectedQuestionId={selectedQuestionId}
            setSelectedQuestionId={setSelectedQuestionId}
            unitNames={unitNames}
            getTopicName={getTopicName}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
          />
        </div>
        
        <div className="flex-1 min-w-0 flex flex-col min-h-0">
          <MemoizedQuestionView
            question={currentQuestion}
            questions={filteredQuestions}
            setSelectedQuestionId={setSelectedQuestionId}
            unitNames={unitNames}
            questionTypes={questionTypes}
            getTopicName={getTopicName}
            onToggleFavorite={toggleFavorite}
            isFavorite={selectedQuestionId ? favorites.includes(selectedQuestionId) : false}
          />
        </div>
      </div>
    </>
  ), [options, selectedFilters, unitNames, questionTypes, filteredQuestions, selectedQuestionId, favorites, toggleFavorite, currentQuestion, handleFilterSearch]);

  const renderCurrentView = useCallback(() => {
    switch(currentView) {
      case 'landing':
        return renderLandingPage();
      case 'quiz':
        return <QuizGenerator 
          allQuestions={allQuestions} 
          unitNames={unitNames}
          questionTypes={questionTypes}
          setSelectedQuestionId={setSelectedQuestionId}
          setCurrentView={handleViewChange}
        />;
      case 'unseen-topics':
        return <UnseenTopics allQuestions={allQuestions} unitNames={unitNames} />;
      case 'books':
        return <BookViewer />;
      case 'predicted':
        return <MemoizedPredictedQuestions 
          predictedQuestions={predictedQuestions}
          unitNames={unitNames}
          questionTypes={questionTypes}
          getTopicName={getTopicName}
          onToggleFavorite={toggleFavorite}
          favorites={favorites}
        />;
      case 'definitions':
        return <MemoizedDefinitions 
          unitNames={unitNames}
          onToggleFavorite={toggleFavorite}
          favorites={favorites}
          setCurrentView={handleViewChange}
        />;
      case 'hsc-islam': 
        return <MemoizedHscIslam />;
      default:
        return renderMainView();
    }
  }, [currentView, unitNames, questionTypes, favorites, toggleFavorite, renderMainView, handleViewChange, renderLandingPage]);

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-white' 
        : 'bg-gradient-to-br from-slate-50 to-blue-50/30 text-gray-900'
    }`}>
      
      {/* CONDITIONAL HEADER RENDERING */}
      {currentView === 'landing' ? (
        /* Minimal Header for Landing Page (Just Theme Toggle) */
        <div className="flex justify-end px-4 lg:px-8 py-4">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-all duration-300 ${
              isDark
                ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
      ) : (
        /* Full Navigation Header for Study Modes */
        <header className={`border-b shadow-sm transition-colors duration-300 ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-blue-200/50'
        }`}>
          <div className="px-4 lg:px-8 py-3 lg:py-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="mb-2 sm:mb-0">
                  <h1 className="text-xl lg:text-2xl font-bold">
                    {currentView === 'hsc-islam' ? 'HSC ISLAM' : 'SSC ISLAM'}
                  </h1>
                  <p className={`text-xs lg:text-sm mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {currentView === 'hsc-islam' ? 'AS Level Module 1' : 'Topical Past Papers'}
                  </p>
                </div>
                
                <div className={`flex overflow-x-auto rounded-lg p-1 ${
                  isDark ? 'bg-gray-700' : 'bg-gray-100'
                }`} style={{ scrollbarWidth: 'thin', WebkitOverflowScrolling: 'touch' }}>
                  
                  {/* Home Button (Always visible inside study modes) */}
                  <button
                    onClick={() => handleViewChange('landing')}
                    className={`flex-shrink-0 px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-medium rounded-md transition-all duration-200 whitespace-nowrap ${
                      isDark ? "text-gray-400 hover:text-gray-200" : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    🏠 Home
                  </button>

                  {/* SSC specific buttons (Only visible if in SSC views) */}
                  {isSscView && (
                    <>
                      <button
                        onClick={() => handleViewChange('main')}
                        className={`flex-shrink-0 px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-medium rounded-md transition-all duration-200 whitespace-nowrap ${
                          currentView === 'main'
                            ? isDark ? "bg-gray-600 text-white shadow-sm" : "bg-white text-blue-600 shadow-sm"
                            : isDark ? "text-gray-400 hover:text-gray-200" : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        📚 Questions
                      </button>
                      <button
                        onClick={() => handleViewChange('quiz')}
                        className={`flex-shrink-0 px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-medium rounded-md transition-all duration-200 whitespace-nowrap ${
                          currentView === 'quiz'
                            ? isDark ? "bg-gray-600 text-white shadow-sm" : "bg-white text-green-600 shadow-sm"
                            : isDark ? "text-gray-400 hover:text-gray-200" : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        🎯 Quiz
                      </button>
                      <button
                        onClick={() => handleViewChange('books')}
                        className={`flex-shrink-0 px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-medium rounded-md transition-all duration-200 whitespace-nowrap ${
                          currentView === 'books'
                            ? isDark ? "bg-gray-600 text-white shadow-sm" : "bg-white text-purple-600 shadow-sm"
                            : isDark ? "text-gray-400 hover:text-gray-200" : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        📖 Books
                      </button>
                      <button
                        onClick={() => handleViewChange('predicted')}
                        className={`flex-shrink-0 px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-medium rounded-md transition-all duration-200 whitespace-nowrap ${
                          currentView === 'predicted'
                            ? isDark ? "bg-gray-600 text-white shadow-sm" : "bg-white text-pink-600 shadow-sm"
                            : isDark ? "text-gray-400 hover:text-gray-200" : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        🔮 Predicted
                      </button>
                      <button
                        onClick={() => handleViewChange('definitions')}
                        className={`flex-shrink-0 px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-medium rounded-md transition-all duration-200 whitespace-nowrap ${
                          currentView === 'definitions'
                            ? isDark ? "bg-gray-600 text-white shadow-sm" : "bg-white text-teal-600 shadow-sm"
                            : isDark ? "text-gray-400 hover:text-gray-200" : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        📖 Definitions
                      </button>
                      <button
                        onClick={() => handleViewChange('unseen-topics')}
                        className={`flex-shrink-0 px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-medium rounded-md transition-all duration-200 whitespace-nowrap ${
                          currentView === 'unseen-topics'
                            ? isDark ? "bg-gray-600 text-white shadow-sm" : "bg-white text-orange-600 shadow-sm"
                            : isDark ? "text-gray-400 hover:text-gray-200" : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        <span className="sm:hidden">🔍 Unseen</span>
                        <span className="hidden sm:inline">🔍 Unseen Topics</span>
                      </button>
                    </>
                  )}

                  {/* HSC specific button (Only visible if in HSC view) */}
                  {currentView === 'hsc-islam' && (
                    <button
                      onClick={() => handleViewChange('hsc-islam')}
                      className={`flex-shrink-0 px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-medium rounded-md transition-all duration-200 whitespace-nowrap ${
                        isDark ? "bg-gray-600 text-white shadow-sm" : "bg-white text-indigo-600 shadow-sm"
                      }`}
                    >
                      ☪️ HSC Islam
                    </button>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-left sm:text-right">
                  {currentView === 'main' ? (
                    <>
                      <div className={`text-lg lg:text-xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                        {filteredQuestions.length}
                      </div>
                      <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        question{filteredQuestions.length !== 1 ? 's' : ''} found
                      </div>
                    </>
                  ) : currentView === 'quiz' ? (
                    <div className={`font-semibold text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                      Practice Mode
                    </div>
                  ) : currentView === 'books' ? (
                    <div className={`font-semibold text-sm ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                      Textbook Viewer
                    </div>
                  ) : currentView === 'predicted' ? (
                    <div className={`font-semibold text-sm ${isDark ? 'text-pink-400' : 'text-pink-600'}`}>
                      Teacher's Predictions
                    </div>
                  ) : currentView === 'definitions' ? (
                    <div className={`font-semibold text-sm ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>
                      Definitions (Thaaraf)
                    </div>
                  ) : currentView === 'hsc-islam' ? (
                    <div className={`font-semibold text-sm ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                      AS Level (HSC)
                    </div>
                  ) : (
                    <div className={`font-semibold text-sm ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                      Study Focus Areas
                    </div>
                  )}
                </div>

                <button
                  onClick={toggleTheme}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    isDark
                      ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {isDark ? '☀️' : '🌙'}
                </button>
              </div>
            </div>
          </div>
        </header>
      )}

      <div className="flex-1 p-3 lg:p-6 flex flex-col min-h-0">
        {renderCurrentView()}
      </div>

      <footer className={`border-t py-4 mt-8 transition-colors duration-300 ${
        isDark 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-blue-200/50'
      }`}>
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3">
            <div className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              2026 © islam-topicals.vercel.app
            </div>
            <div className={`text-xs md:text-sm ${
              isDark ? 'text-gray-500' : 'text-gray-500'
            }`}>
              Made with ❤️ by <span className={`font-semibold ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>bakari-koshi</span>
            </div>
          </div>
        </div>
      </footer>
      <Analytics />
    </div>
  );
};

export default App;