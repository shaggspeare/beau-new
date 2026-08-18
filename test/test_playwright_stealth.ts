import { chromium } from 'playwright';

async function test() {
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    locale: 'uk-UA',
    viewport: { width: 1440, height: 900 }
  });

  const page = await context.newPage();
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  });

  console.log('Navigating to afelcher...');
  const resp = await page.goto('https://barb.ua/uk/master/afelcher', { waitUntil: 'domcontentloaded' });
  console.log('Status:', resp?.status());
  console.log('Title:', await page.title());

  const phoneBtn = page.locator('a.click_by_phone').first();
  if (await phoneBtn.isVisible()) {
    console.log('Clicking phone button...');
    await phoneBtn.click();
    await page.waitForTimeout(2500);
    const modalText = await page.locator('#getMeSellerPhones').innerText().catch(() => '');
    console.log('Modal text:', modalText);
  }

  await browser.close();
}

test();
