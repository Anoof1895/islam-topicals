import React, { useState, useMemo, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import Select from "react-select";
import definitionsData from "../definitionsData";

const Definitions = ({ unitNames, onToggleFavorite, favorites, setCurrentView }) => {
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [selectedType, setSelectedType] = useState('lughavee'); // 'lughavee' or 'isthilaahee'
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState({});
  const [searchTerm, setSearchTerm] = useState(''); // Add this line for search
  const { isDark } = useTheme();

  // Function to highlight search terms in definition names
  const highlightSearchTerm = (text, searchTerm) => {
    if (!searchTerm.trim()) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) =>
      part.toLowerCase() === searchTerm.toLowerCase() ? (
        <span key={index} className="bg-yellow-500 text-white px-1 rounded">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  // Filter definitions by selected type
  const definitionsByType = useMemo(() => {
    return definitionsData.filter(def => def.type === selectedType);
  }, [selectedType]);

  // Filter options based on current type
  const options = useMemo(() => ({
    book: [...new Set(definitionsByType.map(q => q.book))].sort((a, b) => a - b),
    unit: [...new Set(definitionsByType.map(q => q.unit))].sort((a, b) => a - b),
  }), [definitionsByType]);

  // Load notes from localStorage
  useEffect(() => {
    const loadedNotes = {};
    definitionsData.forEach(def => {
      const note = localStorage.getItem(`definition_notes_${def.id}`);
      if (note) {
        loadedNotes[def.id] = note;
      }
    });
    setNotes(loadedNotes);
  }, []);

  // Filter definitions based on selected filters AND search term
  const filteredDefinitions = useMemo(() => {
    let filtered = definitionsByType.filter(def => {
      // Filter by book and unit
      const matchesFilters = Object.entries(selectedFilters).every(([field, values]) => {
        if (values.length === 0) return true;
        return values.map(v => String(v)).includes(String(def[field]));
      });

      // Filter by search term if provided
      if (searchTerm.trim() !== '') {
        const matchesSearch = def.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilters && matchesSearch;
      }

      return matchesFilters;
    });

    // Sort by book, unit, then name
    return filtered.sort((a, b) => {
      if (a.book !== b.book) return a.book - b.book;
      if (a.unit !== b.unit) return a.unit - b.unit;
      return a.name.localeCompare(b.name);
    });
  }, [definitionsByType, selectedFilters, searchTerm]); // Add searchTerm to dependencies

  const handleFilterChange = (field, selectedOptions) => {
    const values = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setSelectedFilters(prev => ({
      ...prev,
      [field]: values
    }));
  };

  const clearAllFilters = () => {
    setSelectedFilters({});
  };

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

  // Format options for react-select
  const formattedOptions = useMemo(() => ({
    book: options.book.map(book => ({
      value: book,
      label: `Book ${book}`
    })),
    unit: options.unit.map(unit => ({
      value: unit,
      label: `${unitNames[unit] || `Unit ${unit}`}`
    }))
  }), [options, unitNames]);

  // Get current values for react-select
  const getCurrentValues = (field) => {
    return selectedFilters[field]?.map(value => {
      const option = formattedOptions[field].find(opt => opt.value === value);
      return option || { value, label: String(value) };
    }) || [];
  };

  // Keyboard shortcuts for main component
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      switch(e.key) {
        case '/':
          e.preventDefault();
          // Focus on search input
          const searchInput = document.querySelector('input[type="text"][placeholder*="definition"]');
          if (searchInput) searchInput.focus();
          break;
        case '?':
          e.preventDefault();
          setShowShortcutsHelp(prev => !prev);
          break;
        case 'Escape':
          setShowShortcutsHelp(false);
          setShowNotes(false);
          // Clear search if focused
          if (document.activeElement.tagName === 'INPUT') {
            setSearchTerm('');
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Definition List Component
  const DefinitionList = ({ definitions, selectedQuestionId, setSelectedQuestionId, unitNames, favorites, toggleFavorite }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [showFavorites, setShowFavorites] = useState(false);
    const definitionsPerPage = 10;

    useEffect(() => {
      setCurrentPage(1);
    }, [definitions.length, showFavorites]);

    const definitionsToDisplay = showFavorites 
      ? definitions.filter(d => favorites.includes(d.id))
      : definitions;

    const totalPages = Math.ceil(definitionsToDisplay.length / definitionsPerPage);
    const startIndex = (currentPage - 1) * definitionsPerPage;
    const endIndex = startIndex + definitionsPerPage;
    const currentDefinitions = definitionsToDisplay.slice(startIndex, endIndex);

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
        isDark ? 'bg-gray-800 border-teal-600' : 'bg-white border-teal-200'
      }`}>
        {/* Header */}
        <div className={`p-3 lg:p-5 border-b rounded-t-xl transition-colors duration-300 ${
          isDark 
            ? 'border-teal-700 bg-gradient-to-r from-teal-900 to-emerald-900/30' 
            : 'border-teal-200 bg-gradient-to-r from-teal-50 to-emerald-50/30'
        }`}>
          <div className="flex items-center justify-between mb-2 lg:mb-3">
            <div>
              <h3 className="font-bold text-base lg:text-lg">Definitions</h3>
              <p className={`text-xs lg:text-sm mt-1 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Page {currentPage} of {totalPages} • {definitionsToDisplay.length} {showFavorites ? 'favorites' : 'total'}
              </p>
            </div>
            <div className={`bg-gradient-to-r px-2 py-1 rounded-full text-xs font-semibold shadow-sm ${
              isDark 
                ? 'from-teal-800 to-teal-900 text-teal-200' 
                : 'from-teal-100 to-teal-200 text-teal-800'
            }`}>
              {definitionsToDisplay.length}
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
        <div className="flex-1 overflow-y-auto p-1 lg:p-3" style={{ WebkitOverflowScrolling: 'touch' }}>
          {currentDefinitions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 lg:py-12 px-4 lg:px-6 text-center">
              <div className={`w-12 h-12 lg:w-16 lg:h-16 rounded-2xl flex items-center justify-center mb-3 lg:mb-4 shadow-inner ${
                isDark ? 'bg-teal-900' : 'bg-gradient-to-br from-teal-100 to-emerald-100'
              }`}>
                {showFavorites ? (
                  <svg className="w-6 h-6 lg:w-8 lg:h-8 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ) : (
                  <svg className={`w-6 h-6 lg:w-8 lg:h-8 ${isDark ? 'text-teal-400' : 'text-teal-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )}
              </div>
              <h4 className={`text-base lg:text-lg font-semibold mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-900'
              }`}>
                {showFavorites ? "No Favorite Definitions" : "No Definitions Found"}
              </h4>
              <p className={`text-xs lg:text-sm ${
                isDark ? 'text-gray-500' : 'text-gray-500'
              }`}>
                {showFavorites 
                  ? "Click the star icon on definitions to add them to favorites" 
                  : "Try adjusting your filters or search to see more definitions."}
              </p>
            </div>
          ) : (
            currentDefinitions.map((def) => {
              const isSelected = Number(selectedQuestionId) === Number(def.id);
              const isFavorite = favorites.includes(def.id);
              return (
                <div
                  key={def.id}
                  onClick={() => setSelectedQuestionId(def.id)}
                  className={`cursor-pointer p-2 lg:p-4 mb-2 rounded-xl transition-all duration-200 border-2 shadow-sm min-h-[70px] lg:min-h-[80px] flex items-center ${
                    isSelected 
                      ? isDark
                        ? "bg-gradient-to-r from-teal-900 to-emerald-900 border-teal-700 shadow-md"
                        : "bg-gradient-to-r from-teal-50 to-emerald-50 border-teal-300 shadow-md"
                      : isDark
                        ? "bg-gray-700 border-gray-600 hover:border-teal-700 hover:shadow-md"
                        : "bg-white border-gray-200 hover:border-teal-200 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-start justify-between w-full">
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs lg:text-sm leading-relaxed ${
                        isSelected 
                          ? isDark ? "text-teal-100" : "text-teal-800"
                          : isDark ? "text-gray-300" : "text-gray-800"
                      }`}>
                        <div className={`font-mono text-xs mb-1 ${
                          isDark ? "text-gray-500" : "text-gray-500"
                        }`}>
                          Book {def.book}
                        </div>
                        <div className={`font-semibold truncate text-sm lg:text-base ${
                          /[\u0780-\u07BF]/.test(def.name) ? 'dhivehi-text' : ''
                        }`} lang={/[\u0780-\u07BF]/.test(def.name) ? 'dv' : 'en'}>
                          {highlightSearchTerm(def.name, searchTerm)}
                        </div>
                        <div className={`text-xs mt-1 truncate ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`}>
                          {unitNames[def.unit] || `Unit ${def.unit}`}
                        </div>
                        <div className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-500"}`}>
                          {def.type === 'lughavee' ? 'لغوي (Lughavee)' : 'اصطلاحي (Isthilaahee)'}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 lg:gap-2 ml-2 lg:ml-3 flex-shrink-0">
                      {isSelected && (
                        <div className={`w-2 h-2 lg:w-3 lg:h-3 rounded-full animate-pulse ${
                          isDark 
                            ? "bg-gradient-to-r from-teal-400 to-emerald-400"
                            : "bg-gradient-to-r from-teal-500 to-emerald-600"
                        }`}></div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(def.id);
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
              ? 'border-teal-700 bg-gradient-to-r from-teal-900 to-emerald-900/30' 
              : 'border-teal-200 bg-gradient-to-r from-teal-50 to-emerald-50/30'
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

  // Definition View Component (simplified - no question/answer toggle)
  const DefinitionView = ({ definition, definitions, setSelectedQuestionId, unitNames, onToggleFavorite, isFavorite }) => {
    const [imageLoading, setImageLoading] = useState(true);
    const [imageError, setImageError] = useState(false); // ADD THIS LINE
    const [showFavoriteFeedback, setShowFavoriteFeedback] = useState(false);
    const [currentNote, setCurrentNote] = useState('');

    useEffect(() => {
      setImageLoading(true);
      setImageError(false); // RESET ERROR STATE
      if (definition) {
        const note = localStorage.getItem(`definition_notes_${definition.id}`) || '';
        setCurrentNote(note);
      }
    }, [definition]);

    // Keyboard shortcuts for definition view
    useEffect(() => {
      const handleKeyPress = (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        const currentIndex = definitions.findIndex(d => Number(d.id) === Number(definition.id));
        
        switch(e.key) {
          case 'ArrowLeft':
            e.preventDefault();
            if (currentIndex > 0) {
              setSelectedQuestionId(definitions[currentIndex - 1].id);
            }
            break;
          case 'ArrowRight':
            e.preventDefault();
            if (currentIndex < definitions.length - 1) {
              setSelectedQuestionId(definitions[currentIndex + 1].id);
            }
            break;
          case 'f':
          case 'F':
            e.preventDefault();
            handleFavorite();
            break;
          case 'n':
          case 'N':
            e.preventDefault();
            setShowNotes(true);
            break;
          default:
            break;
        }
      };

      if (definition) {
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
      }
    }, [definition, definitions, setSelectedQuestionId, onToggleFavorite]);

    const handleImageLoad = () => {
      setImageLoading(false);
      setImageError(false);
    };

    const handleImageError = () => {
      setImageLoading(false);
      setImageError(true);
    };

    const saveNote = () => {
      if (definition) {
        localStorage.setItem(`definition_notes_${definition.id}`, currentNote);
      }
    };

    if (!definition) {
      return (
        <div className={`rounded-xl shadow-lg border-2 h-full flex items-center justify-center ${
          isDark ? 'bg-gray-800 border-teal-600' : 'bg-white border-teal-200'
        }`}>
          <div className="text-center max-w-md px-6">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner ${
              isDark ? 'bg-teal-900' : 'bg-gradient-to-br from-teal-100 to-emerald-100'
            }`}>
              <svg className={`w-8 h-8 ${isDark ? 'text-teal-400' : 'text-teal-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Select a Definition</h3>
            <p className={`text-base leading-relaxed ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Choose a definition from the list to view it here
            </p>
          </div>
        </div>
      );
    }

    const currentIndex = definitions.findIndex(d => Number(d.id) === Number(definition.id));
    const totalDefinitions = definitions.length;
    const isLastDefinition = currentIndex === totalDefinitions - 1;
    const isFirstDefinition = currentIndex === 0;

    const goNext = () => {
      if (currentIndex < totalDefinitions - 1) {
        setSelectedQuestionId(definitions[currentIndex + 1].id);
      }
    };

    const goPrevious = () => {
      if (currentIndex > 0) {
        setSelectedQuestionId(definitions[currentIndex - 1].id);
      }
    };

    const handleFavorite = () => {
      onToggleFavorite(definition.id);
      setShowFavoriteFeedback(true);
      setTimeout(() => setShowFavoriteFeedback(false), 2000);
    };

    return (
      <div className={`rounded-xl shadow-lg border-2 h-full flex flex-col min-h-0 ${
        isDark ? 'bg-gray-800 border-teal-600' : 'bg-white border-teal-200'
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
                  ? "bg-teal-900 border-teal-700 text-teal-200"
                  : "bg-teal-50 border-teal-200 text-teal-800"
            }`}>
              <svg className={`w-5 h-5 ${isFavorite ? "text-yellow-500" : "text-teal-500"}`} fill="currentColor" viewBox="0 0 20 20">
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
            ? 'border-teal-700 bg-gradient-to-r from-teal-900 to-emerald-900/30' 
            : 'border-teal-200 bg-gradient-to-r from-teal-50 to-emerald-50/30'
        }`}>
          <div className="flex flex-col gap-3 lg:gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2 lg:gap-3">
                <div className={`p-1 lg:p-2 rounded-lg shadow-sm ${
                  isDark ? 'bg-teal-800' : 'bg-teal-100'
                }`}>
                  <svg className={`w-4 h-4 lg:w-5 lg:h-5 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg lg:text-2xl font-bold">
                    Definition - {definition.name}
                  </h2>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 lg:gap-2 mt-1">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full shadow-sm border ${
                      isDark 
                        ? 'bg-teal-800 text-teal-200 border-teal-700' 
                        : 'bg-teal-100 text-teal-800 border-teal-200'
                    }`}>
                      {currentIndex + 1} of {totalDefinitions}
                    </span>
                    <span className={`text-xs font-medium px-2 py-1 rounded ${
                      isDark 
                        ? 'bg-gray-700 text-gray-300' 
                        : 'text-gray-600 bg-gray-100'
                    }`}>
                      {definition.type === 'lughavee' ? 'لغوي (Lughavee)' : 'اصطلاحي (Isthilaahee)'}
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
                        Favorite
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                <button
                  className={`px-2 py-1 lg:px-3 lg:py-2 text-xs lg:text-sm font-medium rounded-lg transition-all min-h-[36px] lg:min-h-[44px] ${
                    isFirstDefinition 
                      ? isDark
                        ? "bg-gray-700 text-gray-400 border-gray-600 cursor-not-allowed"
                        : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed" 
                      : isDark
                        ? "bg-gray-700 text-gray-200 border-gray-600 hover:bg-gray-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                  onClick={goPrevious}
                  disabled={isFirstDefinition}
                >
                  <span className="hidden sm:inline">← Previous</span>
                  <span className="sm:hidden">←</span>
                </button>

                <button
                  className={`px-2 py-1 lg:px-3 lg:py-2 text-xs lg:text-sm font-medium rounded-lg transition-all min-h-[36px] lg:min-h-[44px] ${
                    isLastDefinition 
                      ? isDark
                        ? "bg-gray-700 text-gray-400 border-gray-600 cursor-not-allowed"
                        : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed" 
                      : isDark
                        ? "bg-gray-700 text-gray-200 border-gray-600 hover:bg-gray-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                  onClick={goNext}
                  disabled={isLastDefinition}
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

                <button
                  onClick={() => setShowNotes(true)}
                  className={`px-2 py-1 lg:px-3 lg:py-2 text-xs lg:text-sm font-medium rounded-lg transition-all flex items-center gap-1 lg:gap-2 min-h-[36px] lg:min-h-[44px] ${
                    isDark
                      ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 hover:border-purple-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-purple-300'
                  }`}
                >
                  <svg className="w-3 h-3 lg:w-4 lg:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span className="hidden sm:inline">Notes</span>
                </button>
              </div>
            </div>

            {/* Definition Info */}
            <div className={`flex flex-wrap items-center gap-1 lg:gap-3 p-2 lg:p-3 rounded-lg ${
              isDark ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <div className={`flex items-center gap-1 lg:gap-2 px-2 py-1 text-xs lg:text-sm rounded-full ${
                isDark ? 'bg-teal-900' : 'bg-teal-50'
              }`}>
                <span className={`font-semibold ${isDark ? 'text-teal-300' : 'text-teal-700'}`}>Book:</span>
                <span className={isDark ? 'text-teal-100' : 'text-teal-900'}>Book {definition.book}</span>
              </div>
              <div className={`flex items-center gap-1 lg:gap-2 px-2 py-1 text-xs lg:text-sm rounded-full ${
                isDark ? 'bg-blue-900' : 'bg-blue-50'
              }`}>
                <span className={`font-semibold ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>Unit:</span>
                <span className={isDark ? 'text-blue-100' : 'text-blue-900'}>{unitNames[definition.unit]}</span>
              </div>
              <div className={`flex items-center gap-1 lg:gap-2 px-2 py-1 text-xs lg:text-sm rounded-full ${
                isDark ? 'bg-purple-900' : 'bg-purple-50'
              }`}>
                <span className={`font-semibold ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>Type:</span>
                <span className={isDark ? 'text-purple-100' : 'text-purple-900'}>
                  {definition.type === 'lughavee' ? 'لغوي (Lughavee)' : 'اصطلاحي (Isthilaahee)'}
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
              }`}>F</kbd> to favorite, <kbd className={`px-1 mx-1 text-xs rounded shadow-sm ${
                isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'
              }`}>N</kbd> for notes
            </div>
          </div>
        </div>

        {/* Definition Image - Optimized for laptops and mobile */}
        <div className="flex-1 min-h-0 flex flex-col">
          <div className={`flex-1 min-h-0 p-2 lg:p-4 ${
            isDark 
              ? 'bg-gradient-to-br from-gray-800/50 to-teal-900/30' 
              : 'bg-gradient-to-br from-gray-50/50 to-teal-50/30'
          }`}>
            <div className="h-full flex flex-col min-h-0">
              {/* Image Container - Optimized sizing */}
              <div className={`flex-1 rounded-xl border-2 shadow-xl overflow-hidden min-h-0 ${
                isDark ? 'bg-gray-700 border-teal-700' : 'bg-white border-teal-300'
              }`}>
                <div 
                  className="h-full overflow-y-auto p-2 lg:p-4 xl:p-6"
                  style={{ 
                    WebkitOverflowScrolling: 'touch',
                    touchAction: 'manipulation'
                  }}
                >
                  {/* Image positioned at top - like main viewer */}
                  <div className="flex justify-center items-start">
                    <div className={`rounded-lg shadow-lg p-2 lg:p-3 border relative max-w-full ${
                      isDark ? 'bg-gray-800/90 border-gray-600' : 'bg-white border-gray-200'
                    }`}>
                      {/* Loading Spinner */}
                      {imageLoading && (
                        <div className={`absolute inset-0 flex items-center justify-center rounded-lg z-10 ${
                          isDark ? 'bg-gray-800/90' : 'bg-white/90'
                        }`}>
                          <div className="flex flex-col items-center gap-3">
                            <div className={`animate-spin rounded-full h-10 w-10 lg:h-16 lg:w-16 border-b-2 ${
                              isDark ? 'border-teal-400' : 'border-teal-600'
                            }`}></div>
                            <p className={isDark ? 'text-gray-300 text-sm lg:text-base' : 'text-gray-600 text-sm lg:text-base'}>
                              Loading definition...
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {/* Error State */}
                      {imageError && (
                        <div className={`absolute inset-0 flex flex-col items-center justify-center rounded-lg z-10 p-4 ${
                          isDark ? 'bg-gray-600/90' : 'bg-white/90'
                        }`}>
                          <svg className={`w-12 h-12 mb-4 ${isDark ? 'text-red-400' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.226 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          <p className={`text-center font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                            Failed to load image
                          </p>
                          <p className={`text-sm mt-2 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Please check your connection or try refreshing
                          </p>
                          <button
                            onClick={() => {
                              setImageLoading(true);
                              setImageError(false);
                            }}
                            className={`mt-4 px-4 py-2 rounded-lg font-medium transition-colors ${
                              isDark 
                                ? 'bg-teal-600 hover:bg-teal-700 text-white' 
                                : 'bg-teal-100 hover:bg-teal-200 text-teal-800'
                            }`}
                          >
                            Retry
                          </button>
                        </div>
                      )}
                      
                      <img
                        src={definition.image}
                        alt={`Definition: ${definition.name}`}
                        className="max-w-full h-auto rounded shadow-md transition-opacity duration-300"
                        style={{ 
                          opacity: imageLoading || imageError ? 0 : 1, // ADD imageError here
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
              
              {/* Image Controls & Info - Moved to bottom of viewer */}
              <div className={`flex flex-col sm:flex-row justify-between items-center mt-3 lg:mt-4 p-2 lg:p-3 rounded-lg ${
                isDark ? 'bg-gray-700/50' : 'bg-gray-50/50'
              }`}>
                <div className={`text-xs lg:text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  <span className="font-semibold">Tip:</span> Pinch to zoom or double-tap to enlarge
                </div>
                <div className={`text-xs lg:text-sm mt-1 sm:mt-0 ${
                  isDark ? 'text-gray-500' : 'text-gray-500'
                }`}>
                  {definition.name} • Book {definition.book} • {unitNames[definition.unit]}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Notes Modal
  const NotesModal = () => {
    if (!showNotes || !selectedQuestionId) return null;

    const currentDefinition = definitionsData.find(d => d.id === selectedQuestionId);
    if (!currentDefinition) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className={`rounded-xl shadow-2xl max-w-2xl w-full p-6 ${
          isDark ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Notes for {currentDefinition.name}</h3>
            <button
              onClick={() => setShowNotes(false)}
              className={`transition-colors ${
                isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <textarea
            value={notes[selectedQuestionId] || ''}
            onChange={(e) => {
              const newNotes = { ...notes, [selectedQuestionId]: e.target.value };
              setNotes(newNotes);
              localStorage.setItem(`definition_notes_${selectedQuestionId}`, e.target.value);
            }}
            placeholder="Add your notes about this definition here... (saved automatically)"
            className={`w-full h-64 p-4 rounded-lg border-2 resize-none ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />
          <div className="flex justify-between items-center mt-4">
            <span className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Press ESC to close
            </span>
            <button
              onClick={() => {
                const newNotes = { ...notes, [selectedQuestionId]: '' };
                setNotes(newNotes);
                localStorage.removeItem(`definition_notes_${selectedQuestionId}`);
              }}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                isDark 
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Clear Notes
            </button>
          </div>
        </div>
      </div>
    );
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
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Toggle Favorite</span>
              <kbd className={`px-2 py-1 text-xs font-mono rounded shadow-sm ${
                isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'
              }`}>F</kbd>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Toggle Notes</span>
              <kbd className={`px-2 py-1 text-xs font-mono rounded shadow-sm ${
                isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'
              }`}>N</kbd>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Focus Search</span>
              <kbd className={`px-2 py-1 text-xs font-mono rounded shadow-sm ${
                isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'
              }`}>/</kbd>
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

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className={`rounded-xl shadow-lg border-2 p-3 lg:p-6 mb-3 lg:mb-6 ${
        isDark ? 'bg-gray-800 border-teal-600' : 'bg-white border-teal-200'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-4">
          <div>
            <h2 className={`text-lg lg:text-2xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>Definitions (Thaarafu thah)</h2>
            <p className={`text-sm lg:text-lg mt-1 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              لغوي (Lughavee) and اصطلاحي (Isthilaahee) definitions
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
              isDark ? 'bg-teal-900 text-teal-200' : 'bg-teal-100 text-teal-800'
            }`}>
              {definitionsByType.length} {selectedType === 'lughavee' ? 'Lughavee' : 'Isthilaahee'} Definitions
            </div>
          </div>
        </div>
      </div>

      {/* Type Selection and Search */}
      <div className={`rounded-xl shadow-lg border-2 p-3 lg:p-6 mb-3 lg:mb-6 ${
        isDark ? 'bg-gray-800 border-teal-600' : 'bg-white border-teal-200'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-4 mb-3 lg:mb-4">
          <div>
            <h3 className={`text-base lg:text-lg font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>Definition Type</h3>
            <p className={`text-xs lg:text-sm mt-1 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Select the type of definitions you want to study
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <label className={`block text-xs lg:text-sm font-semibold mb-2 ${
            isDark ? 'text-gray-300' : 'text-gray-800'
          }`}>
            Search Definitions
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="     Type definition name (e.g., Vari, Kaiveni, etc.) - Press / to search"
              className={`w-full p-3 lg:p-4 rounded-lg border-2 transition-colors ${
                searchTerm ? 'pl-4' : 'pl-12'
              } ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'
              }`}
            />
            {!searchTerm && (
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            )}
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            Search for definition names like "Khithuba", "Gazuf" etc.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <button
            onClick={() => setSelectedType('lughavee')}
            className={`flex-1 py-3 text-base lg:text-lg font-semibold rounded-lg transition-all border-2 min-h-[44px] ${
              selectedType === 'lughavee'
                ? isDark 
                  ? 'bg-blue-600 text-white border-blue-500 shadow-md' 
                  : 'bg-blue-600 text-white border-blue-500 shadow-md'
                : isDark
                  ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300'
            }`}
          >
            لغوي (Lughavee)
          </button>
          <button
            onClick={() => setSelectedType('isthilaahee')}
            className={`flex-1 py-3 text-base lg:text-lg font-semibold rounded-lg transition-all border-2 min-h-[44px] ${
              selectedType === 'isthilaahee'
                ? isDark 
                  ? 'bg-purple-600 text-white border-purple-500 shadow-md' 
                  : 'bg-purple-600 text-white border-purple-500 shadow-md'
                : isDark
                  ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300'
            }`}
          >
            اصطلاحي (Isthilaahee)
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
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
        </div>

        {/* Active Filters Display */}
        {(selectedFilters.book?.length > 0 || selectedFilters.unit?.length > 0) && (
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
            <button
              onClick={clearAllFilters}
              className={`px-2 py-1 text-xs font-medium rounded-full transition-all ${
                isDark
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className={`rounded-xl shadow-lg border-2 p-3 lg:p-6 mb-3 lg:mb-6 ${
        isDark ? 'bg-gray-800 border-teal-600' : 'bg-white border-teal-200'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className={`text-base lg:text-lg font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {selectedType === 'lughavee' ? 'لغوي (Lughavee)' : 'اصطلاحي (Isthilaahee)'} Definitions
              {searchTerm && (
                <span className="text-sm font-normal ml-2">
                  (Search: "{searchTerm}")
                </span>
              )}
            </h3>
            <p className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {filteredDefinitions.length} definition{filteredDefinitions.length !== 1 ? 's' : ''} found
              {searchTerm && ` matching "${searchTerm}"`}
            </p>
          </div>
          <div className={`px-3 py-1 lg:px-4 lg:py-2 text-xs lg:text-sm font-semibold rounded-lg ${
            isDark ? 'bg-teal-900 text-teal-200' : 'bg-teal-100 text-teal-800'
          }`}>
            {filteredDefinitions.length} Definition{filteredDefinitions.length !== 1 ? 's' : ''}
          </div>
        </div>
        
        {/* Quick Search Tips */}
        {searchTerm && filteredDefinitions.length > 0 && (
          <div className={`mt-4 p-3 rounded-lg ${
            isDark ? 'bg-teal-900/30 border border-teal-800' : 'bg-teal-50 border border-teal-200'
          }`}>
            <p className={`text-xs flex items-center gap-2 ${
              isDark ? 'text-teal-300' : 'text-teal-700'
            }`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Found {filteredDefinitions.length} definition{filteredDefinitions.length !== 1 ? 's' : ''} containing "{searchTerm}"
            </p>
          </div>
        )}
        
        {/* No Results Message */}
        {searchTerm && filteredDefinitions.length === 0 && (
          <div className={`mt-4 p-3 rounded-lg ${
            isDark ? 'bg-yellow-900/30 border border-yellow-800' : 'bg-yellow-50 border border-yellow-200'
          }`}>
            <p className={`text-xs flex items-center gap-2 ${
              isDark ? 'text-yellow-300' : 'text-yellow-700'
            }`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.226 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              No definitions found containing "{searchTerm}". Try a different search term.
            </p>
          </div>
        )}
      </div>

      {/* Two-column layout for list and view - Optimized for laptops */}
      <div className="flex flex-col lg:flex-row gap-2 lg:gap-6 flex-1 min-h-0">
        {/* Left: Definition List - Narrower on desktop */}
        <div className="w-full lg:w-80 xl:w-72 2xl:w-80 flex-shrink-0 flex flex-col min-h-0 mb-2 lg:mb-0">
          <DefinitionList
            definitions={filteredDefinitions}
            selectedQuestionId={selectedQuestionId}
            setSelectedQuestionId={setSelectedQuestionId}
            unitNames={unitNames}
            favorites={favorites}
            toggleFavorite={onToggleFavorite}
          />
        </div>
        
        {/* Right: Definition View - Wider on desktop */}
        <div className="flex-1 min-w-0 flex flex-col min-h-0">
          <DefinitionView
            definition={filteredDefinitions.find(d => d.id === selectedQuestionId)}
            definitions={filteredDefinitions}
            setSelectedQuestionId={setSelectedQuestionId}
            unitNames={unitNames}
            onToggleFavorite={onToggleFavorite}
            isFavorite={selectedQuestionId ? favorites.includes(selectedQuestionId) : false}
          />
        </div>
      </div>

      {/* Modals */}
      <NotesModal />
      <ShortcutsHelpModal />
    </div>
  );
};

export default React.memo(Definitions);