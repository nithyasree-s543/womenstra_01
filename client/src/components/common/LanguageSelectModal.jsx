import React from 'react';
import { X, Volume2, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { speechService } from '../../services/speechService';

export const LanguageSelectModal = () => {
  const { currentLang, languages, changeLanguage, isLanguageModalOpen, setIsLanguageModalOpen, t } = useLanguage();

  if (!isLanguageModalOpen) return null;

  const handleSelect = (lang) => {
    changeLanguage(lang.code, true);
    setIsLanguageModalOpen(false);
  };

  const handleSpeakSample = (e, lang) => {
    e.stopPropagation();
    speechService.speak(`यह ${lang.name} भाषा है।`, lang.bcp47);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-purple-100 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-womentra-gradient p-5 text-white flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
              <span>🗣️ {t('touchYourLanguage')}</span>
            </h3>
            <p className="text-xs text-purple-100 mt-0.5">
              Choose your native Indian language / अपनी भाषा चुनें
            </p>
          </div>
          <button
            onClick={() => setIsLanguageModalOpen(false)}
            className="p-2 rounded-full hover:bg-white/20 transition-all text-white"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Language Grid */}
        <div className="p-4 grid grid-cols-2 gap-2.5 overflow-y-auto flex-1">
          {languages.map((lang) => {
            const isSelected = currentLang === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang)}
                className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all touch-target-large ${
                  isSelected
                    ? 'bg-gradient-to-tr from-purple-100 to-pink-100 border-pink-500 ring-2 ring-pink-400 shadow-md scale-[1.02]'
                    : 'bg-slate-50/80 border-slate-200 hover:bg-purple-50 hover:border-purple-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{lang.flag}</span>
                  <div>
                    <div className="font-extrabold text-slate-900 text-base">
                      {lang.name}
                    </div>
                    <div className="text-xs text-purple-700 font-semibold">
                      {lang.script} ({lang.englishName})
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => handleSpeakSample(e, lang)}
                    className="p-1.5 rounded-lg bg-white/80 hover:bg-purple-200 text-purple-700 transition-all shadow-2xs"
                    title={`Listen sample in ${lang.name}`}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-pink-600 text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-600 font-bold">
          ⚡ आप ऐप में कभी भी अपनी भाषा बदल सकती हैं
        </div>
      </div>
    </div>
  );
};
