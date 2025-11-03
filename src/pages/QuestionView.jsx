import React, { useState, useEffect, useRef } from "react";

const QuestionView = ({ question, questions, setSelectedQuestionId, unitNames, questionTypes, getTopicName }) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const scrollContainerRef = useRef(null);

  // Reset showAnswer and scroll position when question changes
  useEffect(() => {
    setShowAnswer(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [question]);

  if (!question)
    return (
      <div className="bg-white rounded-xl shadow-lg border-2 border-blue-200 h-full flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
            <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Select a Question</h3>
          <p className="text-gray-600 text-lg leading-relaxed">
            Choose a question from the list to view it here
          </p>
        </div>
      </div>
    );

  const questionImage = question.image;
  const answerImage = question.answerImage;
  const currentIndex = questions.findIndex(q => q.id === question.id);
  const totalQuestions = questions.length;

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

  const getQuestionTypeNames = (typeNumbers) => {
    return typeNumbers.map(type => questionTypes[type] || `Type ${type}`).join(', ');
  };

  const getUnitName = (unitNumber) => {
    return unitNames[unitNumber] || `Unit ${unitNumber}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-blue-200 h-full flex flex-col">
      {/* Fixed Header - Never scrolls */}
      <div className="flex-shrink-0 p-4 lg:p-6 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50/30 rounded-t-xl">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div>
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
                  {showAnswer ? "Answer" : "Question"} {question.questionNumber}
                </h2>
                <div className="flex items-center gap-3 mt-2">
                  <span className="px-3 py-1.5 text-sm font-semibold bg-blue-100 text-blue-800 rounded-full shadow-sm">
                    {currentIndex + 1} of {totalQuestions}
                  </span>
                  <span className="text-sm text-gray-600 font-medium">
                    {getQuestionTypeNames(question.types)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                className="flex-1 sm:flex-none px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={goPrevious}
                disabled={currentIndex === 0}
              >
                ← Prev
              </button>
              <button
                className="flex-1 sm:flex-none px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={goNext}
                disabled={currentIndex === totalQuestions - 1}
              >
                Next →
              </button>
              <button
                className={`flex-1 sm:flex-none px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md ${
                  showAnswer
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
                onClick={() => setShowAnswer(!showAnswer)}
              >
                {showAnswer ? "Question" : "Answer"}
              </button>
            </div>
          </div>
          
          {/* Question Info */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3 lg:gap-6">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-700">Year:</span>
              <span className="text-sm text-gray-900">{question.year}</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-700">Paper:</span>
              <span className="text-sm text-gray-900">{question.paper}</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-700">Book:</span>
              <span className="text-sm text-gray-900">{question.book}</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-700">Unit:</span>
              <span className="text-sm text-gray-900">{getUnitName(question.unit)}</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-700">Topic:</span>
              <span 
                className="text-sm text-gray-900"
                style={{ fontFamily: 'Faruma, Arial' }}
              >
                {getTopicName(question.book, question.unit, question.topic)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Question Image Area */}
      <div className="flex-1 min-h-0 p-4 lg:p-6 bg-gradient-to-br from-gray-50/50 to-blue-50/30">
        <div className="h-full flex flex-col">
          {/* Status badge - Now changes color based on showAnswer */}
          <div className="text-center mb-4 flex-shrink-0">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm ${
              showAnswer 
                ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200" 
                : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
            }`}>
              <span className={`w-2 h-2 rounded-full animate-pulse ${
                showAnswer ? "bg-green-500" : "bg-blue-500"
              }`}></span>
              <span className={`text-sm font-semibold ${
                showAnswer ? "text-green-700" : "text-blue-700"
              }`}>
                {showAnswer ? "Viewing Answer" : "Viewing Question"}
              </span>
            </div>
          </div>

          {/* Scrollable Image Container */}
          <div className="flex-1 bg-white rounded-xl border-3 border-blue-300 shadow-lg overflow-hidden">
            <div 
              ref={scrollContainerRef}
              className="h-full overflow-y-auto p-4 lg:p-6 bg-white"
            >
              <div className="flex justify-center items-start min-h-full">
                <img
                  src={showAnswer ? answerImage : questionImage}
                  alt={showAnswer ? `Answer ${question.questionNumber}` : `Question ${question.questionNumber}`}
                  className="max-w-full h-auto rounded-lg shadow-md"
                  onError={(e) => {
                    e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMjAgMTIwSDE4MFYxODBIMTIwVjEyMFoiIGZpbGw9IiNEOEU5RkYiLz4KPHBhdGggZD0iTTIyMCAxMjBIMjgwVjE4MEgyMjBWMTIwWiIgZmlsbD0iI0Q4RTlGRiIvPgo8cGF0aCBkPSJNMTIwIDIwMEgxODBWMjYwSDEyMFYyMDBaIiBmaWxsPSIjRDhFOUZGIi8+CjxwYXRoIGQ9Ik0yMjAgMjAwSDI4MFYyNjBIMjIwVjIwMFoiIGZpbGw9IiNEOEU5RkYiLz4KPHN2Zz4=";
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionView;