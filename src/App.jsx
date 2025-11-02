import React, { useState, useMemo } from "react";
import allQuestions from "./questionsData";
import Filters from "./components/Filters";
import QuestionList from "./components/QuestionList";
import QuestionView from "./pages/QuestionView";

const App = () => {
  const [selectedFilters, setSelectedFilters] = useState({});
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);

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
    5: "Ehenihen"
  };

  const options = useMemo(() => ({
    book: [...new Set(allQuestions.map(q => q.book))],
    year: [...new Set(allQuestions.map(q => q.year))],
    paperSet: [...new Set(allQuestions.map(q => q.paperSet))],
    paper: [...new Set(allQuestions.map(q => q.paper))],
    unit: [...new Set(allQuestions.map(q => q.unit))],
    topic: [...new Set(allQuestions.map(q => q.topic))],
    types: [...new Set(allQuestions.flatMap(q => q.types))],
  }), []);

  const filteredQuestions = useMemo(() => {
    const filtered = allQuestions.filter(q =>
      Object.entries(selectedFilters).every(([field, values]) => {
        if (values.length === 0) return true;
        
        if (field === 'types') {
          return values.some(selectedType => q.types.includes(selectedType));
        }
        
        return values.includes(q[field]);
      })
    );

    // Sort by year (most recent first), then by question number
    return filtered.sort((a, b) => {
      // First by year (descending - most recent first)
      if (b.year !== a.year) {
        return b.year - a.year;
      }
      // Then by question number (convert to number for proper sorting)
      const aNum = parseInt(a.questionNumber) || 0;
      const bNum = parseInt(b.questionNumber) || 0;
      return aNum - bNum;
    });
  }, [selectedFilters]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Header */}
      <header className="bg-white border-b border-blue-200/50 shadow-sm">
        <div className="px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Exam Prep</h1>
              <p className="text-gray-600 mt-1">Islamic Studies Past Papers</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{filteredQuestions.length}</div>
              <div className="text-sm text-gray-500">
                question{filteredQuestions.length !== 1 ? 's' : ''} found
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <Filters
          options={options}
          selectedFilters={selectedFilters}
          setSelectedFilters={setSelectedFilters}
          onSearch={() => setSelectedQuestionId(null)}
          unitNames={unitNames}
          questionTypes={questionTypes}
        />
        
        {/* Side-by-side layout */}
        <div className="flex gap-6 mt-6 h-[calc(100vh-240px)]">
          {/* Question List - Left Side */}
          <div className="w-96 flex-shrink-0">
            <QuestionList
              questions={filteredQuestions}
              selectedQuestionId={selectedQuestionId}
              setSelectedQuestionId={setSelectedQuestionId}
              unitNames={unitNames}
            />
          </div>
          
          {/* Question View - Right Side */}
          <div className="flex-1 min-w-0">
            <QuestionView
              question={filteredQuestions.find(q => q.id === selectedQuestionId)}
              questions={filteredQuestions}
              setSelectedQuestionId={setSelectedQuestionId}
              unitNames={unitNames}
              questionTypes={questionTypes}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;