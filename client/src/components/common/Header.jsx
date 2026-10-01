import React from 'react';
import {
  Sparkles, Volume2, VolumeX, Globe, Sun, Moon, Monitor,
  User, LogOut
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useVoiceNarrator } from '../../context/VoiceNarratorContext';
import { useAuth } from '../../context/AuthContext';

export const Header = ({ onOpenAuth, onOpenTour, currentView, onViewChange }) => {
  const { currentLang, langConfig, setIsLanguageModalOpen, t, theme, toggleTheme } = useLanguage();
  const { isSpeaking, stop, autoNarrateEnabled, setAutoNarrateEnabled, noVoiceWarning } = useVoiceNarrator();
  const { user, logout } = useAuth();

  const cycleTheme = () => {
    const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    toggleTheme(next);
  };

  const themeLabel = theme === 'light' ? t('themeLight') : theme === 'dark' ? t('themeDark') : t('themeSystem');

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0F0B1A]/95 backdrop-blur-md border-b border-purple-100 dark:border-purple-900/40 shadow-sm px-3 sm:px-4 py-2 transition-colors duration-200">

      {/* No-voice subtitle warning */}
      {noVoiceWarning && (
        <div className="bg-amber-500/10 dark:bg-amber-500/20 text-amber-900 dark:text-amber-200 text-[11px] font-semibold text-center py-1 px-2 border-b border-amber-500/20">
          ℹ️ {langConfig.name}: Browser voice unavailable. Live subtitles enabled below.
        </div>
      )}

      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">

        {/* ── Brand: logo + name + tagline ── */}
        <button
          onClick={() => onViewChange('dashboard')}
          className="flex items-center gap-2.5 text-left group focus:outline-none"
          aria-label="Womenstra Home"
        >
          <img
            src="/logo.png"
            alt="Womenstra Logo"
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl shadow-md shadow-purple-500/20 object-contain transition-transform group-hover:scale-105 shrink-0 bg-white"
            onError={(e) => { e.target.src = '/logo.svg'; }}
          />
          <div>
            {/* WOMENSTRA in Playfair Display – brand gradient text */}
            <div className="flex items-center gap-1">
              <span
                className="font-display font-black text-lg sm:text-xl tracking-widest text-womentra-gradient"
                aria-label="WOMENSTRA"
              >
                WOMENSTRA
              </span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse fill-amber-400" />
            </div>
            {/* Tagline translated in selected language */}
            <p className="text-[9px] sm:text-[10px] font-bold text-purple-700 dark:text-pink-300 tracking-wide leading-tight">
              {t('mission')}
            </p>
          </div>
        </button>

        {/* ── Right Controls ── */}
        <div className="flex items-center gap-1.5 sm:gap-2">

          {/* Auto-Voice toggle */}
          <button
            onClick={() => {
              if (isSpeaking) stop();
              setAutoNarrateEnabled(!autoNarrateEnabled);
            }}
            className={`p-2 sm:p-2.5 rounded-xl border transition-all flex items-center gap-1 touch-target-large ${
              autoNarrateEnabled
                ? 'bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
            }`}
            title="Auto-voice narrator"
            aria-label="Auto-voice narrator"
          >
            {autoNarrateEnabled
              ? <Volume2 className={`w-4 h-4 sm:w-5 sm:h-5 ${isSpeaking ? 'text-pink-600 animate-bounce' : 'text-purple-700 dark:text-purple-300'}`} />
              : <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>

          {/* Theme Toggle: Light / Dark / System */}
          <button
            onClick={cycleTheme}
            className="p-2 sm:p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-purple-300 dark:hover:border-purple-600 transition-all touch-target-large flex items-center justify-center"
            title={`Theme: ${themeLabel}`}
            aria-label={`Theme: ${themeLabel}`}
          >
            {theme === 'light'  && <Sun   className="w-4 h-4 text-amber-500" />}
            {theme === 'dark'   && <Moon  className="w-4 h-4 text-purple-400" />}
            {theme === 'system' && <Monitor className="w-4 h-4 text-slate-500 dark:text-slate-400" />}
          </button>

          {/* Language Chip */}
          <button
            onClick={() => setIsLanguageModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-slate-800 dark:to-purple-900/40 border border-purple-200 dark:border-purple-700 rounded-xl hover:border-purple-400 dark:hover:border-purple-500 transition-all shadow-sm touch-target-large"
            aria-label="Change Language"
          >
            <span className="text-base">{langConfig.flag}</span>
            <span className="text-xs font-bold text-purple-900 dark:text-purple-200">{langConfig.name}</span>
            <Globe className="w-3.5 h-3.5 text-purple-600 dark:text-pink-400 ml-0.5" />
          </button>

          {/* User Avatar / Login */}
          {user ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onViewChange('dashboard')}
                className="flex items-center gap-1.5 pl-2 pr-2.5 py-1.5 bg-purple-100 dark:bg-purple-900/40 hover:bg-purple-200 dark:hover:bg-purple-900/60 rounded-xl transition-all"
              >
                <div className="w-7 h-7 rounded-lg bg-womentra-gradient text-white flex items-center justify-center font-black text-xs shrink-0">
                  {user.name ? user.name[0].toUpperCase() : 'S'}
                </div>
                <span className="text-xs font-bold text-purple-900 dark:text-purple-200 max-w-[70px] truncate hidden sm:inline">
                  {user.name.split(' ')[0]}
                </span>
              </button>

              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950/70 text-rose-600 dark:text-rose-300 rounded-xl text-xs font-bold transition-all touch-target-large border border-rose-200 dark:border-rose-900"
                title={t('logout')}
                aria-label={t('logout')}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('logout')}</span>
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
