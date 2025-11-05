import React, { useState, useEffect, useRef, useCallback } from "react";
import { useTheme } from "../context/ThemeContext";

const QuestionView = ({ question, questions, setSelectedQuestionId, unitNames, questionTypes, getTopicName, onToggleFavorite, isFavorite }) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [showFavoriteFeedback, setShowFavoriteFeedback] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const scrollContainerRef = useRef(null);
  const { isDark } = useTheme();

  // Load notes when question changes
  useEffect(() => {
    if (question) {
      const savedNotes = localStorage.getItem(`question_notes_${question.id}`) || '';
      setNotes(savedNotes);
    }
  }, [question]);

  // Save notes automatically
  useEffect(() => {
    if (question && notes !== '') {
      localStorage.setItem(`question_notes_${question.id}`, notes);
    }
  }, [notes, question]);

  // Reset states when question changes
  useEffect(() => {
    setShowAnswer(false);
    setImageLoading(true);
    setShowNotes(false);
  }, [question]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      switch(e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          goPrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goNext();
          break;
        case ' ':
        case 'Spacebar':
          e.preventDefault();
          setShowAnswer(prev => !prev);
          break;
        case 'p':
        case 'P':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handlePrint();
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
          setShowNotes(prev => !prev);
          break;
        case '?':
          e.preventDefault();
          setShowShortcutsHelp(prev => !prev);
          break;
        case 'Escape':
          setShowShortcutsHelp(false);
          setShowNotes(false);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [question, showAnswer, isFavorite]);

  // Memoized navigation functions
  const goNext = useCallback(() => {
    const currentIndex = questions.findIndex(q => Number(q.id) === Number(question.id));
    if (currentIndex < questions.length - 1) {
      setSelectedQuestionId(questions[currentIndex + 1].id);
    }
  }, [question, questions, setSelectedQuestionId]);

  const goPrevious = useCallback(() => {
    const currentIndex = questions.findIndex(q => Number(q.id) === Number(question.id));
    if (currentIndex > 0) {
      setSelectedQuestionId(questions[currentIndex - 1].id);
    }
  }, [question, questions, setSelectedQuestionId]);

  // Print functionality
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const unitName = getUnitName(question.unit);
    const topicName = getTopicName(question.book, question.unit, question.topic);
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Question ${question.questionNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            img { max-width: 100%; height: auto; display: block; margin: 0 auto; }
            .header { border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 20px; }
            .info { margin: 8px 0; color: #555; font-size: 14px; }
            .question-number { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="question-number">${showAnswer ? 'Answer' : 'Question'} ${question.questionNumber}</div>
            <div class="info">
              <strong>Year:</strong> ${question.year} | 
              <strong>Paper:</strong> ${question.paper} | 
              <strong>Book:</strong> ${question.book}
            </div>
            <div class="info">
              <strong>Unit:</strong> ${unitName} | 
              <strong>Topic:</strong> ${topicName}
            </div>
          </div>
          <img src="${showAnswer ? question.answerImage : question.image}" alt="${showAnswer ? 'Answer' : 'Question'} ${question.questionNumber}" />
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Favorite functionality
  const handleFavorite = () => {
    if (onToggleFavorite && question) {
      onToggleFavorite(question.id);
      setShowFavoriteFeedback(true);
      setTimeout(() => setShowFavoriteFeedback(false), 2000);
    }
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
  };

  if (!question) {
    return (
      <div className={`rounded-xl shadow-lg border-2 h-full flex items-center justify-center ${
        isDark ? 'bg-gray-800 border-blue-900' : 'bg-white border-blue-200'
      }`}>
        <div className="text-center max-w-md px-6">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner ${
            isDark ? 'bg-blue-900' : 'bg-gradient-to-br from-blue-100 to-indigo-100'
          }`}>
            <svg className={`w-8 h-8 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-2">Select a Question</h3>
          <p className={`text-base leading-relaxed ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Choose a question from the list to view it here
          </p>
        </div>
      </div>
    );
  }

  const questionImage = question.image;
  const answerImage = question.answerImage;
  
  // Find current index in the FULL filtered questions array
  const currentIndex = questions.findIndex(q => Number(q.id) === Number(question.id));
  const totalQuestions = questions.length;

  const getQuestionTypeNames = (typeNumbers) => {
    return typeNumbers.map(type => questionTypes[type] || `Type ${type}`).join(', ');
  };

  const getUnitName = (unitNumber) => {
    return unitNames[unitNumber] || `Unit ${unitNumber}`;
  };

  const isLastQuestion = currentIndex === totalQuestions - 1;
  const isFirstQuestion = currentIndex === 0;

  return (
    <div className={`rounded-xl shadow-lg border-2 h-full flex flex-col min-h-0 ${
      isDark ? 'bg-gray-800 border-blue-900' : 'bg-white border-blue-200'
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
                ? "bg-blue-900 border-blue-700 text-blue-200"
                : "bg-blue-50 border-blue-200 text-blue-800"
          }`}>
            <svg className={`w-5 h-5 ${isFavorite ? "text-yellow-500" : "text-blue-500"}`} fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
            <span className="font-medium text-sm">
              {isFavorite ? "Added to favorites!" : "Removed from favorites!"}
            </span>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Help Modal */}
      {showShortcutsHelp && (
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
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Navigate Previous</span>
                <kbd className={`px-2 py-1 text-xs font-mono rounded shadow-sm ${
                  isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'
                }`}>←</kbd>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Navigate Next</span>
                <kbd className={`px-2 py-1 text-xs font-mono rounded shadow-sm ${
                  isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'
                }`}>→</kbd>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Toggle Question/Answer</span>
                <kbd className={`px-2 py-1 text-xs font-mono rounded shadow-sm ${
                  isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'
                }`}>Space</kbd>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Toggle Favorite</span>
                <kbd className={`px-2 py-1 text-xs font-mono rounded shadow-sm ${
                  isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'
                }`}>F</kbd>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Toggle Notes</span>
                <kbd className={`px-2 py-1 text-xs font-mono rounded shadow-sm ${
                  isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'
                }`}>N</kbd>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Print Current</span>
                <kbd className={`px-2 py-1 text-xs font-mono rounded shadow-sm ${
                  isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'
                }`}>Ctrl + P</kbd>
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
      )}

      {/* Notes Panel */}
      {showNotes && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl shadow-2xl max-w-2xl w-full p-6 ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Notes for Question {question.questionNumber}</h3>
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
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add your notes here... (saved automatically)"
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
                onClick={() => setNotes('')}
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
      )}

      {/* Fixed Header - Enhanced */}
      <div className={`flex-shrink-0 p-4 lg:p-6 border-b rounded-t-xl ${
        isDark 
          ? 'border-blue-900 bg-gradient-to-r from-blue-900 to-indigo-900/30' 
          : 'border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50/30'
      }`}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg shadow-sm ${
                isDark ? 'bg-blue-800' : 'bg-blue-100'
              }`}>
                <svg className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl lg:text-2xl font-bold">
                  {showAnswer ? "Answer" : "Question"} {question.questionNumber}
                </h2>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full shadow-sm border ${
                    isDark 
                      ? 'bg-blue-800 text-blue-200 border-blue-700' 
                      : 'bg-blue-100 text-blue-800 border-blue-200'
                  }`}>
                    {currentIndex + 1} of {totalQuestions}
                  </span>
                  <span className={`text-xs lg:text-sm font-medium px-2 py-1 rounded ${
                    isDark 
                      ? 'bg-gray-700 text-gray-300' 
                      : 'text-gray-600 bg-gray-100'
                  }`}>
                    {getQuestionTypeNames(question.types)}
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
            
            {/* Action Buttons - Enhanced with mobile optimization */}
            <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
              <button
                className={`px-3 py-2 lg:px-4 lg:py-2 text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md border-2 min-h-[44px] ${
                  isFirstQuestion 
                    ? isDark
                      ? "bg-gray-700 text-gray-400 border-gray-600 cursor-not-allowed"
                      : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed" 
                    : isDark
                      ? "bg-gray-700 text-gray-200 border-gray-600 hover:bg-gray-600 hover:border-blue-500"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-blue-300"
                }`}
                onClick={goPrevious}
                disabled={isFirstQuestion}
              >
                <span className="hidden sm:inline">← Previous</span>
                <span className="sm:hidden">←</span>
              </button>
              
              <button
                className={`px-3 py-2 lg:px-4 lg:py-2 text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md min-h-[44px] ${
                  showAnswer
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 border-2 border-green-600"
                    : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 border-2 border-blue-600"
                }`}
                onClick={() => setShowAnswer(!showAnswer)}
              >
                <span className="hidden sm:inline">{showAnswer ? "Show Question" : "Show Answer"}</span>
                <span className="sm:hidden">{showAnswer ? "Question" : "Answer"}</span>
              </button>

              <button
                className={`px-3 py-2 lg:px-4 lg:py-2 text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md border-2 min-h-[44px] ${
                  isLastQuestion 
                    ? isDark
                      ? "bg-gray-700 text-gray-400 border-gray-600 cursor-not-allowed"
                      : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed" 
                    : isDark
                      ? "bg-gray-700 text-gray-200 border-gray-600 hover:bg-gray-600 hover:border-blue-500"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-blue-300"
                }`}
                onClick={goNext}
                disabled={isLastQuestion}
              >
                <span className="hidden sm:inline">Next →</span>
                <span className="sm:hidden">→</span>
              </button>

              <button
                onClick={handlePrint}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md border-2 flex items-center gap-2 min-h-[44px] ${
                  isDark
                    ? 'bg-gray-700 text-gray-200 border-gray-600 hover:bg-gray-600 hover:border-blue-500'
                    : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50 hover:border-blue-300'
                }`}
                title="Print this question (Ctrl+P)"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span className="hidden sm:inline">Print</span>
              </button>

              <button
                onClick={handleFavorite}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md border-2 flex items-center gap-2 min-h-[44px] ${
                  isFavorite
                    ? isDark
                      ? "bg-yellow-900 text-yellow-200 border-yellow-700 hover:bg-yellow-800"
                      : "bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200"
                    : isDark
                      ? "bg-gray-700 text-gray-200 border-gray-600 hover:bg-gray-600 hover:border-blue-500"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-blue-300"
                }`}
                title="Toggle favorite (F)"
              >
                <svg className="w-4 h-4" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                <span className="hidden sm:inline">Favorite</span>
              </button>

              <button
                onClick={() => setShowNotes(true)}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md border-2 flex items-center gap-2 min-h-[44px] ${
                  isDark
                    ? 'bg-gray-700 text-gray-200 border-gray-600 hover:bg-gray-600 hover:border-purple-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-purple-300'
                }`}
                title="Add notes (N)"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span className="hidden sm:inline">Notes</span>
              </button>

              <button
                onClick={() => setShowShortcutsHelp(true)}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md border-2 min-h-[44px] ${
                  isDark
                    ? 'bg-gray-700 text-gray-200 border-gray-600 hover:bg-gray-600 hover:border-blue-500'
                    : 'text-gray-600 bg-white border-gray-300 hover:bg-gray-50 hover:border-blue-300'
                }`}
                title="Keyboard shortcuts (?)"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Question Info - Enhanced */}
          <div className={`flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3 text-sm rounded-lg p-3 border ${
            isDark 
              ? 'bg-gray-700/50 border-blue-900' 
              : 'bg-white/50 border-blue-100'
          }`}>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
              isDark ? 'bg-blue-900' : 'bg-blue-50'
            }`}>
              <span className={`font-semibold ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>Year:</span>
              <span className={isDark ? 'text-blue-100' : 'text-blue-900'}>{question.year}</span>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
              isDark ? 'bg-blue-900' : 'bg-blue-50'
            }`}>
              <span className={`font-semibold ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>Paper:</span>
              <span className={isDark ? 'text-blue-100' : 'text-blue-900'}>{question.paper}</span>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
              isDark ? 'bg-blue-900' : 'bg-blue-50'
            }`}>
              <span className={`font-semibold ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>Book:</span>
              <span className={isDark ? 'text-blue-100' : 'text-blue-900'}>{question.book}</span>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
              isDark ? 'bg-green-900' : 'bg-green-50'
            }`}>
              <span className={`font-semibold ${isDark ? 'text-green-300' : 'text-green-700'}`}>Unit:</span>
              <span className={isDark ? 'text-green-100' : 'text-green-900'}>{getUnitName(question.unit)}</span>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
              isDark ? 'bg-purple-900' : 'bg-purple-50'
            }`}>
              <span className={`font-semibold ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>Topic:</span>
              <span 
                className={isDark ? 'text-purple-100' : 'text-purple-900'}
                style={{ fontFamily: 'Faruma, Arial' }}
              >
                {getTopicName(question.book, question.unit, question.topic)}
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
            }`}>N</kbd> for notes, <kbd className={`px-1 mx-1 text-xs rounded shadow-sm ${
              isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'
            }`}>?</kbd> for help
          </div>
        </div>
      </div>

      {/* Scrollable Question Image Area - Enhanced for Mobile */}
      <div className={`flex-1 min-h-0 p-2 lg:p-4 xl:p-6 ${
        isDark 
          ? 'bg-gradient-to-br from-gray-800/50 to-blue-900/30' 
          : 'bg-gradient-to-br from-gray-50/50 to-blue-50/30'
      }`}>
        <div className="h-full flex flex-col min-h-0">
          {/* Enhanced Status badge */}
          <div className="text-center mb-4 flex-shrink-0">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 shadow-sm text-sm font-semibold ${
              showAnswer 
                ? isDark
                  ? "bg-gradient-to-r from-green-900 to-emerald-900 border-green-700 text-green-200"
                  : "bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 text-green-800"
                : isDark
                  ? "bg-gradient-to-r from-blue-900 to-indigo-900 border-blue-700 text-blue-200"
                  : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300 text-blue-800"
            }`}>
              <span className={`w-2 h-2 rounded-full animate-pulse ${
                showAnswer ? "bg-green-500" : "bg-blue-500"
              }`}></span>
              {showAnswer ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="hidden sm:inline">Viewing Answer</span>
                  <span className="sm:hidden">Answer</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span className="hidden sm:inline">Viewing Question</span>
                  <span className="sm:hidden">Question</span>
                </>
              )}
            </div>
          </div>

          {/* Enhanced Image Container */}
          <div className={`flex-1 rounded-xl border-3 shadow-xl overflow-hidden min-h-0 ${
            isDark ? 'bg-gray-700 border-blue-700' : 'bg-white border-blue-300'
          }`}>
            <div 
              ref={scrollContainerRef}
              className={`h-full overflow-y-auto p-2 lg:p-4 xl:p-8 ${
                isDark 
                  ? 'bg-gradient-to-br from-gray-800 to-blue-900/30' 
                  : 'bg-gradient-to-br from-white to-blue-50/30'
              }`}
              style={{ 
                WebkitOverflowScrolling: 'touch',
                touchAction: 'manipulation'
              }}
            >
              <div className="flex justify-center items-start min-h-full">
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
                          isDark ? 'border-blue-400' : 'border-blue-600'
                        }`}></div>
                        <p className={isDark ? 'text-gray-300 text-sm' : 'text-gray-600 text-sm'}>Loading image...</p>
                      </div>
                    </div>
                  )}
                  
                  <img
                    src={showAnswer ? answerImage : questionImage}
                    alt={showAnswer ? `Answer ${question.questionNumber}` : `Question ${question.questionNumber}`}
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
        </div>
      </div>
    </div>
  );
};

export default QuestionView;