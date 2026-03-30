import { Router } from 'express';
import { db } from '../db/client.js';
import { requireAuth, requirePermission } from '../middleware/auth.js';

export const contentRouter = Router();
contentRouter.use(requireAuth, requirePermission('content_access'));

contentRouter.get('/', (_req, res) => {
  res.json(db.prepare('SELECT id,product_id as productId,title,platform,publish_date as publishDate,status,notes FROM content_entries ORDER BY id DESC').all());
});

contentRouter.post('/', (req, res) => {
  const { productId, title, platform, publishDate, status, notes } = req.body;
  const row = db.prepare('INSERT INTO content_entries(product_id,title,platform,publish_date,status,notes) VALUES (?,?,?,?,?,?)').run(productId, title, platform, publishDate, status, notes ?? null);
  res.json({ id: row.lastInsertRowid });
});
