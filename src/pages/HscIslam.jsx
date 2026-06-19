// src/pages/HscIslam.jsx

import React, { useState, useMemo } from 'react';
import './HscIslam.css';
import Flashcard from '../components/Flashcard';
import { hscModulesData } from '../hscModulesData'; // Import your new data file

export default function HscIslam() {
  const [activeTab, setActiveTab] = useState('mod1');
  const [searchQuery, setSearchQuery] = useState("");
  
  // Test Mode State
  const [testIndex, setTestIndex] = useState(0);
  const [showTestAnswer, setShowTestAnswer] = useState(false);

  // Tab definitions
  const tabs = [
    { id: 'mod1', label: 'Module 1' },
    { id: 'mod2', label: 'Module 2' },
    { id: 'mod3', label: 'Module 3' },
    { id: 'mod4', label: 'Module 4' },
    { id: 'textbooks', label: '📚 Textbooks' },
    { id: 'test', label: '🎯 Test Me' }
  ];

  // Filter topics for the currently active module
  const displayedTopics = useMemo(() => {
    if (!activeTab.startsWith('mod')) return [];
    
    const topics = hscModulesData[activeTab].topics;
    if (!searchQuery) return topics;
    
    return topics.filter(t => 
      t.topicTitle.includes(searchQuery) || 
      t.paragraphs.some(p => p.includes(searchQuery))
    );
  }, [activeTab, searchQuery]);

  // Test Mode Functions
  const startTest = () => {
    setTestIndex(Math.floor(Math.random() * hscModulesData.mod1.topics.length));
    setShowTestAnswer(false);
  };

  const nextTestQuestion = () => {
    startTest();
  };

  // Content Renderer based on Active Tab
  const renderTabContent = () => {
    // 1. Module Tabs (1-4)
    if (activeTab.startsWith('mod')) {
      const moduleInfo = hscModulesData[activeTab];
      
      if (moduleInfo.topics.length === 0) {
        return (
          <div className="empty-state">
            <div className="text-6xl mb-4">🚧</div>
            <h2>{moduleInfo.title}</h2>
            <p>Definitions for this module will be added soon!</p>
          </div>
        );
      }

      return (
        <div className="module-view animate-fade-in">
          <div className="search-bar-container">
            <input 
              type="text" 
              placeholder="Search definitions (e.g. ކުފުރު)..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="hsc-search"
              dir="rtl"
            />
          </div>

          <h2 className="main-title" dir="rtl">{moduleInfo.title}</h2>
          
          <div className="grid">
            {displayedTopics.map((topic, index) => (
              <Flashcard key={index} topic={topic} />
            ))}
            {displayedTopics.length === 0 && (
              <p className="no-results">No definitions found for your search.</p>
            )}
          </div>
        </div>
      );
    }

    // 2. Textbooks Tab
    if (activeTab === 'textbooks') {
      return (
        <div className="textbook-view animate-fade-in">
          <div className="empty-state">
            <div className="text-6xl mb-4">📖</div>
            <h2>A Level Islam Textbooks</h2>
            <p className="mb-6">Click below to read your PDF modules directly.</p>
            <div className="card-container">
              <div className="hsc-card textbook-card text-center">
                <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-2">Module 1: Aqeedah</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">HSC Islam</p>
                <a href="/pdfs/HSC Islam Module 1.pdf" target="_blank" rel="noreferrer" className="action-btn">
                  Open PDF Viewer
                </a>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 3. Test Me Tab
    if (activeTab === 'test') {
      const currentTestTopic = hscModulesData.mod1.topics[testIndex];
      
      return (
        <div className="test-mode-container animate-fade-in">
          <h2 className="test-title">Active Recall Mode</h2>
          <p className="test-instruction">Think of the definition in your head, then reveal the answer to grade yourself.</p>
          
          <div className="test-card" dir="rtl">
            <h3 className="test-topic">{currentTestTopic.topicTitle}</h3>
            
            {!showTestAnswer ? (
              <button className="reveal-btn" onClick={() => setShowTestAnswer(true)}>
                Reveal Answer
              </button>
            ) : (
              <div className="test-answer animate-fade-in">
                {currentTestTopic.paragraphs.map((p, i) => (
                  <p key={i} className="meaning-paragraph">{p}</p>
                ))}
                
                <div className="self-grade-buttons" dir="ltr">
                  <button className="grade-btn hard" onClick={nextTestQuestion}>🔴 Needs Practice</button>
                  <button className="grade-btn good" onClick={nextTestQuestion}>🟡 Getting There</button>
                  <button className="grade-btn easy" onClick={nextTestQuestion}>🟢 Got It Perfect</button>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="hsc-container">
      {/* Tab Navigation */}
      <div className="hsc-tabs-wrapper">
        <div className="hsc-tabs">
          {tabs.map(tab => (
            <button 
              key={tab.id}
              className={`hsc-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === 'test') startTest();
                setSearchQuery(""); // Clear search when switching tabs
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="hsc-main">
        {renderTabContent()}
      </main>
    </div>
  );
}