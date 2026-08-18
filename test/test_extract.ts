import FirecrawlApp from '@mendable/firecrawl-js';
import { z } from 'zod';
import { config } from '../src/config';

async function test() {
  const fc = new FirecrawlApp({ apiKey: config.firecrawlApiKey });
  console.log('Testing Firecrawl extract schema with Zod...');

  const schema = z.object({
    name: z.string(),
    address: z.string(),
    phones: z.array(z.string()),
    instagram: z.string().optional(),
    facebook: z.string().optional(),
    services: z.array(
      z.object({
        category: z.string(),
        name: z.string(),
        price: z.string()
      })
    )
  });

  const res = await fc.scrapeUrl('https://barb.ua/uk/master/afelcher', {
    formats: ['extract'],
    extract: {
      prompt: 'Extract master name, address, phone numbers if available, social media links, and the services with prices.',
      schema
    }
  });

  console.log('Extract result:', JSON.stringify(res, null, 2));
}

test();
