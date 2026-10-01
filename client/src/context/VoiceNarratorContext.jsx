import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { speechService } from '../services/speechService';
import { useLanguage } from './LanguageContext';

const VoiceNarratorContext = createContext(null);

export const VoiceNarratorProvider = ({ children }) => {
  const { currentLang, langConfig } = useLanguage();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [activeSubtitle, setActiveSubtitle] = useState('');
  const [autoNarrateEnabled, setAutoNarrateEnabled] = useState(true);
  const [isDidiModalOpen, setIsDidiModalOpen] = useState(false);
  const [noVoiceWarning, setNoVoiceWarning] = useState(false);

  useEffect(() => {
    return () => speechService.cancel();
  }, [currentLang]);

  const speak = useCallback((text, customLang = null) => {
    if (!text) return;
    speechService.cancel();
    setCurrentText(text);
    setActiveSubtitle(text);
    setIsSpeaking(true);

    const bcp47 = customLang || langConfig?.bcp47 || 'en-IN';
    
    // Check if voice exists
    const hasVoice = speechService.hasVoiceForLanguage(bcp47);
    if (!hasVoice && bcp47 !== 'en-IN') {
      setNoVoiceWarning(true);
    } else {
      setNoVoiceWarning(false);
    }

    speechService.speak(
      text,
      bcp47,
      () => {
        setIsSpeaking(false);
        setCurrentText('');
      },
      () => {
        setNoVoiceWarning(true);
      }
    );
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
    setActiveSubtitle('');
  }, []);

  return (
    <VoiceNarratorContext.Provider value={{
      speak,
      stop,
      narrateScreen,
      isSpeaking,
      currentText,
      activeSubtitle,
      autoNarrateEnabled,
      setAutoNarrateEnabled,
      isDidiModalOpen,
      setIsDidiModalOpen,
      noVoiceWarning,
      setNoVoiceWarning
    }}>
      {children}
    </VoiceNarratorContext.Provider>
  );
};

export const useVoiceNarrator = () => useContext(VoiceNarratorContext);
