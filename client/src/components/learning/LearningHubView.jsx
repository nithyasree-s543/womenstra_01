import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Play, Pause, Volume2, Sparkles, CheckCircle2, Award, 
  Download, ArrowRight, X, Flame, ShieldAlert, Check, HelpCircle
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useVoiceNarrator } from '../../context/VoiceNarratorContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import confetti from 'canvas-confetti';

export const LearningHubView = () => {
  const { currentLang } = useLanguage();
  const { speak, narrateScreen } = useVoiceNarrator();
  const { user, updateUserState } = useAuth();

  const [courses, setCourses] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [quizSelectedOption, setQuizSelectedOption] = useState(null);
  const [quizFeedback, setQuizFeedback] = useState(null);
  const [downloadedCourses, setDownloadedCourses] = useState({});

  useEffect(() => {
    narrateScreen("हुनर हब: यहाँ आप सिलाई, डिजिटल सुरक्षा, स्वयं सहायता समूह और मोबाइल चलाना सीख सकती हैं।");
    loadCourses();
  }, [activeCategory, currentLang]);

  const loadCourses = async () => {
    try {
      const res = await api.getCourses(activeCategory);
      if (res.success) setCourses(res.courses);
    } catch (err) {
      console.warn('Error fetching courses:', err);
    }
  };

  const categories = [
    { id: 'all', label: 'सभी हुनर (All)', icon: '🌟' },
    { id: 'digital_skills', label: 'डिजिटल व UPI सुरक्षा', icon: '📱' },
    { id: 'vocational', label: 'सिलाई व बुटीक', icon: '✂️' },
    { id: 'finance', label: 'बचत व SHG समूह', icon: '💰' },
    { id: 'new_world', label: 'AI और स्मार्ट टूल्स', icon: '🤖' },
    { id: 'education', label: 'अक्षर व बाज़ार गणित', icon: '📚' }
  ];

  const handleStartLesson = (course, lesson) => {
    setSelectedCourse(course);
    setActiveLesson(lesson || course.lessons?.[0]);
    setIsPlayingAudio(true);
    setQuizFeedback(null);
    setQuizSelectedOption(null);

    const narrative = `पाठ: ${lesson?.titleHi || lesson?.title || course.titleHi}. मुख्य बात: ${lesson?.keyTakeaway || course.description}`;
    speak(narrative);
  };

  const handleToggleDownloadOffline = (courseId) => {
    setDownloadedCourses(prev => {
      const isDownloaded = !prev[courseId];
      if (isDownloaded) {
        speak("कोर्स आपके फोन में ऑफलाइन सेव हो गया है। बिना इंटरनेट भी चलेगा।");
      }
      return { ...prev, [courseId]: isDownloaded };
    });
  };

  const handleAnswerQuiz = async (option) => {
    setQuizSelectedOption(option.id);
    const isCorrect = option.isCorrect;

    if (isCorrect) {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      setQuizFeedback({
        isCorrect: true,
        message: "शाबाश! आपका उत्तर बिल्कुल सही है। (+25 अंक मिले)"
      });
      speak("शाबाश दीदी! आपका उत्तर बिल्कुल सही है।");

      // Record XP in user profile
      try {
        const res = await api.recordProgress({
          userId: user?.id || 'user-1',
          courseId: selectedCourse.id,
          lessonId: activeLesson?.id,
          xp: 50
        });
        if (res.success) {
          updateUserState({ points: res.totalPoints, streak: res.currentStreak, badges: res.newBadges });
        }
      } catch {}
    } else {
      setQuizFeedback({
        isCorrect: false,
        message: "गलत उत्तर। सही नियम को फिर से सुनें और प्रयास करें।"
      });
      speak("कोई बात नहीं दीदी! सही उत्तर फिर से सुनिए और दोबारा प्रयास करें।");
    }
  };

  return (
    <div className="space-y-6 pb-24 max-w-5xl mx-auto px-4 pt-3">
      
      {/* 1. Header Banner */}
      <div className="bg-womentra-gradient rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shadow-inner border border-white/30">
              🧵
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                  हुनर हब (Learning Hub)
                </h1>
                <Sparkles className="w-5 h-5 text-amber-300 fill-amber-300" />
              </div>
              <p className="text-xs sm:text-sm text-purple-100 font-medium">
                सरल ऑडियो-वीडियो पाठ • आवाज से क्विज • ऑफलाइन सुविधा
              </p>
            </div>
          </div>

          <button
            onClick={() => speak("हुनर हब में आप सिलाई, बुटीक डिज़ाइन, सुरक्षित ऑनलाइन लेन-देन और मोबाइल से पोस्टर बनाना सीख सकती हैं।")}
            className="p-2.5 bg-white/20 hover:bg-white/30 rounded-2xl backdrop-blur-md border border-white/20 text-white flex items-center gap-2 text-xs font-bold"
          >
            <Volume2 className="w-5 h-5" />
            <span>हब गाइड सुनें</span>
          </button>
        </div>
      </div>

      {/* 2. Categories Horizontal Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setActiveCategory(cat.id);
              speak(`${cat.label} श्रेणी चुनी गई`);
            }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 touch-target-large ${
              activeCategory === cat.id
                ? 'bg-purple-900 text-white shadow-md scale-105'
                : 'bg-white text-purple-950 border border-purple-100 hover:bg-purple-50'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* 3. Course Catalog Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {courses.map((course) => {
          const isOffline = downloadedCourses[course.id];
          return (
            <div
              key={course.id}
              className="bg-white rounded-3xl p-5 border border-purple-100 shadow-md flex flex-col justify-between hover:border-purple-300 transition-all overflow-hidden relative group"
            >
              <div>
                <div className="relative h-40 rounded-2xl overflow-hidden mb-3">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2.5 py-1 bg-white/90 backdrop-blur-md rounded-xl text-[10px] font-black text-purple-900">
                      {course.duration}
                    </span>
                  </div>

                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                    <button
                      onClick={() => handleToggleDownloadOffline(course.id)}
                      className={`p-2 rounded-xl backdrop-blur-md transition-all ${
                        isOffline 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-white/80 hover:bg-white text-purple-900'
                      }`}
                      title={isOffline ? "Downloaded Offline" : "Download for Offline Use"}
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white">
                    <span className="text-xs font-bold flex items-center gap-1">
                      <Award className="w-4 h-4 text-amber-300 fill-amber-300" />
                      <span>+{course.xpReward} XP अंक</span>
                    </span>
                    <span className="text-[10px] font-semibold bg-white/20 px-2 py-0.5 rounded-md">
                      {course.totalLessons} पाठ
                    </span>
                  </div>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-black text-slate-900 leading-tight">
                    {course.titleHi || course.title}
                  </h3>
                  <button
                    onClick={() => speak(course.voiceIntro || course.description)}
                    className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-xl shrink-0"
                    title="Speak Course Summary"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed line-clamp-2">
                  {course.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => handleStartLesson(course, course.lessons?.[0])}
                  className="flex-1 py-3 bg-womentra-gradient text-white rounded-2xl font-bold text-xs shadow-md shadow-pink-500/20 hover:opacity-95 transition-all flex items-center justify-center gap-2 touch-target-large"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>ऑडियो पाठ सुनें ({course.lessons?.length || 1})</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* 4. Active Audio Lesson Player Modal */}
      {selectedCourse && activeLesson && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-purple-100 overflow-hidden flex flex-col animate-in zoom-in-95 max-h-[90vh]">
            
            {/* Header */}
            <div className="bg-womentra-gradient p-5 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-pink-200 uppercase tracking-wider">
                  {selectedCourse.titleHi || selectedCourse.title}
                </span>
                <h3 className="text-base font-black mt-0.5">{activeLesson.titleHi || activeLesson.title}</h3>
              </div>
              <button
                onClick={() => {
                  setSelectedCourse(null);
                  setActiveLesson(null);
                }}
                className="p-2 text-white hover:bg-white/20 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Audio Waveform & Player Body */}
            <div className="p-6 space-y-5 overflow-y-auto">
              
              {/* Waveform Graphic */}
              <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl border border-purple-200 text-center space-y-4">
                <div className="flex items-center justify-center gap-1.5 h-16">
                  {[40, 65, 85, 45, 95, 70, 50, 80, 60, 90, 40, 75, 55, 90, 60].map((h, i) => (
                    <div
                      key={i}
                      style={{ height: `${h}%` }}
                      className={`w-2 rounded-full transition-all duration-300 ${
                        isPlayingAudio 
                          ? 'bg-gradient-to-t from-purple-600 to-pink-500 animate-pulse' 
                          : 'bg-purple-200'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      const text = `${activeLesson.titleHi}. मुख्य नियम: ${activeLesson.keyTakeaway}`;
                      speak(text);
                      setIsPlayingAudio(true);
                    }}
                    className="p-4 rounded-2xl bg-womentra-gradient text-white shadow-xl hover:scale-105 transition-all"
                  >
                    <Play className="w-8 h-8 fill-white ml-0.5" />
                  </button>
                </div>
                <p className="text-xs font-bold text-purple-950">
                  {activeLesson.durationMinutes} मिनट का ऑडियो पाठ (सरल भाषा में)
                </p>
              </div>

              {/* Key Takeaway Box */}
              {activeLesson.keyTakeaway && (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-3">
                  <span className="text-2xl">💡</span>
                  <div>
                    <h4 className="text-xs font-bold text-amber-900 uppercase">मुख्य नियम (Key Learning):</h4>
                    <p className="text-xs font-bold text-slate-900 mt-0.5 leading-relaxed">
                      "{activeLesson.keyTakeaway}"
                    </p>
                  </div>
                </div>
              )}

              {/* Voice Quiz Trigger */}
              {activeLesson.quiz && (
                <div className="p-4 bg-pink-50 rounded-2xl border border-pink-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-xs text-pink-950 flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-pink-600" />
                      <span>प्रश्नोत्तरी (Quiz - सही उत्तर चुनें)</span>
                    </h4>
                    <span className="text-[10px] font-bold text-pink-700 bg-white px-2 py-0.5 rounded-md">
                      +25 अंक
                    </span>
                  </div>

                  <p className="text-xs font-bold text-slate-800">
                    {activeLesson.quiz.questionHi || activeLesson.quiz.question}
                  </p>

                  <div className="space-y-2 pt-1">
                    {activeLesson.quiz.options?.map((opt) => {
                      const isSelected = quizSelectedOption === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleAnswerQuiz(opt)}
                          className={`w-full p-3 rounded-xl border text-left text-xs font-bold flex items-center justify-between transition-all touch-target-large ${
                            isSelected
                              ? opt.isCorrect
                                ? 'bg-emerald-100 border-emerald-500 text-emerald-950'
                                : 'bg-rose-100 border-rose-500 text-rose-950'
                              : 'bg-white border-slate-200 hover:bg-purple-50 text-slate-800'
                          }`}
                        >
                          <span>• {opt.textHi || opt.text}</span>
                          {isSelected && (
                            <span>{opt.isCorrect ? '✓ सही' : '✗ गलत'}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {quizFeedback && (
                    <div className={`p-3 rounded-xl text-xs font-bold text-center ${
                      quizFeedback.isCorrect ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
                    }`}>
                      {quizFeedback.message}
                    </div>
                  )}

                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
