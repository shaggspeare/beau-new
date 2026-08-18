import fs from 'fs';
import path from 'path';
import { MasterRecord } from '../types';

function escapeCsvField(field: any): string {
  if (field === null || field === undefined) return '""';
  const str = String(field).replace(/"/g, '""');
  return `"${str}"`;
}

export interface CsvExportResult {
  filePath: string;
  count: number;
}

export function exportToCsv(records: MasterRecord[], outputDir: string, baseFilename: string): CsvExportResult {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filePath = path.join(outputDir, `${baseFilename}.csv`);

  const headers = [
    'ID',
    'Type',
    'Name',
    'Title / Specialization',
    'URL',
    'Image URL',
    'City',
    'Address',
    'Rating',
    'Reviews Count',
    'Instagram',
    'Facebook',
    'Telegram',
    'Viber',
    'TikTok',
    'YouTube',
    'Other Socials',
    'Services Count',
    'Services & Prices Summary',
    'Crawled At'
  ];

  const rows: string[] = [headers.map((h) => `"${h}"`).join(',')];

  for (const r of records) {
    const servicesSummary = r.services.map((s) => `[${s.category}] ${s.name}: ${s.price}`).join(' | ');

    const row = [
      escapeCsvField(r.id),
      escapeCsvField(r.type),
      escapeCsvField(r.name),
      escapeCsvField(r.title || ''),
      escapeCsvField(r.url),
      escapeCsvField(r.image),
      escapeCsvField(r.city),
      escapeCsvField(r.address),
      escapeCsvField(r.rating !== null ? r.rating : ''),
      escapeCsvField(r.reviewsCount !== null ? r.reviewsCount : ''),
      escapeCsvField(r.socials.instagram || ''),
      escapeCsvField(r.socials.facebook || ''),
      escapeCsvField(r.socials.telegram || ''),
      escapeCsvField(r.socials.viber || ''),
      escapeCsvField(r.socials.tiktok || ''),
      escapeCsvField(r.socials.youtube || ''),
      escapeCsvField((r.socials.other || []).join('; ')),
      escapeCsvField(r.services.length),
      escapeCsvField(servicesSummary),
      escapeCsvField(r.crawledAt)
    ];

    rows.push(row.join(','));
  }

  fs.writeFileSync(filePath, rows.join('\n'), 'utf-8');
  return { filePath, count: records.length };
}
