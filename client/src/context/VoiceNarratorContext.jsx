import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { speechService } from '../services/speechService';
import { useLanguage } from './LanguageContext';

const VoiceNarratorContext = createContext(null);

export const VoiceNarratorProvider = ({ children }) => {
  const { currentLang, langConfig } = useLanguage();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [autoNarrateEnabled, setAutoNarrateEnabled] = useState(true);
  const [isDidiModalOpen, setIsDidiModalOpen] = useState(false);

  // Stop speech when component unmounts or language changes
  useEffect(() => {
    return () => speechService.cancel();
  }, [currentLang]);

  const speak = useCallback((text, customLang = null) => {
    if (!text) return;
    speechService.cancel();
    setCurrentText(text);
    setIsSpeaking(true);

    const bcp47 = customLang || langConfig?.bcp47 || 'hi-IN';
    speechService.speak(text, bcp47, () => {
      setIsSpeaking(false);
      setCurrentText('');
    });
  }, [langConfig]);

  const narrateScreen = useCallback((screenNarrativeText) => {
    if (autoNarrateEnabled && screenNarrativeText) {
      speak(screenNarrativeText);
    }
  }, [autoNarrateEnabled, speak]);

  const stop = useCallback(() => {
    speechService.cancel();
    setIsSpeaking(false);
    setCurrentText('');
  }, []);

  return (
    <VoiceNarratorContext.Provider value={{
      speak,
      stop,
      narrateScreen,
      isSpeaking,
      currentText,
      autoNarrateEnabled,
      setAutoNarrateEnabled,
      isDidiModalOpen,
      setIsDidiModalOpen
    }}>
      {children}
    </VoiceNarratorContext.Provider>
  );
};

export const useVoiceNarrator = () => useContext(VoiceNarratorContext);
