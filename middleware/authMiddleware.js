import { verifyToken } from '../utils/jwtUtils.js';

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token missing' });
    }

    const token = authHeader.split(' ')[1];

    const decoded = verifyToken(token);

    req.user = decoded; 

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};