import * as cheerio from 'cheerio';
import { ListingResult, ProfileListingMeta } from '../types';
import { categorizeSocialLinks, cleanAddress, cleanName } from './profile.parser';

/**
 * Parses a barb.ua category listing page (e.g. https://barb.ua/uk/ruki/manikur)
 * and extracts all profile URLs for masters and salons along with their metadata.
 */
export function parseListingPage(html: string, currentUrl: string): ListingResult {
  const $ = cheerio.load(html);
  const profileUrls = new Set<string>();
  const metadataMap: Record<string, ProfileListingMeta> = {};

  // 1. Try extracting from JSON-LD Schema.org ItemList
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const text = $(el).html()?.trim();
      if (!text) return;
      const json = JSON.parse(text);
      if (json['@type'] === 'ItemList' && Array.isArray(json.itemListElement)) {
        for (const listItem of json.itemListElement) {
          const item = listItem.item || listItem;
          const profileUrl = item?.url || item?.['@id'];
          if (
            profileUrl &&
            typeof profileUrl === 'string' &&
            (profileUrl.includes('/master/') || profileUrl.includes('/salon/'))
          ) {
            profileUrls.add(profileUrl);

            const socials = Array.isArray(item.sameAs) ? categorizeSocialLinks(item.sameAs) : undefined;
            const address = item.address?.streetAddress ? cleanAddress(item.address.streetAddress) : undefined;
            const city = item.address?.addressLocality || 'Київ';
            const name = item.name ? cleanName(item.name) : undefined;
            const image = typeof item.image === 'string' ? item.image : item.image?.url;
            const rating = item.aggregateRating?.ratingValue ? parseFloat(item.aggregateRating.ratingValue) : null;
            const reviewsCount = item.aggregateRating?.reviewCount ? parseInt(item.aggregateRating.reviewCount, 10) : null;

            metadataMap[profileUrl] = {
              url: profileUrl,
              name,
              image,
              address,
              city,
              socials,
              rating,
              reviewsCount
            };
          }
        }
      }
    } catch {
      // ignore JSON parse error in non-conforming blocks
    }
  });

  // 2. Try extracting from window.sellers JavaScript array in script tags
  $('script:not([src])').each((_, el) => {
    const content = $(el).html() || '';
    if (content.includes('window.sellers')) {
      const match = content.match(/window\.sellers\s*=\s*(\[.*?\]);/s);
      if (match && match[1]) {
        try {
          const sellers = JSON.parse(match[1]);
          if (Array.isArray(sellers)) {
            for (const s of sellers) {
              const u = s.seller?.url;
              if (u && typeof u === 'string') {
                profileUrls.add(u);
                if (!metadataMap[u]) {
                  const fullName = [s.seller.name, s.seller.last_name].filter(Boolean).join(' ');
                  metadataMap[u] = {
                    url: u,
                    name: fullName ? cleanName(fullName) : undefined
                  };
                }
              }
            }
          }
        } catch {
          // fallback regex if JSON.parse fails
          const urlMatches = match[1].match(/https:\\\/\\\/barb\.ua\\\/uk\\\/(?:master|salon)\\\/[a-zA-Z0-9_-]+/g);
          if (urlMatches) {
            for (const raw of urlMatches) {
              const cleanUrl = raw.replace(/\\\//g, '/');
              profileUrls.add(cleanUrl);
            }
          }
        }
      }
    }
  });

  // 3. Fallback: Parse anchor tags in DOM
  $('a[href*="/master/"], a[href*="/salon/"]').each((_, el) => {
    let href = $(el).attr('href');
    if (!href) return;

    if (
      href.includes('/comments') ||
      href.includes('/add-comment') ||
      href.includes('/photos') ||
      href.includes('/portfolio') ||
      href.startsWith('#')
    ) {
      return;
    }

    if (href.startsWith('/')) {
      href = `https://barb.ua${href}`;
    }

    href = href.split('#')[0].split('?')[0];

    if (
      (href.includes('barb.ua/uk/master/') ||
        href.includes('barb.ua/master/') ||
        href.includes('barb.ua/uk/salon/') ||
        href.includes('barb.ua/salon/')) &&
      !href.endsWith('/master') &&
      !href.endsWith('/salon')
    ) {
      profileUrls.add(href);
    }
  });

  // 4. Discover next page pagination link
  let nextPageUrl: string | undefined;
  const nextLink = $('.pagination .next a, .pagination li.active + li a, a[rel="next"]').first();
  if (nextLink.length > 0) {
    let nextHref = nextLink.attr('href');
    if (nextHref) {
      if (nextHref.startsWith('/')) {
        nextHref = `https://barb.ua${nextHref}`;
      } else if (!nextHref.startsWith('http')) {
        const base = new URL(currentUrl);
        nextHref = new URL(nextHref, base.origin).toString();
      }
      nextPageUrl = nextHref;
    }
  }

  return {
    profileUrls: Array.from(profileUrls),
    metadataMap,
    nextPageUrl,
    totalFound: profileUrls.size
  };
}
