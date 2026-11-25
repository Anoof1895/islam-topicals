// Shared react-select styles calibrated to v0.4 Academic Ivory & Oxford Slate tokens

export const getScholarSelectStyles = (isDark) => ({
  menu: (provided) => ({
    ...provided,
    zIndex: 60,
    borderRadius: '8px',
    boxShadow: isDark
      ? '0 12px 28px -10px rgba(2, 6, 23, 0.8)'
      : '0 10px 24px -10px rgba(15, 23, 42, 0.16)',
    border: isDark ? '1px solid #243146' : '1px solid #E2E0D8',
    backgroundColor: isDark ? '#111827' : '#FFFFFF',
    overflow: 'hidden',
    padding: '4px',
  }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  control: (provided, state) => ({
    ...provided,
    minHeight: '38px',
    borderRadius: '8px',
    borderColor: state.isFocused
      ? isDark ? '#4ADE80' : '#15803D'
      : isDark ? '#243146' : '#E2E0D8',
    boxShadow: state.isFocused
      ? isDark
        ? '0 0 0 2px rgba(74, 222, 128, 0.2)'
        : '0 0 0 2px rgba(21, 128, 61, 0.14)'
      : 'none',
    backgroundColor: isDark ? '#162033' : '#FFFFFF',
    transition: 'border-color 150ms cubic-bezier(0.22, 1, 0.36, 1)',
    cursor: state.isDisabled ? 'not-allowed' : 'pointer',
    opacity: state.isDisabled ? 0.55 : 1,
    '&:hover': {
      borderColor: state.isFocused
        ? isDark ? '#4ADE80' : '#15803D'
        : isDark ? '#334155' : '#CBD5E1',
    },
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: isDark ? 'rgba(34, 197, 94, 0.16)' : '#F0FDF4',
    border: isDark ? '1px solid rgba(74, 222, 128, 0.35)' : '1px solid #BBF7D0',
    borderRadius: '6px',
    padding: '1px 4px',
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: isDark ? '#4ADE80' : '#15803D',
    fontWeight: '600',
    fontSize: '0.78rem',
    lineHeight: '1.5',
  }),
  multiValueRemove: (provided) => ({
    ...provided,
    color: isDark ? '#4ADE80' : '#15803D',
    borderRadius: '4px',
    '&:hover': {
      backgroundColor: isDark ? '#4ADE80' : '#15803D',
      color: isDark ? '#0F172A' : '#FFFFFF',
    },
  }),
  option: (provided, state) => ({
    ...provided,
    borderRadius: '6px',
    marginBottom: '2px',
    backgroundColor: state.isSelected
      ? isDark ? '#F1F5F9' : '#0F172A'
      : state.isFocused
      ? isDark ? '#1E293B' : '#F1EFE9'
      : 'transparent',
    color: state.isSelected
      ? isDark ? '#0F172A' : '#FFFFFF'
      : isDark ? '#F1F5F9' : '#0F172A',
    fontFamily: 'inherit',
    fontSize: '0.85rem',
    lineHeight: '1.7',
    cursor: 'pointer',
    '&:active': {
      backgroundColor: isDark ? '#243146' : '#E2E0D8',
    },
  }),
  singleValue: (provided) => ({
    ...provided,
    color: isDark ? '#F1F5F9' : '#0F172A',
  }),
  input: (provided) => ({
    ...provided,
    color: isDark ? '#F1F5F9' : '#0F172A',
  }),
  placeholder: (provided) => ({
    ...provided,
    color: isDark ? '#94A3B8' : '#64748B',
    fontSize: '0.82rem',
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    color: isDark ? '#94A3B8' : '#64748B',
    padding: '6px',
    '&:hover': {
      color: isDark ? '#F1F5F9' : '#0F172A',
    },
  }),
  clearIndicator: (provided) => ({
    ...provided,
    color: isDark ? '#94A3B8' : '#64748B',
    padding: '6px',
    '&:hover': {
      color: isDark ? '#F1F5F9' : '#0F172A',
    },
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
});
