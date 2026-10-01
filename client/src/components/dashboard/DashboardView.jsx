import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Flame, Award, BookOpen, Landmark, HeartHandshake, 
  Video, Play, Volume2, ShieldCheck, ChevronRight, CheckCircle2,
  Users, ArrowRight, UserPlus, MapPin, PhoneCall, Bot, PlayCircle,
  CreditCard, ShieldAlert, TrendingUp, Code, Check
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useVoiceNarrator } from '../../context/VoiceNarratorContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export const DashboardView = ({ onNavigate, onOpenTour, onOpenAuth }) => {
  const { currentLang, t } = useLanguage();
  const { speak, narrateScreen } = useVoiceNarrator();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('power');
  const [affirmation, setAffirmation] = useState(null);
  const [courses, setCourses] = useState([]);
  const [activeProgress, setActiveProgress] = useState(null);
  const [mentor, setMentor] = useState(null);

  useEffect(() => {
    const welcomeNarrative = `${t('welcome')} ${user ? user.name : 'Didi'}. ${t('mission')}`;
    narrateScreen(welcomeNarrative);

    api.getDailyAffirmation().then(res => {
      if (res.success && res.affirmation) setAffirmation(res.affirmation);
    }).catch(() => {});

    api.getCourses().then(res => {
      if (res.success) setCourses(res.courses);
    }).catch(() => {});

    api.getMyMentor(user?.id).then(res => {
      if (res.success) setMentor(res.mentor);
    }).catch(() => {});
  }, [currentLang, user]);

  const dashboardModules = [
    {
      id: 'courses',
      title: t('courses'),
      subtitle: 'Full Stack, AI, Digital, Skills',
      icon: Code,
      color: 'from-purple-600 to-indigo-700',
      badge: '14+ Skills'
    },
    {
      id: 'schemes',
      title: t('schemes'),
      subtitle: 'PMMVY, Sukanya, Mudra Loans',
      icon: Landmark,
      color: 'from-pink-600 to-rose-700',
      badge: 'Verified DBT'
    },
    {
      id: 'mentorship',
      title: t('mentor'),
      subtitle: '1:1 Guidance & Voice Chat',
      icon: HeartHandshake,
      color: 'from-amber-500 to-orange-600',
      badge: 'DigiLocker KYC'
    },
    {
      id: 'live',
      title: t('liveClass'),
      subtitle: 'WebRTC Video & 2G Low Bandwidth',
      icon: Video,
      color: 'from-emerald-600 to-teal-700',
      badge: 'Live Now'
    },
    {
      id: 'confidence',
      title: t('progressTracker'),
      subtitle: 'XP Streaks, Badges & Certificates',
      icon: TrendingUp,
      color: 'from-blue-600 to-cyan-700',
      badge: 'Level 2'
    },
    {
      id: 'community',
      title: t('community'),
      subtitle: 'Voice Stories & Village Jobs',
      icon: Users,
      color: 'from-fuchsia-600 to-pink-700',
      badge: 'Sakhi Circle'
    },
    {
      id: 'pricing',
      title: t('pricing'),
      subtitle: 'Free Forever & NGO Sponsor Codes',
      icon: CreditCard,
      color: 'from-violet-600 to-purple-800',
      badge: 'Transparent'
    },
    {
      id: 'demo-tour',
      title: t('demoVideo'),
      subtitle: 'Voice-Guided Interactive Tour',
      icon: PlayCircle,
      color: 'from-rose-600 to-pink-600',
      badge: 'Tutorial',
      action: onOpenTour
    },
    {
      id: 'safety',
      title: t('safety'),
      subtitle: '1-Touch Alert & Live Location',
      icon: ShieldAlert,
      color: 'from-red-600 to-rose-700',
      badge: 'Emergency'
    }
  ];

  return (
    <div className="space-y-6 pb-24 max-w-5xl mx-auto px-3 sm:px-4 pt-2">
      
      {/* 1. Welcome & Hero Branding Banner with Logo */}
      <div className="bg-womentra-gradient rounded-3xl p-5 sm:p-7 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          
          <div className="flex items-center gap-3.5">
            <img
              src="/logo.svg"
              alt="Womentra Mascot"
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-white/20 p-1.5 backdrop-blur-md shadow-lg border border-white/30 shrink-0 object-contain animate-mascot-bob"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                  {user ? `${t('welcome')} ${user.name}!` : t('welcome')}
                </h1>
                <Sparkles className="w-5 h-5 text-amber-300 fill-amber-300 animate-spin" />
              </div>
              <p className="text-xs sm:text-sm text-purple-100 font-bold mt-0.5">
                {t('mission')}
              </p>
            </div>
          </div>

          {/* Quick Streak & Tour Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 px-3 py-2 bg-white/20 backdrop-blur-md rounded-2xl border border-white/20 text-xs font-black text-white">
              <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
              <span>{user?.streak || 7} {t('streakDays')}</span>
            </div>

            <button
              onClick={onOpenTour}
              className="px-3 py-2 bg-amber-400 hover:bg-amber-300 text-purple-950 rounded-2xl text-xs font-black flex items-center gap-1.5 shadow-md touch-target-large transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-purple-950" />
              <span>{t('demoVideo')}</span>
            </button>
          </div>
        </div>

        {/* Daily Affirmation Card */}
        {affirmation && (
          <div className="mt-4 p-3.5 bg-white/10 rounded-2xl backdrop-blur-md border border-white/15 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🌸</span>
              <p className="text-xs sm:text-sm font-semibold text-white italic">
                "{currentLang === 'hi' ? affirmation.quote : (affirmation.quoteEn || affirmation.quote)}"
              </p>
            </div>
            <button
              onClick={() => speak(currentLang === 'hi' ? affirmation.quote : (affirmation.quoteEn || affirmation.quote))}
              className="p-1.5 bg-white/20 hover:bg-white/30 rounded-xl text-white shrink-0"
              title={t('listenToScreen')}
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* 2. Three Pillars Tabs */}
      <div className="grid grid-cols-3 gap-2 p-1.5 bg-purple-100/70 dark:bg-slate-800 rounded-2xl border border-purple-200 dark:border-slate-700">
        <button
          onClick={() => {
            setActiveTab('potential');
            speak(t('potentialTab'));
          }}
          className={`py-3 px-2 rounded-xl text-xs sm:text-sm font-extrabold flex flex-col items-center gap-1 transition-all touch-target-large ${
            activeTab === 'potential'
              ? 'bg-white dark:bg-slate-900 text-purple-950 dark:text-purple-200 shadow-md'
              : 'text-purple-700 dark:text-slate-400 hover:bg-white/50'
          }`}
        >
          <span className="text-lg">🌱</span>
          <span>{t('potentialTab')}</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('power');
            speak(t('powerTab'));
          }}
          className={`py-3 px-2 rounded-xl text-xs sm:text-sm font-extrabold flex flex-col items-center gap-1 transition-all touch-target-large ${
            activeTab === 'power'
              ? 'bg-womentra-gradient text-white shadow-md'
              : 'text-purple-700 dark:text-slate-400 hover:bg-white/50'
          }`}
        >
          <span className="text-lg">⚡</span>
          <span>{t('powerTab')}</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('future');
            speak(t('futureTab'));
          }}
          className={`py-3 px-2 rounded-xl text-xs sm:text-sm font-extrabold flex flex-col items-center gap-1 transition-all touch-target-large ${
            activeTab === 'future'
              ? 'bg-white dark:bg-slate-900 text-purple-950 dark:text-purple-200 shadow-md'
              : 'text-purple-700 dark:text-slate-400 hover:bg-white/50'
          }`}
        >
          <span className="text-lg">🌟</span>
          <span>{t('futureTab')}</span>
        </button>
      </div>

      {/* 3. Continue Learning Progress Ring Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-purple-100 dark:border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          
          <div className="flex items-center gap-4">
            {/* SVG Circular Progress Ring */}
            <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100 dark:text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-pink-600"
                  strokeDasharray="45, 100"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-xs font-black text-purple-950 dark:text-white">45%</span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm sm:text-base text-purple-950 dark:text-white">
                  {t('continueLearning')}: Full Stack Development
                </h3>
                <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 text-[10px] font-bold rounded-md">
                  Active
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Module 1: JavaScript ES6+ & Fetch API • Lesson 2 of 8
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('courses')}
            className="w-full sm:w-auto px-5 py-3 bg-womentra-gradient text-white rounded-2xl font-black text-xs shadow-md shadow-pink-500/20 hover:opacity-95 transition-all flex items-center justify-center gap-2 touch-target-large"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{t('continueLearning')} →</span>
          </button>

        </div>
      </div>

      {/* 4. Specialized Feature Icons Grid (9 Core Capabilities) */}
      <div className="space-y-3">
        <h3 className="text-sm font-black text-purple-950 dark:text-white flex items-center gap-2">
          <span>✨</span>
          <span>Core Modules & Specialized Services</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {dashboardModules.map((mod) => {
            const Icon = mod.icon;
            return (
              <button
                key={mod.id}
                onClick={() => mod.action ? mod.action() : onNavigate(mod.id)}
                className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-purple-100 dark:border-slate-800 hover:border-pink-500 shadow-xs hover:shadow-md transition-all text-left flex items-start justify-between group touch-target-large"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${mod.color} text-white flex items-center justify-center shadow-md shrink-0 group-hover:scale-105 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
                      {mod.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                      {mod.subtitle}
                    </p>
                    <span className="text-[10px] font-black text-purple-700 dark:text-pink-400 mt-1 inline-block">
                      {mod.badge}
                    </span>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-pink-600 transition-colors shrink-0 mt-2" />
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Upcoming Live Tutoring Class Reminder */}
      <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-amber-50 dark:from-slate-900 dark:via-purple-950 dark:to-slate-900 rounded-3xl p-5 border border-purple-200 dark:border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shrink-0 relative">
              <Video className="w-6 h-6" />
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 absolute -top-1 -right-1 ring-2 ring-white animate-ping" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-pink-700 dark:text-pink-400">
                {t('upcomingClass')}
              </span>
              <h4 className="text-sm font-black text-purple-950 dark:text-white">
                Full Stack Live Coding: Responsive Layouts & APIs
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
                Mentor: Dr. Ananya Sharma • Today at 4:00 PM (WebRTC Audio/Video)
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('live')}
            className="w-full sm:w-auto px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black shadow-md flex items-center justify-center gap-2 touch-target-large"
          >
            <Video className="w-4 h-4" />
            <span>Join Live Room</span>
          </button>
        </div>
      </div>

    </div>
  );
};
