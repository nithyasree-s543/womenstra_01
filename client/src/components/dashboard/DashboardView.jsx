import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Flame, Award, BookOpen, Landmark, HeartHandshake, 
  Video, Play, Volume2, ShieldCheck, ChevronRight, CheckCircle2,
  Users, ArrowRight, UserPlus, MapPin, PhoneCall, Bot
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useVoiceNarrator } from '../../context/VoiceNarratorContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export const DashboardView = ({ onNavigate, onOpenTour, onOpenAuth }) => {
  const { currentLang, t } = useLanguage();
  const { speak, narrateScreen } = useVoiceNarrator();
  const { user, activeDependent, setActiveDependent } = useAuth();

  const [activeTab, setActiveTab] = useState('power'); // 'potential' | 'power' | 'future'
  const [affirmation, setAffirmation] = useState(null);
  const [schemes, setSchemes] = useState([]);
  const [mentor, setMentor] = useState(null);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    // Screen narration on mount
    const welcomeNarrative = currentLang === 'hi'
      ? `नमस्ते ${user ? user.name : 'दीदी'}! वोमंतरा होम स्क्रीन पर आपका स्वागत है। नीचे आपके आज के पाठ, सरकारी योजनाएं और मेंटर उपलब्ध हैं।`
      : `Welcome ${user ? user.name : 'Didi'}! Today's lessons, government schemes, and your mentor are ready for you.`;
    narrateScreen(welcomeNarrative);

    // Fetch initial overview data
    api.getDailyAffirmation().then(res => {
      if (res.success && res.affirmation) setAffirmation(res.affirmation);
    }).catch(() => {});

    api.getSchemes().then(res => {
      if (res.success) setSchemes(res.schemes.slice(0, 3));
    }).catch(() => {});

    api.getMyMentor(user?.id).then(res => {
      if (res.success) setMentor(res.mentor);
    }).catch(() => {});

    api.getCourses().then(res => {
      if (res.success) setCourses(res.courses.slice(0, 2));
    }).catch(() => {});
  }, [currentLang, user]);

  return (
    <div className="space-y-6 pb-24 max-w-5xl mx-auto px-4 pt-3">
      
      {/* 1. Welcome & Mascot Header Banner */}
      <div className="bg-womentra-gradient rounded-3xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-400/20 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shadow-inner border border-white/30 animate-mascot-bob">
              👩🏽‍🌾
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                  {user ? `नमस्ते, ${user.name}!` : t('welcome')}
                </h1>
                <Sparkles className="w-5 h-5 text-amber-300 fill-amber-300 animate-spin" />
              </div>
              <p className="text-xs sm:text-sm text-purple-100 font-medium mt-0.5">
                {t('mission')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onOpenTour}
              className="flex-1 sm:flex-none px-3.5 py-2 bg-white/15 hover:bg-white/25 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 backdrop-blur-md border border-white/20 touch-target-large transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{t('howToUse')}</span>
            </button>
            <button
              onClick={() => speak(currentLang === 'hi' 
                ? `नमस्ते! यह वोमंतरा का मुख्य डैशबोर्ड है। आप आज का पाठ शुरू कर सकती हैं या सरकारी योजनाएं देख सकती हैं।` 
                : "Welcome to Womentra dashboard.")}
              className="p-2.5 bg-white/20 hover:bg-white/30 rounded-2xl backdrop-blur-md border border-white/20 touch-target-large transition-all text-white"
              title="Listen Screen"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Daily Affirmation Voice Card */}
        {affirmation && (
          <div className="mt-4 p-3.5 bg-white/10 rounded-2xl backdrop-blur-md border border-white/15 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🌸</span>
              <p className="text-xs sm:text-sm font-semibold text-white italic">
                "{currentLang === 'hi' ? affirmation.quote : affirmation.quoteEn}"
              </p>
            </div>
            <button
              onClick={() => speak(currentLang === 'hi' ? affirmation.quote : affirmation.quoteEn)}
              className="p-1.5 bg-white/20 hover:bg-white/30 rounded-xl text-white shrink-0"
              title="Speak Affirmation"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* 2. Three Pillars Navigation Tabs: Potential → Power → Future */}
      <div className="grid grid-cols-3 gap-2 p-1.5 bg-purple-100/70 rounded-2xl border border-purple-200">
        <button
          onClick={() => {
            setActiveTab('potential');
            speak("क्षमता स्तंभ: आपकी रुचियां, कौशल आकलन और व्यक्तिगत ताकत।");
          }}
          className={`py-3 px-2 rounded-xl text-xs sm:text-sm font-extrabold flex flex-col items-center gap-1 transition-all touch-target-large ${
            activeTab === 'potential'
              ? 'bg-white text-purple-900 shadow-md scale-100'
              : 'text-purple-700 hover:text-purple-950 hover:bg-white/50'
          }`}
        >
          <span className="text-lg">🌱</span>
          <span>{t('potentialTab')}</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('power');
            speak("शक्ति स्तंभ: आपके हुनर कोर्स, सरकारी योजनाएं और आपकी मार्गदर्शक मेंटर।");
          }}
          className={`py-3 px-2 rounded-xl text-xs sm:text-sm font-extrabold flex flex-col items-center gap-1 transition-all touch-target-large ${
            activeTab === 'power'
              ? 'bg-womentra-gradient text-white shadow-md scale-100'
              : 'text-purple-700 hover:text-purple-950 hover:bg-white/50'
          }`}
        >
          <span className="text-lg">⚡</span>
          <span>{t('powerTab')}</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('future');
            speak("भविष्य स्तंभ: आपका करियर रोडमैप, बचत लक्ष्य और प्रमाण पत्र।");
          }}
          className={`py-3 px-2 rounded-xl text-xs sm:text-sm font-extrabold flex flex-col items-center gap-1 transition-all touch-target-large ${
            activeTab === 'future'
              ? 'bg-white text-purple-900 shadow-md scale-100'
              : 'text-purple-700 hover:text-purple-950 hover:bg-white/50'
          }`}
        >
          <span className="text-lg">🌟</span>
          <span>{t('futureTab')}</span>
        </button>
      </div>

      {/* TAB CONTENT: POTENTIAL (Skills & Assessment) */}
      {activeTab === 'potential' && (
        <div className="space-y-4 animate-in fade-in-50 duration-200">
          <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                <h3 className="font-extrabold text-base text-purple-950">
                  आपकी ताकत और रुचियां (Skill Assessment)
                </h3>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
                Level 1: सक्रिय शिक्षार्थी
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { name: "सिलाई व बुटीक", icon: "✂️", score: "80% मैच" },
                { name: "डिजिटल यूपीआई सुरक्षा", icon: "📱", score: "95% मैच" },
                { name: "स्वयं सहायता समूह बचत", icon: "💰", score: "85% मैच" },
                { name: "स्मार्टफोन व AI टूल्स", icon: "🤖", score: "70% मैच" },
                { name: "सरकारी योजनाएं", icon: "🏛️", score: "90% मैच" },
                { name: "बच्चों की शिक्षा", icon: "👧", score: "75% मैच" }
              ].map((skill, idx) => (
                <div key={idx} className="p-3.5 bg-purple-50/70 border border-purple-100 rounded-2xl flex flex-col items-center text-center">
                  <span className="text-2xl mb-1">{skill.icon}</span>
                  <p className="text-xs font-bold text-purple-950">{skill.name}</p>
                  <span className="text-[10px] font-semibold text-pink-600 mt-1">{skill.score}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigate('courses')}
              className="w-full py-3.5 bg-womentra-gradient text-white rounded-2xl font-bold text-xs shadow-md flex items-center justify-center gap-2 touch-target-large"
            >
              <span>हुनर हब में नए कोर्स देखें →</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB CONTENT: POWER (Today's Actions, Courses, Schemes, Mentor) */}
      {activeTab === 'power' && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          
          {/* Quick Action Large Touch Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            
            {/* Sarkari Saathi */}
            <button
              onClick={() => onNavigate('schemes')}
              className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 hover:border-pink-500 rounded-3xl text-left shadow-xs transition-all hover:scale-[1.02] touch-target-large group"
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md mb-2 group-hover:scale-110 transition-transform">
                <Landmark className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-extrabold text-purple-950">
                {t('schemes')}
              </h3>
              <p className="text-[11px] text-purple-700 font-medium mt-0.5">
                मातृ वंदना, सुकन्या, मुद्रा
              </p>
            </button>

            {/* Courses Hub */}
            <button
              onClick={() => onNavigate('courses')}
              className="p-4 bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-pink-200 hover:border-pink-500 rounded-3xl text-left shadow-xs transition-all hover:scale-[1.02] touch-target-large group"
            >
              <div className="w-12 h-12 rounded-2xl bg-pink-600 text-white flex items-center justify-center shadow-md mb-2 group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-extrabold text-pink-950">
                {t('courses')}
              </h3>
              <p className="text-[11px] text-pink-700 font-medium mt-0.5">
                सिलाई, यूपीआई, बचत
              </p>
            </button>

            {/* My Mentor */}
            <button
              onClick={() => onNavigate('mentorship')}
              className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 hover:border-amber-500 rounded-3xl text-left shadow-xs transition-all hover:scale-[1.02] touch-target-large group"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-md mb-2 group-hover:scale-110 transition-transform">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-extrabold text-amber-950">
                {t('mentor')}
              </h3>
              <p className="text-[11px] text-amber-700 font-medium mt-0.5">
                डॉ. अनन्या (मार्गदर्शक)
              </p>
            </button>

            {/* Live Tutoring Room */}
            <button
              onClick={() => onNavigate('live')}
              className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 hover:border-emerald-500 rounded-3xl text-left shadow-xs transition-all hover:scale-[1.02] touch-target-large group"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md mb-2 group-hover:scale-110 transition-transform relative">
                <Video className="w-6 h-6" />
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 absolute -top-1 -right-1 ring-2 ring-white animate-ping" />
              </div>
              <h3 className="text-sm font-extrabold text-emerald-950">
                लाइव क्लास
              </h3>
              <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                आज शाम 4:00 बजे
              </p>
            </button>

          </div>

          {/* Today's Recommended Audio Lesson */}
          <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎧</span>
                <div>
                  <h3 className="font-black text-base text-purple-950">
                    {t('todayLesson')}
                  </h3>
                  <p className="text-xs text-purple-700 font-medium">
                    डिजिटल पैसा और यूपीआई फ्रॉड से सुरक्षा (पाठ 1)
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-xl text-xs font-bold flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-400" />
                <span>+50 अंक</span>
              </span>
            </div>

            <div className="p-4 bg-purple-50/80 rounded-2xl border border-purple-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => speak("पाठ का मुख्य नियम: यूपीआई पिन सिर्फ पैसे भेजने के लिए होता है, पैसे पाने के लिए कभी पिन नहीं डालना होता।")}
                  className="w-12 h-12 rounded-2xl bg-womentra-gradient text-white flex items-center justify-center shadow-md shrink-0"
                >
                  <Play className="w-6 h-6 fill-white ml-0.5" />
                </button>
                <div>
                  <p className="text-xs font-bold text-purple-950">
                    UPI पिन क्या है और इसे कभी किसी को क्यों न बताएं
                  </p>
                  <p className="text-[11px] text-slate-600">अवधि: 5 मिनट • सरल हिंदी आवाज़</p>
                </div>
              </div>

              <button
                onClick={() => onNavigate('courses')}
                className="w-full sm:w-auto px-4 py-2.5 bg-purple-900 hover:bg-purple-950 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 touch-target-large"
              >
                <span>{t('startLesson')}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Assigned Dedicated Mentor Preview */}
          {mentor && (
            <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-amber-50 rounded-3xl p-5 border border-purple-200 shadow-md">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src={mentor.avatar}
                    alt={mentor.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-extrabold text-base text-purple-950">{mentor.name}</h4>
                      <ShieldCheck className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                    </div>
                    <p className="text-xs text-purple-800 font-semibold">{mentor.title}</p>
                    <p className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5">
                      <span>★ {mentor.rating} ({mentor.totalReviews} समीक्षाएं)</span>
                      <span>• {mentor.languages.join(', ').toUpperCase()}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      speak(`आपकी मेंटर ${mentor.name} से ऑडियो कॉल कनेक्ट हो रहा है...`);
                      onNavigate('mentorship');
                    }}
                    className="flex-1 sm:flex-none px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 touch-target-large"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>{t('callMentor')}</span>
                  </button>

                  <button
                    onClick={() => onNavigate('mentorship')}
                    className="px-3.5 py-3 bg-white border border-purple-200 hover:bg-purple-100 text-purple-900 rounded-2xl text-xs font-bold touch-target-large"
                  >
                    प्रोफाइल
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Sarkari Saathi Highlight Carousel */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-base text-purple-950 flex items-center gap-2">
                <span>🏛️</span>
                <span>शीर्ष सरकारी योजनाएं (Top Government Schemes)</span>
              </h3>
              <button
                onClick={() => onNavigate('schemes')}
                className="text-xs font-bold text-pink-600 hover:underline flex items-center gap-0.5"
              >
                <span>सभी देखें</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {schemes.map((s) => (
                <div
                  key={s.id}
                  className="p-4 bg-white rounded-2xl border border-purple-100 shadow-xs flex flex-col justify-between hover:border-purple-300 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-extrabold px-2.5 py-0.5 bg-purple-100 text-purple-800 rounded-lg">
                        {s.benefitAmount}
                      </span>
                      <button
                        onClick={() => speak(s.voiceSummary || s.tagline)}
                        className="p-1 text-purple-600 hover:bg-purple-50 rounded-md"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                    <h4 className="text-xs font-extrabold text-slate-900 line-clamp-1">
                      {s.titleHi || s.title}
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                      {s.tagline}
                    </p>
                  </div>

                  <button
                    onClick={() => onNavigate('schemes')}
                    className="mt-3 w-full py-2 bg-purple-50 hover:bg-purple-100 text-purple-900 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1"
                  >
                    <span>पात्रता व आवेदन →</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB CONTENT: FUTURE (Roadmap, Goals, Badges) */}
      {activeTab === 'future' && (
        <div className="space-y-4 animate-in fade-in-50 duration-200">
          <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-purple-950 flex items-center gap-2">
                <span>🌟</span>
                <span>आपका प्रगति पथ (Career & Financial Roadmap)</span>
              </h3>
              <span className="text-xs font-bold text-purple-700">7 दिन लगातार 🔥</span>
            </div>

            {/* Stepped Journey Path */}
            <div className="space-y-3">
              {[
                { step: 1, title: "पहचान व डिजिटल खाता", desc: "मोबाइल नंबर व आवाज से प्रोफाइल पूरी की", done: true },
                { step: 2, title: "डिजिटल यूपीआई सुरक्षा", desc: "पिन सुरक्षा और फ्रॉड से बचने का ज्ञान लिया", done: true },
                { step: 3, title: "सिलाई व बुटीक मास्टरक्लास", desc: "ब्लाउज कटिंग और दाम तय करना प्रगति पर है", done: false },
                { step: 4, title: "मातृ वंदना / मुद्रा लोन आवेदन", desc: "जन सेवा केंद्र से सहायता प्राप्त करें", done: false },
                { step: 5, title: "आत्मनिर्भर लखपति दीदी", desc: "सालाना ₹1 लाख से अधिक की कमाई का लक्ष्य", done: false }
              ].map((item) => (
                <div
                  key={item.step}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                    item.done
                      ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                      item.done ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {item.done ? '✓' : item.step}
                    </div>
                    <div>
                      <p className="text-xs font-extrabold">{item.title}</p>
                      <p className="text-[10px] opacity-80">{item.desc}</p>
                    </div>
                  </div>
                  {item.done && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-md shadow-2xs">
                      सफल 🎉
                    </span>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigate('confidence')}
              className="w-full py-3.5 bg-womentra-gradient text-white rounded-2xl font-bold text-xs shadow-md flex items-center justify-center gap-2 touch-target-large"
            >
              <span>प्रमाण पत्र व बैज देखें →</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
