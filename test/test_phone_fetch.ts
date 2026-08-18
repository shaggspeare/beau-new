import FirecrawlApp from '@mendable/firecrawl-js';
import { config } from '../src/config';
import * as cheerio from 'cheerio';

async function testPhoneEndpoints() {
  const fc = new FirecrawlApp({ apiKey: config.firecrawlApiKey });

  console.log('--- 1. Testing Firecrawl scrape with exact action click on afelcher ---');
  // afelcher uid: 397205. The button has class 'click_by_phone'
  const res = await fc.scrapeUrl('https://barb.ua/uk/master/afelcher', {
    formats: ['rawHtml', 'html'],
    actions: [
      { type: 'wait', milliseconds: 1000 },
      // Click the phone link
      { type: 'click', selector: 'a[data-target*="collapsed-phones"]' },
      { type: 'wait', milliseconds: 2000 }
    ]
  });

  console.log('Action success:', res.success);
  if (res.success && (res.rawHtml || res.html)) {
    const html = res.rawHtml || res.html || '';
    const $ = cheerio.load(html);
    console.log('Text around phones after click:');
    $('.seller-address__phones, #getMelistingPhones, .modal-body, div[id*="collapsed-phones"]').each((_, el) => {
      console.log('Found:', $(el).text().replace(/\s+/g, ' ').trim());
    });
  }
}

testPhoneEndpoints();
