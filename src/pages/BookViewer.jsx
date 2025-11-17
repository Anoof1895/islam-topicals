import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";

const BookViewer = () => {
  const [selectedGrade, setSelectedGrade] = useState(9);
  const [selectedBookType, setSelectedBookType] = useState('SB');
  const [activeTab, setActiveTab] = useState('book');
  const [notes, setNotes] = useState({});
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');
  
  const { isDark } = useTheme();

  // PDF file paths
  const pdfFiles = {
    grade9SB: "/pdfs/Grade 9 SB.pdf",
    grade9TG: "/pdfs/Grade 9 TG.pdf",
    grade10SB: "/pdfs/Grade 10 SB.pdf",
    grade10TG: "/pdfs/Grade 10 TG.pdf", 
    summary: "/pdfs/Summary.pdf"
  };

  // Load notes from localStorage
  useEffect(() => {
    const loadedNotes = {};
    [9, 10].forEach(grade => {
      ['SB', 'TG'].forEach(bookType => {
        const noteKey = `grade_${grade}_${bookType}`;
        const note = localStorage.getItem(`book_notes_${noteKey}`);
        if (note) {
          loadedNotes[noteKey] = note;
        }
      });
    });
    
    const summaryNote = localStorage.getItem(`book_notes_summary`);
    if (summaryNote) {
      loadedNotes['summary'] = summaryNote;
    }
    
    setNotes(loadedNotes);
  }, []);

  // Get current PDF URL
  const getCurrentPdfUrl = () => {
    if (activeTab === 'summary') {
      return pdfFiles.summary;
    }
    const bookKey = `grade${selectedGrade}${selectedBookType}`;
    return pdfFiles[bookKey];
  };

  // Get current book display name
  const getCurrentBookName = () => {
    if (activeTab === 'summary') {
      return 'Book Summary';
    }
    return `Grade ${selectedGrade} ${selectedBookType === 'SB' ? 'Student Book' : 'Teacher Guide'}`;
  };

  const getCurrentNoteKey = () => {
    if (activeTab === 'summary') {
      return 'summary';
    }
    return `grade_${selectedGrade}_${selectedBookType}`;
  };

  const currentNote = notes[getCurrentNoteKey()] || '';

  // Auto-save notes with debouncing
  useEffect(() => {
    if (currentNote.trim() === '') return;
    
    const timer = setTimeout(() => {
      const noteKey = getCurrentNoteKey();
      localStorage.setItem(`book_notes_${noteKey}`, currentNote);
      setSaveStatus('Auto-saved');
      setTimeout(() => setSaveStatus(''), 2000);
    }, 1500);

    return () => clearTimeout(timer);
  }, [currentNote]);

  const handleNoteChange = (value) => {
    const noteKey = getCurrentNoteKey();
    setNotes(prev => ({ ...prev, [noteKey]: value }));
  };

  const handleManualSave = () => {
    const noteKey = getCurrentNoteKey();
    localStorage.setItem(`book_notes_${noteKey}`, currentNote);
    setSaveStatus('Saved!');
    setTimeout(() => setSaveStatus(''), 2000);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className={`rounded-xl shadow-lg border-2 p-4 lg:p-6 mb-4 lg:mb-6 ${
        isDark ? 'bg-gray-800 border-blue-600' : 'bg-white border-blue-200'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className={`text-xl lg:text-2xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>Textbook Viewer</h2>
            <p className={`text-sm mt-1 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>PDF Viewer with notes</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('book')}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  activeTab === 'book'
                    ? isDark 
                      ? 'bg-blue-600 border-blue-500 text-white' 
                      : 'bg-blue-600 border-blue-500 text-white'
                    : isDark
                      ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 border-gray-300 text-gray-700 hover:bg-gray-300'
                }`}
              >
                📚 Book
              </button>
              <button
                onClick={() => setActiveTab('summary')}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  activeTab === 'summary'
                    ? isDark 
                      ? 'bg-green-600 border-green-500 text-white' 
                      : 'bg-green-600 border-green-500 text-white'
                    : isDark
                      ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 border-gray-300 text-gray-700 hover:bg-gray-300'
                }`}
              >
                📋 Summary
              </button>
            </div>
            
            {activeTab === 'book' && (
              <div className="flex gap-2">
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(parseInt(e.target.value))}
                  className={`p-2 rounded-lg border-2 transition-colors ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value={9}>Grade 9</option>
                  <option value={10}>Grade 10</option>
                </select>
                
                <select
                  value={selectedBookType}
                  onChange={(e) => setSelectedBookType(e.target.value)}
                  className={`p-2 rounded-lg border-2 transition-colors ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="SB">Student Book</option>
                  <option value="TG">Teacher Guide</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-6 min-h-0">
        {/* PDF Viewer */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className={`rounded-xl shadow-lg border-2 flex-1 flex flex-col ${
            isDark ? 'bg-gray-800 border-blue-600' : 'bg-white border-blue-200'
          }`}>
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className={`text-lg font-bold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {getCurrentBookName()}
              </h3>
              {pdfError && (
                <div className="text-red-500 text-sm">{pdfError}</div>
              )}
            </div>
            
            {/* PDF Display */}
            <div className="flex-1 min-h-0 p-4 relative">
              {pdfLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
                  <div className="flex flex-col items-center">
                    <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${
                      isDark ? 'border-blue-400' : 'border-blue-600'
                    }`}></div>
                    <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Loading PDF...
                    </p>
                  </div>
                </div>
              )}
              
              <div className={`rounded-lg border-2 w-full h-full min-h-[600px] ${
                isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
              }`}>
                <iframe 
                  src={getCurrentPdfUrl()}
                  className="w-full h-full rounded"
                  title="PDF Viewer"
                  onLoadStart={() => setPdfLoading(true)}
                  onLoad={() => {
                    setPdfLoading(false);
                    setPdfError(null);
                  }}
                  onError={() => {
                    setPdfLoading(false);
                    setPdfError(`Failed to load: ${getCurrentBookName()}`);
                  }}
                />
              </div>
              
              <div className={`mt-4 text-center text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <p>Using native PDF viewer - Use browser controls to navigate</p>
                <p className="text-xs mt-1">
                  <a 
                    href={getCurrentPdfUrl()} 
                    download 
                    className="text-blue-500 hover:underline"
                  >
                    Download PDF
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Notes Panel */}
        <div className={`lg:w-96 flex-shrink-0 rounded-xl shadow-lg border-2 p-4 lg:p-6 ${
          isDark ? 'bg-gray-800 border-green-600' : 'bg-white border-green-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <svg className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <h3 className={`text-lg lg:text-xl font-bold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                My Notes - {getCurrentBookName()}
              </h3>
            </div>
            <div className={`text-xs px-2 py-1 rounded ${
              isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
            }`}>
              {currentNote.length} chars
            </div>
          </div>
          
          <textarea
            value={currentNote}
            onChange={(e) => handleNoteChange(e.target.value)}
            placeholder={`Write your notes about ${getCurrentBookName()} here...`}
            className={`w-full h-64 p-4 rounded-lg border-2 resize-none ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />
          
          <div className="flex justify-between items-center mt-4">
            <div className={`text-xs ${
              saveStatus ? 'text-green-500' : isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {saveStatus || 'Auto-saves while typing'}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleNoteChange('')}
                className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Clear
              </button>
              <button
                onClick={handleManualSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookViewer;