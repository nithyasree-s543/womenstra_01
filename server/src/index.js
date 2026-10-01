import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import schemesRoutes from './routes/schemes.js';
import coursesRoutes from './routes/courses.js';
import mentorsRoutes from './routes/mentors.js';
import communityRoutes from './routes/community.js';
import aiRoutes from './routes/ai.js';
import paymentsRoutes from './routes/payments.js';
import trackingRoutes from './routes/tracking.js';
import adminRoutes from './routes/admin.js';
import { db } from './db/store.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logger
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.originalUrl}`);
  next();
});

// Root & Health
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'Womentra API',
    tagline: 'Learn • Grow • Lead (Her Potential. Her Power. Her Future.)',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/schemes', schemesRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/mentors', mentorsRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/admin', adminRoutes);

// Daily affirmations endpoint
app.get('/api/daily-affirmation', (req, res) => {
  const affirmations = db.get('affirmations');
  const stories = db.get('stories');
  const randomAff = affirmations[Math.floor(Math.random() * affirmations.length)] || affirmations[0];
  res.json({ success: true, affirmation: randomAff, stories });
});

// Live tutoring rooms & mock signaling endpoint
app.get('/api/live-sessions', (req, res) => {
  const sessions = db.get('liveSessions');
  res.json({ success: true, sessions });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Endpoint not found: ${req.method} ${req.url}` });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
});

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`💜 WOMENTRA BACKEND RUNNING ON PORT ${PORT}`);
  console.log(`🚀 REST API: http://localhost:${PORT}/api/health`);
  console.log(`=========================================`);
});
