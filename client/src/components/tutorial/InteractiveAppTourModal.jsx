import React, { useState, useEffect } from 'react';
import { 
  X, Play, Pause, Volume2, Sparkles, CheckCircle, 
  ArrowRight, ShieldCheck, Heart, FastForward, RotateCcw, Target 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useVoiceNarrator } from '../../context/VoiceNarratorContext';

export const InteractiveAppTourModal = ({ isOpen, onClose, onTryAction }) => {
  const { currentLang, t } = useLanguage();
  const { speak, isSpeaking } = useVoiceNarrator();
  const [activeStep, setActiveStep] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const tourSteps = [
    {
      id: "step-1",
      title: t('tourStep1Title') || "1. Choose Your Language",
      desc: t('tourStep1Desc') || "Select your native Indian language anytime. All lessons, voice narration, and quizzes adapt instantly.",
      icon: "🌐",
      color: "from-purple-700 to-indigo-800",
      actionTarget: "language",
      buttonText: "Try Language Chip"
    },
    {
      id: "step-2",
      title: t('tourStep2Title') || "2. Register & Login with Phone",
      desc: t('tourStep2Desc') || "Simple voice-readable OTP login with family assistance mode.",
      icon: "📱",
      color: "from-pink-600 to-rose-700",
      actionTarget: "auth",
      buttonText: "Try Mobile OTP Login"
    },
    {
      id: "step-3",
      title: t('tourStep3Title') || "3. Dashboard & Progress",
      desc: t('tourStep3Desc') || "Track your streak, XP badges, upcoming classes, and continue right where you left off.",
      icon: "⚡",
      color: "from-amber-500 to-orange-600",
      actionTarget: "dashboard",
      buttonText: "Explore 3 Pillars"
    },
    {
      id: "step-4",
      title: t('tourStep4Title') || "4. Learning Skills & Certificates",
      desc: t('tourStep4Desc') || "Learn Full Stack, AI, Digital Safety, or Vocational skills with interactive video pause quizzes and download verified certificates.",
      icon: "💻",
      color: "from-emerald-600 to-teal-700",
      actionTarget: "courses",
      buttonText: "Open 14+ Skills Hub"
    },
    {
      id: "step-5",
      title: t('tourStep5Title') || "5. Government Services (Sarkari Saathi)",
      desc: t('tourStep5Desc') || "Check scheme eligibility, find nearby CSC centers on the map, and track applications.",
      icon: "🏛️",
      color: "from-blue-600 to-indigo-800",
      actionTarget: "schemes",
      buttonText: "Open Sarkari Saathi"
    },
    {
      id: "step-6",
      title: t('tourStep6Title') || "6. Mentors & Live Video Calls",
      desc: t('tourStep6Desc') || "Connect 1:1 with verified mentors with WebRTC video and low-bandwidth 2G audio mode.",
      icon: "🤝",
      color: "from-fuchsia-600 to-pink-700",
      actionTarget: "mentorship",
      buttonText: "Connect with Mentor"
    },
    {
      id: "step-7",
      title: t('tourStep7Title') || "7. Safety SOS & Community",
      desc: t('tourStep7Desc') || "One-touch emergency alert and support network on Sakhi Circle.",
      icon: "🚨",
      color: "from-rose-700 to-red-800",
      actionTarget: "safety",
      buttonText: "Try Safety Features"
    }
  ];

  const current = tourSteps[activeStep];

  useEffect(() => {
    if (isOpen && current) {
      speak(`${current.title}. ${current.desc}`);
    }
  }, [isOpen, activeStep, currentLang]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (activeStep < tourSteps.length - 1) {
      setActiveStep(activeStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleTryAction = () => {
    onClose();
    if (onTryAction && current.actionTarget) {
      onTryAction(current.actionTarget);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl border border-purple-100 dark:border-slate-800 overflow-hidden flex flex-col animate-in zoom-in-95">
        
        {/* Header with Logo */}
        <div className="bg-womentra-gradient p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.svg"
              alt="Womentra Logo"
              className="w-8 h-8 rounded-xl bg-white/20 p-1 object-contain"
            />
            <div>
              <h3 className="text-base font-black tracking-tight">
                {t('demoVideo')} (AI Interactive Walkthrough)
              </h3>
              <p className="text-[10px] text-purple-100">
                Step {activeStep + 1} of {tourSteps.length}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Animated Slide Card */}
        <div className="p-6 space-y-5">
          
          <div className={`p-6 rounded-3xl bg-gradient-to-br ${current.color} text-white text-center shadow-xl relative overflow-hidden transition-all duration-300 min-h-[190px] flex flex-col items-center justify-center`}>
            <div className="text-4xl sm:text-5xl mb-2 animate-mascot-bob">
              {current.icon}
            </div>
            <h4 className="text-lg sm:text-xl font-black mb-1">
              {current.title}
            </h4>
            <p className="text-xs text-white/95 font-medium max-w-sm mx-auto leading-relaxed">
              {current.desc}
            </p>
          </div>

          {/* Audio Controls Bar */}
          <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-slate-800 rounded-2xl">
            <button
              onClick={() => speak(`${current.title}. ${current.desc}`)}
              className="px-3 py-1.5 bg-white dark:bg-slate-700 text-purple-900 dark:text-purple-200 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{t('listenToScreen')}</span>
            </button>

            {/* Try It Yourself Highlight Button */}
            <button
              onClick={handleTryAction}
              className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-purple-950 rounded-xl text-xs font-black flex items-center gap-1 shadow-xs"
            >
              <Target className="w-3.5 h-3.5" />
              <span>{current.buttonText} ⚡</span>
            </button>
          </div>

          {/* Stepper Dots */}
          <div className="flex items-center justify-center gap-1.5">
            {tourSteps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveStep(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === activeStep ? 'w-6 bg-pink-600' : 'w-2 bg-slate-200 dark:bg-slate-700'
                }`}
                aria-label={`Step ${idx + 1}`}
              />
            ))}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2 pt-1">
            {activeStep > 0 && (
              <button
                onClick={handlePrev}
                className="py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-2xl text-xs font-bold"
              >
                ← Previous
              </button>
            )}

            <button
              onClick={handleNext}
              className="flex-1 py-3.5 bg-womentra-gradient text-white rounded-2xl font-black text-xs shadow-md shadow-pink-500/20 flex items-center justify-center gap-2 touch-target-large"
            >
              <span>{activeStep < tourSteps.length - 1 ? 'Next Step →' : 'Complete Tour 🎉'}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
