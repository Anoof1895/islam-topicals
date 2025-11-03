import React, { useEffect, useRef } from "react";

const QuestionList = ({ questions, selectedQuestionId, setSelectedQuestionId, unitNames, getTopicName }) => {
  const containerRef = useRef(null);
  const itemRefs = useRef({});

  useEffect(() => {
    if (selectedQuestionId && itemRefs.current[selectedQuestionId]) {
      itemRefs.current[selectedQuestionId].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [selectedQuestionId]);

  const getQuestionDisplayText = (q) => {
    const unitName = unitNames[q.unit] || `Unit ${q.unit}`;
    const topicName = getTopicName(q.book, q.unit, q.topic);
    return `${q.year}_Paper${q.paper}_Book${q.book}_${unitName}_${topicName}_Q${q.questionNumber}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-blue-200 h-full overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 lg:p-5 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50/30 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Questions</h3>
            <p className="text-gray-600 text-sm mt-1">
              Select a question to view
            </p>
          </div>
          <div className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold shadow-sm">
            {questions.length}
          </div>
        </div>
      </div>
      
      {/* List */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto"
      >
        {questions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-blue-100 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">No questions found</h4>
            <p className="text-gray-500 text-sm">
              Try adjusting your filters to see more results
            </p>
          </div>
        ) : (
          <div className="p-3">
            {questions.map((q) => {
              const isSelected = Number(selectedQuestionId) === Number(q.id);
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
                    {isSelected && (
                      <div className="flex-shrink-0 ml-3">
                        <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionList;