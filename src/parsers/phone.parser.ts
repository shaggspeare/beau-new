import * as cheerio from 'cheerio';

/**
 * Cleans, normalizes, and deduplicates phone numbers.
 */
export function normalizePhone(rawPhone: string): string {
  let cleaned = rawPhone.trim().replace(/\s+/g, ' ');
  cleaned = cleaned.replace(/^tel:/i, '').trim();
  return cleaned;
}

/**
 * Checks if a string is a valid phone number (either full or Barb.ua masked format e.g. +38 (050) 758..)
 */
export function isValidPhone(phone: string): boolean {
  if (!phone) return false;
  const trimmed = phone.trim();

  // Reject date strings like 2026-08-18 or 026-08-18
  if (/^20\d{2}-\d{2}-\d{2}/.test(trimmed) || /^026-\d{2}-\d{2}/.test(trimmed)) {
    return false;
  }

  // Barb.ua masked phone format: +38 (050) 758.. or 050 758..
  if (/(?:\+38\s*)?(?:\(0\d{2}\)|0\d{2})[\s.-]?\d{3}\.\./.test(trimmed)) {
    return true;
  }

  const clean = trimmed.replace(/[\s().-]/g, '');

  // Ukrainian full numbers: +380XXXXXXXXX (12/13 digits) or 0XXXXXXXXX (10 digits)
  if (clean.startsWith('+380') && clean.length === 13) return true;
  if (clean.startsWith('380') && clean.length === 12) return true;
  if (clean.startsWith('0') && clean.length === 10) return true;

  // Formatted string with area code e.g. +38 (050) 758-12-34
  if (/(?:\+38\s*)?\(0\d{2}\)\s*\d{3}[\s.-]?\d{2}[\s.-]?\d{2}/.test(trimmed)) {
    return true;
  }

  return false;
}

/**
 * Extracts phone numbers (full or masked) from HTML.
 */
export function extractPhonesFromHtml(html: string): string[] {
  if (!html) return [];
  const $ = cheerio.load(html);
  const phones: Set<string> = new Set();

  // 1. Check .click_by_phone elements and .seller-address__phones
  $('a.click_by_phone, .seller-address__phones a, .click_by_phone').each((_, el) => {
    // Clone element to remove sub-elements like "показати номер"
    const $clone = $(el).clone();
    $clone.find('span, small, i').remove();
    const t = $clone.text().trim();
    if (t && isValidPhone(t)) {
      phones.add(normalizePhone(t));
    }
  });

  // 2. Check tel links
  $('a[href^="tel:"]').each((_, el) => {
    const href = $(el).attr('href') || '';
    const phone = href.replace(/^tel:/i, '').trim();
    if (phone && isValidPhone(phone)) {
      phones.add(normalizePhone(phone));
    }
  });

  // 3. Regex for Ukrainian full and masked phone numbers in text
  const text = $.text();
  const phoneMatches = text.match(/(?:\+38\s*)?(?:\(0\d{2}\)|0\d{2})[\s.-]?\d{3}(?:[\s.-]?\d{2}[\s.-]?\d{2}|\.\.)/g);
  if (phoneMatches) {
    for (const match of phoneMatches) {
      const clean = match.trim();
      if (isValidPhone(clean)) {
        phones.add(clean);
      }
    }
  }

  return Array.from(phones);
}
