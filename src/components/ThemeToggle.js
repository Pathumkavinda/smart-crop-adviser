// src/components/ThemeToggle.js
"use client";
import { useContext } from 'react';
import { ThemeContext } from '@/context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  
  return (
    <button 
      onClick={toggleTheme}
      className="p-2 rounded-full hover:bg-opacity-80 transition-colors"
      style={{ 
        backgroundColor: theme.colors.secondary,
        color: theme.colors.background
      }}
      aria-label={`Switch to ${theme.name === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme.name === 'light' ? '🌙' : '☀️'}
    </button>
  );
}