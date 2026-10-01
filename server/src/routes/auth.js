import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from '../db/store.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'womentra_secure_dev_jwt_secret_2026';
const BCRYPT_ROUNDS = 10;

// Store OTPs temporarily in memory (keyed by phone)
const OTP_STORE = new Map();

// Helper to generate a 6-digit OTP (always 123456 in demo mode)
const generateOTP = () => '123456';

// Voice prompts keyed by language code
const OTP_VOICE_PROMPTS = {
  en: (otp) => `Your 6-digit OTP is: ${otp.split('').join(' ')}`,
  hi: (otp) => `आपका 6 अंकों का ओटीपी है: ${otp.split('').join(' ')}`,
  ta: (otp) => `உங்கள் 6 இலக்க OTP: ${otp.split('').join(' ')}`,
  te: (otp) => `మీ 6 అంకెల OTP: ${otp.split('').join(' ')}`,
  bn: (otp) => `আপনার 6 সংখ্যার OTP: ${otp.split('').join(' ')}`,
  mr: (otp) => `तुमचा 6 अंकी OTP: ${otp.split('').join(' ')}`,
  gu: (otp) => `તમારો 6 અંકનો OTP: ${otp.split('').join(' ')}`,
  kn: (otp) => `ನಿಮ್ಮ 6 ಅಂಕಿ OTP: ${otp.split('').join(' ')}`,
  ml: (otp) => `നിങ്ങളുടെ 6 അക്ക OTP: ${otp.split('').join(' ')}`,
};

// ─── 1. REGISTER (name + phone + password) ────────────────────────────────────
router.post('/register', async (req, res) => {
  const { phone, password, name, village, language = 'en' } = req.body;

  // Validation
  if (!phone || phone.length < 10) {
    return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit mobile number.' });
  }
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Full name is required.' });
  }
  if (!password || password.length < 8) {
    return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
  }

  // Check if phone already registered
  const existing = db.find('users', u => u.phone === phone);
  if (existing) {
    return res.status(409).json({ success: false, message: 'This phone number is already registered. Please login.' });
  }

  const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const user = {
    id: `user-${Date.now()}`,
    phone,
    passwordHash: hashedPassword,
    name: name.trim(),
    village: village || 'Gramin',
    language,
    age: null,
    gender: 'female',
    state: '',
    district: '',
    literacyLevel: 'beginner',
    interests: [],
    goals: [],
    streak: 0,
    points: 50,
    badges: ['Pratham Kadam'],
    package: 'free',
    assignedMentorId: 'mentor-1',
    dependentsCount: 0,
    createdAt: new Date().toISOString()
  };

  db.insert('users', user);

  const token = jwt.sign(
    { id: user.id, phone: user.phone, role: user.role || 'user' },
    JWT_SECRET,
    { expiresIn: '30d' }
  );

  // Return user without passwordHash
  const { passwordHash: _, ...safeUser } = user;

  console.log(`[AUTH] New user registered: ${name} (${phone})`);
  return res.status(201).json({ success: true, token, user: safeUser });
});

// ─── 2. LOGIN (phone + password, then OTP step) ───────────────────────────────
router.post('/login', async (req, res) => {
  const { phone, password, language = 'en' } = req.body;

  if (!phone || !password) {
    return res.status(400).json({ success: false, message: 'Phone number and password are required.' });
  }

  const user = db.find('users', u => u.phone === phone);

  // If user has no passwordHash (legacy OTP-only user) - allow OTP flow
  if (!user) {
    return res.status(401).json({ success: false, message: 'No account found. Please register first.' });
  }

  // If legacy user (no password), allow them to set one or use OTP
  if (!user.passwordHash) {
    // Legacy users created with OTP-only — send OTP to verify
    const otp = generateOTP();
    OTP_STORE.set(phone, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });
    const promptFn = OTP_VOICE_PROMPTS[language] || OTP_VOICE_PROMPTS.en;
    return res.json({
      success: true,
      requiresOtp: true,
      message: 'OTP sent. Enter it to login.',
      demoOtp: otp,
      voicePrompt: promptFn(otp)
    });
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    return res.status(401).json({ success: false, message: 'Incorrect password. Please try again.' });
  }

  // Issue OTP for second factor
  const otp = generateOTP();
  OTP_STORE.set(phone, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });
  const promptFn = OTP_VOICE_PROMPTS[language] || OTP_VOICE_PROMPTS.en;

  console.log(`[AUTH] Login OTP ${otp} for ${phone}`);
  return res.json({
    success: true,
    requiresOtp: true,
    message: 'Password verified. OTP sent.',
    demoOtp: otp,
    voicePrompt: promptFn(otp)
  });
});

// ─── 3. VERIFY OTP (final auth step) ─────────────────────────────────────────
router.post('/verify-otp', async (req, res) => {
  const { phone, otp, name, village, language = 'en', password } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ success: false, message: 'Phone and OTP are required.' });
  }

  // Accept the stored OTP or the universal demo code
  const stored = OTP_STORE.get(phone);
  const isValid = otp === '123456' || (stored && stored.otp === otp && Date.now() < stored.expiresAt);
  if (!isValid) {
    return res.status(400).json({ success: false, message: 'Invalid or expired OTP. Please try again or use 123456.' });
  }

  OTP_STORE.delete(phone);

  let user = db.find('users', u => u.phone === phone);

  if (!user) {
    // OTP-only registration path (for demo quick-login)
    const hashedPassword = password ? await bcrypt.hash(password, BCRYPT_ROUNDS) : undefined;
    user = {
      id: `user-${Date.now()}`,
      phone,
      ...(hashedPassword && { passwordHash: hashedPassword }),
      name: name || 'Sakhi Didi',
      village: village || 'Gramin',
      language,
      age: null,
      gender: 'female',
      state: '',
      district: '',
      literacyLevel: 'beginner',
      interests: [],
      goals: [],
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

  const token = jwt.sign(
    { id: user.id, phone: user.phone, role: user.role || 'user' },
    JWT_SECRET,
    { expiresIn: '30d' }
  );

  const { passwordHash: _, ...safeUser } = user;
  return res.json({ success: true, token, user: safeUser });
});

// ─── 4. SEND OTP (standalone, for legacy OTP-only flow) ─────────────────────
router.post('/send-otp', (req, res) => {
  const { phone, language = 'en' } = req.body;
  if (!phone || phone.length < 10) {
    return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit mobile number.' });
  }

  const otp = generateOTP();
  OTP_STORE.set(phone, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

  console.log(`[AUTH] Sent OTP ${otp} to phone ${phone}`);
  const promptFn = OTP_VOICE_PROMPTS[language] || OTP_VOICE_PROMPTS.en;
  return res.json({
    success: true,
    message: 'OTP sent successfully.',
    demoOtp: otp,
    voicePrompt: promptFn(otp)
  });
});

// ─── 5. VOICE-ASSISTED PROFILE ONBOARDING ─────────────────────────────────────
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
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  const { passwordHash: _, ...safeUser } = updatedUser;
  return res.json({ success: true, message: 'Profile completed successfully.', user: safeUser });
});

// ─── 6. GET CURRENT USER (protected) ─────────────────────────────────────────
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Not authenticated.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.find('users', u => u.id === decoded.id || u.phone === decoded.phone);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    const { passwordHash: _, ...safeUser } = user;
    return res.json({ success: true, user: safeUser });
  } catch {
    return res.status(401).json({ success: false, message: 'Session expired or invalid.' });
  }
});

// ─── 7. LINK DEPENDENT (child / sister) ──────────────────────────────────────
router.post('/dependents', (req, res) => {
  const { userId, name, age, relationship, learningGoal, assignedMentorId } = req.body;
  if (!userId || !name) {
    return res.status(400).json({ success: false, message: 'Missing dependent details.' });
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
