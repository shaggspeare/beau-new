---
name: playwright
description: >-
  Best practices and runbooks for browser automation, headless scraping, dynamic interaction, popup triggers, and anti-bot mitigation using Playwright.
---

# Playwright Skill

This skill defines techniques and workflows for robust browser automation and data extraction with Playwright.

## Core Capabilities

1. **Headless & Headed Browser Automation**:
   - Chromium, Firefox, WebKit execution.
   - User-Agent and viewport spoofing to prevent bot detection.
2. **Dynamic UI Interaction**:
   - Locating and clicking hidden elements (e.g. `.click_by_phone`, accordions, modals).
   - Waiting for network idle, AJAX responses (`page.waitForResponse(...)`), or DOM mutations.
3. **High-Performance Batch Crawling**:
   - Concurrent browser contexts / tabs for speed while maintaining low memory footprint.
   - Resource blocking (aborting unnecessary images, fonts, analytics tracking to accelerate scraping).

## Recommended Patterns

### 1. Intercepting AJAX / Network Calls for Hidden Data

Websites like `barb.ua` fetch hidden phone numbers via internal AJAX endpoints when a button is clicked. Intercepting the network response or triggering the click directly extracts data cleanly.

```typescript
import { chromium } from 'playwright';

async function extractMasterProfile(url: string) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  // Speed up by blocking non-essential assets
  await page.route('**/*.{png,jpg,jpeg,svg,woff,woff2}', route => route.abort());

  await page.goto(url, { waitUntil: 'domcontentloaded' });

  // Handle phone reveal button click & wait for response
  const phonePromise = page.waitForResponse(resp => resp.url().includes('ajax') && resp.status() === 200, { timeout: 5000 }).catch(() => null);
  
  const phoneBtn = page.locator('.click_by_phone').first();
  if (await phoneBtn.isVisible()) {
    await phoneBtn.click();
    await page.waitForTimeout(500);
  }

  // Extract master details
  const data = await page.evaluate(() => {
    const name = document.querySelector('h1')?.innerText.trim() || '';
    const image = document.querySelector('.seller-logo img')?.getAttribute('src') || '';
    const address = document.querySelector('.seller-address, .procedure-item__address')?.textContent?.trim() || '';
    
    // Services and prices
    const services: Array<{ name: string; price: string }> = [];
    document.querySelectorAll('.table-procedures_price tr:not(.procedures_head)').forEach(row => {
      const sName = row.querySelector('.procedures_name')?.textContent?.trim();
      const sPrice = row.querySelector('.procedures_price')?.textContent?.trim();
      if (sName) {
        services.push({ name: sName, price: sPrice || '' });
      }
    });

    return { name, image, address, services };
  });

  await browser.close();
  return data;
}
```

### 2. Stealth & Anti-Bot Tips
- Set realistic headers (`User-Agent`, `Accept-Language: uk-UA,uk;q=0.9,en-US;q=0.8,en;q=0.7`).
- Randomize human-like delays between page navigations (1-3s).
- Handle cookie consent banners (`#CookieUsingAccept` or `.alert-dismissible`).
