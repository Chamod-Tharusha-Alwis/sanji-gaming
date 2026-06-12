import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import auth from '../middleware/auth.js';
import Admin from '../models/Admin.js';

const router = Router();

/**
 * POST /api/auth/login
 * Authenticates the admin user against MongoDB.
 * Returns a JWT valid for 7 days on success.
 */
router.post(
  '/login',
  [
    body('username').optional(), // to support legacy or email input
    body('email').optional(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    try {
      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const emailInput = req.body.email || req.body.username;
      const { password } = req.body;

      if (!emailInput) {
        return res.status(400).json({ message: 'Email or username is required.' });
      }

      // Query database for admin by email
      const admin = await Admin.findOne({ email: emailInput.toLowerCase() });
      if (!admin) {
        return res.status(401).json({ message: 'Invalid credentials.' });
      }

      // Verify password
      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials.' });
      }

      // Sign JWT with admin role and id
      const token = jwt.sign(
        { id: admin._id, role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        message: 'Login successful.',
        token,
      });
    } catch (error) {
      console.error('Login error:', error.message);
      return res.status(500).json({ message: 'Server error during login.' });
    }
  }
);

/**
 * GET /api/auth/verify
 * Protected route — verifies the JWT is still valid.
 */
router.get('/verify', auth, (req, res) => {
  return res.json({ valid: true, user: req.user });
});

export default router;
