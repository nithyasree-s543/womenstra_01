import React, { useState, useEffect } from 'react';
import { 
  Shield, Users, Landmark, BookOpen, Star, CheckCircle, 
  XCircle, Sparkles, Volume2, Plus, Edit3, Award 
} from 'lucide-react';
import { api } from '../../services/api';
import confetti from 'canvas-confetti';

export const AdminPanelView = () => {
  const [stats, setStats] = useState(null);
  const [pendingTutors, setPendingTutors] = useState([]);
  const [mentorRatings, setMentorRatings] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'kyc' | 'schemes' | 'mentors'

  // New Scheme Form
  const [newScheme, setNewScheme] = useState({
    id: 'free-sewing-machine',
    title: 'Free Sewing Machine Scheme (Muft Silai Machine)',
    titleHi: 'प्रधानमंत्री मुफ्त सिलाई मशीन योजना',
    tagline: 'Free automatic sewing machine for rural women tailoring',
    category: 'livelihood',
    benefitAmount: '1 Free Electric Sewing Machine + ₹1,000 tool allowance',
    officialPortal: 'https://india.gov.in'
  });
  const [schemeAddedMsg, setSchemeAddedMsg] = useState('');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const [overviewRes, kycRes, ratingsRes] = await Promise.all([
        api.getAdminOverview(),
        api.getPendingKyc(),
        api.getMentorRatings()
      ]);
      if (overviewRes.success) setStats(overviewRes.stats);
      if (kycRes.success) setPendingTutors(kycRes.pendingTutors);
      if (ratingsRes.success) setMentorRatings(ratingsRes.mentors);
    } catch (err) {
      console.warn('Admin data fetch issue:', err);
    }
  };

  const handleApproveKyc = async (mentorId, status) => {
    try {
      const res = await api.approveKyc(mentorId, status, 'DigiLocker verified by District Nodal Officer');
      if (res.success) {
        confetti({ particleCount: 50 });
        loadAdminData();
      }
    } catch {}
  };

  const handleCreateScheme = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createScheme(newScheme);

      if (res.success) {
        setSchemeAddedMsg(`✓ नई योजना "${newScheme.titleHi}" सफलतापूर्वक जोड़ी गई!`);
        confetti({ particleCount: 50 });
        loadAdminData();
      }
    } catch {}
  };

  return (
    <div className="space-y-6 pb-24 max-w-5xl mx-auto px-4 pt-3">
      
      {/* Header */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-pink-600 flex items-center justify-center text-3xl">
            🛡️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black">
                वोमंतरा प्रशासन पोर्टल (Admin Panel & CMS)
              </h1>
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">
              राष्ट्रीय महिला सशक्तीकरण निगरानी व ट्यूटर ई-केवाईसी अनुमोदन
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-4 gap-2 bg-slate-100 p-1.5 rounded-2xl text-xs font-black">
        {[
          { id: 'overview', label: 'सांख्यिकी (Metrics)' },
          { id: 'kyc', label: 'ट्यूटर e-KYC (Tutors)' },
          { id: 'schemes', label: 'योजना CMS (Schemes)' },
          { id: 'mentors', label: 'मेंटर गुणवत्ता (Audit)' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-3 rounded-xl transition-all ${
              activeTab === tab.id ? 'bg-white text-purple-950 shadow-md' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. Metrics & Overview */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "कुल नामांकित ग्रामीण बहनें", value: stats.totalWomenEnrolled.toLocaleString(), icon: "👩🏽‍🌾", color: "bg-purple-50 border-purple-200 text-purple-950" },
              { label: "स्वीकृत सरकारी सहायता", value: stats.totalSchemeGrantsSanctioned, icon: "💰", color: "bg-emerald-50 border-emerald-200 text-emerald-950" },
              { label: "जमा किए गए आवेदन", value: stats.applicationsSubmitted.toLocaleString(), icon: "📜", color: "bg-pink-50 border-pink-200 text-pink-950" },
              { label: "सत्यापित मेंटर्स", value: stats.activeMentors, icon: "👩🏽‍🏫", color: "bg-amber-50 border-amber-200 text-amber-950" }
            ].map((st, i) => (
              <div key={i} className={`p-4 rounded-3xl border ${st.color} shadow-xs`}>
                <span className="text-2xl mb-1 block">{st.icon}</span>
                <h3 className="text-xl font-black">{st.value}</h3>
                <p className="text-[11px] font-bold opacity-80 mt-1">{st.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Tutor e-KYC Approvals */}
      {activeTab === 'kyc' && (
        <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-md space-y-4">
          <h3 className="text-base font-black text-purple-950">
            ट्यूटर ई-केवाईसी सत्यापन कतार (Pending Tutor DigiLocker KYC)
          </h3>
          
          <div className="space-y-3">
            {[
              { id: "tutor-101", name: "सुमन लता वर्मा", phone: "9876500112", skill: "सिलाई व बुटीक", token: "DIGILOCKER-KYC-9821" },
              { id: "tutor-102", name: "मीराबेन ठाकोर", phone: "9876500334", skill: "जैविक कृषि व डेयरी", token: "DIGILOCKER-KYC-4412" }
            ].map((tut) => (
              <div key={tut.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-slate-900">{tut.name}</h4>
                  <p className="text-xs text-purple-700 font-semibold">{tut.skill} • {tut.phone}</p>
                  <span className="text-[10px] text-slate-500 font-mono">टोकन: {tut.token}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApproveKyc(tut.id, 'approved')}
                    className="px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                  >
                    स्वीकृत करें ✓
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Scheme CMS Database Editor */}
      {activeTab === 'schemes' && (
        <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-md space-y-4">
          <h3 className="text-base font-black text-purple-950">नई सरकारी योजना जोड़ें (Scheme Repository CMS)</h3>

          <form onSubmit={handleCreateScheme} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">योजना का नाम (हिंदी)</label>
                <input
                  type="text"
                  value={newScheme.titleHi}
                  onChange={(e) => setNewScheme({ ...newScheme, titleHi: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">लाभ विवरण (Benefit Amount)</label>
                <input
                  type="text"
                  value={newScheme.benefitAmount}
                  onChange={(e) => setNewScheme({ ...newScheme, benefitAmount: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">संक्षिप्त विवरण (Tagline)</label>
              <input
                type="text"
                value={newScheme.tagline}
                onChange={(e) => setNewScheme({ ...newScheme, tagline: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              />
            </div>

            {schemeAddedMsg && (
              <p className="text-xs font-bold text-emerald-800 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                {schemeAddedMsg}
              </p>
            )}

            <button
              type="submit"
              className="py-3 px-5 bg-womentra-gradient text-white rounded-2xl font-bold text-xs shadow-md"
            >
              योजना डेटाबेस में सहेजें (Save Scheme) +
            </button>
          </form>
        </div>
      )}

      {/* 4. Mentor Quality & Ratings Audit */}
      {activeTab === 'mentors' && (
        <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-md space-y-4">
          <h3 className="text-base font-black text-purple-950">मेंटर गुणवत्ता व स्टार रेटिंग ऑडिट</h3>
          <div className="space-y-3">
            {mentorRatings.map((m) => (
              <div key={m.id} className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-purple-950">{m.name}</h4>
                  <p className="text-xs text-slate-600">सक्रिय शिक्षार्थी: {m.activeMentees} बहनें</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-amber-600">⭐ {m.rating}</span>
                  <p className="text-[10px] text-slate-500 font-bold">{m.totalReviews} समीक्षाएं</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
