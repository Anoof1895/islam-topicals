import React, { useState, useMemo } from "react";
import { topicNames } from "../topicNames";
import { useTheme } from "../context/ThemeContext";

const QuizGenerator = ({ allQuestions, unitNames, questionTypes, setSelectedQuestionId, setCurrentView }) => {
  const [quizConfig, setQuizConfig] = useState({
    book: [],
    units: [],
    topics: [],
    types: [],
    numberOfQuestions: 10,
    includeSpecimen: true
  });
  const [generatedQuiz, setGeneratedQuiz] = useState(null);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const { isDark } = useTheme();

  const availableUnits = useMemo(() => {
    const units = [];
    Object.keys(topicNames).forEach(book => {
      Object.keys(topicNames[book]).forEach(unit => {
        if (!units.includes(parseInt(unit))) {
          units.push(parseInt(unit));
        }
      });
    });
    return units.sort((a, b) => a - b);
  }, []);

  // Function to extract base question number (removes trailing letters like 'a', 'b')
  const getBaseQuestionNumber = (questionNumber) => {
    // Remove any trailing letters from question number (e.g., "18a" -> "18", "15b" -> "15")
    return questionNumber.replace(/[a-z]$/i, '');
  };

  // Function to check if two questions are part of the same multi-part question
  const areQuestionsRelated = (q1, q2) => {
    return (
      q1.year === q2.year &&
      q1.paper === q2.paper &&
      q1.book === q2.book &&
      q1.unit === q2.unit &&
      getBaseQuestionNumber(q1.questionNumber) === getBaseQuestionNumber(q2.questionNumber)
    );
  };

  // Function to group related questions together
  const groupRelatedQuestions = (questions) => {
    const groups = [];
    const used = new Set();
    
    questions.forEach(question => {
      if (used.has(question.id)) return;
      
      const group = [question];
      used.add(question.id);
      
      // Find all related questions
      questions.forEach(otherQuestion => {
        if (!used.has(otherQuestion.id) && areQuestionsRelated(question, otherQuestion)) {
          group.push(otherQuestion);
          used.add(otherQuestion.id);
        }
      });
      
      // Sort by question number to maintain order (18a, 18b, etc.)
      group.sort((a, b) => a.questionNumber.localeCompare(b.questionNumber));
      groups.push(group);
    });
    
    return groups;
  };

  const generateQuiz = () => {
    let filteredQuestions = allQuestions.filter(q => {
      if (quizConfig.book.length > 0 && !quizConfig.book.includes(q.book)) return false;
      if (quizConfig.units.length > 0 && !quizConfig.units.includes(q.unit)) return false;
      if (quizConfig.types.length > 0 && !q.types.some(t => quizConfig.types.includes(t))) return false;
      if (!quizConfig.includeSpecimen) {
        const isSpecimen = (q.year === 2021 && q.paperSet === 2) || (q.year === 2020 && q.paperSet === 1);
        if (isSpecimen) return false;
      }
      return true;
    });

    // Check if we have enough questions
    if (filteredQuestions.length === 0) {
      alert("No questions found with the selected criteria. Please adjust your filters.");
      return;
    }

    // Group related questions first, then shuffle the groups
    const questionGroups = groupRelatedQuestions(filteredQuestions);
    const shuffledGroups = [...questionGroups].sort(() => 0.5 - Math.random());

    // If "All Questions" is selected, use all available questions
    const targetNumberOfQuestions = quizConfig.numberOfQuestions === 'all' 
      ? filteredQuestions.length 
      : quizConfig.numberOfQuestions;

    // Select groups until we reach the desired number of questions
    let selectedQuestions = [];
    for (let group of shuffledGroups) {
      if (selectedQuestions.length + group.length > targetNumberOfQuestions) {
        // If adding this group would exceed, skip it to maintain question count
        continue;
      }
      selectedQuestions.push(...group);
      if (selectedQuestions.length >= targetNumberOfQuestions) break;
    }

    // If we didn't get enough questions, take the first group that fits
    if (selectedQuestions.length === 0 && shuffledGroups.length > 0) {
      selectedQuestions = shuffledGroups[0].slice(0, targetNumberOfQuestions);
    }

    if (selectedQuestions.length < targetNumberOfQuestions && quizConfig.numberOfQuestions !== 'all') {
      alert(`Only ${selectedQuestions.length} questions found. Generating quiz with all available questions.`);
    }

    setGeneratedQuiz(selectedQuestions);
    setCurrentQuizIndex(0);
    setShowAnswer(false);
    setUserAnswers({});
    setQuizCompleted(false);
  };

  const handleConfigChange = (field, value) => {
    setQuizConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAnswerSubmit = (isCorrect) => {
    const currentQuestion = generatedQuiz[currentQuizIndex];
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: isCorrect
    }));
    
    // Move to next question or complete quiz
    if (currentQuizIndex === generatedQuiz.length - 1) {
      setQuizCompleted(true);
    } else {
      setCurrentQuizIndex(prev => prev + 1);
      setShowAnswer(false);
    }
  };

  const calculateScore = () => {
    if (!generatedQuiz) return { correct: 0, total: 0, percentage: 0 };
    
    const correct = generatedQuiz.filter(q => userAnswers[q.id] === true).length;
    const total = generatedQuiz.length;
    const percentage = Math.round((correct / total) * 100);
    
    return { correct, total, percentage };
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreEmoji = (percentage) => {
    if (percentage >= 80) return '🎉';
    if (percentage >= 60) return '👍';
    return '💪';
  };

  // Check if current question has related parts
  const getRelatedQuestions = (currentQuestion) => {
    if (!generatedQuiz || !currentQuestion) return [];
    
    const baseNumber = getBaseQuestionNumber(currentQuestion.questionNumber);
    return generatedQuiz.filter(q => 
      q.year === currentQuestion.year &&
      q.paper === currentQuestion.paper &&
      q.book === currentQuestion.book &&
      q.unit === currentQuestion.unit &&
      getBaseQuestionNumber(q.questionNumber) === baseNumber
    );
  };

  if (quizCompleted && generatedQuiz) {
    const { correct, total, percentage } = calculateScore();

    return (
      <div className={`rounded-xl shadow-lg border-2 p-4 lg:p-6 ${
        isDark ? 'bg-gray-800 border-green-600' : 'bg-white border-green-200'
      }`}>
        <div className="text-center mb-6 lg:mb-8">
          <div className="text-4xl lg:text-6xl mb-4">{getScoreEmoji(percentage)}</div>
          <h2 className={`text-2xl lg:text-3xl font-bold mb-2 ${getScoreColor(percentage)}`}>
            Quiz Completed!
          </h2>
          <p className={`text-base lg:text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            You scored {correct} out of {total}
          </p>
          <div className={`text-3xl lg:text-4xl font-bold mt-4 ${getScoreColor(percentage)}`}>
            {percentage}%
          </div>
        </div>

        {/* Score Breakdown */}
        <div className={`rounded-lg p-4 lg:p-6 mb-4 lg:mb-6 ${
          isDark ? 'bg-gray-700' : 'bg-gray-50'
        }`}>
          <h3 className={`text-lg lg:text-xl font-bold mb-3 lg:mb-4 ${
            isDark ? 'text-gray-200' : 'text-gray-800'
          }`}>Score Breakdown</h3>
          <div className="grid grid-cols-3 gap-3 lg:gap-4">
            <div className="text-center">
              <div className={`text-xl lg:text-2xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                {correct}
              </div>
              <div className={`text-xs lg:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Correct</div>
            </div>
            <div className="text-center">
              <div className={`text-xl lg:text-2xl font-bold ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                {total - correct}
              </div>
              <div className={`text-xs lg:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Incorrect</div>
            </div>
            <div className="text-center">
              <div className={`text-xl lg:text-2xl font-bold ${getScoreColor(percentage)}`}>
                {percentage}%
              </div>
              <div className={`text-xs lg:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Score</div>
            </div>
          </div>
        </div>

        {/* Question Review */}
        <div className={`rounded-lg p-4 lg:p-6 ${
          isDark ? 'bg-gray-700' : 'bg-gray-50'
        }`}>
          <h3 className={`text-lg lg:text-xl font-bold mb-3 lg:mb-4 ${
            isDark ? 'text-gray-200' : 'text-gray-800'
          }`}>Question Review</h3>
          <div className="space-y-3">
            {generatedQuiz.map((question, index) => {
              const userAnswer = userAnswers[question.id];
              return (
                <div
                  key={question.id}
                  className={`p-3 lg:p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    userAnswer === true
                      ? isDark ? 'bg-green-900 border-green-700' : 'bg-green-50 border-green-200'
                      : isDark ? 'bg-red-900 border-red-700' : 'bg-red-50 border-red-200'
                  }`}
                  onClick={() => {
                    setSelectedQuestionId(question.id);
                    setCurrentView('main');
                  }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex-1">
                      <span className={`font-semibold text-sm lg:text-base ${
                        isDark ? 'text-gray-200' : 'text-gray-800'
                      }`}>
                        Q{index + 1}: {unitNames[question.unit]} - {question.year} Paper {question.paper}
                      </span>
                      <div className={`text-xs mt-1 ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Question {question.questionNumber} • {userAnswer === true ? '✓ Correct' : '✗ Incorrect'}
                      </div>
                    </div>
                    <div className={`px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm font-semibold ${
                      userAnswer === true
                        ? isDark ? 'bg-green-700 text-green-200' : 'bg-green-200 text-green-800'
                        : isDark ? 'bg-red-700 text-red-200' : 'bg-red-200 text-red-800'
                    }`}>
                      {userAnswer === true ? 'Correct' : 'Incorrect'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            onClick={() => {
              setGeneratedQuiz(null);
              setQuizCompleted(false);
            }}
            className={`flex-1 py-3 text-base lg:text-lg font-semibold rounded-lg transition-all ${
              isDark 
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Create New Quiz
          </button>
          <button
            onClick={() => {
              setGeneratedQuiz(null);
              setQuizCompleted(false);
              setCurrentView('main');
            }}
            className="flex-1 py-3 text-base lg:text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all"
          >
            Back to Questions
          </button>
        </div>
      </div>
    );
  }

  if (generatedQuiz && !quizCompleted) {
    const currentQuestion = generatedQuiz[currentQuizIndex];
    const isLastQuestion = currentQuizIndex === generatedQuiz.length - 1;
    const userAnswer = userAnswers[currentQuestion.id];
    const relatedQuestions = getRelatedQuestions(currentQuestion);
    const hasMultipleParts = relatedQuestions.length > 1;
    const currentPartIndex = relatedQuestions.findIndex(q => q.id === currentQuestion.id);

    return (
      <div className="flex-1 flex flex-col min-h-0">
        {/* Quiz Header */}
        <div className={`rounded-xl shadow-lg border-2 p-4 lg:p-6 mb-4 lg:mb-6 ${
          isDark ? 'bg-gray-800 border-green-600' : 'bg-white border-green-200'
        }`}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <h2 className={`text-lg lg:text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Practice Quiz</h2>
              <p className={`text-sm mt-1 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Question {currentQuizIndex + 1} of {generatedQuiz.length}
                {hasMultipleParts && ` • Part ${currentPartIndex + 1} of ${relatedQuestions.length}`}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to end this quiz? Your progress will be lost.')) {
                    setGeneratedQuiz(null);
                  }
                }}
                className={`px-3 lg:px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  isDark 
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                End Quiz
              </button>
              <button
                onClick={() => {
                  setSelectedQuestionId(currentQuestion.id);
                  setCurrentView('main');
                }}
                className="px-3 lg:px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                View Full Question
              </button>
            </div>
          </div>
        </div>

        {/* Quiz Navigation and Progress */}
        <div className={`rounded-xl shadow-lg border-2 p-4 lg:p-6 mb-4 lg:mb-6 ${
          isDark ? 'bg-gray-800 border-green-600' : 'bg-white border-green-200'
        }`}>
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <button
              onClick={() => {
                setCurrentQuizIndex(prev => Math.max(0, prev - 1));
                setShowAnswer(false);
              }}
              disabled={currentQuizIndex === 0}
              className={`px-3 lg:px-4 py-2 text-sm font-medium rounded-lg transition-all min-h-[44px] ${
                currentQuizIndex === 0
                  ? isDark 
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : isDark
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <span className="hidden sm:inline">← Previous</span>
              <span className="sm:hidden">←</span>
            </button>

            <div className="text-center">
              <div className={`text-base lg:text-lg font-bold ${
                isDark ? 'text-green-400' : 'text-green-600'
              }`}>
                {currentQuizIndex + 1} / {generatedQuiz.length}
              </div>
              <div className={`text-xs ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Progress
              </div>
            </div>

            <button
              onClick={() => {
                if (isLastQuestion) {
                  setQuizCompleted(true);
                } else {
                  setCurrentQuizIndex(prev => prev + 1);
                  setShowAnswer(false);
                }
              }}
              disabled={!showAnswer && userAnswer === undefined}
              className={`px-3 lg:px-4 py-2 text-sm font-medium rounded-lg transition-all min-h-[44px] ${
                isLastQuestion
                  ? 'bg-green-600 text-white hover:bg-green-700 disabled:bg-green-400'
                  : isDark
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400'
              }`}
            >
              <span className="hidden sm:inline">{isLastQuestion ? 'Finish Quiz' : 'Next →'}</span>
              <span className="sm:hidden">{isLastQuestion ? 'Finish' : '→'}</span>
            </button>
          </div>

          {/* Progress Bar */}
          <div className={`w-full bg-gray-200 rounded-full h-2 mb-4 ${
            isDark ? 'bg-gray-700' : 'bg-gray-200'
          }`}>
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuizIndex + 1) / generatedQuiz.length) * 100}%` }}
            ></div>
          </div>

          {/* Multi-part Question Indicator */}
          {hasMultipleParts && (
            <div className={`rounded-lg p-3 lg:p-4 mb-4 ${
              isDark ? 'bg-blue-900 border-blue-700' : 'bg-blue-50 border-blue-200'
            } border-2`}>
              <div className="flex items-center gap-2">
                <svg className={`w-4 h-4 lg:w-5 lg:h-5 ${isDark ? 'text-blue-300' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className={`font-semibold text-sm lg:text-base ${isDark ? 'text-blue-200' : 'text-blue-800'}`}>
                  Multi-part Question: Part {currentPartIndex + 1} of {relatedQuestions.length}
                </span>
              </div>
              <p className={`text-xs lg:text-sm mt-1 ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>
                All parts of this question are included in the quiz
              </p>
            </div>
          )}

          {/* Question Info */}
          <div className={`rounded-lg p-3 lg:p-4 mb-4 lg:mb-6 ${
            isDark ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
              <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                <span className={`font-semibold ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>Book:</span>
                <span className="ml-2">Book {currentQuestion.book}</span>
              </div>
              <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                <span className={`font-semibold ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>Unit:</span>
                <span className="ml-2">{unitNames[currentQuestion.unit]}</span>
              </div>
              <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                <span className={`font-semibold ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>Year:</span>
                <span className="ml-2">{currentQuestion.year}</span>
              </div>
              <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                <span className={`font-semibold ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>Paper:</span>
                <span className="ml-2">Paper {currentQuestion.paper}</span>
              </div>
            </div>
          </div>

          {/* Toggle between Question and Answer */}
          <div className="flex gap-2 lg:gap-3 mb-4">
            <button
              onClick={() => setShowAnswer(false)}
              className={`flex-1 py-3 text-base lg:text-lg font-semibold rounded-lg transition-all border-2 min-h-[44px] ${
                !showAnswer
                  ? isDark 
                    ? 'bg-blue-600 text-white border-blue-500' 
                    : 'bg-blue-600 text-white border-blue-500'
                  : isDark
                    ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300'
              }`}
            >
              <span className="hidden sm:inline">📝 Question</span>
              <span className="sm:hidden">📝 Q</span>
            </button>
            <button
              onClick={() => setShowAnswer(true)}
              className={`flex-1 py-3 text-base lg:text-lg font-semibold rounded-lg transition-all border-2 min-h-[44px] ${
                showAnswer
                  ? isDark 
                    ? 'bg-green-600 text-white border-green-500' 
                    : 'bg-green-600 text-white border-green-500'
                  : isDark
                    ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300'
              }`}
            >
              <span className="hidden sm:inline">✅ Answer</span>
              <span className="sm:hidden">✅ A</span>
            </button>
          </div>

          {/* Question/Answer Image */}
          <div className="bg-white rounded-lg p-3 lg:p-4 border-2 border-gray-300 mb-4 lg:mb-6">
            <img
              src={showAnswer ? currentQuestion.answerImage : currentQuestion.image}
              alt={showAnswer ? `Answer ${currentQuestion.questionNumber}` : `Question ${currentQuestion.questionNumber}`}
              className="max-w-full h-auto mx-auto"
            />
          </div>

          {/* Answer Buttons - Only show when viewing answer */}
          {showAnswer && userAnswer === undefined && (
            <div className="flex flex-col sm:flex-row gap-2 lg:gap-3">
              <button
                onClick={() => handleAnswerSubmit(true)}
                className="flex-1 py-3 text-base lg:text-lg font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all min-h-[44px]"
              >
                <span className="hidden sm:inline">✓ I Got It Right</span>
                <span className="sm:hidden">✓ Correct</span>
              </button>
              <button
                onClick={() => handleAnswerSubmit(false)}
                className="flex-1 py-3 text-base lg:text-lg font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all min-h-[44px]"
              >
                <span className="hidden sm:inline">✗ I Got It Wrong</span>
                <span className="sm:hidden">✗ Wrong</span>
              </button>
            </div>
          )}

          {/* User Answer Status */}
          {userAnswer !== undefined && (
            <div className={`p-3 lg:p-4 rounded-lg text-center ${
              userAnswer 
                ? isDark ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
                : isDark ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'
            }`}>
              <div className="font-semibold text-sm lg:text-base">
                {userAnswer ? '✓ Marked as Correct' : '✗ Marked as Incorrect'}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl shadow-lg border-2 p-4 lg:p-6 ${
      isDark ? 'bg-gray-800 border-green-600' : 'bg-white border-green-200'
    }`}>
      <div className="flex items-center justify-between mb-4 lg:mb-6">
        <div>
          <h2 className={`text-xl lg:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Create Custom Quiz</h2>
          <p className={`text-base lg:text-lg mt-1 ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Generate a personalized practice test
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-4 lg:mb-6">
        {/* Book Selection */}
        <div>
          <label className={`block text-sm font-semibold mb-2 ${
            isDark ? 'text-gray-300' : 'text-gray-800'
          }`}>
            Book
          </label>
          <select
            value={quizConfig.book[0] || ''}
            onChange={(e) => handleConfigChange('book', e.target.value ? [parseInt(e.target.value)] : [])}
            className={`w-full p-3 rounded-lg border-2 transition-colors min-h-[44px] ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="">All Books</option>
            <option value="9">Book 9</option>
            <option value="10">Book 10</option>
          </select>
        </div>

        {/* Unit Selection */}
        <div>
          <label className={`block text-sm font-semibold mb-2 ${
            isDark ? 'text-gray-300' : 'text-gray-800'
          }`}>
            Units
          </label>
          <select
            multiple
            value={quizConfig.units}
            onChange={(e) => {
              const selectedUnits = Array.from(e.target.selectedOptions, option => parseInt(option.value));
              handleConfigChange('units', selectedUnits);
            }}
            className={`w-full p-3 rounded-lg border-2 transition-colors h-32 min-h-[44px] ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            {availableUnits.map(unit => (
              <option key={unit} value={unit}>
                Unit {unit}: {unitNames[unit]}
              </option>
            ))}
          </select>
          <p className={`text-xs mt-1 ${
            isDark ? 'text-gray-500' : 'text-gray-500'
          }`}>
            Hold Ctrl/Cmd to select multiple units
          </p>
        </div>

        {/* Number of Questions - Updated with All Questions option */}
        <div>
          <label className={`block text-sm font-semibold mb-2 ${
            isDark ? 'text-gray-300' : 'text-gray-800'
          }`}>
            Number of Questions
          </label>
          <select
            value={quizConfig.numberOfQuestions}
            onChange={(e) => handleConfigChange('numberOfQuestions', 
              e.target.value === 'all' ? 'all' : parseInt(e.target.value)
            )}
            className={`w-full p-3 rounded-lg border-2 transition-colors min-h-[44px] ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="5">5 Questions</option>
            <option value="10">10 Questions</option>
            <option value="15">15 Questions</option>
            <option value="20">20 Questions</option>
            <option value="30">30 Questions</option>
            <option value="all">All Questions</option>
          </select>
        </div>

        {/* Include Specimen */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="includeSpecimen"
            checked={quizConfig.includeSpecimen}
            onChange={(e) => handleConfigChange('includeSpecimen', e.target.checked)}
            className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
          />
          <label htmlFor="includeSpecimen" className={`text-sm font-semibold ${
            isDark ? 'text-gray-300' : 'text-gray-800'
          }`}>
            Include Specimen Papers
          </label>
        </div>
      </div>

      <button
        onClick={generateQuiz}
        disabled={allQuestions.length === 0}
        className="w-full py-3 lg:py-4 text-base lg:text-lg font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
      >
        🎯 Generate Quiz
      </button>

      {/* Quick Quiz Options */}
      <div className="mt-4 lg:mt-6">
        <h3 className={`text-base lg:text-lg font-semibold mb-3 ${
          isDark ? 'text-gray-300' : 'text-gray-800'
        }`}>Quick Quiz</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            onClick={() => {
              setQuizConfig({
                book: [9],
                units: [],
                topics: [],
                types: [],
                numberOfQuestions: 10,
                includeSpecimen: true
              });
              setTimeout(generateQuiz, 100);
            }}
            className="px-3 lg:px-4 py-2 lg:py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all min-h-[44px]"
          >
            Book 9 Quick Quiz (10 Questions)
          </button>
          <button
            onClick={() => {
              setQuizConfig({
                book: [10],
                units: [],
                topics: [],
                types: [],
                numberOfQuestions: 10,
                includeSpecimen: true
              });
              setTimeout(generateQuiz, 100);
            }}
            className="px-3 lg:px-4 py-2 lg:py-3 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-all min-h-[44px]"
          >
            Book 10 Quick Quiz (10 Questions)
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizGenerator;