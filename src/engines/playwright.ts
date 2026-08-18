import { chromium, Browser, BrowserContext } from 'playwright';
import { ICrawlerEngine } from './base';
import { MasterRecord, ListingResult, ProfileListingMeta } from '../types';
import { parseListingPage } from '../parsers/listing.parser';
import { parseProfilePage } from '../parsers/profile.parser';
import { config } from '../config';

export class PlaywrightEngine implements ICrawlerEngine {
  readonly name = 'playwright';
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private isHeadless: boolean;

  constructor(headless: boolean = true) {
    this.isHeadless = headless;
  }

  private async init() {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: this.isHeadless,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-blink-features=AutomationControlled'
        ]
      });
      this.context = await this.browser.newContext({
        userAgent: config.defaultUserAgent,
        locale: 'uk-UA',
        viewport: { width: 1280, height: 800 }
      });
    }
  }

  async crawlListing(url: string, _maxPages?: number, _limit?: number): Promise<ListingResult> {
    await this.init();
    const page = await this.context!.newPage();

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(1000);
      const html = await page.content();
      return parseListingPage(html, url);
    } finally {
      await page.close();
    }
  }

  async extractProfile(url: string, preMeta?: ProfileListingMeta): Promise<MasterRecord> {
    await this.init();
    const page = await this.context!.newPage();

    try {
      await page.route('**/*.{png,jpg,jpeg,gif,webp,svg,woff,woff2}', (route) => {
        const reqUrl = route.request().url();
        if (reqUrl.includes('barb.ua/build')) {
          route.continue();
        } else {
          route.abort();
        }
      });

      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      const html = await page.content();
      const record = parseProfilePage(html, url, preMeta?.socials);

      if (preMeta) {
        if (!record.image && preMeta.image) record.image = preMeta.image;
        if (!record.address && preMeta.address) record.address = preMeta.address;
        if (preMeta.name && record.name === record.slug) record.name = preMeta.name;
        if (record.rating === null && preMeta.rating !== undefined) record.rating = preMeta.rating;
        if (record.reviewsCount === null && preMeta.reviewsCount !== undefined) {
          record.reviewsCount = preMeta.reviewsCount;
        }
      }

      return record;
    } finally {
      await page.close();
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.context = null;
    }
  }
}
