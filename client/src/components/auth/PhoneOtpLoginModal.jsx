import React, { useState } from 'react';
import { X, Phone, KeyRound, Sparkles, Volume2, ShieldCheck, HeartHandshake, ArrowRight, UserCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useVoiceNarrator } from '../../context/VoiceNarratorContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export const PhoneOtpLoginModal = ({ isOpen, onClose, onOpenOnboarding }) => {
  const { currentLang, t } = useLanguage();
  const { speak } = useVoiceNarrator();
  const { loginWithPhoneOtp } = useAuth();

  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [phone, setPhone] = useState('9876543210');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [demoOtpCode, setDemoOtpCode] = useState('');
  const [isFamilyMode, setIsFamilyMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!phone || phone.length < 10) {
      setErrorMsg('कृपया 10 अंकों का मोबाइल नंबर डालें');
      speak('कृपया 10 अंकों का मोबाइल नंबर डालें');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.sendOtp(phone, currentLang);
      if (res.success) {
        setDemoOtpCode(res.demoOtp || '123456');
        setOtp(res.demoOtp || '123456');
        setStep('otp');
        speak(res.voicePrompt || 'ओटीपी आपके नंबर पर भेजा गया है। डेमो ओटीपी 1 2 3 4 5 6 है।');
      }
    } catch {
      setErrorMsg('Network error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    if (!otp) {
      setErrorMsg('कृपया 6 अंकों का ओटीपी भरें');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await loginWithPhoneOtp({
        phone,
        otp,
        name: name || 'Sunita Devi',
        village: 'Ramnagar',
        language: currentLang
      });

      if (res.success) {
        speak(`नमस्ते ${res.user.name}! वोमंतरा में आपका स्वागत है।`);
        onClose();
      } else {
        setErrorMsg(res.message);
        speak(res.message);
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoPhone, demoName, role = 'user') => {
    setLoading(true);
    try {
      const res = await loginWithPhoneOtp({
        phone: demoPhone,
        otp: '123456',
        name: demoName,
        village: 'Ramnagar',
        language: currentLang
      });
      if (res.success) {
        speak(`सफलतापूर्वक प्रवेश हुआ! स्वागत है ${demoName}।`);
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-purple-100 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-womentra-gradient p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl font-bold">
              💜
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">
                {t('loginWithPhone')}
              </h3>
              <p className="text-xs text-purple-100 font-medium">
                सरल व सुरक्षित प्रवेश (OTP Login)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 transition-all text-white"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          
          {/* Family Member Assistance Toggle */}
          <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-purple-700" />
              <div>
                <p className="text-xs font-bold text-purple-950">पारिवारिक सहायता मोड</p>
                <p className="text-[10px] text-purple-700">परिवार का कोई सदस्य खाता बनाने में मदद कर रहा है</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isFamilyMode}
              onChange={(e) => setIsFamilyMode(e.target.checked)}
              className="w-5 h-5 accent-pink-600 rounded-md cursor-pointer"
            />
          </div>

          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>मोबाइल नंबर (10 अंक)</span>
                  <button
                    type="button"
                    onClick={() => speak("कृपया अपना 10 अंकों का मोबाइल नंबर डालें।")}
                    className="text-purple-600 hover:text-purple-800"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-sm">
                    🇮🇳 +91
                  </div>
                  <input
                    type="tel"
                    maxLength="10"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    className="w-full pl-20 pr-4 py-3.5 bg-slate-50 border-2 border-slate-200 focus:border-pink-500 focus:bg-white rounded-2xl text-lg font-bold text-slate-900 tracking-wider outline-hidden transition-all"
                  />
                </div>
              </div>

              {isFamilyMode && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    सखी का नाम (Learner's Name)
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="जैसे: सुनीता देवी"
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 focus:border-pink-500 rounded-2xl text-sm font-semibold outline-hidden"
                  />
                </div>
              )}

              {errorMsg && (
                <p className="text-xs font-bold text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                  ⚠️ {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-womentra-gradient text-white rounded-2xl font-black text-base shadow-lg shadow-pink-500/25 hover:opacity-95 transition-all touch-target-large flex items-center justify-center gap-2"
              >
                <span>{loading ? 'ओटीपी भेजा जा रहा है...' : 'ओटीपी प्राप्त करें (Send OTP)'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-3 bg-pink-50 rounded-2xl border border-pink-200 text-center">
                <p className="text-xs font-bold text-pink-900">
                  +91 {phone} पर भेजा गया ओटीपी:
                </p>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="text-xl font-black text-pink-700 tracking-widest bg-white px-3 py-1 rounded-xl shadow-2xs">
                    {demoOtpCode}
                  </span>
                  <button
                    type="button"
                    onClick={() => speak(`आपका ओटीपी है: ${demoOtpCode.split('').join(' ')}`)}
                    className="p-1.5 bg-white text-purple-700 rounded-xl shadow-2xs hover:bg-purple-50"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  6 अंकों का ओटीपी दर्ज करें
                </label>
                <input
                  type="text"
                  maxLength="6"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full text-center py-3.5 bg-slate-50 border-2 border-slate-200 focus:border-pink-500 focus:bg-white rounded-2xl text-2xl font-black text-slate-900 tracking-widest outline-hidden transition-all"
                />
              </div>

              {errorMsg && (
                <p className="text-xs font-bold text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                  ⚠️ {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-womentra-gradient text-white rounded-2xl font-black text-base shadow-lg shadow-pink-500/25 hover:opacity-95 transition-all touch-target-large flex items-center justify-center gap-2"
              >
                <UserCheck className="w-5 h-5" />
                <span>{loading ? 'सत्यापित हो रहा है...' : 'सत्यापित करें व प्रवेश करें'}</span>
              </button>

              <button
                type="button"
                onClick={() => setStep('phone')}
                className="w-full text-center text-xs font-bold text-purple-700 hover:underline py-1"
              >
                ← मोबाइल नंबर बदलें
              </button>
            </form>
          )}

          {/* Quick Demo Credentials for Evaluation */}
          <div className="pt-2 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              ⚡ 1-क्लिक टेस्ट क्रेडेंशियल्स (Demo Quick Entry):
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('9876543210', 'Sunita Devi')}
                className="p-2.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl text-left"
              >
                <p className="text-xs font-bold text-purple-950">👩🏽 Sunita Devi</p>
                <p className="text-[10px] text-purple-700">Rural Learner (UP)</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('9999999999', 'Admin Team', 'admin')}
                className="p-2.5 bg-pink-50 hover:bg-pink-100 border border-pink-200 rounded-xl text-left"
              >
                <p className="text-xs font-bold text-pink-950">🛡️ Admin Portal</p>
                <p className="text-[10px] text-pink-700">KYC & Schemes CMS</p>
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-500">
          🔒 DPDP Act 2023 अनुपालन • डेटा पूरी तरह सुरक्षित
        </div>

      </div>
    </div>
  );
};
