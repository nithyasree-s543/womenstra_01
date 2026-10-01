import express from 'express';
import { db } from '../db/store.js';

const router = express.Router();

// 1. Share or update safety location (opt-in privacy controlled)
router.post('/share-location', (req, res) => {
  const { userId = 'user-1', userName = 'Sunita Devi', lat, lng, destination, emergencyContact } = req.body;

  const activeShare = {
    id: `share-${Date.now()}`,
    userId,
    userName,
    lat: lat || 25.2677,
    lng: lng || 83.0234,
    destination: destination || 'Ramnagar CSC Center',
    emergencyContact: emergencyContact || '9876543210 (Husband/Brother)',
    status: 'active',
    updatedAt: new Date().toISOString()
  };

  db.insert('activeLocationShares', activeShare);

  return res.json({
    success: true,
    message: 'Safety location sharing active with your trusted contact.',
    share: activeShare
  });
});

// 2. Get active location shares (e.g. for guardian or safety monitor)
router.get('/active-shares', (req, res) => {
  const shares = db.get('activeLocationShares');
  return res.json({ success: true, shares });
});

// 3. Stop safety sharing
router.post('/stop-share', (req, res) => {
  const { shareId } = req.body;
  db.delete('activeLocationShares', s => s.id === shareId);
  return res.json({ success: true, message: 'Location sharing ended safely.' });
});

export default router;
