import React, { useState, useMemo } from 'react';
import { topicNames } from '../topicNames';
import SmartText from '../components/SmartText';
import { BookOpenIcon, CheckIcon, CompassIcon, SparklesIcon, ScrollTextIcon } from '../components/Icons';

const UnseenTopics = ({
  allQuestions,
  predictedQuestions = [],
  unitNames,
  onOpenPastPapers,
  onOpenPredicted,
  onOpenDefinitions,
  onOpenTextbooks,
}) => {
  const [excludeSpecimen, setExcludeSpecimen] = useState(false);
  const [activeTab, setActiveTab] = useState('unseen'); // 'unseen' | 'coverage'
  const [selectedBookTab, setSelectedBookTab] = useState('all'); // 'all' | '9' | '10'

  // Count how many times each topic appeared in past papers
  const topicCounts = useMemo(() => {
    const counts = {};
    allQuestions.forEach(question => {
      if (excludeSpecimen) {
        const isSpecimen =
          (question.year === 2021 && question.paperSet === 2) ||
          (question.year === 2020 && question.paperSet === 1);
        if (isSpecimen) return;
      }

      const { book, unit, topic } = question;
      if (!counts[book]) counts[book] = {};
      if (!counts[book][unit]) counts[book][unit] = {};

      const topicStr = String(topic);
      const parts = topicStr.includes('_') ? topicStr.split('_') : [topicStr];
      parts.forEach(t => {
        const tNum = parseInt(t, 10);
        if (!isNaN(tNum)) {
          counts[book][unit][tNum] = (counts[book][unit][tNum] || 0) + 1;
        }
      });
    });
    return counts;
  }, [allQuestions, excludeSpecimen]);

  // Count predicted questions per topic
  const predictedCounts = useMemo(() => {
    const counts = {};
    predictedQuestions.forEach(q => {
      const { book, unit, topic } = q;
      if (!counts[book]) counts[book] = {};
      if (!counts[book][unit]) counts[book][unit] = {};
      const parts = String(topic).includes('_') ? String(topic).split('_') : [String(topic)];
      parts.forEach(t => {
        const tNum = parseInt(t, 10);
        if (!isNaN(tNum)) {
          counts[book][unit][tNum] = (counts[book][unit][tNum] || 0) + 1;
        }
      });
    });
    return counts;
  }, [predictedQuestions]);

  // Full syllabus matrix + unseen summary
  const syllabusMatrix = useMemo(() => {
    const result = {};
    let totalTopics = 0;
    let totalSeen = 0;
    let totalUnseen = 0;

    Object.keys(topicNames).forEach(book => {
      const bookNum = parseInt(book, 10);
      result[bookNum] = { units: {}, total: 0, seen: 0, unseen: 0 };

      Object.keys(topicNames[book]).forEach(unit => {
        const unitNum = parseInt(unit, 10);
        const unitTopicList = Object.keys(topicNames[book][unit])
          .map(topic => {
            const topicNum = parseInt(topic, 10);
            const count = topicCounts[bookNum]?.[unitNum]?.[topicNum] || 0;
            const predCount = predictedCounts[bookNum]?.[unitNum]?.[topicNum] || 0;
            return {
              id: topicNum,
              name: topicNames[book][unit][topic],
              appearances: count,
              predictedCount: predCount,
            };
          })
          .sort((a, b) => a.id - b.id);

        const unitSeen = unitTopicList.filter(t => t.appearances > 0).length;
        const unitUnseen = unitTopicList.length - unitSeen;

        result[bookNum].units[unitNum] = {
          topics: unitTopicList,
          seen: unitSeen,
          unseen: unitUnseen,
          total: unitTopicList.length,
        };

        result[bookNum].total += unitTopicList.length;
        result[bookNum].seen += unitSeen;
        result[bookNum].unseen += unitUnseen;

        totalTopics += unitTopicList.length;
        totalSeen += unitSeen;
        totalUnseen += unitUnseen;
      });
    });

    return { books: result, totalTopics, totalSeen, totalUnseen };
  }, [topicCounts, predictedCounts]);

  const booksToRender = useMemo(() => {
    const keys = Object.keys(syllabusMatrix.books);
    if (selectedBookTab === 'all') return keys;
    return keys.filter(k => k === selectedBookTab);
  }, [syllabusMatrix.books, selectedBookTab]);

  const coveragePct = syllabusMatrix.totalTopics
    ? Math.round((syllabusMatrix.totalSeen / syllabusMatrix.totalTopics) * 100)
    : 0;

  return (
    <div className="max-w-6xl mx-auto w-full space-y-5 animate-fade-up">
      {/* Header Card */}
      <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-[var(--shadow-card)] p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[var(--accent-gold-soft)] text-[var(--accent-gold)] flex items-center justify-center flex-shrink-0">
              <CompassIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-serif-editorial text-2xl sm:text-3xl font-semibold text-[var(--text-primary)]">
                Unseen Topics &amp; Syllabus Coverage
              </h1>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                Identify topics that haven&apos;t appeared in{' '}
                {excludeSpecimen ? 'actual exam papers' : 'past papers'} yet — click any topic to jump directly to predictions or revision tools.
              </p>
            </div>
          </div>

          {/* Summary Stat Chips */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="px-4 py-2.5 rounded-xl bg-[var(--accent-gold-soft)] border border-[var(--accent-gold)]/25 text-center">
              <div className="font-mono-code text-2xl font-bold text-[var(--accent-gold)]">
                {syllabusMatrix.totalUnseen}
              </div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                Unseen
              </div>
            </div>
            <div className="px-4 py-2.5 rounded-xl bg-[var(--accent-primary-soft)] border border-[var(--accent-primary)]/25 text-center">
              <div className="font-mono-code text-2xl font-bold text-[var(--accent-primary)]">
                {coveragePct}%
              </div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                Tested
              </div>
            </div>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="mt-5 pt-4 border-t border-[var(--border-hairline)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* View Tabs + Book Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex p-1 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-hairline)]">
              <button
                type="button"
                onClick={() => setActiveTab('unseen')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'unseen'
                    ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-2xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Unseen Only ({syllabusMatrix.totalUnseen})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('coverage')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'coverage'
                    ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-2xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Full Syllabus Frequency ({syllabusMatrix.totalTopics})
              </button>
            </div>

            <div className="inline-flex p-1 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-hairline)]">
              {[
                { id: 'all', label: 'All Books' },
                { id: '9', label: 'Book 9' },
                { id: '10', label: 'Book 10' },
              ].map(b => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setSelectedBookTab(b.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedBookTab === b.id
                      ? 'bg-[var(--accent-primary)] text-white shadow-2xs'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* Exclude Specimen Toggle */}
          <label className="inline-flex items-center gap-3 cursor-pointer select-none">
            <button
              type="button"
              role="switch"
              aria-checked={excludeSpecimen}
              onClick={() => setExcludeSpecimen(prev => !prev)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                excludeSpecimen ? 'bg-[var(--accent-primary)]' : 'bg-[var(--border-strong)]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-2xs ${
                  excludeSpecimen ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <div className="text-xs">
              <div className="font-semibold text-[var(--text-primary)]">
                Exclude Specimen Papers
              </div>
              <div className="text-[11px] text-[var(--text-muted)]">
                {excludeSpecimen ? 'Actual exams only' : 'Actual + Specimen'}
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Empty State when Unseen = 0 and on unseen tab */}
      {activeTab === 'unseen' && syllabusMatrix.totalUnseen === 0 ? (
        <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-[var(--shadow-card)] p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[var(--accent-primary-soft)] text-[var(--accent-primary)] flex items-center justify-center mx-auto mb-4">
            <CheckIcon className="w-7 h-7" />
          </div>
          <h2 className="font-serif-editorial text-2xl font-semibold text-[var(--text-primary)] mb-2">
            {excludeSpecimen
              ? 'All Topics Have Appeared in Actual Exams!'
              : 'All Topics Have Appeared!'}
          </h2>
          <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto mb-5">
            Every syllabus topic has appeared at least once. Switch to <strong>Full Syllabus Frequency</strong> above to spot low-frequency topics worth reviewing.
          </p>
          <button
            type="button"
            onClick={() => setActiveTab('coverage')}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primary-hover)] transition-colors"
          >
            View Frequency Breakdown
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {booksToRender.map(bookKey => {
            const bookData = syllabusMatrix.books[bookKey];
            const bookPct = bookData.total ? Math.round((bookData.seen / bookData.total) * 100) : 0;

            return (
              <div
                key={bookKey}
                className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-[var(--shadow-card)] overflow-hidden"
              >
                {/* Book Header with Coverage Bar */}
                <div className="px-5 py-4 border-b border-[var(--border-hairline)] bg-[var(--bg-subtle)]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="font-serif-editorial text-xl font-semibold text-[var(--text-primary)]">
                      Book {bookKey} — Grade {bookKey} Syllabus
                    </h2>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                      {bookData.unseen} unseen topic{bookData.unseen !== 1 ? 's' : ''} • {bookData.seen} of {bookData.total} topics tested
                    </p>
                  </div>

                  <div className="w-full sm:w-52">
                    <div className="flex justify-between text-[11px] font-mono-code font-semibold text-[var(--text-secondary)] mb-1">
                      <span>Coverage</span>
                      <span>{bookPct}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[var(--border-hairline)] overflow-hidden">
                      <div
                        className="h-full bg-[var(--accent-primary)] rounded-full transition-all duration-500"
                        style={{ width: `${bookPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Units */}
                <div className="p-5 space-y-6">
                  {Object.keys(bookData.units).map(unitKey => {
                    const unitData = bookData.units[unitKey];
                    const visibleTopics =
                      activeTab === 'unseen'
                        ? unitData.topics.filter(t => t.appearances === 0)
                        : unitData.topics;

                    if (visibleTopics.length === 0) return null;

                    return (
                      <div key={unitKey}>
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2.5">
                            <span className="font-mono-code text-xs font-bold px-2 py-1 rounded-lg bg-[var(--accent-primary-soft)] text-[var(--accent-primary)]">
                              Unit {unitKey}
                            </span>
                            <h3 className="font-serif-editorial text-lg font-semibold text-[var(--text-primary)]">
                              {unitNames[unitKey] || `Unit ${unitKey}`}
                            </h3>
                          </div>
                          <span className="font-mono-code text-xs text-[var(--text-muted)]">
                            {unitData.seen}/{unitData.total} tested
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {visibleTopics.map(topic => {
                            const isUnseen = topic.appearances === 0;
                            const isRare = topic.appearances === 1;

                            return (
                              <div
                                key={topic.id}
                                className={`rounded-xl p-4 border flex flex-col justify-between gap-3 transition-all ${
                                  isUnseen
                                    ? 'bg-[var(--accent-gold-soft)]/60 border-[var(--accent-gold)]/35'
                                    : 'bg-[var(--bg-canvas)] border-[var(--border-hairline)]'
                                }`}
                              >
                                <div>
                                  <div className="flex items-center justify-between gap-2 mb-2">
                                    <span className="font-mono-code text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-[var(--text-secondary)]">
                                      Topic {topic.id}
                                    </span>

                                    <span
                                      className={`font-mono-code text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                        isUnseen
                                          ? 'bg-[var(--accent-gold)] text-white'
                                          : isRare
                                          ? 'bg-amber-500/15 text-[var(--accent-gold)]'
                                          : 'bg-[var(--accent-primary-soft)] text-[var(--accent-primary)]'
                                      }`}
                                    >
                                      {isUnseen ? 'Unseen (0×)' : `${topic.appearances}× tested`}
                                    </span>
                                  </div>

                                  <SmartText
                                    as="p"
                                    className="text-sm sm:text-base font-medium text-[var(--text-primary)] text-right w-full leading-[2]"
                                  >
                                    {topic.name}
                                  </SmartText>
                                </div>

                                {/* Interactive Topic Action Pills */}
                                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[var(--border-hairline)]/70">
                                  {topic.appearances > 0 && onOpenPastPapers && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        onOpenPastPapers({
                                          book: [parseInt(bookKey, 10)],
                                          unit: [parseInt(unitKey, 10)],
                                          topic: [String(topic.id)],
                                        })
                                      }
                                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold bg-[var(--accent-primary-soft)] text-[var(--accent-primary)] hover:bg-[var(--accent-primary)] hover:text-white transition-colors"
                                    >
                                      <BookOpenIcon className="w-3 h-3" />
                                      <span>{topic.appearances} Past Q{topic.appearances !== 1 ? 's' : ''}</span>
                                    </button>
                                  )}

                                  {topic.predictedCount > 0 && onOpenPredicted && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        onOpenPredicted({
                                          book: [parseInt(bookKey, 10)],
                                          unit: [parseInt(unitKey, 10)],
                                          topic: [String(topic.id)],
                                        })
                                      }
                                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold bg-[var(--accent-gold-soft)] text-[var(--accent-gold)] border border-[var(--accent-gold)]/25 hover:bg-[var(--accent-gold)] hover:text-white transition-colors"
                                    >
                                      <SparklesIcon className="w-3 h-3" />
                                      <span>{topic.predictedCount} Predicted</span>
                                    </button>
                                  )}

                                  {onOpenDefinitions && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        onOpenDefinitions({
                                          book: [parseInt(bookKey, 10)],
                                          unit: [parseInt(unitKey, 10)],
                                        })
                                      }
                                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                                    >
                                      <ScrollTextIcon className="w-3 h-3" />
                                      <span>Definitions</span>
                                    </button>
                                  )}

                                  {isUnseen && topic.predictedCount === 0 && onOpenTextbooks && (
                                    <button
                                      type="button"
                                      onClick={onOpenTextbooks}
                                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                                    >
                                      <BookOpenIcon className="w-3 h-3" />
                                      <span>Textbook</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UnseenTopics;
