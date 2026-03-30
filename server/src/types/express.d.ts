import type { SessionUser } from '../utils/auth.js';

declare global {
  namespace Express {
    interface Request {
      user?: SessionUser;
    }
  }
}

export {};
