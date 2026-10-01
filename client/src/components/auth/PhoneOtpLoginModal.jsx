import React, { useState } from 'react';
import { 
  X, Phone, KeyRound, Sparkles, Volume2, ShieldCheck, 
  HeartHandshake, ArrowRight, UserCheck, UserPlus, LogIn, Globe 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useVoiceNarrator } from '../../context/VoiceNarratorContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import confetti from 'canvas-confetti';

export const PhoneOtpLoginModal = ({ isOpen, onClose }) => {
  const { currentLang, languages, changeLanguage, t } = useLanguage();
  const { speak } = useVoiceNarrator();
  const { loginWithPhoneOtp } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  
  // Registration & Login Fields
  const [phone, setPhone] = useState('9876543210');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [village, setVillage] = useState('Ramnagar, UP');
  const [selectedLanguage, setSelectedLanguage] = useState(currentLang);
  const [hasGuardian, setHasGuardian] = useState(false);
  const [guardianName, setGuardianName] = useState('');
  const [demoOtpCode, setDemoOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!phone || phone.length < 10) {
      const err = 'Please enter a valid 10-digit mobile number';
      setErrorMsg(err);
      speak(err);
      return;
    }

    if (mode === 'register' && !name.trim()) {
      const err = 'Please enter your name';
      setErrorMsg(err);
      speak(err);
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.sendOtp(phone, selectedLanguage);
      if (res.success) {
        setDemoOtpCode(res.demoOtp || '123456');
        setOtp(res.demoOtp || '123456');
        setStep('otp');
        speak(res.voicePrompt || `OTP sent to your number. Demo code is 1 2 3 4 5 6.`);
      }
    } catch {
      setErrorMsg('Network issue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    if (!otp) {
      setErrorMsg('Please enter the 6-digit OTP');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await loginWithPhoneOtp({
        phone,
        otp,
        name: name || (mode === 'register' ? 'Learner Sister' : 'Sunita Devi'),
        village: village || 'Gramin',
        language: selectedLanguage
      });

      if (res.success) {
        changeLanguage(selectedLanguage, false);
        confetti({ particleCount: 70, spread: 60 });
        speak(`${t('welcome')} ${res.user.name}`);
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

  const handleQuickDemo = async (demoPhone, demoName) => {
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
        speak(`${t('welcome')} ${demoName}`);
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl border border-purple-100 dark:border-slate-800 overflow-hidden flex flex-col animate-in zoom-in-95 max-h-[90vh]">
        
        {/* Header with Attached Logo and Tagline */}
        <div className="bg-womentra-gradient p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo.svg"
              alt="Womentra Logo"
              className="w-12 h-12 rounded-2xl bg-white/20 p-1 backdrop-blur-md shadow-inner object-contain"
            />
            <div>
              <h3 className="text-lg font-black tracking-tight flex items-center gap-1.5">
                <span>WOMENTRA</span>
                <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
              </h3>
              <p className="text-[10px] text-purple-100 font-bold">
                {t('mission')}
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

        {/* Tab Switcher: Login vs Register */}
        <div className="grid grid-cols-2 p-1.5 bg-purple-50 dark:bg-slate-800 border-b border-purple-100 dark:border-slate-700">
          <button
            onClick={() => {
              setMode('login');
              setStep('phone');
              setErrorMsg('');
            }}
            className={`py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              mode === 'login'
                ? 'bg-white dark:bg-slate-900 text-purple-950 dark:text-purple-200 shadow-xs'
                : 'text-slate-500 hover:text-purple-900'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>{t('loginWithPhone')}</span>
          </button>

          <button
            onClick={() => {
              setMode('register');
              setStep('phone');
              setErrorMsg('');
            }}
            className={`py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              mode === 'register'
                ? 'bg-white dark:bg-slate-900 text-purple-950 dark:text-purple-200 shadow-xs'
                : 'text-slate-500 hover:text-purple-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{t('registerTitle')}</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          
          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-3.5">
              
              {mode === 'register' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('nameLabel')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Sunita Devi"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-pink-500 rounded-xl text-xs font-bold dark:text-white outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('villageLabel')}
                    </label>
                    <input
                      type="text"
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      placeholder="e.g. Ramnagar, Varanasi"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-pink-500 rounded-xl text-xs font-bold dark:text-white outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-purple-600" />
                      <span>Preferred Learning Language</span>
                    </label>
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-pink-500 rounded-xl text-xs font-bold dark:text-white outline-hidden"
                    >
                      {languages.map((l) => (
                        <option key={l.code} value={l.code}>
                          {l.flag} {l.name} ({l.englishName})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Optional Guardian Linking */}
                  <div className="p-3 bg-purple-50 dark:bg-slate-800 rounded-xl border border-purple-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-950 dark:text-purple-200">
                        {t('guardianLinking')} (Optional)
                      </span>
                      <input
                        type="checkbox"
                        checked={hasGuardian}
                        onChange={(e) => setHasGuardian(e.target.checked)}
                        className="w-4 h-4 accent-pink-600 cursor-pointer"
                      />
                    </div>
                    {hasGuardian && (
                      <input
                        type="text"
                        value={guardianName}
                        onChange={(e) => setGuardianName(e.target.value)}
                        placeholder="Guardian Name / Relationship"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-purple-200 rounded-lg text-xs font-bold"
                      />
                    )}
                  </div>
                </>
              )}

              {/* Mobile Phone Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                  <span>Mobile Number (10 Digits)</span>
                  <button
                    type="button"
                    onClick={() => speak("Please enter your 10 digit mobile number.")}
                    className="text-purple-600 dark:text-pink-400"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-bold text-xs">
                    🇮🇳 +91
                  </div>
                  <input
                    type="tel"
                    maxLength="10"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    className="w-full pl-16 pr-3.5 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-pink-500 rounded-xl text-base font-bold text-slate-900 dark:text-white tracking-wider outline-hidden"
                  />
                </div>
              </div>

              {errorMsg && (
                <p className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900">
                  ⚠️ {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-womentra-gradient text-white rounded-2xl font-black text-sm shadow-md shadow-pink-500/20 hover:opacity-95 transition-all touch-target-large flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Sending OTP...' : 'Send OTP (ओटीपी प्राप्त करें)'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-3.5">
              <div className="p-3 bg-pink-50 dark:bg-purple-950/40 rounded-2xl border border-pink-200 dark:border-purple-800 text-center">
                <p className="text-xs font-bold text-pink-900 dark:text-pink-200">
                  OTP sent to +91 {phone}
                </p>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="text-xl font-black text-pink-700 dark:text-pink-300 tracking-widest bg-white dark:bg-slate-800 px-3 py-1 rounded-xl shadow-2xs">
                    {demoOtpCode}
                  </span>
                  <button
                    type="button"
                    onClick={() => speak(`Your OTP is ${demoOtpCode.split('').join(' ')}`)}
                    className="p-1.5 bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 rounded-xl shadow-2xs"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('enterOtp')}
                </label>
                <input
                  type="text"
                  maxLength="6"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full text-center py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-pink-500 rounded-xl text-2xl font-black text-slate-900 dark:text-white tracking-widest outline-hidden"
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
                className="w-full py-3.5 bg-womentra-gradient text-white rounded-2xl font-black text-sm shadow-md shadow-pink-500/20 touch-target-large flex items-center justify-center gap-2"
              >
                <UserCheck className="w-5 h-5" />
                <span>{loading ? 'Verifying...' : 'Verify & Enter (सत्यापित करें)'}</span>
              </button>

              <button
                type="button"
                onClick={() => setStep('phone')}
                className="w-full text-center text-xs font-bold text-purple-700 dark:text-pink-400 hover:underline py-1"
              >
                ← Change Number
              </button>
            </form>
          )}

          {/* Quick Demo Login Shortcut */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              ⚡ 1-Click Evaluation Login
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('9876543210', 'Sunita Devi')}
                className="p-2.5 bg-purple-50 dark:bg-slate-800 border border-purple-200 dark:border-slate-700 rounded-xl text-left"
              >
                <p className="text-xs font-bold text-purple-950 dark:text-purple-200">👩🏽 Sunita Devi</p>
                <p className="text-[10px] text-purple-700 dark:text-slate-400">Rural Learner</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('9999999999', 'Admin Team')}
                className="p-2.5 bg-pink-50 dark:bg-slate-800 border border-pink-200 dark:border-slate-700 rounded-xl text-left"
              >
                <p className="text-xs font-bold text-pink-950 dark:text-pink-200">🛡️ Admin Team</p>
                <p className="text-[10px] text-pink-700 dark:text-slate-400">Governance CMS</p>
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 text-center text-[10px] text-slate-500 font-medium">
          🔒 DPDP Act 2023 Compliant • Privacy Protected
        </div>

      </div>
    </div>
  );
};
