import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    try {
      const saved = localStorage.getItem('theme');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const [invertScan, setInvertScan] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('theme', JSON.stringify(isDark));
    } catch {
      // Ignore storage errors
    }
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);
  const toggleInvertScan = () => setInvertScan(prev => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, invertScan, toggleInvertScan }}>
      {children}
    </ThemeContext.Provider>
  );
};
