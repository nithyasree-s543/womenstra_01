import express from 'express';
import { db } from '../db/store.js';

const router = express.Router();

// 1. Get all courses
router.get('/', (req, res) => {
  const { category } = req.query;
  let courses = db.get('courses');
  if (category && category !== 'all') {
    courses = courses.filter(c => c.category === category);
  }
  return res.json({ success: true, courses });
});

// 2. Get single course with lessons
router.get('/:id', (req, res) => {
  const course = db.find('courses', c => c.id === req.params.id);
  if (!course) {
    return res.status(404).json({ success: false, message: 'Course not found' });
  }
  return res.json({ success: true, course });
});

// 3. Save lesson progress & reward XP / Streaks / Badges
router.post('/progress', (req, res) => {
  const { userId = 'user-1', courseId, lessonId, xp = 50 } = req.body;

  const user = db.find('users', u => u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const updatedPoints = (user.points || 0) + Number(xp);
  const updatedStreak = (user.streak || 0) + 1;
  const badges = user.badges || [];

  if (updatedPoints >= 200 && !badges.includes('Hunar Didi')) {
    badges.push('Hunar Didi');
  }
  if (updatedPoints >= 500 && !badges.includes('Gyan Jyoti')) {
    badges.push('Gyan Jyoti');
  }

  db.update('users', u => u.id === userId, {
    points: updatedPoints,
    streak: updatedStreak,
    badges
  });

  return res.json({
    success: true,
    pointsAwarded: xp,
    totalPoints: updatedPoints,
    currentStreak: updatedStreak,
    newBadges: badges,
    voiceCelebration: `शाबाश! आपने यह पाठ पूरा कर लिया और ${xp} अंक अर्जित किए!`
  });
});

// 4. Submit Voice Quiz Answer
router.post('/quiz-submit', (req, res) => {
  const { courseId, lessonId, selectedOptionId, isCorrect } = req.body;
  return res.json({
    success: true,
    isCorrect: Boolean(isCorrect),
    scoreGained: isCorrect ? 25 : 5,
    message: isCorrect ? 'बहुत बढ़िया! सही उत्तर।' : 'कोई बात नहीं! सही उत्तर फिर से सुनिए।'
  });
});

export default router;
