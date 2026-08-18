import * as cheerio from 'cheerio';
import { MasterRecord, ServiceItem, SocialLinks, EntityType } from '../types';

/**
 * Cleans extracted name.
 */
export function cleanName(rawName: string): string {
  if (!rawName) return '';
  return rawName
    .replace(/^[«"']+|[»"']+$/g, '')
    .replace(/\s*\([^)]*\)\s*$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Cleans extracted address.
 */
export function cleanAddress(rawAddress: string): string {
  if (!rawAddress) return '';
  let cleaned = rawAddress;
  cleaned = cleaned.split(/\+−Leaflet/i)[0];
  cleaned = cleaned.split(/Дивитися на карті/i)[0];
  cleaned = cleaned.split(/Показати графік роботи/i)[0];
  return cleaned.replace(/\s+/g, ' ').trim();
}

/**
 * Extracts and categorizes social media channels from URLs and text.
 */
export function categorizeSocialLinks(urls: string[], extraText?: string): SocialLinks {
  const socials: SocialLinks = { other: [] };
  const uniqueUrls = Array.from(new Set(urls.map((u) => u.trim()))).filter(Boolean);

  for (const url of uniqueUrls) {
    const lower = url.toLowerCase();
    if (lower.includes('instagram.com/')) {
      socials.instagram = url;
    } else if (lower.includes('facebook.com/') || lower.includes('fb.com/')) {
      socials.facebook = url;
    } else if (lower.includes('t.me/') || lower.includes('telegram.me/')) {
      socials.telegram = url;
    } else if (lower.includes('viber://') || lower.includes('viber.click')) {
      socials.viber = url;
    } else if (lower.includes('tiktok.com/')) {
      socials.tiktok = url;
    } else if (lower.includes('youtube.com/') || lower.includes('youtu.be/')) {
      socials.youtube = url;
    } else if (
      !lower.includes('barb.ua') &&
      !lower.includes('google.com') &&
      !lower.includes('schema.org') &&
      !lower.includes('javascript:') &&
      !lower.startsWith('/')
    ) {
      socials.other.push(url);
    }
  }

  // Scan free text for @instagram_handles or t.me links if not found in anchors
  if (extraText) {
    if (!socials.instagram) {
      const igMatch = extraText.match(/@([a-zA-Z0-9._]{3,30})/);
      if (igMatch && igMatch[1] && !igMatch[1].startsWith('gmail') && !igMatch[1].startsWith('yahoo')) {
        socials.instagram = `https://www.instagram.com/${igMatch[1]}/`;
      }
    }
    if (!socials.telegram) {
      const tgMatch = extraText.match(/(?:t\.me|telegram\.me)\/([a-zA-Z0-9_]{4,32})/i);
      if (tgMatch && tgMatch[1]) {
        socials.telegram = `https://t.me/${tgMatch[1]}`;
      }
    }
  }

  return socials;
}

/**
 * Parses full master/salon profile page HTML into a MasterRecord.
 */
export function parseProfilePage(
  html: string,
  url: string,
  preExtractedSocials?: SocialLinks
): MasterRecord {
  const $ = cheerio.load(html);

  // 1. Determine entity type and slug
  const isMaster = url.includes('/master/');
  const type: EntityType = isMaster ? 'master' : 'salon';
  const urlParts = url.split('/').filter(Boolean);
  const slug = urlParts[urlParts.length - 1] || '';

  // 2. Extract JSON-LD schema data if available
  let schemaData: any = null;
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const text = $(el).html()?.trim();
      if (!text) return;
      const json = JSON.parse(text);
      if (
        json['@type'] === 'HealthAndBeautyBusiness' ||
        json['@type'] === 'NailSalon' ||
        json['@type'] === 'HairSalon' ||
        json['@type'] === 'BeautySalon' ||
        json['@type'] === 'MedicalClinic' ||
        json['@type'] === 'Physician' ||
        json['@type'] === 'Person'
      ) {
        schemaData = json;
      }
    } catch {
      // ignore
    }
  });

  // 3. Extract Name & Title
  let rawName = schemaData?.name || $('h1.seller-title, h1.page-title, h1').first().text().trim() || slug;
  const name = cleanName(rawName);
  const title = $('.seller-subtitle, .seller-specialization, .seller-header__spec').first().text().trim();

  // 4. Extract Avatar / Logo Image
  let image = '';
  if (schemaData?.image) {
    image = typeof schemaData.image === 'string' ? schemaData.image : schemaData.image.url || '';
  }
  if (!image && schemaData?.logo) {
    image = typeof schemaData.logo === 'string' ? schemaData.logo : schemaData.logo.url || '';
  }
  if (!image) {
    const imgEl = $('.seller-logo img, .seller-photo img, .master-avatar img, .seller-image img').first();
    image = imgEl.attr('src') || imgEl.attr('data-src') || '';
  }
  if (!image) {
    const metaImg = $('meta[property="og:image"]').attr('content');
    if (metaImg && !metaImg.includes('bbtw.jpg')) {
      image = metaImg;
    }
  }
  if (image && image.startsWith('/')) {
    image = `https://barb.ua${image}`;
  }

  // 5. Extract Location & Address
  let city = 'Київ';
  let address = '';
  if (schemaData?.address) {
    if (typeof schemaData.address === 'object') {
      city = schemaData.address.addressLocality || city;
      address = schemaData.address.streetAddress || schemaData.address.name || '';
    } else if (typeof schemaData.address === 'string') {
      address = schemaData.address;
    }
  }
  if (!address) {
    address = $('.seller-address, .procedure-item__address, .address-text').first().text().trim();
  }
  address = cleanAddress(address);

  // 6. Extract Ratings & Reviews
  let rating: number | null = null;
  let reviewsCount: number | null = null;
  if (schemaData?.aggregateRating) {
    rating = parseFloat(schemaData.aggregateRating.ratingValue) || null;
    reviewsCount = parseInt(schemaData.aggregateRating.reviewCount, 10) || null;
  }
  if (rating === null) {
    const rateText = $('.seller-rating__value, .rating-num, .rating__count').first().text().trim();
    if (rateText) {
      rating = parseFloat(rateText) || null;
    }
  }

  // 7. Extract Social Links
  const socialUrls: string[] = [];
  if (Array.isArray(schemaData?.sameAs)) {
    socialUrls.push(...schemaData.sameAs);
  }
  $('.seller-social a[href], .seller-listing__soc-link a[href], .profile-social a[href], .contacts-social a[href]').each(
    (_, el) => {
      const href = $(el).attr('href');
      if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
        socialUrls.push(href);
      }
    }
  );

  const pageText = $('.seller-about, .seller-desc, .detail-about, meta[name="description"]').text();
  let socials = categorizeSocialLinks(socialUrls, pageText);

  if (preExtractedSocials) {
    socials = {
      instagram: preExtractedSocials.instagram || socials.instagram,
      facebook: preExtractedSocials.facebook || socials.facebook,
      telegram: preExtractedSocials.telegram || socials.telegram,
      viber: preExtractedSocials.viber || socials.viber,
      tiktok: preExtractedSocials.tiktok || socials.tiktok,
      youtube: preExtractedSocials.youtube || socials.youtube,
      other: Array.from(new Set([...(preExtractedSocials.other || []), ...(socials.other || [])]))
    };
  }

  // 8. Extract Services and Pricing Catalog
  const services: ServiceItem[] = [];
  let currentCategory = 'Загальні послуги';

  $('#procedures table.table-procedures_price, .detail-procedures table, table.table-procedures_price').each(
    (_, table) => {
      $(table)
        .find('tr')
        .each((_, row) => {
          const $row = $(row);
          if ($row.hasClass('procedures_head') || $row.find('th').length > 0) {
            const catName = $row.find('.procedures_name, th').text().replace(/\s+/g, ' ').trim();
            if (catName) {
              currentCategory = catName;
            }
          } else {
            const sName = $row.find('.procedures_name, td:first-child').text().replace(/\s+/g, ' ').trim();
            const sPrice = $row.find('.procedures_price, td:nth-child(2)').text().replace(/\s+/g, ' ').trim();
            const sDuration = $row.find('.procedures_duration, small').text().replace(/\s+/g, ' ').trim();

            if (sName && (sPrice || sDuration || sName.length > 2)) {
              if (!sName.toLowerCase().includes('всі послуги') && !sName.toLowerCase().includes('показати ще')) {
                services.push({
                  category: currentCategory,
                  name: sName,
                  price: sPrice,
                  ...(sDuration ? { duration: sDuration } : {})
                });
              }
            }
          }
        });
    }
  );

  return {
    id: slug,
    slug,
    type,
    name: name || slug,
    title: title || undefined,
    url,
    image,
    city,
    address,
    rating,
    reviewsCount,
    phones: [],
    socials,
    priceRange: schemaData?.priceRange || undefined,
    services,
    crawledAt: new Date().toISOString()
  };
}
