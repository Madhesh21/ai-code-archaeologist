import fs from 'fs/promises';
import path from 'path';
import { logger } from '../../utils/logger.js';

export class FileStorageService {
  constructor(private readonly basePath: string) {}

  async ensureStorageDir(): Promise<void> {
    await fs.mkdir(this.basePath, { recursive: true });
  }

  async getRepositoryDir(repositoryId: string): Promise<string> {
    const dir = path.join(this.basePath, repositoryId);
    await fs.mkdir(dir, { recursive: true });
    return dir;
  }

  async moveToStorage(tempPath: string, repositoryId: string): Promise<string> {
    const destDir = await this.getRepositoryDir(repositoryId);
    const entries = await fs.readdir(tempPath);

    for (const entry of entries) {
      const src = path.join(tempPath, entry);
      const dest = path.join(destDir, entry);
      await fs.rename(src, dest);
    }

    await this.cleanup(tempPath);

    logger.info({ repositoryId, path: destDir }, 'Repository stored');
    return destDir;
  }

  async cleanup(filePath: string): Promise<void> {
    try {
      await fs.rm(filePath, { recursive: true, force: true });
    } catch (error) {
      logger.warn({ error, path: filePath }, 'Cleanup failed');
    }
  }
}
