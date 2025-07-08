// src/components/ThemeWrapper.jsx
'use client';

import { useTheme } from '@/context/ThemeContext';

export default function ThemeWrapper({ children, className = "" }) {
  const { theme } = useTheme();
  
  return (
    <div 
      className={`themed-container ${className}`}
      style={{ 
        backgroundColor: theme.colors.background,
        color: theme.colors.text,
        minHeight: '100%'
      }}
    >
      {children}
    </div>
  );
}