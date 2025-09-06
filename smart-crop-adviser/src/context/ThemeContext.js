// src/context/ThemeContext.js
'use client';

import { createContext, useState, useContext, useEffect } from 'react';

// Define theme properties
export const themes = {
  light: {
    name: 'light',
    colors: {
      primary: '#4CAF50',
      secondary: '#8BC34A',
      background: '#ffffff',
      text: '#333333',
      card: '#f5f5f5',
      border: '#e0e0e0',
      navBg: '#ffffff',
      navText: '#333333'
    }
  },
  dark: {
    name: 'dark',
    colors: {
      primary: '#2E7D32',
      secondary: '#689F38',
      background: '#121212',
      text: '#e0e0e0',
      card: '#1e1e1e',
      border: '#333333',
      navBg: '#121212',
      navText: '#ffffff'
    }
  }
};

export const ThemeContext = createContext({
  theme: themes.light,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(themes.light);
  
  // Initialize theme from localStorage
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        setTheme(themes.dark);
      } else {
        setTheme(themes.light);
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      setTheme(themes.light);
    }
  }, []);
  
  // Apply theme to document
  useEffect(() => {
    console.log('Applying theme:', theme.name); // Debug log
    
    // Set data-theme attribute on the document element
    document.documentElement.setAttribute('data-theme', theme.name);
    document.documentElement.style.backgroundColor = theme.colors.background;
    document.documentElement.style.color = theme.colors.text;
    
    // Add/remove dark class for Tailwind CSS
    if (theme.name === 'dark') {
      document.documentElement.classList.add('dark');
      console.log('Added dark class to document'); // Debug log
    } else {
      document.documentElement.classList.remove('dark');
      console.log('Removed dark class from document'); // Debug log
    }
    
    // Save theme preference
    try {
      localStorage.setItem('theme', theme.name);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [theme]);
  
  // Toggle between light and dark themes
  const toggleTheme = () => {
    setTheme(prevTheme => 
      prevTheme.name === 'light' ? themes.dark : themes.light
    );
  };
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook for easier theme access
export function useTheme() {
  return useContext(ThemeContext);
}