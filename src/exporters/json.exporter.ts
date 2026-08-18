import fs from 'fs';
import path from 'path';
import { MasterRecord } from '../types';

export interface JsonExportResult {
  filePath: string;
  count: number;
}

export function exportToJson(records: MasterRecord[], outputDir: string, baseFilename: string): JsonExportResult {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filePath = path.join(outputDir, `${baseFilename}.json`);
  const data = {
    exportedAt: new Date().toISOString(),
    totalRecords: records.length,
    mastersCount: records.filter((r) => r.type === 'master').length,
    salonsCount: records.filter((r) => r.type === 'salon').length,
    records
  };

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  return { filePath, count: records.length };
}
