import React, { useState } from 'react';
import { X, Play, Pause, Volume2, Sparkles, CheckCircle, ArrowRight, ShieldCheck, Heart } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useVoiceNarrator } from '../../context/VoiceNarratorContext';

export const InteractiveAppTourModal = ({ isOpen, onClose }) => {
  const { currentLang } = useLanguage();
  const { speak } = useVoiceNarrator();
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      titleHi: "1. वोमंतरा क्या है? (What is Womentra)",
      descHi: "यह भारत की ग्रामीण बहनों के लिए बना पहला पूरी तरह बोलकर चलने वाला ऐप है। बिना पढ़े-लिखे भी आप हर सुविधा का लाभ ले सकती हैं।",
      visual: "💜 👩🏽‍🌾 📱",
      color: "from-purple-600 to-indigo-700"
    },
    {
      titleHi: "2. सरकारी साथी (Sarkari Saathi)",
      descHi: "मातृ वंदना, सुकन्या समृद्धि, लखपति दीदी और मुद्रा लोन जैसी योजनाओं की जानकारी पाएं और जन सेवा केंद्र से सीधे सहायता लें।",
      visual: "🏛️ 💰 📜",
      color: "from-pink-600 to-rose-700"
    },
    {
      titleHi: "3. हुनर हब और सिलाई (Skill Hub)",
      descHi: "घर बैठे सिलाई, बुटीक डिज़ाइन, ऑनलाइन सुरक्षित लेन-देन और मोबाइल चलाना सीखें।",
      visual: "🧵 ✂️ 💳",
      color: "from-emerald-600 to-teal-700"
    },
    {
      titleHi: "4. आपकी अपनी मेंटर और लाइव क्लास",
      descHi: "हर सखी को एक सत्यापित मेंटर दीदी मिलती हैं जो वीडियो व ऑडियो कॉल पर व्यक्तिगत मार्गदर्शन देती हैं।",
      visual: "👩🏽‍🏫 📞 ✨",
      color: "from-amber-500 to-orange-600"
    },
    {
      titleHi: "5. बोलकर पूछें (Gemini Voice Assistant)",
      descHi: "स्क्रीन पर दिए गए गुलाबी माइक बटन को कभी भी दबाकर बोलें। वोमंतरा दीदी आपकी भाषा में तुरंत मदद करेंगी।",
      visual: "🎙️ 🤖 🌸",
      color: "from-purple-800 to-pink-600"
    }
  ];

  if (!isOpen) return null;

  const current = slides[activeSlide];

  const handleSlideChange = (index) => {
    setActiveSlide(index);
    speak(`${slides[index].titleHi}. ${slides[index].descHi}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-purple-100 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-womentra-gradient p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300 fill-amber-300" />
            <h3 className="text-lg font-black tracking-tight">
              ऐप कैसे चलाएं (How to use Womentra)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 transition-all text-white"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Animated Visual Card */}
        <div className="p-6 space-y-4">
          <div className={`p-8 rounded-3xl bg-gradient-to-br ${current.color} text-white text-center shadow-xl relative overflow-hidden transition-all duration-300 min-h-[200px] flex flex-col items-center justify-center`}>
            <div className="text-5xl mb-3 animate-mascot-bob">
              {current.visual}
            </div>
            <h4 className="text-xl font-black mb-1 tracking-tight">
              {current.titleHi}
            </h4>
            <p className="text-xs text-white/90 font-medium max-w-sm mx-auto leading-relaxed">
              {current.descHi}
            </p>
          </div>

          {/* Voice Replay Button */}
          <div className="flex justify-center">
            <button
              onClick={() => speak(`${current.titleHi}. ${current.descHi}`)}
              className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-xl text-xs font-bold flex items-center gap-2 border border-purple-200"
            >
              <Volume2 className="w-4 h-4" />
              <span>यह भाग फिर से सुनें</span>
            </button>
          </div>

          {/* Carousel Dots */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => handleSlideChange(idx)}
                className={`h-2.5 rounded-full transition-all ${
                  idx === activeSlide ? 'w-8 bg-pink-600' : 'w-2.5 bg-slate-200 hover:bg-slate-300'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Next / Finish Button */}
          <div className="pt-2">
            {activeSlide < slides.length - 1 ? (
              <button
                onClick={() => handleSlideChange(activeSlide + 1)}
                className="w-full py-3.5 bg-womentra-gradient text-white rounded-2xl font-black text-sm shadow-md shadow-pink-500/20 hover:opacity-95 transition-all flex items-center justify-center gap-2 touch-target-large"
              >
                <span>अगला देखें →</span>
              </button>
            ) : (
              <button
                onClick={onClose}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 touch-target-large"
              >
                <CheckCircle className="w-5 h-5" />
                <span>सीख लिया! ऐप शुरू करें 🎉</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
