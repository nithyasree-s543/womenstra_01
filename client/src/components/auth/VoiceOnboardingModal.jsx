import React, { useState, useEffect } from 'react';
import { X, Mic, CheckCircle2, Sparkles, Volume2, ArrowRight, User } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useVoiceNarrator } from '../../context/VoiceNarratorContext';
import { useAuth } from '../../context/AuthContext';
import { speechService } from '../../services/speechService';
import confetti from 'canvas-confetti';

export const VoiceOnboardingModal = ({ isOpen, onClose }) => {
  const { currentLang, langConfig } = useLanguage();
  const { speak } = useVoiceNarrator();
  const { user, updateProfileVoice } = useAuth();

  const [stepIndex, setStepIndex] = useState(0);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    age: user?.age || 26,
    village: user?.village || '',
    state: 'Uttar Pradesh',
    interests: ['sewing', 'digital_payments'],
    goals: ['Learn tailoring business', 'Use UPI safely']
  });

  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState('');

  const questions = [
    {
      id: 'name',
      promptHi: "नमस्ते दीदी! आपका शुभ नाम क्या है? बोलकर बताइए।",
      promptEn: "Namaste Didi! What is your good name? Please speak.",
      labelHi: "आपका नाम",
      icon: "👩🏽"
    },
    {
      id: 'village',
      promptHi: "बहुत सुंदर! आप किस गाँव या शहर में रहती हैं?",
      promptEn: "Wonderful! Which village or town do you live in?",
      labelHi: "गाँव / कस्बा",
      icon: "🏡"
    },
    {
      id: 'goals',
      promptHi: "आप वोमंतरा पर सबसे पहले क्या सीखना चाहती हैं? सिलाई, सरकारी योजनाएं या मोबाइल से पैसे भेजना?",
      promptEn: "What would you like to learn first? Tailoring, government schemes, or mobile payments?",
      labelHi: "आपकी सीखने की इच्छा",
      icon: "🎯"
    }
  ];

  const currentQ = questions[stepIndex];

  useEffect(() => {
    if (isOpen && currentQ) {
      const prompt = currentLang === 'hi' ? currentQ.promptHi : currentQ.promptEn;
      speak(prompt);
    }
  }, [isOpen, stepIndex, currentLang]);

  if (!isOpen) return null;

  const handleStartVoiceAnswer = () => {
    setIsListening(true);
    setSpokenText('');

    speechService.startListening({
      lang: langConfig.bcp47 || 'hi-IN',
      onResult: ({ transcript, isFinal }) => {
        setSpokenText(transcript);
        if (isFinal) {
          handleSaveCurrentAnswer(transcript);
        }
      },
      onError: () => setIsListening(false),
      onEnd: () => setIsListening(false)
    });
  };

  const handleSaveCurrentAnswer = (text) => {
    if (!text) return;
    setIsListening(false);
    
    if (currentQ.id === 'name') {
      setFormData(prev => ({ ...prev, name: text }));
    } else if (currentQ.id === 'village') {
      setFormData(prev => ({ ...prev, village: text }));
    } else if (currentQ.id === 'goals') {
      setFormData(prev => ({ ...prev, goals: [text] }));
    }

    if (stepIndex < questions.length - 1) {
      setTimeout(() => {
        setStepIndex(stepIndex + 1);
        setSpokenText('');
      }, 800);
    } else {
      handleCompleteOnboarding();
    }
  };

  const handleCompleteOnboarding = async () => {
    await updateProfileVoice({
      name: formData.name || 'Sunita Devi',
      village: formData.village || 'Ramnagar',
      goals: formData.goals
    });

    confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    speak("शाबाश दीदी! आपकी प्रोफाइल बन गई है और आपको 50 अंक मिले हैं!");
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-purple-100 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-womentra-gradient p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-mascot-bob">{currentQ.icon}</span>
            <div>
              <h3 className="text-lg font-black tracking-tight">
                आवाज़ से पहचान (Voice Onboarding)
              </h3>
              <p className="text-xs text-purple-100 font-medium">
                कदम {stepIndex + 1} / {questions.length}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 transition-all text-white"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="h-2 bg-purple-100 w-full flex">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`h-full flex-1 transition-all duration-300 ${
                i <= stepIndex ? 'bg-pink-600' : 'bg-transparent'
              }`}
            />
          ))}
        </div>

        {/* Body */}
        <div className="p-6 text-center space-y-5">
          
          <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 flex items-center justify-between">
            <p className="text-base font-bold text-purple-950 text-left">
              {currentLang === 'hi' ? currentQ.promptHi : currentQ.promptEn}
            </p>
            <button
              onClick={() => speak(currentLang === 'hi' ? currentQ.promptHi : currentQ.promptEn)}
              className="p-2 bg-white text-purple-700 rounded-xl shadow-xs shrink-0 ml-2"
              title="Replay Voice"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>

          {/* Glowing Microphone button */}
          <div className="py-2">
            <button
              onClick={handleStartVoiceAnswer}
              className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center shadow-2xl transition-all ${
                isListening 
                  ? 'bg-rose-500 text-white animate-pulse ring-8 ring-rose-200' 
                  : 'bg-womentra-gradient text-white hover:scale-105 active:scale-95'
              }`}
            >
              <Mic className="w-12 h-12" />
            </button>
            <p className="mt-3 text-sm font-bold text-slate-800">
              {isListening ? 'दीदी सुन रही हैं... बोलिए' : 'माइक दबाकर उत्तर बोलें'}
            </p>
            {spokenText && (
              <p className="text-sm font-semibold text-pink-700 mt-2 bg-pink-50 py-1 px-3 rounded-xl inline-block border border-pink-200">
                "{spokenText}"
              </p>
            )}
          </div>

          {/* Skip or Manual Type fallback */}
          <div className="flex gap-2">
            {stepIndex > 0 && (
              <button
                type="button"
                onClick={() => setStepIndex(stepIndex - 1)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                ← पिछला
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (stepIndex < questions.length - 1) {
                  setStepIndex(stepIndex + 1);
                } else {
                  handleCompleteOnboarding();
                }
              }}
              className="flex-1 py-3 bg-womentra-gradient text-white rounded-xl text-xs font-bold shadow-md shadow-pink-500/20"
            >
              {stepIndex < questions.length - 1 ? 'अगला कदम →' : 'पूर्ण करें 🎉'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
