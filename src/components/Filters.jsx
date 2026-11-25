import React, { useState, useMemo } from 'react';
import Select from 'react-select';
import { useTheme } from '../context/ThemeContext';
import { getScholarSelectStyles } from '../utils/selectTheme';
import { FilterIcon, ChevronDownIcon, XIcon } from './Icons';

const Filters = ({
  options,
  selectedFilters,
  setSelectedFilters,
  onSearch,
  unitNames,
  questionTypes,
  topicNames,
  totalCount,
}) => {
  const { isDark } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  const customStyles = useMemo(() => getScholarSelectStyles(isDark), [isDark]);

  const handleChange = (field, selected) => {
    const newFilters = {
      ...selectedFilters,
      [field]: selected ? selected.map(s => s.value) : [],
    };

    if (field === 'book' || field === 'unit') {
      newFilters.topic = [];
    }

    setSelectedFilters(newFilters);
    if (onSearch) onSearch();
  };

  const toggleQuickBook = (bookNum) => {
    const currentBooks = selectedFilters.book || [];
    const exists = currentBooks.includes(bookNum);
    const nextBooks = exists && currentBooks.length === 1 ? [] : [bookNum];
    setSelectedFilters(prev => ({
      ...prev,
      book: nextBooks,
      topic: [],
    }));
    if (onSearch) onSearch();
  };

  const removeFilterValue = (field, valueToRemove) => {
    setSelectedFilters(prev => {
      const updated = (prev[field] || []).filter(v => String(v) !== String(valueToRemove));
      const next = { ...prev, [field]: updated };
      if ((field === 'book' || field === 'unit') && updated.length === 0) {
        next.topic = [];
      }
      return next;
    });
  };

  const clearAllFilters = () => {
    setSelectedFilters({});
    if (onSearch) onSearch();
  };

  const getAvailableTopics = () => {
    const selectedBook = selectedFilters.book?.[0];
    const selectedUnit = selectedFilters.unit?.[0];

    if (selectedBook && selectedUnit && topicNames?.[selectedBook]?.[selectedUnit]) {
      return Object.keys(topicNames[selectedBook][selectedUnit]).map(topicId => {
        const topicName = topicNames[selectedBook][selectedUnit][topicId];
        return {
          value: topicId,
          label: (
            <span className="inline-flex items-center gap-1.5">
              <span className="font-mono-code text-xs opacity-70">{topicId}.</span>
              <span className="dhivehi-text" lang="dv" dir="rtl">
                {topicName}
              </span>
            </span>
          ),
        };
      });
    }
    return [];
  };

  const getTopicValue = () => {
    const availableTopics = getAvailableTopics();
    return (
      selectedFilters.topic?.map(topicId => {
        const topicOption = availableTopics.find(topic => String(topic.value) === String(topicId));
        return topicOption || { value: topicId, label: `Topic ${topicId}` };
      }) || []
    );
  };

  const getPaperTypeOptions = () => [
    { value: 'specimen', label: 'Specimen Papers' },
    { value: 'actual', label: 'Actual Exam Papers' },
  ];

  const getPaperTypeValue = () =>
    selectedFilters.paperType?.map(type => {
      const option = getPaperTypeOptions().find(opt => opt.value === type);
      return option || { value: type, label: type };
    }) || [];

  const formatOptions = (field, values = []) => {
    if (field === 'topic') return getAvailableTopics();
    if (field === 'paperType') return getPaperTypeOptions();

    if (field === 'types') {
      const customOrder = [1, 2, 5, 7, 3, 6, 4];
      return customOrder
        .filter(typeId => values.includes(typeId))
        .map(typeId => ({
          value: typeId,
          label: questionTypes[typeId] || `Type ${typeId}`,
        }));
    }

    return values.map(value => {
      let label = value;
      if (field === 'unit' && unitNames?.[value]) {
        label = `Unit ${value}: ${unitNames[value]}`;
      } else if (field === 'paper') {
        label = `Paper ${value}`;
      } else if (field === 'book') {
        label = `Book ${value}`;
      }
      return { value, label };
    });
  };

  const fieldLabels = {
    book: 'Book',
    year: 'Year',
    paper: 'Paper',
    paperType: 'Paper Type',
    unit: 'Unit',
    topic: 'Topic',
    types: 'Question Type',
  };

  const filterOrder = ['book', 'year', 'paper', 'paperType', 'unit', 'topic', 'types'];

  const activeChips = [];
  filterOrder.forEach(field => {
    const vals = selectedFilters[field] || [];
    vals.forEach(val => {
      let displayLabel = String(val);
      let isDhivehi = false;
      if (field === 'book') displayLabel = `Book ${val}`;
      else if (field === 'paper') displayLabel = `Paper ${val}`;
      else if (field === 'paperType') displayLabel = val === 'specimen' ? 'Specimen' : 'Actual Papers';
      else if (field === 'unit') displayLabel = unitNames?.[val] ? `${unitNames[val]}` : `Unit ${val}`;
      else if (field === 'types') displayLabel = questionTypes?.[val] || `Type ${val}`;
      else if (field === 'topic') {
        const b = selectedFilters.book?.[0];
        const u = selectedFilters.unit?.[0];
        const tName = b && u && topicNames?.[b]?.[u]?.[val];
        if (tName) {
          displayLabel = `${val}. ${tName}`;
          isDhivehi = true;
        } else {
          displayLabel = `Topic ${val}`;
        }
      }
      activeChips.push({ field, value: val, displayLabel, isDhivehi });
    });
  });

  const activeCount = activeChips.length;

  return (
    <div className="rounded-lg bg-[var(--bg-surface)] border border-[var(--border-hairline)] transition-colors">
      {/* Compact Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2">
        <div className="flex flex-wrap items-center gap-2">
          {/* Expand/Collapse Drawer Button */}
          <button
            type="button"
            onClick={() => setIsExpanded(prev => !prev)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors ${
              isExpanded || activeCount > 0
                ? 'bg-[var(--subject-biology-bg)] text-[var(--subject-biology)] border-[var(--subject-biology-border)]'
                : 'bg-[var(--bg-inset)] text-[var(--ink-primary)] border-[var(--border-hairline)] hover:border-[var(--border-strong)]'
            }`}
          >
            <FilterIcon className="w-3.5 h-3.5" />
            <span>Filters</span>
            {activeCount > 0 && (
              <span className="font-mono-code tabular-nums text-[11px] px-1.5 rounded bg-[var(--subject-biology)] text-white">
                {activeCount}
              </span>
            )}
            <ChevronDownIcon
              className={`w-3.5 h-3.5 transition-transform duration-150 ${
                isExpanded ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Segmented Book Toggle */}
          <div className="hidden sm:inline-flex items-center rounded-lg border border-[var(--border-warm-strong)] bg-[var(--bg-surface)] p-0.5">
            <button
              type="button"
              onClick={() => {
                setSelectedFilters(prev => ({ ...prev, book: [], topic: [] }));
                if (onSearch) onSearch();
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                !selectedFilters.book?.length
                  ? 'bg-[var(--action-primary-bg)] text-[var(--action-primary-fg)]'
                  : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
              }`}
            >
              All Books
            </button>
            {(options.book || [9, 10]).map(bookNum => {
              const isActive =
                selectedFilters.book?.length === 1 && selectedFilters.book[0] === bookNum;
              return (
                <button
                  key={bookNum}
                  type="button"
                  onClick={() => toggleQuickBook(bookNum)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-[var(--action-primary-bg)] text-[var(--action-primary-fg)]'
                      : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
                  }`}
                >
                  Book {bookNum}
                </button>
              );
            })}
          </div>

          {/* Quick Unit Pills on Wide Desktop */}
          <div className="hidden xl:flex items-center gap-1">
            {(options.unit || []).map(unitNum => {
              const isActive = selectedFilters.unit?.includes(unitNum);
              return (
                <button
                  key={unitNum}
                  type="button"
                  onClick={() => {
                    const curr = selectedFilters.unit || [];
                    const next = isActive ? curr.filter(u => u !== unitNum) : [...curr, unitNum];
                    setSelectedFilters(prev => ({ ...prev, unit: next, topic: [] }));
                    if (onSearch) onSearch();
                  }}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                    isActive
                      ? 'bg-[var(--subject-islam-bg)] text-[var(--subject-islam)] border-[var(--subject-islam-border)]'
                      : 'bg-transparent text-[var(--ink-secondary)] border-transparent hover:bg-[var(--bg-subtle)] hover:text-[var(--ink-primary)]'
                  }`}
                >
                  {unitNames?.[unitNum] || `Unit ${unitNum}`}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Total Count + Clear */}
        <div className="flex items-center gap-2 ml-auto">
          {activeCount > 0 && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-[var(--ink-secondary)] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <XIcon className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
          {typeof totalCount === 'number' && (
            <span className="font-mono-code tabular-nums text-xs px-2.5 py-1 rounded-md bg-[var(--bg-inset)] text-[var(--ink-secondary)] border border-[var(--border-hairline)]">
              {totalCount} found
            </span>
          )}
        </div>
      </div>

      {/* Active Filter Chips Bar */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 px-3 sm:px-4 pb-2.5 pt-0.5">
          {activeChips.map((chip, idx) => (
            <button
              key={`${chip.field}-${chip.value}-${idx}`}
              type="button"
              onClick={() => removeFilterValue(chip.field, chip.value)}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-[var(--subject-biology-bg)] text-[var(--subject-biology)] border border-[var(--subject-biology-border)] hover:bg-[var(--subject-biology)] hover:text-white transition-colors group"
              title="Remove filter"
            >
              <span className={chip.isDhivehi ? 'dhivehi-text text-xs leading-relaxed' : ''}>
                {chip.displayLabel}
              </span>
              <XIcon className="w-3 h-3 opacity-75 group-hover:opacity-100" />
            </button>
          ))}
        </div>
      )}

      {/* Collapsible Full Multi-Select Tray */}
      {isExpanded && (
        <div className="px-3 sm:px-4 pb-4 pt-3 border-t border-[var(--border-hairline)] bg-[var(--bg-inset)] rounded-b-lg animate-fade-up">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
            {filterOrder.map(field => {
              const isTopicDisabled =
                field === 'topic' && (!selectedFilters.book?.[0] || !selectedFilters.unit?.[0]);
              return (
                <div key={field} className="flex flex-col">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-muted)] mb-1.5">
                    {fieldLabels[field] || field}
                  </label>
                  <Select
                    options={formatOptions(field, options[field])}
                    isMulti
                    placeholder={isTopicDisabled ? 'Pick book & unit' : 'All'}
                    value={
                      field === 'topic'
                        ? getTopicValue()
                        : field === 'paperType'
                        ? getPaperTypeValue()
                        : selectedFilters[field]?.map(val => {
                            const formatted = formatOptions(field, [val])[0];
                            return formatted || { value: val, label: val };
                          }) || []
                    }
                    onChange={selected => handleChange(field, selected)}
                    styles={customStyles}
                    className="text-xs sm:text-sm"
                    isDisabled={isTopicDisabled}
                    menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Filters;
