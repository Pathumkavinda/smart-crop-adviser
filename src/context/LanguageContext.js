'use client';

import { createContext, useState, useContext, useEffect } from 'react';

// Import translations
import englishTranslations from '../translations/en.json';
import sinhalaTranslations from '../translations/si.json';
import tamilTranslations from '../translations/ta.json';

const translations = {
  en: englishTranslations,
  si: sinhalaTranslations,
  ta: tamilTranslations,
};

const LanguageContext = createContext({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key,
  availableLanguages: ['en', 'si', 'ta'],
});

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');
  
  useEffect(() => {
    // Get language from localStorage or use browser language
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && ['en', 'si', 'ta'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    } else {
      // Use browser language if available and supported, otherwise default to English
      const browserLang = navigator.language.split('-')[0];
      const detectedLang = ['en', 'si', 'ta'].includes(browserLang) ? browserLang : 'en';
      setLanguage(detectedLang);
      localStorage.setItem('language', detectedLang);
    }
  }, []);

  const changeLanguage = (newLang) => {
    if (['en', 'si', 'ta'].includes(newLang)) {
      setLanguage(newLang);
      localStorage.setItem('language', newLang);
    }
  };

  // Translation function
  const t = (key) => {
    // Get the current language translations
    const currentTranslations = translations[language] || {};
    
    // Return the translation or the key if translation is not found
    return currentTranslations[key] || key;
  };

  return (
    <LanguageContext.Provider 
      value={{ 
        language, 
        setLanguage: changeLanguage, 
        t,
        availableLanguages: ['en', 'si', 'ta'],
        languageNames: {
          en: 'English',
          si: 'සිංහල',
          ta: 'தமிழ்'
        }
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);