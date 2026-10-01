import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from '../db/store.js';
import { userTable } from '../db/userTable.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'womentra_secure_dev_jwt_secret_2026';
const BCRYPT_ROUNDS = 10;
const isProduction = process.env.NODE_ENV === 'production';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
};

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

// Helper to safely strip passwordHash from user object
const stripPassword = (user) => {
  if (!user) return null;
  const { passwordHash: _, ...safeUser } = user;
  return safeUser;
};

// ─── 1. REGISTER (name + phone + password + village + language) ───────────────
router.post('/register', async (req, res) => {
  const { phone, password, name, village, language = 'en' } = req.body;

  // Validation
  if (!phone || phone.replace(/\D/g, '').length < 10) {
    return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit mobile number.' });
  }
  const cleanPhone = phone.replace(/\D/g, '').slice(-10);

  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Full name is required.' });
  }
  if (!password || password.length < 8) {
    return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
  }

  // Check if phone already registered in SQLite table or store
  let existing = null;
  try {
    existing = await userTable.findByPhone(cleanPhone);
  } catch (e) {
    console.warn('[SQLite] findByPhone error:', e.message);
  }
  if (!existing) {
    existing = db.find('users', u => u.phone === cleanPhone);
  }

  if (existing) {
    return res.status(409).json({ success: false, message: 'This phone number is already registered. Please login.' });
  }

  const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const newUser = {
    id: `user-${Date.now()}`,
    phone: cleanPhone,
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
    role: 'user',
    createdAt: new Date().toISOString()
  };

  // Save to SQLite users table and sync in-memory store
  try {
    await userTable.insert(newUser);
  } catch (err) {
    console.error('[SQLite] Insert error:', err.message);
  }
  db.insert('users', newUser);

  const token = jwt.sign(
    { id: newUser.id, phone: newUser.phone, role: newUser.role || 'user' },
    JWT_SECRET,
    { expiresIn: '30d' }
  );

  // Set httpOnly sameSite cookie with expiry
  res.cookie('token', token, COOKIE_OPTIONS);

  console.log(`[AUTH] New user registered: ${name} (${cleanPhone})`);
  return res.status(201).json({ success: true, token, user: stripPassword(newUser) });
});

// ─── 2. LOGIN (phone + password → issue OTP) ─────────────────────────────────
router.post('/login', async (req, res) => {
  const { phone, password, language = 'en' } = req.body;

  if (!phone || !password) {
    return res.status(400).json({ success: false, message: 'Phone number and password are required.' });
  }

  const cleanPhone = phone.replace(/\D/g, '').slice(-10);

  // Check SQLite first, then memory store
  let user = null;
  try {
    user = await userTable.findByPhone(cleanPhone);
  } catch (e) {
    console.warn('[SQLite] findByPhone error:', e.message);
  }
  if (!user) {
    user = db.find('users', u => u.phone === cleanPhone);
  }

  if (!user) {
    return res.status(401).json({ success: false, message: 'No account found with this phone number. Please register.' });
  }

  // Demo user password verification fallback (Demo@1234)
  const isDemoAccount = cleanPhone === '9876543210' && password === 'Demo@1234';
  let passwordMatch = false;

  if (isDemoAccount) {
    passwordMatch = true;
  } else if (user.passwordHash) {
    passwordMatch = await bcrypt.compare(password, user.passwordHash);
  }

  if (!passwordMatch) {
    return res.status(401).json({ success: false, message: 'Incorrect password. Please try again.' });
  }

  // Issue OTP for 2-factor verification
  const otp = generateOTP();
  OTP_STORE.set(cleanPhone, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });
  const promptFn = OTP_VOICE_PROMPTS[language] || OTP_VOICE_PROMPTS.en;

  console.log(`[AUTH] Login credentials verified for ${cleanPhone}. OTP issued: ${otp}`);
  return res.json({
    success: true,
    requiresOtp: true,
    message: 'Password verified. Please enter the OTP to complete login.',
    demoOtp: otp,
    voicePrompt: promptFn(otp)
  });
});

// ─── 3. VERIFY OTP (final authentication step) ───────────────────────────────
router.post('/verify-otp', async (req, res) => {
  const { phone, otp, name, village, language = 'en' } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ success: false, message: 'Phone and OTP are required.' });
  }

  const cleanPhone = phone.replace(/\D/g, '').slice(-10);

  // Verify OTP (accept 123456 or stored OTP)
  const stored = OTP_STORE.get(cleanPhone);
  const isValid = otp === '123456' || (stored && stored.otp === otp && Date.now() < stored.expiresAt);
  if (!isValid) {
    return res.status(400).json({ success: false, message: 'Invalid or expired OTP. Please use 123456.' });
  }

  OTP_STORE.delete(cleanPhone);

  // Retrieve user
  let user = null;
  try {
    user = await userTable.findByPhone(cleanPhone);
  } catch (e) {
    console.warn('[SQLite] findByPhone error:', e.message);
  }
  if (!user) {
    user = db.find('users', u => u.phone === cleanPhone);
  }

  // If user does not exist yet (demo quick flow)
  if (!user) {
    const demoPasswordHash = await bcrypt.hash('Demo@1234', BCRYPT_ROUNDS);
    user = {
      id: `user-${Date.now()}`,
      phone: cleanPhone,
      passwordHash: demoPasswordHash,
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
      role: 'user',
      createdAt: new Date().toISOString()
    };
    try {
      await userTable.insert(user);
    } catch { }
    db.insert('users', user);
  }

  const token = jwt.sign(
    { id: user.id, phone: user.phone, role: user.role || 'user' },
    JWT_SECRET,
    { expiresIn: '30d' }
  );

  // Set httpOnly sameSite cookie with expiry
  res.cookie('token', token, COOKIE_OPTIONS);

  return res.json({ success: true, token, user: stripPassword(user) });
});

// ─── 4. GET CURRENT USER (/api/auth/me) ──────────────────────────────────────
router.get('/me', async (req, res) => {
  let token = null;

  // 1. From Authorization Bearer header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  // 2. From httpOnly cookie
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authenticated.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    let user = null;
    try {
      user = await userTable.findById(decoded.id);
    } catch { }
    if (!user) {
      user = db.find('users', u => u.id === decoded.id || u.phone === decoded.phone);
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.json({ success: true, user: stripPassword(user) });
  } catch {
    return res.status(401).json({ success: false, message: 'Session expired or invalid.' });
  }
});

// ─── 5. LOGOUT (/api/auth/logout) ────────────────────────────────────────────
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax'
  });
  return res.json({ success: true, message: 'Logged out successfully.' });
});

// ─── 6. STANDALONE SEND-OTP ──────────────────────────────────────────────────
router.post('/send-otp', (req, res) => {
  const { phone, language = 'en' } = req.body;
  if (!phone || phone.length < 10) {
    return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit mobile number.' });
  }

  const cleanPhone = phone.replace(/\D/g, '').slice(-10);
  const otp = generateOTP();
  OTP_STORE.set(cleanPhone, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

  console.log(`[AUTH] Sent OTP ${otp} to phone ${cleanPhone}`);
  const promptFn = OTP_VOICE_PROMPTS[language] || OTP_VOICE_PROMPTS.en;
  return res.json({
    success: true,
    message: 'OTP sent successfully.',
    demoOtp: otp,
    voicePrompt: promptFn(otp)
  });
});

// ─── 7. VOICE ONBOARDING ─────────────────────────────────────────────────────
router.post('/voice-onboard', async (req, res) => {
  const { userId, name, age, village, state, interests, goals, language } = req.body;

  const updates = {
    ...(name && { name }),
    ...(age && { age: Number(age) }),
    ...(village && { village }),
    ...(state && { state }),
    ...(interests && { interests }),
    ...(goals && { goals }),
    ...(language && { language })
  };

  try {
    await userTable.update(userId, updates);
  } catch { }

  const updatedUser = db.update('users', u => u.id === userId, existing => ({
    ...existing,
    ...updates,
    points: (existing.points || 0) + 50,
    badges: Array.from(new Set([...(existing.badges || []), 'Pehchan Patra']))
  }));

  if (!updatedUser) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  return res.json({ success: true, message: 'Profile completed successfully.', user: stripPassword(updatedUser) });
});

// ─── 8. LINK DEPENDENT ───────────────────────────────────────────────────────
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
