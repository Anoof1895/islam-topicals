import React, { useState, useMemo } from "react";
import allQuestions from "./questionsData";
import Filters from "./components/Filters";
import QuestionList from "./components/QuestionList";
import QuestionView from "./pages/QuestionView";
import UnseenTopics from "./pages/UnseenTopics";
import { topicNames, getTopicName } from "./topicNames";

const App = () => {
  const [selectedFilters, setSelectedFilters] = useState({});
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [favorites, setFavorites] = useState(() => 
    JSON.parse(localStorage.getItem('favoriteQuestions') || '[]')
  );
  const [currentView, setCurrentView] = useState('main'); // 'main' or 'unseen-topics'

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
    6: "Dhiraasaa"
  };

  // Toggle favorite function
  const toggleFavorite = (questionId) => {
    const newFavorites = favorites.includes(questionId)
      ? favorites.filter(id => id !== questionId)
      : [...favorites, questionId];
    setFavorites(newFavorites);
    localStorage.setItem('favoriteQuestions', JSON.stringify(newFavorites));
  };

  const options = useMemo(() => ({
    book: [...new Set(allQuestions.map(q => q.book))].sort((a, b) => a - b),
    year: [...new Set(allQuestions.map(q => q.year))].sort((a, b) => b - a), // Most recent first
    paper: [...new Set(allQuestions.map(q => q.paper))].sort((a, b) => a - b),
    unit: [...new Set(allQuestions.map(q => q.unit))].sort((a, b) => a - b), // Fixed - now in order
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
          return values.some(selectedType => q.types.includes(selectedType));
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
        <div className="w-full lg:w-96 flex-shrink-0 flex flex-col min-h-0">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex flex-col">
      {/* Header - Updated with navigation */}
      <header className="bg-white border-b border-blue-200/50 shadow-sm">
        <div className="px-4 lg:px-8 py-3 lg:py-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">SSC ISLAM</h1>
                <p className="text-gray-600 text-xs lg:text-sm mt-0.5">Topical Past Papers</p>
              </div>
              
              {/* Navigation Tabs */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setCurrentView('main')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    currentView === 'main'
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  📚 Questions
                </button>
                <button
                  onClick={() => setCurrentView('unseen-topics')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    currentView === 'unseen-topics'
                      ? "bg-white text-orange-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  🔍 Unseen Topics
                </button>
              </div>
            </div>
            
            <div className="text-left sm:text-right">
              {currentView === 'main' ? (
                <>
                  <div className="text-lg lg:text-xl font-bold text-blue-600">{filteredQuestions.length}</div>
                  <div className="text-xs text-gray-500">
                    question{filteredQuestions.length !== 1 ? 's' : ''} found
                  </div>
                </>
              ) : (
                <div className="text-orange-600 font-semibold text-sm">
                  Study Focus Areas
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-3 lg:p-6 flex flex-col min-h-0">
        {currentView === 'main' ? renderMainView() : <UnseenTopics allQuestions={allQuestions} unitNames={unitNames} />}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-blue-200/50 py-4 mt-8">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3">
            <div className="text-gray-600 text-sm">
              2025 © islam-topicals.vercel.app
            </div>
            <div className="text-gray-500 text-xs md:text-sm">
              Made with ❤️ by <span className="font-semibold text-gray-700">bakari-koshi</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;