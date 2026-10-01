import React, { useState, useEffect } from 'react';
import { 
  CreditCard, Sparkles, Check, Volume2, ShieldCheck, 
  Gift, HeartHandshake, ArrowRight, Lock, Award 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useVoiceNarrator } from '../../context/VoiceNarratorContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import confetti from 'canvas-confetti';

export const PricingView = () => {
  const { currentLang, t } = useLanguage();
  const { speak, narrateScreen } = useVoiceNarrator();
  const { user, updateUserState } = useAuth();

  const [packages, setPackages] = useState([]);
  const [sponsorCode, setSponsorCode] = useState('');
  const [sponsorStatus, setSponsorStatus] = useState(null);
  const [selectedPkgForCheckout, setSelectedPkgForCheckout] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    narrateScreen("योजनाएं व शुल्क स्क्रीन: वोमंतरा का बुनियादी संस्करण सभी ग्रामीण बहनों के लिए सदा मुफ्त है। उन्नत मेंटरशिप के लिए एनजीओ स्पॉन्सर कोड भी मान्य है।");
    api.getPackages().then(res => {
      if (res.success) setPackages(res.packages);
    }).catch(() => {});
  }, [currentLang]);

  const handleApplySponsorCode = async (e) => {
    if (e) e.preventDefault();
    if (!sponsorCode) return;

    try {
      const res = await api.redeemSponsorCode(sponsorCode, user?.id);
      if (res.success) {
        setSponsorStatus({ success: true, message: res.message });
        confetti({ particleCount: 70 });
        speak(res.message);
        updateUserState({ package: 'pkg-premium' });
      } else {
        setSponsorStatus({ success: false, message: res.message });
        speak(res.message);
      }
    } catch {
      setSponsorStatus({ success: false, message: 'कोड मान्य नहीं है।' });
    }
  };

  const handleStartCheckout = (pkg) => {
    if (pkg.price === 0) {
      speak("यह प्लान हमेशा मुफ्त है। आपकी सभी बुनियादी सुविधाएं सक्रिय हैं।");
      return;
    }
    setSelectedPkgForCheckout(pkg);
    setPaymentSuccess(false);
    speak(`${pkg.name} प्लान के लिए ₹${pkg.price} का सुरक्षित रेजरपे टेस्ट चेकआउट खुल रहा है।`);
  };

  const handleSimulateRazorpaySuccess = async () => {
    if (!selectedPkgForCheckout) return;
    setIsProcessingPayment(true);
    try {
      const res = await api.verifyPayment({
        packageId: selectedPkgForCheckout.id,
        orderId: `order_${Date.now()}`,
        paymentId: `pay_test_${Date.now()}`,
        userId: user?.id || 'user-1'
      });

      if (res.success) {
        setPaymentSuccess(true);
        confetti({ particleCount: 80, spread: 70 });
        speak("भुगतान सफल रहा! आपका प्रीमियम पैकेज सक्रिय हो गया है।");
        updateUserState({ package: selectedPkgForCheckout.id });
      }
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="space-y-6 pb-24 max-w-5xl mx-auto px-4 pt-3">
      
      {/* Header */}
      <div className="bg-womentra-gradient rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl">
            💳
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black">
                {t('pricing')} (Packages & Pricing)
              </h1>
              <Sparkles className="w-5 h-5 text-amber-300 fill-amber-300" />
            </div>
            <p className="text-xs sm:text-sm text-purple-100 font-medium">
              स्पष्ट शुल्क • शून्य छिपा हुआ खर्च • NGO/सरकारी प्रायोजित मुफ्त कोड
            </p>
          </div>
        </div>
      </div>

      {/* NGO / CSR Sponsor Code Box */}
      <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-amber-50 rounded-3xl p-5 border-2 border-purple-200 shadow-md space-y-3">
        <div className="flex items-center gap-2 text-purple-950">
          <Gift className="w-5 h-5 text-pink-600" />
          <h3 className="text-sm font-black">
            एनजीओ / ग्राम पंचायत स्पॉन्सर कोड (Free NGO Sponsor Code):
          </h3>
        </div>
        <p className="text-xs text-purple-800 font-medium">
          अगर आपके पास ग्राम संगठन या CSR संस्था का कोड है, तो यहाँ दर्ज करके मुफ्त में 1:1 लाइव मेंटरशिप पाएं।
        </p>

        <form onSubmit={handleApplySponsorCode} className="flex flex-col sm:flex-row items-center gap-2">
          <input
            type="text"
            value={sponsorCode}
            onChange={(e) => setSponsorCode(e.target.value.toUpperCase())}
            placeholder="डेमो कोड: SAKHI2026 या NRLM_FREE"
            className="w-full sm:w-auto flex-1 px-4 py-3 bg-white border border-purple-300 rounded-2xl text-xs font-bold uppercase tracking-wider outline-hidden"
          />
          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-3 bg-purple-900 hover:bg-purple-950 text-white rounded-2xl text-xs font-bold shadow-md touch-target-large"
          >
            लागू करें (Redeem Code)
          </button>
        </form>

        {sponsorStatus && (
          <p className={`text-xs font-bold p-3 rounded-xl ${
            sponsorStatus.success ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-rose-100 text-rose-900 border border-rose-300'
          }`}>
            {sponsorStatus.message}
          </p>
        )}
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className={`bg-white rounded-3xl p-6 border flex flex-col justify-between transition-all ${
              pkg.popular
                ? 'border-pink-500 ring-2 ring-pink-400 shadow-xl scale-[1.02]'
                : 'border-purple-100 shadow-md'
            }`}
          >
            <div>
              {pkg.popular && (
                <span className="px-3 py-1 bg-pink-600 text-white text-[10px] font-black rounded-full uppercase tracking-wider mb-2 inline-block">
                  सबसे लोकप्रिय (Most Popular)
                </span>
              )}

              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900">{pkg.nameHi || pkg.name}</h3>
                <button
                  onClick={() => speak(`${pkg.name} पैकेज। कीमत: ${pkg.price === 0 ? 'सदा मुफ्त' : `₹${pkg.price} ${pkg.period}`}.`)}
                  className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-xl"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-3 mb-2 flex items-baseline gap-1">
                <span className="text-3xl font-black text-purple-950">
                  {pkg.price === 0 ? '₹ 0' : `₹ ${pkg.price}`}
                </span>
                <span className="text-xs font-semibold text-slate-500">/{pkg.period}</span>
              </div>

              <p className="text-xs text-purple-800 font-bold mb-4">{pkg.tagline}</p>

              {/* Feature Checklist */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                {pkg.features?.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs font-semibold text-slate-700">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleStartCheckout(pkg)}
              className={`mt-6 w-full py-3.5 rounded-2xl font-black text-xs shadow-md transition-all touch-target-large ${
                pkg.price === 0
                  ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  : 'bg-womentra-gradient text-white shadow-pink-500/20 hover:opacity-95'
              }`}
            >
              {pkg.price === 0 ? 'सक्रिय है (Active Free)' : 'चुनें व आगे बढ़ें →'}
            </button>

          </div>
        ))}
      </div>

      {/* Razorpay Test Checkout Modal */}
      {selectedPkgForCheckout && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-purple-100 p-6 space-y-4 animate-in zoom-in-95">
            
            {!paymentSuccess ? (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-purple-700" />
                    <h3 className="text-base font-black text-slate-900">
                      Razorpay सुरक्षित चेकआउट (Test Mode)
                    </h3>
                  </div>
                  <button onClick={() => setSelectedPkgForCheckout(null)} className="text-slate-400">✕</button>
                </div>

                <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 space-y-1">
                  <p className="text-xs text-purple-700 font-bold">चयनित पैकेज:</p>
                  <p className="text-base font-black text-purple-950">{selectedPkgForCheckout.name}</p>
                  <p className="text-2xl font-black text-pink-700 mt-2">₹ {selectedPkgForCheckout.price}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 font-medium">
                  💳 UPI (PhonePe, GooglePay, BHIM) • कार्ड • नेटबैंकिंग सुरक्षित एनक्रिप्शन
                </div>

                <button
                  onClick={handleSimulateRazorpaySuccess}
                  disabled={isProcessingPayment}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm shadow-md"
                >
                  {isProcessingPayment ? 'भुगतान सत्यापित हो रहा है...' : `₹ ${selectedPkgForCheckout.price} का भुगतान पूरा करें (Test Mode) ✓`}
                </button>
              </>
            ) : (
              <div className="text-center py-4 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-3xl animate-bounce">
                  ✓
                </div>
                <h3 className="text-xl font-black text-slate-900">भुगतान सफल!</h3>
                <p className="text-xs text-slate-600">
                  बधाई हो! आपका {selectedPkgForCheckout.name} सक्रिय हो चुका है। अब आप असीमित लाइव क्लास ले सकती हैं।
                </p>
                <button
                  onClick={() => setSelectedPkgForCheckout(null)}
                  className="w-full py-3 bg-womentra-gradient text-white rounded-2xl font-bold text-xs"
                >
                  पूर्ण (Done)
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
