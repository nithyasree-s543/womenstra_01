import React from 'react';
import { Home, Landmark, BookOpen, Users, HeartHandshake, ShieldAlert, Award, Video } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useVoiceNarrator } from '../../context/VoiceNarratorContext';

export const BottomNav = ({ currentView, onViewChange }) => {
  const { t, currentLang } = useLanguage();
  const { speak } = useVoiceNarrator();

  const navItems = [
    {
      id: 'dashboard',
      label: t('home'),
      icon: Home,
      voice: currentLang === 'hi' ? 'मुख्य पृष्ठ पर जाएँ' : 'Go to Home'
    },
    {
      id: 'schemes',
      label: t('schemes'),
      icon: Landmark,
      voice: currentLang === 'hi' ? 'सरकारी साथी: सरकारी योजनाएं देखें' : 'Sarkari Saathi: View Government Schemes'
    },
    {
      id: 'courses',
      label: t('courses'),
      icon: BookOpen,
      voice: currentLang === 'hi' ? 'हुनर हब: नए कौशल और सिलाई सीखें' : 'Learning Hub: Skills and Courses'
    },
    {
      id: 'mentorship',
      label: t('mentor'),
      icon: HeartHandshake,
      voice: currentLang === 'hi' ? 'मेरी मेंटर: अपनी मार्गदर्शक दीदी से बात करें' : 'My Mentor: Connect with Guide'
    },
    {
      id: 'community',
      label: t('community'),
      icon: Users,
      voice: currentLang === 'hi' ? 'सखी संगम: सखियों के विचार और अवसर' : 'Sakhi Circle: Community Stories'
    }
  ];

  const handleNavClick = (item) => {
    onViewChange(item.id);
    speak(item.voice);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-purple-100 shadow-2xl py-1 px-2 pb-safe">
      <div className="max-w-lg mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all duration-200 touch-target-large relative ${
                isActive 
                  ? 'text-pink-600 font-bold scale-105' 
                  : 'text-slate-500 hover:text-purple-700'
              }`}
              aria-label={item.label}
            >
              <div className={`p-2 rounded-xl transition-all ${
                isActive 
                  ? 'bg-gradient-to-tr from-purple-100 to-pink-100 text-pink-600 shadow-xs' 
                  : 'hover:bg-slate-50'
              }`}>
                <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight line-clamp-1">
                {item.label}
              </span>
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-pink-600 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
