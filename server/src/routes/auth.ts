import { Router } from 'express';
import { db } from '../db/client.js';
import { comparePassword, hashPassword, signToken } from '../utils/auth.js';

export const authRouter = Router();

authRouter.get('/bootstrap-status', (_req, res) => {
  const user = db.prepare('SELECT id FROM users LIMIT 1').get();
  res.json({ hasAdmin: !!user });
});

authRouter.post('/first-signup', async (req, res) => {
  const existing = db.prepare('SELECT id FROM users LIMIT 1').get();
  if (existing) return res.status(403).json({ message: 'Public signup is disabled.' });
  const { name, email, password } = req.body;
  const adminRole = db.prepare('INSERT INTO roles(name) VALUES (?)').run('Admin').lastInsertRowid as number;
  const permissions = ['dashboard_access','products_access','content_access','ads_access','settings_access','manage_users','manage_roles','approve_devices','view_buying_price'];
  for (const p of permissions) db.prepare('INSERT INTO role_permissions(role_id, permission) VALUES (?,?)').run(adminRole, p);
  const hash = await hashPassword(password);
  const userId = db.prepare('INSERT INTO users(name,email,password_hash,role_id) VALUES (?,?,?,?)').run(name, email, hash, adminRole).lastInsertRowid as number;
  res.json({ userId });
});

authRouter.post('/login', async (req, res) => {
  const { email, password, deviceId, deviceName } = req.body;
  const userRow = db.prepare(`SELECT u.id, u.name, u.email, u.password_hash, u.role_id as roleId, u.active, u.image_url as imageUrl, r.name as roleName
    FROM users u JOIN roles r ON r.id=u.role_id WHERE email=?`).get(email) as any;
  if (!userRow || !userRow.active) return res.status(401).json({ message: 'Invalid credentials' });
  const valid = await comparePassword(password, userRow.password_hash);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

  const permissions = db.prepare('SELECT permission FROM role_permissions WHERE role_id=?').all(userRow.roleId).map((x: any) => x.permission);
  const isAdmin = userRow.roleName.toLowerCase() === 'admin';
  if (!isAdmin) {
    const trusted = db.prepare('SELECT id FROM trusted_devices WHERE user_id=? AND device_id=?').get(userRow.id, deviceId);
    if (!trusted) {
      db.prepare('INSERT INTO device_requests(user_id, device_id, device_name, status) VALUES (?,?,?,?) ON CONFLICT(user_id,device_id) DO UPDATE SET status=excluded.status,updated_at=CURRENT_TIMESTAMP').run(userRow.id, deviceId, deviceName ?? 'Unknown Device', 'pending');
      return res.json({ deviceApprovalRequired: true });
    }
  } else {
    db.prepare('INSERT OR IGNORE INTO trusted_devices(user_id,device_id,device_name) VALUES (?,?,?)').run(userRow.id, deviceId, deviceName ?? 'Admin Device');
  }

  const payload = { ...userRow, permissions, isAdmin };
  const token = signToken(payload);
  res.cookie('session', token, { httpOnly: true, sameSite: 'lax', secure: false, maxAge: 7 * 24 * 3600 * 1000 });
  res.json({ user: payload });
});

authRouter.get('/me', (req, res) => {
  const token = req.cookies?.session;
  if (!token) return res.json({ user: null });
  try {
    const jwt = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
    return res.json({ user: jwt });
  } catch {
    return res.json({ user: null });
  }
});

authRouter.post('/logout', (_req, res) => {
  res.clearCookie('session');
  res.json({ ok: true });
});
