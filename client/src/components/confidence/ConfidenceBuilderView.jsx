import React, { useState, useEffect } from 'react';
import { 
  Award, Sparkles, Volume2, Flame, Play, CheckCircle2, 
  Download, Share2, Star, Heart, ShieldCheck 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useVoiceNarrator } from '../../context/VoiceNarratorContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import confetti from 'canvas-confetti';

export const ConfidenceBuilderView = () => {
  const { currentLang, t } = useLanguage();
  const { speak, narrateScreen } = useVoiceNarrator();
  const { user } = useAuth();

  const [stories, setStories] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);
  const [showCertificate, setShowCertificate] = useState(false);

  useEffect(() => {
    narrateScreen("आत्मविश्वास केंद्र: यहाँ आप ग्रामीण महिलाओं की प्रेरक कहानियां सुन सकती हैं, और अपने प्रमाण पत्र व बैज देख सकती हैं।");
    api.getDailyAffirmation().then(res => {
      if (res.success && res.stories) setStories(res.stories);
    }).catch(() => {});
  }, [currentLang]);

  const badges = [
    { name: "प्रथम कदम (First Step)", icon: "🌱", desc: "ऐप से जुड़कर पहली बार सीखा", unlocked: true },
    { name: "डिजिटल नारी (Digital Safety)", icon: "📱", desc: "यूपीआई सुरक्षा पाठ पूरा किया", unlocked: true },
    { name: "बचत सखी (Savings Guide)", icon: "💰", desc: "स्वयं सहायता समूह ज्ञान प्राप्त किया", unlocked: true },
    { name: "हुनर दीदी (Skill Master)", icon: "✂️", desc: "सिलाई व बुटीक के 3 पाठ पूरे किए", unlocked: true },
    { name: "ज्ञान ज्योति (Scholar Nari)", icon: "🌟", desc: "500+ XP अंक अर्जित किए", unlocked: false },
    { name: "लखपति दीदी (Enterprise Star)", icon: "👑", desc: "माइक्रो-उद्यम शुरू करने का संकल्प", unlocked: false }
  ];

  const handleDownloadCertificate = () => {
    confetti({ particleCount: 80, spread: 70 });
    speak("बधाई हो! आपका वोमंतरा डिजिटल साक्षरता प्रमाण पत्र तैयार है।");
  };

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto px-4 pt-3">
      
      {/* Header */}
      <div className="bg-womentra-gradient rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl">
            🌸
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black">
                आत्मविश्वास केंद्र (Confidence Builder)
              </h1>
              <Sparkles className="w-5 h-5 text-amber-300 fill-amber-300" />
            </div>
            <p className="text-xs sm:text-sm text-purple-100 font-medium">
              सपनों को दें नई उड़ान • प्रेरक कहानियां • आपकी उपलब्धियां
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCertificate(!showCertificate)}
          className="px-4 py-3 bg-amber-400 text-purple-950 hover:bg-amber-300 rounded-2xl font-black text-xs shadow-lg flex items-center gap-2 touch-target-large transition-all"
        >
          <Award className="w-4 h-4" />
          <span>{showCertificate ? 'कहानियां देखें' : 'प्रमाण पत्र देखें (Certificate)'}</span>
        </button>
      </div>

      {/* Certificate Showcase View */}
      {showCertificate ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-4 border-amber-400 shadow-2xl space-y-6 text-center animate-in zoom-in-95">
          <div className="space-y-2">
            <span className="text-4xl">👑</span>
            <h2 className="text-xl sm:text-2xl font-black text-purple-950 uppercase tracking-wide">
              सर्टिफिकेट ऑफ अचीवमेंट (Certificate of Achievement)
            </h2>
            <p className="text-xs text-purple-700 font-bold">
              ग्रामीण महिला डिजिटल व वित्तीय साक्षरता अभियान (Womentra Initiative)
            </p>
          </div>

          <div className="py-4 border-y-2 border-dashed border-purple-200 space-y-2">
            <p className="text-xs text-slate-500 font-bold">यह गर्व से प्रमाणित किया जाता है कि</p>
            <h3 className="text-2xl font-black text-pink-700">
              {user?.name || 'सुनीता देवी (Sunita Devi)'}
            </h3>
            <p className="text-xs text-slate-700 max-w-md mx-auto">
              ने वोमंतरा प्लेटफॉर्म पर डिजिटल सुरक्षा, सिलाई हुनर और सरकारी योजनाओं का प्रशिक्षण सफलतापूर्वक प्राप्त किया है।
            </p>
          </div>

          <div className="flex items-center justify-between text-left text-xs font-bold text-slate-700 px-4">
            <div>
              <p className="text-slate-400">जारीकर्ता:</p>
              <p className="text-purple-950">वोमंतरा राष्ट्रीय मिशन</p>
            </div>
            <div className="text-right">
              <p className="text-slate-400">सत्यापन टोकन:</p>
              <p className="text-emerald-700 font-mono">WOM-CERT-2026-9811</p>
            </div>
          </div>

          <button
            onClick={handleDownloadCertificate}
            className="w-full py-3.5 bg-womentra-gradient text-white rounded-2xl font-black text-sm shadow-lg flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            <span>प्रमाण पत्र डाउनलोड करें (Save / Share)</span>
          </button>
        </div>
      ) : (
        <>
          {/* Achievements & Badges Showcase */}
          <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-purple-950 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <span>आपके अर्जित बैज (Badges Gallery)</span>
              </h3>
              <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg">
                4 / 6 अनलॉक
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {badges.map((badge, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border flex flex-col items-center text-center transition-all ${
                    badge.unlocked
                      ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 text-amber-950 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                  }`}
                >
                  <span className="text-3xl mb-1.5">{badge.icon}</span>
                  <h4 className="text-xs font-black">{badge.name}</h4>
                  <p className="text-[10px] mt-0.5 leading-snug">{badge.desc}</p>
                  {badge.unlocked && (
                    <span className="text-[9px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full mt-2">
                      सक्रिय ✓
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Audio Stories of Rural Trailblazers */}
          <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-purple-950 flex items-center gap-2">
                <span>🎙️</span>
                <span>ग्रामीण महिला रोल मॉडल की कहानियां (Audio Stories)</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {stories.map((story) => (
                <div
                  key={story.id}
                  className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={story.image}
                      alt={story.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-xs"
                    />
                    <div>
                      <h4 className="text-xs font-black text-purple-950">{story.name}</h4>
                      <p className="text-[11px] text-pink-700 font-bold">{story.village}</p>
                      <span className="text-[10px] text-slate-500 font-semibold">अवधि: {story.duration}</span>
                    </div>
                  </div>

                  <p className="text-xs font-extrabold text-slate-900 leading-snug">
                    {story.titleHi || story.title}
                  </p>

                  <div className="p-2.5 bg-white rounded-xl border border-purple-100 text-[11px] text-purple-900 font-medium">
                    ✨ सीख: "{story.moral}"
                  </div>

                  <button
                    onClick={() => {
                      speak(`कहानी: ${story.name}। ${story.titleHi}. सीख: ${story.moral}`);
                    }}
                    className="w-full py-2.5 bg-womentra-gradient text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>कहानी सुनें (Audio)</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

    </div>
  );
};
