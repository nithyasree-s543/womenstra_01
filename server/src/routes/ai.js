import express from 'express';
import { db } from '../db/store.js';

const router = express.Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

// Fallback intelligent response generator for rural queries in Indian languages
const generateLocalDidiResponse = (prompt, language = 'hi') => {
  const p = prompt.toLowerCase();

  if (p.includes('scheme') || p.includes('yojana') || p.includes('योजना') || p.includes('पैसा') || p.includes('sarkari')) {
    return {
      text: language === 'hi' 
        ? "नमस्ते दीदी! सरकार आपके लिए कई योजनाएं चलाती है। जैसे गर्भवती बहनों के लिए मातृ वंदना योजना (₹5,000), बेटियों के लिए सुकन्या समृद्धि (8.2% ब्याज), और स्वयं सहायता समूह के लिए लखपति दीदी योजना। आप 'सरकारी साथी' बटन दबाकर सीधे आवेदन कर सकती हैं।"
        : "Namaste Didi! Government has great schemes for you: Matru Vandana Yojana (₹5,000 for mothers), Sukanya Samriddhi (8.2% for daughters), and Lakhpati Didi for SHG business loans. Tap 'Sarkari Saathi' to check eligibility!",
      action: "NAVIGATE_SCHEMES",
      voiceSpeed: 0.95
    };
  }

  if (p.includes('silai') || p.includes('tailor') || p.includes('सिलाई') || p.includes('course') || p.includes('कोर्स') || p.includes('seekhna')) {
    return {
      text: language === 'hi'
        ? "सिलाई और बुटीक का काम सीखने से आप घर बैठे ₹15,000 से ₹25,000 महीना कमा सकती हैं। हमारे पास ब्लाउज कटिंग और माप लेने का बहुत आसान ऑडियो-वीडियो कोर्स है। क्या मैं आपके लिए सिलाई कोर्स शुरू करूं?"
        : "Learning tailoring can help you earn ₹15,000 to ₹25,000 from home. We have an easy step-by-step tailoring course with audio guidance. Shall I start it for you?",
      action: "NAVIGATE_COURSES",
      voiceSpeed: 0.95
    };
  }

  if (p.includes('mentor') || p.includes('tutor') || p.includes('दीदी') || p.includes('madad') || p.includes('help')) {
    return {
      text: language === 'hi'
        ? "आपकी सहायता के लिए डॉ. अनन्या शर्मा आपकी समर्पित मार्गदर्शक (मेंटर) हैं। आप उनसे सीधे ऑडियो कॉल पर बात कर सकती हैं या लाइव क्लास में सवाल पूछ सकती हैं।"
        : "Dr. Ananya Sharma is your dedicated mentor. You can voice chat with her anytime or join her upcoming live class today.",
      action: "NAVIGATE_MENTORS",
      voiceSpeed: 0.95
    };
  }

  if (p.includes('fraud') || p.includes('upi') || p.includes('pin') || p.includes('scam') || p.includes('सुरक्षा')) {
    return {
      text: language === 'hi'
        ? "ध्यान दें दीदी! किसी भी फोन कॉल पर अपना 4 या 6 अंकों का UPI पिन या OTP कभी न बताएं। पैसे प्राप्त करने के लिए कभी पिन डालने की आवश्यकता नहीं होती!"
        : "Important alert: Never share your UPI PIN or OTP on phone. You NEVER need to enter PIN to receive money!",
      action: "NAVIGATE_DIGITAL_SAFETY",
      voiceSpeed: 0.95
    };
  }

  return {
    text: language === 'hi'
      ? "नमस्ते दीदी! मैं आपकी 'वोमंतरा दीदी' हूँ। आप मुझसे बोलकर कोई भी सवाल पूछ सकती हैं — जैसे सरकारी योजनाएं, सिलाई का काम, फोन चलाना, या अपनी मेंटर से बात करना।"
      : "Namaste Didi! I am your Womentra Didi. You can speak to me anytime to explore government schemes, vocational skills, smartphone safety, or live classes.",
    action: "STAY_ON_PAGE",
    voiceSpeed: 0.95
  };
};

// 1. Voice Assistant ("Womentra Didi")
router.post('/didi-voice-assist', async (req, res) => {
  const { prompt, language = 'hi', userContext } = req.body;

  if (!prompt) {
    return res.status(400).json({ success: false, message: 'Please speak or provide a prompt' });
  }

  // If Gemini API Key is configured in environment, call Google Gemini 1.5/2.0 API
  if (GEMINI_API_KEY && GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE') {
    try {
      const systemInstruction = `You are 'Womentra Didi', a warm, highly empathetic, empowering voice companion for rural women in India (including first-time smartphone users and zero-literacy women).
Rules:
1. Speak in very simple, jargon-free ${language === 'hi' ? 'Hindi (Devanagari/simple spoken)' : 'English or local language'}.
2. Keep answers concise (2 to 4 sentences maximum) because your answer is spoken out loud.
3. Be encouraging, warm ("दीदी", "सखी").
4. If asked about government schemes, suggest verifiable facts (PMMVY, Sukanya Samriddhi, Lakhpati Didi, Mudra Loan).
5. Never invent false phone numbers or fake scheme deadlines.`;

      const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
      
      const response = await fetch(geminiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemInstruction}\n\nUser Question: ${prompt}` }]
            }
          ],
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 200
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (replyText) {
          return res.json({
            success: true,
            reply: replyText.trim(),
            source: 'gemini-live',
            action: prompt.toLowerCase().includes('scheme') ? 'NAVIGATE_SCHEMES' : 'STAY_ON_PAGE'
          });
        }
      }
    } catch (err) {
      console.warn('Gemini API call failed, falling back to local Didi engine:', err.message);
    }
  }

  // Robust fallback engine
  const fallback = generateLocalDidiResponse(prompt, language);
  return res.json({
    success: true,
    reply: fallback.text,
    action: fallback.action,
    source: 'womentra-local-engine'
  });
});

// 2. Simplify Complex Government/Financial Text
router.post('/simplify-content', (req, res) => {
  const { text, language = 'hi' } = req.body;
  const simplified = language === 'hi'
    ? `सरल शब्दों में: ${text.slice(0, 100)}... इस योजना में आपको सरकार से सीधी सहायता मिलती है।`
    : `In simple words: Government directly deposits support in your bank account with zero middlemen.`;

  return res.json({ success: true, simplified });
});

export default router;
