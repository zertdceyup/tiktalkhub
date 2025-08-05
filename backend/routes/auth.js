import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { runSQL, getSQL } from '../database/init.js';
import { authenticateToken } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Register user
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('username').optional().isLength({ min: 3, max: 20 }).matches(/^[a-zA-Z0-9_]+$/),
  body('first_name').optional().isLength({ min: 1, max: 50 }),
  body('last_name').optional().isLength({ min: 1, max: 50 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { email, password, username, first_name, last_name } = req.body;

    // Check if registrations are enabled
    const registrationSetting = await getSQL('SELECT value FROM admin_settings WHERE key = ?', ['enable_registrations']);
    if (registrationSetting && registrationSetting.value === 'false') {
      return res.status(403).json({
        success: false,
        message: 'User registrations are currently disabled'
      });
    }

    // Check if user already exists
    const existingUser = await getSQL('SELECT id FROM users WHERE email = ? OR username = ?', [email, username]);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or username'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const result = await runSQL(`
      INSERT INTO users (email, password, username, first_name, last_name)
      VALUES (?, ?, ?, ?, ?)
    `, [email, hashedPassword, username, first_name, last_name]);

    // Generate JWT token
    const token = jwt.sign(
      { id: result.lastID, email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Get user data (without password)
    const user = await getSQL(`
      SELECT id, email, username, first_name, last_name, role, created_at
      FROM users WHERE id = ?
    `, [result.lastID]);

    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user
    });

  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
});

// Login user
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user
    const user = await getSQL('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;

    logger.info(`User logged in: ${email}`);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await getSQL(`
      SELECT id, email, username, first_name, last_name, avatar_url, role, created_at, updated_at
      FROM users WHERE id = ?
    `, [req.user.id]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });

  } catch (error) {
    logger.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, [
  body('username').optional().isLength({ min: 3, max: 20 }).matches(/^[a-zA-Z0-9_]+$/),
  body('first_name').optional().isLength({ min: 1, max: 50 }),
  body('last_name').optional().isLength({ min: 1, max: 50 }),
  body('avatar_url').optional().isURL()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { username, first_name, last_name, avatar_url } = req.body;
    const updates = {};
    const params = [];

    if (username !== undefined) {
      // Check if username is already taken by another user
      const existingUser = await getSQL('SELECT id FROM users WHERE username = ? AND id != ?', [username, req.user.id]);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username already taken'
        });
      }
      updates.username = username;
      params.push(username);
    }

    if (first_name !== undefined) {
      updates.first_name = first_name;
      params.push(first_name);
    }

    if (last_name !== undefined) {
      updates.last_name = last_name;
      params.push(last_name);
    }

    if (avatar_url !== undefined) {
      updates.avatar_url = avatar_url;
      params.push(avatar_url);
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    // Build dynamic query
    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    params.push(new Date().toISOString(), req.user.id);

    await runSQL(`
      UPDATE users SET ${setClause}, updated_at = ? WHERE id = ?
    `, params);

    // Get updated user data
    const updatedUser = await getSQL(`
      SELECT id, email, username, first_name, last_name, avatar_url, role, created_at, updated_at
      FROM users WHERE id = ?
    `, [req.user.id]);

    logger.info(`User profile updated: ${req.user.email}`);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    logger.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

// Change password
router.put('/change-password', authenticateToken, [
  body('currentPassword').exists(),
  body('newPassword').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Get current user with password
    const user = await getSQL('SELECT password FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await runSQL('UPDATE users SET password = ?, updated_at = ? WHERE id = ?',
      [hashedNewPassword, new Date().toISOString(), req.user.id]);

    logger.info(`Password changed for user: ${req.user.email}`);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    logger.error('Password change error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
});

// Verify JWT token
router.get('/verify', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Token is valid',
    user: req.user
  });
});

export default router;