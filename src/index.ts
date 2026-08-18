import { Command } from 'commander';
import chalk from 'chalk';
import cliProgress from 'cli-progress';
import path from 'path';
import { config } from './config';
import { ICrawlerEngine } from './engines/base';
import { PlaywrightEngine } from './engines/playwright';
import { FirecrawlEngine } from './engines/firecrawl';
import { DirectHttpEngine } from './engines/direct';
import { HybridEngine } from './engines/hybrid';
import { exportToJson } from './exporters/json.exporter';
import { exportToCsv } from './exporters/csv.exporter';
import { MasterRecord, CrawlerEngineType, ProfileListingMeta } from './types';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getRandomDelay(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createEngine(engineType: CrawlerEngineType, apiKey?: string, headless: boolean = true): ICrawlerEngine {
  switch (engineType) {
    case 'playwright':
      return new PlaywrightEngine(headless);
    case 'firecrawl':
      return new FirecrawlEngine(apiKey || config.firecrawlApiKey);
    case 'direct':
      return new DirectHttpEngine();
    case 'hybrid':
    default:
      return new HybridEngine(headless);
  }
}

async function main() {
  const program = new Command();

  program
    .name('barb-crawler')
    .description('Production-grade web crawler for Barb.ua extracting masters, salons, phones, socials, and pricing')
    .version('1.0.0')
    .option('-u, --url <url>', 'Starting Barb.ua category or profile URL', 'https://barb.ua/uk/ruki/manikur')
    .option('-l, --limit <number>', 'Maximum profiles to scrape (0 for all)', '10')
    .option('-p, --pages <number>', 'Maximum listing pages to traverse', '2')
    .option('-e, --engine <engine>', 'Engine to use: hybrid | playwright | firecrawl | direct', 'hybrid')
    .option('-f, --format <format>', 'Export format: all | json | csv', 'all')
    .option('-t, --type <type>', 'Filter entity type: all | master | salon', 'all')
    .option('-o, --output <dir>', 'Output directory', config.defaultOutputDir)
    .option('--delay-min <ms>', 'Min delay between requests in ms', '1500')
    .option('--delay-max <ms>', 'Max delay between requests in ms', '2500')
    .option('--headless <boolean>', 'Run browser headless', 'true')
    .option('--api-key <key>', 'Firecrawl API Key override');

  program.parse(process.argv);
  const options = program.opts();

  const targetUrl: string = options.url;
  const limit: number = parseInt(options.limit, 10);
  const maxPages: number = parseInt(options.pages, 10);
  const engineType: CrawlerEngineType = options.engine as CrawlerEngineType;
  const format: 'all' | 'json' | 'csv' = options.format;
  const entityType: 'all' | 'master' | 'salon' = options.type;
  const outputDir: string = path.resolve(process.cwd(), options.output);
  const delayMin: number = parseInt(options.delayMin, 10);
  const delayMax: number = parseInt(options.delayMax, 10);
  const headless: boolean = options.headless !== 'false';
  const apiKey: string | undefined = options.apiKey;

  console.log(chalk.cyan.bold('\n======================================================'));
  console.log(chalk.cyan.bold('           BARB.UA SMART CRAWLER & EXTRACTOR          '));
  console.log(chalk.cyan.bold('======================================================'));
  console.log(chalk.gray(`Target URL    : `) + chalk.yellow(targetUrl));
  console.log(chalk.gray(`Engine        : `) + chalk.green(engineType));
  console.log(chalk.gray(`Limit         : `) + chalk.white(limit === 0 ? 'No limit' : limit));
  console.log(chalk.gray(`Max Pages     : `) + chalk.white(maxPages));
  console.log(chalk.gray(`Entity Filter : `) + chalk.white(entityType));
  console.log(chalk.gray(`Output Dir    : `) + chalk.white(outputDir));
  console.log(chalk.gray(`Format        : `) + chalk.white(format));
  console.log(chalk.cyan.bold('------------------------------------------------------\n'));

  const engine = createEngine(engineType, apiKey, headless);

  try {
    const discoveredUrls: Set<string> = new Set();
    const globalMetaMap: Record<string, ProfileListingMeta> = {};
    const isSingleProfile = targetUrl.includes('/master/') || targetUrl.includes('/salon/');

    if (isSingleProfile) {
      discoveredUrls.add(targetUrl);
    } else {
      console.log(chalk.blue(`[1/3] Discovering profile URLs from category listings...`));
      let currentUrl: string | undefined = targetUrl;
      let pageNum = 1;

      while (currentUrl && pageNum <= maxPages) {
        console.log(chalk.gray(`  -> Crawling listing page ${pageNum}: ${currentUrl}`));
        try {
          const result = await engine.crawlListing(currentUrl);
          Object.assign(globalMetaMap, result.metadataMap);

          for (const u of result.profileUrls) {
            if (entityType === 'master' && !u.includes('/master/')) continue;
            if (entityType === 'salon' && !u.includes('/salon/')) continue;
            discoveredUrls.add(u);
            if (limit > 0 && discoveredUrls.size >= limit) break;
          }

          console.log(chalk.green(`     Found ${result.profileUrls.length} profiles (Total unique: ${discoveredUrls.size})`));

          if (limit > 0 && discoveredUrls.size >= limit) {
            console.log(chalk.yellow(`     Reached target limit of ${limit} profiles.`));
            break;
          }

          currentUrl = result.nextPageUrl;
          pageNum++;

          if (currentUrl && pageNum <= maxPages) {
            await sleep(getRandomDelay(delayMin, delayMax));
          }
        } catch (err: any) {
          console.log(chalk.red(`     Error crawling page ${pageNum}: ${err.message}`));
          break;
        }
      }
    }

    const urlsToScrape = Array.from(discoveredUrls).slice(0, limit > 0 ? limit : undefined);
    console.log(chalk.blue(`\n[2/3] Extracting detailed profile data (${urlsToScrape.length} profiles)...`));

    const records: MasterRecord[] = [];
    const progressBar = new cliProgress.SingleBar(
      {
        format: chalk.cyan('{bar}') + ' | {percentage}% | {value}/{total} Profiles | Current: {profileName}',
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true
      },
      cliProgress.Presets.shades_classic
    );

    progressBar.start(urlsToScrape.length, 0, { profileName: 'Starting...' });

    for (let i = 0; i < urlsToScrape.length; i++) {
      const url = urlsToScrape[i];
      const slug = url.split('/').pop() || url;
      const preMeta = globalMetaMap[url];
      progressBar.update(i, { profileName: preMeta?.name || slug });

      try {
        const record = await engine.extractProfile(url, preMeta);
        records.push(record);
        progressBar.update(i + 1, { profileName: record.name || slug });
      } catch (err: any) {
        console.log(chalk.red(`\n  [!] Failed to extract ${url}: ${err.message}`));
        progressBar.update(i + 1, { profileName: `${slug} (FAILED)` });
      }

      if (i < urlsToScrape.length - 1) {
        await sleep(getRandomDelay(delayMin, delayMax));
      }
    }

    progressBar.stop();

    console.log(chalk.blue(`\n[3/3] Exporting crawled data...`));

    const urlSlug = targetUrl.replace(/https?:\/\/barb\.ua\/?/i, '').replace(/[^a-zA-Z0-9_-]/g, '_') || 'barb';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const baseFilename = `barb_${urlSlug}_${timestamp}`;

    let jsonFilePath = '';
    let csvFilePath = '';

    if (format === 'all' || format === 'json') {
      const jsonRes = exportToJson(records, outputDir, baseFilename);
      jsonFilePath = jsonRes.filePath;
      console.log(chalk.green(`  ✔ Saved JSON: `) + chalk.white(jsonRes.filePath));
    }

    if (format === 'all' || format === 'csv') {
      const csvRes = exportToCsv(records, outputDir, baseFilename);
      csvFilePath = csvRes.filePath;
      console.log(chalk.green(`  ✔ Saved CSV : `) + chalk.white(csvRes.filePath));
    }

    console.log(chalk.cyan.bold('\n======================================================'));
    console.log(chalk.cyan.bold('                  CRAWL SUMMARY                       '));
    console.log(chalk.cyan.bold('======================================================'));
    console.log(chalk.gray(`Total Profiles Processed: `) + chalk.white(records.length));
    console.log(chalk.gray(`Individual Masters      : `) + chalk.white(records.filter((r) => r.type === 'master').length));
    console.log(chalk.gray(`Salons                  : `) + chalk.white(records.filter((r) => r.type === 'salon').length));
    console.log(
      chalk.gray(`Profiles with Socials   : `) +
        chalk.green(
          records.filter((r) => r.socials.instagram || r.socials.facebook || r.socials.telegram || r.socials.viber || r.socials.tiktok).length
        ) +
        chalk.gray(` / ${records.length}`)
    );
    console.log(
      chalk.gray(`Total Services Extracted: `) +
        chalk.white(records.reduce((acc, r) => acc + r.services.length, 0))
    );
    console.log(chalk.cyan.bold('======================================================\n'));

    if (records.length > 0) {
      console.log(chalk.bold('Preview Sample:'));
      for (const r of records.slice(0, 3)) {
        console.log(chalk.yellow(`\n• ${r.name} (${r.type.toUpperCase()})`));
        console.log(chalk.gray(`  Address : `) + (r.address || 'N/A'));
        console.log(chalk.gray(`  Phones  : `) + (r.phones.join(', ') || 'N/A'));
        console.log(
          chalk.gray(`  Socials : `) +
            [
              r.socials.instagram ? `IG: ${r.socials.instagram}` : '',
              r.socials.facebook ? `FB: ${r.socials.facebook}` : '',
              r.socials.telegram ? `TG: ${r.socials.telegram}` : '',
              r.socials.tiktok ? `TikTok: ${r.socials.tiktok}` : ''
            ]
              .filter(Boolean)
              .join(' | ') || 'None'
        );
        console.log(
          chalk.gray(`  Services: `) +
            `${r.services.length} items (Sample: ${r.services.slice(0, 2).map((s) => `${s.name}: ${s.price}`).join(', ')})`
        );
      }
    }
  } finally {
    if (engine.close) {
      await engine.close();
    }
  }
}

main().catch((err) => {
  console.error(chalk.red('\n[Fatal Error]:'), err);
  process.exit(1);
});
