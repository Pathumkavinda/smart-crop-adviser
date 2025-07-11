// src/components/PageThemeWrapper.jsx
'use client';

import { useTheme } from '@/context/ThemeContext';

export default function PageThemeWrapper({ children }) {
  const { theme } = useTheme();
  const isDark = theme.name === 'dark';
  
  // Apply theme to root elements
  return (
    <div 
      className="min-h-screen transition-colors duration-300"
      style={{ 
        backgroundColor: theme.colors.background,
        color: theme.colors.text,
      }}
    >
      {children}
    </div>
  );
}