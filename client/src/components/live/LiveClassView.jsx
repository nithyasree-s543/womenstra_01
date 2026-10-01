import React, { useState, useEffect } from 'react';
import { 
  Video, VideoOff, Mic, MicOff, Hand, MessageSquare, Users, 
  ShieldCheck, PhoneOff, Volume2, Sparkles, AlertTriangle, Eye
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useVoiceNarrator } from '../../context/VoiceNarratorContext';
import { useAuth } from '../../context/AuthContext';
import confetti from 'canvas-confetti';

export const LiveClassView = ({ onLeave }) => {
  const { currentLang } = useLanguage();
  const { speak, narrateScreen } = useVoiceNarrator();
  const { user, activeDependent } = useAuth();

  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isLowBandwidthMode, setIsLowBandwidthMode] = useState(false);
  const [participantCount, setParticipantCount] = useState(28);

  useEffect(() => {
    narrateScreen("लाइव क्लास रूम: यहाँ आपकी मेंटर दीदी लाइव सिलाई और हुनर सिखा रही हैं। कम इंटरनेट होने पर आप ऑडियो मोड ऑन कर सकती हैं।");
  }, []);

  const handleToggleHandRaise = () => {
    const newState = !isHandRaised;
    setIsHandRaised(newState);
    if (newState) {
      speak("आपने हाथ उठाया है। मेंटर दीदी को सूचित कर दिया गया है।");
      confetti({ particleCount: 40 });
    }
  };

  const handleToggleLowBandwidth = () => {
    const newState = !isLowBandwidthMode;
    setIsLowBandwidthMode(newState);
    if (newState) {
      setIsVideoOn(false);
      speak("कम नेटवर्क मोड चालू किया गया। अब सिर्फ ऑडियो चलेगा जिससे इंटरनेट की बचत होगी।");
    } else {
      setIsVideoOn(true);
      speak("वीडियो मोड फिर से चालू हो गया है।");
    }
  };

  return (
    <div className="space-y-4 pb-24 max-w-4xl mx-auto px-4 pt-3">
      
      {/* 1. Class Header with Guardian Minor Safety Banner */}
      <div className="bg-slate-900 rounded-3xl p-4 text-white shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-bold animate-pulse">
            LIVE
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black tracking-tight">
              सिलाई मास्टरक्लास: ब्लाउज पाइपिंग व फिनिशिंग
            </h2>
            <p className="text-[11px] text-slate-400">
              मार्गदर्शक: डॉ. अनन्या शर्मा • {participantCount} सखियां उपस्थित
            </p>
          </div>
        </div>

        <button
          onClick={onLeave}
          className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 touch-target-large"
        >
          <PhoneOff className="w-4 h-4" />
          <span>क्लास छोड़ें</span>
        </button>
      </div>

      {/* Minor / Dependent Safety Observer Notice */}
      {activeDependent && (
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between text-amber-900">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-amber-600" />
            <div>
              <p className="text-xs font-bold">अभिभावक सुरक्षा निगरानी (Guardian Active)</p>
              <p className="text-[10px] text-amber-800">
                {activeDependent.name} (आयु {activeDependent.age}) की सुरक्षा के लिए यह सत्र सुरक्षित और अभिभावक-निरीक्षित है।
              </p>
            </div>
          </div>
          <span className="text-[10px] font-extrabold bg-amber-500 text-white px-2 py-0.5 rounded-md">
            सुरक्षित ✓
          </span>
        </div>
      )}

      {/* 2. Main Live Video Stage */}
      <div className="relative aspect-video rounded-3xl overflow-hidden bg-slate-950 border-2 border-purple-900 shadow-2xl flex items-center justify-center">
        
        {/* Mentor Video Feed Mock / Low Bandwidth Poster */}
        {isLowBandwidthMode ? (
          <div className="text-center p-6 space-y-3">
            <div className="w-20 h-20 rounded-full bg-womentra-gradient flex items-center justify-center mx-auto text-3xl animate-voice-listening">
              👩🏽‍🏫
            </div>
            <h3 className="text-base font-bold text-white">डॉ. अनन्या शर्मा (लाइव ऑडियो)</h3>
            <p className="text-xs text-emerald-400 font-semibold flex items-center justify-center gap-1">
              <span>● कम इंटरनेट ऑडियो मोड सक्रिय (2G/3G Ready)</span>
            </p>
          </div>
        ) : (
          <div className="relative w-full h-full">
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80"
              alt="Mentor Video"
              className="w-full h-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            
            {/* Live Subtitles in Hindi for zero-literacy & noisy surroundings */}
            <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-md p-3 rounded-2xl border border-white/20 text-center">
              <p className="text-xs sm:text-sm font-bold text-amber-300">
                "पाइपिंग लगाते समय कपड़े को ज्यादा न खींचें, हल्के हाथ से सिलाई चलाएं..."
              </p>
            </div>

            <div className="absolute top-4 left-4 bg-purple-900/80 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-bold text-white border border-purple-500/30">
              👩🏽‍🏫 डॉ. अनन्या शर्मा (मेंटर)
            </div>
          </div>
        )}

        {/* Self Video PIP (Picture-in-Picture) */}
        <div className="absolute top-4 right-4 w-28 sm:w-36 aspect-video rounded-2xl overflow-hidden bg-slate-800 border-2 border-white/40 shadow-lg">
          {isVideoOn ? (
            <div className="w-full h-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold">
              <span>👩🏽 आपकी स्क्रीन</span>
            </div>
          ) : (
            <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-400 text-xs">
              <VideoOff className="w-5 h-5" />
            </div>
          )}
        </div>

      </div>

      {/* 3. Bottom Control Dock (56px Large Touch Targets) */}
      <div className="p-4 bg-white rounded-3xl border border-purple-100 shadow-lg flex items-center justify-around gap-2">
        
        {/* Toggle Mic */}
        <button
          onClick={() => {
            const next = !isMicOn;
            setIsMicOn(next);
            speak(next ? "माइक चालू हो गया है।" : "माइक बंद हो गया है।");
          }}
          className={`flex flex-col items-center gap-1 p-3 rounded-2xl touch-target-large transition-all ${
            isMicOn 
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          {isMicOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
          <span className="text-[10px] font-bold">{isMicOn ? 'माइक ऑन' : 'माइक म्यूट'}</span>
        </button>

        {/* Toggle Video */}
        <button
          onClick={() => setIsVideoOn(!isVideoOn)}
          className={`flex flex-col items-center gap-1 p-3 rounded-2xl touch-target-large transition-all ${
            isVideoOn 
              ? 'bg-purple-100 text-purple-900 border border-purple-300' 
              : 'bg-slate-100 text-slate-500'
          }`}
        >
          {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          <span className="text-[10px] font-bold">{isVideoOn ? 'कैमरा ऑन' : 'कैमरा बंद'}</span>
        </button>

        {/* Raise Hand by Voice */}
        <button
          onClick={handleToggleHandRaise}
          className={`flex flex-col items-center gap-1 p-3 rounded-2xl touch-target-large transition-all ${
            isHandRaised 
              ? 'bg-amber-100 text-amber-900 border-2 border-amber-500 animate-bounce' 
              : 'bg-slate-100 text-slate-700 hover:bg-amber-50'
          }`}
        >
          <Hand className="w-6 h-6" />
          <span className="text-[10px] font-bold">{isHandRaised ? 'हाथ उठाया' : 'सवाल पूछें'}</span>
        </button>

        {/* Low Bandwidth 2G Mode */}
        <button
          onClick={handleToggleLowBandwidth}
          className={`flex flex-col items-center gap-1 p-3 rounded-2xl touch-target-large transition-all ${
            isLowBandwidthMode 
              ? 'bg-emerald-600 text-white shadow-md' 
              : 'bg-slate-100 text-slate-700 hover:bg-emerald-50'
          }`}
        >
          <Volume2 className="w-6 h-6" />
          <span className="text-[10px] font-bold">{isLowBandwidthMode ? '2G मोड ON' : 'कम 2G डेटा'}</span>
        </button>

      </div>

    </div>
  );
};
