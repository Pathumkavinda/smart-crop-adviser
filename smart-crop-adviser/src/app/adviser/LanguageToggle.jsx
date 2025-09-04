import { useState } from 'react';
import { Languages, Check, ChevronDown } from 'lucide-react';

// A reusable language toggle component to select between English, Sinhala, and Tamil
const LanguageToggle = ({ 
  selectedLanguage, 
  onLanguageChange, 
  isDark, 
  theme 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const languages = [
    { id: 'english', name: 'English', flag: '🇬🇧' },
    { id: 'sinhala', name: 'සිංහල', englishName: 'Sinhala', flag: '🇱🇰' },
    { id: 'tamil', name: 'தமிழ்', englishName: 'Tamil', flag: '🇱🇰' }
  ];
  
  const currentLanguage = languages.find(lang => lang.id === selectedLanguage) || languages[0];
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2 border rounded-lg transition-colors"
        style={{
          backgroundColor: isDark ? 'rgba(30,30,30,0.9)' : '#fff',
          borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
          color: theme.colors.text
        }}
      >
        <div className="flex items-center gap-2">
          <Languages className="h-4 w-4" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }} />
          <span className="font-medium">
            {currentLanguage.flag} {currentLanguage.name}
            {currentLanguage.englishName && ` (${currentLanguage.englishName})`}
          </span>
        </div>
        <ChevronDown className="h-4 w-4" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }} />
      </button>
      
      {isOpen && (
        <div 
          className="absolute z-10 mt-1 w-full overflow-hidden border rounded-lg shadow-lg"
          style={{
            backgroundColor: isDark ? 'rgba(30,30,30,0.95)' : '#fff',
            borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'
          }}
        >
          {languages.map((language) => (
            <div
              key={language.id}
              className="flex items-center justify-between px-4 py-3 cursor-pointer hover:opacity-80 transition-opacity"
              style={{
                backgroundColor: selectedLanguage === language.id
                  ? (isDark ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.1)')
                  : 'transparent',
                borderBottom: language !== languages[languages.length-1]
                  ? `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`
                  : 'none',
                color: theme.colors.text
              }}
              onClick={() => {
                onLanguageChange(language.id);
                setIsOpen(false);
              }}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{language.flag}</span>
                <span className="font-medium">{language.name}</span>
                {language.englishName && (
                  <span style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                    ({language.englishName})
                  </span>
                )}
              </div>
              
              {selectedLanguage === language.id && (
                <Check className="h-4 w-4" style={{ color: isDark ? '#6EE7B7' : '#059669' }} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageToggle;