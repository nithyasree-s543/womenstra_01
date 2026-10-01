import React, { useState, useEffect } from 'react';
import { useLanguage } from './context/LanguageContext';
import { useVoiceNarrator } from './context/VoiceNarratorContext';
import { useAuth } from './context/AuthContext';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { FloatingDidiVoice } from './components/common/FloatingDidiVoice';
import { LanguageSelectModal } from './components/common/LanguageSelectModal';
import { PhoneOtpLoginModal } from './components/auth/PhoneOtpLoginModal';
import { VoiceOnboardingModal } from './components/auth/VoiceOnboardingModal';
import { InteractiveAppTourModal } from './components/tutorial/InteractiveAppTourModal';

// Views
import { DashboardView } from './components/dashboard/DashboardView';
import { SarkariSaathiView } from './components/schemes/SarkariSaathiView';
import { LearningHubView } from './components/learning/LearningHubView';
import { MentorshipView } from './components/mentorship/MentorshipView';
import { SakhiCircleView } from './components/community/SakhiCircleView';
import { ConfidenceBuilderView } from './components/confidence/ConfidenceBuilderView';
import { PricingView } from './components/pricing/PricingView';
import { SafetyLocationView } from './components/tracking/SafetyLocationView';
import { AdminPanelView } from './components/admin/AdminPanelView';
import { LiveClassView } from './components/live/LiveClassView';
import { TutorKycView } from './components/tutors/TutorKycView';

export const App = () => {
  const { currentLang, setIsLanguageModalOpen } = useLanguage();
  const { speak } = useVoiceNarrator();
  const { user } = useAuth();

  const [currentView, setCurrentView] = useState('dashboard');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);

  // Check if first-time user launch
  useEffect(() => {
    const hasSeenLanguagePrompt = localStorage.getItem('womentra_lang_prompt_seen');
    if (!hasSeenLanguagePrompt) {
      setIsLanguageModalOpen(true);
      localStorage.setItem('womentra_lang_prompt_seen', 'true');
    }
  }, []);

  const handleNavigate = (viewId) => {
    setCurrentView(viewId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTourTryAction = (actionTarget) => {
    if (actionTarget === 'language') {
      setIsLanguageModalOpen(true);
    } else if (actionTarget === 'auth') {
      setIsAuthOpen(true);
    } else if (actionTarget) {
      handleNavigate(actionTarget);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7FC] dark:bg-slate-950 flex flex-col font-sans selection:bg-pink-500 selection:text-white transition-colors duration-200">
      
      {/* Top Header */}
      <Header
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenTour={() => setIsTourOpen(true)}
        currentView={currentView}
        onViewChange={handleNavigate}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-2 sm:p-4">
        
        {/* Quick View Navigation Chips for direct access */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-3 pt-1 px-2 text-xs font-bold text-purple-900 dark:text-purple-300 scrollbar-none">
          <button
            onClick={() => handleNavigate('dashboard')}
            className={`px-3 py-1.5 rounded-xl border transition-all touch-target-large ${
              currentView === 'dashboard' ? 'bg-purple-900 text-white shadow-xs' : 'bg-white dark:bg-slate-900 border-purple-100 dark:border-slate-800 hover:bg-purple-50'
            }`}
          >
            🏠 Dashboard
          </button>

          <button
            onClick={() => handleNavigate('courses')}
            className={`px-3 py-1.5 rounded-xl border transition-all touch-target-large ${
              currentView === 'courses' ? 'bg-purple-900 text-white shadow-xs' : 'bg-white dark:bg-slate-900 border-purple-100 dark:border-slate-800 hover:bg-purple-50'
            }`}
          >
            💻 Learning Skills
          </button>

          <button
            onClick={() => handleNavigate('schemes')}
            className={`px-3 py-1.5 rounded-xl border transition-all touch-target-large ${
              currentView === 'schemes' ? 'bg-purple-900 text-white shadow-xs' : 'bg-white dark:bg-slate-900 border-purple-100 dark:border-slate-800 hover:bg-purple-50'
            }`}
          >
            🏛️ Government Services
          </button>

          <button
            onClick={() => handleNavigate('mentorship')}
            className={`px-3 py-1.5 rounded-xl border transition-all touch-target-large ${
              currentView === 'mentorship' ? 'bg-purple-900 text-white shadow-xs' : 'bg-white dark:bg-slate-900 border-purple-100 dark:border-slate-800 hover:bg-purple-50'
            }`}
          >
            🤝 Mentor Connect
          </button>

          <button
            onClick={() => handleNavigate('live')}
            className={`px-3 py-1.5 rounded-xl border transition-all touch-target-large ${
              currentView === 'live' ? 'bg-purple-900 text-white shadow-xs' : 'bg-white dark:bg-slate-900 border-purple-100 dark:border-slate-800 hover:bg-purple-50'
            }`}
          >
            📹 WebRTC Video Class
          </button>

          <button
            onClick={() => handleNavigate('tutor-kyc')}
            className={`px-3 py-1.5 rounded-xl border transition-all touch-target-large ${
              currentView === 'tutor-kyc' ? 'bg-purple-900 text-white shadow-xs' : 'bg-white dark:bg-slate-900 border-purple-100 dark:border-slate-800 hover:bg-purple-50'
            }`}
          >
            🛡️ Tutor e-KYC
          </button>

          <button
            onClick={() => handleNavigate('community')}
            className={`px-3 py-1.5 rounded-xl border transition-all touch-target-large ${
              currentView === 'community' ? 'bg-purple-900 text-white shadow-xs' : 'bg-white dark:bg-slate-900 border-purple-100 dark:border-slate-800 hover:bg-purple-50'
            }`}
          >
            👭 Sakhi Circle
          </button>

          <button
            onClick={() => handleNavigate('confidence')}
            className={`px-3 py-1.5 rounded-xl border transition-all touch-target-large ${
              currentView === 'confidence' ? 'bg-purple-900 text-white shadow-xs' : 'bg-white dark:bg-slate-900 border-purple-100 dark:border-slate-800 hover:bg-purple-50'
            }`}
          >
            🌸 Confidence & Badges
          </button>

          <button
            onClick={() => handleNavigate('pricing')}
            className={`px-3 py-1.5 rounded-xl border transition-all touch-target-large ${
              currentView === 'pricing' ? 'bg-purple-900 text-white shadow-xs' : 'bg-white dark:bg-slate-900 border-purple-100 dark:border-slate-800 hover:bg-purple-50'
            }`}
          >
            💳 Pricing & NGO Codes
          </button>

          <button
            onClick={() => handleNavigate('safety')}
            className={`px-3 py-1.5 rounded-xl border transition-all touch-target-large ${
              currentView === 'safety' ? 'bg-purple-900 text-white shadow-xs' : 'bg-white dark:bg-slate-900 border-purple-100 dark:border-slate-800 hover:bg-purple-50'
            }`}
          >
            🚨 Safety SOS
          </button>

          <button
            onClick={() => handleNavigate('admin')}
            className={`px-3 py-1.5 rounded-xl border transition-all touch-target-large ${
              currentView === 'admin' ? 'bg-purple-900 text-white shadow-xs' : 'bg-white dark:bg-slate-900 border-purple-100 dark:border-slate-800 hover:bg-purple-50'
            }`}
          >
            ⚙️ Admin CMS
          </button>
        </div>

        {/* Active View Renderer */}
        {currentView === 'dashboard' && (
          <DashboardView
            onNavigate={handleNavigate}
            onOpenTour={() => setIsTourOpen(true)}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}
        {currentView === 'courses' && <LearningHubView />}
        {currentView === 'schemes' && <SarkariSaathiView />}
        {currentView === 'mentorship' && <MentorshipView onNavigateLive={() => handleNavigate('live')} />}
        {currentView === 'live' && <LiveClassView onLeave={() => handleNavigate('dashboard')} />}
        {currentView === 'tutor-kyc' && <TutorKycView />}
        {currentView === 'community' && <SakhiCircleView />}
        {currentView === 'confidence' && <ConfidenceBuilderView />}
        {currentView === 'pricing' && <PricingView />}
        {currentView === 'safety' && <SafetyLocationView />}
        {currentView === 'admin' && <AdminPanelView />}

      </main>

      {/* Persistent AI Voice Companion (Gemini powered) */}
      <FloatingDidiVoice onNavigate={handleNavigate} />

      {/* Bottom Navigation Dock */}
      <BottomNav currentView={currentView} onViewChange={handleNavigate} />

      {/* Global Modals */}
      <LanguageSelectModal />
      <PhoneOtpLoginModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
      <VoiceOnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />
      <InteractiveAppTourModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onTryAction={handleTourTryAction}
      />

    </div>
  );
};
