import React, { createContext, useContext, useState, useEffect } from 'react';
import { SUPPORTED_LANGUAGES, TRANSLATIONS } from '../i18n/languages';
import { speechService } from '../services/speechService';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [currentLang, setCurrentLang] = useState(() => {
    return localStorage.getItem('womentra_lang') || 'en';
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('womentra_theme') || 'system';
  });

  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);

  // Theme application
  useEffect(() => {
    localStorage.setItem('womentra_theme', theme);
    const root = document.documentElement;
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Language persistence
  useEffect(() => {
    localStorage.setItem('womentra_lang', currentLang);
  }, [currentLang]);

  const langConfig = SUPPORTED_LANGUAGES.find(l => l.code === currentLang) || SUPPORTED_LANGUAGES[0];

  // STRICT i18n Translator: ONLY English fallback if key missing in selected language
  const t = (key) => {
    const langDict = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
    if (langDict && langDict[key] !== undefined) {
      return langDict[key];
    }
    // Strict English fallback ONLY
    return TRANSLATIONS.en[key] || key;
  };

  const changeLanguage = (langCode, speakFeedback = true) => {
    setCurrentLang(langCode);
    localStorage.setItem('womentra_lang', langCode);
    const selected = SUPPORTED_LANGUAGES.find(l => l.code === langCode) || SUPPORTED_LANGUAGES[0];
    if (speakFeedback && selected) {
      const confirmationText = selected.code === 'en' 
        ? `Language changed to English. Welcome to Womentra!`
        : `${selected.name} தேர்ந்தெடுக்கப்பட்டது.`;
      speechService.speak(confirmationText, selected.bcp47);
    }
  };

  const toggleTheme = (newTheme) => {
    setTheme(newTheme);
  };

  return (
    <LanguageContext.Provider value={{
      currentLang,
      langConfig,
      changeLanguage,
      t,
      languages: SUPPORTED_LANGUAGES,
      isLanguageModalOpen,
      setIsLanguageModalOpen,
      theme,
      toggleTheme
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
