# Barb.ua Web Crawler & Extractor

A fast, resilient, and multi-engine crawler designed specifically for [Barb.ua](https://barb.ua) (e.g. manicure masters, beauty salons, podologists, hairdressers, etc.).

It extracts:
- **Master / Salon Name**
- **Profile Image / Avatar**
- **Location / City / Street Address**
- **Phone Numbers** (resolves hidden phone numbers behind click triggers and dynamic AJAX modals)
- **Social Media Links** (Instagram, Facebook, Telegram, Viber, TikTok, YouTube)
- **Services Catalog & Pricing** (categorized services, item names, prices, durations)
- **Ratings & Reviews Count**

---

## Barb app concept (React + Vite)

The web app renders the Claude Design concept in [`barb-canvas/`](barb-canvas/README.md) (client app + Barb Pro) directly from its `.dc.html` files via a small runtime, [`src/dc.tsx`](src/dc.tsx):
- **Desktop (≥ 820px):** the canvas "Прототип" page — the app in a phone frame, next to a panel with every client / Barb Pro screen, the role switch and the guided booking scenario. Scaled to fit the window height.
- **Mobile:** the app itself, full screen (still switches to Barb Pro from the client cabinet).

To update the design, replace the files in `barb-canvas/project/` and `barb-canvas/assets/` (if the export's `/_blob/…` ids change, update them in [`src/App.tsx`](src/App.tsx)).

```bash
npm run dev                     # http://localhost:5173
npm run build && npx vite preview --port 4173 &
npm run test:app                # browser smoke test: desktop demo flow + mobile layout
```

---

## Workspace Skills Included

The workspace is equipped with specialized `.agents/skills/`:
1. **Firecrawl Skill** ([`.agents/skills/firecrawl/SKILL.md`](.agents/skills/firecrawl/SKILL.md))
2. **Playwright Skill** ([`.agents/skills/playwright/SKILL.md`](.agents/skills/playwright/SKILL.md))
3. **Grill-Me Skill** ([`.agents/skills/grill-me/SKILL.md`](.agents/skills/grill-me/SKILL.md))

---

## Features & Architecture

- **Multi-Engine Support**:
  - `hybrid` (Default): Combines high-speed listing parsing with Playwright & Direct AJAX phone extraction.
  - `playwright`: Headless browser automation (Chromium) that simulates real user interactions and clicks.
  - `firecrawl`: Cloud-based scraping with Firecrawl v1 API and automated action execution.
  - `direct`: Lightweight, super-fast HTTP + AJAX endpoint querying.
- **Dynamic Phone Number Unmasking**:
  - Barb.ua masks phone numbers as `+38 (050) 758..`.
  - The crawler triggers the popup / queries the AJAX seller endpoint to obtain the real, unmasked phone number.
- **Structured Dual Export**:
  - **JSON**: Hierarchical structured data with full metadata and nested services catalog.
  - **CSV**: Clean, flattened spreadsheet table with RFC 4180 escaping.
- **Smart Anti-Bot & Rate-Limiting**:
  - Configurable jitter delays between requests to prevent reCAPTCHA triggers.

---

## Installation & Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Ensure Playwright Chromium is installed**:
   ```bash
   npx playwright install chromium
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and verify your API keys:
   ```env
   FIRECRAWL_API_KEY=fc-e19f4c267d864428aa79d014adf4bbb4
   BARB_BASE_URL=https://barb.ua
   ```

---

## Usage

### 1. Basic Crawl (Default: 10 profiles in Manicure category)
```bash
npm run crawl
```

### 2. Crawl a Specific Category or Profile URL
```bash
npx ts-node src/index.ts --url https://barb.ua/uk/ruki/manikur --limit 20 --pages 2
```

### 3. Crawl a Single Master Profile
```bash
npx ts-node src/index.ts --url https://barb.ua/uk/master/afelcher
```

### 4. Choose Engine
```bash
# Using Playwright headless browser
npx ts-node src/index.ts --url https://barb.ua/uk/ruki/manikur --engine playwright --limit 10

# Using Firecrawl API
npx ts-node src/index.ts --url https://barb.ua/uk/ruki/manikur --engine firecrawl --limit 10

# Using Direct HTTP (Ultra Fast)
npx ts-node src/index.ts --url https://barb.ua/uk/ruki/manikur --engine direct --limit 10
```

### 5. Filter Entities (Masters vs Salons)
```bash
# Only individual masters
npx ts-node src/index.ts --url https://barb.ua/uk/ruki/manikur --type master --limit 15

# Only beauty salons
npx ts-node src/index.ts --url https://barb.ua/uk/ruki/manikur --type salon --limit 15
```

---

## CLI Options Reference

| Option | Shorthand | Default | Description |
| :--- | :--- | :--- | :--- |
| `--url <url>` | `-u` | `https://barb.ua/uk/ruki/manikur` | Target category or master/salon URL |
| `--limit <number>` | `-l` | `10` | Maximum number of profiles to scrape (0 for all) |
| `--pages <number>` | `-p` | `2` | Maximum pagination depth |
| `--engine <type>` | `-e` | `hybrid` | Crawler engine: `hybrid`, `playwright`, `firecrawl`, `direct` |
| `--format <type>` | `-f` | `all` | Export format: `all`, `json`, `csv` |
| `--type <type>` | `-t` | `all` | Entity filter: `all`, `master`, `salon` |
| `--output <dir>` | `-o` | `./output` | Output directory for saved results |
| `--delay-min <ms>`| | `1500` | Minimum jitter delay between profile requests |
| `--delay-max <ms>`| | `2500` | Maximum jitter delay between profile requests |
| `--headless <bool>`| | `true` | Run Playwright browser in headless mode |
| `--api-key <key>` | | From `.env` | Override Firecrawl API key |

---

## Output Data Structure

### JSON Example (`output/barb_uk_ruki_manikur_*.json`)
```json
{
  "exportedAt": "2026-08-18T18:10:00.000Z",
  "totalRecords": 1,
  "mastersCount": 1,
  "salonsCount": 0,
  "records": [
    {
      "id": "397205",
      "slug": "afelcher",
      "type": "master",
      "name": "Ганна Фельчер",
      "title": "Майстер манікюру",
      "url": "https://barb.ua/uk/master/afelcher",
      "image": "https://barb.ua/uploads/2026_/05/08/1844654/c/card_master.jpg",
      "city": "Київ",
      "address": "вулиця Анни Ахматової, 13",
      "rating": 10,
      "reviewsCount": 22,
      "phones": ["+38 (050) 758-12-34"],
      "socials": {
        "instagram": "https://www.instagram.com/af.nails.kyiv/",
        "facebook": "https://www.facebook.com/share/1Cq3RQgLcm/",
        "other": []
      },
      "services": [
        {
          "category": "Манікюр",
          "name": "Класичний манікюр",
          "price": "350 грн"
        }
      ],
      "crawledAt": "2026-08-18T18:10:00.000Z"
    }
  ]
}
```

---

## Running Tests

```bash
npm test
```
