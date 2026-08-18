import { MasterRecord, ListingResult, ProfileListingMeta } from '../types';

export interface ICrawlerEngine {
  readonly name: string;

  /**
   * Crawls a category listing page and returns profile URLs & metadata.
   */
  crawlListing(url: string, maxPages?: number, limit?: number): Promise<ListingResult>;

  /**
   * Extracts detailed Master/Salon record from a profile page.
   */
  extractProfile(url: string, preMeta?: ProfileListingMeta): Promise<MasterRecord>;

  /**
   * Clean up resources (e.g. browser instances).
   */
  close?(): Promise<void>;
}
