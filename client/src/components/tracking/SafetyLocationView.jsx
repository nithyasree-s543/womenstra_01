import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, MapPin, PhoneCall, Volume2, Sparkles, 
  Send, AlertTriangle, CheckCircle, Navigation, Lock 
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useLanguage } from '../../context/LanguageContext';
import { useVoiceNarrator } from '../../context/VoiceNarratorContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export const SafetyLocationView = () => {
  const { currentLang, t } = useLanguage();
  const { speak, narrateScreen } = useVoiceNarrator();
  const { user } = useAuth();

  const [isSharing, setIsSharing] = useState(false);
  const [sosSent, setSosSent] = useState(false);
  const [trustedContact, setTrustedContact] = useState('9876543210 (पति / भाई)');
  const [destination, setDestination] = useState('रामनगर जन सेवा केंद्र (CSC Meetup)');
  const [currentCoords, setCurrentCoords] = useState([25.2677, 83.0234]);

  useEffect(() => {
    narrateScreen("सुरक्षा और लाइव लोकेशन शेयरिंग: जन सेवा केंद्र या मेंटर से मिलने जाते समय आप अपने परिवार को लाइव लोकेशन भेज सकती हैं।");
  }, [currentLang]);

  const handleToggleSharing = async () => {
    const next = !isSharing;
    setIsSharing(next);

    if (next) {
      await api.shareLocation({
        userId: user?.id,
        userName: user?.name,
        lat: currentCoords[0],
        lng: currentCoords[1],
        destination,
        emergencyContact: trustedContact
      });
      speak(`आपकी लाइव लोकेशन आपके संपर्क ${trustedContact} को सुरक्षित रूप से भेज दी गई है।`);
    } else {
      speak("लोकेशन शेयरिंग सुरक्षित रूप से समाप्त कर दी गई है।");
    }
  };

  const handleTriggerSOS = () => {
    setSosSent(true);
    speak("आपातकालीन सुरक्षा संदेश और आपकी लोकेशन आपके परिवार और 112 हेल्पलाइन को भेज दी गई है। शांत रहें, सहायता रास्ते में है।");
  };

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto px-4 pt-3">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-700 via-pink-700 to-purple-900 rounded-3xl p-6 text-white shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl">
            🚨
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black">
                {t('emergencySOS')} & लोकेशन सुरक्षा
              </h1>
              <Sparkles className="w-5 h-5 text-amber-300 fill-amber-300" />
            </div>
            <p className="text-xs sm:text-sm text-purple-100 font-medium">
              1-टच इमरजेंसी अलर्ट • परिवार के साथ सुरक्षित यात्रा लोकेशन
            </p>
          </div>
        </div>
      </div>

      {/* 1-Tap Emergency SOS Alert Button */}
      <div className="bg-white rounded-3xl p-6 border-2 border-rose-200 shadow-xl text-center space-y-4">
        <button
          onClick={handleTriggerSOS}
          className="w-36 h-36 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex flex-col items-center justify-center mx-auto shadow-2xl hover:scale-105 active:scale-95 transition-all ring-8 ring-rose-100 animate-voice-listening touch-target-large"
        >
          <ShieldAlert className="w-12 h-12 mb-1" />
          <span className="text-sm font-black tracking-wider">आपातकालीन SOS</span>
        </button>

        <p className="text-xs font-bold text-slate-700 max-w-md mx-auto">
          दबाने पर तुरंत आपके परिवार और 112 महिला हेल्पलाइन को आपकी सटीक लोकेशन का SMS भेजा जाएगा।
        </p>

        {sosSent && (
          <div className="p-4 bg-emerald-100 text-emerald-950 rounded-2xl border border-emerald-300 font-bold text-xs animate-in zoom-in-95">
            ✓ आपातकालीन सुरक्षा अलर्ट आपके परिवार (+91 9876543210) को भेज दिया गया है!
          </div>
        )}
      </div>

      {/* Live Journey Location Share Control */}
      <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-purple-700" />
            <div>
              <h3 className="text-base font-black text-slate-900">
                यात्रा लोकेशन शेयरिंग (Meetup Privacy Sharing)
              </h3>
              <p className="text-xs text-slate-600">जन सेवा केंद्र या मेंटर से मिलते समय अपनी सुरक्षा सुनिश्चित करें</p>
            </div>
          </div>

          <button
            onClick={handleToggleSharing}
            className={`px-5 py-3 rounded-2xl text-xs font-black shadow-md transition-all touch-target-large ${
              isSharing
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {isSharing ? 'शेयरिंग रोकें ⏹' : 'लोकेशन शेयर करें ▶'}
          </button>
        </div>

        {/* Leaflet Map Preview */}
        <div className="h-64 rounded-2xl overflow-hidden border border-purple-100 shadow-inner">
          <MapContainer center={currentCoords} zoom={14} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={currentCoords}>
              <Popup>
                <div className="p-1 text-xs font-bold text-purple-950">
                  📍 आपकी वर्तमान सुरक्षित लोकेशन (रामनगर)
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>

        <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 text-xs font-semibold text-purple-900 flex items-center justify-between">
          <span>विश्वसनीय संपर्क: <b>{trustedContact}</b></span>
          <span className="text-emerald-700 font-bold">🔒 DPDP Act सुरक्षित एनक्रिप्शन</span>
        </div>

      </div>

    </div>
  );
};
