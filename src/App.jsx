import React, { useState, useMemo } from "react";
import allQuestions from "./questionsData";
import predictedQuestions from "./predictedQuestionsData";
import Filters from "./components/Filters";
import QuestionList from "./components/QuestionList";
import QuestionView from "./pages/QuestionView";
import UnseenTopics from "./pages/UnseenTopics";
import QuizGenerator from "./pages/QuizGenerator";
import BookViewer from "./pages/BookViewer";
import PredictedQuestions from "./pages/PredictedQuestions";
import { topicNames, getTopicName } from "./topicNames";
import { useTheme } from "./context/ThemeContext";

const App = () => {
  const [selectedFilters, setSelectedFilters] = useState({});
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [favorites, setFavorites] = useState(() => 
    JSON.parse(localStorage.getItem('favoriteQuestions') || '[]')
  );
  const [currentView, setCurrentView] = useState('main');
  const { isDark, toggleTheme } = useTheme();

  // Unit name mapping
  const unitNames = {
    1: "Aqeedha",
    2: "Khadhees", 
    3: "Fiqh",
    4: "Thaareekh",
    5: "Saqaafa",
    6: "Akhlaaq"
  };

  // Question type mapping
  const questionTypes = {
    1: "Thaaraf",
    2: "Dheyha",
    3: "Haadhisaa", 
    4: "Gina Marks",
    5: "Mauloomaathu",
    6: "Dhiraasaa",
    7: "Beynun Kurun"
  };

  // Toggle favorite function
  const toggleFavorite = (questionId) => {
    const newFavorites = favorites.includes(questionId)
      ? favorites.filter(id => id !== questionId)
      : [...favorites, questionId];
    setFavorites(newFavorites);
    localStorage.setItem('favoriteQuestions', JSON.stringify(newFavorites));
  };

  // Only use past papers for main view
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

  const renderMainView = () => (
    <>
      <Filters
        options={options}
        selectedFilters={selectedFilters}
        setSelectedFilters={setSelectedFilters}
        onSearch={() => setSelectedQuestionId(null)}
        unitNames={unitNames}
        questionTypes={questionTypes}
        topicNames={topicNames}
      />
      
      <div className="flex flex-col lg:flex-row gap-3 lg:gap-6 mt-3 lg:mt-6 flex-1 min-h-0">
        <div className="w-full lg:w-96 xl:w-80 2xl:w-96 flex-shrink-0 flex flex-col min-h-0">
          <QuestionList
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
          <QuestionView
            question={filteredQuestions.find(q => q.id === selectedQuestionId)}
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
  );

  const renderCurrentView = () => {
    switch(currentView) {
      case 'quiz':
        return <QuizGenerator 
          allQuestions={allQuestions} 
          unitNames={unitNames}
          questionTypes={questionTypes}
          setSelectedQuestionId={setSelectedQuestionId}
          setCurrentView={setCurrentView}
        />;
      case 'unseen-topics':
        return <UnseenTopics allQuestions={allQuestions} unitNames={unitNames} />;
      case 'books':
        return <BookViewer />;
      case 'predicted':
        return <PredictedQuestions 
          predictedQuestions={predictedQuestions}
          unitNames={unitNames}
          questionTypes={questionTypes}
          getTopicName={getTopicName}
          onToggleFavorite={toggleFavorite}
          favorites={favorites}
        />;
      default:
        return renderMainView();
    }
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-white' 
        : 'bg-gradient-to-br from-slate-50 to-blue-50/30 text-gray-900'
    }`}>
      {/* Header */}
      <header className={`border-b shadow-sm transition-colors duration-300 ${
        isDark 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-blue-200/50'
      }`}>
        <div className="px-4 lg:px-8 py-3 lg:py-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-xl lg:text-2xl font-bold">SSC ISLAM</h1>
                <p className={`text-xs lg:text-sm mt-0.5 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Topical Past Papers
                </p>
              </div>
              
              {/* Updated Navigation Container with Horizontal Scroll for Mobile */}
              <div className={`flex overflow-x-auto rounded-lg p-1 ${
                isDark ? 'bg-gray-700' : 'bg-gray-100'
              }`} style={{ 
                scrollbarWidth: 'thin',
                WebkitOverflowScrolling: 'touch'
              }}>
                <button
                  onClick={() => setCurrentView('main')}
                  className={`flex-shrink-0 px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-medium rounded-md transition-all duration-200 whitespace-nowrap ${
                    currentView === 'main'
                      ? isDark
                        ? "bg-gray-600 text-white shadow-sm"
                        : "bg-white text-blue-600 shadow-sm"
                      : isDark
                        ? "text-gray-400 hover:text-gray-200"
                        : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  📚 Questions
                </button>
                <button
                  onClick={() => setCurrentView('quiz')}
                  className={`flex-shrink-0 px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-medium rounded-md transition-all duration-200 whitespace-nowrap ${
                    currentView === 'quiz'
                      ? isDark
                        ? "bg-gray-600 text-white shadow-sm"
                        : "bg-white text-green-600 shadow-sm"
                      : isDark
                        ? "text-gray-400 hover:text-gray-200"
                        : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  🎯 Quiz
                </button>
                <button
                  onClick={() => setCurrentView('books')}
                  className={`flex-shrink-0 px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-medium rounded-md transition-all duration-200 whitespace-nowrap ${
                    currentView === 'books'
                      ? isDark
                        ? "bg-gray-600 text-white shadow-sm"
                        : "bg-white text-purple-600 shadow-sm"
                      : isDark
                        ? "text-gray-400 hover:text-gray-200"
                        : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  📖 Books
                </button>
                <button
                  onClick={() => setCurrentView('predicted')}
                  className={`flex-shrink-0 px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-medium rounded-md transition-all duration-200 whitespace-nowrap ${
                    currentView === 'predicted'
                      ? isDark
                        ? "bg-gray-600 text-white shadow-sm"
                        : "bg-white text-pink-600 shadow-sm"
                      : isDark
                        ? "text-gray-400 hover:text-gray-200"
                        : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  🔮 Predicted
                </button>
                <button
                  onClick={() => setCurrentView('unseen-topics')}
                  className={`flex-shrink-0 px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-medium rounded-md transition-all duration-200 whitespace-nowrap ${
                    currentView === 'unseen-topics'
                      ? isDark
                        ? "bg-gray-600 text-white shadow-sm"
                        : "bg-white text-orange-600 shadow-sm"
                      : isDark
                        ? "text-gray-400 hover:text-gray-200"
                        : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span className="sm:hidden">🔍 Unseen</span>
                  <span className="hidden sm:inline">🔍 Unseen Topics</span>
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-left sm:text-right">
                {currentView === 'main' ? (
                  <>
                    <div className={`text-lg lg:text-xl font-bold ${
                      isDark ? 'text-blue-400' : 'text-blue-600'
                    }`}>
                      {filteredQuestions.length}
                    </div>
                    <div className={`text-xs ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      question{filteredQuestions.length !== 1 ? 's' : ''} found
                    </div>
                  </>
                ) : currentView === 'quiz' ? (
                  <div className={`font-semibold text-sm ${
                    isDark ? 'text-green-400' : 'text-green-600'
                  }`}>
                    Practice Mode
                  </div>
                ) : currentView === 'books' ? (
                  <div className={`font-semibold text-sm ${
                    isDark ? 'text-purple-400' : 'text-purple-600'
                  }`}>
                    Textbook Viewer
                  </div>
                ) : currentView === 'predicted' ? (
                  <div className={`font-semibold text-sm ${
                    isDark ? 'text-pink-400' : 'text-pink-600'
                  }`}>
                    Teacher's Predictions
                  </div>
                ) : (
                  <div className={`font-semibold text-sm ${
                    isDark ? 'text-orange-400' : 'text-orange-600'
                  }`}>
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
              2025 © islam-topicals.vercel.app
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
    </div>
  );
};

export default App;