import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Default first-time visitors (no saved theme) to Light Editorial (false)
  const [isDark, setIsDark] = useState(() => {
    try {
      const saved = localStorage.getItem('theme');
      return saved ? JSON.parse(saved) === true : false;
    } catch {
      return false;
    }
  });

  // Dark-Mode-only isolated Dark Paper toggle for scanned past papers (default false)
  const [darkPaper, setDarkPaper] = useState(() => {
    try {
      const saved = localStorage.getItem('islam_dark_paper');
      if (saved === null) return false;
      return saved === 'true' || JSON.parse(saved) === true;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('theme', JSON.stringify(isDark));
    } catch {
      // Ignore storage errors
    }
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    try {
      localStorage.setItem('islam_dark_paper', String(darkPaper));
    } catch {
      // Ignore storage errors
    }
  }, [darkPaper]);

  const toggleTheme = () => setIsDark(prev => !prev);
  const toggleDarkPaper = () => setDarkPaper(prev => !prev);

  return (
    <ThemeContext.Provider
      value={{
        isDark,
        toggleTheme,
        darkPaper,
        toggleDarkPaper,
        invertScan: isDark && darkPaper,
        toggleInvertScan: toggleDarkPaper,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
