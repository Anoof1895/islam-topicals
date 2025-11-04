import React from "react";
import Select from "react-select";

const Filters = ({ options, selectedFilters, setSelectedFilters, onSearch, unitNames, questionTypes, topicNames }) => {
  const handleChange = (field, selected) => {
    const newFilters = {
      ...selectedFilters,
      [field]: selected ? selected.map(s => s.value) : [],
    };

    // If book or unit changes, clear the topic filter
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
      border: '1px solid #e5e7eb'
    }),
    control: (provided, state) => ({ 
      ...provided, 
      minHeight: '44px',
      borderRadius: '8px',
      borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
      backgroundColor: state.isFocused ? '#f8fafc' : '#ffffff',
      '&:hover': {
        borderColor: state.isFocused ? '#3b82f6' : '#9ca3af'
      }
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: '#e0e7ff',
      borderRadius: '6px',
      padding: '2px 6px',
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: '#3730a3',
      fontWeight: '600',
      fontSize: '0.875rem',
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: '#3730a3',
      '&:hover': {
        backgroundColor: '#3730a3',
        color: 'white',
      },
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
    <div className="bg-white rounded-xl shadow-sm border-2 border-blue-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Filter Questions</h2>
          <p className="text-gray-600 text-sm mt-1">Refine your search by selecting criteria below</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={clearAllFilters}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow"
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
      
      {/* Horizontal filter row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
        {filterOrder.map((field) => {
          // Skip paperSet since we're replacing it with paperType
          if (field === 'paperSet') return null;
          
          return (
            <div key={field} className="flex flex-col">
              <label className="block text-sm font-semibold text-gray-800 mb-2">
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
    </div>
  );
};

export default Filters;