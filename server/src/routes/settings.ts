import { Router } from 'express';
import { db } from '../db/client.js';
import { requireAuth, requirePermission } from '../middleware/auth.js';
import { hashPassword } from '../utils/auth.js';

export const settingsRouter = Router();
settingsRouter.use(requireAuth);

settingsRouter.patch('/profile', (req, res) => {
  const { name, imageUrl } = req.body;
  db.prepare('UPDATE users SET name=?, image_url=? WHERE id=?').run(name, imageUrl ?? null, req.user!.id);
  res.json({ ok: true });
});

settingsRouter.get('/users', requirePermission('manage_users'), (_req, res) => {
  res.json(db.prepare(`SELECT u.id,u.name,u.email,u.active,u.image_url as imageUrl,u.role_id as roleId,r.name as roleName FROM users u JOIN roles r ON r.id=u.role_id`).all());
});

settingsRouter.post('/users', requirePermission('manage_users'), async (req, res) => {
  const { name, email, password, roleId } = req.body;
  const hash = await hashPassword(password);
  const row = db.prepare('INSERT INTO users(name,email,password_hash,role_id) VALUES (?,?,?,?)').run(name, email, hash, roleId);
  res.json({ id: row.lastInsertRowid });
});

settingsRouter.get('/roles', requirePermission('manage_roles'), (_req, res) => {
  const roles = db.prepare('SELECT id,name FROM roles').all() as any[];
  const permStmt = db.prepare('SELECT permission FROM role_permissions WHERE role_id=?');
  res.json(roles.map((r) => ({ ...r, permissions: permStmt.all(r.id).map((x: any) => x.permission) })));
});

settingsRouter.post('/roles', requirePermission('manage_roles'), (req, res) => {
  const { name, permissions } = req.body as { name: string; permissions: string[] };
  const row = db.prepare('INSERT INTO roles(name) VALUES (?)').run(name);
  for (const p of permissions) db.prepare('INSERT INTO role_permissions(role_id,permission) VALUES (?,?)').run(row.lastInsertRowid, p);
  res.json({ id: row.lastInsertRowid });
});

settingsRouter.patch('/roles/:id', requirePermission('manage_roles'), (req, res) => {
  const id = Number(req.params.id);
  const { name, permissions } = req.body as { name: string; permissions: string[] };
  db.prepare('UPDATE roles SET name=? WHERE id=?').run(name, id);
  db.prepare('DELETE FROM role_permissions WHERE role_id=?').run(id);
  for (const p of permissions) db.prepare('INSERT INTO role_permissions(role_id,permission) VALUES (?,?)').run(id, p);
  res.json({ ok: true });
});

settingsRouter.get('/devices', requirePermission('approve_devices'), (_req, res) => {
  res.json(db.prepare(`SELECT d.id,d.user_id as userId,u.email as userEmail,d.device_id as deviceId,d.device_name as deviceName,d.status,d.created_at as createdAt FROM device_requests d JOIN users u ON u.id=d.user_id WHERE d.status='pending' ORDER BY d.id DESC`).all());
});

settingsRouter.patch('/devices/:id', requirePermission('approve_devices'), (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body as { status: 'approved' | 'rejected' };
  const row = db.prepare('SELECT user_id as userId, device_id as deviceId, device_name as deviceName FROM device_requests WHERE id=?').get(id) as any;
  if (!row) return res.status(404).json({ message: 'Request not found' });
  db.prepare('UPDATE device_requests SET status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?').run(status, id);
  if (status === 'approved') db.prepare('INSERT OR IGNORE INTO trusted_devices(user_id,device_id,device_name) VALUES (?,?,?)').run(row.userId, row.deviceId, row.deviceName);
  res.json({ ok: true });
});
