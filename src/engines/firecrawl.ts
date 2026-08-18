import FirecrawlApp from '@mendable/firecrawl-js';
import { ICrawlerEngine } from './base';
import { MasterRecord, ListingResult, ProfileListingMeta } from '../types';
import { parseListingPage } from '../parsers/listing.parser';
import { parseProfilePage } from '../parsers/profile.parser';
import { config } from '../config';

export class FirecrawlEngine implements ICrawlerEngine {
  readonly name = 'firecrawl';
  private firecrawl: FirecrawlApp;

  constructor(apiKey?: string) {
    const key = apiKey || config.firecrawlApiKey;
    if (!key) {
      throw new Error('Firecrawl API key is missing. Please provide FIRECRAWL_API_KEY in .env or pass as argument.');
    }
    this.firecrawl = new FirecrawlApp({ apiKey: key });
  }

  async crawlListing(url: string, _maxPages?: number, _limit?: number): Promise<ListingResult> {
    const scrapeResult = await this.firecrawl.scrapeUrl(url, {
      formats: ['rawHtml', 'html'],
      onlyMainContent: false
    });

    if (!scrapeResult.success) {
      throw new Error(`Firecrawl failed to scrape listing: ${scrapeResult.error || 'Unknown error'}`);
    }

    const html = scrapeResult.rawHtml || scrapeResult.html || '';
    return parseListingPage(html, url);
  }

  async extractProfile(url: string, preMeta?: ProfileListingMeta): Promise<MasterRecord> {
    const scrapeResult = await this.firecrawl.scrapeUrl(url, {
      formats: ['rawHtml', 'html'],
      onlyMainContent: false
    });

    if (!scrapeResult.success) {
      throw new Error(`Firecrawl failed to scrape profile ${url}: ${scrapeResult.error || 'Unknown error'}`);
    }

    const html = scrapeResult.rawHtml || scrapeResult.html || '';
    const record = parseProfilePage(html, url, preMeta?.socials);

    if (preMeta) {
      if (!record.image && preMeta.image) record.image = preMeta.image;
      if (!record.address && preMeta.address) record.address = preMeta.address;
      if (preMeta.name && (record.name === record.slug || !record.name)) record.name = preMeta.name;
      if (record.rating === null && preMeta.rating !== undefined) record.rating = preMeta.rating;
      if (record.reviewsCount === null && preMeta.reviewsCount !== undefined) {
        record.reviewsCount = preMeta.reviewsCount;
      }
    }

    return record;
  }
}
