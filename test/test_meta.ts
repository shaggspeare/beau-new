import FirecrawlApp from '@mendable/firecrawl-js';
import { config } from '../src/config';
import { parseListingPage } from '../src/parsers/listing.parser';

async function test() {
  const fc = new FirecrawlApp({ apiKey: config.firecrawlApiKey });
  const res = await fc.scrapeUrl('https://barb.ua/uk/ruki/manikur', { formats: ['rawHtml'] });
  if (res.success && res.rawHtml) {
    const list = parseListingPage(res.rawHtml, 'https://barb.ua/uk/ruki/manikur');
    console.log('Listing parsed profiles count:', list.profileUrls.length);
    console.log('Metadata map sample:');
    for (const [url, meta] of Object.entries(list.metadataMap).slice(0, 3)) {
      console.log(url, '=>', meta.name, '| Socials:', meta.socials);
    }
  }
}

test();
