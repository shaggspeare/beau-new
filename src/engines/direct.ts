import axios, { AxiosInstance } from 'axios';
import { ICrawlerEngine } from './base';
import { MasterRecord, ListingResult, ProfileListingMeta } from '../types';
import { parseListingPage } from '../parsers/listing.parser';
import { parseProfilePage } from '../parsers/profile.parser';
import { config } from '../config';

export class DirectHttpEngine implements ICrawlerEngine {
  readonly name = 'direct';
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      headers: config.defaultHeaders,
      timeout: 15000,
      validateStatus: () => true
    });
  }

  async crawlListing(url: string, _maxPages?: number, _limit?: number): Promise<ListingResult> {
    const response = await this.client.get(url);
    if (response.status >= 400) {
      throw new Error(`Failed to fetch listing from ${url}, status: ${response.status}`);
    }
    return parseListingPage(response.data, url);
  }

  async extractProfile(url: string, preMeta?: ProfileListingMeta): Promise<MasterRecord> {
    const response = await this.client.get(url);
    if (response.status >= 400) {
      throw new Error(`Failed to fetch profile from ${url}, status: ${response.status}`);
    }

    const record = parseProfilePage(response.data, url, preMeta?.socials);
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
  }
}
