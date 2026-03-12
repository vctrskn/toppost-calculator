import { Router } from 'express';
import { nanoid } from 'nanoid';
import { getRedis } from '../redis.js';

export const shareRouter = Router();

const SHARE_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days

shareRouter.post('/', async (req, res) => {
  try {
    const { params } = req.body;

    if (!params || typeof params !== 'object') {
      res.status(400).json({ error: 'params object is required' });
      return;
    }

    const id = nanoid(8);
    const cacheKey = `share:${id}`;

    const redis = getRedis();
    if (redis) {
      await redis.set(cacheKey, JSON.stringify(params), 'EX', SHARE_TTL_SECONDS);
    } else {
      res.status(503).json({ error: 'Sharing is temporarily unavailable (Redis not connected)' });
      return;
    }

    const baseUrl = process.env.BASE_URL || 'https://toppost.de';
    res.json({
      id,
      url: `${baseUrl}/calculator?share=${id}`,
      expiresIn: '30 days',
    });
  } catch (err) {
    console.error('Share error:', err);
    res.status(500).json({ error: 'Failed to create share link' });
  }
});

shareRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `share:${id}`;

    const redis = getRedis();
    if (!redis) {
      res.status(503).json({ error: 'Sharing is temporarily unavailable' });
      return;
    }

    const data = await redis.get(cacheKey);
    if (!data) {
      res.status(404).json({ error: 'Share link not found or expired' });
      return;
    }

    res.json({ params: JSON.parse(data) });
  } catch (err) {
    console.error('Share fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch share data' });
  }
});
