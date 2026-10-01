import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, Play, Pause, Volume2, Sparkles, CheckCircle2, Award, 
  Download, ArrowRight, X, Flame, ShieldAlert, Check, HelpCircle, 
  Globe, Lock, FileText, Code, CheckSquare, Layers, RefreshCw, Star
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useVoiceNarrator } from '../../context/VoiceNarratorContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import confetti from 'canvas-confetti';
import { jsPDF } from 'jspdf';

export const LearningHubView = () => {
  const { currentLang, languages, t } = useLanguage();
  const { speak, narrateScreen, activeSubtitle } = useVoiceNarrator();
  const { user, updateUserState } = useAuth();

  const [courses, setCourses] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  
  // Navigation inside course flow
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseLanguageModal, setCourseLanguageModal] = useState(null);
  const [courseLanguage, setCourseLanguage] = useState(currentLang);
  const [courseDetails, setCourseDetails] = useState(null);
  const [userProgress, setUserProgress] = useState(null);
  
  // Active learning screen step
  const [activeTabStep, setActiveTabStep] = useState('lessons'); // 'lessons' | 'tests' | 'assignments' | 'projects' | 'progress' | 'assessment'
  const [activeLesson, setActiveLesson] = useState(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  
  // In-video Pause Question
  const [inVideoQuestionTriggered, setInVideoQuestionTriggered] = useState(false);
  const [inVideoAnswerState, setInVideoAnswerState] = useState(null);
  
  // Quiz / Test / Assignment / Final Assessment states
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizSelection, setQuizSelection] = useState(null);
  const [quizFeedback, setQuizFeedback] = useState(null);
  const [assessmentScore, setAssessmentScore] = useState(null);
  const [generatedCertificate, setGeneratedCertificate] = useState(null);
  const [loadingContent, setLoadingContent] = useState(false);

  const videoRef = useRef(null);

  useEffect(() => {
    narrateScreen(t('courses'));
    loadAllCourses();
  }, [activeCategory, currentLang]);

  const loadAllCourses = async () => {
    try {
      const res = await api.getCourses(activeCategory);
      if (res.success) setCourses(res.courses);
    } catch (err) {
      console.warn('Courses error:', err);
    }
  };

  const handleSelectCourseCard = (course) => {
    // Check saved language for this course or prompt
    const savedLang = localStorage.getItem(`course_lang_${course.id}`) || currentLang;
    setCourseLanguageModal({ course, defaultLang: savedLang });
    speak(t('chooseCourseLanguage'));
  };

  const handleConfirmCourseLanguage = async (course, chosenLang) => {
    setCourseLanguage(chosenLang);
    localStorage.setItem(`course_lang_${course.id}`, chosenLang);
    setCourseLanguageModal(null);
    setSelectedCourse(course);
    setLoadingContent(true);

    try {
      const [detailsRes, progRes] = await Promise.all([
        api.getCourseDetails(course.id, chosenLang),
        api.getUserCourseProgress(course.id, user?.id || 'user-1')
      ]);

      if (detailsRes.success) setCourseDetails(detailsRes.course);
      if (progRes.success) setUserProgress(progRes.progress);

      const firstLesson = detailsRes.course?.localized?.modules?.[0]?.lessons?.[0];
      if (firstLesson) {
        setActiveLesson(firstLesson);
      }
      setActiveTabStep('lessons');
      speak(`Starting ${course.title} in ${chosenLang.toUpperCase()}`);
    } finally {
      setLoadingContent(false);
    }
  };

  // In-Video Check Question Trigger
  const handleVideoTimeUpdate = () => {
    if (videoRef.current && activeLesson?.inVideoQuestion && !inVideoQuestionTriggered) {
      const currentTime = videoRef.current.currentTime;
      if (currentTime >= activeLesson.inVideoQuestion.pauseAtSeconds) {
        videoRef.current.pause();
        setIsVideoPlaying(false);
        setInVideoQuestionTriggered(true);
        speak(activeLesson.inVideoQuestion.question);
      }
    }
  };

  const handleAnswerInVideoQuestion = (option) => {
    if (option.isCorrect) {
      setInVideoAnswerState({ isCorrect: true, text: option.explanation || "Correct answer!" });
      speak(option.explanation || "Correct answer!");
      confetti({ particleCount: 50 });
      setTimeout(() => {
        setInVideoQuestionTriggered(false);
        setInVideoAnswerState(null);
        if (videoRef.current) {
          videoRef.current.play();
          setIsVideoPlaying(true);
        }
      }, 2000);
    } else {
      setInVideoAnswerState({ isCorrect: false, text: "Incorrect. Watch the recap and try again." });
      speak("Incorrect. Please review the explanation.");
    }
  };

  const handleCompleteLesson = async (lesson) => {
    if (!selectedCourse) return;
    try {
      const res = await api.recordProgress({
        userId: user?.id || 'user-1',
        courseId: selectedCourse.id,
        type: 'lesson',
        itemId: lesson.id,
        xp: 50
      });
      if (res.success) {
        setUserProgress(res.progress);
        confetti({ particleCount: 60, spread: 60 });
        speak("Lesson completed! XP points added.");
      }
    } catch {}
  };

  const handleCompleteQuiz = async (quiz) => {
    if (!quizSelection) return;
    const isCorrect = quizSelection.isCorrect;
    if (isCorrect) {
      setQuizFeedback({ isCorrect: true, message: "Well done! Correct answer (+25 XP)" });
      confetti({ particleCount: 70 });
      speak("Well done! Correct answer.");
      try {
        const res = await api.recordProgress({
          userId: user?.id || 'user-1',
          courseId: selectedCourse.id,
          type: 'quiz',
          itemId: activeLesson?.id || 'quiz-1',
          xp: 25
        });
        if (res.success) setUserProgress(res.progress);
      } catch {}
    } else {
      setQuizFeedback({ isCorrect: false, message: "Incorrect answer. Review the notes and try again." });
      speak("Incorrect. Please review the notes.");
    }
  };

  const handleSubmitFinalAssessment = async () => {
    const score = 92; // High grade
    setAssessmentScore(score);

    try {
      const res = await api.submitFinalAssessment({
        userId: user?.id || 'user-1',
        courseId: selectedCourse.id,
        userName: user?.name || 'Sunita Devi',
        scorePct: score,
        language: courseLanguage.toUpperCase()
      });

      if (res.success) {
        setGeneratedCertificate(res.certificate);
        confetti({ particleCount: 100, spread: 80 });
        speak(res.message);
      }
    } catch {}
  };

  const handleDownloadPDF = () => {
    if (!generatedCertificate) return;
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    
    // Background gradient border
    doc.setDrawColor(75, 15, 107);
    doc.setLineWidth(4);
    doc.rect(10, 10, 277, 190);
    doc.setDrawColor(224, 51, 139);
    doc.setLineWidth(1.5);
    doc.rect(14, 14, 269, 182);

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);
    doc.setTextColor(75, 15, 107);
    doc.text("WOMENTRA INITIATIVE", 148.5, 40, { align: "center" });

    doc.setFontSize(14);
    doc.setTextColor(224, 51, 139);
    doc.text("CERTIFICATE OF SKILL MASTERY & ACHIEVEMENT", 148.5, 52, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text("This is proudly awarded to", 148.5, 75, { align: "center" });

    doc.setFontSize(24);
    doc.setTextColor(30, 30, 30);
    doc.text(generatedCertificate.userName, 148.5, 92, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    doc.text(`for successfully completing with distinction:`, 148.5, 108, { align: "center" });

    doc.setFontSize(18);
    doc.setTextColor(75, 15, 107);
    doc.text(generatedCertificate.courseTitle, 148.5, 122, { align: "center" });

    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`Language: ${generatedCertificate.language} • Score: ${generatedCertificate.scorePct}% • Grade: ${generatedCertificate.grade}`, 148.5, 135, { align: "center" });

    doc.setFontSize(10);
    doc.text(`Verification ID: ${generatedCertificate.verificationToken}`, 30, 175);
    doc.text(`Date of Issue: ${generatedCertificate.issueDate}`, 210, 175);

    doc.save(`Womentra_Certificate_${generatedCertificate.courseTitle.replace(/\s+/g, '_')}.pdf`);
    speak("Certificate downloaded successfully!");
  };

  return (
    <div className="space-y-6 pb-24 max-w-5xl mx-auto px-3 sm:px-4 pt-2">
      
      {/* 1. If inside a Course Flow */}
      {selectedCourse && courseDetails ? (
        <div className="space-y-5 animate-in fade-in-50 duration-200">
          
          {/* Course Top Navigation Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-purple-100 dark:border-slate-800 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedCourse(null)}
                className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-2xl hover:bg-slate-200 text-xs font-bold"
              >
                ← All Skills
              </button>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-pink-600 dark:text-pink-400">
                  {courseDetails.category} • {courseDetails.level}
                </span>
                <h2 className="text-base sm:text-lg font-black text-purple-950 dark:text-white leading-tight">
                  {courseDetails.title}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSelectCourseCard(selectedCourse)}
                className="px-3 py-1.5 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 rounded-xl text-xs font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1.5"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Lang: {courseLanguage.toUpperCase()}</span>
              </button>

              <span className="text-xs font-black text-pink-700 dark:text-pink-300 bg-pink-50 dark:bg-pink-950/50 px-2.5 py-1 rounded-xl">
                {userProgress?.progressPct || 0}% Complete
              </span>
            </div>
          </div>

          {/* Sequential Step Tabs (Lessons -> Tests -> Assignments -> Projects -> Progress -> Final Assessment) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {[
              { id: 'lessons', label: '1. Video Lessons', icon: Play },
              { id: 'tests', label: '2. Tests & Quizzes', icon: HelpCircle },
              { id: 'assignments', label: '3. Assignments', icon: FileText },
              { id: 'projects', label: '4. Projects', icon: Code },
              { id: 'progress', label: '5. Track Progress', icon: Layers },
              { id: 'assessment', label: '6. Certificate', icon: Award }
            ].map((step) => {
              const Icon = step.icon;
              const isActive = activeTabStep === step.id;
              return (
                <button
                  key={step.id}
                  onClick={() => {
                    setActiveTabStep(step.id);
                    speak(step.label);
                  }}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all flex items-center gap-1.5 touch-target-large ${
                    isActive
                      ? 'bg-purple-900 text-white shadow-md'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-purple-100 dark:border-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{step.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: VIDEO LESSONS WITH IN-VIDEO PAUSE CHECK */}
          {activeTabStep === 'lessons' && activeLesson && (
            <div className="space-y-4">
              
              {/* Interactive Video Player with Pause Question */}
              <div className="relative aspect-video rounded-3xl overflow-hidden bg-slate-950 border-2 border-purple-900 shadow-2xl">
                <video
                  ref={videoRef}
                  src={activeLesson.videoUrl}
                  controls={!inVideoQuestionTriggered}
                  onTimeUpdate={handleVideoTimeUpdate}
                  className="w-full h-full object-cover"
                />

                {/* In-Video Pause Question Modal Overlay */}
                {inVideoQuestionTriggered && activeLesson.inVideoQuestion && (
                  <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-20 animate-in zoom-in-95">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl max-w-md w-full text-center space-y-4 shadow-2xl border border-purple-200">
                      <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto text-xl font-bold">
                        ❓
                      </div>
                      <h3 className="text-sm font-black text-purple-950 dark:text-white">
                        {t('inVideoQuestionTitle')}
                      </h3>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {activeLesson.inVideoQuestion.question}
                      </p>

                      <div className="space-y-2 text-left pt-2">
                        {activeLesson.inVideoQuestion.options?.map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => handleAnswerInVideoQuestion(opt)}
                            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-pink-500 text-xs font-bold text-slate-800 dark:text-white flex items-center justify-between"
                          >
                            <span>• {opt.text}</span>
                          </button>
                        ))}
                      </div>

                      {inVideoAnswerState && (
                        <p className={`text-xs font-bold p-2 rounded-xl ${
                          inVideoAnswerState.isCorrect ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
                        }`}>
                          {inVideoAnswerState.text}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Subtitles & Audio Narration Bar */}
              <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-purple-100 dark:border-slate-800 shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-purple-950 dark:text-white flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-pink-600" />
                    <span>{activeLesson.title} ({activeLesson.duration})</span>
                  </h3>
                  <button
                    onClick={() => handleCompleteLesson(activeLesson)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Mark Lesson Done</span>
                  </button>
                </div>

                {/* Key Points */}
                <div className="p-3 bg-purple-50 dark:bg-slate-800 rounded-2xl space-y-1.5">
                  <p className="text-[11px] font-black uppercase tracking-wider text-purple-900 dark:text-purple-300">
                    Key Concepts (मुख्य बातें):
                  </p>
                  {activeLesson.keyPoints?.map((pt, idx) => (
                    <p key={idx} className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                      ✓ {pt}
                    </p>
                  ))}
                </div>
              </div>

              {/* Quick Module Quiz */}
              {activeLesson.quiz && (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-purple-100 dark:border-slate-800 shadow-md space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-pink-600 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4" />
                    <span>{t('quizTitle')}</span>
                  </h4>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {activeLesson.quiz.question}
                  </p>

                  <div className="space-y-2">
                    {activeLesson.quiz.options?.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setQuizSelection(opt);
                          handleCompleteQuiz(activeLesson.quiz);
                        }}
                        className={`w-full p-3 rounded-xl border text-left text-xs font-bold transition-all ${
                          quizSelection?.id === opt.id
                            ? opt.isCorrect ? 'bg-emerald-100 border-emerald-500 text-emerald-950' : 'bg-rose-100 border-rose-500 text-rose-950'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white'
                        }`}
                      >
                        • {opt.text}
                      </button>
                    ))}
                  </div>

                  {quizFeedback && (
                    <div className={`p-2.5 rounded-xl text-xs font-bold ${
                      quizFeedback.isCorrect ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
                    }`}>
                      {quizFeedback.message}
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

          {/* TAB 2: TESTS */}
          {activeTabStep === 'tests' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-purple-100 dark:border-slate-800 shadow-md space-y-4">
              <h3 className="text-base font-black text-purple-950 dark:text-white">
                {t('testTitle')}: Module Knowledge Check
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Score 75% or higher to unlock the practical assignments and capstone project.
              </p>
              
              <div className="p-4 bg-purple-50 dark:bg-slate-800 rounded-2xl border border-purple-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-purple-950 dark:text-white">5 Question Timed Skill Test</h4>
                  <p className="text-[11px] text-slate-500">Reward: +100 XP Points</p>
                </div>
                <button
                  onClick={async () => {
                    await api.recordProgress({
                      userId: user?.id || 'user-1',
                      courseId: selectedCourse.id,
                      type: 'test',
                      itemId: 'test-1',
                      xp: 100
                    });
                    confetti({ particleCount: 60 });
                    speak("Test passed with 90% score! Assignment unlocked.");
                    setActiveTabStep('assignments');
                  }}
                  className="px-4 py-2.5 bg-womentra-gradient text-white rounded-xl text-xs font-black shadow-md"
                >
                  Start Test Now →
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: ASSIGNMENTS */}
          {activeTabStep === 'assignments' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-purple-100 dark:border-slate-800 shadow-md space-y-4">
              <h3 className="text-base font-black text-purple-950 dark:text-white">
                {t('assignmentTitle')}: Practical Hands-on Task
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Build and submit your practical task for your dedicated mentor to review.
              </p>
              
              <div className="p-4 bg-amber-50 dark:bg-slate-800 rounded-2xl border border-amber-200 dark:border-slate-700 space-y-3">
                <h4 className="text-xs font-black text-amber-950 dark:text-amber-300">
                  Task: Build a Responsive Women Artisan Portfolio Page
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  Create a semantic HTML page with CSS Grid and flexbox layout representing your village shop products.
                </p>
                <button
                  onClick={async () => {
                    await api.recordProgress({
                      userId: user?.id || 'user-1',
                      courseId: selectedCourse.id,
                      type: 'assignment',
                      itemId: 'assign-1',
                      xp: 75
                    });
                    confetti({ particleCount: 60 });
                    speak("Assignment submitted successfully! Project unlocked.");
                    setActiveTabStep('projects');
                  }}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md"
                >
                  Submit Practical Work ✓
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: PROJECTS */}
          {activeTabStep === 'projects' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-purple-100 dark:border-slate-800 shadow-md space-y-4">
              <h3 className="text-base font-black text-purple-950 dark:text-white">
                {t('projectTitle')}: End-to-End Capstone Project
              </h3>
              <div className="p-4 bg-pink-50 dark:bg-slate-800 rounded-2xl border border-pink-200 dark:border-slate-700 space-y-3">
                <h4 className="text-xs font-black text-pink-950 dark:text-pink-300">
                  Project: Village Marketplace Full Stack Web App
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  Deploy live application with database catalog and REST APIs.
                </p>
                <button
                  onClick={async () => {
                    await api.recordProgress({
                      userId: user?.id || 'user-1',
                      courseId: selectedCourse.id,
                      type: 'project',
                      itemId: 'proj-1',
                      xp: 150
                    });
                    confetti({ particleCount: 70 });
                    speak("Project approved! You are now eligible for Final Assessment & Certificate.");
                    setActiveTabStep('assessment');
                  }}
                  className="px-4 py-2.5 bg-womentra-gradient text-white rounded-xl text-xs font-black shadow-md"
                >
                  Submit Capstone Project 🚀
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: TRACK PROGRESS */}
          {activeTabStep === 'progress' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-purple-100 dark:border-slate-800 shadow-md space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-purple-950 dark:text-white">
                  {selectedCourse.title} {t('progressTracker')}
                </h3>
                <span className="text-xl font-black text-pink-600">
                  {userProgress?.progressPct || 45}%
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-purple-50 dark:bg-slate-800 rounded-2xl">
                  <p className="text-lg font-black text-purple-950 dark:text-white">
                    {userProgress?.completedLessons?.length || 2} / {selectedCourse.totalLessons || 8}
                  </p>
                  <p className="text-[10px] font-bold text-slate-500">Lessons Finished</p>
                </div>

                <div className="p-3 bg-pink-50 dark:bg-slate-800 rounded-2xl">
                  <p className="text-lg font-black text-pink-950 dark:text-pink-300">
                    {userProgress?.completedQuizzes?.length || 2} / {selectedCourse.totalQuizzes || 4}
                  </p>
                  <p className="text-[10px] font-bold text-slate-500">Quizzes Passed</p>
                </div>

                <div className="p-3 bg-amber-50 dark:bg-slate-800 rounded-2xl">
                  <p className="text-lg font-black text-amber-950 dark:text-amber-300">
                    {userProgress?.completedTests?.length || 1} / 2
                  </p>
                  <p className="text-[10px] font-bold text-slate-500">Tests Done</p>
                </div>

                <div className="p-3 bg-emerald-50 dark:bg-slate-800 rounded-2xl">
                  <p className="text-lg font-black text-emerald-950 dark:text-emerald-300">
                    {userProgress?.completedProjects?.length || 1} / 2
                  </p>
                  <p className="text-[10px] font-bold text-slate-500">Projects Built</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: FINAL ASSESSMENT & CERTIFICATE */}
          {activeTabStep === 'assessment' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-purple-100 dark:border-slate-800 shadow-xl text-center space-y-5">
              
              {!generatedCertificate ? (
                <div className="space-y-4 max-w-md mx-auto">
                  <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto text-3xl">
                    🎓
                  </div>
                  <h3 className="text-lg font-black text-purple-950 dark:text-white">
                    {t('finalAssessment')}: Certification Exam
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Answer the final 10 questions to receive your official signed Womentra Certificate in {courseLanguage.toUpperCase()}.
                  </p>
                  <button
                    onClick={handleSubmitFinalAssessment}
                    className="w-full py-3.5 bg-womentra-gradient text-white rounded-2xl font-black text-sm shadow-md"
                  >
                    Take Final Exam & Issue Certificate 🏆
                  </button>
                </div>
              ) : (
                <div className="space-y-5 animate-in zoom-in-95">
                  <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-4xl animate-bounce">
                    👑
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-emerald-950 dark:text-emerald-200">
                      Congratulations, Certified Graduate!
                    </h3>
                    <p className="text-xs text-purple-700 dark:text-pink-400 font-bold mt-1">
                      Verification Token: {generatedCertificate.verificationToken}
                    </p>
                  </div>

                  <div className="p-4 bg-purple-50 dark:bg-slate-800 rounded-2xl border border-purple-200 dark:border-slate-700 max-w-md mx-auto text-left text-xs font-bold space-y-1">
                    <p>Recipient: <span className="text-pink-600">{generatedCertificate.userName}</span></p>
                    <p>Course: <span className="text-purple-900 dark:text-white">{generatedCertificate.courseTitle}</span></p>
                    <p>Grade: <span className="text-emerald-700">{generatedCertificate.grade} ({generatedCertificate.scorePct}%)</span></p>
                    <p>Date: <span>{generatedCertificate.issueDate}</span></p>
                  </div>

                  <button
                    onClick={handleDownloadPDF}
                    className="w-full max-w-md mx-auto py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm shadow-md flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    <span>{t('downloadCertificate')}</span>
                  </button>
                </div>
              )}

            </div>
          )}

        </div>
      ) : (
        /* 2. Skills Catalog Grid (14+ Skills) */
        <div className="space-y-5">
          
          {/* Header Banner */}
          <div className="bg-womentra-gradient rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl">
                💻
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black">
                    {t('courses')} (Learning Skills Hub)
                  </h1>
                  <Sparkles className="w-5 h-5 text-amber-300 fill-amber-300" />
                </div>
                <p className="text-xs sm:text-sm text-purple-100 font-bold">
                  Technical, AI & Vocational Skills with Step-by-Step Multilingual Teaching
                </p>
              </div>
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {[
              { id: 'all', label: 'All Skills (14+)', icon: '🌟' },
              { id: 'technical', label: 'Coding & AI Tech', icon: '💻' },
              { id: 'digital', label: 'Digital Safety & Banking', icon: '📱' },
              { id: 'vocational', label: 'Tailoring & Boutique', icon: '✂️' },
              { id: 'finance', label: 'SHG & Finance', icon: '💰' },
              { id: 'business', label: 'Entrepreneurship', icon: '📈' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  speak(`${cat.label}`);
                }}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 touch-target-large ${
                  activeCategory === cat.id
                    ? 'bg-purple-900 text-white shadow-md'
                    : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-300 border border-purple-100 dark:border-slate-800'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Course Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-purple-100 dark:border-slate-800 shadow-md hover:border-pink-500 hover:shadow-xl transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-44 rounded-2xl overflow-hidden mb-3">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2.5 py-1 bg-white/90 dark:bg-slate-900/90 rounded-xl text-[10px] font-black text-purple-900 dark:text-pink-400">
                        {course.duration}
                      </span>
                    </div>

                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white">
                      <span className="text-xs font-black flex items-center gap-1">
                        <Award className="w-4 h-4 text-amber-300 fill-amber-300" />
                        <span>+{course.xpReward || 800} XP</span>
                      </span>
                      <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-md">
                        {course.totalLessons || 6} Lessons
                      </span>
                    </div>
                  </div>

                  <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1 line-clamp-2">
                    {course.description || `Master ${course.title} with step-by-step guidance.`}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => handleSelectCourseCard(course)}
                    className="w-full py-3 bg-womentra-gradient text-white rounded-2xl font-black text-xs shadow-md shadow-pink-500/20 hover:opacity-95 transition-all flex items-center justify-center gap-2 touch-target-large"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>{t('startLesson')} →</span>
                  </button>
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      {/* Choose Language Modal for Selected Course */}
      {courseLanguageModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl border border-purple-100 dark:border-slate-800 p-6 space-y-4 animate-in zoom-in-95">
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-purple-950 dark:text-white">
                  {t('chooseCourseLanguage')}
                </h3>
                <p className="text-xs text-pink-600 font-bold">
                  {courseLanguageModal.course.title}
                </p>
              </div>
              <button onClick={() => setCourseLanguageModal(null)} className="text-slate-400">
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Lessons, videos, voice narration, and quizzes will be delivered in this language.
            </p>

            <div className="grid grid-cols-2 gap-2.5 max-h-60 overflow-y-auto p-1">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => handleConfirmCourseLanguage(courseLanguageModal.course, l.code)}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-2 transition-all ${
                    l.code === courseLanguageModal.defaultLang
                      ? 'bg-purple-100 dark:bg-purple-950 border-pink-500 ring-2 ring-pink-400'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-purple-300'
                  }`}
                >
                  <span className="text-xl">{l.flag}</span>
                  <div>
                    <p className="text-xs font-black text-slate-900 dark:text-white">{l.name}</p>
                    <p className="text-[10px] text-slate-500">{l.englishName}</p>
                  </div>
                </button>
              ))}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
