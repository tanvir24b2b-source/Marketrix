import { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../utils/auth.js';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.session;
    if (!token) return res.status(401).json({ message: 'Unauthenticated' });
    req.user = verifyToken(token);
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid session' });
  }
}

export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Unauthenticated' });
    if (!user.isAdmin && !user.permissions.includes(permission)) return res.status(403).json({ message: 'Forbidden' });
    next();
  };
}
