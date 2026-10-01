import React, { useState, useEffect } from 'react';
import { 
  HeartHandshake, PhoneCall, Video, Star, Sparkles, Send, Mic, 
  ShieldCheck, Calendar, UserPlus, Volume2, MessageSquare, Clock, X, Check
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useVoiceNarrator } from '../../context/VoiceNarratorContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import confetti from 'canvas-confetti';

export const MentorshipView = ({ onNavigateLive }) => {
  const { currentLang } = useLanguage();
  const { speak, narrateScreen } = useVoiceNarrator();
  const { user, activeDependent, setActiveDependent } = useAuth();

  const [mentor, setMentor] = useState(null);
  const [allMentors, setAllMentors] = useState([]);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'mentor', text: 'नमस्ते सुनीता दीदी! क्या आप आज सिलाई के नाप का अभ्यास कर रही हैं?', time: '10:30 AM', isVoice: false },
    { id: 2, sender: 'user', text: 'हाँ दीदी, मैंने ब्लाउज का गला काटा है। शाम को वीडियो पर चेक कर दीजिएगा।', time: '10:35 AM', isVoice: true }
  ]);
  const [inputText, setInputText] = useState('');
  
  // Modals
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [isAddDependentOpen, setIsAddDependentOpen] = useState(false);
  
  const [selectedRating, setSelectedRating] = useState(5);
  const [ratingFeedback, setRatingFeedback] = useState('');
  const [dependents, setDependents] = useState([
    { id: 'dep-1', name: 'पूजा कुमारी', age: 12, relationship: 'बेटी (Daughter)', goal: 'कक्षा 7 गणित व अंग्रेजी', mentor: 'कविता रमण' }
  ]);
  const [newDepName, setNewDepName] = useState('');
  const [newDepAge, setNewDepAge] = useState('10');

  useEffect(() => {
    narrateScreen("मेरी मेंटर स्क्रीन: यहाँ आपकी समर्पित मार्गदर्शक दीदी उपलब्ध हैं। आप सीधे वॉइस मैसेज भेज सकती हैं या लाइव कॉल बुक कर सकती हैं।");
    loadMentors();
  }, [currentLang]);

  const loadMentors = async () => {
    try {
      const [myRes, allRes] = await Promise.all([
        api.getMyMentor(user?.id),
        api.getMentors()
      ]);
      if (myRes.success) setMentor(myRes.mentor);
      if (allRes.success) setAllMentors(allRes.mentors);
    } catch (err) {
      console.warn('Error fetching mentors:', err);
    }
  };

  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: 'user',
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isVoice: false
    };

    setChatMessages([...chatMessages, newMsg]);
    setInputText('');

    // Mentor simulated instant friendly response
    setTimeout(() => {
      const reply = {
        id: Date.now() + 1,
        sender: 'mentor',
        text: 'बहुत अच्छा दीदी! मैं शाम 4 बजे लाइव क्लास में आपका काम देखूंगी। कोई भी दिक्कत हो तो पूछें।',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isVoice: false
      };
      setChatMessages(prev => [...prev, reply]);
      speak("मेंटर का संदेश आया है: बहुत अच्छा दीदी! मैं शाम 4 बजे आपका काम देखूंगी।");
    }, 1200);
  };

  const handleSendVoiceNote = () => {
    speak("वॉइस नोट रिकॉर्ड हो रहा है...");
    setTimeout(() => {
      const voiceMsg = {
        id: Date.now(),
        sender: 'user',
        text: '🎙️ वॉइस संदेश (0:24 सेकंड)',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isVoice: true
      };
      setChatMessages(prev => [...prev, voiceMsg]);
      speak("आपका वॉइस मैसेज मेंटर को भेज दिया गया है।");
    }, 1000);
  };

  const handleSubmitRating = async () => {
    if (!mentor) return;
    try {
      await api.rateMentor({
        mentorId: mentor.id,
        rating: selectedRating,
        feedback: ratingFeedback
      });
      setIsRateModalOpen(false);
      confetti({ particleCount: 50 });
      speak("धन्यवाद! आपकी समीक्षा और स्टार रेटिंग दर्ज कर ली गई है।");
      loadMentors();
    } catch {}
  };

  const handleAddDependent = async (e) => {
    if (e) e.preventDefault();
    if (!newDepName) return;

    const newDep = {
      id: `dep-${Date.now()}`,
      name: newDepName,
      age: Number(newDepAge),
      relationship: 'बेटी (Daughter)',
      goal: 'प्राथमिक शिक्षा व अंक ज्ञान',
      mentor: 'कविता रमण'
    };

    setDependents([...dependents, newDep]);
    setIsAddDependentOpen(false);
    setNewDepName('');
    speak(`${newDepName} का प्रोफाइल जुड़ गया है। अब आप उनकी पढ़ाई का अलग रिकॉर्ड देख सकती हैं।`);
  };

  return (
    <div className="space-y-6 pb-24 max-w-5xl mx-auto px-4 pt-3">
      
      {/* 1. Header Banner */}
      <div className="bg-womentra-gradient rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shadow-inner border border-white/30">
              🤝
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                  मेरी समर्पित मेंटर (1:1 Mentor)
                </h1>
                <Sparkles className="w-5 h-5 text-amber-300 fill-amber-300" />
              </div>
              <p className="text-xs sm:text-sm text-purple-100 font-medium">
                आपकी भाषा, आपका क्षेत्र और आपकी गति के अनुसार व्यक्तिगत मार्गदर्शन
              </p>
            </div>
          </div>

          <button
            onClick={() => speak("आपकी मेंटर आपको व्यक्तिगत रूप से सिलाई, व्यापार और सरकारी योजनाओं में मार्गदर्शन देती हैं।")}
            className="p-2.5 bg-white/20 hover:bg-white/30 rounded-2xl backdrop-blur-md border border-white/20 text-white flex items-center gap-2 text-xs font-bold"
          >
            <Volume2 className="w-5 h-5" />
            <span>मेंटर नियम सुनें</span>
          </button>
        </div>
      </div>

      {/* 2. Dependent Learner Switcher (Mother vs Child Profile) */}
      <div className="bg-white rounded-3xl p-4 border border-purple-100 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-black">
            👧
          </div>
          <div>
            <h3 className="text-xs font-black text-purple-950">
              सीखने वाला प्रोफाइल (Active Learner):
            </h3>
            <p className="text-xs text-purple-700 font-bold">
              {activeDependent ? `👧 ${activeDependent.name} (${activeDependent.relationship})` : `👩🏽 ${user?.name || 'सुनीता देवी'} (स्वयं)`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {activeDependent ? (
            <button
              onClick={() => {
                setActiveDependent(null);
                speak("माता के मुख्य प्रोफाइल पर वापस आ गए हैं।");
              }}
              className="px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-900 rounded-xl text-xs font-bold"
            >
              ← माता के प्रोफाइल पर स्विच करें
            </button>
          ) : (
            <button
              onClick={() => {
                if (dependents.length > 0) {
                  setActiveDependent(dependents[0]);
                  speak(`बेटी ${dependents[0].name} के प्रोफाइल पर स्विच कर दिया गया है।`);
                } else {
                  setIsAddDependentOpen(true);
                }
              }}
              className="px-3 py-2 bg-pink-50 hover:bg-pink-100 text-pink-900 rounded-xl text-xs font-bold flex items-center gap-1"
            >
              <span>👧 बेटी का प्रोफाइल देखें</span>
            </button>
          )}

          <button
            onClick={() => setIsAddDependentOpen(true)}
            className="px-3 py-2 bg-purple-900 text-white rounded-xl text-xs font-bold flex items-center gap-1"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>बच्चे जोड़ें</span>
          </button>
        </div>
      </div>

      {/* 3. Assigned Dedicated Mentor Card */}
      {mentor && (
        <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={mentor.avatar}
                alt={mentor.name}
                className="w-20 h-20 rounded-3xl object-cover border-4 border-purple-100 shadow-md"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-slate-900">{mentor.name}</h3>
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-extrabold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>DigiLocker KYC सत्यापित</span>
                  </span>
                </div>
                <p className="text-xs text-purple-800 font-bold mt-0.5">{mentor.title}</p>
                
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-semibold text-slate-600">
                  <span className="flex items-center gap-1 text-amber-600 font-bold">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{mentor.rating} ({mentor.totalReviews} समीक्षाएं)</span>
                  </span>
                  <span>• {mentor.experienceYears} वर्ष अनुभव</span>
                  <span>• भाषा: {mentor.languages?.join(', ').toUpperCase()}</span>
                </div>
              </div>
            </div>

            {/* Direct Connect Buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  speak(`आपकी मेंटर ${mentor.name} से ऑडियो कॉल कनेक्ट हो रहा है...`);
                }}
                className="flex-1 sm:flex-none px-4 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 touch-target-large"
              >
                <PhoneCall className="w-4 h-4" />
                <span>ऑडियो कॉल (कम नेटवर्क)</span>
              </button>

              <button
                onClick={() => onNavigateLive && onNavigateLive()}
                className="flex-1 sm:flex-none px-4 py-3.5 bg-womentra-gradient text-white rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-md shadow-pink-500/20 touch-target-large"
              >
                <Video className="w-4 h-4" />
                <span>लाइव क्लास रूम</span>
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            "{mentor.bio}"
          </p>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500 font-bold">
              सक्रिय शिक्षार्थी: <b className="text-purple-900">{mentor.activeMentees} बहनें</b>
            </span>
            <button
              onClick={() => setIsRateModalOpen(true)}
              className="text-pink-600 font-bold hover:underline flex items-center gap-1"
            >
              <Star className="w-3.5 h-3.5" />
              <span>मेंटर को रेटिंग दें</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. Direct Voice & Text Chat with Mentor */}
      <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-purple-950 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-purple-700" />
            <span>मेंटर संवाद (Voice & Text Messages)</span>
          </h3>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
            ● ऑनलाइन
          </span>
        </div>

        {/* Message Thread */}
        <div className="space-y-3 max-h-64 overflow-y-auto p-2 bg-slate-50 rounded-2xl border border-slate-100">
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3.5 rounded-2xl text-xs font-semibold shadow-2xs ${
                  msg.sender === 'user'
                    ? 'bg-womentra-gradient text-white rounded-br-none'
                    : 'bg-white text-slate-900 border border-purple-100 rounded-bl-none'
                }`}
              >
                <p>{msg.text}</p>
                <div className="flex items-center justify-between gap-2 mt-1">
                  <span className="text-[9px] opacity-75">{msg.time}</span>
                  <button
                    onClick={() => speak(msg.text)}
                    className="p-0.5 opacity-80 hover:opacity-100"
                    title="Speak Message"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input Box */}
        <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleSendVoiceNote}
            className="p-3.5 bg-pink-100 hover:bg-pink-200 text-pink-700 rounded-2xl transition-all touch-target-large shrink-0"
            title="Send Voice Note"
          >
            <Mic className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="मेंटर दीदी को संदेश लिखें या माइक दबाएं..."
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 outline-hidden"
          />

          <button
            type="submit"
            className="p-3.5 bg-womentra-gradient text-white rounded-2xl shadow-md touch-target-large shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>

      </div>

      {/* Rate Mentor Modal */}
      {isRateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl border border-purple-100 p-5 space-y-4 text-center animate-in zoom-in-95">
            <h3 className="text-base font-black text-purple-950">मेंटर समीक्षा व रेटिंग</h3>
            <p className="text-xs text-slate-600">आपकी मेंटर डॉ. अनन्या शर्मा का मार्गदर्शन कैसा रहा?</p>
            
            <div className="flex justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedRating(s)}
                  className={`text-3xl transition-transform ${s <= selectedRating ? 'scale-110' : 'opacity-30'}`}
                >
                  ⭐
                </button>
              ))}
            </div>

            <textarea
              value={ratingFeedback}
              onChange={(e) => setRatingFeedback(e.target.value)}
              placeholder="अपनी राय लिखें (वैकल्पिक)..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
              rows="3"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setIsRateModalOpen(false)}
                className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
              >
                रद्द करें
              </button>
              <button
                onClick={handleSubmitRating}
                className="flex-1 py-3 bg-womentra-gradient text-white rounded-xl text-xs font-bold shadow-md"
              >
                रेटिंग जमा करें ⭐
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Dependent Child Modal */}
      {isAddDependentOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl border border-purple-100 p-5 space-y-4 animate-in zoom-in-95">
            <h3 className="text-base font-black text-purple-950">बच्चे / आश्रित को जोड़ें</h3>
            <p className="text-xs text-slate-600">अपनी बेटी या परिवार की बहन का अलग सीखने का खाता बनाएं।</p>

            <form onSubmit={handleAddDependent} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">बच्ची का नाम</label>
                <input
                  type="text"
                  required
                  value={newDepName}
                  onChange={(e) => setNewDepName(e.target.value)}
                  placeholder="जैसे: पूजा कुमारी"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">आयु (वर्ष)</label>
                <input
                  type="number"
                  value={newDepAge}
                  onChange={(e) => setNewDepAge(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddDependentOpen(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-womentra-gradient text-white rounded-xl text-xs font-bold shadow-md"
                >
                  खाता जोड़ें 👧
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
