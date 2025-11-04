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
    paperSet: [...new Set(allQuestions.map(q => q.paperSet))],
    paper: [...new Set(allQuestions.map(q => q.paper))],
    unit: [...new Set(allQuestions.map(q => q.unit))],
    topic: [...new Set(allQuestions.flatMap(q => 
      String(q.topic).split('_').map(t => parseInt(t))
    ).filter(t => !isNaN(t)))],
    types: [...new Set(allQuestions.flatMap(q => q.types))],
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Header - Reduced padding */}
      <header className="bg-white border-b border-blue-200/50 shadow-sm">
        <div className="px-4 lg:px-8 py-3 lg:py-4"> {/* Reduced from py-4 lg:py-5 */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">SSC ISLAM</h1>
              <p className="text-gray-600 mt-1 text-sm lg:text-base">Topical Past Papers</p>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-xl lg:text-2xl font-bold text-blue-600">{filteredQuestions.length}</div>
              <div className="text-sm text-gray-500">
                question{filteredQuestions.length !== 1 ? 's' : ''} found
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-4 lg:p-6">
        <Filters
          options={options}
          selectedFilters={selectedFilters}
          setSelectedFilters={setSelectedFilters}
          onSearch={() => setSelectedQuestionId(null)}
          unitNames={unitNames}
          questionTypes={questionTypes}
          topicNames={topicNames}
        />
        
        {/* Side-by-side layout - Stack on mobile */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 mt-4 lg:mt-6 h-auto lg:h-[calc(100vh-200px)]"> {/* Reduced from 240px to 200px */}
          {/* Question List - Full width on mobile, fixed on desktop */}
          <div className="w-full lg:w-96 flex-shrink-0 h-96 lg:h-full"> {/* Changed to h-full */}
            <QuestionList
              questions={filteredQuestions}
              selectedQuestionId={selectedQuestionId}
              setSelectedQuestionId={setSelectedQuestionId}
              unitNames={unitNames}
              getTopicName={getTopicName}
            />
          </div>
          
          {/* Question View - Full width on mobile, flex on desktop */}
          <div className="flex-1 min-w-0 h-96 lg:h-full"> {/* Changed to h-full */}
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
    </div>
  );
};

export default App;