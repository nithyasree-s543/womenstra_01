import express from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db/store.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'womentra_secure_dev_jwt_secret_2026';

// Store OTPs temporarily in memory
const OTP_STORE = new Map();

// Helper to generate a 6-digit OTP
const generateOTP = () => '123456'; // Default predictable OTP for easy demo testing, with voice readback

// 1. Send OTP (voice-readable)
router.post('/send-otp', (req, res) => {
  const { phone, language = 'hi' } = req.body;
  if (!phone || phone.length < 10) {
    return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit mobile number' });
  }

  const otp = generateOTP();
  OTP_STORE.set(phone, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

  // In production, send via SMS gateway (e.g. Twilio / Gupshup / CDAC SMS)
  console.log(`[AUTH] Sent OTP ${otp} to phone ${phone}`);

  return res.json({
    success: true,
    message: 'OTP sent successfully to your mobile',
    demoOtp: otp,
    voicePrompt: language === 'hi' 
      ? `आपका 6 अंकों का ओटीपी है: ${otp.split('').join(' ')}`
      : `Your 6 digit OTP is: ${otp.split('').join(' ')}`
  });
});

// 2. Verify OTP and login/create user
router.post('/verify-otp', (req, res) => {
  const { phone, otp, name, village, language = 'hi' } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ success: false, message: 'Phone and OTP are required' });
  }

  // Verify OTP (accept 123456 or stored OTP)
  const stored = OTP_STORE.get(phone);
  if (otp !== '123456' && (!stored || stored.otp !== otp)) {
    return res.status(400).json({ success: false, message: 'Invalid or expired OTP. Please try again or use 123456' });
  }

  let user = db.find('users', u => u.phone === phone);

  if (!user) {
    user = {
      id: `user-${Date.now()}`,
      phone,
      name: name || 'Sakhi Didi',
      age: 26,
      gender: 'female',
      state: 'Uttar Pradesh',
      district: 'Varanasi',
      village: village || 'Gramin',
      language,
      literacyLevel: 'beginner',
      interests: ['sewing', 'digital_payments'],
      goals: ['Empower family', 'Learn smart phone use'],
      streak: 1,
      points: 100,
      badges: ['Pratham Kadam'],
      package: 'free',
      assignedMentorId: 'mentor-1',
      dependentsCount: 0,
      createdAt: new Date().toISOString()
    };
    db.insert('users', user);
  }

  const token = jwt.sign({ id: user.id, phone: user.phone, role: user.role || 'user' }, JWT_SECRET, { expiresIn: '30d' });

  return res.json({
    success: true,
    token,
    user
  });
});

// 3. Voice-assisted profile onboarding
router.post('/voice-onboard', (req, res) => {
  const { userId, name, age, village, state, interests, goals, language } = req.body;
  
  const updatedUser = db.update('users', u => u.id === userId, existing => ({
    ...existing,
    ...(name && { name }),
    ...(age && { age: Number(age) }),
    ...(village && { village }),
    ...(state && { state }),
    ...(interests && { interests }),
    ...(goals && { goals }),
    ...(language && { language }),
    points: (existing.points || 0) + 50,
    badges: Array.from(new Set([...(existing.badges || []), 'Pehchan Patra']))
  }));

  if (!updatedUser) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  return res.json({
    success: true,
    message: 'Profile completed successfully by voice',
    user: updatedUser
  });
});

// 4. Get Current User Profile
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.find('users', u => u.id === decoded.id || u.phone === decoded.phone);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.json({ success: true, user });
  } catch {
    return res.status(401).json({ success: false, message: 'Session expired or invalid' });
  }
});

// 5. Add / Link Dependent (Child / Sister)
router.post('/dependents', (req, res) => {
  const { userId, name, age, relationship, learningGoal, assignedMentorId } = req.body;
  if (!userId || !name) {
    return res.status(400).json({ success: false, message: 'Missing dependent details' });
  }

  const newDep = {
    id: `dep-${Date.now()}`,
    userId,
    name,
    age: Number(age) || 10,
    relationship: relationship || 'daughter',
    learningGoal: learningGoal || 'School basics & English',
    assignedMentorId: assignedMentorId || 'mentor-2',
    progressPct: 0,
    createdAt: new Date().toISOString()
  };

  db.insert('dependents', newDep);
  db.update('users', u => u.id === userId, u => ({ ...u, dependentsCount: (u.dependentsCount || 0) + 1 }));

  return res.json({ success: true, dependent: newDep });
});

export default router;
