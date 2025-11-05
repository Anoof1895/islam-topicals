import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "../context/ThemeContext";

const QuestionList = ({ questions, selectedQuestionId, setSelectedQuestionId, unitNames, getTopicName, favorites, toggleFavorite }) => {
  const containerRef = useRef(null);
  const itemRefs = useRef({});
  const { isDark } = useTheme();
  
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

  const getQuestionDisplayText = (q) => {
    const unitName = unitNames[q.unit] || `Unit ${q.unit}`;
    const topicName = getTopicName(q.book, q.unit, q.topic);
    return `${q.year}_Paper${q.paper}_Book${q.book}_${unitName}_${topicName}_Q${q.questionNumber}`;
  };

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
      isDark ? 'bg-gray-800 border-blue-900' : 'bg-white border-blue-200'
    }`}>
      {/* Header */}
      <div className={`p-4 lg:p-5 border-b rounded-t-xl transition-colors duration-300 ${
        isDark 
          ? 'border-blue-900 bg-gradient-to-r from-blue-900 to-indigo-900/30' 
          : 'border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50/30'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-lg">Questions</h3>
            <p className={`text-sm mt-1 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Page {currentPage} of {totalPages} • {questionsToDisplay.length} {showFavorites ? 'favorites' : 'total'}
            </p>
          </div>
          <div className={`bg-gradient-to-r px-3 py-1 rounded-full text-sm font-semibold shadow-sm ${
            isDark 
              ? 'from-blue-800 to-blue-900 text-blue-200' 
              : 'from-blue-100 to-blue-200 text-blue-800'
          }`}>
            {questionsToDisplay.length}
          </div>
        </div>
        
        {/* Favorites Toggle */}
        <button
          onClick={() => setShowFavorites(!showFavorites)}
          className={`w-full px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 shadow-sm border min-h-[44px] ${
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
        className="flex-1 overflow-y-auto"
        style={{
          WebkitOverflowScrolling: 'touch',
          touchAction: 'manipulation'
        }}
      >
        {currentQuestions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-inner ${
              isDark ? 'bg-gray-700' : 'bg-gradient-to-br from-gray-100 to-blue-100'
            }`}>
              {showFavorites ? (
                <svg className="w-8 h-8 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              ) : (
                <svg className={`w-8 h-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )}
            </div>
            <h4 className={`text-lg font-semibold mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-900'
            }`}>
              {showFavorites ? "No Favorite Questions" : "No questions found"}
            </h4>
            <p className={`text-sm ${
              isDark ? 'text-gray-500' : 'text-gray-500'
            }`}>
              {showFavorites 
                ? "Click the star icon on questions to add them to favorites" 
                : "Try adjusting your filters to see more results"}
            </p>
          </div>
        ) : (
          <div className="p-2 lg:p-3">
            {currentQuestions.map((q) => {
              const isSelected = Number(selectedQuestionId) === Number(q.id);
              const isFavorite = favorites.includes(q.id);
              return (
                <div
                  key={q.id}
                  ref={(el) => (itemRefs.current[q.id] = el)}
                  onClick={() => setSelectedQuestionId(q.id)}
                  className={`cursor-pointer p-3 lg:p-4 mb-2 lg:mb-3 rounded-xl transition-all duration-200 border-2 shadow-sm min-h-[80px] flex items-center ${
                    isSelected 
                      ? isDark
                        ? "bg-gradient-to-r from-blue-900 to-indigo-900 border-blue-700 shadow-md"
                        : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300 shadow-md"
                      : isDark
                        ? "bg-gray-700 border-gray-600 hover:border-blue-700 hover:shadow-md"
                        : "bg-white border-gray-200 hover:border-blue-200 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-start justify-between w-full">
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm leading-relaxed ${
                        isSelected 
                          ? isDark ? "text-blue-100" : "text-blue-800"
                          : isDark ? "text-gray-300" : "text-gray-800"
                      }`}>
                        <div className={`font-mono text-xs mb-1 ${
                          isDark ? "text-gray-500" : "text-gray-500"
                        }`}>
                          {q.year}_Paper{q.paper}_Book{q.book}
                        </div>
                        <div className="font-semibold truncate">
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
                          Q{q.questionNumber}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 ml-3 flex-shrink-0">
                      {isSelected && (
                        <div className={`w-3 h-3 rounded-full animate-pulse ${
                          isDark 
                            ? "bg-gradient-to-r from-blue-400 to-indigo-400"
                            : "bg-gradient-to-r from-blue-500 to-indigo-600"
                        }`}></div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(q.id);
                        }}
                        className={`p-1 rounded-full transition-colors ${
                          isFavorite 
                            ? "text-yellow-500 hover:text-yellow-400" 
                            : isDark 
                              ? "text-gray-500 hover:text-yellow-500" 
                              : "text-gray-400 hover:text-yellow-500"
                        }`}
                      >
                        <svg className="w-4 h-4" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className={`flex-shrink-0 p-3 lg:p-4 border-t transition-colors duration-300 ${
          isDark 
            ? 'border-blue-900 bg-gradient-to-r from-blue-900 to-indigo-900/30' 
            : 'border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50/30'
        }`}>
          <div className="flex items-center justify-between">
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className={`flex items-center gap-1 lg:gap-2 px-3 lg:px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] ${
                isDark
                  ? 'bg-gray-700 text-gray-200 border border-gray-600 hover:bg-gray-600'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">Previous</span>
            </button>
            
            <div className={`flex items-center gap-1 lg:gap-2 text-sm ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <span className="font-semibold hidden sm:inline">Page</span>
              <span className={`border rounded-lg px-2 lg:px-3 py-1 font-mono text-xs ${
                isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
              }`}>
                {currentPage}
              </span>
              <span className="font-semibold">of</span>
              <span className="font-mono text-xs">{totalPages}</span>
            </div>

            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className={`flex items-center gap-1 lg:gap-2 px-3 lg:px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] ${
                isDark
                  ? 'bg-gray-700 text-gray-200 border border-gray-600 hover:bg-gray-600'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className="hidden sm:inline">Next</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionList;