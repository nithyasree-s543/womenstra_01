import React, { useState } from 'react';
import { 
  ShieldCheck, CheckCircle2, UploadCloud, FileText, Sparkles, 
  ArrowRight, Lock, UserCheck, Volume2, Award 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useVoiceNarrator } from '../../context/VoiceNarratorContext';
import { api } from '../../services/api';
import confetti from 'canvas-confetti';

export const TutorKycView = () => {
  const { currentLang } = useLanguage();
  const { speak, narrateScreen } = useVoiceNarrator();

  const [formData, setFormData] = useState({
    name: 'Suman Lata Verma',
    phone: '9876500112',
    languages: ['hi', 'en'],
    skills: ['Tailoring & Boutique', 'SHG Bookkeeping'],
    experienceYears: '5',
    bio: 'Dedicated rural instructor with 5 years experience training SHG women in advanced tailoring and micro-finance.',
    aadhaarNumber: '983412095543'
  });

  const [kycStep, setKycStep] = useState(1); // 1: form, 2: digilocker consent, 3: success
  const [loading, setLoading] = useState(false);
  const [verificationToken, setVerificationToken] = useState('');

  const handleDigiLockerKyc = async () => {
    setLoading(true);
    speak("DigiLocker से आधार और कौशल प्रमाण पत्र का सुरक्षित सत्यापन हो रहा है...");
    
    try {
      const res = await api.registerTutor({
        name: formData.name,
        phone: formData.phone,
        languages: formData.languages,
        skills: formData.skills,
        experienceYears: formData.experienceYears,
        bio: formData.bio,
        aadhaarNumber: formData.aadhaarNumber
      });

      if (res.success) {
        setVerificationToken(res.mentor.kycToken);
        setKycStep(3);
        confetti({ particleCount: 70, spread: 60 });
        speak("बधाई हो! आपका DigiLocker ई-केवाईसी सत्यापन सफल रहा। आपको वोमंतरा सत्यापित ट्यूटर बैज मिल गया है।");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-24 max-w-3xl mx-auto px-4 pt-3">
      
      {/* Header */}
      <div className="bg-womentra-gradient rounded-3xl p-6 text-white shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl">
            🛡️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black">
                ट्यूटर पंजीकरण व ई-केवाईसी (Verified Tutors & e-KYC)
              </h1>
              <Sparkles className="w-5 h-5 text-amber-300 fill-amber-300" />
            </div>
            <p className="text-xs text-purple-100 font-medium">
              DigiLocker व सरकारी पहचान द्वारा 100% सत्यापित शिक्षक
            </p>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-md space-y-5">
        
        {kycStep === 1 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-purple-950">
                चरण 1: ट्यूटर विवरण (Tutor Information)
              </h3>
              <span className="text-xs font-bold text-purple-700">कदम 1 / 3</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">पूरा नाम</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">मोबाइल नंबर</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">विशेषज्ञता कौशल (Skills)</label>
              <input
                type="text"
                value={formData.skills.join(', ')}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value.split(',').map(s => s.trim()) })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">संक्षिप्त परिचय (Bio)</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                rows="3"
              />
            </div>

            <button
              onClick={() => {
                setKycStep(2);
                speak("अब DigiLocker के माध्यम से अपना आधार व प्रमाण पत्र सत्यापित करें।");
              }}
              className="w-full py-3.5 bg-womentra-gradient text-white rounded-2xl font-bold text-sm shadow-md flex items-center justify-center gap-2"
            >
              <span>अगला: DigiLocker ई-केवाईसी →</span>
            </button>
          </div>
        )}

        {kycStep === 2 && (
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mx-auto text-3xl">
              <Lock className="w-8 h-8 text-purple-700" />
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">
                DigiLocker सहमति आधारित ई-केवाईसी
              </h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto mt-1">
                सुरक्षा नियम: वोमंतरा कभी भी आपका कच्चा आधार नंबर सेव नहीं करता। केवल सुरक्षित टोकन से सत्यापन होता है।
              </p>
            </div>

            <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 text-left space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-950">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>पहचान प्रमाण पत्र: UIDAI Aadhaar Verification Token</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-purple-950">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>शिक्षा / कौशल प्रमाण पत्र: NSDC / Skill India Verified</span>
              </div>
            </div>

            <button
              onClick={handleDigiLockerKyc}
              disabled={loading}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm shadow-md flex items-center justify-center gap-2"
            >
              <UserCheck className="w-5 h-5" />
              <span>{loading ? 'DigiLocker से सत्यापन हो रहा है...' : 'DigiLocker से सत्यापित करें (Simulate KYC) ✓'}</span>
            </button>
          </div>
        )}

        {kycStep === 3 && (
          <div className="space-y-4 text-center py-4">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-4xl animate-bounce">
              ✓
            </div>

            <div>
              <h3 className="text-xl font-black text-emerald-950">
                ई-केवाईसी सत्यापन पूर्ण!
              </h3>
              <p className="text-xs text-purple-700 font-bold mt-1">
                सत्यापन टोकन: {verificationToken}
              </p>
              <p className="text-xs text-slate-600 max-w-sm mx-auto mt-2">
                आपको "Womentra Verified Tutor" का बैज प्रदान किया गया है। अब आप ग्रामीण शिक्षार्थियों को 1:1 मेंटरशिप दे सकती हैं।
              </p>
            </div>

            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200 flex items-center justify-center gap-3">
              <Award className="w-8 h-8 text-amber-500 fill-amber-300" />
              <div className="text-left">
                <p className="text-xs font-black text-purple-950">प्रमाणित वोमंतरा ट्यूटर बैज सक्रिय</p>
                <p className="text-[10px] text-purple-700">DPDP Act 2023 Compliant Verification</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
