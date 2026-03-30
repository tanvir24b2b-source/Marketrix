import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev_secret_change_me';

export type SessionUser = {
  id: number;
  name: string;
  email: string;
  roleId: number;
  roleName: string;
  active: number;
  imageUrl?: string | null;
  permissions: string[];
  isAdmin: boolean;
};

export function signToken(user: SessionUser) {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): SessionUser {
  return jwt.verify(token, JWT_SECRET) as SessionUser;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}
