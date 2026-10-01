import React, { useState } from 'react';
import {
  Phone, KeyRound, Sparkles, User, MapPin, Globe, Eye, EyeOff,
  ArrowRight, ArrowLeft, Sun, Moon, Monitor, AlertTriangle,
  CheckCircle2, ShieldCheck, HeartHandshake, LogIn, UserPlus
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useVoiceNarrator } from '../../context/VoiceNarratorContext';
import { useAuth } from '../../context/AuthContext';
import { SUPPORTED_LANGUAGES } from '../../i18n/languages';
import confetti from 'canvas-confetti';

export const AuthPage = ({ initialMode = 'login', onAuthSuccess }) => {
  const { currentLang, langConfig, changeLanguage, setIsLanguageModalOpen, theme, toggleTheme, t } = useLanguage();
  const { speak } = useVoiceNarrator();
  const { register, loginWithPassword, loginWithPhoneOtp } = useAuth();

  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [step, setStep] = useState('creds');     // 'creds' | 'otp'

  // Form fields
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [village, setVillage] = useState('');
  const [preferredLang, setPreferredLang] = useState(currentLang);
  const [otp, setOtp] = useState('');
  const [demoOtpNotice, setDemoOtpNotice] = useState('');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cycleTheme = () => {
    const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    toggleTheme(next);
  };

  const clearErrors = () => {
    setErrorMsg('');
  };

  const fillDemoAccount = () => {
    setPhone('9876543210');
    setPassword('Demo@1234');
    setErrorMsg('');
    speak("Demo credentials filled: 9876543210.");
  };

  // ── Handle Register ────────────────────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    clearErrors();

    if (!name.trim()) {
      const msg = t('nameRequired');
      setErrorMsg(msg);
      speak(msg);
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      const msg = t('phoneInvalid');
      setErrorMsg(msg);
      speak(msg);
      return;
    }

    if (password.length < 8) {
      const msg = t('passwordTooShort');
      setErrorMsg(msg);
      speak(msg);
      return;
    }

    if (password !== confirmPassword) {
      const msg = t('passwordMismatch');
      setErrorMsg(msg);
      speak(msg);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await register({
        phone: cleanPhone,
        password,
        name: name.trim(),
        village: village.trim() || 'Gramin',
        language: preferredLang
      });

      if (res.success) {
        changeLanguage(preferredLang, false);
        confetti({ particleCount: 75, spread: 70 });
        speak(`${t('welcome')} ${res.user.name}`);
        if (onAuthSuccess) onAuthSuccess(res.user);
      } else {
        setErrorMsg(res.message || 'Registration failed.');
        speak(res.message || 'Registration failed.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred during registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Handle Password Login (Step 1) ─────────────────────────────────────────
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    clearErrors();

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      const msg = t('phoneInvalid');
      setErrorMsg(msg);
      speak(msg);
      return;
    }

    if (!password) {
      const msg = t('passwordTooShort');
      setErrorMsg(msg);
      speak(msg);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await loginWithPassword({
        phone: cleanPhone,
        password,
        language: currentLang
      });

      if (res.success && res.requiresOtp) {
        const demoCode = res.demoOtp || '123456';
        setOtp(demoCode);
        setDemoOtpNotice(`Demo OTP: ${demoCode}`);
        setStep('otp');
        speak(res.voicePrompt || `Password verified. Your OTP is ${demoCode.split('').join(' ')}.`);
      } else {
        setErrorMsg(res.message || 'Login failed.');
        speak(res.message || 'Login failed.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred during login.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Handle OTP Verification (Step 2) ───────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    clearErrors();

    if (!otp || otp.length < 6) {
      const msg = t('otpInvalid');
      setErrorMsg(msg);
      speak(msg);
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanPhone = phone.replace(/\D/g, '');
      const res = await loginWithPhoneOtp({
        phone: cleanPhone,
        otp: otp.trim(),
        language: currentLang
      });

      if (res.success && res.user) {
        confetti({ particleCount: 75, spread: 70 });
        speak(`${t('welcome')} ${res.user.name}`);
        if (onAuthSuccess) onAuthSuccess(res.user);
      } else {
        setErrorMsg(res.message || 'Invalid or expired OTP.');
        speak(res.message || 'Invalid or expired OTP.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Verification failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF7FC] via-purple-50/40 to-[#F5EEF9] dark:from-slate-950 dark:via-[#140D24] dark:to-slate-950 flex flex-col justify-between py-6 px-4 sm:px-6 transition-colors duration-200">

      {/* Top Bar with Language Chip and Theme Toggle */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900 dark:text-purple-300">
          <Sparkles className="w-4 h-4 text-pink-500 fill-pink-500" />
          <span>WOMENTRA LEARN</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={cycleTheme}
            className="p-2.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-purple-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-purple-300 shadow-sm transition-all touch-target-large"
            title="Theme Toggle"
            aria-label="Theme Toggle"
          >
            {theme === 'light' && <Sun className="w-4 h-4 text-amber-500" />}
            {theme === 'dark' && <Moon className="w-4 h-4 text-purple-400" />}
            {theme === 'system' && <Monitor className="w-4 h-4 text-slate-500 dark:text-slate-400" />}
          </button>

          {/* Language Selector Chip */}
          <button
            onClick={() => setIsLanguageModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-purple-100 dark:border-slate-800 rounded-2xl text-xs font-bold text-purple-950 dark:text-purple-200 shadow-sm hover:border-purple-300 transition-all touch-target-large"
          >
            <span className="text-base">{langConfig.flag}</span>
            <span>{langConfig.name}</span>
            <Globe className="w-3.5 h-3.5 text-purple-600 dark:text-pink-400" />
          </button>
        </div>
      </div>

      {/* Center Auth Card */}
      <div className="max-w-md w-full mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-purple-100 dark:border-slate-800 shadow-2xl shadow-purple-500/10 space-y-6 animate-in fade-in zoom-in-95 duration-200">

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-block relative">
            <img
              src="/logo.png"
              alt="WOMENSTRA Logo"
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain mx-auto rounded-3xl shadow-xl shadow-purple-500/20 bg-white p-1 border border-purple-100 dark:border-purple-900"
              onError={(e) => { e.target.src = '/logo.svg'; }}
            />
            <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white text-[11px] font-black flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
              ✓
            </span>
          </div>

          <div>
            <h1 className="font-display font-black text-2xl sm:text-3xl tracking-widest text-womentra-gradient">
              WOMENSTRA
            </h1>
            <p className="text-xs sm:text-sm font-bold text-purple-700 dark:text-pink-300 mt-0.5">
              {t('mission')}
            </p>
          </div>

          <div className="pt-2">
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              {mode === 'login' ? t('loginTitle') : t('registerTitle')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {mode === 'login' ? t('loginDesc') : t('registerDesc')}
            </p>
          </div>
        </div>

        {/* Error Alert Message */}
        {errorMsg && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl flex items-start gap-2.5 text-rose-800 dark:text-rose-200 animate-in shake">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
            <p className="text-xs font-semibold leading-relaxed">{errorMsg}</p>
          </div>
        )}

        {/* ── 1. LOGIN MODE ─────────────────────────────────────────────────── */}
        {mode === 'login' && step === 'creds' && (
          <form onSubmit={handlePasswordLogin} className="space-y-4">

            {/* Mobile Number */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-purple-600" />
                <span>{t('phoneLabel')}</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  +91
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder={t('phonePlaceholder')}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-purple-100 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all touch-target-large"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-purple-600" />
                <span>{t('passwordLabel')}</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('passwordPlaceholder')}
                  required
                  className="w-full pl-4 pr-11 py-3.5 bg-slate-50 dark:bg-slate-800 border border-purple-100 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all touch-target-large"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1"
                  aria-label={showPassword ? t('hidePassword') : t('showPassword')}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Demo Account Quick-Fill Card */}
            <div className="p-3 bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-900/60 rounded-2xl text-left flex items-center justify-between gap-2">
              <div className="space-y-0.5">
                <p className="text-[11px] font-bold text-purple-900 dark:text-purple-200">
                  ⚡ {t('demoAccountHint')}
                </p>
                <p className="text-[10px] text-purple-700 dark:text-purple-400">
                  Pre-loaded learner account: Sunita Devi
                </p>
              </div>
              <button
                type="button"
                onClick={fillDemoAccount}
                className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-[10px] font-bold shrink-0 transition-colors"
              >
                Auto-fill
              </button>
            </div>

            {/* Login Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-womentra-gradient text-white rounded-2xl font-black text-sm shadow-xl shadow-pink-500/25 hover:opacity-95 transition-all touch-target-large active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>{isSubmitting ? t('loggingIn') : t('loginButton')}</span>
            </button>

            {/* Switch to Register */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => { setMode('register'); clearErrors(); }}
                className="text-xs font-bold text-purple-700 dark:text-pink-400 hover:underline touch-target-large py-1"
              >
                {t('noAccount')} →
              </button>
            </div>

          </form>
        )}

        {/* ── 2. LOGIN STEP 2: OTP VERIFICATION ─────────────────────────────── */}
        {mode === 'login' && step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">

            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-left space-y-1">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200 text-xs font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{t('otpStepTitle')}</span>
              </div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                {t('otpStepDesc')}
              </p>
              {demoOtpNotice && (
                <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-600 text-white font-mono font-black text-xs rounded-md">
                  {demoOtpNotice}
                </span>
              )}
            </div>

            {/* OTP Input */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-purple-600" />
                <span>{t('otpLabel')}</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder={t('otpPlaceholder')}
                required
                className="w-full text-center tracking-[0.5em] text-xl font-black py-3.5 bg-slate-50 dark:bg-slate-800 border border-purple-100 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all touch-target-large"
              />
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-womentra-gradient text-white rounded-2xl font-black text-sm shadow-xl shadow-pink-500/25 hover:opacity-95 transition-all touch-target-large active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? t('verifyingOtp') : t('verifyAndLogin')}</span>
            </button>

            {/* Back to Login */}
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => { setStep('creds'); clearErrors(); }}
                className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-purple-700 dark:hover:text-pink-400 flex items-center justify-center gap-1.5 mx-auto touch-target-large py-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t('backToLogin')}</span>
              </button>
            </div>

          </form>
        )}

        {/* ── 3. REGISTER MODE ──────────────────────────────────────────────── */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3.5 text-left">

            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-purple-600" />
                <span>{t('nameLabel')}</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('namePlaceholder')}
                required
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-purple-100 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all touch-target-large"
              />
            </div>

            {/* Mobile Phone (10 digits) */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-purple-600" />
                <span>{t('phoneLabel')}</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  +91
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder={t('phonePlaceholder')}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-purple-100 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all touch-target-large"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-purple-600" />
                <span>{t('passwordLabel')}</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('passwordPlaceholder')}
                  required
                  minLength={8}
                  className="w-full pl-4 pr-11 py-3 bg-slate-50 dark:bg-slate-800 border border-purple-100 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all touch-target-large"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1"
                  aria-label={showPassword ? t('hidePassword') : t('showPassword')}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-purple-600" />
                <span>{t('confirmPasswordLabel')}</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('confirmPasswordPlaceholder')}
                  required
                  minLength={8}
                  className="w-full pl-4 pr-11 py-3 bg-slate-50 dark:bg-slate-800 border border-purple-100 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all touch-target-large"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1"
                  aria-label={showConfirmPassword ? t('hidePassword') : t('showPassword')}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Village / Town */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-purple-600" />
                <span>{t('villageLabel')}</span>
              </label>
              <input
                type="text"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                placeholder={t('villagePlaceholder')}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-purple-100 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all touch-target-large"
              />
            </div>

            {/* Preferred Language */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-purple-600" />
                <span>{t('preferredLanguageLabel')}</span>
              </label>
              <select
                value={preferredLang}
                onChange={(e) => setPreferredLang(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-purple-100 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all touch-target-large"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name} ({lang.englishName})
                  </option>
                ))}
              </select>
            </div>

            {/* Create Account Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-womentra-gradient text-white rounded-2xl font-black text-sm shadow-xl shadow-pink-500/25 hover:opacity-95 transition-all touch-target-large active:scale-[0.98] flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isSubmitting ? t('creatingAccount') : t('createAccount')}</span>
            </button>

            {/* Switch to Login */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => { setMode('login'); clearErrors(); }}
                className="text-xs font-bold text-purple-700 dark:text-pink-400 hover:underline touch-target-large py-1"
              >
                ← {t('alreadyHaveAccount')}
              </button>
            </div>

          </form>
        )}

      </div>

      {/* Footer Info */}
      <div className="text-center text-slate-400 dark:text-slate-500 text-[11px] font-medium pt-4">
        <p>🔒 256-bit Encrypted • Safe for Rural Learners • Womentra Voice AI</p>
      </div>

    </div>
  );
};
