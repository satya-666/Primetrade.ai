import { Response, NextFunction } from 'express';
import { AuthRequest } from './authenticate';

export function authorize(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'Insufficient permissions', errors: [] });
      return;
    }
    next();
  };
}
