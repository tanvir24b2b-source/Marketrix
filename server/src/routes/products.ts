import { Router } from 'express';
import { db } from '../db/client.js';
import { requireAuth, requirePermission } from '../middleware/auth.js';

export const productsRouter = Router();
productsRouter.use(requireAuth, requirePermission('products_access'));

productsRouter.get('/', (_req, res) => {
  res.json(db.prepare('SELECT id,name,buying_price as buyingPrice,selling_price as sellingPrice,status,notes FROM products ORDER BY id DESC').all());
});
productsRouter.post('/', (req, res) => {
  const { name, buyingPrice, sellingPrice, status, notes } = req.body;
  const row = db.prepare('INSERT INTO products(name,buying_price,selling_price,status,notes) VALUES (?,?,?,?,?)').run(name, buyingPrice, sellingPrice, status, notes ?? null);
  res.json({ id: row.lastInsertRowid });
});
