import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import auth from '../middleware/auth.js';
import Admin from '../models/Admin.js';

const router = Router();

/**
 * GET /api/admin/profile
 * Retrieves the profile of the current logged-in admin.
 * Protected route.
 */
router.get('/profile', auth, async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select('-password');
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found.' });
    }
    return res.json({
      email: admin.email,
      whatsappNumber: admin.whatsappNumber,
    });
  } catch (error) {
    console.error('Fetch profile error:', error.message);
    return res.status(500).json({ message: 'Failed to fetch profile.' });
  }
});

/**
 * PUT /api/admin/profile
 * Updates the current admin's email, whatsappNumber, and optionally password.
 * Protected route.
 */
router.put(
  '/profile',
  auth,
  [
    body('email').isEmail().withMessage('Must be a valid email'),
    body('whatsappNumber').notEmpty().withMessage('WhatsApp number is required'),
    body('password')
      .optional({ checkFalsy: true })
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, whatsappNumber, password } = req.body;

      const admin = await Admin.findById(req.user.id);
      if (!admin) {
        return res.status(404).json({ message: 'Admin not found.' });
      }

      // Check for email collision (excluding this admin)
      const emailTaken = await Admin.findOne({
        email: email.toLowerCase(),
        _id: { $ne: admin._id },
      });
      if (emailTaken) {
        return res.status(400).json({ message: 'Email is already in use.' });
      }

      admin.email = email.toLowerCase();
      admin.whatsappNumber = whatsappNumber;

      if (password) {
        const salt = await bcrypt.genSalt(10);
        admin.password = await bcrypt.hash(password, salt);
      }

      await admin.save();

      return res.json({
        message: 'Profile updated successfully.',
        admin: {
          email: admin.email,
          whatsappNumber: admin.whatsappNumber,
        },
      });
    } catch (error) {
      console.error('Update profile error:', error.message);
      return res.status(500).json({ message: 'Failed to update profile.' });
    }
  }
);

export default router;
