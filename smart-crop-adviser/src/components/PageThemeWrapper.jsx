// src/components/PageThemeWrapper.jsx
'use client';

import { useTheme } from '@/context/ThemeContext';

export default function PageThemeWrapper({ children }) {
  const { theme } = useTheme();
  const isDark = theme.name === 'dark';
  
  // Apply theme to root elements - but don't override admin pages
  return (
    <div 
      className={`min-h-screen transition-colors duration-300 ${
        isDark ? 'text-white' : 'text-gray-900'
      }`}
    >
      {children}
    </div>
  );
}