import React, { useState, useMemo, useEffect } from 'react';
import './HscIslam.css';
import { hscModulesData } from '../hscModulesData';

// Component for Definition Flashcards (For Active Recall)
const Flashcard = ({ term, paragraphs }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  
  useEffect(() => setIsFlipped(false), [term]); // Reset on new topic

  return (
    <div className="flashcard-scene" onClick={() => setIsFlipped(!isFlipped)}>
      <div className={`flashcard-inner ${isFlipped ? 'is-flipped' : ''}`}>
        <div className="flashcard-face flashcard-front">
          <h3 className="topic-title" dir="rtl">{term}</h3>
          <span className="click-prompt">Click to flip</span>
        </div>
        <div className="flashcard-face flashcard-back" dir="rtl">
          {paragraphs.map((paragraph, idx) => (
            <p key={idx} className="meaning-paragraph">{paragraph}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

// Component for Definitions (Blue Theme Accordion)
const AccordionCard = ({ term, paragraphs }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => setIsOpen(false), [term]);

  return (
    <div className={`hsc-accordion def-card ${isOpen ? 'open' : ''}`}>
      <button className="accordion-header" onClick={() => setIsOpen(!isOpen)} dir="rtl">
        <div className="title-wrapper">
          <span className="badge def-badge">تعريف</span>
          <h3 className="topic-title">{term}</h3>
        </div>
        <span className="accordion-icon">{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen && (
        <div className="accordion-content animate-slide-down" dir="rtl">
          {paragraphs.map((paragraph, idx) => (
            <p key={idx} className="meaning-paragraph">{paragraph}</p>
          ))}
        </div>
      )}
    </div>
  );
};

// Component for Key Points & Lists (Green Theme Accordion)
const ListCard = ({ heading, points }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => setIsOpen(false), [heading]);

  return (
    <div className={`hsc-accordion list-card ${isOpen ? 'open' : ''}`}>
      <button className="accordion-header list-header" onClick={() => setIsOpen(!isOpen)} dir="rtl">
        <div className="title-wrapper">
          <span className="badge list-badge">ނުކުތާ</span>
          <h3 className="topic-title list-title">{heading}</h3>
        </div>
        <span className="accordion-icon">{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen && (
        <div className="accordion-content animate-slide-down" dir="rtl">
          <ul className="hsc-bullet-list">
            {points.map((point, idx) => (
              <li key={idx} className="meaning-paragraph">{point}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default function HscIslam() {
  const [activeTab, setActiveTab] = useState('mod1');
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTopicTitle, setActiveTopicTitle] = useState("");
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  
  // New States for Progress & View Mode
  const [viewMode, setViewMode] = useState('notes'); // 'notes' or 'flashcards'
  const [masteredTopics, setMasteredTopics] = useState(() => {
    const saved = localStorage.getItem('hscMasteredTopics');
    return saved ? JSON.parse(saved) : [];
  });

  const tabs = [
    { id: 'mod1', label: 'Module 1' },
    { id: 'mod2', label: 'Module 2' },
    { id: 'mod3', label: 'Module 3' },
    { id: 'mod4', label: 'Module 4' },
    { id: 'facts', label: '💡 Random Facts' },
    { id: 'textbooks', label: '📚 Textbooks' }
  ];

  const displayedTopics = useMemo(() => {
    if (!activeTab.startsWith('mod')) return [];
    const moduleInfo = hscModulesData[activeTab];
    if (!moduleInfo) return [];

    const topics = moduleInfo.topics || [];
    if (!searchQuery) return topics;
    
    return topics.filter(t => {
      const matchTitle = t.topicTitle.includes(searchQuery);
      const matchDefs = (t.definitions || []).some(d => d.term.includes(searchQuery) || d.paragraphs.some(p => p.includes(searchQuery)));
      const matchPoints = (t.keyPoints || []).some(kp => kp.heading.includes(searchQuery) || kp.points.some(p => p.includes(searchQuery)));
      return matchTitle || matchDefs || matchPoints;
    });
  }, [activeTab, searchQuery]);

  useEffect(() => {
    if (activeTab.startsWith('mod')) {
      if (displayedTopics.length > 0) {
        if (!displayedTopics.find(t => t.topicTitle === activeTopicTitle)) {
          setActiveTopicTitle(displayedTopics[0].topicTitle);
        }
      } else {
        setActiveTopicTitle("");
      }
    }
  }, [displayedTopics, activeTopicTitle, activeTab]);

  const toggleMastered = (topicTitle) => {
    setMasteredTopics(prev => {
      const newMastered = prev.includes(topicTitle) 
        ? prev.filter(t => t !== topicTitle)
        : [...prev, topicTitle];
      localStorage.setItem('hscMasteredTopics', JSON.stringify(newMastered));
      return newMastered;
    });
  };

  const generateRandomFact = () => {
    const facts = hscModulesData.mod1?.randomFacts || [];
    if (facts.length > 0) {
      let newIndex = currentFactIndex;
      while (newIndex === currentFactIndex && facts.length > 1) {
        newIndex = Math.floor(Math.random() * facts.length);
      }
      setCurrentFactIndex(newIndex);
    }
  };

  const renderTabContent = () => {
    if (activeTab === 'textbooks') {
      return (
        <div className="empty-state animate-fade-in">
          <div className="text-6xl mb-4">📖</div>
          <h2>AS Level Islam Textbooks</h2>
          <p className="mb-6 font-sans">Click below to read your PDF modules directly.</p>
          <div className="card-container">
            <div className="hsc-card textbook-card text-center">
              <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-2 font-sans">Module 1: Aqeedah</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 font-sans">HSC Islam Module 1.pdf</p>
              <a href="/pdfs/HSC Islam Module 1.pdf" target="_blank" rel="noreferrer" className="action-btn font-sans">
                Open PDF Viewer
              </a>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'facts') {
      const facts = hscModulesData.mod1?.randomFacts || [];
      if (facts.length === 0) return <div className="empty-state"><h2>No facts available.</h2></div>;
      
      return (
        <div className="fact-file-container animate-fade-in">
          <div className="fact-card-wrapper">
            <div className="textbook-fact-box" dir="rtl">
              <div className="textbook-fact-inner">
                <div className="textbook-fact-header">
                  ތިޔަދަރިވަރުންނަށް އެނގޭތަ!
                </div>
                <div className="textbook-fact-body">
                  {facts[currentFactIndex]}
                </div>
              </div>
            </div>
            <button className="action-btn next-fact-btn font-sans" onClick={generateRandomFact}>
              🎲 Generate Another Fact
            </button>
          </div>
        </div>
      );
    }

    const moduleInfo = hscModulesData[activeTab];
    if (!moduleInfo || moduleInfo.topics.length === 0) {
      return (
        <div className="empty-state animate-fade-in">
          <div className="text-6xl mb-4">🚧</div>
          <h2 dir="rtl">{moduleInfo?.title || 'Coming Soon'}</h2>
          <p className="font-sans">Content for this module will be added soon!</p>
        </div>
      );
    }

    const activeTopicData = displayedTopics.find(t => t.topicTitle === activeTopicTitle);
    const isMastered = masteredTopics.includes(activeTopicTitle);
    
    // Progress calculation
    const moduleTopics = moduleInfo.topics;
    const masteredInModule = moduleTopics.filter(t => masteredTopics.includes(t.topicTitle)).length;
    const progressPercent = Math.round((masteredInModule / moduleTopics.length) * 100) || 0;

    return (
      <div className="module-view animate-fade-in">
        <div className="search-bar-container">
          <input 
            type="text" 
            placeholder="🔍 Search notes and definitions..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="hsc-search"
            dir="rtl"
          />
        </div>
        
        <div className="module-layout">
          {/* Sidebar */}
          <aside className="topic-sidebar" dir="rtl">
            <div className="sidebar-header font-sans" dir="ltr">
              <span className="sidebar-title">Syllabus Topics</span>
              <span className="topic-count">{displayedTopics.length}</span>
            </div>
            
            {/* Progress Bar inside Sidebar */}
            <div className="sidebar-progress" dir="ltr">
              <div className="progress-text font-sans">
                <span>Mastery Progress</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
              </div>
            </div>

            <div className="sidebar-scroll-area">
              {displayedTopics.map((topic, index) => {
                const mastered = masteredTopics.includes(topic.topicTitle);
                return (
                  <button 
                    key={index}
                    className={`sidebar-btn ${activeTopicTitle === topic.topicTitle ? 'active' : ''} ${mastered ? 'mastered' : ''}`}
                    onClick={() => {
                      setActiveTopicTitle(topic.topicTitle);
                      window.scrollTo({ top: 0, behavior: 'smooth' }); 
                    }}
                  >
                    <span className="sidebar-icon">{mastered ? '✅' : '📘'}</span>
                    <span className="sidebar-text">{topic.topicTitle}</span>
                  </button>
                );
              })}
              {displayedTopics.length === 0 && <p className="no-results font-sans">No content found.</p>}
            </div>
          </aside>

          {/* Main Content Area */}
          <section className="topic-content-area">
            {activeTopicData ? (
              <div className="animate-fade-in">
                
                <div className="content-header-row">
                  {/* View Mode Toggle */}
                  <div className="view-toggle font-sans" dir="ltr">
                    <button className={viewMode === 'notes' ? 'active' : ''} onClick={() => setViewMode('notes')}>📝 Notes</button>
                    <button className={viewMode === 'flashcards' ? 'active' : ''} onClick={() => setViewMode('flashcards')}>🎴 Flashcards</button>
                  </div>
                  
                  <h2 className="content-area-title" dir="rtl">{activeTopicData.topicTitle}</h2>
                </div>
                
                <div className="accordion-stack">
                  
                  {/* Flashcard Mode */}
                  {viewMode === 'flashcards' && (
                    <div className="flashcard-grid">
                      {activeTopicData.definitions?.length > 0 ? (
                        activeTopicData.definitions.map((def, idx) => (
                          <Flashcard key={`fc-${activeTopicTitle}-${idx}`} term={def.term} paragraphs={def.paragraphs} />
                        ))
                      ) : (
                        <div className="empty-state-small font-sans">No definitions to memorize in this topic.</div>
                      )}
                    </div>
                  )}

                  {/* Notes Mode */}
                  {viewMode === 'notes' && (
                    <>
                      {activeTopicData.keyPoints && activeTopicData.keyPoints.length > 0 && (
                        <div className="section-group">
                          {activeTopicData.keyPoints.map((kp, idx) => (
                            <ListCard key={`kp-${activeTopicTitle}-${idx}`} heading={kp.heading} points={kp.points} />
                          ))}
                        </div>
                      )}

                      {activeTopicData.definitions && activeTopicData.definitions.length > 0 && (
                        <div className="section-group">
                          {activeTopicData.definitions.map((def, idx) => (
                            <AccordionCard key={`def-${activeTopicTitle}-${idx}`} term={def.term} paragraphs={def.paragraphs} />
                          ))}
                        </div>
                      )}
                    </>
                  )}
                  
                  {(!activeTopicData.keyPoints?.length && !activeTopicData.definitions?.length) && (
                    <div className="empty-state-small font-sans">No study material listed for this topic yet.</div>
                  )}
                </div>

                {/* Mark as Mastered Button */}
                <div className="mastery-footer font-sans">
                  <button 
                    className={`mastery-btn ${isMastered ? 'is-mastered' : ''}`}
                    onClick={() => toggleMastered(activeTopicTitle)}
                  >
                    {isMastered ? '✅ Topic Mastered' : 'Mark as Mastered'}
                  </button>
                </div>

              </div>
            ) : (
              <div className="empty-state-small font-sans">Select a topic from the menu to begin studying.</div>
            )}
          </section>
        </div>
      </div>
    );
  };

  return (
    <div className="hsc-container">
      <div className="hsc-tabs-wrapper font-sans">
        <div className="hsc-tabs">
          {tabs.map(tab => (
            <button 
              key={tab.id}
              className={`hsc-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(tab.id);
                setSearchQuery("");
                if(tab.id === 'facts') generateRandomFact();
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