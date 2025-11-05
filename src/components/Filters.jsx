import React, { useState } from "react";
import Select from "react-select";
import { useTheme } from "../context/ThemeContext";

const Filters = ({ options, selectedFilters, setSelectedFilters, onSearch, unitNames, questionTypes, topicNames }) => {
  const { isDark } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleChange = (field, selected) => {
    const newFilters = {
      ...selectedFilters,
      [field]: selected ? selected.map(s => s.value) : [],
    };

    if (field === 'book' || field === 'unit') {
      newFilters.topic = [];
    }

    setSelectedFilters(newFilters);
  };

  const customStyles = {
    menu: (provided) => ({ 
      ...provided, 
      zIndex: 9999,
      borderRadius: '8px',
      boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      border: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
      backgroundColor: isDark ? '#1f2937' : '#ffffff',
    }),
    control: (provided, state) => ({ 
      ...provided, 
      minHeight: '44px',
      borderRadius: '8px',
      borderColor: state.isFocused 
        ? '#3b82f6' 
        : isDark ? '#4b5563' : '#d1d5db',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
      backgroundColor: state.isFocused 
        ? isDark ? '#374151' : '#f8fafc'
        : isDark ? '#1f2937' : '#ffffff',
      '&:hover': {
        borderColor: state.isFocused ? '#3b82f6' : isDark ? '#6b7280' : '#9ca3af'
      }
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: isDark ? '#3730a3' : '#e0e7ff',
      borderRadius: '6px',
      padding: '2px 6px',
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: isDark ? '#e0e7ff' : '#3730a3',
      fontWeight: '600',
      fontSize: '0.875rem',
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: isDark ? '#e0e7ff' : '#3730a3',
      '&:hover': {
        backgroundColor: isDark ? '#4f46e5' : '#3730a3',
        color: 'white',
      },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? '#3b82f6'
        : state.isFocused
        ? isDark ? '#374151' : '#f3f4f6'
        : isDark ? '#1f2937' : '#ffffff',
      color: state.isSelected
        ? 'white'
        : isDark ? '#f9fafb' : '#1f2937',
      '&:active': {
        backgroundColor: isDark ? '#4b5563' : '#e5e7eb',
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: isDark ? '#f9fafb' : '#1f2937',
    }),
    input: (provided) => ({
      ...provided,
      color: isDark ? '#f9fafb' : '#1f2937',
    }),
    placeholder: (provided) => ({
      ...provided,
      color: isDark ? '#9ca3af' : '#6b7280',
    }),
  };

  // Get available topics based on selected book and unit
  const getAvailableTopics = () => {
    const selectedBook = selectedFilters.book?.[0];
    const selectedUnit = selectedFilters.unit?.[0];
    
    if (selectedBook && selectedUnit && topicNames && topicNames[selectedBook] && topicNames[selectedBook][selectedUnit]) {
      return Object.keys(topicNames[selectedBook][selectedUnit]).map(topicId => ({
        value: topicId,
        label: `${topicId} - ${topicNames[selectedBook][selectedUnit][topicId]}`
      }));
    }
    
    // If no book/unit selected, return empty array (no topics to show)
    return [];
  };

  // Get the current value for the topic dropdown
  const getTopicValue = () => {
    const availableTopics = getAvailableTopics();
    return selectedFilters.topic?.map(topicId => {
      const topicOption = availableTopics.find(topic => topic.value === topicId);
      return topicOption || { value: topicId, label: `Topic ${topicId}` };
    }) || [];
  };

  // Format options for the new paper type filter
  const getPaperTypeOptions = () => {
    return [
      { value: 'specimen', label: 'Specimen Papers' },
      { value: 'actual', label: 'Actual Exam Papers' }
    ];
  };

  // Get the current value for paper type filter
  const getPaperTypeValue = () => {
    return selectedFilters.paperType?.map(type => {
      const option = getPaperTypeOptions().find(opt => opt.value === type);
      return option || { value: type, label: type };
    }) || [];
  };

  const formatOptions = (field, values) => {
    // For topic field, use the filtered available topics
    if (field === 'topic') {
      return getAvailableTopics();
    }

    // For paperType field, use the specimen/actual options
    if (field === 'paperType') {
      return getPaperTypeOptions();
    }

    return values.map(value => {
      let label = value;
      
      if (field === 'unit' && unitNames && unitNames[value]) {
        label = `Unit ${value}: ${unitNames[value]}`;
      } else if (field === 'types' && questionTypes && questionTypes[value]) {
        label = questionTypes[value];
      } else if (field === 'paper') {
        label = `Paper ${value}`;
      } else if (field === 'book') {
        label = `Book ${value}`;
      }
      
      return { value, label };
    });
  };

  const clearAllFilters = () => {
    setSelectedFilters({});
  };

  const fieldLabels = {
    book: 'Book',
    year: 'Year', 
    paper: 'Paper',
    paperType: 'Paper Type',
    unit: 'Unit',
    topic: 'Topic',
    types: 'Type'
  };

  // Define the order of filters
  const filterOrder = ['book', 'year', 'paper', 'paperType', 'unit', 'topic', 'types'];

  return (
    <div className={`rounded-xl shadow-sm border-2 p-4 lg:p-6 transition-colors duration-300 ${
      isDark
        ? 'bg-gray-800 border-blue-900 text-white'
        : 'bg-white border-blue-200 text-gray-900'
    }`}>
      {/* Mobile Header with Expand/Collapse */}
      <div className="lg:hidden flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold">Filter Questions</h2>
          <p className={`text-xs mt-1 ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Tap to {isExpanded ? 'collapse' : 'expand'} filters
          </p>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`p-2 rounded-lg transition-all ${
            isDark 
              ? 'bg-gray-700 hover:bg-gray-600' 
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          <svg className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">Filter Questions</h2>
          <p className={`text-sm mt-1 ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Refine your search by selecting criteria below
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={clearAllFilters}
            className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow ${
              isDark
                ? 'bg-gray-700 text-gray-200 border border-gray-600 hover:bg-gray-600'
                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Clear All
          </button>
          <button
            onClick={onSearch}
            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow"
          >
            Apply Filters
          </button>
        </div>
      </div>
      
      {/* Filter Grid - Mobile: 1 column, Desktop: 7 columns */}
      <div className={`grid gap-3 transition-all duration-300 ${
        isExpanded || window.innerWidth >= 1024 
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-7' 
          : 'hidden lg:grid lg:grid-cols-7'
      }`}>
        {filterOrder.map((field) => {
          if (field === 'paperSet') return null;
          
          return (
            <div key={field} className="flex flex-col">
              <label className={`block text-sm font-semibold mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-800'
              }`}>
                {fieldLabels[field] || field}
              </label>
              <Select
                options={formatOptions(field, options[field])}
                isMulti
                placeholder={
                  field === 'topic' && (!selectedFilters.book?.[0] || !selectedFilters.unit?.[0]) 
                    ? "Select book & unit first" 
                    : "All"
                }
                value={
                  field === 'topic' ? getTopicValue() :
                  field === 'paperType' ? getPaperTypeValue() :
                  selectedFilters[field]?.map(val => {
                    const formatted = formatOptions(field, [val])[0];
                    return formatted || { value: val, label: val };
                  }) || []
                }
                onChange={(selected) => handleChange(field, selected)}
                styles={customStyles}
                className="text-sm"
                isDisabled={
                  field === 'topic' && (!selectedFilters.book?.[0] || !selectedFilters.unit?.[0])
                }
              />
            </div>
          );
        })}
      </div>

      {/* Mobile Action Buttons */}
      <div className={`lg:hidden flex gap-3 mt-4 ${
        isExpanded ? 'flex' : 'hidden'
      }`}>
        <button
          onClick={clearAllFilters}
          className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all ${
            isDark
              ? 'bg-gray-700 text-gray-200 border border-gray-600 hover:bg-gray-600'
              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Clear All
        </button>
        <button
          onClick={onSearch}
          className="flex-1 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default Filters;