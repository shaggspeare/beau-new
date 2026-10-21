// Smoke check for the .dc.html runtime (src/dc.tsx) in a real browser.
// usage: npm run build && npx vite preview --port 4173 & node test/app.e2e.mjs [url] [shotsDir]
// Desktop: plays the prototype demo (client books Валентина Шевчук → Barb Pro accepts → status returns).
// Mobile: app fills the viewport, no phone frame or screen panel.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const url = process.argv[2] || 'http://localhost:4173/';
const shots = process.argv[3];
const b = await chromium.launch();
const errors = [];
const watch = (p) => {
  p.on('pageerror', (e) => errors.push(e.message));
  p.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
};
const shot = (p, name) => shots && p.screenshot({ path: `${shots}/${name}.png` });

const d = await b.newPage({ viewport: { width: 1440, height: 900 } });
watch(d);
await d.goto(url);
const phone = d.locator('div[style*="width: 390px; height: 844px"]').first();
await d.getByRole('button', { name: 'Почати сценарій' }).click();
await phone.getByRole('button', { name: /^Додати: / }).first().click();
await phone.getByRole('button', { name: 'Обрати час' }).click();
await phone.getByRole('button', { name: /^\d{1,2}:\d{2}/, disabled: false }).first().click();
await shot(d, 'desktop-book');
await phone.getByRole('button', { name: 'Підтвердити запис' }).click();
await d.getByRole('button', { name: 'Відкрити Barb Pro' }).click();
await d.getByRole('button', { name: 'Підтвердити', exact: true }).first().click();
await shot(d, 'desktop-pro');
await d.getByRole('button', { name: 'Повернутися до клієнтки' }).click();
await phone.getByText('Підтверджено').first().waitFor();
await shot(d, 'desktop-visits');
await d.getByRole('button', { name: 'Карта' }).first().click();
await phone.getByRole('button', { name: 'Наблизити' }).click();
await shot(d, 'desktop-map');

const m = await b.newPage({ viewport: { width: 375, height: 667 }, isMobile: true, hasTouch: true });
watch(m);
await m.goto(url);
await m.getByRole('button', { name: 'Знайти майстра' }).waitFor();
assert.equal(await m.getByText('Екрани клієнта').count(), 0, 'mobile shows the screen panel');
const box = await m.locator('.fill > div').first().boundingBox();
assert.deepEqual([box.width, box.height], [375, 667], 'mobile app does not fill the viewport');
await m.getByRole('button', { name: 'Знайти майстра' }).click();
await shot(m, 'mobile-home');

await b.close();
assert.deepEqual(errors, [], 'console errors');
console.log('OK — desktop demo flow + mobile fill');
