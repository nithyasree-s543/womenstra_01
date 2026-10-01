import React, { createContext, useContext, useState, useEffect } from 'react';
import { SUPPORTED_LANGUAGES, TRANSLATIONS } from '../i18n/languages';
import { speechService } from '../services/speechService';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [currentLang, setCurrentLang] = useState(() => {
    return localStorage.getItem('womentra_lang') || 'hi';
  });

  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('womentra_lang', currentLang);
  }, [currentLang]);

  const langConfig = SUPPORTED_LANGUAGES.find(l => l.code === currentLang) || SUPPORTED_LANGUAGES[0];

  const t = (key) => {
    const langDict = TRANSLATIONS[currentLang] || TRANSLATIONS.hi;
    return langDict[key] || TRANSLATIONS.hi[key] || TRANSLATIONS.en[key] || key;
  };

  const changeLanguage = (langCode, speakFeedback = true) => {
    setCurrentLang(langCode);
    localStorage.setItem('womentra_lang', langCode);
    const selected = SUPPORTED_LANGUAGES.find(l => l.code === langCode);
    if (speakFeedback && selected) {
      speechService.speak(
        `${selected.name} भाषा चुनी गई। वोमंतरा में आपका स्वागत है।`,
        selected.bcp47
      );
    }
  };

  return (
    <LanguageContext.Provider value={{
      currentLang,
      langConfig,
      changeLanguage,
      t,
      languages: SUPPORTED_LANGUAGES,
      isLanguageModalOpen,
      setIsLanguageModalOpen
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
