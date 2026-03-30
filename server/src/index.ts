import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { initDb } from './db/client.js';
import { authRouter } from './routes/auth.js';
import { dashboardRouter } from './routes/dashboard.js';
import { productsRouter } from './routes/products.js';
import { contentRouter } from './routes/content.js';
import { adsRouter } from './routes/ads.js';
import { settingsRouter } from './routes/settings.js';

initDb();
const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/products', productsRouter);
app.use('/api/content', contentRouter);
app.use('/api/ads', adsRouter);
app.use('/api/settings', settingsRouter);

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => console.log(`API running on ${port}`));
