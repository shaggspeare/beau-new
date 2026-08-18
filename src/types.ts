export type EntityType = 'master' | 'salon';

export interface ServiceItem {
  category: string;
  name: string;
  price: string;
  duration?: string;
}

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  viber?: string;
  telegram?: string;
  tiktok?: string;
  youtube?: string;
  website?: string;
  other: string[];
}

export interface ProfileListingMeta {
  url: string;
  name?: string;
  image?: string;
  address?: string;
  city?: string;
  socials?: SocialLinks;
  rating?: number | null;
  reviewsCount?: number | null;
}

export interface MasterRecord {
  id: string;
  slug: string;
  type: EntityType;
  name: string;
  title?: string;
  url: string;
  image: string;
  city: string;
  address: string;
  rating: number | null;
  reviewsCount: number | null;
  phones: string[];
  socials: SocialLinks;
  priceRange?: string;
  services: ServiceItem[];
  crawledAt: string;
}

export type CrawlerEngineType = 'playwright' | 'firecrawl' | 'hybrid' | 'direct';

export interface CrawlOptions {
  url: string;
  limit?: number;
  maxPages?: number;
  engine: CrawlerEngineType;
  delayMin?: number;
  delayMax?: number;
  outputDir?: string;
  format?: 'all' | 'json' | 'csv';
  entityType?: 'all' | 'master' | 'salon';
  headless?: boolean;
}

export interface ListingResult {
  profileUrls: string[];
  metadataMap: Record<string, ProfileListingMeta>;
  nextPageUrl?: string;
  totalFound?: number;
}
