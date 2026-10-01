import React, { useState } from 'react';
import {
  X, Phone, KeyRound, Sparkles, Volume2, ShieldCheck,
  HeartHandshake, ArrowRight, UserCheck, UserPlus, LogIn, Globe, Eye, EyeOff
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useVoiceNarrator } from '../../context/VoiceNarratorContext';
import { useAuth } from '../../context/AuthContext';
import confetti from 'canvas-confetti';

export const PhoneOtpLoginModal = ({ isOpen, onClose }) => {
  const { currentLang, languages, changeLanguage, t } = useLanguage();
  const { speak } = useVoiceNarrator();
  const { register, loginWithPassword, loginWithPhoneOtp, loading } = useAuth();

  const [mode, setMode] = useState('login');   // 'login' | 'register'
  const [step, setStep] = useState('creds');   // 'creds' | 'otp'

  // Shared
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [demoOtpCode, setDemoOtpCode] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState(currentLang);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Register-specific
  const [name, setName] = useState('');
  const [village, setVillage] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!isOpen) return null;

  const clearForm = () => {
    setPhone(''); setOtp(''); setName(''); setVillage('');
    setPassword(''); setConfirmPassword(''); setErrorMsg('');
    setStep('creds'); setDemoOtpCode('');
  };

  // ── REGISTER submit ────────────────────────────────────────────────────────
  const handleRegister = async (e) => {
    e?.preventDefault();
    setErrorMsg('');

    if (!name.trim()) { const m = t('nameLabel') + ' required.'; setErrorMsg(m); speak(m); return; }
    if (!phone || phone.length < 10) { const m = 'Please enter a valid 10-digit mobile number.'; setErrorMsg(m); speak(m); return; }
    if (password.length < 8) { const m = t('passwordTooShort'); setErrorMsg(m); speak(m); return; }
    if (password !== confirmPassword) { const m = t('passwordMismatch'); setErrorMsg(m); speak(m); return; }

    setIsSubmitting(true);
    try {
      const res = await register({ phone, password, name, village, language: selectedLanguage });
      if (res.success) {
        changeLanguage(selectedLanguage, false);
        confetti({ particleCount: 80, spread: 70 });
        speak(`${t('welcome')} ${res.user.name}`);
        onClose();
      } else {
        setErrorMsg(res.message);
        speak(res.message);
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── LOGIN step 1: verify password, get OTP ─────────────────────────────────
  const handlePasswordLogin = async (e) => {
    e?.preventDefault();
    setErrorMsg('');

    if (!phone || phone.length < 10) { const m = 'Please enter a valid 10-digit mobile number.'; setErrorMsg(m); speak(m); return; }
    if (!password) { const m = t('passwordLabel') + ' required.'; setErrorMsg(m); speak(m); return; }

    setIsSubmitting(true);
    try {
      const res = await loginWithPassword({ phone, password, language: selectedLanguage });
      if (res.success && res.requiresOtp) {
        setDemoOtpCode(res.demoOtp || '123456');
        setOtp(res.demoOtp || '123456');
        setStep('otp');
        speak(res.voicePrompt || `OTP sent. Demo code is 1 2 3 4 5 6.`);
      } else {
        setErrorMsg(res.message || 'Login failed.');
        speak(res.message || 'Login failed.');
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── LOGIN step 2: verify OTP ───────────────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    if (!otp || otp.length !== 6) {
      const m = t('enterOtp');
      setErrorMsg(m);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const res = await loginWithPhoneOtp({
        phone, otp,
        name: name || 'Sakhi Didi',
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
      setIsSubmitting(false);
    }
  };

  // ── Quick demo login (1-click eval shortcut) ───────────────────────────────
  const handleQuickDemo = async (demoPhone, demoName) => {
    setIsSubmitting(true);
    try {
      const res = await loginWithPhoneOtp({
        phone: demoPhone, otp: '123456',
        name: demoName, village: 'Ramnagar', language: currentLang
      });
      if (res.success) {
        speak(`${t('welcome')} ${demoName}`);
        onClose();
      } else {
        setErrorMsg(res.message || 'Demo login failed.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const busy = isSubmitting || loading;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl border border-purple-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">

        {/* ── Header ── */}
        <div className="bg-womentra-gradient p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Womentra Logo"
              className="w-12 h-12 rounded-2xl bg-white/20 p-0.5 object-contain shadow-inner"
              onError={(e) => { e.target.src = '/logo.svg'; }}
            />
            <div>
              <h3 className="text-lg font-black tracking-widest flex items-center gap-1.5 font-display">
                WOMENSTRA <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
              </h3>
              <p className="text-[10px] text-purple-100 font-bold">{t('mission')}</p>
            </div>
          </div>
          <button onClick={() => { clearForm(); onClose(); }}
            className="p-2 rounded-full hover:bg-white/20 transition-all" aria-label="Close">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* ── Mode Tabs ── */}
        <div className="grid grid-cols-2 p-1.5 bg-purple-50 dark:bg-slate-800 border-b border-purple-100 dark:border-slate-700 shrink-0">
          {[
            { id: 'login', label: t('loginWithPhone'), icon: <LogIn className="w-3.5 h-3.5" /> },
            { id: 'register', label: t('registerTitle'), icon: <UserPlus className="w-3.5 h-3.5" /> }
          ].map(tab => (
            <button key={tab.id}
              onClick={() => { setMode(tab.id); setStep('creds'); setErrorMsg(''); }}
              className={`py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                mode === tab.id
                  ? 'bg-white dark:bg-slate-900 text-purple-950 dark:text-purple-200 shadow-sm'
                  : 'text-slate-500 hover:text-purple-900 dark:hover:text-purple-300'
              }`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ── Body ── */}
        <div className="p-5 space-y-4 overflow-y-auto">

          {/* ── Language selector ── */}
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-purple-600 dark:text-pink-400 shrink-0" />
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="flex-1 px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold dark:text-white outline-none"
            >
              {languages.map(l => (
                <option key={l.code} value={l.code}>{l.flag} {l.name} ({l.englishName})</option>
              ))}
            </select>
          </div>

          {step === 'creds' ? (
            <form
              onSubmit={mode === 'register' ? handleRegister : handlePasswordLogin}
              className="space-y-3.5"
            >

              {/* ── Register-only fields ── */}
              {mode === 'register' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('nameLabel')} *
                    </label>
                    <input
                      type="text" required value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Sunita Devi"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-pink-500 rounded-xl text-sm font-bold dark:text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('villageLabel')}
                    </label>
                    <input
                      type="text" value={village}
                      onChange={e => setVillage(e.target.value)}
                      placeholder="e.g. Ramnagar, Varanasi"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-pink-500 rounded-xl text-sm font-bold dark:text-white outline-none"
                    />
                  </div>
                </>
              )}

              {/* ── Phone ── */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                  <span>Mobile Number (10 Digits) *</span>
                  <button type="button" onClick={() => speak('Please enter your 10 digit mobile number.')}
                    className="text-purple-600 dark:text-pink-400">
                    <Volume2 className="w-4 h-4" />
                  </button>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold text-xs pointer-events-none">
                    🇮🇳 +91
                  </span>
                  <input
                    type="tel" maxLength="10" required value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    className="w-full pl-16 pr-3.5 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-pink-500 rounded-xl text-base font-bold dark:text-white tracking-wider outline-none"
                  />
                </div>
              </div>

              {/* ── Password ── */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('passwordLabel')} *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={t('passwordPlaceholder')}
                    minLength={8}
                    className="w-full px-3.5 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-pink-500 rounded-xl text-sm font-bold dark:text-white outline-none"
                  />
                  <button type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400"
                    onClick={() => setShowPassword(v => !v)}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* ── Confirm password (register only) ── */}
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('confirmPasswordLabel')} *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      required value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder={t('confirmPasswordLabel')}
                      className="w-full px-3.5 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-pink-500 rounded-xl text-sm font-bold dark:text-white outline-none"
                    />
                    <button type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400"
                      onClick={() => setShowConfirm(v => !v)}>
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* ── Error ── */}
              {errorMsg && (
                <p className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900">
                  ⚠️ {errorMsg}
                </p>
              )}

              {/* ── Submit ── */}
              <button type="submit" disabled={busy}
                className="w-full py-3.5 bg-womentra-gradient text-white rounded-2xl font-black text-sm shadow-md shadow-pink-500/20 hover:opacity-95 transition-all touch-target-large flex items-center justify-center gap-2 disabled:opacity-60">
                {mode === 'register' ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                <span>
                  {busy ? '...' : mode === 'register' ? t('registerButton') : t('loginButton')}
                </span>
              </button>

              {/* ── Mode switch ── */}
              <button type="button"
                onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setErrorMsg(''); }}
                className="w-full text-center text-xs font-bold text-purple-700 dark:text-pink-400 hover:underline py-1">
                {mode === 'login' ? t('noAccount') : t('alreadyHaveAccount')}
              </button>

            </form>

          ) : (
            /* ── OTP Step ── */
            <form onSubmit={handleVerifyOtp} className="space-y-3.5">
              <div className="p-3 bg-pink-50 dark:bg-purple-950/40 rounded-2xl border border-pink-200 dark:border-purple-800 text-center">
                <p className="text-xs font-bold text-pink-900 dark:text-pink-200">
                  OTP sent to +91 {phone}
                </p>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="text-xl font-black text-pink-700 dark:text-pink-300 tracking-widest bg-white dark:bg-slate-800 px-3 py-1 rounded-xl shadow-sm">
                    {demoOtpCode}
                  </span>
                  <button type="button"
                    onClick={() => speak(`Your OTP is ${demoOtpCode.split('').join(' ')}`)}
                    className="p-1.5 bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 rounded-xl shadow-sm">
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('enterOtp')}
                </label>
                <input
                  type="text" maxLength="6" value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  autoFocus
                  className="w-full text-center py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-pink-500 rounded-xl text-2xl font-black dark:text-white tracking-widest outline-none"
                />
              </div>

              {errorMsg && (
                <p className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900">
                  ⚠️ {errorMsg}
                </p>
              )}

              <button type="submit" disabled={busy}
                className="w-full py-3.5 bg-womentra-gradient text-white rounded-2xl font-black text-sm shadow-md shadow-pink-500/20 touch-target-large flex items-center justify-center gap-2 disabled:opacity-60">
                <UserCheck className="w-5 h-5" />
                <span>{busy ? '...' : 'Verify & Enter'}</span>
              </button>

              <button type="button" onClick={() => { setStep('creds'); setErrorMsg(''); }}
                className="w-full text-center text-xs font-bold text-purple-700 dark:text-pink-400 hover:underline py-1">
                ← Change Number
              </button>
            </form>
          )}

          {/* ── Quick Demo Login ── */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              ⚡ 1-Click Evaluation Login
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button type="button"
                onClick={() => handleQuickDemo('9876543210', 'Sunita Devi')}
                disabled={busy}
                className="p-2.5 bg-purple-50 dark:bg-slate-800 border border-purple-200 dark:border-slate-700 rounded-xl text-left hover:bg-purple-100 dark:hover:bg-slate-700 transition-all disabled:opacity-60">
                <p className="text-xs font-bold text-purple-950 dark:text-purple-200">👩🏽 Sunita Devi</p>
                <p className="text-[10px] text-purple-700 dark:text-slate-400">Rural Learner</p>
              </button>
              <button type="button"
                onClick={() => handleQuickDemo('9999999999', 'Admin Team')}
                disabled={busy}
                className="p-2.5 bg-pink-50 dark:bg-slate-800 border border-pink-200 dark:border-slate-700 rounded-xl text-left hover:bg-pink-100 dark:hover:bg-slate-700 transition-all disabled:opacity-60">
                <p className="text-xs font-bold text-pink-950 dark:text-pink-200">🛡️ Admin Team</p>
                <p className="text-[10px] text-pink-700 dark:text-slate-400">Governance CMS</p>
              </button>
            </div>
          </div>

        </div>

        {/* ── Footer ── */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-700 text-center text-[10px] text-slate-500 font-medium shrink-0">
          🔒 DPDP Act 2023 Compliant • Passwords hashed with bcrypt • Privacy Protected
        </div>

      </div>
    </div>
  );
};
