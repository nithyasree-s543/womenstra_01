import express from 'express';
import { db } from '../db/store.js';

const router = express.Router();

// 1. Get Packages
router.get('/packages', (req, res) => {
  const packages = db.get('packages');
  return res.json({ success: true, packages });
});

// 2. Create Razorpay Order (Test Mode Simulation & API Ready)
router.post('/create-order', (req, res) => {
  const { packageId, userId = 'user-1' } = req.body;
  const pkg = db.find('packages', p => p.id === packageId);

  if (!pkg) {
    return res.status(404).json({ success: false, message: 'Package not found' });
  }

  const orderId = `order_test_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;

  return res.json({
    success: true,
    orderId,
    amount: pkg.price * 100, // in paise
    currency: 'INR',
    packageName: pkg.name,
    razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_womentra2026'
  });
});

// 3. Verify Payment and Upgrade User
router.post('/verify', (req, res) => {
  const { orderId, paymentId, packageId, userId = 'user-1' } = req.body;

  // In test mode, mark subscription active
  const pkg = db.find('packages', p => p.id === packageId) || { name: 'Pragati (Monthly)', id: 'pkg-premium' };
  
  db.update('users', u => u.id === userId, {
    package: pkg.id,
    packageExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    badges: Array.from(new Set([...(db.find('users', u => u.id === userId)?.badges || []), 'Pragati Nari']))
  });

  return res.json({
    success: true,
    message: `Payment successful! You are now upgraded to ${pkg.name}.`,
    transactionId: paymentId || `pay_mock_${Date.now()}`
  });
});

// 4. Redeem NGO / Government Sponsor Code
router.post('/redeem-sponsor-code', (req, res) => {
  const { code, userId = 'user-1' } = req.body;

  if (!code) {
    return res.status(400).json({ success: false, message: 'Please enter a sponsor code' });
  }

  const validCodes = ['SAKHI2026', 'NRLM_FREE', 'GRAMIN_SHAKTI', 'WOMEN_EMPOWER'];
  if (!validCodes.includes(code.toUpperCase())) {
    return res.status(400).json({
      success: false,
      message: 'Invalid code. Use demo sponsor code: SAKHI2026 or NRLM_FREE'
    });
  }

  db.update('users', u => u.id === userId, {
    package: 'pkg-premium',
    packageExpiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
    sponsor: 'CSR / NABARD Rural Empowerment Grant'
  });

  return res.json({
    success: true,
    message: '🎉 Sponsor code applied! You have 6 months free access to Live Tutoring & Mentorship.'
  });
});

export default router;
