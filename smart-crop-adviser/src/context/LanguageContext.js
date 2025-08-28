'use client';

import { createContext, useState, useContext, useEffect } from 'react';

// Import translations
import englishTranslations from '../translations/en.json';
import sinhalaTranslations from '../translations/si.json';
import tamilTranslations from '../translations/ta.json';

// Organize all translations
const translationsData = {
  en: englishTranslations,
  si: sinhalaTranslations,
  ta: tamilTranslations,
};

// Language names for display
const languageNames = {
  en: 'English',
  si: 'සිංහල',
  ta: 'தமிழ்'
};

// Create the context with default values
export const LanguageContext = createContext({
  language: 'en',
  setLanguage: () => {},
  translations: {},
  t: (key) => key,
  availableLanguages: ['en', 'si', 'ta'],
  languageNames: languageNames
});

export const LanguageProvider = ({ children }) => {
  // Initialize with default language
  const [language, setLanguage] = useState('en');
  const [translations, setTranslations] = useState(translationsData.en || {});

  // Load language preference from localStorage when component mounts (client-side only)
  useEffect(() => {
    try {
      // Get language from localStorage or use browser language
      const savedLanguage = localStorage.getItem('language');
      if (savedLanguage && ['en', 'si', 'ta'].includes(savedLanguage)) {
        setLanguage(savedLanguage);
        setTranslations(translationsData[savedLanguage] || {});
      } else {
        // Use browser language if available and supported, otherwise default to English
        const browserLang = navigator.language.split('-')[0];
        const detectedLang = ['en', 'si', 'ta'].includes(browserLang) ? browserLang : 'en';
        setLanguage(detectedLang);
        setTranslations(translationsData[detectedLang] || {});
        localStorage.setItem('language', detectedLang);
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      // Use default English if there's an error
      setLanguage('en');
      setTranslations(translationsData.en || {});
    }
  }, []);

  // Function to change the language
  const changeLanguage = (newLang) => {
    if (['en', 'si', 'ta'].includes(newLang)) {
      setLanguage(newLang);
      setTranslations(translationsData[newLang] || {});
      try {
        localStorage.setItem('language', newLang);
      } catch (error) {
        console.error('Error writing to localStorage:', error);
      }
    }
  };

  // Translation function
  const t = (key) => {
    // Support for nested keys like "nav.home"
    if (key.includes('.')) {
      const keys = key.split('.');
      let result = translations;
      
      for (const k of keys) {
        if (result && typeof result === 'object' && k in result) {
          result = result[k];
        } else {
          return key; // Key not found, return the original key
        }
      }
      
      return result || key;
    }
    
    // Return the translation or the key if translation is not found
    return translations[key] || key;
  };

  return (
    <LanguageContext.Provider 
      value={{ 
        language, 
        setLanguage: changeLanguage, 
        translations,
        t,
        availableLanguages: ['en', 'si', 'ta'],
        languageNames
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook for using the language context
export const useLanguage = () => useContext(LanguageContext);

// Sample structure for translation files (en.json, si.json, ta.json):
/*
{
  "brand": "Smart Crop Adviser",
  "nav": {
    "home": "Home",
    "dashboard": "Dashboard",
    "adviser": "Adviser",
    "history": "History",
    "info": "Information",
    "profile": "Profile"
  },
  "auth": {
    "login": "Login",
    "register": "Sign Up",
    "logout": "Logout",
    "signedInAs": "Signed in as"
  },
  "language": {
    "select": "Language"
  },
  "theme": {
    "title": "Theme",
    "light": "Light",
    "dark": "Dark"
  }
}
*/