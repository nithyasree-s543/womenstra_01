import React, { useState, useEffect, useRef } from 'react';
import {
  Video, VideoOff, Mic, MicOff, Hand, MessageSquare, Users,
  ShieldCheck, PhoneOff, PhoneCall, PhoneForwarded, Volume2,
  Sparkles, AlertTriangle, Eye, RefreshCw, CheckCircle2, ShieldAlert
} from 'lucide-react';
import { io } from 'socket.io-client';
import { useLanguage } from '../../context/LanguageContext';
import { useVoiceNarrator } from '../../context/VoiceNarratorContext';
import { useAuth } from '../../context/AuthContext';
import { speechService } from '../../services/speechService';
import confetti from 'canvas-confetti';

const STUN_SERVERS = {
  iceServers: [
    { urls: import.meta.env.VITE_STUN_URL || 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:global.stun.twilio.com:3478' },
    ...(import.meta.env.VITE_TURN_URL ? [{
      urls: import.meta.env.VITE_TURN_URL,
      username: import.meta.env.VITE_TURN_USERNAME || '',
      credential: import.meta.env.VITE_TURN_CREDENTIAL || ''
    }] : [])
  ]
};

// Multilingual translations covering all 13 supported Indian languages + English
const PERMISSION_STRINGS = {
  en: {
    whyTitle: "Camera & Microphone Access Needed",
    whyDesc: "To connect you face-to-face with your live mentor for interactive learning, Womentra needs permission to use your camera and microphone. Your privacy is always safeguarded.",
    allowBtn: "Allow camera and microphone",
    permStatePrompt: "Status: Awaiting your permission",
    permStateGranted: "Status: Permission Granted ✓",
    permStateDenied: "Status: Permission Blocked ✕",
    notAllowedError: "Camera and microphone access is blocked. Please tap the lock / settings icon to the left of your browser address bar and choose 'Allow'.",
    notFoundError: "No camera or microphone found on this device.",
    notReadableError: "Your camera or microphone is currently in use by another app or browser tab.",
    overconstrainedError: "The requested camera settings are not supported by your device.",
    unknownError: "Unable to access camera or microphone.",
    retryBtn: "Try Again",
    audioFallbackNotice: "Camera unavailable. Switched to audio-only call mode.",
    audioFallbackBtn: "Continue with Audio Only 🎙️",
    callingMentor: "Connecting to live mentoring session...",
    mentorAvailable: "Mentor is ready. Establishing secure WebRTC connection...",
    waitingPeer: "Live room open. Waiting for mentor or peer to join...",
    connectedPeer: "Live 1:1 video connection active!",
    handRaised: "Hand raised! Mentor has been notified.",
    endCall: "End Call",
    muteMic: "Mute",
    unmuteMic: "Unmute",
    cameraOn: "Camera On",
    cameraOff: "Camera Off",
    lowBandwidthOn: "2G Audio ON",
    lowBandwidthOff: "Video Mode",
    raiseHand: "Raise Hand"
  },
  hi: {
    whyTitle: "कैमरा और माइक्रोफ़ोन की अनुमति चाहिए",
    whyDesc: "लाइव मेंटर से आमने-सामने सीखने और बात करने के लिए, वूमेंत्रा को आपके कैमरे और माइक की आवश्यकता है। आपकी गोपनीयता पूरी तरह सुरक्षित है।",
    allowBtn: "कैमरा और माइक की अनुमति दें",
    permStatePrompt: "स्थिति: आपकी अनुमति की प्रतीक्षा है",
    permStateGranted: "स्थिति: अनुमति स्वीकृत ✓",
    permStateDenied: "स्थिति: अनुमति अवरुद्ध (Blocked) ✕",
    notAllowedError: "कैमरा और माइक की अनुमति अवरुद्ध है। कृपया एड्रेस बार के बाईं ओर ताला (Lock) या सेटिंग आइकन दबाकर 'Allow' चुनें।",
    notFoundError: "इस डिवाइस में कोई कैमरा या माइक नहीं मिला।",
    notReadableError: "कैमरा या माइक किसी अन्य ऐप द्वारा उपयोग में है।",
    overconstrainedError: "डिवाइस पर यह कैमरा सेटिंग समर्थित नहीं है।",
    unknownError: "कैमरा या माइक तक पहुँचने में त्रुटि हुई।",
    retryBtn: "पुनः प्रयास करें",
    audioFallbackNotice: "कैमरा उपलब्ध नहीं है। केवल ऑडियो कॉल मोड में जारी रखा जा रहा है।",
    audioFallbackBtn: "केवल ऑडियो से जुड़ें 🎙️",
    callingMentor: "लाइव मेंटरिंग सत्र से जुड़ रहे हैं...",
    mentorAvailable: "मेंटर तैयार हैं। सुरक्षित WebRTC कनेक्शन बन रहा है...",
    waitingPeer: "लाइव रूम खुला है। मेंटर के जुड़ने की प्रतीक्षा है...",
    connectedPeer: "लाइव 1:1 वीडियो कनेक्शन स्थापित!",
    handRaised: "हाथ उठाया गया! मेंटर को सूचित कर दिया गया है।",
    endCall: "कॉल समाप्त करें",
    muteMic: "माइक बंद",
    unmuteMic: "माइक चालू",
    cameraOn: "कैमरा चालू",
    cameraOff: "कैमरा बंद",
    lowBandwidthOn: "2G ऑडियो चालू",
    lowBandwidthOff: "सामान्य वीडियो",
    raiseHand: "हाथ उठाएं"
  },
  ta: {
    whyTitle: "கேமரா மற்றும் மைக்ரோஃபோன் அனுமதி தேவை",
    whyDesc: "நேரலை வழிகாட்டியுடன் முகம்பார்த்து உரையாட, வுமன்ட்ராவுக்கு உங்கள் கேமரா மற்றும் மைக் அனுமதி தேவை. உங்கள் தனியுரிமை எப்போதும் பாதுகாப்பானது.",
    allowBtn: "கேமரா & மைக்கை அனுமதிக்கவும்",
    permStatePrompt: "நிலை: உங்கள் ஒப்புதல் தேவை",
    permStateGranted: "நிலை: அனுமதி வழங்கப்பட்டது ✓",
    permStateDenied: "நிலை: அனுமதி தடுக்கப்பட்டது ✕",
    notAllowedError: "கேமரா & மைக் தடுக்கப்பட்டுள்ளது. முகவரிப் பட்டியின் இடதுபுறம் உள்ள பூட்டு ஐகானைத் தட்டி 'Allow' என்பதைத் தேர்ந்தெடுக்கவும்.",
    notFoundError: "இந்தச் சாதனத்தில் கேமரா அல்லது மைக் காணப்படவில்லை.",
    notReadableError: "கேமரா அல்லது மைக் வேறொரு செயலியில் பயன்பாட்டில் உள்ளது.",
    overconstrainedError: "இந்தச் சாதனத்தில் கேமரா அமைப்புகள் ஆதரிக்கப்படவில்லை.",
    unknownError: "கேமரா அல்லது மைக்கை அணுக முடியவில்லை.",
    retryBtn: "மீண்டும் முயற்சிக்கவும்",
    audioFallbackNotice: "கேமரா கிடைக்கவில்லை. ஆடியோ அழைப்பு முறையில் தொடர்கிறது.",
    audioFallbackBtn: "ஆடியோ மூலம் மட்டும் இணையவும் 🎙️",
    callingMentor: "நேரலை வழிகாட்டல் அமர்வுடன் இணைகிறது...",
    mentorAvailable: "வழிகாட்டி தயார். WebRTC இணைப்பு உருவாகிறது...",
    waitingPeer: "வழிகாட்டி இணையும் வரை காத்திருக்கவும்...",
    connectedPeer: "நேரலை 1:1 வீடியோ இணைப்பு தயாராகிவிட்டது!",
    handRaised: "கை உயர்த்தப்பட்டது! வழிகாட்டிக்கு தெரிவிக்கப்பட்டது.",
    endCall: "அழைப்பை முடிக்கவும்",
    muteMic: "மைக் முடக்கு",
    unmuteMic: "மைக் இயக்கு",
    cameraOn: "கேமரா ஆன்",
    cameraOff: "கேமரா ஆஃப்",
    lowBandwidthOn: "2G ஆடியோ ஆன்",
    lowBandwidthOff: "இயல்பான வீடியோ",
    raiseHand: "கை உயர்த்தவும்"
  },
  te: {
    whyTitle: "కెమెరా మరియు మైక్రోఫోన్ అనుమతి అవసరం",
    whyDesc: "లైవ్ మెంటార్‌తో ముఖాముఖి నేర్చుకోవడానికి, మీ కెమెరా మరియు మైక్ అనుమతి అవసరం. మీ గోప్యత ఎల్లప్పుడూ సురక్షితం.",
    allowBtn: "కెమెరా మరియు మైక్ అనుమతించండి",
    permStatePrompt: "స్థితి: మీ ఆమోదం అవసరం",
    permStateGranted: "స్థితి: అనుమతి మంజూరు చేయబడింది ✓",
    permStateDenied: "స్థితి: అనుమతి నిరోధించబడింది ✕",
    notAllowedError: "కెమెరా నిరోధించబడింది. దయచేసి అడ్రస్ బార్ ఎడమవైపు ఉన్న లాక్ ఐకాన్ నొక్కి 'Allow' ఎంచుకోండి.",
    notFoundError: "ఈ పరికరంలో కెమెరా లేదా మైక్ కనుగొనబడలేదు.",
    notReadableError: "కెమెరా లేదా మైక్ వేరే యాప్‌లో ఉపయోగించబడుతోంది.",
    overconstrainedError: "ఈ పరికరంలో కెమెరా సెట్టింగ్‌లు మద్దతు ఇవ్వవు.",
    unknownError: "కెమెరా లేదా మైక్‌ని యాక్సెస్ చేయలేకపోయాము.",
    retryBtn: "మళ్లీ ప్రయత్నించండి",
    audioFallbackNotice: "కెమెరా అందుబాటులో లేదు. ఆడియో కాల్‌గా కొనసాగుతోంది.",
    audioFallbackBtn: "ఆడియో మాత్రమే కొనసాగించండి 🎙️",
    callingMentor: "లైవ్ సెషన్‌తో కనెక్ట్ అవుతోంది...",
    mentorAvailable: "మెంటార్ సిద్ధంగా ఉన్నారు...",
    waitingPeer: "మెంటార్ కనెక్ట్ అయ్యే వరకు వేచి ఉండండి...",
    connectedPeer: "లైవ్ 1:1 వీడియో కనెక్ట్ అయ్యింది!",
    handRaised: "చేయి ఎత్తారు! మెంటార్‌కు తెలియజేయబడింది.",
    endCall: "కాల్ ముగించు",
    muteMic: "మైక్ మ్యూట్",
    unmuteMic: "మైక్ ఆన్",
    cameraOn: "కెమెరా ఆన్",
    cameraOff: "కెమెరా ఆఫ్",
    lowBandwidthOn: "2G ఆడియో మోడ్ ఆన్",
    lowBandwidthOff: "సాధారణ వీడియో",
    raiseHand: "చేయి ఎత్తండి"
  },
  bn: {
    whyTitle: "ক্যামেরা এবং মাইক্রোফোনের অনুমতি প্রয়োজন",
    whyDesc: "লাইভ মেন্টরের সাথে সরাসরি ক্লাসের জন্য ক্যামেরা ও মাইকের অনুমতি দিন। আপনার গোপনীয়তা সুরক্ষিত।",
    allowBtn: "ক্যামেরা এবং মাইকের অনুমতি দিন",
    permStatePrompt: "স্থিতি: আপনার অনুমতির অপেক্ষায়",
    permStateGranted: "স্থিতি: অনুমতি দেওয়া হয়েছে ✓",
    permStateDenied: "স্থিতি: অনুমতি ব্লক করা হয়েছে ✕",
    notAllowedError: "ক্যামেরা ব্লক করা আছে। অ্যাড্রেস বারের বাম পাশের লক আইকনে ট্যাপ করে 'Allow' বেছে নিন।",
    notFoundError: "কোনো ক্যামেরা বা মাইক্রোফোন পাওয়া যায়নি।",
    notReadableError: "ক্যামেরা বা মাইক্রোফোন অন্য অ্যাপে ব্যবহৃত হচ্ছে।",
    overconstrainedError: "ডিভাইস ক্যামেরা সেটিং সমর্থন করে না।",
    unknownError: "ক্যামেরা বা মাইকে সংযোগ করা যায়নি।",
    retryBtn: "আবার চেষ্টা করুন",
    audioFallbackNotice: "ক্যামেরা পাওয়া যায়নি। অডিও কল হিসেবে চলছে।",
    audioFallbackBtn: "শুধু অডিও দিয়ে যোগ দিন 🎙️",
    callingMentor: "মেন্টরের সাথে সংযোগ করা হচ্ছে...",
    mentorAvailable: "মেন্টর প্রস্তুত। সংযোগ তৈরি হচ্ছে...",
    waitingPeer: "মেন্টর যুক্ত হওয়ার অপেক্ষা...",
    connectedPeer: "লাইভ ভিডিও সংযোগ সফল!",
    handRaised: "হাত তোলা হয়েছে!",
    endCall: "কল শেষ করুন",
    muteMic: "মিউট",
    unmuteMic: "আনমিউট",
    cameraOn: "ক্যামেরা অন",
    cameraOff: "ক্যামেরা অফ",
    lowBandwidthOn: "2G অডিও মোড অন",
    lowBandwidthOff: "সাধারণ ভিডিও",
    raiseHand: "হাত তুলুন"
  },
  mr: {
    whyTitle: "कॅमेरा आणि मायक्रोफोनची परवानगी आवश्यक",
    whyDesc: "लाइव्ह मेंटॉरशी थेट संवादासाठी कॅमेरा आणि माइकची आवश्यकता आहे. तुमची गोपनीयता सुरक्षित आहे.",
    allowBtn: "कॅमेरा आणि माइक परवानगी द्या",
    permStatePrompt: "स्थिती: संमती आवश्यक",
    permStateGranted: "स्थिती: परवानगी मंजूर ✓",
    permStateDenied: "स्थिती: परवानगी ब्लॉक केली आहे ✕",
    notAllowedError: "कॅमेरा ब्लॉक केला आहे. कृपया ॲड्रेस बारच्या डाव्या बाजूला लॉक चिन्हावर टॅप करून 'Allow' निवडा.",
    notFoundError: "कॅमेरा किंवा माइक आढळला नाही.",
    notReadableError: "कॅमेरा किंवा माइक इतर ॲपमध्ये वापरला जात आहे.",
    overconstrainedError: "कॅमेरा सेटिंग समर्थित नाही.",
    unknownError: "कॅमेऱ्यामध्ये समस्या आली आहे.",
    retryBtn: "पुन्हा प्रयत्न करा",
    audioFallbackNotice: "कॅमेरा अनुपलब्ध. केवळ ऑडिओ कॉल सुरू आहे.",
    audioFallbackBtn: "केवळ ऑडिओने सुरू ठेवा 🎙️",
    callingMentor: "मेंटॉर सत्र जोडत आहे...",
    mentorAvailable: "मेंटॉर तयार आहेत...",
    waitingPeer: "मेंटॉर जोडले जाण्याची वाट पाहत आहे...",
    connectedPeer: "लाइव्ह व्हिडिओ कॉल जोडला गेला!",
    handRaised: "हात वर केला!",
    endCall: "कॉल समाप्त करा",
    muteMic: "माइक म्यूट",
    unmuteMic: "माइक सुरू",
    cameraOn: "कॅमेरा सुरू",
    cameraOff: "कॅमेरा बंद",
    lowBandwidthOn: "2G ऑडिओ चालू",
    lowBandwidthOff: "व्हिडिओ चालू",
    raiseHand: "हात वर करा"
  },
  gu: {
    whyTitle: "કૅમેરા અને માઇક્રોફોનની મંજૂરી જરૂરી",
    whyDesc: "લાઇવ મેન્ટર સાથે જોડાવા માટે કૅમેરા અને માઇકની મંજૂરી આપો. તમારી ગોપનીયતા સુરક્ષિત છે.",
    allowBtn: "કૅમેરા અને માઇક મંજૂર કરો",
    permStatePrompt: "સ્થિતિ: તમારી સંમતિ જરૂરી",
    permStateGranted: "સ્થિતિ: મંજૂર ✓",
    permStateDenied: "સ્થિતિ: બ્લૉક કરેલ ✕",
    notAllowedError: "કૅમેરા બ્લૉક છે. કૃપા કરીને ઍડ્રેસ બારના ડાબા ખૂણે લૉક આઇકન પર ટૅપ કરી 'Allow' પસંદ કરો.",
    notFoundError: "કોઈ કૅમેરા કે માઇક મળ્યું નથી.",
    notReadableError: "કૅમેરા બીજી ઍપમાં વપરાઈ રહ્યો છે.",
    overconstrainedError: "કૅમેરા સેટિંગ્સ સપોર્ટેડ નથી.",
    unknownError: "કૅમેરા ઍક્સેસ કરવામાં ભૂલ.",
    retryBtn: "ફરી પ્રયાસ કરો",
    audioFallbackNotice: "કૅમેરા ઉપલબ્ધ નથી. ઑડિયો કૉલ તરીકે ચાલુ છે.",
    audioFallbackBtn: "માત્ર ઑડિયો સાથે ચાલુ રાખો 🎙️",
    callingMentor: "મેન્ટર સાથે કનેક્ટ થઈ રહ્યું છે...",
    mentorAvailable: "મેન્ટર તૈયાર છે...",
    waitingPeer: "જોડાવાની રાહ જોઈ રહ્યા છીએ...",
    connectedPeer: "લાઇવ વિડિયો કનેક્શન થઈ ગયું!",
    handRaised: "હાથ ઊંચો કર્યો!",
    endCall: "કૉલ પૂરો કરો",
    muteMic: "માઇક મ્યૂટ",
    unmuteMic: "માઇક ચાલુ",
    cameraOn: "કૅમેરા ચાલુ",
    cameraOff: "કૅમેરા બંધ",
    lowBandwidthOn: "2G ઑડિયો મોડ ચાલુ",
    lowBandwidthOff: "સામાન્ય વિડિઓ",
    raiseHand: "હાથ ઊંચો કરો"
  },
  kn: {
    whyTitle: "ಕ್ಯಾಮೆರಾ ಮತ್ತು ಮೈಕ್ರೊಫೋನ್ ಅನುಮತಿ ಅಗತ್ಯವಿದೆ",
    whyDesc: "ಲೈವ್ ಮೆಂಟರ್ ಜೊತೆ ಮಾತನಾಡಲು ಕ್ಯಾಮೆರಾ ಮತ್ತು ಮೈಕ್ ಅನುಮತಿ ನೀಡಿ. ನಿಮ್ಮ ಗೌಪ್ಯತೆ ಸುರಕ್ಷಿತವಾಗಿದೆ.",
    allowBtn: "ಕ್ಯಾಮೆರಾ ಮತ್ತು ಮೈಕ್ ಅನುಮತಿಸಿ",
    permStatePrompt: "ಸ್ಥಿತಿ: ಒಪ್ಪಿಗೆ ಅಗತ್ಯವಿದೆ",
    permStateGranted: "ಸ್ಥಿತಿ: ನೀಡಲಾಗಿದೆ ✓",
    permStateDenied: "ಸ್ಥಿತಿ: ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ ✕",
    notAllowedError: "ಕ್ಯಾಮೆರಾ ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ. ದಯವಿಟ್ಟು ವಿಳಾಸ ಪಟ್ಟಿಯ ಎಡಭಾಗದಲ್ಲಿರುವ ಲಾಕ್ ಐಕಾನ್ ಒತ್ತಿ 'Allow' ಆಯ್ಕೆಮಾಡಿ.",
    notFoundError: "ಯಾವುದೇ ಕ್ಯಾಮೆರಾ ಅಥವಾ ಮೈಕ್ ಕಂಡುಬಂದಿಲ್ಲ.",
    notReadableError: "ಕ್ಯಾಮೆರಾ ಬೇರೆ ಆ್ಯಪ್‌ನಲ್ಲಿ ಬಳಕೆಯಲ್ಲಿದೆ.",
    overconstrainedError: "ಕ್ಯಾಮೆರಾ ಸೆಟ್ಟಿಂಗ್‌ಗಳು ಬೆಂಬಲಿಸುವುದಿಲ್ಲ.",
    unknownError: "ಕ್ಯಾಮೆರಾ ಪ್ರವೇಶಿಸಲು ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ.",
    retryBtn: "ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ",
    audioFallbackNotice: "ಕ್ಯಾಮೆರಾ ಲಭ್ಯವಿಲ್ಲ. ಆಡಿಯೋ ಕರೆಯಾಗಿ ಮುಂದುವರಿಯುತ್ತಿದೆ.",
    audioFallbackBtn: "ಆಡಿಯೋ ಮಾತ್ರ ಮುಂದುವರಿಸಿ 🎙️",
    callingMentor: "ಲೈವ್ ಕರೆ ಸಂಪರ್ಕಿಸಲಾಗುತ್ತಿದೆ...",
    mentorAvailable: "ಮೆಂಟರ್ ಸಿದ್ಧರಾಗಿದ್ದಾರೆ...",
    waitingPeer: "ಸಂಪರ್ಕಕ್ಕಾಗಿ ಕಾಯಲಾಗುತ್ತಿದೆ...",
    connectedPeer: "ಲೈವ್ ವೀಡಿಯೊ ಸಂಪರ್ಕ ಸಿದ್ಧವಾಗಿದೆ!",
    handRaised: "ಕೈ ಎತ್ತಲಾಗಿದೆ!",
    endCall: "ಕರೆ ಮುಕ್ತಾಯ",
    muteMic: "ಮೈಕ್ ಮ್ಯೂಟ್",
    unmuteMic: "ಮೈಕ್ ಆನ್",
    cameraOn: "ಕ್ಯಾಮೆರಾ ಆನ್",
    cameraOff: "ಕ್ಯಾಮೆರಾ ಆಫ್",
    lowBandwidthOn: "2G ಆಡಿಯೋ ಆನ್",
    lowBandwidthOff: "ಸಾಮಾನ್ಯ ವೀಡಿಯೊ",
    raiseHand: "ಕೈ ಎತ್ತಿ"
  },
  ml: {
    whyTitle: "ക്യാമറയും മൈക്രോഫോണും അനുമതി ആവശ്യമാണ്",
    whyDesc: "ലൈവ് മെന്ററുമായി സംസാരിക്കാൻ ക്യാമറയ്ക്കും മൈക്കിനും അനുമതി നൽകുക. നിങ്ങളുടെ സ്വകാര്യത സുരക്ഷിതമാണ്.",
    allowBtn: "ക്യാമറയും മൈക്കും അനുവദിക്കുക",
    permStatePrompt: "നില: നിങ്ങളുടെ അനുമതി ആവശ്യമാണ്",
    permStateGranted: "നില: നൽകി ✓",
    permStateDenied: "നില: തടഞ്ഞു ✕",
    notAllowedError: "ക്യാമറ തടഞ്ഞിരിക്കുന്നു. വിലാസ ബാറിലെ ലോക്ക് ഐക്കണിൽ ക്ലിക്ക് ചെയ്ത് 'Allow' തിരഞ്ഞെടുക്കുക.",
    notFoundError: "ക്യാമറയോ മൈക്കോ കണ്ടെത്താനായില്ല.",
    notReadableError: "ക്യാമറ മറ്റൊരു ആപ്പിൽ ഉപയോഗത്തിലാണ്.",
    overconstrainedError: "ക്യാമറ ക്രമീകരണങ്ങൾ പിന്തുണയ്ക്കുന്നില്ല.",
    unknownError: "ക്യാമറ ലഭ്യമാക്കാനായില്ല.",
    retryBtn: "വീണ്ടും ശ്രമിക്കുക",
    audioFallbackNotice: "ക്യാമറ ലഭ്യമല്ല. ഓഡിയോ കോളായി തുടരുന്നു.",
    audioFallbackBtn: "ഓഡിയോ മാത്രം തുടരുക 🎙️",
    callingMentor: "മെന്ററുമായി ബന്ധിപ്പിക്കുന്നു...",
    mentorAvailable: "മെന്റർ തയ്യാറാണ്...",
    waitingPeer: "മെന്റർക്കായി കാത്തിരിക്കുന്നു...",
    connectedPeer: "ലൈവ് വീഡിയോ ബന്ധിപ്പിച്ചു!",
    handRaised: "കൈ ഉയർത്തി!",
    endCall: "കോൾ അവസാനിപ്പിക്കുക",
    muteMic: "മൈക്ക് ഓഫ്",
    unmuteMic: "മൈക്ക് ഓൺ",
    cameraOn: "ക്യാമറ ഓൺ",
    cameraOff: "ക്യാമറ ഓഫ്",
    lowBandwidthOn: "2G ഓഡിയോ ഓൺ",
    lowBandwidthOff: "സാധാരണ വീഡിയോ",
    raiseHand: "കൈ ഉയർത്തുക"
  },
  pa: {
    whyTitle: "ਕੈਮਰਾ ਅਤੇ ਮਾਈਕ੍ਰੋਫੋਨ ਦੀ ਇਜਾਜ਼ਤ ਚਾਹੀਦੀ ਹੈ",
    whyDesc: "ਲਾਈਵ ਮੈਂਟਰ ਨਾਲ ਗੱਲ ਕਰਨ ਲਈ ਕੈਮਰਾ ਅਤੇ ਮਾਈਕ ਦੀ ਇਜਾਜ਼ਤ ਦਿਓ। ਤੁਹਾਡੀ ਨਿੱਜਤਾ ਸੁਰੱਖਿਅਤ ਹੈ।",
    allowBtn: "ਕੈਮਰਾ ਅਤੇ ਮਾਈਕ ਦੀ ਇਜਾਜ਼ਤ ਦਿਓ",
    permStatePrompt: "ਸਥਿਤੀ: ਪ੍ਰਵਾਨਗੀ ਦੀ ਲੋੜ ਹੈ",
    permStateGranted: "ਸਥਿਤੀ: ਪ੍ਰਵਾਨਿਤ ✓",
    permStateDenied: "ਸਥਿਤੀ: ਰੋਕਿਆ ਗਿਆ ✕",
    notAllowedError: "ਕੈਮਰਾ ਬਲਾਕ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਐਡਰੈੱਸ ਬਾਰ ਦੇ ਖੱਬੇ ਪਾਸੇ ਲੌਕ ਆਈਕਨ 'ਤੇ ਕਲਿੱਕ ਕਰਕੇ 'Allow' ਚੁਣੋ।",
    notFoundError: "ਕੋਈ ਕੈਮਰਾ ਜਾਂ ਮਾਈਕ ਨਹੀਂ ਮਿਲਿਆ।",
    notReadableError: "ਕੈਮਰਾ ਕਿਸੇ ਹੋਰ ਐਪ ਵਿੱਚ ਵਰਤਿਆ ਜਾ ਰਿਹਾ ਹੈ।",
    overconstrainedError: "ਕੈਮਰਾ ਸੈਟਿੰਗਾਂ ਸਮਰਥਿਤ ਨਹੀਂ ਹਨ।",
    unknownError: "ਕੈਮਰਾ ਖੋਲ੍ਹਣ ਵਿੱਚ ਗਲਤੀ।",
    retryBtn: "ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ",
    audioFallbackNotice: "ਕੈਮਰਾ ਉਪਲਬਧ ਨਹੀਂ ਹੈ। ਸਿਰਫ ਆਡੀਓ ਕਾਲ ਚਾਲੂ ਹੈ।",
    audioFallbackBtn: "ਸਿਰਫ ਆਡੀਓ ਜਾਰੀ ਰੱਖੋ 🎙️",
    callingMentor: "ਕਾਲ ਮਿਲਾਈ ਜਾ ਰਹੀ ਹੈ...",
    mentorAvailable: "ਮੈਂਟਰ ਤਿਆਰ ਹਨ...",
    waitingPeer: "ਮੈਂਟਰ ਦੇ ਜੁੜਨ ਦੀ ਉਡੀਕ...",
    connectedPeer: "ਲਾਈਵ ਵੀਡੀਓ ਕਾਲ ਜੁੜ ਗਈ!",
    handRaised: "ਹੱਥ ਖੜ੍ਹਾ ਕੀਤਾ ਗਿਆ!",
    endCall: "ਕਾਲ ਸਮਾਪਤ ਕਰੋ",
    muteMic: "ਮਾਈਕ ਬੰਦ",
    unmuteMic: "ਮਾਈਕ ਚਾਲੂ",
    cameraOn: "ਕੈਮਰਾ ਚਾਲੂ",
    cameraOff: "ਕੈਮਰਾ ਬੰਦ",
    lowBandwidthOn: "2G ਆਡੀਓ ਚਾਲੂ",
    lowBandwidthOff: "ਆਮ ਵੀਡੀਓ",
    raiseHand: "ਹੱਥ ਖੜ੍ਹਾ ਕਰੋ"
  },
  or: {
    whyTitle: "କ୍ୟାମେରା ଏବଂ ମାଇକ୍ରୋଫୋନ ଅନୁମତି ଆବଶ୍ୟକ",
    whyDesc: "ଲାଇଭ୍ ମେଣ୍ଟରଙ୍କ ସହ କଥା ହେବା ପାଇଁ କ୍ୟାମେରା ଓ ମାଇକ୍ ଅନୁମତି ଦିଅନ୍ତୁ। ଆପଣଙ୍କ ଗୋପନୀୟତା ସୁରକ୍ଷିତ।",
    allowBtn: "କ୍ୟାମେରା ଏବଂ ମାଇକ୍ ଅନୁମତି ଦିଅନ୍ତୁ",
    permStatePrompt: "ସ୍ଥିତି: ଅନୁମତି ଆବଶ୍ୟକ",
    permStateGranted: "ସ୍ଥିତି: ପ୍ରଦାନ କରାଯାଇଛି ✓",
    permStateDenied: "ସ୍ଥିତି: ଅବରୋଧିତ ✕",
    notAllowedError: "କ୍ୟାମେରା ବ୍ଲକ୍ ହୋଇଛି। ଆଡ୍ରେସ୍ ବାର୍ ବାମ ପାର୍ଶ୍ୱରେ ଲକ୍ ଆଇକନ୍ କ୍ଲିକ୍ କରି 'Allow' ଚୟନ କରନ୍ତୁ।",
    notFoundError: "କୌଣସି କ୍ୟାମେରା କିମ୍ବା ମାଇକ୍ ମିଳିଲା ନାହିଁ।",
    notReadableError: "କ୍ୟାମେରା ଅନ୍ୟ ଏକ ଆପ୍ ଦ୍ୱାରା ବ୍ୟବହୃତ ହେଉଛି।",
    overconstrainedError: "କ୍ୟାମେରା ସେଟିଂ ସମର୍ଥିତ ନୁହେଁ।",
    unknownError: "କ୍ୟାମେରା ଖୋଲିବାରେ ତ୍ରୁଟି।",
    retryBtn: "ପୁନର୍ବାର ଚେଷ୍ଟା କରନ୍ତୁ",
    audioFallbackNotice: "କ୍ୟାମେରା ଉପଲବ୍ଧ ନାହିଁ। କେବଳ ଅଡିଓ କଲ୍ ଚାଲିଛି।",
    audioFallbackBtn: "କେବଳ ଅଡିଓ ସହିତ ଯୋଡ଼ନ୍ତୁ 🎙️",
    callingMentor: "ମେଣ୍ଟରଙ୍କ ସହ ଯୋଡୁଛି...",
    mentorAvailable: "ମେଣ୍ଟର ପ୍ରସ୍ତୁତ ଅଛନ୍ତି...",
    waitingPeer: "ଅପେକ୍ଷା କରୁଛି...",
    connectedPeer: "ଲାଇଭ୍ ଭିଡିଓ ସଂଯୋଗ ହୋଇଗଲା!",
    handRaised: "ହାତ ଉଠାଗଲା!",
    endCall: "କଲ୍ ଶେଷ କରନ୍ତୁ",
    muteMic: "ମାଇକ୍ ବନ୍ଦ",
    unmuteMic: "ମାଇକ୍ ଚାଲୁ",
    cameraOn: "କ୍ୟାମେରା ଅନ୍",
    cameraOff: "କ୍ୟାମେରା ଅଫ୍",
    lowBandwidthOn: "2G ଅଡିଓ ଅନ୍",
    lowBandwidthOff: "ସାଧାରଣ ଭିଡିଓ",
    raiseHand: "ହାତ ଉଠାନ୍ତୁ"
  },
  ur: {
    whyTitle: "کیمرہ اور مائیکروفون کی اجازت درکار ہے",
    whyDesc: "لائیو مینٹور سے بات کرنے کے لیے کیمرہ اور مائیک کی اجازت دیں۔ آپ کی رازداری محفوظ ہے۔",
    allowBtn: "کیمرہ اور مائیک کی اجازت دیں",
    permStatePrompt: "کیفیت: منظوری درکار ہے",
    permStateGranted: "کیفیت: منظور شدہ ✓",
    permStateDenied: "کیفیت: مسدود ✕",
    notAllowedError: "کیمرہ بلاک ہے۔ ایڈریس بار کے بائیں جانب لاک آئیکن پر کلک کرکے 'Allow' منتخب کریں۔",
    notFoundError: "کوئی کیمرہ یا مائیک نہیں ملا۔",
    notReadableError: "کیمرہ یا مائیک کسی دوسری ایپ میں زیر استعمال ہے۔",
    overconstrainedError: "کیمرہ سیٹنگز معاون نہیں ہیں۔",
    unknownError: "کیمرہ تک رسائی میں مسئلہ۔",
    retryBtn: "دوبارہ کوشش کریں",
    audioFallbackNotice: "کیمرہ دستیاب نہیں۔ صرف آڈیو کال جاری ہے۔",
    audioFallbackBtn: "صرف آڈیو جاری رکھیں 🎙️",
    callingMentor: "مینٹور سے رابطہ ہو رہا ہے...",
    mentorAvailable: "مینٹور تیار ہیں۔ رابطہ قائم ہو رہا ہے...",
    waitingPeer: "مینٹور کے شامل ہونے کا انتظار...",
    connectedPeer: "لائیو ویڈیو کال مربوط ہو گئی!",
    handRaised: "ہاتھ اٹھایا گیا!",
    endCall: "کال ختم کریں",
    muteMic: "مائیک میوٹ",
    unmuteMic: "مائیک آن",
    cameraOn: "کیمرہ آن",
    cameraOff: "کیمرہ آف",
    lowBandwidthOn: "2G آڈیو موڈ آن",
    lowBandwidthOff: "عام ویڈیو",
    raiseHand: "ہاتھ اٹھائیں"
  },
  as: {
    whyTitle: "কেমেৰা আৰু মাইক্ৰ'ফোনৰ অনুমতি প্ৰয়োজন",
    whyDesc: "লাইভ মেণ্টৰৰ সৈতে কথা পাতিবলৈ কেমেৰা আৰু মাইকৰ অনুমতি দিয়ক। আপোনাৰ গোপনীয়তা সুৰক্ষিত।",
    allowBtn: "কেমেৰা আৰু মাইকৰ অনুমতি দিয়ক",
    permStatePrompt: "স্থিতি: সন্মতি প্ৰয়োজন",
    permStateGranted: "স্থিতি: প্ৰদান কৰা হ'ল ✓",
    permStateDenied: "স্থিতি: বন্ধ কৰা হৈছে ✕",
    notAllowedError: "কেমেৰা বন্ধ কৰা হৈছে। ঠিকনা বাৰৰ বাঁওফালে থকা লক আইকনত ক্লিক কৰি 'Allow' বাছক।",
    notFoundError: "কোনো কেমেৰা বা মাইক পোৱা নগ'ল।",
    notReadableError: "কেমেৰা আন এটা এপত ব্যৱহাৰ হৈ আছে।",
    overconstrainedError: "কেমেৰাৰ ছেটিং সমৰ্থিত নহয়।",
    unknownError: "কেমেৰা সংযোগত ভুল হৈছে।",
    retryBtn: "পুনৰ চেষ্টা কৰক",
    audioFallbackNotice: "কেমেৰা উপলব্ধ নহয়। কেৱল অডিঅ' কল হিচাপে চলিছে।",
    audioFallbackBtn: "কেৱল অডিঅ'ৰে যোগ দিয়ক 🎙️",
    callingMentor: "মেণ্টৰৰ সৈতে সংযোগ কৰা হৈছে...",
    mentorAvailable: "মেণ্টৰ সাজু আছে...",
    waitingPeer: "সংযোগৰ বাবে অপেক্ষা কৰা হৈছে...",
    connectedPeer: "লাইভ ভিডিঅ' সংযোগ সফল হ'ল!",
    handRaised: "হাত দাঙিলে!",
    endCall: "কল সমাপ্ত কৰক",
    muteMic: "মাইক বন্ধ",
    unmuteMic: "মাইক অন",
    cameraOn: "কেমেৰা অন",
    cameraOff: "কেমেৰা অফ",
    lowBandwidthOn: "2G অডিঅ' অন",
    lowBandwidthOff: "সাধাৰণ ভিডিঅ'",
    raiseHand: "হাত দাঙক"
  }
};

export const LiveClassView = ({ onLeave }) => {
  const { currentLang, t } = useLanguage();
  const { speak, narrateScreen } = useVoiceNarrator();
  const { user, activeDependent } = useAuth();

  // Helper to fetch translated text in selected language with strict fallback
  const getString = (key) => {
    const dict = PERMISSION_STRINGS[currentLang] || PERMISSION_STRINGS.en;
    if (dict && dict[key]) return dict[key];
    return PERMISSION_STRINGS.en[key] || t(key) || key;
  };

  // Call States: 'explain' | 'permission' | 'calling' | 'incoming' | 'in-call' | 'ended'
  const [callState, setCallState] = useState('explain');
  const [permissionError, setPermissionError] = useState(null); // { type, message, allowAudioOnlyOption }
  const [permissionApiState, setPermissionApiState] = useState({
    camera: 'prompt', // 'prompt' | 'granted' | 'denied' | 'unknown'
    microphone: 'prompt'
  });
  const [isAudioOnlyCall, setIsAudioOnlyCall] = useState(false);
  const [audioFallbackMessage, setAudioFallbackMessage] = useState('');

  // Media Controls
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isLowBandwidthMode, setIsLowBandwidthMode] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [hasRemoteStream, setHasRemoteStream] = useState(false);

  // Caller / Callee Data
  const [incomingCallData, setIncomingCallData] = useState(null);
  const [callStatusMessage, setCallStatusMessage] = useState('');
  const [activePeerSocketId, setActivePeerSocketId] = useState(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const socketRef = useRef(null);
  const queuedCandidatesRef = useRef([]);

  // Check Permissions API on mount
  useEffect(() => {
    let isMounted = true;

    const checkBrowserPermissions = async () => {
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const cam = await navigator.permissions.query({ name: 'camera' });
          if (isMounted) setPermissionApiState(prev => ({ ...prev, camera: cam.state }));
          cam.onchange = () => {
            if (isMounted) setPermissionApiState(prev => ({ ...prev, camera: cam.state }));
          };
        } catch {
          // Camera query not supported in some browsers
        }

        try {
          const mic = await navigator.permissions.query({ name: 'microphone' });
          if (isMounted) setPermissionApiState(prev => ({ ...prev, microphone: mic.state }));
          mic.onchange = () => {
            if (isMounted) setPermissionApiState(prev => ({ ...prev, microphone: mic.state }));
          };
        } catch {
          // Microphone query not supported in some browsers
        }
      }
    };

    checkBrowserPermissions();
    return () => {
      isMounted = false;
    };
  }, []);

  // Initialize Socket.IO connection and WebRTC signaling listeners
  useEffect(() => {
    narrateScreen(t('liveClass'));

    const socket = io('/', { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.emit('register-user', {
      userId: user?.id || `user-${Date.now()}`,
      userName: user?.name || 'Sunita Devi',
      role: user?.role || 'learner'
    });

    // Incoming direct call
    socket.on('incoming-call', (data) => {
      setIncomingCallData(data);
      setActivePeerSocketId(data.callerSocketId);
      setCallState('incoming');
      speechService.playChime('ringtone');
      speak(`${data.callerName} is calling you for live video mentoring.`);
    });

    // Callee responded to our direct call
    socket.on('call-response-received', async ({ calleeName, calleeSocketId, accepted }) => {
      if (accepted) {
        setCallState('in-call');
        setActivePeerSocketId(calleeSocketId);
        setCallStatusMessage(`Connected with ${calleeName}`);
        speak(`Connected with ${calleeName}`);
        confetti({ particleCount: 50 });

        // As caller, initiate WebRTC offer
        if (localStreamRef.current && calleeSocketId) {
          initiateWebRTCOffer(calleeSocketId);
        }
      } else {
        setCallState('ended');
        setCallStatusMessage(`${calleeName} is currently unavailable.`);
        speak(`${calleeName} declined the call.`);
      }
    });

    // Room-based multi-tab or mentor/learner discovery
    socket.on('user-joined-room', async ({ socketId, userName }) => {
      console.log(`[WebRTC] Peer joined room: ${userName} (${socketId})`);
      setActivePeerSocketId(socketId);
      setCallStatusMessage(`${userName} joined the room`);
      // Initiator creates and sends offer to newly joined peer
      if (localStreamRef.current) {
        initiateWebRTCOffer(socketId);
      }
    });

    socket.on('room-peers', ({ peers }) => {
      if (peers && peers.length > 0) {
        setActivePeerSocketId(peers[0]);
      }
    });

    // WebRTC Offer received
    socket.on('webrtc-offer-received', async ({ senderSocketId, offer }) => {
      console.log('[WebRTC] Received offer from:', senderSocketId);
      setActivePeerSocketId(senderSocketId);

      const pc = getOrCreatePeerConnection(senderSocketId);
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        await processQueuedCandidates();

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit('webrtc-answer', {
          targetSocketId: senderSocketId,
          answer
        });
      } catch (err) {
        console.error('[WebRTC] Error handling offer:', err);
      }
    });

    // WebRTC Answer received
    socket.on('webrtc-answer-received', async ({ senderSocketId, answer }) => {
      console.log('[WebRTC] Received answer from:', senderSocketId);
      const pc = peerConnectionRef.current;
      if (pc) {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
          await processQueuedCandidates();
        } catch (err) {
          console.error('[WebRTC] Error handling answer:', err);
        }
      }
    });

    // WebRTC ICE Candidate received
    socket.on('webrtc-ice-candidate-received', async ({ candidate }) => {
      const pc = peerConnectionRef.current;
      if (candidate) {
        if (pc && pc.remoteDescription && pc.remoteDescription.type) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (err) {
            console.warn('[WebRTC] Error adding ICE candidate:', err);
          }
        } else {
          // Queue candidates if remoteDescription is not set yet
          queuedCandidatesRef.current.push(candidate);
        }
      }
    });

    socket.on('call-ended', () => {
      cleanupPeerConnection();
      setCallState('ended');
      setCallStatusMessage("Call ended by participant.");
      speak("The other participant has ended the call.");
    });

    socket.on('user-left-room', () => {
      setHasRemoteStream(false);
      setCallStatusMessage("Participant disconnected from the room.");
    });

    socket.on('hand-raised', ({ userName }) => {
      speak(`${userName} raised their hand with a question.`);
    });

    return () => {
      cleanupMedia();
      cleanupPeerConnection();
      if (socketRef.current) {
        socketRef.current.emit('leave-room', { roomId: 'mentorship-live' });
        socketRef.current.disconnect();
      }
    };
  }, [user]);

  // Ensure local video element binds when localStreamRef is ready or view renders
  useEffect(() => {
    if (localVideoRef.current && localStreamRef.current && isVideoOn) {
      localVideoRef.current.srcObject = localStreamRef.current;
      localVideoRef.current.play().catch(() => {});
    }
  }, [callState, isVideoOn]);

  const processQueuedCandidates = async () => {
    const pc = peerConnectionRef.current;
    if (!pc || !pc.remoteDescription) return;

    while (queuedCandidatesRef.current.length > 0) {
      const candidate = queuedCandidatesRef.current.shift();
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.warn('[WebRTC] Failed to add queued ICE candidate:', err);
      }
    }
  };

  const getOrCreatePeerConnection = (targetSocketId) => {
    if (peerConnectionRef.current && peerConnectionRef.current.signalingState !== 'closed') {
      return peerConnectionRef.current;
    }

    const pc = new RTCPeerConnection(STUN_SERVERS);
    peerConnectionRef.current = pc;

    // Attach local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    // Handle remote track
    pc.ontrack = (event) => {
      console.log('[WebRTC] Remote track received:', event.track.kind);
      setHasRemoteStream(true);
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
        remoteVideoRef.current.play().catch(() => {});
      }
    };

    // Relay local ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('webrtc-ice-candidate', {
          targetSocketId: targetSocketId || activePeerSocketId,
          candidate: event.candidate,
          roomId: 'mentorship-live'
        });
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log('[WebRTC] ICE Connection State:', pc.iceConnectionState);
      if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
        setHasRemoteStream(false);
      }
    };

    return pc;
  };

  const initiateWebRTCOffer = async (targetSocketId) => {
    try {
      const pc = getOrCreatePeerConnection(targetSocketId);
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      await pc.setLocalDescription(offer);

      if (socketRef.current) {
        socketRef.current.emit('webrtc-offer', {
          targetSocketId,
          offer
        });
      }
    } catch (err) {
      console.error('[WebRTC] Error initiating offer:', err);
    }
  };

  // Request camera and microphone permissions with proper constraints & fallbacks
  const handleRequestPermissions = async (audioOnlyFallback = false) => {
    setPermissionError(null);
    setCallState('permission');

    const constraints = audioOnlyFallback ? {
      video: false,
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    } : {
      video: true,
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;
      setIsAudioOnlyCall(audioOnlyFallback);
      setIsVideoOn(!audioOnlyFallback);
      setIsMicOn(true);

      // Immediately display user's own live camera preview
      if (localVideoRef.current && !audioOnlyFallback) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.play().catch(() => {});
      }

      setCallState('in-call');

      // Join signaling room so multi-tab or online mentor automatically connects
      if (socketRef.current) {
        socketRef.current.emit('join-room', {
          roomId: 'mentorship-live',
          userId: user?.id || `user-${Date.now()}`,
          userName: user?.name || 'Sunita Devi',
          role: user?.role || 'learner'
        });
      }

      if (audioOnlyFallback) {
        setAudioFallbackMessage(getString('audioFallbackNotice'));
        speak(getString('audioFallbackNotice'));
      } else {
        speak("Camera and microphone connected. You can see yourself now.");
      }
    } catch (err) {
      console.warn('getUserMedia error:', err.name, err.message);

      // Fallback: If camera is missing or fails, retry with audio only
      if (!audioOnlyFallback && (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError' || err.name === 'OverconstrainedError')) {
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({
            video: false,
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            }
          });
          localStreamRef.current = audioStream;
          setIsAudioOnlyCall(true);
          setIsVideoOn(false);
          setIsMicOn(true);
          setCallState('in-call');
          setAudioFallbackMessage(getString('audioFallbackNotice'));

          if (socketRef.current) {
            socketRef.current.emit('join-room', {
              roomId: 'mentorship-live',
              userId: user?.id || `user-${Date.now()}`,
              userName: user?.name || 'Sunita Devi',
              role: user?.role || 'learner'
            });
          }

          speak(getString('audioFallbackNotice'));
          return;
        } catch (audioErr) {
          console.warn('Audio fallback also failed:', audioErr.name);
        }
      }

      let errorMsg = getString('unknownError');
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg = getString('notAllowedError');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMsg = getString('notFoundError');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMsg = getString('notReadableError');
      } else if (err.name === 'OverconstrainedError' || err.name === 'ConstraintNotSatisfiedError') {
        errorMsg = getString('overconstrainedError');
      }

      setPermissionError({
        type: err.name,
        message: errorMsg,
        allowAudioOnlyOption: err.name !== 'NotAllowedError' && err.name !== 'PermissionDeniedError'
      });
      setCallState('permission');
      speak(errorMsg);
    }
  };

  const handleStartCallToMentor = () => {
    setCallState('calling');
    setCallStatusMessage(getString('callingMentor'));
    speak("Calling mentor. Please wait while connecting...");

    if (socketRef.current) {
      socketRef.current.emit('call-user', {
        callerId: user?.id || 'user-1',
        callerName: user?.name || 'Sunita Devi',
        calleeId: 'mentor-1',
        callType: 'video',
        isMinor: !!activeDependent
      });
    }

    setTimeout(() => {
      handleRequestPermissions();
    }, 1500);
  };

  const handleAcceptIncomingCall = () => {
    if (incomingCallData && socketRef.current) {
      socketRef.current.emit('call-response', {
        callerSocketId: incomingCallData.callerSocketId,
        callerId: incomingCallData.callerId,
        calleeName: user?.name || 'Sunita Devi',
        accepted: true
      });
      handleRequestPermissions();
    }
  };

  const handleDeclineIncomingCall = () => {
    if (incomingCallData && socketRef.current) {
      socketRef.current.emit('call-response', {
        callerSocketId: incomingCallData.callerSocketId,
        callerId: incomingCallData.callerId,
        calleeName: user?.name || 'Sunita Devi',
        accepted: false
      });
      setCallState('ended');
      setCallStatusMessage("Call declined.");
    }
  };

  const handleToggleMic = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      if (audioTracks.length > 0) {
        const nextState = !isMicOn;
        audioTracks[0].enabled = nextState;
        setIsMicOn(nextState);
        speak(nextState ? "Microphone unmuted" : "Microphone muted");
      }
    }
  };

  const handleToggleVideo = () => {
    if (isAudioOnlyCall) {
      speak("Camera is not available in audio-only call.");
      return;
    }
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      if (videoTracks.length > 0) {
        const nextState = !isVideoOn;
        videoTracks[0].enabled = nextState;
        setIsVideoOn(nextState);
        speak(nextState ? "Camera enabled" : "Camera turned off");
      }
    }
  };

  const handleToggleLowBandwidth = () => {
    const next = !isLowBandwidthMode;
    setIsLowBandwidthMode(next);
    if (next) {
      if (localStreamRef.current) {
        localStreamRef.current.getVideoTracks().forEach(t => (t.enabled = false));
      }
      setIsVideoOn(false);
      speak("2G Low-bandwidth audio mode active. Conserving internet.");
    } else {
      if (!isAudioOnlyCall && localStreamRef.current) {
        localStreamRef.current.getVideoTracks().forEach(t => (t.enabled = true));
        setIsVideoOn(true);
      }
      speak("Video mode restored.");
    }
  };

  const handleRaiseHand = () => {
    const next = !isHandRaised;
    setIsHandRaised(next);
    if (next) {
      if (socketRef.current) {
        socketRef.current.emit('raise-hand', {
          userName: user?.name || 'Sunita Devi',
          roomId: 'mentorship-live'
        });
      }
      confetti({ particleCount: 40 });
      speak(getString('handRaised'));
    }
  };

  const cleanupMedia = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  };

  const cleanupPeerConnection = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    queuedCandidatesRef.current = [];
    setHasRemoteStream(false);
  };

  const handleEndCall = () => {
    cleanupMedia();
    cleanupPeerConnection();

    if (socketRef.current) {
      if (activePeerSocketId) {
        socketRef.current.emit('end-call', { targetSocketId: activePeerSocketId });
      }
      socketRef.current.emit('leave-room', { roomId: 'mentorship-live' });
    }

    setCallState('ended');
    setCallStatusMessage("Call ended safely.");
    speak("Mentoring call ended safely.");
  };

  return (
    <div className="space-y-4 pb-24 max-w-4xl mx-auto px-3 sm:px-4 pt-2">

      {/* 1. Header Bar with Status and Minor Protection */}
      <div className="bg-slate-900 rounded-3xl p-4 text-white shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-black animate-pulse">
            LIVE
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black tracking-tight">
              WebRTC Mentoring Room: Dr. Ananya Sharma
            </h2>
            <p className="text-[11px] text-slate-400">
              STUN/WebRTC Signaling Online • Low Latency 2G Audio Ready
            </p>
          </div>
        </div>

        <button
          onClick={onLeave}
          className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 touch-target-large transition-colors"
        >
          <PhoneOff className="w-4 h-4" />
          <span>{getString('endCall')}</span>
        </button>
      </div>

      {/* Minor Observer Protection Notice */}
      {activeDependent && (
        <div className="p-3.5 bg-amber-500/15 border border-amber-500/30 rounded-2xl flex items-center justify-between text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-amber-600" />
            <div>
              <p className="text-xs font-bold">{t('guardianMinorNotice') || 'Guardian Protected Session'}</p>
              <p className="text-[10px] opacity-80">
                Child safety session for {activeDependent.name} (Age {activeDependent.age})
              </p>
            </div>
          </div>
          <span className="text-[10px] font-black bg-amber-500 text-white px-2 py-0.5 rounded-md">
            Protected ✓
          </span>
        </div>
      )}

      {/* 2a. EXPLAIN Screen: In user's selected language explaining camera & mic need */}
      {callState === 'explain' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-purple-100 dark:border-slate-800 shadow-xl text-center space-y-6 max-w-md mx-auto">
          <div className="w-20 h-20 rounded-3xl bg-purple-100 dark:bg-purple-950 flex items-center justify-center mx-auto text-4xl shadow-inner">
            📹
          </div>

          <div>
            <h3 className="text-lg sm:text-xl font-black text-purple-950 dark:text-white leading-tight">
              {getString('whyTitle')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2.5 leading-relaxed">
              {getString('whyDesc')}
            </p>
          </div>

          {/* Permissions API State Badge */}
          <div className="py-2 px-3 bg-purple-50 dark:bg-purple-950/50 rounded-xl border border-purple-200 dark:border-purple-900 flex items-center justify-center gap-2 text-xs font-semibold text-purple-800 dark:text-purple-300">
            {permissionApiState.camera === 'granted' ? (
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold">
                <CheckCircle2 className="w-4 h-4" /> {getString('permStateGranted')}
              </span>
            ) : permissionApiState.camera === 'denied' ? (
              <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1 font-bold">
                <ShieldAlert className="w-4 h-4" /> {getString('permStateDenied')}
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-purple-600" /> {getString('permStatePrompt')}
              </span>
            )}
          </div>

          <div className="space-y-2.5 pt-1">
            <button
              onClick={() => handleRequestPermissions(false)}
              className="w-full py-4 bg-womentra-gradient text-white rounded-2xl font-black text-sm shadow-lg shadow-pink-500/25 hover:opacity-95 transition-all touch-target-large active:scale-[0.98]"
            >
              {getString('allowBtn')} ✓
            </button>

            <button
              onClick={() => handleRequestPermissions(true)}
              className="w-full py-3 bg-purple-50 dark:bg-slate-800 hover:bg-purple-100 text-purple-900 dark:text-purple-200 rounded-2xl font-bold text-xs transition-colors"
            >
              {getString('audioFallbackBtn')}
            </button>
          </div>

          <button
            onClick={onLeave}
            className="w-full text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-bold"
          >
            {getString('endCall')}
          </button>
        </div>
      )}

      {/* 2b. Permission Loading / Specific Error Display */}
      {callState === 'permission' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-purple-100 dark:border-slate-800 shadow-xl text-center space-y-5 max-w-md mx-auto">
          <div className="w-20 h-20 rounded-3xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center mx-auto text-3xl">
            {permissionError ? '⚠️' : '📷'}
          </div>

          <div>
            <h3 className="text-lg font-black text-purple-950 dark:text-white">
              {permissionError ? 'Permission Issue' : getString('whyTitle')}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              {permissionError ? 'Please follow the instruction below to continue' : 'Requesting browser device access...'}
            </p>
          </div>

          {/* Specific error message by type: NotAllowedError, NotFoundError, NotReadableError, OverconstrainedError */}
          {permissionError && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl text-left space-y-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-rose-800 dark:text-rose-200 leading-relaxed">
                    {permissionError.message}
                  </p>
                  <p className="text-[10px] text-rose-600 dark:text-rose-400 font-mono">
                    Code: {permissionError.type}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2.5 pt-2">
            <button
              onClick={() => handleRequestPermissions(false)}
              className="w-full py-4 bg-womentra-gradient text-white rounded-2xl font-black text-sm shadow-md shadow-pink-500/20 hover:opacity-95 transition-all touch-target-large active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{getString('retryBtn')}</span>
            </button>

            {/* Audio-only fallback button */}
            <button
              onClick={() => handleRequestPermissions(true)}
              className="w-full py-3 bg-purple-100 dark:bg-slate-800 hover:bg-purple-200 text-purple-900 dark:text-purple-200 rounded-2xl font-bold text-xs transition-colors"
            >
              {getString('audioFallbackBtn')}
            </button>

            <button
              onClick={handleStartCallToMentor}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs shadow-md"
            >
              Call Assigned Mentor Directly 📞
            </button>
          </div>
        </div>
      )}

      {/* 3. Incoming Call Screen Overlay */}
      {callState === 'incoming' && incomingCallData && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border-2 border-emerald-500 shadow-2xl text-center space-y-6 max-w-md mx-auto animate-in zoom-in-95">
          <div className="w-24 h-24 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-4xl animate-bounce ring-8 ring-emerald-50">
            📞
          </div>
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-600">
              Incoming Live Mentoring Call
            </span>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
              {incomingCallData.callerName}
            </h3>
            <p className="text-xs text-slate-500">Live 1:1 Video Mentoring</p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleDeclineIncomingCall}
              className="py-3.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-2xl font-black text-xs"
            >
              Decline ✕
            </button>
            <button
              onClick={handleAcceptIncomingCall}
              className="py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs shadow-lg shadow-emerald-600/30"
            >
              Accept Call ✓
            </button>
          </div>
        </div>
      )}

      {/* 4. Active In-Call WebRTC Video Stage */}
      {callState === 'in-call' && (
        <div className="space-y-4">

          {/* Audio Fallback Notice Banner */}
          {isAudioOnlyCall && (
            <div className="p-3 bg-amber-500/15 border border-amber-500/30 rounded-2xl text-amber-900 dark:text-amber-200 text-xs font-bold flex items-center gap-2">
              <Volume2 className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{audioFallbackMessage || getString('audioFallbackNotice')}</span>
            </div>
          )}

          <div className="relative aspect-video rounded-3xl overflow-hidden bg-slate-950 border-2 border-purple-900 shadow-2xl flex items-center justify-center">

            {/* Remote Feed: Either real remote video or simulated mentor stream */}
            {hasRemoteStream ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : isLowBandwidthMode ? (
              <div className="text-center p-6 space-y-3">
                <div className="w-20 h-20 rounded-full bg-womentra-gradient flex items-center justify-center mx-auto text-3xl animate-voice-listening">
                  👩🏽‍🏫
                </div>
                <h3 className="text-base font-black text-white">Dr. Ananya Sharma (Live Audio)</h3>
                <span className="text-xs text-emerald-400 font-bold">
                  ● 2G Low Bandwidth Mode Active (Zero Lag)
                </span>
              </div>
            ) : (
              <div className="relative w-full h-full">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80"
                  alt="Mentor Video Stream"
                  className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                {/* Live Caption Subtitle Banner */}
                <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-md p-3 rounded-2xl border border-white/20 text-center">
                  <p className="text-xs sm:text-sm font-bold text-amber-300">
                    "Welcome! In today's session, let's review your HTML responsive layout project."
                  </p>
                </div>

                <div className="absolute top-4 left-4 bg-purple-900/80 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-bold text-white border border-purple-500/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>👩🏽‍🏫 Dr. Ananya Sharma (Mentor)</span>
                </div>
              </div>
            )}

            {/* Self Video PIP (Picture-In-Picture): autoplay, muted, playsInline, face visible */}
            <div className="absolute top-4 right-4 w-28 sm:w-36 aspect-video rounded-2xl overflow-hidden bg-slate-800 border-2 border-white/40 shadow-xl z-10">
              {isVideoOn && !isAudioOnlyCall ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform -scale-x-100"
                />
              ) : (
                <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center text-slate-400 text-[10px] font-bold gap-1">
                  <VideoOff className="w-5 h-5 text-slate-500" />
                  <span>Camera Off</span>
                </div>
              )}
            </div>

            {/* Connection status overlay badge */}
            <div className="absolute bottom-4 left-4 text-[10px] font-bold bg-black/60 backdrop-blur-sm text-slate-300 px-2.5 py-1 rounded-lg">
              {hasRemoteStream ? getString('connectedPeer') : getString('waitingPeer')}
            </div>

          </div>

          {/* 5. In-Call Control Dock with Large Touch Targets */}
          <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-purple-100 dark:border-slate-800 shadow-lg flex items-center justify-around gap-2">

            {/* Toggle Mic */}
            <button
              onClick={handleToggleMic}
              className={`flex flex-col items-center gap-1 p-3 rounded-2xl touch-target-large transition-all ${isMicOn
                  ? 'bg-purple-50 dark:bg-purple-950 text-purple-900 dark:text-purple-200 border border-purple-200 dark:border-purple-800'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 border border-rose-200'
                }`}
            >
              {isMicOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
              <span className="text-[10px] font-bold">{isMicOn ? getString('muteMic') : getString('unmuteMic')}</span>
            </button>

            {/* Toggle Camera */}
            <button
              onClick={handleToggleVideo}
              disabled={isAudioOnlyCall}
              className={`flex flex-col items-center gap-1 p-3 rounded-2xl touch-target-large transition-all ${isVideoOn && !isAudioOnlyCall
                  ? 'bg-purple-50 dark:bg-purple-950 text-purple-900 dark:text-purple-200 border border-purple-200 dark:border-purple-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                } ${isAudioOnlyCall ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              {isVideoOn && !isAudioOnlyCall ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
              <span className="text-[10px] font-bold">{isVideoOn && !isAudioOnlyCall ? getString('cameraOn') : getString('cameraOff')}</span>
            </button>

            {/* Raise Hand */}
            <button
              onClick={handleRaiseHand}
              className={`flex flex-col items-center gap-1 p-3 rounded-2xl touch-target-large transition-all ${isHandRaised
                  ? 'bg-amber-100 text-amber-900 border-2 border-amber-500 animate-bounce'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
            >
              <Hand className="w-6 h-6" />
              <span className="text-[10px] font-bold">{isHandRaised ? 'Hand Raised' : getString('raiseHand')}</span>
            </button>

            {/* 2G Low Bandwidth Audio Toggle */}
            <button
              onClick={handleToggleLowBandwidth}
              className={`flex flex-col items-center gap-1 p-3 rounded-2xl touch-target-large transition-all ${isLowBandwidthMode
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
            >
              <Volume2 className="w-6 h-6" />
              <span className="text-[10px] font-bold">{isLowBandwidthMode ? getString('lowBandwidthOn') : getString('lowBandwidthOff')}</span>
            </button>

            {/* End Call */}
            <button
              onClick={handleEndCall}
              className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white touch-target-large transition-all shadow-md shadow-rose-600/30"
            >
              <PhoneOff className="w-6 h-6" />
              <span className="text-[10px] font-bold">{getString('endCall')}</span>
            </button>

          </div>

        </div>
      )}

      {/* 5. Ended Screen */}
      {callState === 'ended' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-purple-100 dark:border-slate-800 shadow-md text-center space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 flex items-center justify-center mx-auto text-3xl">
            👋
          </div>
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            Mentoring Session Ended
          </h3>
          <p className="text-xs text-slate-500">
            {callStatusMessage || "Your mentoring session was completed safely."}
          </p>
          <button
            onClick={() => { setCallState('explain'); setPermissionError(null); }}
            className="w-full py-3.5 bg-womentra-gradient text-white rounded-2xl font-black text-xs shadow-md hover:opacity-95 transition-opacity"
          >
            Start New Session
          </button>
        </div>
      )}

    </div>
  );
};
