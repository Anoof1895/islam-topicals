import React, { useState, useMemo } from "react";
import { topicNames, getTopicName } from "../topicNames";

const UnseenTopics = ({ allQuestions, unitNames }) => {
  const [excludeSpecimen, setExcludeSpecimen] = useState(false);

  // Get all topics that have appeared in exams
  const seenTopics = useMemo(() => {
    const seen = {};
    
    allQuestions.forEach(question => {
      // Skip specimen papers if excludeSpecimen is true
      if (excludeSpecimen) {
        const isSpecimen = (question.year === 2021 && question.paperSet === 2) || 
                          (question.year === 2020 && question.paperSet === 1);
        if (isSpecimen) return; // Skip this question
      }
      
      const { book, unit, topic } = question;
      
      if (!seen[book]) seen[book] = {};
      if (!seen[book][unit]) seen[book][unit] = new Set();
      
      // Handle multiple topics (e.g., "5_6", "13_14_15_16")
      const topicStr = String(topic);
      if (topicStr.includes('_')) {
        topicStr.split('_').forEach(t => seen[book][unit].add(parseInt(t)));
      } else {
        seen[book][unit].add(parseInt(topic));
      }
    });
    
    return seen;
  }, [allQuestions, excludeSpecimen]);

  // Calculate unseen topics
  const unseenTopics = useMemo(() => {
    const unseen = {};
    
    // For each book in topicNames
    Object.keys(topicNames).forEach(book => {
      const bookNum = parseInt(book);
      unseen[bookNum] = {};
      
      // For each unit in the book
      Object.keys(topicNames[book]).forEach(unit => {
        const unitNum = parseInt(unit);
        unseen[bookNum][unitNum] = [];
        
        // For each topic in the unit
        Object.keys(topicNames[book][unit]).forEach(topic => {
          const topicNum = parseInt(topic);
          
          // Check if this topic has appeared in exams
          const hasAppeared = seenTopics[bookNum]?.[unitNum]?.has(topicNum);
          
          if (!hasAppeared) {
            unseen[bookNum][unitNum].push({
              id: topicNum,
              name: topicNames[book][unit][topic]
            });
          }
        });
        
        // Sort by topic ID
        unseen[bookNum][unitNum].sort((a, b) => a.id - b.id);
      });
    });
    
    return unseen;
  }, [seenTopics]);

  // Count total unseen topics
  const totalUnseen = useMemo(() => {
    let count = 0;
    Object.values(unseenTopics).forEach(book => {
      Object.values(book).forEach(unit => {
        count += unit.length;
      });
    });
    return count;
  }, [unseenTopics]);

  if (totalUnseen === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 py-8">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg border-2 border-blue-200 p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {excludeSpecimen ? "All Topics Have Appeared in Actual Exams!" : "All Topics Have Appeared!"}
            </h2>
            <p className="text-gray-600 text-lg mb-6">
              {excludeSpecimen 
                ? "Great news! All topics have appeared in actual exam papers (excluding specimen papers)."
                : "Great news! All topics in the syllabus have appeared in past papers at least once."}
            </p>
            <p className="text-gray-500">
              Focus on topics that haven't appeared frequently or practice all areas equally.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 py-8">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-blue-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                Unseen Topics {excludeSpecimen && "(Actual Exams Only)"}
              </h1>
              <p className="text-gray-600 text-lg mb-4">
                Topics that haven't appeared in {excludeSpecimen ? "actual exam papers" : "past papers"} yet
              </p>
              
              {/* Toggle Switch */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setExcludeSpecimen(!excludeSpecimen)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    excludeSpecimen ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      excludeSpecimen ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">
                    Exclude Specimen Papers
                  </span>
                  <span className="text-xs text-gray-500">
                    {excludeSpecimen 
                      ? "Only considering actual exam papers" 
                      : "Including all papers (specimen + actual)"}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 px-6 py-4 rounded-lg border-2 border-yellow-200">
              <div className="text-2xl lg:text-3xl font-bold text-yellow-800 text-center">{totalUnseen}</div>
              <div className="text-yellow-700 text-sm font-medium text-center">Unseen Topics</div>
            </div>
          </div>
        </div>

        {/* Books */}
        {Object.keys(unseenTopics).map(book => (
          <div key={book} className="mb-8">
            <div className="bg-white rounded-xl shadow-lg border-2 border-blue-200 overflow-hidden">
              {/* Book Header */}
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
                <h2 className="text-xl lg:text-2xl font-bold text-white">
                  Book {book} - Unseen Topics {excludeSpecimen && "(Actual Exams)"}
                </h2>
                <p className="text-blue-100 mt-1">
                  {Object.values(unseenTopics[book]).reduce((sum, unit) => sum + unit.length, 0)} 
                  topics haven't appeared in {excludeSpecimen ? "actual exams" : "any papers"}
                </p>
              </div>

              {/* Units */}
              <div className="p-6">
                {Object.keys(unseenTopics[book]).map(unit => {
                  const unitTopics = unseenTopics[book][unit];
                  if (unitTopics.length === 0) return null;

                  return (
                    <div key={unit} className="mb-6 last:mb-0">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-green-100 p-2 rounded-lg">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {unitNames[unit] || `Unit ${unit}`}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {unitTopics.length} topic{unitTopics.length !== 1 ? 's' : ''} haven't appeared
                          </p>
                        </div>
                      </div>

                      {/* Topics Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {unitTopics.map(topic => (
                          <div
                            key={topic.id}
                            className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-lg p-4 hover:shadow-md transition-all duration-200"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="px-2 py-1 text-xs font-bold bg-yellow-500 text-white rounded-full">
                                    Topic {topic.id}
                                  </span>
                                  <span className="text-xs text-yellow-700 font-medium bg-yellow-100 px-2 py-1 rounded">
                                    Unseen
                                  </span>
                                </div>
                                <p 
                                  className="text-gray-800 font-medium text-sm leading-relaxed"
                                  style={{ fontFamily: 'Faruma, Arial' }}
                                >
                                  {topic.name}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}

        {/* Study Tips */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl shadow-lg border-2 border-purple-200 p-6 mt-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-100 p-2 rounded-lg">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900">Study Strategy</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div className="space-y-2">
              <p><strong>📚 Focus Priority:</strong> These topics are statistically more likely to appear in future exams.</p>
              <p><strong>🎯 Smart Revision:</strong> Allocate more study time to unseen topics while maintaining knowledge of seen topics.</p>
              {excludeSpecimen && (
                <p><strong>🔴 Actual Exams Focus:</strong> You're viewing topics that haven't appeared in actual exams - these are high priority!</p>
              )}
            </div>
            <div className="space-y-2">
              <p><strong>⏰ Time Management:</strong> Since these haven't been tested, expect comprehensive questions that cover the entire topic.</p>
              <p><strong>🔍 Be Prepared:</strong> Exam setters often include topics that haven't appeared for a while.</p>
              {!excludeSpecimen && (
                <p><strong>💡 Pro Tip:</strong> Use the toggle to exclude specimen papers and focus only on actual exam patterns.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnseenTopics;