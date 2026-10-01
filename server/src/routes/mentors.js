import express from 'express';
import { db } from '../db/store.js';

const router = express.Router();

// 1. Get all mentors
router.get('/', (req, res) => {
  const { language, skill } = req.query;
  let mentors = db.get('mentors');

  if (language) {
    mentors = mentors.filter(m => m.languages.includes(language));
  }
  if (skill) {
    mentors = mentors.filter(m => m.skills.some(s => s.toLowerCase().includes(skill.toLowerCase())));
  }

  return res.json({ success: true, mentors });
});

// 2. Get current assigned mentor for user
router.get('/my-mentor', (req, res) => {
  const { userId = 'user-1' } = req.query;
  const user = db.find('users', u => u.id === userId);
  const mentorId = user?.assignedMentorId || 'mentor-1';
  const mentor = db.find('mentors', m => m.id === mentorId);

  return res.json({
    success: true,
    mentor: mentor || db.get('mentors')[0]
  });
});

// 3. Assign or Switch Dedicated Mentor
router.post('/assign', (req, res) => {
  const { userId = 'user-1', mentorId } = req.body;
  const mentor = db.find('mentors', m => m.id === mentorId);
  if (!mentor) {
    return res.status(404).json({ success: false, message: 'Mentor not found' });
  }

  db.update('users', u => u.id === userId, { assignedMentorId: mentorId });

  return res.json({
    success: true,
    message: `Assigned ${mentor.name} as your dedicated mentor`,
    mentor
  });
});

// 4. Rate & Review Mentor
router.post('/rate', (req, res) => {
  const { mentorId, rating, feedback, userId = 'user-1' } = req.body;
  const mentor = db.find('mentors', m => m.id === mentorId);
  if (!mentor) {
    return res.status(404).json({ success: false, message: 'Mentor not found' });
  }

  const reviewCount = (mentor.totalReviews || 0) + 1;
  const currentRating = mentor.rating || 5.0;
  const newRating = Number(((currentRating * mentor.totalReviews + Number(rating)) / reviewCount).toFixed(1));

  const updatedMentor = db.update('mentors', m => m.id === mentorId, {
    rating: newRating,
    totalReviews: reviewCount
  });

  return res.json({
    success: true,
    message: 'Review saved! Thank you for helping our community maintain high standards.',
    mentor: updatedMentor
  });
});

// 5. Book a Tutoring / Coaching Session
router.post('/book-session', (req, res) => {
  const { mentorId, userId = 'user-1', date, timeSlot, topic } = req.body;
  const session = {
    id: `session-${Date.now()}`,
    mentorId,
    userId,
    date: date || 'Tomorrow',
    timeSlot: timeSlot || '4:00 PM - 4:45 PM',
    topic: topic || 'Vocational Tailoring Business Guidance',
    status: 'confirmed',
    roomUrl: `/live/room-${Date.now()}`,
    lowBandwidthReady: true,
    createdAt: new Date().toISOString()
  };

  return res.json({
    success: true,
    message: 'Session booked! Your mentor will call or connect at scheduled time.',
    session
  });
});

// 6. Tutor Registration & e-KYC Verification (DigiLocker / Mock)
router.post('/register-tutor', (req, res) => {
  const { name, phone, languages, skills, experienceYears, bio, aadhaarNumber, certificateType } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ success: false, message: 'Name and phone are required' });
  }

  // Generate safe non-PII verification hash token (Never store raw Aadhaar)
  const safeAadhaarHash = `DIGILOCKER-KYC-${Math.floor(100000 + Math.random() * 900000)}`;

  const newMentor = {
    id: `mentor-${Date.now()}`,
    name,
    title: `${skills?.[0] || 'Community'} Expert & Verified Tutor`,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    phone,
    languages: languages || ['hi', 'en'],
    skills: Array.isArray(skills) ? skills : ['Rural Entrepreneurship', 'Digital Skills'],
    experienceYears: Number(experienceYears) || 3,
    rating: 5.0,
    totalReviews: 1,
    verified: true,
    kycStatus: 'approved',
    kycToken: safeAadhaarHash,
    bio: bio || 'Dedicated community tutor empowering women with hands-on skills and mentorship.',
    availability: ['Morning (10 AM - 1 PM)', 'Evening (4 PM - 7 PM)'],
    activeMentees: 0,
    maxMentees: 20
  };

  db.insert('mentors', newMentor);

  return res.json({
    success: true,
    message: 'Tutor registered and e-KYC verified successfully via DigiLocker simulation.',
    mentor: newMentor
  });
});

export default router;
