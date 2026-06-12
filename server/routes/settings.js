import { Router } from 'express';
import Admin from '../models/Admin.js';

const router = Router();

/**
 * GET /api/settings/public
 * Public route to fetch general settings (e.g., contact WhatsApp number).
 */
router.get('/public', async (req, res) => {
  try {
    // Fetch the first admin record in the database
    const admin = await Admin.findOne().select('whatsappNumber');
    if (!admin) {
      // Return default placeholder fallback if database is not seeded
      return res.json({ whatsappNumber: '94700000000' });
    }
    return res.json({ whatsappNumber: admin.whatsappNumber });
  } catch (error) {
    console.error('Fetch public settings error:', error.message);
    return res.status(500).json({ message: 'Failed to fetch public settings.' });
  }
});

export default router;
