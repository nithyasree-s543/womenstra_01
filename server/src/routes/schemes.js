import express from 'express';
import { db } from '../db/store.js';

const router = express.Router();

// 1. Get all government schemes
router.get('/', (req, res) => {
  const { category, search } = req.query;
  let schemes = db.get('schemes');

  if (category && category !== 'all') {
    schemes = schemes.filter(s => s.category === category);
  }

  if (search) {
    const q = search.toLowerCase();
    schemes = schemes.filter(s => 
      s.title.toLowerCase().includes(q) || 
      (s.titleHi && s.titleHi.includes(q)) || 
      s.tagline.toLowerCase().includes(q)
    );
  }

  return res.json({ success: true, schemes });
});

// 2. Get scheme by ID
router.get('/:id', (req, res) => {
  const scheme = db.find('schemes', s => s.id === req.params.id);
  if (!scheme) {
    return res.status(404).json({ success: false, message: 'Scheme not found' });
  }
  return res.json({ success: true, scheme });
});

// 3. Simple voice-driven eligibility check
router.post('/check-eligibility', (req, res) => {
  const { schemeId, age, gender = 'female', isShgMember, isPregnant, annualIncome, hasGirlChild } = req.body;
  const scheme = db.find('schemes', s => s.id === schemeId);

  if (!scheme) {
    return res.status(404).json({ success: false, message: 'Scheme not found' });
  }

  let isEligible = true;
  const reasons = [];
  const nextActions = [];

  const parsedAge = Number(age) || 25;

  if (scheme.id === 'pmmvvy') {
    if (gender !== 'female') {
      isEligible = false;
      reasons.push('This scheme is exclusively for expectant and lactating women.');
    } else {
      reasons.push('Eligible for ₹5,000 cash grant across 3 stages.');
      nextActions.push('Visit nearest Anganwadi center with MCP card & Aadhaar.');
    }
  } else if (scheme.id === 'lakhpati-didi') {
    if (parsedAge < 18 || parsedAge > 60) {
      isEligible = false;
      reasons.push('Age must be between 18 and 60 years.');
    } else {
      reasons.push('Eligible for interest-subsidized loan up to ₹5 Lakh & Drone/Solar training.');
      nextActions.push('Join or verify your Self Help Group (SHG) membership with village Gram Sangathan.');
    }
  } else if (scheme.id === 'sukanya-samriddhi') {
    reasons.push('Eligible for 8.2% annual interest post office account for daughters under 10.');
    nextActions.push('Open account at Post Office with daughter\'s birth certificate and ₹250 initial deposit.');
  } else {
    reasons.push('Basic criteria matched for rural applicant.');
    nextActions.push('Proceed to auto-fill application form with CSC.');
  }

  return res.json({
    success: true,
    schemeId: scheme.id,
    schemeTitle: scheme.title,
    isEligible,
    reasons,
    nextActions,
    documentsNeeded: scheme.documents,
    voiceAdvice: isEligible
      ? `बधाई हो! आप ${scheme.titleHi || scheme.title} के लिए पात्र हैं। इसके लिए जरूरी कागजात लेकर नजदीकी जन सेवा केंद्र जाएं।`
      : `इस योजना के लिए पात्रता नियम थोड़े अलग हैं। दीदी आपके लिए दूसरी उपयुक्त योजनाएं ढूंढ रही हैं।`
  });
});

// 4. Submit Scheme Application
router.post('/apply', (req, res) => {
  const { userId, schemeId, applicantName, aadhaarLast4, village, phone } = req.body;
  const scheme = db.find('schemes', s => s.id === schemeId);

  if (!scheme) {
    return res.status(404).json({ success: false, message: 'Scheme not found' });
  }

  const application = {
    id: `app-${Date.now()}`,
    userId: userId || 'user-1',
    schemeId,
    schemeTitle: scheme.title,
    applicantName: applicantName || 'Sunita Devi',
    aadhaarToken: `XXXX-XXXX-${aadhaarLast4 || '8921'}`,
    phone: phone || '9876543210',
    village: village || 'Ramnagar',
    status: 'submitted',
    trackingNumber: `WOM-${scheme.id.toUpperCase().slice(0, 5)}-${Math.floor(1000 + Math.random() * 9000)}`,
    appliedAt: new Date().toISOString(),
    currentStage: 'Document verification at Block Center',
    estimatedPayoutDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    nearestCSC: 'Ramnagar Jan Seva Kendra (Near Ancient Shiva Temple)'
  };

  db.insert('schemeApplications', application);

  return res.json({
    success: true,
    message: 'Application registered successfully. CSC agent notified.',
    application
  });
});

// 5. Get My Applications
router.get('/my-applications', (req, res) => {
  const { userId = 'user-1' } = req.query;
  const applications = db.filter('schemeApplications', a => a.userId === userId);
  return res.json({ success: true, applications });
});

// 6. Get Nearby CSC Centers
router.get('/csc/locations', (req, res) => {
  const centers = db.get('cscCenters');
  return res.json({ success: true, centers });
});

export default router;
