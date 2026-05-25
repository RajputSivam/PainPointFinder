import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import { initScrapeQueue } from './services/queueService.js';
import authRoutes from './routes/authRoutes.js';
import findRoutes from './routes/findRoutes.js';
import finalizeRoutes from './routes/finalizeRoutes.js';
import supportRoutes from './routes/supportRoutes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
  })
);
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ status: 'ok', message: 'PainPointFinder API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/find', findRoutes);
app.use('/api/finalize', finalizeRoutes);
app.use('/api/support', supportRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'PainPointFinder API is running' });
});

app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

const startServer = async () => {
  await connectDB();
  initScrapeQueue();
  app.listen(PORT, () => {
    console.log(`PainPointFinder server running on port ${PORT}`);
  });
};

startServer().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});