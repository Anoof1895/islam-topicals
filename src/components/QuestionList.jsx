import React, { useEffect, useRef, useState } from "react";

const QuestionList = ({ questions, selectedQuestionId, setSelectedQuestionId, unitNames, getTopicName }) => {
  const containerRef = useRef(null);
  const itemRefs = useRef({});
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [showFavorites, setShowFavorites] = useState(false);
  const [favorites, setFavorites] = useState(() => 
    JSON.parse(localStorage.getItem('favoriteQuestions') || '[]')
  );
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

  const toggleFavorite = (questionId, e) => {
    e.stopPropagation();
    const newFavorites = favorites.includes(questionId)
      ? favorites.filter(id => id !== questionId)
      : [...favorites, questionId];
    setFavorites(newFavorites);
    localStorage.setItem('favoriteQuestions', JSON.stringify(newFavorites));
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-blue-200 h-full overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 lg:p-5 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50/30 rounded-t-xl">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Questions</h3>
            <p className="text-gray-600 text-sm mt-1">
              Page {currentPage} of {totalPages} • {questionsToDisplay.length} {showFavorites ? 'favorites' : 'total'}
            </p>
          </div>
          {/* Changed from currentQuestions.length to questionsToDisplay.length */}
          <div className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold shadow-sm">
            {questionsToDisplay.length}
          </div>
        </div>
        
        {/* Favorites Toggle */}
        <button
          onClick={() => setShowFavorites(!showFavorites)}
          className={`w-full px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 shadow-sm border ${
            showFavorites
              ? "bg-yellow-100 text-yellow-700 border-yellow-300"
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
      >
        {currentQuestions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-blue-100 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
              {showFavorites ? (
                <svg className="w-8 h-8 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              ) : (
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )}
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              {showFavorites ? "No Favorite Questions" : "No questions found"}
            </h4>
            <p className="text-gray-500 text-sm">
              {showFavorites 
                ? "Click the star icon on questions to add them to favorites" 
                : "Try adjusting your filters to see more results"}
            </p>
          </div>
        ) : (
          <div className="p-3">
            {currentQuestions.map((q) => {
              const isSelected = Number(selectedQuestionId) === Number(q.id);
              const isFavorite = favorites.includes(q.id);
              return (
                <div
                  key={q.id}
                  ref={(el) => (itemRefs.current[q.id] = el)}
                  onClick={() => setSelectedQuestionId(q.id)}
                  className={`cursor-pointer p-4 mb-3 rounded-xl transition-all duration-200 border-2 shadow-sm
                    ${isSelected 
                      ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300 shadow-md" 
                      : "bg-white border-gray-200 hover:border-blue-200 hover:shadow-md"
                    }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm leading-relaxed ${
                        isSelected ? "text-blue-800 font-semibold" : "text-gray-800"
                      }`}>
                        <div className="font-mono text-xs text-gray-500 mb-1">
                          {q.year}_Paper{q.paper}_Book{q.book}
                        </div>
                        <div className="font-semibold">
                          {unitNames[q.unit] || `Unit ${q.unit}`}
                        </div>
                        <div className="text-xs mt-1" style={{ fontFamily: 'Faruma, Arial' }}>
                          {getTopicName(q.book, q.unit, q.topic)}
                        </div>
                        <div className="font-mono text-xs text-gray-500 mt-1">
                          Q{q.questionNumber}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 ml-3">
                      {isSelected && (
                        <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-pulse"></div>
                      )}
                      <button
                        onClick={(e) => toggleFavorite(q.id, e)}
                        className={`p-1 rounded-full transition-colors ${
                          isFavorite ? "text-yellow-500 hover:text-yellow-600" : "text-gray-400 hover:text-yellow-500"
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
        <div className="flex-shrink-0 p-4 border-t border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50/30">
          <div className="flex items-center justify-between">
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
            
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span className="font-semibold">Page</span>
              <span className="bg-white border border-gray-300 rounded-lg px-3 py-1 font-mono text-xs">
                {currentPage}
              </span>
              <span className="font-semibold">of</span>
              <span className="font-mono text-xs">{totalPages}</span>
            </div>

            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
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