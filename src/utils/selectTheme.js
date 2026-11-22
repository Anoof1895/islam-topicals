// Shared react-select styles matching the Scholarly Editorial Light & Dark palettes

export const getScholarSelectStyles = (isDark) => ({
  menu: (provided) => ({
    ...provided,
    zIndex: 60,
    borderRadius: '12px',
    boxShadow: isDark
      ? '0 16px 36px -8px rgba(0, 0, 0, 0.6)'
      : '0 12px 30px -6px rgba(20, 30, 27, 0.14)',
    border: isDark ? '1px solid #1F2E29' : '1px solid #E4DFD7',
    backgroundColor: isDark ? '#111A17' : '#FFFFFF',
    overflow: 'hidden',
    padding: '4px',
  }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  control: (provided, state) => ({
    ...provided,
    minHeight: '40px',
    borderRadius: '10px',
    borderColor: state.isFocused
      ? isDark ? '#10B981' : '#0F5F4C'
      : isDark ? '#2C4039' : '#E4DFD7',
    boxShadow: state.isFocused
      ? isDark
        ? '0 0 0 3px rgba(16, 185, 129, 0.16)'
        : '0 0 0 3px rgba(15, 95, 76, 0.12)'
      : 'none',
    backgroundColor: isDark ? '#17231F' : '#FFFFFF',
    transition: 'all 150ms ease',
    cursor: state.isDisabled ? 'not-allowed' : 'pointer',
    opacity: state.isDisabled ? 0.55 : 1,
    '&:hover': {
      borderColor: state.isFocused
        ? isDark ? '#10B981' : '#0F5F4C'
        : isDark ? '#3D564E' : '#C7BEB0',
    },
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: isDark ? 'rgba(16, 185, 129, 0.16)' : '#E6F2EE',
    border: isDark ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid #C5E0D6',
    borderRadius: '8px',
    padding: '1px 4px',
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: isDark ? '#6EE7B7' : '#0F5F4C',
    fontWeight: '600',
    fontSize: '0.8rem',
    lineHeight: '1.6',
  }),
  multiValueRemove: (provided) => ({
    ...provided,
    color: isDark ? '#6EE7B7' : '#0F5F4C',
    borderRadius: '6px',
    '&:hover': {
      backgroundColor: isDark ? '#10B981' : '#0F5F4C',
      color: '#FFFFFF',
    },
  }),
  option: (provided, state) => ({
    ...provided,
    borderRadius: '8px',
    marginBottom: '2px',
    backgroundColor: state.isSelected
      ? isDark ? '#10B981' : '#0F5F4C'
      : state.isFocused
      ? isDark ? '#1D2B26' : '#F4F0EA'
      : 'transparent',
    color: state.isSelected
      ? '#FFFFFF'
      : isDark ? '#EFECE6' : '#141E1B',
    fontFamily: 'inherit',
    fontSize: '0.875rem',
    lineHeight: '1.8',
    cursor: 'pointer',
    '&:active': {
      backgroundColor: isDark ? '#253831' : '#E6F2EE',
    },
  }),
  singleValue: (provided) => ({
    ...provided,
    color: isDark ? '#EFECE6' : '#141E1B',
  }),
  input: (provided) => ({
    ...provided,
    color: isDark ? '#EFECE6' : '#141E1B',
  }),
  placeholder: (provided) => ({
    ...provided,
    color: isDark ? '#687973' : '#84928D',
    fontSize: '0.85rem',
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    color: isDark ? '#687973' : '#84928D',
    padding: '6px',
    '&:hover': {
      color: isDark ? '#EFECE6' : '#141E1B',
    },
  }),
  clearIndicator: (provided) => ({
    ...provided,
    color: isDark ? '#687973' : '#84928D',
    padding: '6px',
    '&:hover': {
      color: isDark ? '#EFECE6' : '#141E1B',
    },
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
});
