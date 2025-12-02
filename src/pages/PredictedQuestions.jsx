import React, { useState, useMemo, useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext";
import { topicNames, getTopicName } from "../topicNames";
import Select from "react-select";

const PredictedQuestions = ({ predictedQuestions, unitNames, questionTypes, getTopicName: getTopicNameProp, onToggleFavorite, favorites }) => {
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const { isDark } = useTheme();

  // Filter options
  const options = useMemo(() => ({
    book: [...new Set(predictedQuestions.map(q => q.book))].sort((a, b) => a - b),
    unit: [...new Set(predictedQuestions.map(q => q.unit))].sort((a, b) => a - b),
    types: [...new Set(predictedQuestions.flatMap(q => q.types))].sort((a, b) => a - b),
  }), [predictedQuestions]);

  // Keyboard shortcuts for main component
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      switch(e.key) {
        case '?':
          e.preventDefault();
          setShowShortcutsHelp(prev => !prev);
          break;
        case 'Escape':
          setShowShortcutsHelp(false);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Get available topics based on selected book and unit
  const getAvailableTopics = () => {
    const selectedBook = selectedFilters.book?.[0];
    const selectedUnit = selectedFilters.unit?.[0];
    
    if (selectedBook && selectedUnit && topicNames[selectedBook] && topicNames[selectedBook][selectedUnit]) {
      return Object.keys(topicNames[selectedBook][selectedUnit]).map(topicId => ({
        value: topicId,
        label: `${topicId} - ${topicNames[selectedBook][selectedUnit][topicId]}`
      }));
    }
    
    return [];
  };

  // Format options for react-select
  const formattedOptions = useMemo(() => ({
    book: options.book.map(book => ({
      value: book,
      label: `Book ${book}`
    })),
    unit: options.unit.map(unit => ({
      value: unit,
      label: `${unitNames[unit]}`
    })),
    topic: getAvailableTopics(),
    types: options.types.map(type => ({
      value: type,
      label: questionTypes[type] || `Type ${type}`
    }))
  }), [options, unitNames, questionTypes, selectedFilters.book, selectedFilters.unit]);

  // Filtered questions
  const filteredQuestions = useMemo(() => {
    return predictedQuestions.filter(q => {
      return Object.entries(selectedFilters).every(([field, values]) => {
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
        
        return values.map(v => String(v)).includes(String(q[field]));
      });
    });
  }, [predictedQuestions, selectedFilters]);

  const handleFilterChange = (field, selectedOptions) => {
    const values = selectedOptions ? selectedOptions.map(option => option.value) : [];
    
    // Reset topic filter when book or unit changes
    if (field === 'book' || field === 'unit') {
      setSelectedFilters(prev => ({
        ...prev,
        [field]: values,
        topic: []
      }));
    } else {
      setSelectedFilters(prev => ({
        ...prev,
        [field]: values
      }));
    }
  };

  const clearAllFilters = () => {
    setSelectedFilters({});
  };

  // Custom styles for react-select to match dark/light theme
  const customStyles = {
    menu: (provided) => ({ 
      ...provided, 
      zIndex: 9999,
      borderRadius: '8px',
      boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      border: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
      backgroundColor: isDark ? '#1f2937' : '#ffffff',
    }),
    control: (provided, state) => ({ 
      ...provided, 
      minHeight: '44px',
      borderRadius: '8px',
      borderColor: state.isFocused 
        ? '#3b82f6' 
        : isDark ? '#4b5563' : '#d1d5db',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
      backgroundColor: state.isFocused 
        ? isDark ? '#374151' : '#f8fafc'
        : isDark ? '#1f2937' : '#ffffff',
      '&:hover': {
        borderColor: state.isFocused ? '#3b82f6' : isDark ? '#6b7280' : '#9ca3af'
      }
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: isDark ? '#3730a3' : '#e0e7ff',
      borderRadius: '6px',
      padding: '2px 6px',
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: isDark ? '#e0e7ff' : '#3730a3',
      fontWeight: '600',
      fontSize: '0.875rem',
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: isDark ? '#e0e7ff' : '#3730a3',
      '&:hover': {
        backgroundColor: isDark ? '#4f46e5' : '#3730a3',
        color: 'white',
      },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? '#3b82f6'
        : state.isFocused
        ? isDark ? '#374151' : '#f3f4f6'
        : isDark ? '#1f2937' : '#ffffff',
      color: state.isSelected
        ? 'white'
        : isDark ? '#f9fafb' : '#1f2937',
      '&:active': {
        backgroundColor: isDark ? '#4b5563' : '#e5e7eb',
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: isDark ? '#f9fafb' : '#1f2937',
    }),
    input: (provided) => ({
      ...provided,
      color: isDark ? '#f9fafb' : '#1f2937',
    }),
    placeholder: (provided) => ({
      ...provided,
      color: isDark ? '#9ca3af' : '#6b7280',
    }),
  };

  // Get current values for react-select
  const getCurrentValues = (field) => {
    if (field === 'topic') {
      const availableTopics = getAvailableTopics();
      return selectedFilters.topic?.map(topicId => {
        const topicOption = availableTopics.find(topic => topic.value === topicId);
        return topicOption || { value: topicId, label: `Topic ${topicId}` };
      }) || [];
    }
    
    return selectedFilters[field]?.map(value => {
      const option = formattedOptions[field].find(opt => opt.value === value);
      return option || { value, label: String(value) };
    }) || [];
  };

  // Keyboard Shortcuts Help Modal
  const ShortcutsHelpModal = () => {
    if (!showShortcutsHelp) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className={`rounded-xl shadow-2xl max-w-md w-full p-6 ${
          isDark ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Keyboard Shortcuts</h3>
            <button
              onClick={() => setShowShortcutsHelp(false)}
              className={`transition-colors ${
                isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Navigate Previous</span>
              <kbd className={`px-2 py-1 text-xs font-mono rounded shadow-sm ${
                isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'
              }`}>←</kbd>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Navigate Next</span>
              <kbd className={`px-2 py-1 text-xs font-mono rounded shadow-sm ${
                isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'
              }`}>→</kbd>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Toggle Question/Answer</span>
              <kbd className={`px-2 py-1 text-xs font-mono rounded shadow-sm ${
                isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'
              }`}>Space</kbd>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Toggle Favorite</span>
              <kbd className={`px-2 py-1 text-xs font-mono rounded shadow-sm ${
                isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'
              }`}>F</kbd>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Show this help</span>
              <kbd className={`px-2 py-1 text-xs font-mono rounded shadow-sm ${
                isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'
              }`}>?</kbd>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className={`text-xs text-center ${
              isDark ? 'text-gray-500' : 'text-gray-500'
            }`}>
              Press <kbd className={`px-1 text-xs rounded ${
                isDark ? 'bg-gray-700' : 'bg-gray-100'
              }`}>ESC</kbd> to close
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Question List Component with Pagination (similar to main QuestionList)
  const QuestionList = ({ questions, selectedQuestionId, setSelectedQuestionId, unitNames, getTopicName, favorites, toggleFavorite }) => {
    const containerRef = useRef(null);
    const itemRefs = useRef({});
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [showFavorites, setShowFavorites] = useState(false);
    const questionsPerPage = 10;

    // Reset to page 1 when questions change significantly
    useEffect(() => {
      setCurrentPage(1);
    }, [questions.length, showFavorites]);

    // Get questions to display (all or favorites)
    const questionsToDisplay = showFavorites 
      ? questions.filter(q => favorites.includes(q.id))
      : questions;

    // Calculate pagination
    const totalPages = Math.ceil(questionsToDisplay.length / questionsPerPage);
    const startIndex = (currentPage - 1) * questionsPerPage;
    const endIndex = startIndex + questionsPerPage;
    const currentQuestions = questionsToDisplay.slice(startIndex, endIndex);

    const goToNextPage = () => {
      if (currentPage < totalPages) {
        setCurrentPage(currentPage + 1);
      }
    };

    const goToPrevPage = () => {
      if (currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    };

    return (
      <div className={`rounded-xl shadow-lg border-2 h-full overflow-hidden flex flex-col transition-colors duration-300 ${
        isDark ? 'bg-gray-800 border-pink-600' : 'bg-white border-pink-200'
      }`}>
        {/* Header */}
        <div className={`p-3 lg:p-5 border-b rounded-t-xl transition-colors duration-300 ${
          isDark 
            ? 'border-pink-700 bg-gradient-to-r from-pink-900 to-rose-900/30' 
            : 'border-pink-200 bg-gradient-to-r from-pink-50 to-rose-50/30'
        }`}>
          <div className="flex items-center justify-between mb-2 lg:mb-3">
            <div>
              <h3 className="font-bold text-base lg:text-lg">Predicted Questions</h3>
              <p className={`text-xs lg:text-sm mt-1 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Page {currentPage} of {totalPages} • {questionsToDisplay.length} {showFavorites ? 'favorites' : 'total'}
              </p>
            </div>
            <div className={`bg-gradient-to-r px-2 py-1 rounded-full text-xs font-semibold shadow-sm ${
              isDark 
                ? 'from-pink-800 to-pink-900 text-pink-200' 
                : 'from-pink-100 to-pink-200 text-pink-800'
            }`}>
              {questionsToDisplay.length}
            </div>
          </div>
          
          {/* Favorites Toggle */}
          <button
            onClick={() => setShowFavorites(!showFavorites)}
            className={`w-full px-3 py-2 text-xs lg:text-sm font-medium rounded-lg transition-all duration-200 shadow-sm border min-h-[36px] lg:min-h-[44px] ${
              showFavorites
                ? isDark
                  ? "bg-yellow-900 text-yellow-200 border-yellow-700"
                  : "bg-yellow-100 text-yellow-700 border-yellow-300"
                : isDark
                  ? "bg-gray-700 text-gray-200 border-gray-600 hover:bg-gray-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            {showFavorites ? `★ Showing Favorites (${favorites.length})` : "☆ Show Favorites"}
          </button>
        </div>
        
        {/* List */}
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto p-1 lg:p-3"
          style={{
            WebkitOverflowScrolling: 'touch',
            touchAction: 'manipulation'
          }}
        >
          {currentQuestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 lg:py-12 px-4 lg:px-6 text-center">
              <div className={`w-12 h-12 lg:w-16 lg:h-16 rounded-2xl flex items-center justify-center mb-3 lg:mb-4 shadow-inner ${
                isDark ? 'bg-pink-900' : 'bg-gradient-to-br from-pink-100 to-rose-100'
              }`}>
                {showFavorites ? (
                  <svg className="w-6 h-6 lg:w-8 lg:h-8 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ) : (
                  <svg className={`w-6 h-6 lg:w-8 lg:h-8 ${isDark ? 'text-pink-400' : 'text-pink-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )}
              </div>
              <h4 className={`text-base lg:text-lg font-semibold mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-900'
              }`}>
                {showFavorites ? "No Favorite Questions" : "No Questions Found"}
              </h4>
              <p className={`text-xs lg:text-sm ${
                isDark ? 'text-gray-500' : 'text-gray-500'
              }`}>
                {showFavorites 
                  ? "Click the star icon on questions to add them to favorites" 
                  : "Try adjusting your filters to see more questions."}
              </p>
            </div>
          ) : (
            currentQuestions.map((q) => {
              const isSelected = Number(selectedQuestionId) === Number(q.id);
              const isFavorite = favorites.includes(q.id);
              return (
                <div
                  key={q.id}
                  ref={(el) => (itemRefs.current[q.id] = el)}
                  onClick={() => setSelectedQuestionId(q.id)}
                  className={`cursor-pointer p-2 lg:p-4 mb-2 rounded-xl transition-all duration-200 border-2 shadow-sm min-h-[70px] lg:min-h-[80px] flex items-center ${
                    isSelected 
                      ? isDark
                        ? "bg-gradient-to-r from-pink-900 to-rose-900 border-pink-700 shadow-md"
                        : "bg-gradient-to-r from-pink-50 to-rose-50 border-pink-300 shadow-md"
                      : isDark
                        ? "bg-gray-700 border-gray-600 hover:border-pink-700 hover:shadow-md"
                        : "bg-white border-gray-200 hover:border-pink-200 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-start justify-between w-full">
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs lg:text-sm leading-relaxed ${
                        isSelected 
                          ? isDark ? "text-pink-100" : "text-pink-800"
                          : isDark ? "text-gray-300" : "text-gray-800"
                      }`}>
                        <div className={`font-mono text-xs mb-1 ${
                          isDark ? "text-gray-500" : "text-gray-500"
                        }`}>
                          Book {q.book}
                        </div>
                        <div className="font-semibold truncate text-sm lg:text-base">
                          {unitNames[q.unit] || `Unit ${q.unit}`}
                        </div>
                        <div className={`text-xs mt-1 truncate ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`} style={{ fontFamily: 'Faruma, Arial' }}>
                          {getTopicName(q.book, q.unit, q.topic)}
                        </div>
                        <div className={`font-mono text-xs mt-1 ${
                          isDark ? "text-gray-500" : "text-gray-500"
                        }`}>
                          {q.types.map(type => questionTypes[type] || `Type ${type}`).join(', ')}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 lg:gap-2 ml-2 lg:ml-3 flex-shrink-0">
                      {isSelected && (
                        <div className={`w-2 h-2 lg:w-3 lg:h-3 rounded-full animate-pulse ${
                          isDark 
                            ? "bg-gradient-to-r from-pink-400 to-rose-400"
                            : "bg-gradient-to-r from-pink-500 to-rose-600"
                        }`}></div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(q.id);
                        }}
                        className={`p-1 rounded-full transition-colors ${
                          isFavorite 
                            ? "text-yellow-500 hover:text-yellow-400" 
                            : isDark 
                              ? "text-gray-500 hover:text-yellow-500" 
                              : "text-gray-400 hover:text-yellow-500"
                        }`}
                      >
                        <svg className="w-3 h-3 lg:w-4 lg:h-4" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className={`flex-shrink-0 p-2 lg:p-3 border-t transition-colors duration-300 ${
            isDark 
              ? 'border-pink-700 bg-gradient-to-r from-pink-900 to-rose-900/30' 
              : 'border-pink-200 bg-gradient-to-r from-pink-50 to-rose-50/30'
          }`}>
            <div className="flex items-center justify-between">
              <button
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className={`flex items-center gap-1 px-2 lg:px-3 py-1.5 lg:py-2 text-xs lg:text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed min-h-[36px] lg:min-h-[44px] ${
                  isDark
                    ? 'bg-gray-700 text-gray-200 border border-gray-600 hover:bg-gray-600'
                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <svg className="w-3 h-3 lg:w-4 lg:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden sm:inline">Previous</span>
              </button>
              
              <div className={`flex items-center gap-1 lg:gap-2 text-xs lg:text-sm ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <span className="font-semibold hidden sm:inline">Page</span>
                <span className={`border rounded px-1 lg:px-2 py-0.5 lg:py-1 font-mono text-xs ${
                  isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                }`}>
                  {currentPage}
                </span>
                <span className="font-semibold">of</span>
                <span className="font-mono text-xs lg:text-sm">{totalPages}</span>
              </div>

              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className={`flex items-center gap-1 px-2 lg:px-3 py-1.5 lg:py-2 text-xs lg:text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed min-h-[36px] lg:min-h-[44px] ${
                  isDark
                    ? 'bg-gray-700 text-gray-200 border border-gray-600 hover:bg-gray-600'
                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="hidden sm:inline">Next</span>
                <svg className="w-3 h-3 lg:w-4 lg:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Simple Question View component with keyboard shortcuts
  const QuestionView = ({ question, questions, setSelectedQuestionId, unitNames, questionTypes, getTopicName, onToggleFavorite, isFavorite }) => {
    const [showAnswer, setShowAnswer] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);
    const [showFavoriteFeedback, setShowFavoriteFeedback] = useState(false);

    // Reset states when question changes
    useEffect(() => {
      setShowAnswer(false);
      setImageLoading(true);
    }, [question]);

    // Keyboard shortcuts for question view
    useEffect(() => {
      const handleKeyPress = (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        const currentIndex = questions.findIndex(q => Number(q.id) === Number(question.id));
        
        switch(e.key) {
          case 'ArrowLeft':
            e.preventDefault();
            if (currentIndex > 0) {
              setSelectedQuestionId(questions[currentIndex - 1].id);
            }
            break;
          case 'ArrowRight':
            e.preventDefault();
            if (currentIndex < questions.length - 1) {
              setSelectedQuestionId(questions[currentIndex + 1].id);
            }
            break;
          case ' ':
          case 'Spacebar':
            e.preventDefault();
            setShowAnswer(prev => !prev);
            break;
          case 'f':
          case 'F':
            e.preventDefault();
            onToggleFavorite(question.id);
            setShowFavoriteFeedback(true);
            setTimeout(() => setShowFavoriteFeedback(false), 2000);
            break;
          default:
            break;
        }
      };

      if (question) {
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
      }
    }, [question, questions, setSelectedQuestionId, onToggleFavorite]);

    const handleImageLoad = () => {
      setImageLoading(false);
    };

    const handleImageError = () => {
      setImageLoading(false);
    };

    if (!question) {
      return (
        <div className={`rounded-xl shadow-lg border-2 h-full flex items-center justify-center ${
          isDark ? 'bg-gray-800 border-pink-600' : 'bg-white border-pink-200'
        }`}>
          <div className="text-center max-w-md px-4 lg:px-6">
            <div className={`w-12 h-12 lg:w-16 lg:h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 lg:mb-4 shadow-inner ${
              isDark ? 'bg-pink-900' : 'bg-gradient-to-br from-pink-100 to-rose-100'
            }`}>
              <svg className={`w-6 h-6 lg:w-8 lg:h-8 ${isDark ? 'text-pink-400' : 'text-pink-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg lg:text-xl font-bold mb-2">Select a Question</h3>
            <p className={`text-sm lg:text-base leading-relaxed ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Choose a predicted question from the list to view it here
            </p>
          </div>
        </div>
      );
    }

    const currentIndex = questions.findIndex(q => Number(q.id) === Number(question.id));
    const totalQuestions = questions.length;
    const isLastQuestion = currentIndex === totalQuestions - 1;
    const isFirstQuestion = currentIndex === 0;

    const goNext = () => {
      if (currentIndex < totalQuestions - 1) {
        setSelectedQuestionId(questions[currentIndex + 1].id);
      }
    };

    const goPrevious = () => {
      if (currentIndex > 0) {
        setSelectedQuestionId(questions[currentIndex - 1].id);
      }
    };

    const handleFavorite = () => {
      onToggleFavorite(question.id);
      setShowFavoriteFeedback(true);
      setTimeout(() => setShowFavoriteFeedback(false), 2000);
    };

    return (
      <div className={`rounded-xl shadow-lg border-2 h-full flex flex-col min-h-0 ${
        isDark ? 'bg-gray-800 border-pink-600' : 'bg-white border-pink-200'
      }`}>
        {/* Favorite Feedback Toast */}
        {showFavoriteFeedback && (
          <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
            <div className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg border ${
              isFavorite 
                ? isDark
                  ? "bg-yellow-900 border-yellow-700 text-yellow-200"
                  : "bg-yellow-50 border-yellow-200 text-yellow-800"
                : isDark
                  ? "bg-pink-900 border-pink-700 text-pink-200"
                  : "bg-pink-50 border-pink-200 text-pink-800"
            }`}>
              <svg className={`w-5 h-5 ${isFavorite ? "text-yellow-500" : "text-pink-500"}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              <span className="font-medium text-sm">
                {isFavorite ? "Added to favorites!" : "Removed from favorites!"}
              </span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className={`flex-shrink-0 p-3 lg:p-6 border-b rounded-t-xl ${
          isDark 
            ? 'border-pink-700 bg-gradient-to-r from-pink-900 to-rose-900/30' 
            : 'border-pink-200 bg-gradient-to-r from-pink-50 to-rose-50/30'
        }`}>
          <div className="flex flex-col gap-3 lg:gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2 lg:gap-3">
                <div className={`p-1 lg:p-2 rounded-lg shadow-sm ${
                  isDark ? 'bg-pink-800' : 'bg-pink-100'
                }`}>
                  <svg className={`w-4 h-4 lg:w-5 lg:h-5 ${isDark ? 'text-pink-400' : 'text-pink-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg lg:text-2xl font-bold">
                    {showAnswer ? "Answer" : "Question"} (Predicted)
                  </h2>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 lg:gap-2 mt-1">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full shadow-sm border ${
                      isDark 
                        ? 'bg-pink-800 text-pink-200 border-pink-700' 
                        : 'bg-pink-100 text-pink-800 border-pink-200'
                    }`}>
                      {currentIndex + 1} of {totalQuestions}
                    </span>
                    {isFavorite && (
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full shadow-sm border flex items-center gap-1 ${
                        isDark 
                          ? 'bg-yellow-900 text-yellow-200 border-yellow-700' 
                          : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                      }`}>
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                        <span className="hidden sm:inline">Favorite</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Mobile-first responsive buttons */}
              <div className="flex flex-wrap gap-1 lg:gap-2 justify-center sm:justify-start">
                <button
                  className={`px-2 py-1 lg:px-3 lg:py-2 text-xs lg:text-sm font-medium rounded-lg transition-all min-h-[36px] lg:min-h-[44px] ${
                    isFirstQuestion 
                      ? isDark
                        ? "bg-gray-700 text-gray-400 border-gray-600 cursor-not-allowed"
                        : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed" 
                      : isDark
                        ? "bg-gray-700 text-gray-200 border-gray-600 hover:bg-gray-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                  onClick={goPrevious}
                  disabled={isFirstQuestion}
                >
                  <span className="hidden sm:inline">← Previous</span>
                  <span className="sm:hidden">←</span>
                </button>
                
                <button
                  className={`px-2 py-1 lg:px-3 lg:py-2 text-xs lg:text-sm font-medium rounded-lg transition-all min-h-[36px] lg:min-h-[44px] ${
                    showAnswer
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : isDark
                        ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                  onClick={() => setShowAnswer(!showAnswer)}
                >
                  <span className="hidden sm:inline">{showAnswer ? "Show Question" : "Show Answer"}</span>
                  <span className="sm:hidden">{showAnswer ? "Question" : "Answer"}</span>
                </button>

                <button
                  className={`px-2 py-1 lg:px-3 lg:py-2 text-xs lg:text-sm font-medium rounded-lg transition-all min-h-[36px] lg:min-h-[44px] ${
                    isLastQuestion 
                      ? isDark
                        ? "bg-gray-700 text-gray-400 border-gray-600 cursor-not-allowed"
                        : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed" 
                      : isDark
                        ? "bg-gray-700 text-gray-200 border-gray-600 hover:bg-gray-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                  onClick={goNext}
                  disabled={isLastQuestion}
                >
                  <span className="hidden sm:inline">Next →</span>
                  <span className="sm:hidden">→</span>
                </button>

                <button
                  onClick={handleFavorite}
                  className={`px-2 py-1 lg:px-3 lg:py-2 text-xs lg:text-sm font-medium rounded-lg transition-all flex items-center gap-1 lg:gap-2 min-h-[36px] lg:min-h-[44px] ${
                    isFavorite
                      ? isDark
                        ? "bg-yellow-900 text-yellow-200 hover:bg-yellow-800"
                        : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                      : isDark
                        ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  <svg className="w-3 h-3 lg:w-4 lg:h-4" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  <span className="hidden sm:inline">Favorite</span>
                </button>
              </div>
            </div>

            {/* Question Info - Mobile responsive */}
            <div className={`flex flex-wrap items-center gap-1 lg:gap-3 p-2 lg:p-3 rounded-lg ${
              isDark ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <div className={`flex items-center gap-1 lg:gap-2 px-2 py-1 text-xs lg:text-sm rounded-full ${
                isDark ? 'bg-pink-900' : 'bg-pink-50'
              }`}>
                <span className={`font-semibold ${isDark ? 'text-pink-300' : 'text-pink-700'}`}>Book:</span>
                <span className={isDark ? 'text-pink-100' : 'text-pink-900'}>Book {question.book}</span>
              </div>
              <div className={`flex items-center gap-1 lg:gap-2 px-2 py-1 text-xs lg:text-sm rounded-full ${
                isDark ? 'bg-blue-900' : 'bg-blue-50'
              }`}>
                <span className={`font-semibold ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>Unit:</span>
                <span className={isDark ? 'text-blue-100' : 'text-blue-900'}>{unitNames[question.unit]}</span>
              </div>
              <div className={`flex items-center gap-1 lg:gap-2 px-2 py-1 text-xs lg:text-sm rounded-full ${
                isDark ? 'bg-green-900' : 'bg-green-50'
              }`}>
                <span className={`font-semibold ${isDark ? 'text-green-300' : 'text-green-700'}`}>Topic:</span>
                <span 
                  className={isDark ? 'text-green-100' : 'text-green-900'}
                  style={{ fontFamily: 'Faruma, Arial' }}
                >
                  {getTopicName(question.book, question.unit, question.topic)}
                </span>
              </div>
              <div className={`flex items-center gap-1 lg:gap-2 px-2 py-1 text-xs lg:text-sm rounded-full ${
                isDark ? 'bg-yellow-900' : 'bg-yellow-50'
              }`}>
                <span className={`font-semibold ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>Type:</span>
                <span className={isDark ? 'text-yellow-100' : 'text-yellow-900'}>
                  {question.types.map(type => questionTypes[type]).join(', ')}
                </span>
              </div>
            </div>

            {/* Keyboard Shortcuts Hint */}
            <div className={`text-xs text-center ${
              isDark ? 'text-gray-500' : 'text-gray-500'
            }`}>
              <span className="font-semibold">Tip:</span> Use <kbd className={`px-1 mx-1 text-xs rounded shadow-sm ${
                isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'
              }`}>←</kbd> <kbd className={`px-1 mx-1 text-xs rounded shadow-sm ${
                isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'
              }`}>→</kbd> to navigate, <kbd className={`px-1 mx-1 text-xs rounded shadow-sm ${
                isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'
              }`}>Space</kbd> to toggle, <kbd className={`px-1 mx-1 text-xs rounded shadow-sm ${
                isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'
              }`}>F</kbd> to favorite
            </div>
          </div>
        </div>

        {/* Question Image - Mobile optimized */}
        <div className="flex-1 min-h-0 flex flex-col">
          <div className={`flex-1 min-h-0 p-2 lg:p-4 ${
            isDark 
              ? 'bg-gradient-to-br from-gray-800/50 to-pink-900/30' 
              : 'bg-gradient-to-br from-gray-50/50 to-pink-50/30'
          }`}>
            <div className="h-full flex flex-col min-h-0">
              {/* Image Container - Full height with top alignment */}
              <div className={`flex-1 rounded-xl border-2 shadow-xl overflow-hidden min-h-0 ${
                isDark ? 'bg-gray-700 border-pink-700' : 'bg-white border-pink-300'
              }`}>
                <div 
                  className="h-full overflow-y-auto p-2 lg:p-4 xl:p-6"
                  style={{ 
                    WebkitOverflowScrolling: 'touch',
                    touchAction: 'manipulation'
                  }}
                >
                  {/* Image positioned at top */}
                  <div className="flex justify-center items-start">
                    <div className={`rounded-lg shadow-lg p-1 lg:p-2 border relative max-w-full ${
                      isDark ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-200'
                    }`}>
                      {/* Loading Spinner */}
                      {imageLoading && (
                        <div className={`absolute inset-0 flex items-center justify-center rounded-lg z-10 ${
                          isDark ? 'bg-gray-600 bg-opacity-80' : 'bg-white bg-opacity-80'
                        }`}>
                          <div className="flex flex-col items-center gap-3">
                            <div className={`animate-spin rounded-full h-8 w-8 lg:h-12 lg:w-12 border-b-2 ${
                              isDark ? 'border-pink-400' : 'border-pink-600'
                            }`}></div>
                            <p className={isDark ? 'text-gray-300 text-sm' : 'text-gray-600 text-sm'}>Loading image...</p>
                          </div>
                        </div>
                      )}
                      
                      <img
                        src={showAnswer ? question.answerImage : question.image}
                        alt={showAnswer ? `Answer` : `Question`}
                        className="max-w-full h-auto rounded shadow-md transition-opacity duration-300"
                        style={{ 
                          opacity: imageLoading ? 0 : 1,
                          WebkitTouchCallout: 'none',
                          WebkitUserSelect: 'none',
                          userSelect: 'none'
                        }}
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Mobile zoom hint */}
              <div className={`text-xs text-center mt-2 lg:mt-4 ${
                isDark ? 'text-gray-500' : 'text-gray-500'
              }`}>
                <span className="hidden sm:inline">Tip: Pinch to zoom or double-tap to enlarge the image</span>
                <span className="sm:hidden">Pinch to zoom or double-tap</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className={`rounded-xl shadow-lg border-2 p-3 lg:p-6 mb-3 lg:mb-6 ${
        isDark ? 'bg-gray-800 border-pink-600' : 'bg-white border-pink-200'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-4">
          <div>
            <h2 className={`text-lg lg:text-2xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>Predicted Questions</h2>
            <p className={`text-sm lg:text-lg mt-1 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Questions from your teacher - likely to appear in future exams
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowShortcutsHelp(true)}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                isDark
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              title="Keyboard shortcuts (?)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
            <div className={`px-3 py-1 lg:px-4 lg:py-2 text-xs lg:text-sm font-semibold rounded-lg ${
              isDark ? 'bg-pink-900 text-pink-200' : 'bg-pink-100 text-pink-800'
            }`}>
              {predictedQuestions.length} Total Questions
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`rounded-xl shadow-lg border-2 p-3 lg:p-6 mb-3 lg:mb-6 ${
        isDark ? 'bg-gray-800 border-pink-600' : 'bg-white border-pink-200'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-4 mb-3 lg:mb-4">
          <div>
            <h3 className={`text-base lg:text-lg font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>Filter Questions</h3>
            <p className={`text-xs lg:text-sm mt-1 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Select multiple options from each filter
            </p>
          </div>
          
          <div className="flex gap-2 lg:gap-3">
            <button
              onClick={clearAllFilters}
              className={`px-3 py-1 lg:px-4 lg:py-2 text-xs lg:text-sm font-medium rounded-lg transition-all ${
                isDark
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Clear All
            </button>
            <div className={`px-3 py-1 lg:px-4 lg:py-2 text-xs lg:text-sm font-semibold rounded-lg ${
              isDark ? 'bg-pink-900 text-pink-200' : 'bg-pink-100 text-pink-800'
            }`}>
              {filteredQuestions.length} Questions
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {/* Book Filter */}
          <div>
            <label className={`block text-xs lg:text-sm font-semibold mb-1 lg:mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-800'
            }`}>
              Book
            </label>
            <Select
              options={formattedOptions.book}
              isMulti
              placeholder="All Books"
              value={getCurrentValues('book')}
              onChange={(selected) => handleFilterChange('book', selected)}
              styles={customStyles}
              className="text-xs lg:text-sm"
            />
          </div>

          {/* Unit Filter */}
          <div>
            <label className={`block text-xs lg:text-sm font-semibold mb-1 lg:mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-800'
            }`}>
              Unit
            </label>
            <Select
              options={formattedOptions.unit}
              isMulti
              placeholder="All Units"
              value={getCurrentValues('unit')}
              onChange={(selected) => handleFilterChange('unit', selected)}
              styles={customStyles}
              className="text-xs lg:text-sm"
            />
          </div>

          {/* Topic Filter */}
          <div>
            <label className={`block text-xs lg:text-sm font-semibold mb-1 lg:mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-800'
            }`}>
              Topic
            </label>
            <Select
              options={formattedOptions.topic}
              isMulti
              placeholder={!selectedFilters.book?.length || !selectedFilters.unit?.length ? "Select book & unit first" : "All Topics"}
              value={getCurrentValues('topic')}
              onChange={(selected) => handleFilterChange('topic', selected)}
              styles={customStyles}
              className="text-xs lg:text-sm"
              isDisabled={!selectedFilters.book?.length || !selectedFilters.unit?.length}
            />
          </div>

          {/* Question Type Filter */}
          <div>
            <label className={`block text-xs lg:text-sm font-semibold mb-1 lg:mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-800'
            }`}>
              Question Type
            </label>
            <Select
              options={formattedOptions.types}
              isMulti
              placeholder="All Types"
              value={getCurrentValues('types')}
              onChange={(selected) => handleFilterChange('types', selected)}
              styles={customStyles}
              className="text-xs lg:text-sm"
            />
          </div>
        </div>

        {/* Active Filters Display */}
        {Object.values(selectedFilters).some(arr => arr.length > 0) && (
          <div className="mt-3 lg:mt-4 flex flex-wrap gap-1 lg:gap-2">
            {selectedFilters.book?.map(book => (
              <span key={book} className={`px-2 py-1 text-xs rounded-full ${
                isDark ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
              }`}>
                Book {book}
              </span>
            ))}
            {selectedFilters.unit?.map(unit => (
              <span key={unit} className={`px-2 py-1 text-xs rounded-full ${
                isDark ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
              }`}>
                {unitNames[unit]}
              </span>
            ))}
            {selectedFilters.topic?.map(topic => {
              const selectedBook = selectedFilters.book?.[0];
              const selectedUnit = selectedFilters.unit?.[0];
              const topicName = selectedBook && selectedUnit ? getTopicName(selectedBook, selectedUnit, topic) : `Topic ${topic}`;
              
              return (
                <span key={topic} className={`px-2 py-1 text-xs rounded-full ${
                  isDark ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800'
                }`}>
                  {topicName}
                </span>
              );
            })}
            {selectedFilters.types?.map(type => (
              <span key={type} className={`px-2 py-1 text-xs rounded-full ${
                isDark ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {questionTypes[type]}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Two-column layout for list and view - Mobile optimized */}
      <div className="flex flex-col lg:flex-row gap-2 lg:gap-6 flex-1 min-h-0">
        {/* Left: Question List */}
        <div className="w-full lg:w-96 xl:w-80 2xl:w-96 flex-shrink-0 flex flex-col min-h-0 mb-2 lg:mb-0">
          <QuestionList
            questions={filteredQuestions}
            selectedQuestionId={selectedQuestionId}
            setSelectedQuestionId={setSelectedQuestionId}
            unitNames={unitNames}
            getTopicName={getTopicNameProp}
            favorites={favorites}
            toggleFavorite={onToggleFavorite}
          />
        </div>
        
        {/* Right: Question View */}
        <div className="flex-1 min-w-0 flex flex-col min-h-0">
          <QuestionView
            question={filteredQuestions.find(q => q.id === selectedQuestionId)}
            questions={filteredQuestions}
            setSelectedQuestionId={setSelectedQuestionId}
            unitNames={unitNames}
            questionTypes={questionTypes}
            getTopicName={getTopicNameProp}
            onToggleFavorite={onToggleFavorite}
            isFavorite={selectedQuestionId ? favorites.includes(selectedQuestionId) : false}
          />
        </div>
      </div>

      {/* Keyboard Shortcuts Help Modal */}
      <ShortcutsHelpModal />
    </div>
  );
};

export default PredictedQuestions;