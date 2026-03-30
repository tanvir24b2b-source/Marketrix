import { Router } from 'express';
import { db } from '../db/client.js';
import { requireAuth, requirePermission } from '../middleware/auth.js';

export const dashboardRouter = Router();
dashboardRouter.use(requireAuth, requirePermission('dashboard_access'));

dashboardRouter.get('/stats', (_req, res) => {
  const count = (table: string) => (db.prepare(`SELECT COUNT(*) as c FROM ${table}`).get() as any).c;
  res.json({ products: count('products'), contents: count('content_entries'), ads: count('ad_entries'), users: count('users') });
});
