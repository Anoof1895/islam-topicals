import React, { useState } from 'react';

const Flashcard = ({ topic }) => {
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <div className="flashcard-scene" onClick={() => setIsRevealed(!isRevealed)}>
      <div className={`flashcard-inner ${isRevealed ? 'is-flipped' : ''}`}>
        
        {/* FRONT OF CARD */}
        <div className="flashcard-face flashcard-front">
          <div className="card-content-center">
            <h3 className="topic-header">{topic.topicTitle}</h3>
            <div className="click-prompt">
              <span className="icon text-xl">🔄</span> 
              <span>Click to flip</span>
            </div>
          </div>
        </div>

        {/* BACK OF CARD */}
        <div className="flashcard-face flashcard-back" dir="rtl">
          <h4 className="back-title text-sm opacity-50 mb-4">{topic.topicTitle}</h4>
          <div className="back-content">
            {topic.paragraphs.map((paragraph, idx) => (
              <p key={idx} className="meaning-paragraph">{paragraph}</p>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Flashcard;