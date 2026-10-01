import express from 'express';
import { db } from '../db/store.js';

const router = express.Router();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

// 1. Get all courses / skills
router.get('/', (req, res) => {
  const { category } = req.query;
  let courses = db.get('courses');
  if (category && category !== 'all') {
    courses = courses.filter(c => c.category === category);
  }
  return res.json({ success: true, courses });
});

// Helper: Generates course module structure with Gemini API if missing
const generateCourseLanguageContent = async (course, language) => {
  if (GEMINI_API_KEY && GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE') {
    try {
      const prompt = `Generate a structured, beginner-friendly course module in language code '${language}' for rural women learning: "${course.title}".
Return STRICT JSON format with:
{
  "overview": "Brief overview in ${language}",
  "modules": [
    {
      "id": "mod-1",
      "title": "Module 1 Title in ${language}",
      "lessons": [
        {
          "id": "les-1",
          "title": "Lesson 1 in ${language}",
          "duration": "15 mins",
          "keyPoints": ["Point 1 in ${language}", "Point 2 in ${language}"],
          "inVideoQuestion": {
            "pauseAtSeconds": 5,
            "question": "Question in ${language}?",
            "options": [
              { "id": "a", "text": "Option A in ${language}", "isCorrect": true, "explanation": "Explanation in ${language}" },
              { "id": "b", "text": "Option B in ${language}", "isCorrect": false }
            ]
          },
          "quiz": {
            "question": "Quiz question in ${language}?",
            "options": [
              { "id": "a", "text": "Option A in ${language}", "isCorrect": true },
              { "id": "b", "text": "Option B in ${language}", "isCorrect": false }
            ]
          }
        }
      ],
      "test": { "id": "test-1", "title": "Test 1 in ${language}", "totalQuestions": 5 },
      "assignment": { "id": "assign-1", "title": "Practical task in ${language}", "instructions": "Task instructions" },
      "project": { "id": "proj-1", "title": "Mini project in ${language}", "instructions": "Project instructions" }
    }
  ]
}`;
      const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
      const response = await fetch(geminiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json', temperature: 0.3 }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (jsonText) {
          return JSON.parse(jsonText);
        }
      }
    } catch (err) {
      console.warn('Gemini course generation fallback:', err.message);
    }
  }

  // Built-in intelligent template fallback
  return {
    overview: `Master ${course.title} with step-by-step guidance, interactive video lessons, and practical assignments.`,
    modules: [
      {
        id: "mod-1",
        title: `Module 1: Foundations of ${course.title}`,
        lessons: [
          {
            id: `${course.id}-les-101`,
            title: `Introduction & Core Concepts of ${course.title}`,
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            duration: "15 mins",
            keyPoints: [
              `Core fundamentals of ${course.title}`,
              "Practical daily applications and hands-on workflow",
              "Best practices for career and business growth"
            ],
            inVideoQuestion: {
              pauseAtSeconds: 5,
              question: `What is the primary objective of learning ${course.title}?`,
              options: [
                { id: "a", text: "To gain practical hands-on proficiency and independence", isCorrect: true, explanation: "Correct! Hands-on mastery builds real-world career capability." },
                { id: "b", text: "Memorizing without understanding", isCorrect: false }
              ]
            },
            quiz: {
              question: `Which approach is most effective when practicing ${course.title}?`,
              options: [
                { id: "a", text: "Daily consistent step-by-step practice", isCorrect: true },
                { id: "b", text: "Skipping basic exercises", isCorrect: false }
              ]
            }
          }
        ],
        test: {
          id: `${course.id}-test-1`,
          title: `${course.title} Knowledge Test`,
          totalQuestions: 5,
          passScorePct: 75
        },
        assignment: {
          id: `${course.id}-assign-1`,
          title: `Hands-on ${course.title} Practical Assignment`,
          instructions: "Complete the guided exercise and submit your work for mentor review."
        },
        project: {
          id: `${course.id}-proj-1`,
          title: `${course.title} Capstone Project`,
          instructions: "Build an end-to-end practical project demonstrating your new skill."
        }
      }
    ]
  };
};

// 2. Get single course with localized content
router.get('/:id', async (req, res) => {
  const { lang = 'en' } = req.query;
  const course = db.find('courses', c => c.id === req.params.id);

  if (!course) {
    return res.status(404).json({ success: false, message: 'Course not found' });
  }

  // Check if localized content exists
  if (!course.content) course.content = {};
  
  let localizedContent = course.content[lang];
  if (!localizedContent) {
    // If English exists, or generate dynamically and cache
    if (lang === 'en' && course.content.en) {
      localizedContent = course.content.en;
    } else {
      localizedContent = await generateCourseLanguageContent(course, lang);
      course.content[lang] = localizedContent;
      db.update('courses', c => c.id === course.id, { content: course.content });
    }
  }

  return res.json({
    success: true,
    course: {
      ...course,
      selectedLanguage: lang,
      localized: localizedContent
    }
  });
});

// 3. Get User Course Progress
router.get('/:id/progress', (req, res) => {
  const { userId = 'user-1' } = req.query;
  const courseId = req.params.id;

  let progress = db.find('userCourseProgress', p => p.userId === userId && p.courseId === courseId);
  if (!progress) {
    progress = {
      id: `prog-${Date.now()}`,
      userId,
      courseId,
      language: 'en',
      completedLessons: [],
      currentLessonId: null,
      completedQuizzes: [],
      completedTests: [],
      completedAssignments: [],
      completedProjects: [],
      finalAssessmentPassed: false,
      progressPct: 0,
      lastActiveAt: new Date().toISOString()
    };
    db.insert('userCourseProgress', progress);
  }

  return res.json({ success: true, progress });
});

// 4. Record Step Completion (Lesson, Quiz, Test, Assignment, Project)
router.post('/progress', (req, res) => {
  const { userId = 'user-1', courseId, type, itemId, score = 100, xp = 50 } = req.body;

  let progress = db.find('userCourseProgress', p => p.userId === userId && p.courseId === courseId);
  if (!progress) {
    progress = {
      id: `prog-${Date.now()}`,
      userId,
      courseId,
      completedLessons: [],
      completedQuizzes: [],
      completedTests: [],
      completedAssignments: [],
      completedProjects: [],
      finalAssessmentPassed: false,
      progressPct: 0
    };
    db.insert('userCourseProgress', progress);
  }

  const completedLessons = new Set(progress.completedLessons || []);
  const completedQuizzes = new Set(progress.completedQuizzes || []);
  const completedTests = new Set(progress.completedTests || []);
  const completedAssignments = new Set(progress.completedAssignments || []);
  const completedProjects = new Set(progress.completedProjects || []);

  if (type === 'lesson') completedLessons.add(itemId);
  if (type === 'quiz') completedQuizzes.add(itemId);
  if (type === 'test') completedTests.add(itemId);
  if (type === 'assignment') completedAssignments.add(itemId);
  if (type === 'project') completedProjects.add(itemId);

  const totalPointsEarned = (completedLessons.size * 25) + (completedQuizzes.size * 25) + (completedTests.size * 50) + (completedAssignments.size * 75) + (completedProjects.size * 100);
  const estimatedTotal = 400;
  const progressPct = Math.min(100, Math.round((totalPointsEarned / estimatedTotal) * 100));

  const updatedProgress = db.update('userCourseProgress', p => p.userId === userId && p.courseId === courseId, {
    completedLessons: Array.from(completedLessons),
    completedQuizzes: Array.from(completedQuizzes),
    completedTests: Array.from(completedTests),
    completedAssignments: Array.from(completedAssignments),
    completedProjects: Array.from(completedProjects),
    progressPct,
    lastActiveAt: new Date().toISOString()
  });

  // Update user overall XP
  const user = db.find('users', u => u.id === userId);
  if (user) {
    const updatedPoints = (user.points || 0) + Number(xp);
    db.update('users', u => u.id === userId, { points: updatedPoints });
  }

  return res.json({
    success: true,
    progress: updatedProgress,
    xpAwarded: xp
  });
});

// 5. Final Assessment & Certificate Issuance
router.post('/final-assessment', (req, res) => {
  const { userId = 'user-1', courseId, userName, scorePct = 90, language = 'English' } = req.body;
  const course = db.find('courses', c => c.id === courseId) || { title: 'Skill Mastery Course' };

  if (scorePct < 70) {
    return res.json({
      success: false,
      passed: false,
      scorePct,
      message: 'Assessment score is below 70%. Please review the lessons and retry!'
    });
  }

  const certificate = {
    id: `cert-${Date.now()}`,
    userId,
    userName: userName || 'Sunita Devi',
    courseId,
    courseTitle: course.title,
    language,
    issueDate: new Date().toISOString().split('T')[0],
    verificationToken: `WOM-CERT-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`,
    grade: scorePct >= 90 ? 'A+ Distinction' : 'A First Class',
    scorePct,
    badge: `${course.title} Certified Graduate`
  };

  db.insert('certificates', certificate);
  db.update('userCourseProgress', p => p.userId === userId && p.courseId === courseId, {
    finalAssessmentPassed: true,
    progressPct: 100
  });

  // Award badge to user
  const user = db.find('users', u => u.id === userId);
  if (user) {
    const badges = Array.from(new Set([...(user.badges || []), `${course.title} Certified`]));
    db.update('users', u => u.id === userId, {
      badges,
      points: (user.points || 0) + 300
    });
  }

  return res.json({
    success: true,
    passed: true,
    certificate,
    message: `🎉 Congratulations! You scored ${scorePct}% and earned your official Womentra Certificate!`
  });
});

// 6. Get User Certificates
router.get('/certificates/user/:userId', (req, res) => {
  const certs = db.filter('certificates', c => c.userId === req.params.userId);
  return res.json({ success: true, certificates: certs });
});

export default router;
