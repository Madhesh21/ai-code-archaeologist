import fs from 'fs/promises';
import path from 'path';
import { createHash } from 'crypto';
import { createReadStream, type Stats } from 'fs';
import type { FileInfo, FolderInfo, ScanResult } from './types.js';
import { IgnoreRules } from './IgnoreRules.js';

export class ScannerService {
  constructor(private readonly ignoreRules: IgnoreRules) {}

  async scan(basePath: string): Promise<ScanResult> {
    const resolvedPath = path.resolve(basePath);
    await this.ensureDirectory(resolvedPath);

    const files: FileInfo[] = [];
    const folders: FolderInfo[] = [];

    await this.traverse(resolvedPath, resolvedPath, files, folders);

    return { files, folders };
  }

  private async traverse(
    currentPath: string,
    basePath: string,
    files: FileInfo[],
    folders: FolderInfo[],
  ): Promise<void> {
    let entries: string[];
    try {
      entries = await fs.readdir(currentPath);
    } catch {
      return;
    }

    for (const entry of entries) {
      const entryPath = path.join(currentPath, entry);
      const relativePath = path.relative(basePath, entryPath).replace(/\\/g, '/');

      if (this.ignoreRules.shouldIgnore(entryPath)) {
        continue;
      }

      let stat: Stats;
      try {
        stat = await fs.stat(entryPath);
      } catch {
        continue;
      }

      if (stat.isDirectory()) {
        folders.push({ path: relativePath });
        await this.traverse(entryPath, basePath, files, folders);
      } else if (stat.isFile()) {
        const fileInfo = await this.collectFileMetadata(entryPath, relativePath);
        files.push(fileInfo);
      }
    }
  }

  private async collectFileMetadata(entryPath: string, relativePath: string): Promise<FileInfo> {
    const ext = path.extname(entryPath).toLowerCase();
    let size = 0;
    let hash = '';

    try {
      const stat = await fs.stat(entryPath);
      size = stat.size;
      hash = await this.computeHash(entryPath);
    } catch {
      // If file becomes inaccessible, return what we have
    }

    return {
      path: relativePath,
      extension: ext,
      size,
      hash,
    };
  }

  private async computeHash(filePath: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const hash = createHash('md5');
      const stream = createReadStream(filePath);
      stream.on('data', (chunk: string | Buffer) => hash.update(chunk));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }

  private async ensureDirectory(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      throw new Error(`Directory not found: ${dirPath}`);
    }
  }
}
