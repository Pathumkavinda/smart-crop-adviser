// src/components/ThemedCard.jsx
'use client';

import { useTheme } from '@/context/ThemeContext';

export default function ThemedCard({ children, className = "" }) {
  const { theme } = useTheme();
  
  return (
    <div 
      className={`rounded-lg shadow-md p-6 ${className}`}
      style={{ 
        backgroundColor: theme.colors.card,
        borderColor: theme.colors.border,
        color: theme.colors.text
      }}
    >
      {children}
    </div>
  );
}

// src/components/ThemedButton.jsx
'use client';

import { useTheme } from '@/context/ThemeContext';

export default function ThemedButton({ 
  children, 
  onClick, 
  primary = false,
  className = "" 
}) {
  const { theme } = useTheme();
  
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-md transition-colors ${className}`}
      style={{ 
        backgroundColor: primary ? theme.colors.primary : 'transparent',
        color: primary ? 'white' : theme.colors.text,
        borderColor: primary ? 'transparent' : theme.colors.border,
        border: primary ? 'none' : '1px solid'
      }}
    >
      {children}
    </button>
  );
}