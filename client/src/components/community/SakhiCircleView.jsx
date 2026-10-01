import React, { useState, useEffect } from 'react';
import { 
  Users, Heart, MessageSquare, Mic, Sparkles, Volume2, 
  Send, Flag, Briefcase, Plus, X, Share2, CheckCircle2 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useVoiceNarrator } from '../../context/VoiceNarratorContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import confetti from 'canvas-confetti';

export const SakhiCircleView = () => {
  const { currentLang, t } = useLanguage();
  const { speak, narrateScreen } = useVoiceNarrator();
  const { user } = useAuth();

  const [posts, setPosts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedPostForReport, setSelectedPostForReport] = useState(null);

  // New Post Form
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [hasVoiceNote, setHasVoiceNote] = useState(true);

  useEffect(() => {
    narrateScreen("सखी संगम: यहाँ बहनें अपनी सफलता की कहानियां साझा करती हैं, और गाँव के काम व अवसर ढूंढती हैं।");
    loadPosts();
  }, [activeCategory, currentLang]);

  const loadPosts = async () => {
    try {
      const res = await api.getCommunityPosts(activeCategory);
      if (res.success) setPosts(res.posts);
    } catch (err) {
      console.warn('Error fetching community posts:', err);
    }
  };

  const handleLike = async (postId) => {
    try {
      const res = await api.likePost(postId);
      if (res.success) {
        setPosts(posts.map(p => p.id === postId ? res.post : p));
        speak("सखी की पोस्ट को आपका समर्थन मिला!");
      }
    } catch {}
  };

  const handleCreatePost = async (e) => {
    if (e) e.preventDefault();
    if (!postTitle) return;

    try {
      const res = await api.createPost({
        authorName: user?.name || 'सुनीता देवी',
        village: `${user?.village || 'रामनगर'}, ${user?.state || 'उत्तर प्रदेश'}`,
        title: postTitle,
        content: postContent || 'वॉइस संदेश साझा किया।',
        hasVoiceNote,
        category: 'success_story'
      });

      if (res.success) {
        setPosts([res.post, ...posts]);
        setIsCreateModalOpen(false);
        setPostTitle('');
        setPostContent('');
        confetti({ particleCount: 50 });
        speak("आपकी कहानी सखी संगम में साझा हो गई है!");
      }
    } catch {}
  };

  const handleReportPost = async (reason) => {
    if (!selectedPostForReport) return;
    try {
      await api.reportPost(selectedPostForReport.id, reason);
      setIsReportModalOpen(false);
      speak("धन्यवाद। हमारी सुरक्षा टीम इस पोस्ट की समीक्षा करेगी।");
    } catch {}
  };

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto px-4 pt-3">
      
      {/* Header */}
      <div className="bg-womentra-gradient rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl">
            👭
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black">
                {t('community')} (Sakhi Circle)
              </h1>
              <Sparkles className="w-5 h-5 text-amber-300 fill-amber-300" />
            </div>
            <p className="text-xs sm:text-sm text-purple-100 font-medium">
              एक-दूसरे का सहारा • प्रेरणादायक कहानियां • गाँव के नए अवसर
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-3 bg-white text-purple-900 rounded-2xl font-black text-xs shadow-md flex items-center gap-2 touch-target-large hover:bg-purple-50 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>अपनी बात बोलें (Create Post)</span>
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: 'सभी बातें', icon: '🌟' },
          { id: 'success_story', label: 'सफलता की कहानी (Success)', icon: '🏆' },
          { id: 'opportunity', label: 'रोजगार व SHG अवसर (Jobs)', icon: '💼' }
        ].map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCategory(c.id)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 touch-target-large ${
              activeCategory === c.id
                ? 'bg-purple-900 text-white shadow-md'
                : 'bg-white text-purple-950 border border-purple-100 hover:bg-purple-50'
            }`}
          >
            <span>{c.icon}</span>
            <span>{c.label}</span>
          </button>
        ))}
      </div>

      {/* Feed Posts */}
      <div className="space-y-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-3xl p-5 border border-purple-100 shadow-md space-y-3"
          >
            {/* Author */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={post.authorAvatar}
                  alt={post.authorName}
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-purple-100"
                />
                <div>
                  <h4 className="text-sm font-black text-slate-900">{post.authorName}</h4>
                  <p className="text-[11px] text-purple-700 font-semibold">{post.village}</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => speak(`${post.title}. ${post.content}`)}
                  className="p-2 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100"
                  title="Listen Post"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setSelectedPostForReport(post);
                    setIsReportModalOpen(true);
                  }}
                  className="p-2 text-slate-400 hover:text-rose-500 rounded-xl"
                  title="Report Post"
                >
                  <Flag className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Post Title & Content */}
            <div>
              <h3 className="text-base font-extrabold text-purple-950 leading-snug">
                {post.titleHi || post.title}
              </h3>
              <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                {post.content}
              </p>
            </div>

            {/* Voice Audio Note Badge */}
            {post.hasVoiceNote && (
              <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-900">
                  <Mic className="w-4 h-4 text-pink-600 animate-pulse" />
                  <span>वॉइस संदेश ({post.voiceNoteDuration || '0:35'})</span>
                </div>
                <button
                  onClick={() => speak(post.content)}
                  className="px-3 py-1 bg-womentra-gradient text-white rounded-xl text-[11px] font-bold shadow-xs"
                >
                  सुनें ▶
                </button>
              </div>
            )}

            {/* Actions (Likes, Replies) */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => handleLike(post.id)}
                className="flex items-center gap-1.5 text-xs font-bold text-pink-600 hover:bg-pink-50 px-3 py-1.5 rounded-xl transition-all"
              >
                <Heart className="w-4 h-4 fill-pink-500" />
                <span>{post.likesCount || 1} सखियों ने सराहा</span>
              </button>

              <span className="text-xs text-slate-500 font-semibold">
                {post.repliesCount || 0} उत्तर
              </span>
            </div>

          </div>
        ))}
      </div>

      {/* Create Post Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-purple-100 p-5 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-purple-950">सखी संगम में अपनी बात साझा करें</h3>
              <button onClick={() => setIsCreateModalOpen(false)}>
                <X className="w-6 h-6 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">शीर्षक (Title)</label>
                <input
                  type="text"
                  required
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="जैसे: सिलाई से पहली कमाई मिली..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">विवरण या अनुभव</label>
                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="अपनी बहनों के साथ अपना अनुभव बांटें..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  rows="3"
                />
              </div>

              <div className="p-3 bg-purple-50 rounded-xl flex items-center justify-between">
                <span className="text-xs font-bold text-purple-950">वॉइस नोट भी जोड़ें</span>
                <input
                  type="checkbox"
                  checked={hasVoiceNote}
                  onChange={(e) => setHasVoiceNote(e.target.checked)}
                  className="w-5 h-5 accent-pink-600 cursor-pointer"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-womentra-gradient text-white rounded-xl text-xs font-bold shadow-md"
                >
                  साझा करें 🌸
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Safe Moderation Report Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl border border-purple-100 p-5 space-y-4 text-center animate-in zoom-in-95">
            <h3 className="text-base font-black text-slate-900">सुरक्षा रिपोर्ट (Report Post)</h3>
            <p className="text-xs text-slate-600">इस पोस्ट में क्या समस्या है?</p>

            <div className="space-y-2 text-left">
              {[
                "अनुचित भाषा या व्यवहार",
                "गलत योजना या धोखाधड़ी की जानकारी",
                "गोपनीयता या नियमों का उल्लंघन"
              ].map((reason, idx) => (
                <button
                  key={idx}
                  onClick={() => handleReportPost(reason)}
                  className="w-full p-3 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 rounded-xl text-xs font-bold text-slate-800"
                >
                  • {reason}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsReportModalOpen(false)}
              className="w-full py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
            >
              रद्द करें
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
