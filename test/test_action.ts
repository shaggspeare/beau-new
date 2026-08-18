import FirecrawlApp from '@mendable/firecrawl-js';
import { config } from '../src/config';
import * as cheerio from 'cheerio';
import { parseProfilePage } from '../src/parsers/profile.parser';

async function test() {
  const fc = new FirecrawlApp({ apiKey: config.firecrawlApiKey });
  const res = await fc.scrapeUrl('https://barb.ua/uk/master/afelcher', {
    formats: ['html'],
    actions: [
      { type: 'wait', milliseconds: 1000 },
      { type: 'click', selector: 'a.click_by_phone[data-target]' },
      { type: 'wait', milliseconds: 2000 }
    ]
  });

  console.log('Action Scrape Success:', res.success);
  if (res.success && res.html) {
    const $ = cheerio.load(res.html);
    console.log('Phones in DOM:');
    $('.seller-address__phones, #getMelistingPhones, .modal').each((_, el) => {
      console.log('Phone text:', $(el).text().replace(/\s+/g, ' ').trim());
    });
    const parsed = parseProfilePage(res.html, 'https://barb.ua/uk/master/afelcher');
    console.log('Parsed:', JSON.stringify(parsed, null, 2));
  } else {
    console.log('Error:', res.error);
  }
}

test();
