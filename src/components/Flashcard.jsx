import React from 'react';
import { FlipIcon } from './Icons';

const Flashcard = ({ topic, isFlipped, onFlip }) => {
  return (
    <div className="flashcard-scene" onClick={onFlip}>
      <div className={`flashcard-inner ${isFlipped ? 'is-flipped' : ''}`}>
        {/* FRONT OF CARD */}
        <div className="flashcard-face flashcard-front">
          <div className="card-content-center">
            <h3 className="topic-header">{topic.topicTitle}</h3>
            <div className="click-prompt inline-flex items-center gap-1.5">
              <FlipIcon className="w-4 h-4" />
              <span>Click or press Space to flip</span>
            </div>
          </div>
        </div>

        {/* BACK OF CARD */}
        <div className="flashcard-face flashcard-back" dir="rtl">
          <h4 className="back-title text-sm opacity-50 mb-4">{topic.topicTitle}</h4>
          <div className="back-content">
            {topic.paragraphs.map((paragraph, idx) => (
              <p key={idx} className="meaning-paragraph">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;
