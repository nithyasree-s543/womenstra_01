import React from 'react';
import { 
  Sparkles, Volume2, VolumeX, Globe, Sun, Moon, Monitor, 
  User, Award, Flame, LogOut, PhoneCall 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useVoiceNarrator } from '../../context/VoiceNarratorContext';
import { useAuth } from '../../context/AuthContext';

export const Header = ({ onOpenAuth, onOpenTour, currentView, onViewChange }) => {
  const { currentLang, langConfig, setIsLanguageModalOpen, t, theme, toggleTheme } = useLanguage();
  const { isSpeaking, stop, autoNarrateEnabled, setAutoNarrateEnabled, noVoiceWarning } = useVoiceNarrator();
  const { user, activeDependent, setActiveDependent, logout } = useAuth();

  const getNextTheme = () => {
    if (theme === 'light') return 'dark';
    if (theme === 'dark') return 'system';
    return 'light';
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-purple-100 dark:border-slate-800 shadow-xs px-3 sm:px-4 py-2 transition-colors duration-200">
      
      {/* Subtitle Notice if browser has no native voice for selected Indian language */}
      {noVoiceWarning && (
        <div className="bg-amber-500/10 dark:bg-amber-500/20 text-amber-900 dark:text-amber-200 text-[11px] font-semibold text-center py-1 px-2 border-b border-amber-500/20">
          ℹ️ {langConfig.name}: Browser voice unavailable. Live subtitles enabled below.
        </div>
      )}

      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
        
        {/* Brand Logo & Name with Logo Image and Tagline */}
        <button 
          onClick={() => onViewChange('dashboard')}
          className="flex items-center gap-2.5 text-left group focus:outline-hidden"
          aria-label="Womentra Home"
        >
          <img
            src="/logo.svg"
            alt="Womentra Logo"
            className="w-10 h-10 rounded-2xl shadow-md shadow-purple-500/20 transition-transform group-hover:scale-105 shrink-0 object-contain"
          />
          <div>
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-womentra-gradient">
                WOMENTRA
              </span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse fill-amber-400" />
            </div>
            <p className="text-[9px] sm:text-[10px] font-bold text-purple-700 dark:text-pink-400 tracking-wider">
              {t('mission')}
            </p>
          </div>
        </button>

        {/* Right Controls: Auto-Voice, Theme Toggle, Language Chip, Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* Audio Auto-Narrator Toggle */}
          <button
            onClick={() => {
              if (isSpeaking) stop();
              setAutoNarrateEnabled(!autoNarrateEnabled);
            }}
            className={`p-2 sm:p-2.5 rounded-xl border transition-all flex items-center gap-1 touch-target-large ${
              autoNarrateEnabled 
                ? 'bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300' 
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
            }`}
            title="Auto-voice narrator"
            aria-label="Auto-voice narrator"
          >
            {autoNarrateEnabled ? (
              <Volume2 className={`w-4 h-4 sm:w-5 sm:h-5 ${isSpeaking ? 'text-pink-600 animate-bounce' : 'text-purple-700 dark:text-purple-300'}`} />
            ) : (
              <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>

          {/* Theme Toggle (Light / Dark / System) */}
          <button
            onClick={() => toggleTheme(getNextTheme())}
            className="p-2 sm:p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-purple-300 transition-all touch-target-large flex items-center justify-center"
            title={`Theme: ${theme}`}
            aria-label="Theme toggle"
          >
            {theme === 'light' && <Sun className="w-4 h-4 text-amber-500" />}
            {theme === 'dark' && <Moon className="w-4 h-4 text-purple-400" />}
            {theme === 'system' && <Monitor className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Language Chip (Globe + Current Language Name) */}
          <button
            onClick={() => setIsLanguageModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-slate-800 dark:to-purple-950 border border-purple-200 dark:border-purple-800 rounded-xl hover:border-purple-400 transition-all shadow-xs touch-target-large"
            aria-label="Change Language"
          >
            <span className="text-base">{langConfig.flag}</span>
            <span className="text-xs font-bold text-purple-900 dark:text-purple-200">{langConfig.name}</span>
            <Globe className="w-3.5 h-3.5 text-purple-600 dark:text-pink-400 ml-0.5" />
          </button>

          {/* User Profile / Login */}
          {user ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onViewChange('dashboard')}
                className="flex items-center gap-1.5 pl-2 pr-2.5 py-1.5 bg-purple-100 dark:bg-purple-950 hover:bg-purple-200 rounded-xl transition-all"
              >
                <div className="w-7 h-7 rounded-lg bg-womentra-gradient text-white flex items-center justify-center font-bold text-xs">
                  {user.name ? user.name[0] : 'S'}
                </div>
                <span className="text-xs font-bold text-purple-900 dark:text-purple-200 max-w-[70px] truncate hidden sm:inline">
                  {user.name.split(' ')[0]}
                </span>
              </button>

              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-rose-600 rounded-xl"
                title={t('logout')}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3 sm:px-3.5 py-2 bg-womentra-gradient text-white rounded-xl text-xs font-bold shadow-md shadow-pink-500/20 hover:opacity-95 transition-all touch-target-large flex items-center gap-1.5"
            >
              <User className="w-4 h-4" />
              <span>{t('loginWithPhone')}</span>
            </button>
          )}

        </div>
      </div>
    </header>
  );
};
