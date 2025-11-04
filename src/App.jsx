import React, { useState, useMemo } from "react";
import allQuestions from "./questionsData";
import Filters from "./components/Filters";
import QuestionList from "./components/QuestionList";
import QuestionView from "./pages/QuestionView";
import { topicNames, getTopicName } from "./topicNames";

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
    5: "Mauloomaathu",
    6: "Dhiraasaa"
  };

  const options = useMemo(() => ({
    book: [...new Set(allQuestions.map(q => q.book))],
    year: [...new Set(allQuestions.map(q => q.year))],
    paper: [...new Set(allQuestions.map(q => q.paper))],
    unit: [...new Set(allQuestions.map(q => q.unit))],
    topic: [...new Set(allQuestions.flatMap(q => 
      String(q.topic).split('_').map(t => parseInt(t))
    ).filter(t => !isNaN(t)))],
    types: [...new Set(allQuestions.flatMap(q => q.types))],
    paperType: ['specimen', 'actual'], // Add paperType options
  }), []);

  const filteredQuestions = useMemo(() => {
    const filtered = allQuestions.filter(q =>
      Object.entries(selectedFilters).every(([field, values]) => {
        if (values.length === 0) return true;
        
        if (field === 'types') {
          return values.some(selectedType => q.types.includes(selectedType));
        }
        
        if (field === 'topic') {
          // Handle multiple topics with underscores - FIXED THIS PART
          const questionTopic = String(q.topic);
          const selectedTopics = values.map(v => String(v)); // Convert selected to strings
          
          // Check if any selected topic matches the question's topic(s)
          return selectedTopics.some(selectedTopic => {
            // If question has multiple topics (e.g., "13_14_15_16")
            if (questionTopic.includes('_')) {
              const questionTopics = questionTopic.split('_');
              return questionTopics.includes(selectedTopic);
            }
            // If question has single topic
            return questionTopic === selectedTopic;
          });
        }
        
        // Handle paperType filter (Specimen vs Actual)
        if (field === 'paperType') {
          const isSpecimen = (q.year === 2021 && q.paperSet === 2) || (q.year === 2020 && q.paperSet === 1);
          
          if (values.includes('specimen') && values.includes('actual')) {
            return true; // Show all if both are selected
          }
          if (values.includes('specimen')) {
            return isSpecimen;
          }
          if (values.includes('actual')) {
            return !isSpecimen;
          }
        }
        
        // For other fields, convert both to string for comparison
        return values.map(v => String(v)).includes(String(q[field]));
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex flex-col">
      {/* Header - More compact design */}
      <header className="bg-white border-b border-blue-200/50 shadow-sm">
        <div className="px-4 lg:px-8 py-3 lg:py-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">SSC ISLAM</h1>
              <p className="text-gray-600 text-xs lg:text-sm mt-0.5">Topical Past Papers</p>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-lg lg:text-xl font-bold text-blue-600">{filteredQuestions.length}</div>
              <div className="text-xs text-gray-500">
                question{filteredQuestions.length !== 1 ? 's' : ''} found
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - This will grow to take available space */}
      <div className="flex-1 p-3 lg:p-6 flex flex-col min-h-0">
        <Filters
          options={options}
          selectedFilters={selectedFilters}
          setSelectedFilters={setSelectedFilters}
          onSearch={() => setSelectedQuestionId(null)}
          unitNames={unitNames}
          questionTypes={questionTypes}
          topicNames={topicNames}
        />
        
        {/* Side-by-side layout - More flexible height */}
        <div className="flex flex-col lg:flex-row gap-3 lg:gap-6 mt-3 lg:mt-6 flex-1 min-h-0">
          {/* Question List - Full width on mobile, fixed on desktop */}
          <div className="w-full lg:w-96 flex-shrink-0 flex flex-col min-h-0">
            <QuestionList
              questions={filteredQuestions}
              selectedQuestionId={selectedQuestionId}
              setSelectedQuestionId={setSelectedQuestionId}
              unitNames={unitNames}
              getTopicName={getTopicName}
            />
          </div>
          
          {/* Question View - Full width on mobile, flex on desktop */}
          <div className="flex-1 min-w-0 flex flex-col min-h-0">
            <QuestionView
              question={filteredQuestions.find(q => q.id === selectedQuestionId)}
              questions={filteredQuestions}
              setSelectedQuestionId={setSelectedQuestionId}
              unitNames={unitNames}
              questionTypes={questionTypes}
              getTopicName={getTopicName}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-blue-200/50 py-4 mt-8">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3">
            <div className="text-gray-600 text-sm">
              2025 © islam-topicals.vercel.app
            </div>
            <div className="text-gray-500 text-xs md:text-sm">
              Made with ❤️ by <span className="font-semibold text-gray-700">bakari-koshi</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;