import express from 'express';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import { parseRouter } from './routes/parse.js';
import { ratesRouter } from './routes/rates.js';
import { calculateRouter } from './routes/calculate.js';
import { shareRouter } from './routes/share.js';

const app = express();
const PORT = parseInt(process.env.PORT_API || '3001', 10);

// CORS
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'https://toppost.de',
      'https://www.toppost.de',
    ],
  })
);

// JSON body parser
app.use(express.json());

// Rate limiting for /api/v1/parse
const parseLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/v1/parse', parseLimiter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/v1/parse', parseRouter);
app.use('/api/v1/rates', ratesRouter);
app.use('/api/v1/calculate', calculateRouter);
app.use('/api/v1/share', shareRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handling middleware
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
);

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});

export default app;
