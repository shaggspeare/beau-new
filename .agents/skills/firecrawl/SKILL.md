---
name: firecrawl
description: >-
  Guide and best practices for using Firecrawl API and SDK to crawl, scrape, map, and extract structured web data.
---

# Firecrawl Skill

This skill provides guidelines and patterns for web scraping and data extraction using Firecrawl (API v1 / SDK).

## Core Capabilities

1. **Scrape (`/v1/scrape`)**:
   - Fetches clean Markdown, HTML, raw HTML, links, screenshot, and structured LLM JSON extraction from a single URL.
   - Supports page actions (click, write, wait, scroll, press key) before extraction.
2. **Crawl (`/v1/crawl`)**:
   - Asynchronously crawls multiple pages across a domain or path with depth, limit, and allow/exclude path filters.
3. **Map (`/v1/map`)**:
   - Rapidly discovers all URLs for a given domain/sub-path.
4. **Extract (`/v1/extract`)**:
   - Uses AI extraction schemas to parse unstructured pages directly into structured JSON.

## Authentication & Configuration

- **API Endpoint**: `https://api.firecrawl.dev/v1`
- **Authorization Header**: `Authorization: Bearer <API_KEY>`
- Store API key in `.env` (e.g., `FIRECRAWL_API_KEY=fc-...`).

## Common API Patterns

### 1. Scrape with Actions (Clicking Popups / Buttons)

```json
POST https://api.firecrawl.dev/v1/scrape
Headers:
  Authorization: Bearer <FIRECRAWL_API_KEY>
  Content-Type: application/json

Body:
{
  "url": "https://barb.ua/uk/master/afelcher",
  "formats": ["markdown", "html"],
  "actions": [
    { "type": "wait", "milliseconds": 1000 },
    { "type": "click", "selector": ".click_by_phone" },
    { "type": "wait", "milliseconds": 1500 }
  ],
  "onlyMainContent": false
}
```

### 2. Scrape with JSON Schema Extraction

```json
POST https://api.firecrawl.dev/v1/scrape
Headers:
  Authorization: Bearer <FIRECRAWL_API_KEY>
  Content-Type: application/json

Body:
{
  "url": "https://barb.ua/uk/master/afelcher",
  "formats": ["extract"],
  "extract": {
    "schema": {
      "type": "object",
      "properties": {
        "name": { "type": "string" },
        "image": { "type": "string" },
        "address": { "type": "string" },
        "phones": { "type": "array", "items": { "type": "string" } },
        "socials": { "type": "array", "items": { "type": "string" } },
        "services": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "category": { "type": "string" },
              "service_name": { "type": "string" },
              "price": { "type": "string" }
            }
          }
        }
      }
    }
  }
}
```

### 3. Crawl Entire Category

```json
POST https://api.firecrawl.dev/v1/crawl
Headers:
  Authorization: Bearer <FIRECRAWL_API_KEY>
  Content-Type: application/json

Body:
{
  "url": "https://barb.ua/uk/ruki/manikur",
  "includePaths": ["/uk/master/*", "/uk/salon/*"],
  "limit": 100,
  "scrapeOptions": {
    "formats": ["markdown", "html"]
  }
}
```

## Error Handling & Rate Limits
- Handle HTTP 429 (Rate Limited) with exponential backoff.
- Handle HTTP 408 / 504 timeouts by retrying or falling back to headless browser automation.
