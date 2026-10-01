import React, { useState, useEffect } from 'react';
import { 
  Landmark, Baby, GraduationCap, Flame, BadgeIndianRupee, Sparkles, 
  MapPin, CheckCircle, FileText, Phone, Volume2, Search, ArrowRight, 
  Check, X, Clock, ExternalLink
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useLanguage } from '../../context/LanguageContext';
import { useVoiceNarrator } from '../../context/VoiceNarratorContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import confetti from 'canvas-confetti';

// Fix Leaflet icon issue with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export const SarkariSaathiView = () => {
  const { currentLang, t } = useLanguage();
  const { speak, narrateScreen } = useVoiceNarrator();
  const { user } = useAuth();

  const [schemes, setSchemes] = useState([]);
  const [cscCenters, setCscCenters] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [eligibilityModalScheme, setEligibilityModalScheme] = useState(null);
  const [eligibilityResult, setEligibilityResult] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [applySuccessApp, setApplySuccessApp] = useState(null);

  // Form for Eligibility
  const [eligibilityForm, setEligibilityForm] = useState({
    age: '26',
    gender: 'female',
    isPregnant: true,
    isShgMember: true
  });

  useEffect(() => {
    narrateScreen("सरकारी साथी मॉड्यूल: यहाँ आप सरकारी योजनाओं की पात्रता जांच सकती हैं और नजदीकी जन सेवा केंद्र देख सकती हैं।");
    loadData();
  }, [activeCategory, currentLang]);

  const loadData = async () => {
    try {
      const [schRes, cscRes, appRes] = await Promise.all([
        api.getSchemes(activeCategory, searchQuery),
        api.getCSCCenters(),
        api.getMyApplications(user?.id)
      ]);
      if (schRes.success) setSchemes(schRes.schemes);
      if (cscRes.success) setCscCenters(cscRes.centers);
      if (appRes.success) setMyApplications(appRes.applications);
    } catch (err) {
      console.warn('Error loading schemes data:', err);
    }
  };

  const categories = [
    { id: 'all', label: 'सभी योजनाएं', icon: '🌟' },
    { id: 'maternal_health', label: 'मातृ वंदना (माता)', icon: '🤰' },
    { id: 'girl_child', label: 'सुकन्या (बेटी)', icon: '👧' },
    { id: 'livelihood', label: 'लखपति दीदी (SHG)', icon: '✨' },
    { id: 'business_loan', label: 'मुद्रा लोन (दुकान/सिलाई)', icon: '💰' },
    { id: 'household', label: 'उज्ज्वला गैस', icon: '🔥' }
  ];

  const handleCheckEligibility = async (scheme) => {
    setEligibilityModalScheme(scheme);
    setEligibilityResult(null);
    setApplySuccessApp(null);
    speak(`${scheme.titleHi || scheme.title} की पात्रता जांचने के लिए कृपया अपनी जानकारी की पुष्टि करें।`);
  };

  const handleRunEligibilityCheck = async () => {
    if (!eligibilityModalScheme) return;
    try {
      const res = await api.checkEligibility({
        schemeId: eligibilityModalScheme.id,
        age: eligibilityForm.age,
        gender: eligibilityForm.gender,
        isPregnant: eligibilityForm.isPregnant,
        isShgMember: eligibilityForm.isShgMember
      });
      if (res.success) {
        setEligibilityResult(res);
        speak(res.voiceAdvice);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDirectApply = async (scheme) => {
    setIsApplying(true);
    try {
      const res = await api.applyScheme({
        userId: user?.id || 'user-1',
        schemeId: scheme.id,
        applicantName: user?.name || 'Sunita Devi',
        aadhaarLast4: '8921',
        village: user?.village || 'Ramnagar',
        phone: user?.phone || '9876543210'
      });
      if (res.success) {
        setApplySuccessApp(res.application);
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        speak(`बधाई हो! ${scheme.titleHi || scheme.title} का आवेदन सफलतापूर्वक दर्ज हो गया है। आपका ट्रैकिंग नंबर है: ${res.application.trackingNumber}`);
        loadData();
      }
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="space-y-6 pb-24 max-w-5xl mx-auto px-4 pt-3">
      
      {/* 1. Header Banner */}
      <div className="bg-womentra-gradient rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shadow-inner border border-white/30">
              🏛️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                  सरकारी साथी (Sarkari Saathi)
                </h1>
                <Sparkles className="w-5 h-5 text-amber-300 fill-amber-300" />
              </div>
              <p className="text-xs sm:text-sm text-purple-100 font-medium">
                सीधी सरकारी सहायता • शून्य बिचौलिया • संपूर्ण मार्गदर्शन
              </p>
            </div>
          </div>

          <button
            onClick={() => speak("सरकारी साथी में आप मातृ वंदना, सुकन्या समृद्धि और मुद्रा लोन की पात्रता सीधे बोलकर जांच सकती हैं।")}
            className="p-2.5 bg-white/20 hover:bg-white/30 rounded-2xl backdrop-blur-md border border-white/20 text-white flex items-center gap-2 text-xs font-bold"
          >
            <Volume2 className="w-5 h-5" />
            <span>मार्गदर्शन सुनें</span>
          </button>
        </div>

        {/* Search bar */}
        <div className="mt-5 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="योजना का नाम खोजें (जैसे: मातृ वंदना, मुद्रा लोन)..."
            className="w-full pl-11 pr-4 py-3 bg-white/95 backdrop-blur-md rounded-2xl text-xs sm:text-sm font-bold text-slate-900 placeholder:text-slate-400 outline-hidden shadow-md"
          />
          <Search className="w-5 h-5 text-purple-600 absolute left-3.5 top-3.5 pointer-events-none" />
        </div>
      </div>

      {/* 2. Category Pill Filter */}
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
                ? 'bg-purple-900 text-white shadow-md shadow-purple-900/20 scale-105'
                : 'bg-white text-purple-950 border border-purple-100 hover:bg-purple-50'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* 3. My Active Applications Status Tracker */}
      {myApplications.length > 0 && (
        <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-black text-sm text-purple-950 flex items-center gap-2">
              <Clock className="w-4 h-4 text-pink-600" />
              <span>आपके जमा किए गए आवेदन (Live Status)</span>
            </h3>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
              सक्रिय
            </span>
          </div>

          <div className="space-y-2.5">
            {myApplications.map((app) => (
              <div key={app.id} className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-black tracking-wider text-purple-700 uppercase bg-white px-2 py-0.5 rounded-md border border-purple-200">
                    ट्रैकिंग आईडी: {app.trackingNumber}
                  </span>
                  <h4 className="text-xs font-extrabold text-slate-900 mt-1">
                    {app.schemeTitle}
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    स्थिति: <span className="text-pink-700 font-bold">{app.currentStage}</span>
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-[10px] text-slate-500 font-bold">अनुमानित भुगतान तिथि:</p>
                  <p className="text-xs font-black text-purple-950">{app.estimatedPayoutDate || '15 Oct 2026'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Schemes Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {schemes.map((scheme) => (
          <div
            key={scheme.id}
            className="bg-white rounded-3xl p-5 border border-purple-100 shadow-md flex flex-col justify-between hover:border-purple-300 hover:shadow-lg transition-all"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-900 font-extrabold text-xs rounded-xl border border-purple-200">
                  {scheme.benefitAmount}
                </span>
                <button
                  onClick={() => speak(scheme.voiceSummary || scheme.tagline)}
                  className="p-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl"
                  title="Speak Scheme Details"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              <h3 className="text-base font-black text-slate-900 leading-snug">
                {scheme.titleHi || scheme.title}
              </h3>
              <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
                {scheme.tagline}
              </p>

              {/* Documents Needed Badges */}
              <div className="mt-3 pt-3 border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <FileText className="w-3 h-3 text-purple-600" />
                  <span>ज़रूरी कागज़ात:</span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {scheme.documents?.map((doc, idx) => (
                    <span key={idx} className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-md">
                      • {doc}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 mt-4 pt-2">
              <button
                onClick={() => setSelectedScheme(scheme)}
                className="py-2.5 px-3 bg-purple-50 hover:bg-purple-100 text-purple-900 rounded-xl text-xs font-bold text-center transition-all touch-target-large"
              >
                विस्तार से देखें
              </button>
              <button
                onClick={() => handleCheckEligibility(scheme)}
                className="py-2.5 px-3 bg-womentra-gradient text-white rounded-xl text-xs font-bold shadow-md shadow-pink-500/20 hover:opacity-95 text-center transition-all touch-target-large flex items-center justify-center gap-1"
              >
                <span>पात्रता व आवेदन</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* 5. Interactive CSC / Jan Seva Kendra Map Locator */}
      <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-pink-600" />
            <div>
              <h3 className="font-extrabold text-base text-purple-950">
                नजदीकी जन सेवा केंद्र (CSC Locator)
              </h3>
              <p className="text-xs text-slate-600">
                यहाँ जाकर आप मुफ्त में बायोमेट्रिक व कागज़ात सत्यापन करा सकती हैं
              </p>
            </div>
          </div>
          <button
            onClick={() => speak("नजदीकी जन सेवा केंद्र रामनगर मंदिर के पास 1.2 किलोमीटर की दूरी पर है। विमला पटेल जी केंद्र संचालक हैं।")}
            className="p-2 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-xl text-xs font-bold flex items-center gap-1.5"
          >
            <Volume2 className="w-4 h-4" />
            <span>पता सुनें</span>
          </button>
        </div>

        {/* Leaflet Map */}
        <div className="h-64 rounded-2xl overflow-hidden border border-purple-100 shadow-inner relative z-0">
          <MapContainer center={[25.2677, 83.0234]} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {cscCenters.map((csc) => (
              <Marker key={csc.id} position={[csc.lat, csc.lng]}>
                <Popup>
                  <div className="p-1 text-xs">
                    <p className="font-bold text-purple-950">{csc.name}</p>
                    <p className="text-slate-600">{csc.address}</p>
                    <p className="text-pink-600 font-bold mt-1">📞 {csc.phone} (संचालक: {csc.operatorName})</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* CSC List Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {cscCenters.map((csc) => (
            <div key={csc.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-pink-700 bg-pink-50 px-2 py-0.5 rounded-md border border-pink-200">
                  {csc.distanceKm} दूर
                </span>
                <h4 className="text-xs font-extrabold text-slate-900 mt-1">
                  {csc.name}
                </h4>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {csc.address}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-purple-900">
                <span>📞 {csc.phone}</span>
                <span className="text-[10px] text-emerald-700">सत्यापित CSC ✓</span>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Scheme Detail Modal */}
      {selectedScheme && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-purple-100 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95">
            <div className="bg-womentra-gradient p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black">{selectedScheme.titleHi || selectedScheme.title}</h3>
                <p className="text-xs text-purple-100">{selectedScheme.benefitAmount}</p>
              </div>
              <button onClick={() => setSelectedScheme(null)} className="p-2 text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              <div>
                <h4 className="text-xs font-bold text-purple-950 uppercase tracking-wider mb-2">
                  योजना के चरण (Step by Step Process):
                </h4>
                <div className="space-y-2">
                  {selectedScheme.steps?.map((st, i) => (
                    <div key={i} className="p-3 bg-purple-50 rounded-xl border border-purple-100 flex items-start gap-2.5 text-xs text-purple-950 font-medium">
                      <span className="w-5 h-5 rounded-full bg-purple-700 text-white flex items-center justify-center text-[10px] shrink-0">
                        {i + 1}
                      </span>
                      <span>{st}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    const sch = selectedScheme;
                    setSelectedScheme(null);
                    handleCheckEligibility(sch);
                  }}
                  className="w-full py-3.5 bg-womentra-gradient text-white rounded-2xl font-bold text-sm shadow-md"
                >
                  पात्रता जांचें व आवेदन करें →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Eligibility Checker & 1-Click Application Modal */}
      {eligibilityModalScheme && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-purple-100 overflow-hidden flex flex-col animate-in zoom-in-95 max-h-[90vh]">
            <div className="bg-womentra-gradient p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-black">पात्रता जांच (Eligibility Check)</h3>
                <p className="text-xs text-purple-100">{eligibilityModalScheme.titleHi || eligibilityModalScheme.title}</p>
              </div>
              <button onClick={() => setEligibilityModalScheme(null)} className="p-2 text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              
              {!eligibilityResult && !applySuccessApp && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">आपकी आयु (Age in Years)</label>
                    <input
                      type="number"
                      value={eligibilityForm.age}
                      onChange={(e) => setEligibilityForm({ ...eligibilityForm, age: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl border border-purple-200">
                    <span className="text-xs font-bold text-purple-950">क्या आप स्वयं सहायता समूह (SHG) से जुड़ी हैं?</span>
                    <input
                      type="checkbox"
                      checked={eligibilityForm.isShgMember}
                      onChange={(e) => setEligibilityForm({ ...eligibilityForm, isShgMember: e.target.checked })}
                      className="w-5 h-5 accent-pink-600 cursor-pointer"
                    />
                  </div>

                  <button
                    onClick={handleRunEligibilityCheck}
                    className="w-full py-3.5 bg-womentra-gradient text-white rounded-2xl font-bold text-sm shadow-md"
                  >
                    जांचें (Check Now) ✨
                  </button>
                </div>
              )}

              {eligibilityResult && !applySuccessApp && (
                <div className="space-y-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-3xl">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900">
                      बधाई हो! आप पात्र हैं (You are Eligible)
                    </h4>
                    <p className="text-xs text-slate-600 mt-1">
                      {eligibilityResult.voiceAdvice}
                    </p>
                  </div>

                  <div className="p-3 bg-purple-50 rounded-xl text-left border border-purple-100">
                    <p className="text-[11px] font-bold text-purple-900 mb-1">ज़रूरी दस्तावेज़ ले जाएं:</p>
                    {eligibilityResult.documentsNeeded?.map((doc, idx) => (
                      <p key={idx} className="text-[10px] text-slate-700">• {doc}</p>
                    ))}
                  </div>

                  <button
                    onClick={() => handleDirectApply(eligibilityModalScheme)}
                    disabled={isApplying}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm shadow-md"
                  >
                    {isApplying ? 'आवेदन भेजा जा रहा है...' : 'आवेदन दर्ज करें (Submit Application) 🚀'}
                  </button>
                </div>
              )}

              {applySuccessApp && (
                <div className="space-y-4 text-center py-2">
                  <div className="w-16 h-16 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center mx-auto text-3xl animate-bounce">
                    🎉
                  </div>
                  <div>
                    <h4 className="text-base font-black text-purple-950">
                      आवेदन सफलतापूर्वक दर्ज हुआ!
                    </h4>
                    <p className="text-xs text-pink-700 font-bold mt-1">
                      ट्रैकिंग नंबर: {applySuccessApp.trackingNumber}
                    </p>
                    <p className="text-[11px] text-slate-600 mt-2">
                      नजदीकी केंद्र: {applySuccessApp.nearestCSC}
                    </p>
                  </div>

                  <button
                    onClick={() => setEligibilityModalScheme(null)}
                    className="w-full py-3 bg-womentra-gradient text-white rounded-2xl font-bold text-xs"
                  >
                    पूर्ण हुआ (Done)
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
