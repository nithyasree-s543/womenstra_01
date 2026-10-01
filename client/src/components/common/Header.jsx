import React from 'react';
import { Sparkles, Volume2, VolumeX, Globe, Bell, Shield, User, Award, Flame } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useVoiceNarrator } from '../../context/VoiceNarratorContext';
import { useAuth } from '../../context/AuthContext';

export const Header = ({ onOpenAuth, onOpenTour, currentView, onViewChange }) => {
  const { langConfig, setIsLanguageModalOpen, t } = useLanguage();
  const { isSpeaking, stop, autoNarrateEnabled, setAutoNarrateEnabled } = useVoiceNarrator();
  const { user, activeDependent, setActiveDependent, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-purple-100 shadow-xs px-4 py-2.5">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <button 
          onClick={() => onViewChange('dashboard')}
          className="flex items-center gap-2.5 text-left group focus:outline-hidden"
          aria-label="Womentra Home"
        >
          <div className="w-10 h-10 rounded-2xl bg-womentra-gradient flex items-center justify-center shadow-md shadow-purple-500/20 text-white font-black text-xl tracking-tight transition-transform group-hover:scale-105">
            W
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-xl tracking-tight text-womentra-gradient">
                WOMENTRA
              </span>
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse fill-amber-400" />
            </div>
            <p className="text-[10px] font-semibold text-purple-700 tracking-wider uppercase">
              {t('tagline')}
            </p>
          </div>
        </button>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          
          {/* Audio Auto-Narrator Toggle */}
          <button
            onClick={() => {
              if (isSpeaking) {
                stop();
              }
              setAutoNarrateEnabled(!autoNarrateEnabled);
            }}
            className={`p-2.5 rounded-xl border transition-all flex items-center gap-1.5 touch-target-large ${
              autoNarrateEnabled 
                ? 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100' 
                : 'bg-slate-100 border-slate-200 text-slate-400'
            }`}
            title={autoNarrateEnabled ? "Auto-voice active (Click to mute)" : "Voice muted (Click to enable)"}
            aria-label="Voice narrator toggle"
          >
            {autoNarrateEnabled ? (
              <>
                <Volume2 className={`w-5 h-5 ${isSpeaking ? 'text-pink-600 animate-bounce' : 'text-purple-700'}`} />
                <span className="hidden sm:inline text-xs font-bold">
                  {isSpeaking ? 'बोल रहा है...' : 'आवाज़ ऑन'}
                </span>
              </>
            ) : (
              <>
                <VolumeX className="w-5 h-5" />
                <span className="hidden sm:inline text-xs font-bold">आवाज़ बंद</span>
              </>
            )}
          </button>

          {/* Language Selector Button with Flag */}
          <button
            onClick={() => setIsLanguageModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl hover:border-purple-400 transition-all shadow-xs touch-target-large"
            aria-label="Change Language"
          >
            <span className="text-base">{langConfig.flag}</span>
            <span className="text-xs font-bold text-purple-900">{langConfig.name}</span>
            <Globe className="w-3.5 h-3.5 text-purple-600 ml-0.5" />
          </button>

          {/* User Profile / Login */}
          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onViewChange('confidence')}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-bold shadow-xs"
              >
                <Flame className="w-4 h-4 text-orange-500 fill-orange-400" />
                <span>{user.streak || 7} दिन</span>
                <span className="text-amber-600 ml-1">★ {user.points || 420}</span>
              </button>

              <button
                onClick={() => onViewChange('dashboard')}
                className="flex items-center gap-1.5 pl-2 pr-2.5 py-1.5 bg-purple-100 hover:bg-purple-200 rounded-xl transition-all"
              >
                <div className="w-7 h-7 rounded-lg bg-womentra-gradient text-white flex items-center justify-center font-bold text-xs">
                  {user.name ? user.name[0] : 'S'}
                </div>
                <span className="text-xs font-bold text-purple-900 max-w-[80px] truncate">
                  {activeDependent ? `👧 ${activeDependent.name}` : user.name.split(' ')[0]}
                </span>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3.5 py-2 bg-womentra-gradient text-white rounded-xl text-xs font-bold shadow-md shadow-pink-500/20 hover:opacity-95 transition-all touch-target-large flex items-center gap-1.5"
            >
              <User className="w-4 h-4" />
              <span>प्रवेश (Login)</span>
            </button>
          )}

        </div>
      </div>
    </header>
  );
};
