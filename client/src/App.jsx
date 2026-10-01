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

  return (
    <div className="min-h-screen bg-[#FAF7FC] flex flex-col font-sans selection:bg-pink-500 selection:text-white">
      
      {/* Top Header */}
      <Header
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenTour={() => setIsTourOpen(true)}
        currentView={currentView}
        onViewChange={handleNavigate}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-2 sm:p-4">
        
        {/* Quick View Switcher Badges for Deep Exploration */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-3 pt-1 px-2 text-xs font-bold text-purple-900 scrollbar-none">
          <button
            onClick={() => handleNavigate('dashboard')}
            className={`px-3 py-1.5 rounded-xl border transition-all touch-target-large ${
              currentView === 'dashboard' ? 'bg-purple-900 text-white' : 'bg-white border-purple-100 hover:bg-purple-50'
            }`}
          >
            🏠 मुख्य डैशबोर्ड
          </button>

          <button
            onClick={() => handleNavigate('schemes')}
            className={`px-3 py-1.5 rounded-xl border transition-all touch-target-large ${
              currentView === 'schemes' ? 'bg-purple-900 text-white' : 'bg-white border-purple-100 hover:bg-purple-50'
            }`}
          >
            🏛️ सरकारी साथी
          </button>

          <button
            onClick={() => handleNavigate('courses')}
            className={`px-3 py-1.5 rounded-xl border transition-all touch-target-large ${
              currentView === 'courses' ? 'bg-purple-900 text-white' : 'bg-white border-purple-100 hover:bg-purple-50'
            }`}
          >
            🧵 हुनर हब
          </button>

          <button
            onClick={() => handleNavigate('mentorship')}
            className={`px-3 py-1.5 rounded-xl border transition-all touch-target-large ${
              currentView === 'mentorship' ? 'bg-purple-900 text-white' : 'bg-white border-purple-100 hover:bg-purple-50'
            }`}
          >
            🤝 मेरी मेंटर
          </button>

          <button
            onClick={() => handleNavigate('live')}
            className={`px-3 py-1.5 rounded-xl border transition-all touch-target-large ${
              currentView === 'live' ? 'bg-purple-900 text-white' : 'bg-white border-purple-100 hover:bg-purple-50'
            }`}
          >
            📹 लाइव क्लास रूम
          </button>

          <button
            onClick={() => handleNavigate('tutor-kyc')}
            className={`px-3 py-1.5 rounded-xl border transition-all touch-target-large ${
              currentView === 'tutor-kyc' ? 'bg-purple-900 text-white' : 'bg-white border-purple-100 hover:bg-purple-50'
            }`}
          >
            🛡️ ट्यूटर e-KYC
          </button>

          <button
            onClick={() => handleNavigate('community')}
            className={`px-3 py-1.5 rounded-xl border transition-all touch-target-large ${
              currentView === 'community' ? 'bg-purple-900 text-white' : 'bg-white border-purple-100 hover:bg-purple-50'
            }`}
          >
            👭 सखी संगम
          </button>

          <button
            onClick={() => handleNavigate('confidence')}
            className={`px-3 py-1.5 rounded-xl border transition-all touch-target-large ${
              currentView === 'confidence' ? 'bg-purple-900 text-white' : 'bg-white border-purple-100 hover:bg-purple-50'
            }`}
          >
            🌸 आत्मविश्वास
          </button>

          <button
            onClick={() => handleNavigate('pricing')}
            className={`px-3 py-1.5 rounded-xl border transition-all touch-target-large ${
              currentView === 'pricing' ? 'bg-purple-900 text-white' : 'bg-white border-purple-100 hover:bg-purple-50'
            }`}
          >
            💳 योजनाएं व शुल्क
          </button>

          <button
            onClick={() => handleNavigate('safety')}
            className={`px-3 py-1.5 rounded-xl border transition-all touch-target-large ${
              currentView === 'safety' ? 'bg-purple-900 text-white' : 'bg-white border-purple-100 hover:bg-purple-50'
            }`}
          >
            🚨 सुरक्षा SOS
          </button>

          <button
            onClick={() => handleNavigate('admin')}
            className={`px-3 py-1.5 rounded-xl border transition-all touch-target-large ${
              currentView === 'admin' ? 'bg-purple-900 text-white' : 'bg-white border-purple-100 hover:bg-purple-50'
            }`}
          >
            ⚙️ प्रशासन (Admin)
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
        {currentView === 'schemes' && <SarkariSaathiView />}
        {currentView === 'courses' && <LearningHubView />}
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
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
      />
      <VoiceOnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />
      <InteractiveAppTourModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
      />

    </div>
  );
};
