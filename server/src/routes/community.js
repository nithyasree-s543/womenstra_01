import express from 'express';
import { db } from '../db/store.js';

const router = express.Router();

// 1. Get all community posts
router.get('/posts', (req, res) => {
  const { category } = req.query;
  let posts = db.get('communityPosts');

  if (category && category !== 'all') {
    posts = posts.filter(p => p.category === category);
  }

  return res.json({ success: true, posts });
});

// 2. Create new community voice/text post
router.post('/posts', (req, res) => {
  const { authorName, village, title, content, hasVoiceNote, category = 'success_story' } = req.body;

  if (!title) {
    return res.status(400).json({ success: false, message: 'Title is required' });
  }

  const post = {
    id: `post-${Date.now()}`,
    authorName: authorName || 'Sakhi Didi',
    village: village || 'Gramin, UP',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    title,
    titleHi: title,
    content: content || 'Shared voice message with Sakhi Circle.',
    hasVoiceNote: Boolean(hasVoiceNote),
    voiceNoteDuration: hasVoiceNote ? '0:35' : null,
    likesCount: 1,
    repliesCount: 0,
    category,
    createdAt: new Date().toISOString()
  };

  db.insert('communityPosts', post);

  return res.json({ success: true, message: 'Post shared with Sakhi Circle!', post });
});

// 3. Like Post
router.post('/posts/:id/like', (req, res) => {
  const post = db.find('communityPosts', p => p.id === req.params.id);
  if (!post) {
    return res.status(404).json({ success: false, message: 'Post not found' });
  }

  const updated = db.update('communityPosts', p => p.id === req.params.id, p => ({
    ...p,
    likesCount: (p.likesCount || 0) + 1
  }));

  return res.json({ success: true, post: updated });
});

// 4. Report Post (DPDP & Safe moderation compliance)
router.post('/posts/:id/report', (req, res) => {
  const { reason = 'Inappropriate content' } = req.body;
  console.log(`[SAFETY REPORT] Post ${req.params.id} flagged: ${reason}`);
  return res.json({
    success: true,
    message: 'Thank you. Our moderation team will review this within 2 hours.'
  });
});

export default router;
