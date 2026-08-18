import FirecrawlApp from '@mendable/firecrawl-js';
import { config } from '../src/config';
import * as cheerio from 'cheerio';
import { parseListingPage } from '../src/parsers/listing.parser';

async function testProfiles() {
  const fc = new FirecrawlApp({ apiKey: config.firecrawlApiKey });
  const listRes = await fc.scrapeUrl('https://barb.ua/uk/ruki/manikur', { formats: ['rawHtml'] });
  if (!listRes.success || !listRes.rawHtml) return;

  const listing = parseListingPage(listRes.rawHtml, 'https://barb.ua/uk/ruki/manikur');
  console.log(`Found ${listing.profileUrls.length} profile URLs.`);

  for (const url of listing.profileUrls.slice(0, 5)) {
    console.log(`\nChecking ${url}...`);
    const res = await fc.scrapeUrl(url, { formats: ['rawHtml', 'html'] });
    if (res.success) {
      const html = res.rawHtml || res.html || '';
      const $ = cheerio.load(html);

      // Search for any phones or tel links or viber links
      $('a[href^="tel:"], a[href*="viber"], a[href*="wa.me"], a[href*="t.me"]').each((_, el) => {
        console.log('  Social/Tel link:', $(el).attr('href'));
      });

      // Search for phone numbers in description / about
      const desc = $('.seller-about, .seller-desc, meta[name="description"]').text();
      const phoneMatches = desc.match(/(?:\+?38)?\s*\(?0\d{2}\)?[\s.-]?\d{3}[\s.-]?\d{2}[\s.-]?\d{2}/g);
      if (phoneMatches) {
        console.log('  Phone in description:', phoneMatches);
      }

      // Check seller phones block
      const phoneBlock = $('.seller-address__phones, .phones-block').text().replace(/\s+/g, ' ').trim();
      console.log('  Phone block text:', phoneBlock);
    }
  }
}

testProfiles();
