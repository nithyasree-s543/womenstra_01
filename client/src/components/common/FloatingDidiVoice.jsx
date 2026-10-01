import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Sparkles, X, Volume2, ArrowRight, Bot, Compass, HelpCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useVoiceNarrator } from '../../context/VoiceNarratorContext';
import { speechService } from '../../services/speechService';
import { api } from '../../services/api';

export const FloatingDidiVoice = ({ onNavigate }) => {
  const { currentLang, langConfig } = useLanguage();
  const { speak, isDidiModalOpen, setIsDidiModalOpen } = useVoiceNarrator();

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [didiResponse, setDidiResponse] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const samplePrompts = currentLang === 'hi' ? [
    "मुझे सरकारी योजनाओं के बारे में बताओ",
    "सिलाई और बुटीक का काम सीखना है",
    "मेरी मेंटर से बात कराओ",
    "UPI फ्रॉड से कैसे बचें?",
    "बेटी की पढ़ाई के लिए कौन सी योजना है?"
  ] : [
    "Tell me about government schemes",
    "I want to learn tailoring and sewing",
    "Connect me with my mentor",
    "How to avoid UPI payment scams?",
    "Which scheme is for girl child education?"
  ];

  const handleOpen = () => {
    setIsDidiModalOpen(true);
    setDidiResponse('');
    setTranscript('');
    const intro = currentLang === 'hi'
      ? "नमस्ते दीदी! मैं आपकी वोमंतरा दीदी हूँ। आप माइक दबाकर कुछ भी पूछ सकती हैं।"
      : "Namaste Didi! I am your Womentra Didi. Tap the mic and ask me anything.";
    speak(intro);
  };

  const handleToggleListen = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
    } else {
      setTranscript('');
      setDidiResponse('');
      setIsListening(true);

      speechService.startListening({
        lang: langConfig.bcp47 || 'hi-IN',
        onResult: ({ transcript: text, isFinal }) => {
          setTranscript(text);
          if (isFinal) {
            handleProcessPrompt(text);
          }
        },
        onError: (err) => {
          console.warn('STT Error:', err);
          setIsListening(false);
        },
        onEnd: () => {
          setIsListening(false);
        }
      });
    }
  };

  const handleProcessPrompt = async (promptText) => {
    if (!promptText) return;
    setIsThinking(true);
    try {
      const res = await api.askDidi(promptText, currentLang);
      if (res.success && res.reply) {
        setDidiResponse(res.reply);
        speak(res.reply);

        // Intent-driven auto navigation
        if (res.action === 'NAVIGATE_SCHEMES') {
          setTimeout(() => onNavigate('schemes'), 2500);
        } else if (res.action === 'NAVIGATE_COURSES' || res.action === 'NAVIGATE_DIGITAL_SAFETY') {
          setTimeout(() => onNavigate('courses'), 2500);
        } else if (res.action === 'NAVIGATE_MENTORS') {
          setTimeout(() => onNavigate('mentorship'), 2500);
        }
      }
    } catch (err) {
      const fallback = currentLang === 'hi'
        ? "माफ कीजियेगा दीदी, नेटवर्क धीमा है। आप नीचे दिए गए सुझावों पर क्लिक कर सकती हैं।"
        : "Network is low Didi. Please tap any of the suggested topics below.";
      setDidiResponse(fallback);
      speak(fallback);
    } finally {
      setIsThinking(false);
      setIsListening(false);
    }
  };

  return (
    <>
      {/* Floating Glowing Microphone Action Button */}
      <div className="fixed bottom-24 right-4 z-40 flex flex-col items-center">
        <button
          onClick={handleOpen}
          className="relative w-16 h-16 rounded-full bg-womentra-gradient shadow-2xl flex items-center justify-center text-white transition-all transform hover:scale-110 active:scale-95 animate-voice-listening touch-target-large group"
          aria-label="Ask Womentra Didi AI Voice Assistant"
        >
          <div className="absolute -top-1 -right-1 bg-amber-400 text-purple-950 p-1 rounded-full shadow-md">
            <Sparkles className="w-3.5 h-3.5 fill-amber-300" />
          </div>
          <Mic className="w-8 h-8 text-white transition-transform group-hover:rotate-6" />
        </button>
        <span className="text-[11px] font-bold text-purple-950 bg-white/90 px-2 py-0.5 rounded-full shadow-xs mt-1 border border-purple-200">
          बोलकर पूछें
        </span>
      </div>

      {/* Interactive Womentra Didi Voice Modal */}
      {isDidiModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg shadow-2xl border border-purple-100 overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-6 duration-300">
            
            {/* Modal Header */}
            <div className="bg-womentra-gradient p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl border border-white/30 animate-mascot-bob">
                  👩🏽‍🏫
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-lg font-black tracking-tight">वोमंतरा दीदी (Gemini AI)</h3>
                    <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
                  </div>
                  <p className="text-xs text-purple-100 font-medium">
                    आपकी अपनी सरल और समझदार डिजिटल साथी
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  speechService.cancel();
                  speechService.stopListening();
                  setIsDidiModalOpen(false);
                }}
                className="p-2 rounded-full hover:bg-white/20 transition-all text-white"
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              
              {/* Voice Interaction Banner */}
              <div className="text-center py-4 bg-purple-50 rounded-2xl border border-purple-100 p-4">
                <button
                  onClick={handleToggleListen}
                  className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center shadow-xl transition-all ${
                    isListening 
                      ? 'bg-rose-500 text-white animate-pulse ring-8 ring-rose-200' 
                      : 'bg-womentra-gradient text-white hover:scale-105'
                  }`}
                  aria-label={isListening ? "Listening... Tap to stop" : "Tap to speak"}
                >
                  {isListening ? (
                    <Mic className="w-10 h-10 animate-bounce" />
                  ) : (
                    <Mic className="w-10 h-10" />
                  )}
                </button>
                <p className="mt-3 text-sm font-bold text-purple-900">
                  {isListening 
                    ? 'दीदी सुन रही हैं... बोलिए' 
                    : isThinking 
                      ? 'दीदी सोच रही हैं...' 
                      : 'माइक दबाकर बोलें'}
                </p>
                {transcript && (
                  <p className="text-sm font-semibold text-pink-700 mt-2 bg-pink-50 py-1.5 px-3 rounded-xl inline-block border border-pink-200">
                    "{transcript}"
                  </p>
                )}
              </div>

              {/* Didi's Spoken Answer Box */}
              {didiResponse && (
                <div className="p-4 bg-gradient-to-r from-purple-50 via-pink-50 to-amber-50 rounded-2xl border border-purple-200 shadow-xs relative">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💜</span>
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider mb-1">
                        दीदी का उत्तर:
                      </h4>
                      <p className="text-sm text-slate-800 font-medium leading-relaxed">
                        {didiResponse}
                      </p>
                    </div>
                    <button
                      onClick={() => speak(didiResponse)}
                      className="p-2 bg-white rounded-xl shadow-xs text-purple-700 hover:bg-purple-100"
                      title="Replay Voice"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Quick Spoken Examples for Zero-Literacy Users */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
                  <span>या इनमें से किसी पर स्पर्श करें:</span>
                </p>
                <div className="space-y-2">
                  {samplePrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setTranscript(prompt);
                        handleProcessPrompt(prompt);
                      }}
                      className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-purple-100 hover:text-purple-950 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center justify-between transition-all touch-target-large"
                    >
                      <span>🗣️ "{prompt}"</span>
                      <ArrowRight className="w-4 h-4 text-purple-600 opacity-60" />
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-500 font-medium">
              🔒 सुरक्षित आवाज़ तकनीक • Google Gemini 1.5/2.0 समर्थित
            </div>

          </div>
        </div>
      )}
    </>
  );
};
