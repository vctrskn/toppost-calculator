import { Router } from 'express';
import { createHash } from 'crypto';
import { getRedis } from '../redis';
import type { ParsedProduct } from '@toppost/calc-engine';

export const parseRouter = Router();

function isValidUrl(str: string): boolean {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function extractDomain(url: string): string {
  const parsed = new URL(url);
  return parsed.hostname.replace(/^www\./, '');
}

function hashUrl(url: string): string {
  return createHash('sha256').update(url).digest('hex');
}

parseRouter.post('/', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url || typeof url !== 'string') {
      res.status(400).json({ error: 'URL is required' });
      return;
    }

    if (!isValidUrl(url)) {
      res.status(400).json({ error: 'Invalid URL. Must be HTTP or HTTPS.' });
      return;
    }

    const domain = extractDomain(url);
    const cacheKey = `parse:${hashUrl(url)}`;

    // Check Redis cache
    const redis = getRedis();
    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        const parsed: ParsedProduct = JSON.parse(cached);
        res.json({ ...parsed, cached: true });
        return;
      }
    }

    // TODO: implement store-specific parsers
    // For now, return a mock response
    const mockResult: ParsedProduct = {
      name: `Product from ${domain}`,
      price: 99.99,
      currency: 'EUR',
      imageUrl: '',
      category: 'other',
      estimatedWeightKg: 1.0,
      store: domain,
      parsedAt: new Date().toISOString(),
      cached: false,
    };

    // Cache in Redis
    if (redis) {
      await redis.set(cacheKey, JSON.stringify(mockResult), 'EX', 3600);
    }

    res.json(mockResult);
  } catch (err) {
    console.error('Parse error:', err);
    res.status(500).json({ error: 'Failed to parse URL' });
  }
});
