import jwt from 'jsonwebtoken';
import db from '../database/init.js';
import logger from '../utils/logger.js';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      logger.warn(`JWT verification failed: ${err.message}`);
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Get fresh user data from database
    try {
      const userData = db.prepare('SELECT id, email, username, role, is_active FROM users WHERE id = ?').get(user.id);
      
      if (!userData || !userData.is_active) {
        return res.status(403).json({
          success: false,
          message: 'User account is inactive'
        });
      }

      req.user = userData;
      next();
    } catch (error) {
      logger.error('Database error in auth middleware:', error);
      return res.status(500).json({
        success: false,
        message: 'Authentication error'
      });
    }
  });
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      req.user = null;
    } else {
      try {
        const userData = db.prepare('SELECT id, email, username, role, is_active FROM users WHERE id = ?').get(user.id);
        req.user = userData && userData.is_active ? userData : null;
      } catch (error) {
        req.user = null;
      }
    }
    next();
  });
};