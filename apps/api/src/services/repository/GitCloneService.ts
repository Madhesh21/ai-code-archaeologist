import path from 'path';
import fs from 'fs/promises';
import { simpleGit } from 'simple-git';
import { InternalError } from '../../utils/errors.js';

export class GitCloneService {
  constructor(private readonly basePath: string) {}

  async clone(url: string, repositoryId: string): Promise<string> {
    const destDir = path.join(this.basePath, repositoryId);
    await fs.mkdir(this.basePath, { recursive: true });
    try {
      const git = simpleGit();
      await git.clone(url, destDir, ['--depth=1']);
      return destDir;
    } catch (error) {
      throw new InternalError(
        `Failed to clone repository: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async cleanup(repositoryId: string): Promise<void> {
    const destDir = path.join(this.basePath, repositoryId);
    try {
      await fs.rm(destDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  }
}
