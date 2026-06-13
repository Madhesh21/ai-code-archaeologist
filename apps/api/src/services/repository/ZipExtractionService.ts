import AdmZip from 'adm-zip';
import path from 'path';
import fs from 'fs/promises';
import { logger } from '../../utils/logger.js';

export class ZipExtractionService {
  async extract(zipPath: string, destination: string): Promise<string[]> {
    const zip = new AdmZip(zipPath);
    const entries = zip.getEntries();

    if (entries.length === 0) {
      throw new Error('ZIP archive is empty');
    }

    const extractedFiles: string[] = [];

    for (const entry of entries) {
      if (entry.isDirectory) continue;

      const resolvedPath = path.resolve(destination, entry.entryName);
      const resolvedBase = path.resolve(destination);

      if (!resolvedPath.startsWith(resolvedBase)) {
        logger.warn({ entryName: entry.entryName }, 'Path traversal blocked');
        continue;
      }

      await fs.mkdir(path.dirname(resolvedPath), { recursive: true });
      await fs.writeFile(resolvedPath, entry.getData());
      extractedFiles.push(entry.entryName);
    }

    logger.info({ fileCount: extractedFiles.length, destination }, 'ZIP extracted');
    return extractedFiles;
  }
}
