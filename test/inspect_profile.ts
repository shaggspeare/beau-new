import FirecrawlApp from '@mendable/firecrawl-js';
import * as cheerio from 'cheerio';
import { config } from '../src/config';

async function inspect() {
  const fc = new FirecrawlApp({ apiKey: config.firecrawlApiKey });
  const res = await fc.scrapeUrl('https://barb.ua/uk/master/afelcher', { formats: ['html'] });

  if (!res.success || !res.html) {
    console.log('Failed:', res.error);
    return;
  }

  const $ = cheerio.load(res.html);

  console.log('--- PHONE HTML FRAGMENT ---');
  $('*:contains("показати номер"), *:contains("+38")').each((_, el) => {
    const $el = $(el);
    if ($el.children().length < 3) {
      console.log('Class:', $el.attr('class'), 'Onclick:', $el.attr('onclick'), 'HTML:', $el.html());
    }
  });

  console.log('\n--- SOCIAL LINKS HTML ---');
  $('a[href*="instagram"], a[href*="facebook"], a[href*="tiktok"], a[href*="t.me"], a[href*="viber"]').each((_, el) => {
    console.log('Found social <a>:', $(el).attr('href'));
  });

  console.log('\n--- SCRIPT WITH PHONE AJAX ---');
  $('script').each((_, el) => {
    const text = $(el).html() || '';
    if (text.includes('getMeSellerPhones') || text.includes('parsers_') || text.includes('ajax')) {
      console.log('Script snippet:', text.substring(0, 300));
    }
  });
}

inspect();
