import { Router } from 'express';
import { db } from '../db/client.js';
import { requireAuth, requirePermission } from '../middleware/auth.js';

export const adsRouter = Router();
adsRouter.use(requireAuth, requirePermission('ads_access'));

adsRouter.get('/', (_req, res) => {
  const entries = db.prepare('SELECT id,product_id as productId,status,notes FROM ad_entries ORDER BY id DESC').all() as any[];
  const videosStmt = db.prepare('SELECT id,url,status,notes FROM ad_videos WHERE ad_entry_id=?');
  res.json(entries.map((e) => ({ ...e, videos: videosStmt.all(e.id) })));
});

adsRouter.post('/', (req, res) => {
  const { productId, status, notes } = req.body;
  const row = db.prepare('INSERT INTO ad_entries(product_id,status,notes) VALUES (?,?,?)').run(productId, status, notes ?? null);
  res.json({ id: row.lastInsertRowid });
});

adsRouter.post('/videos', (req, res) => {
  const { adEntryId, url, status, notes } = req.body;
  try {
    const row = db.prepare('INSERT INTO ad_videos(ad_entry_id,url,status,notes) VALUES (?,?,?,?)').run(adEntryId, url, status, notes ?? null);
    res.json({ id: row.lastInsertRowid });
  } catch {
    res.status(400).json({ message: 'Duplicate or invalid video URL' });
  }
});
