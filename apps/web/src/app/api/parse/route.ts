import { NextRequest, NextResponse } from 'next/server';
import type { ParsedProduct } from '@toppost/calc-engine';

const CATEGORY_HINTS: Record<string, string> = {
  shoe: 'shoes', sneaker: 'shoes', boot: 'shoes', sandal: 'shoes',
  shirt: 'clothing', jacket: 'clothing', dress: 'clothing', pants: 'clothing',
  jeans: 'clothing', hoodie: 'clothing', coat: 'clothing', sweater: 'clothing',
  bag: 'bags', backpack: 'bags', wallet: 'bags', purse: 'bags',
  phone: 'electronics', laptop: 'electronics', tablet: 'electronics',
  headphone: 'electronics', watch: 'electronics', camera: 'electronics',
  cream: 'cosmetics', perfume: 'cosmetics', serum: 'cosmetics',
  bike: 'sports', cycling: 'sports', running: 'sports', fitness: 'sports',
  helmet: 'sports', jersey: 'sports',
  ring: 'jewelry', necklace: 'jewelry', bracelet: 'jewelry', earring: 'jewelry',
  kids: 'kids', baby: 'kids', child: 'kids',
  supplement: 'supplements', vitamin: 'supplements', protein: 'supplements',
};

const WEIGHT_DEFAULTS: Record<string, number> = {
  clothing: 1.0, shoes: 1.5, bags: 1.0, electronics: 2.0,
  cosmetics: 0.5, sports: 2.0, jewelry: 0.3, home: 3.0,
  kids: 1.5, supplements: 1.0, other: 2.0,
};

function guessCategory(text: string): string {
  const lower = text.toLowerCase();
  for (const [keyword, cat] of Object.entries(CATEGORY_HINTS)) {
    if (lower.includes(keyword)) return cat;
  }
  return 'other';
}

function parseCurrency(raw: string): string {
  const c = raw.trim().toUpperCase();
  if (c === 'EUR' || c.includes('€')) return 'EUR';
  if (c === 'GBP' || c.includes('£')) return 'GBP';
  if (c === 'USD' || c.includes('$')) return 'USD';
  if (c === 'CHF') return 'EUR'; // approximate
  return 'EUR';
}

function parsePrice(raw: string): number | null {
  // Handle formats: "199,99", "199.99", "1.299,99", "1,299.99"
  let cleaned = raw.replace(/[^\d.,]/g, '');
  if (!cleaned) return null;

  // Detect European format: "1.299,99" or "199,99"
  if (cleaned.includes(',') && cleaned.includes('.')) {
    if (cleaned.lastIndexOf(',') > cleaned.lastIndexOf('.')) {
      // European: 1.299,99
      cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    } else {
      // US: 1,299.99
      cleaned = cleaned.replace(/,/g, '');
    }
  } else if (cleaned.includes(',')) {
    // Could be "199,99" (EUR) or "1,299" (USD thousands)
    const parts = cleaned.split(',');
    if (parts.length === 2 && parts[1].length === 2) {
      cleaned = cleaned.replace(',', '.');
    } else {
      cleaned = cleaned.replace(/,/g, '');
    }
  }

  const num = parseFloat(cleaned);
  return isNaN(num) || num <= 0 ? null : num;
}

async function fetchAndParse(url: string): Promise<ParsedProduct | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8,ru;q=0.7',
      },
    });

    if (!res.ok) {
      console.log(`[parse] HTTP ${res.status} for ${url}`);
      return null;
    }

    const html = await res.text();
    console.log(`[parse] Got ${html.length} bytes from ${url}`);
    const domain = new URL(url).hostname.replace(/^www\./, '');

    // Extract from JSON-LD
    let name = '';
    let price: number | null = null;
    let currency = 'EUR';
    let imageUrl = '';

    const jsonLdMatches = html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);
    for (const match of jsonLdMatches) {
      try {
        const data = JSON.parse(match[1]);
        const product = data['@type'] === 'Product' ? data
          : Array.isArray(data['@graph']) ? data['@graph'].find((n: { '@type': string }) => n['@type'] === 'Product')
          : null;

        if (product) {
          name = product.name || name;
          imageUrl = (typeof product.image === 'string' ? product.image : product.image?.[0]) || imageUrl;

          const offers = product.offers;
          if (offers) {
            const offer = Array.isArray(offers) ? offers[0] : offers;
            const offerPrice = offer?.price ?? offer?.lowPrice;
            if (offerPrice != null) {
              price = typeof offerPrice === 'number' ? offerPrice : parsePrice(String(offerPrice));
            }
            currency = parseCurrency(offer?.priceCurrency || 'EUR');
          }
        }
      } catch {
        // invalid JSON-LD, skip
      }
    }

    // Fallback: Open Graph meta tags
    if (!name) {
      const ogTitle = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"[^>]*>/i);
      name = ogTitle?.[1] || '';
    }
    if (!name) {
      const titleTag = html.match(/<title[^>]*>([^<]*)<\/title>/i);
      name = titleTag?.[1]?.trim() || `Product from ${domain}`;
    }

    if (price === null) {
      // Try og:price:amount
      const ogPrice = html.match(/<meta[^>]*property="(?:og:price:amount|product:price:amount)"[^>]*content="([^"]*)"[^>]*>/i);
      if (ogPrice) price = parsePrice(ogPrice[1]);
    }

    if (price === null) {
      // Try meta itemprop="price"
      const metaPrice = html.match(/<meta[^>]*itemprop="price"[^>]*content="([^"]*)"[^>]*>/i);
      if (metaPrice) price = parsePrice(metaPrice[1]);
    }

    if (price === null) {
      // Try JSON "price" fields in any script
      const jsonPricePatterns = [
        /"price"\s*:\s*"(\d[\d.,]+)"/i,
        /"price"\s*:\s*(\d[\d.,]+)/i,
        /"currentPrice"\s*:\s*"?(\d[\d.,]+)"?/i,
        /"salePrice"\s*:\s*"?(\d[\d.,]+)"?/i,
        /"selling_price"\s*:\s*"?(\d[\d.,]+)"?/i,
      ];
      for (const pat of jsonPricePatterns) {
        const m = html.match(pat);
        if (m) {
          const p = parsePrice(m[1]);
          if (p && p > 0.5 && p < 50000) { price = p; break; }
        }
      }
    }

    if (price === null) {
      // Try common price CSS patterns: class containing "price" with €/$/£ symbol nearby
      const priceHtmlPatterns = [
        /class="[^"]*price[^"]*"[^>]*>\s*(?:<[^>]*>)*\s*([\d.,]+)\s*[€£$]/i,
        /class="[^"]*price[^"]*"[^>]*>\s*(?:<[^>]*>)*\s*[€£$]\s*([\d.,]+)/i,
        /class="[^"]*price[^"]*"[^>]*>\s*(?:<[^>]*>\s*)*([\d.,]+)\s*&(?:euro|pound|dollar)/i,
        /([\d]+[.,]\d{2})\s*€/,
      ];
      for (const pat of priceHtmlPatterns) {
        const m = html.match(pat);
        if (m) {
          const p = parsePrice(m[1]);
          if (p && p > 0.5 && p < 50000) { price = p; break; }
        }
      }
    }

    if (!imageUrl) {
      const ogImage = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"[^>]*>/i);
      imageUrl = ogImage?.[1] || '';
    }

    // Currency fallback
    const ogCurrency = html.match(/<meta[^>]*property="(?:og:price:currency|product:price:currency)"[^>]*content="([^"]*)"[^>]*>/i);
    if (ogCurrency) currency = parseCurrency(ogCurrency[1]);

    // Sanity check: if price looks like cents (> 10000 and integer), convert
    if (price !== null && price > 5000 && Number.isInteger(price)) {
      price = price / 100;
    }

    console.log(`[parse] Extracted: name="${name}", price=${price}, currency=${currency}, image=${imageUrl ? 'yes' : 'no'}`);

    if (price === null || price < 0.5 || price > 50000) return null;

    // Clean up name: remove " | StoreName", " - StoreName" suffixes
    name = name.replace(/\s*[|–—-]\s*[^|–—-]+$/, '').trim();
    if (name.length > 120) name = name.slice(0, 117) + '...';

    const category = guessCategory(name);

    return {
      name,
      price,
      currency,
      imageUrl,
      category,
      estimatedWeightKg: WEIGHT_DEFAULTS[category] ?? 2.0,
      store: domain,
      parsedAt: new Date().toISOString(),
      cached: false,
    };
  } catch (err) {
    console.log(`[parse] Fetch error for ${url}:`, err instanceof Error ? err.message : err);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    const product = await fetchAndParse(url);

    if (!product) {
      return NextResponse.json(
        { error: 'Не удалось получить данные о товаре. Укажите данные вручную.' },
        { status: 422 },
      );
    }

    return NextResponse.json(product);
  } catch {
    return NextResponse.json(
      { error: 'Ошибка при обработке ссылки' },
      { status: 500 },
    );
  }
}
