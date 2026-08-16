import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { firebaseAuth } from '../services/firebaseService.js';

export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }

  // The current frontend uses a demo token while database-backed auth is not
  // configured. Keep this development-only and never enable it in production.
  if (config.allowDemoAuth && token === 'demo-token') {
    req.user = { id: 'demo-user' };
    return next();
  }

  try {
    try {
      const decodedFirebaseToken = await firebaseAuth().verifyIdToken(token);
      req.user = { ...decodedFirebaseToken, id: decodedFirebaseToken.uid };
    } catch {
      const decoded = jwt.verify(token, config.jwtSecret);
      req.user = decoded;
    }
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, token failed validation' });
  }
};
