import { useState, useEffect } from 'react';

export function useTheme() {
  // 1. Initialize state from localStorage or fallback to light mode
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || document.documentElement.getAttribute('data-theme') || 'light'
  );

  // 2. Automatically sync the DOM and localStorage whenever the theme state changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // 3. The toggle function
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // 4. Return the values so components can use them
  return { theme, toggleTheme };
}