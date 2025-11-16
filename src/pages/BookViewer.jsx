import React, { useState, useMemo } from "react";
import { useTheme } from "../context/ThemeContext";
import { topicPages, getAllTopics, searchTopics, unitNames } from "/src/topicPages";

const BookViewer = () => {
  const [selectedBook, setSelectedBook] = useState(9);
  const [selectedUnit, setSelectedUnit] = useState(1);
  const [activeTab, setActiveTab] = useState('book');
  const [notes, setNotes] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [showImportantOnly, setShowImportantOnly] = useState(false);
  const [favoriteTopics, setFavoriteTopics] = useState(() => 
    JSON.parse(localStorage.getItem('favoriteTopics') || '[]')
  );
  const [viewMode, setViewMode] = useState('topics'); // 'topics' or 'search'
  const { isDark } = useTheme();

  // PDF file paths
  const pdfFiles = {
    book9: "/pdfs/book9.pdf",
    book10: "/pdfs/book10.pdf", 
    summary: "/pdfs/summary.pdf"
  };

  // Load notes from localStorage
  React.useEffect(() => {
    const loadedNotes = {};
    [9, 10].forEach(book => {
      const noteKey = `book_${book}`;
      const note = localStorage.getItem(`book_notes_${noteKey}`);
      if (note) {
        loadedNotes[noteKey] = note;
      }
    });
    
    const summaryNote = localStorage.getItem(`book_notes_summary`);
    if (summaryNote) {
      loadedNotes['summary'] = summaryNote;
    }
    
    setNotes(loadedNotes);
  }, []);

  // Load favorite topics
  React.useEffect(() => {
    localStorage.setItem('favoriteTopics', JSON.stringify(favoriteTopics));
  }, [favoriteTopics]);

  const currentNote = activeTab === 'summary' 
    ? notes['summary'] || ''
    : notes[`book_${selectedBook}`] || '';

  const handleNoteSave = () => {
    if (activeTab === 'summary') {
      localStorage.setItem(`book_notes_summary`, currentNote);
    } else {
      localStorage.setItem(`book_notes_book_${selectedBook}`, currentNote);
    }
  };

  const handleTopicClick = (page) => {
    setCurrentPage(page);
  };

  const toggleFavorite = (topic) => {
    const topicKey = `${topic.bookId}-${topic.unitId}-${topic.topicId}`;
    if (favoriteTopics.includes(topicKey)) {
      setFavoriteTopics(prev => prev.filter(t => t !== topicKey));
    } else {
      setFavoriteTopics(prev => [...prev, topicKey]);
    }
  };

  const isTopicFavorite = (topic) => {
    const topicKey = `${topic.bookId}-${topic.unitId}-${topic.topicId}`;
    return favoriteTopics.includes(topicKey);
  };

  // Memoized filtered topics
  const filteredTopics = useMemo(() => {
    const topics = topicPages[selectedBook]?.[selectedUnit] || {};
    let result = Object.entries(topics).map(([id, topic]) => ({
      id: parseInt(id),
      ...topic
    }));

    if (showImportantOnly) {
      result = result.filter(topic => topic.important);
    }

    return result;
  }, [selectedBook, selectedUnit, showImportantOnly]);

  // Memoized search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchTopics(searchQuery, selectedBook);
  }, [searchQuery, selectedBook]);

  const getCurrentPdfUrl = () => {
    let baseUrl = activeTab === 'summary' 
      ? pdfFiles.summary 
      : (selectedBook === 9 ? pdfFiles.book9 : pdfFiles.book10);
    
    return `${baseUrl}#page=${currentPage}`;
  };

  const renderTopicNavigation = () => {
    if (viewMode === 'search') {
      return (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {searchResults.length === 0 ? (
            <div className={`text-center p-4 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              No topics found for "{searchQuery}"
            </div>
          ) : (
            searchResults.map((topic) => (
              <button
                key={`${topic.bookId}-${topic.unitId}-${topic.topicId}`}
                onClick={() => {
                  setSelectedBook(topic.bookId);
                  setSelectedUnit(topic.unitId);
                  setCurrentPage(topic.page);
                  setViewMode('topics');
                }}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  currentPage === topic.page && selectedBook === topic.bookId && selectedUnit === topic.unitId
                    ? isDark 
                      ? 'bg-indigo-600 border-indigo-500 text-white' 
                      : 'bg-indigo-100 border-indigo-300 text-indigo-800'
                    : isDark
                      ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{topic.name}</div>
                    <div className={`text-xs mt-1 ${
                      currentPage === topic.page
                        ? isDark ? 'text-indigo-200' : 'text-indigo-600'
                        : isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Book {topic.bookId}, Unit {topic.unitId} • Page {topic.page}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(topic);
                    }}
                    className={`ml-2 p-1 rounded ${
                      isTopicFavorite(topic)
                        ? 'text-yellow-500'
                        : isDark ? 'text-gray-500' : 'text-gray-400'
                    }`}
                  >
                    {isTopicFavorite(topic) ? '★' : '☆'}
                  </button>
                </div>
              </button>
            ))
          )}
        </div>
      );
    }

    return (
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredTopics.map((topic) => (
          <button
            key={topic.id}
            onClick={() => handleTopicClick(topic.page)}
            className={`w-full text-left p-3 rounded-lg border transition-all ${
              currentPage === topic.page
                ? isDark 
                  ? 'bg-indigo-600 border-indigo-500 text-white' 
                  : 'bg-indigo-100 border-indigo-300 text-indigo-800'
                : isDark
                  ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="font-medium text-sm flex items-center gap-1">
                  {topic.important && (
                    <span className={isDark ? 'text-yellow-400' : 'text-yellow-600'}>⭐</span>
                  )}
                  {topic.name}
                </div>
                <div className={`text-xs mt-1 ${
                  currentPage === topic.page
                    ? isDark ? 'text-indigo-200' : 'text-indigo-600'
                    : isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Page {topic.page}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite({
                    bookId: selectedBook,
                    unitId: selectedUnit,
                    topicId: topic.id,
                    ...topic
                  });
                }}
                className={`ml-2 p-1 rounded ${
                  isTopicFavorite({
                    bookId: selectedBook,
                    unitId: selectedUnit,
                    topicId: topic.id
                  })
                    ? 'text-yellow-500'
                    : isDark ? 'text-gray-500' : 'text-gray-400'
                }`}
              >
                {isTopicFavorite({
                  bookId: selectedBook,
                  unitId: selectedUnit,
                  topicId: topic.id
                }) ? '★' : '☆'}
              </button>
            </div>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className={`rounded-xl shadow-lg border-2 p-4 lg:p-6 mb-4 lg:mb-6 ${
        isDark ? 'bg-gray-800 border-blue-600' : 'bg-white border-blue-200'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className={`text-xl lg:text-2xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>Textbook Viewer</h2>
            <p className={`text-sm mt-1 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>Advanced PDF navigation with topic shortcuts</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('book')}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  activeTab === 'book'
                    ? isDark 
                      ? 'bg-blue-600 border-blue-500 text-white' 
                      : 'bg-blue-600 border-blue-500 text-white'
                    : isDark
                      ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 border-gray-300 text-gray-700 hover:bg-gray-300'
                }`}
              >
                📚 Book
              </button>
              <button
                onClick={() => setActiveTab('summary')}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  activeTab === 'summary'
                    ? isDark 
                      ? 'bg-green-600 border-green-500 text-white' 
                      : 'bg-green-600 border-green-500 text-white'
                    : isDark
                      ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 border-gray-300 text-gray-700 hover:bg-gray-300'
                }`}
              >
                📋 Summary
              </button>
            </div>
            
            {activeTab === 'book' && (
              <>
                <select
                  value={selectedBook}
                  onChange={(e) => {
                    setSelectedBook(parseInt(e.target.value));
                    setSelectedUnit(1);
                    setCurrentPage(1);
                  }}
                  className={`p-2 rounded-lg border-2 transition-colors ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value={9}>Book 9</option>
                  <option value={10}>Book 10</option>
                </select>
                
                <select
                  value={selectedUnit}
                  onChange={(e) => {
                    setSelectedUnit(parseInt(e.target.value));
                    setCurrentPage(1);
                  }}
                  className={`p-2 rounded-lg border-2 transition-colors ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  {[1, 2, 3, 4, 5, 6].map(unit => (
                    <option key={unit} value={unit}>
                      Unit {unit}: {unitNames[unit]}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-6 min-h-0">
        {/* Enhanced Topic Navigation - Left Sidebar */}
        {activeTab === 'book' && (
          <div className={`lg:w-80 flex-shrink-0 rounded-xl shadow-lg border-2 p-4 lg:p-6 ${
            isDark ? 'bg-gray-800 border-indigo-600' : 'bg-white border-indigo-200'
          }`}>
            <div className="flex items-center gap-2 mb-4">
              <svg className={`w-5 h-5 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              <h3 className={`text-lg font-bold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {viewMode === 'search' ? 'Search Results' : `Unit ${selectedUnit} Topics`}
              </h3>
            </div>

            {/* Search Bar */}
            <div className="mb-4">
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => setViewMode('topics')}
                  className={`flex-1 py-2 text-sm rounded-lg border transition-all ${
                    viewMode === 'topics'
                      ? isDark 
                        ? 'bg-indigo-600 border-indigo-500 text-white' 
                        : 'bg-indigo-100 border-indigo-300 text-indigo-800'
                      : isDark
                        ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 border-gray-300 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Topics
                </button>
                <button
                  onClick={() => setViewMode('search')}
                  className={`flex-1 py-2 text-sm rounded-lg border transition-all ${
                    viewMode === 'search'
                      ? isDark 
                        ? 'bg-indigo-600 border-indigo-500 text-white' 
                        : 'bg-indigo-100 border-indigo-300 text-indigo-800'
                      : isDark
                        ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 border-gray-300 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Search
                </button>
              </div>

              {viewMode === 'search' ? (
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search topics across all books..."
                  className={`w-full p-2 rounded-lg border-2 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="importantOnly"
                    checked={showImportantOnly}
                    onChange={(e) => setShowImportantOnly(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="importantOnly" className={`text-sm ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Show important topics only
                  </label>
                </div>
              )}
            </div>
            
            {renderTopicNavigation()}

            {/* Quick Stats */}
            <div className={`mt-4 pt-4 border-t ${
              isDark ? 'border-gray-700' : 'border-gray-300'
            }`}>
              <div className={`text-xs ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {viewMode === 'topics' 
                  ? `${filteredTopics.length} topics in Unit ${selectedUnit}`
                  : `${searchResults.length} search results`
                }
              </div>
            </div>

            {/* Manual Page Navigation */}
            <div className="mt-4 pt-4 border-t">
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Go to Page
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={currentPage}
                  onChange={(e) => setCurrentPage(parseInt(e.target.value) || 1)}
                  min="1"
                  className={`flex-1 p-2 rounded-lg border-2 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="Page number"
                />
                <button
                  onClick={() => handleTopicClick(currentPage)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Go
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PDF Viewer */}
        <div className={`flex-1 flex flex-col min-h-0 ${
          activeTab === 'book' ? 'lg:flex-1' : 'w-full'
        }`}>
          <div className={`rounded-xl shadow-lg border-2 flex-1 flex flex-col ${
            isDark ? 'bg-gray-800 border-blue-600' : 'bg-white border-blue-200'
          }`}>
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className={`text-lg font-bold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {activeTab === 'summary' 
                  ? 'Book Summary' 
                  : `Book ${selectedBook} - Unit ${selectedUnit}: ${unitNames[selectedUnit]}`
                }
              </h3>
              {activeTab === 'book' && (
                <div className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Page: <span className="font-bold">{currentPage}</span>
                </div>
              )}
            </div>
            
            <div className="flex-1 min-h-0 p-4 pb-8">
              <div className={`rounded-lg border-2 w-full h-full min-h-[600px] flex flex-col ${
                isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
              }`}>
                <div className="flex-1">
                  <iframe 
                    src={getCurrentPdfUrl()}
                    className="w-full h-full rounded-t-lg"
                    title={activeTab === 'summary' ? "Book Summary PDF" : `Book ${selectedBook} PDF`}
                    style={{ minHeight: '550px' }}
                  />
                </div>
                <div className={`p-4 text-center border-t ${
                  isDark ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-600'
                }`}>
                  <p>If the PDF doesn't load,{' '}
                    <a 
                      href={activeTab === 'summary' ? pdfFiles.summary : (selectedBook === 9 ? pdfFiles.book9 : pdfFiles.book10)} 
                      download 
                      className="text-blue-500 hover:underline"
                    >
                      click here to download
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Notes Panel */}
        <div className={`lg:w-96 flex-shrink-0 rounded-xl shadow-lg border-2 p-4 lg:p-6 ${
          isDark ? 'bg-gray-800 border-green-600' : 'bg-white border-green-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <svg className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <h3 className={`text-lg lg:text-xl font-bold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                My Notes - {activeTab === 'summary' ? 'Summary' : `Book ${selectedBook}`}
              </h3>
            </div>
            <div className={`text-xs px-2 py-1 rounded ${
              isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
            }`}>
              {currentNote.length} chars
            </div>
          </div>
          
          <textarea
            value={currentNote}
            onChange={(e) => {
              if (activeTab === 'summary') {
                setNotes(prev => ({ ...prev, summary: e.target.value }));
              } else {
                setNotes(prev => ({ ...prev, [`book_${selectedBook}`]: e.target.value }));
              }
            }}
            placeholder={`Write your notes about ${
              activeTab === 'summary' ? 'the book summary' : `Book ${selectedBook}`
            } here...`}
            className={`w-full h-64 p-4 rounded-lg border-2 resize-none ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />
          
          <div className="flex justify-between items-center mt-4">
            <div className={`text-xs ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Auto-saves when changing tabs
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (activeTab === 'summary') {
                    setNotes(prev => ({ ...prev, summary: '' }));
                  } else {
                    setNotes(prev => ({ ...prev, [`book_${selectedBook}`]: '' }));
                  }
                }}
                className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Clear
              </button>
              <button
                onClick={handleNoteSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookViewer;