// routes/admin.js
import express from 'express';
import { auth } from '../config/firebase.js';

const router = express.Router();

/**
 * POST /admin/set-role
 * Body: { uid: string, role: 'admin' | 'user' }
 */
router.post('/set-role', async (req, res) => {
  const { uid, role } = req.body;

  if (!uid || !role) {
    return res.status(400).json({ success: false, message: 'UID and role are required' });
  }

  try {
    await auth.setCustomUserClaims(uid, { role });
    return res.status(200).json({ success: true, message: `Role '${role}' set for user ${uid}` });
  } catch (error) {
    console.error('Error setting role:', error);
    return res.status(500).json({ success: false, message: 'Failed to set role', error: error.message });
  }
});

export default router;
