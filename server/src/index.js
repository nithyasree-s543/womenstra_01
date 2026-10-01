import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
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
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Initialize Socket.IO with CORS for WebRTC signaling
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Active online users & peer signaling registry
const onlineUsers = new Map(); // socketId -> { userId, userName, role }
const userSocketMap = new Map(); // userId -> socketId

io.on('connection', (socket) => {
  console.log(`[Socket.IO] New client connected: ${socket.id}`);

  // User registers their online presence
  socket.on('register-user', ({ userId, userName, role = 'learner' }) => {
    onlineUsers.set(socket.id, { userId, userName, role });
    userSocketMap.set(userId, socket.id);
    console.log(`[Socket.IO] User registered: ${userName} (${userId}) on socket ${socket.id}`);
    
    // Broadcast updated available tutors/mentors
    io.emit('online-users-updated', Array.from(onlineUsers.values()));
  });

  // Call invitation from caller to callee
  socket.on('call-user', ({ callerId, callerName, calleeId, callType = 'video', isMinor = false }) => {
    console.log(`[Socket.IO] Call invitation: ${callerName} -> ${calleeId} (${callType})`);
    const calleeSocketId = userSocketMap.get(calleeId);

    if (calleeSocketId) {
      io.to(calleeSocketId).emit('incoming-call', {
        callerId,
        callerName,
        callerSocketId: socket.id,
        callType,
        isMinor,
        timestamp: Date.now()
      });
      socket.emit('call-status', { status: 'ringing', calleeId });
    } else {
      // Simulate tutor receiving or mentor bot answering
      socket.emit('call-status', { 
        status: 'ringing', 
        calleeId, 
        message: 'Mentor is available. Connecting room...' 
      });
    }
  });

  // Callee response (accept / decline)
  socket.on('call-response', ({ callerSocketId, callerId, calleeName, accepted }) => {
    console.log(`[Socket.IO] Call response from callee: ${accepted ? 'ACCEPTED' : 'DECLINED'}`);
    if (callerSocketId) {
      io.to(callerSocketId).emit('call-response-received', {
        calleeName,
        calleeSocketId: socket.id,
        accepted
      });
    }
  });

  // WebRTC ICE Candidates and SDP Offer/Answer relay
  socket.on('webrtc-offer', ({ targetSocketId, offer }) => {
    if (targetSocketId) {
      io.to(targetSocketId).emit('webrtc-offer-received', {
        senderSocketId: socket.id,
        offer
      });
    }
  });

  socket.on('webrtc-answer', ({ targetSocketId, answer }) => {
    if (targetSocketId) {
      io.to(targetSocketId).emit('webrtc-answer-received', {
        senderSocketId: socket.id,
        answer
      });
    }
  });

  socket.on('webrtc-ice-candidate', ({ targetSocketId, candidate }) => {
    if (targetSocketId) {
      io.to(targetSocketId).emit('webrtc-ice-candidate-received', {
        senderSocketId: socket.id,
        candidate
      });
    }
  });

  // End Call signal
  socket.on('end-call', ({ targetSocketId }) => {
    if (targetSocketId) {
      io.to(targetSocketId).emit('call-ended', { by: socket.id });
    }
  });

  // Hand raise signal during class
  socket.on('raise-hand', ({ userName, roomId }) => {
    io.emit('hand-raised', { userName, timestamp: Date.now() });
  });

  socket.on('disconnect', () => {
    const user = onlineUsers.get(socket.id);
    if (user) {
      userSocketMap.delete(user.userId);
      onlineUsers.delete(socket.id);
      io.emit('online-users-updated', Array.from(onlineUsers.values()));
    }
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// Security & Middleware
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Helmet: secure HTTP headers (disable CSP in dev so Vite HMR works)
app.use(helmet({ contentSecurityPolicy: false }));

// CORS: restricted to client URL
app.use(cors({
  origin: [CLIENT_URL, 'http://localhost:5173', 'http://localhost:4173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));

// Rate limiting on auth routes (login + OTP)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,                   // max 20 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Please wait 15 minutes and try again.' }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/send-otp', authLimiter);
app.use('/api/auth/verify-otp', authLimiter);

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Request logger
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.originalUrl}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'Womentra Full-Stack Platform',
    tagline: 'Learn • Grow • Lead (Her Potential. Her Power. Her Future.)',
    version: '2.0.0',
    webrtcSignaling: 'ready',
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

// Live tutoring rooms & signaling status
app.get('/api/live-sessions', (req, res) => {
  const sessions = db.get('liveSessions');
  res.json({ 
    success: true, 
    sessions,
    stunServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:global.stun.twilio.com:3478' }
    ]
  });
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

server.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`💜 WOMENTRA FULL-STACK & WEBRTC SERVER ON PORT ${PORT}`);
  console.log(`🚀 REST API: http://localhost:${PORT}/api/health`);
  console.log(`📡 Socket.IO WebRTC Signaling Enabled`);
  console.log(`=================================================`);
});
