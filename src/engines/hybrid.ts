import { ICrawlerEngine } from './base';
import { MasterRecord, ListingResult, ProfileListingMeta } from '../types';
import { PlaywrightEngine } from './playwright';
import { DirectHttpEngine } from './direct';
import { FirecrawlEngine } from './firecrawl';
import { config } from '../config';

export class HybridEngine implements ICrawlerEngine {
  readonly name = 'hybrid';
  private playwrightEngine: PlaywrightEngine;
  private directEngine: DirectHttpEngine;
  private firecrawlEngine?: FirecrawlEngine;

  constructor(headless: boolean = true) {
    this.playwrightEngine = new PlaywrightEngine(headless);
    this.directEngine = new DirectHttpEngine();
    if (config.firecrawlApiKey) {
      try {
        this.firecrawlEngine = new FirecrawlEngine(config.firecrawlApiKey);
      } catch {
        // firecrawl engine optional
      }
    }
  }

  async crawlListing(url: string, maxPages?: number, limit?: number): Promise<ListingResult> {
    // 1. Try Firecrawl first (bypasses Cloudflare on barb.ua cleanly)
    if (this.firecrawlEngine) {
      try {
        const res = await this.firecrawlEngine.crawlListing(url, maxPages, limit);
        if (res.profileUrls.length > 0) {
          return res;
        }
      } catch {
        // Fallback
      }
    }

    // 2. Try Direct HTTP
    try {
      const res = await this.directEngine.crawlListing(url, maxPages, limit);
      if (res.profileUrls.length > 0) {
        return res;
      }
    } catch {
      // Fallback
    }

    // 3. Fallback to Playwright
    try {
      const res = await this.playwrightEngine.crawlListing(url, maxPages, limit);
      if (res.profileUrls.length > 0) {
        return res;
      }
    } catch {
      // Fallback
    }

    return { profileUrls: [], metadataMap: {} };
  }

  async extractProfile(url: string, preMeta?: ProfileListingMeta): Promise<MasterRecord> {
    // 1. Try Firecrawl Engine (bypasses Cloudflare & captures full profile)
    if (this.firecrawlEngine) {
      try {
        const fcRecord = await this.firecrawlEngine.extractProfile(url, preMeta);
        if (fcRecord.name && (fcRecord.services.length > 0 || fcRecord.image)) {
          return fcRecord;
        }
      } catch {
        // Fallback
      }
    }

    // 2. Try Playwright
    try {
      const pwRecord = await this.playwrightEngine.extractProfile(url, preMeta);
      if (pwRecord.name) {
        return pwRecord;
      }
    } catch {
      // Fallback
    }

    // 3. Try Direct HTTP
    try {
      return await this.directEngine.extractProfile(url, preMeta);
    } catch {
      // Fallback
    }

    return {
      id: url.split('/').pop() || 'unknown',
      slug: url.split('/').pop() || 'unknown',
      type: url.includes('/master/') ? 'master' : 'salon',
      name: preMeta?.name || url.split('/').pop() || 'unknown',
      url,
      image: preMeta?.image || '',
      city: preMeta?.city || 'Київ',
      address: preMeta?.address || '',
      rating: preMeta?.rating || null,
      reviewsCount: preMeta?.reviewsCount || null,
      phones: [],
      socials: preMeta?.socials || { other: [] },
      services: [],
      crawledAt: new Date().toISOString()
    };
  }

  async close(): Promise<void> {
    await this.playwrightEngine.close();
  }
}
