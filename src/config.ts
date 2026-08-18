import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  firecrawlApiKey: process.env.FIRECRAWL_API_KEY || '',
  baseUrl: process.env.BARB_BASE_URL || 'https://barb.ua',
  defaultUserAgent:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  defaultHeaders: {
    'Accept-Language': 'uk-UA,uk;q=0.9,ru;q=0.8,en-US;q=0.7,en;q=0.6',
    'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Sec-Fetch-Site': 'same-origin',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Dest': 'document',
    'X-Requested-With': 'XMLHttpRequest'
  },
  defaultOutputDir: path.resolve(process.cwd(), 'output')
};
