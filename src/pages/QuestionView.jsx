import React, { useState, useEffect, useRef } from "react";

const QuestionView = ({ question, questions, setSelectedQuestionId, unitNames, questionTypes, getTopicName }) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const scrollContainerRef = useRef(null);

  // Reset showAnswer when question changes
  useEffect(() => {
    setShowAnswer(false);
  }, [question]);

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

  if (!question) {
    return (
      <div className="bg-white rounded-xl shadow-lg border-2 border-blue-200 h-full flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Select a Question</h3>
          <p className="text-gray-600 text-base leading-relaxed">
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

  const isLastQuestion = currentIndex === totalQuestions - 1;
  const isFirstQuestion = currentIndex === 0;

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-blue-200 h-full flex flex-col min-h-0">
      {/* Fixed Header - Enhanced */}
      <div className="flex-shrink-0 p-4 lg:p-6 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50/30 rounded-t-xl">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg shadow-sm">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
                  {showAnswer ? "Answer" : "Question"} {question.questionNumber}
                </h2>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
                  <span className="px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full shadow-sm border border-blue-200">
                    {currentIndex + 1} of {totalQuestions}
                  </span>
                  <span className="text-xs lg:text-sm text-gray-600 font-medium bg-gray-100 px-2 py-1 rounded">
                    {getQuestionTypeNames(question.types)}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Action Buttons - Enhanced with print */}
            <div className="flex flex-wrap gap-2">
              <button
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md border-2 ${
                  isFirstQuestion 
                    ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed" 
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-blue-300"
                }`}
                onClick={goPrevious}
                disabled={isFirstQuestion}
              >
                ← Previous
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md ${
                  showAnswer
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 border-2 border-green-600"
                    : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 border-2 border-blue-600"
                }`}
                onClick={() => setShowAnswer(!showAnswer)}
              >
                {showAnswer ? "Show Question" : "Show Answer"}
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md border-2 ${
                  isLastQuestion 
                    ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed" 
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-blue-300"
                }`}
                onClick={goNext}
                disabled={isLastQuestion}
              >
                Next →
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
                title="Print this question"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print
              </button>
            </div>
          </div>
          
          {/* Question Info - Enhanced */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3 text-sm bg-white/50 rounded-lg p-3 border border-blue-100">
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
              <span className="font-semibold text-blue-700">Year:</span>
              <span className="text-blue-900 font-medium">{question.year}</span>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
              <span className="font-semibold text-blue-700">Paper:</span>
              <span className="text-blue-900 font-medium">{question.paper}</span>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
              <span className="font-semibold text-blue-700">Book:</span>
              <span className="text-blue-900 font-medium">{question.book}</span>
            </div>
            <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full">
              <span className="font-semibold text-green-700">Unit:</span>
              <span className="text-green-900 font-medium">{getUnitName(question.unit)}</span>
            </div>
            <div className="flex items-center gap-2 bg-purple-50 px-3 py-1 rounded-full">
              <span className="font-semibold text-purple-700">Topic:</span>
              <span 
                className="text-purple-900 font-medium"
                style={{ fontFamily: 'Faruma, Arial' }}
              >
                {getTopicName(question.book, question.unit, question.topic)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Question Image Area - Enhanced */}
      <div className="flex-1 min-h-0 p-4 lg:p-6 bg-gradient-to-br from-gray-50/50 to-blue-50/30">
        <div className="h-full flex flex-col min-h-0">
          {/* Enhanced Status badge */}
          <div className="text-center mb-4 flex-shrink-0">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 shadow-sm text-sm font-semibold ${
              showAnswer 
                ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 text-green-800" 
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
                  Viewing Answer
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Viewing Question
                </>
              )}
            </div>
          </div>

          {/* Enhanced Image Container */}
          <div className="flex-1 bg-white rounded-xl border-3 border-blue-300 shadow-xl overflow-hidden min-h-0">
            <div 
              ref={scrollContainerRef}
              className="h-full overflow-y-auto p-4 lg:p-8 bg-gradient-to-br from-white to-blue-50/30"
            >
              <div className="flex justify-center items-start min-h-full">
                <div className="bg-white rounded-lg shadow-lg p-2 border border-gray-200">
                  <img
                    src={showAnswer ? answerImage : questionImage}
                    alt={showAnswer ? `Answer ${question.questionNumber}` : `Question ${question.questionNumber}`}
                    className="max-w-full h-auto rounded shadow-md"
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
    </div>
  );
};

export default QuestionView;