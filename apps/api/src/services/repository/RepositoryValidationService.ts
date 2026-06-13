import fs from 'fs/promises';
import path from 'path';
import { ValidationError } from '../../utils/errors.js';
import { logger } from '../../utils/logger.js';

const MAX_FILE_SIZE = 500 * 1024 * 1024;
const SUPPORTED_EXTENSIONS = new Set([
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.json',
  '.yaml',
  '.yml',
  '.toml',
  '.md',
  '.html',
  '.css',
  '.scss',
  '.env',
  '.gitignore',
]);

export class RepositoryValidationService {
  async validateZipFile(filePath: string): Promise<void> {
    const stat = await fs.stat(filePath);

    if (!stat.isFile()) {
      throw new ValidationError('Uploaded file is not a valid file');
    }

    if (stat.size === 0) {
      throw new ValidationError('Uploaded file is empty');
    }

    if (stat.size > MAX_FILE_SIZE) {
      throw new ValidationError('Repository exceeds maximum size of 500 MB');
    }

    logger.info({ size: stat.size }, 'ZIP file size validated');
  }

  async validateRepositoryStructure(extractedPath: string, files: string[]): Promise<void> {
    if (files.length === 0) {
      throw new ValidationError('Repository contains no files');
    }

    const hasSourceFiles = files.some((file) => {
      const ext = path.extname(file).toLowerCase();
      return SUPPORTED_EXTENSIONS.has(ext);
    });

    if (!hasSourceFiles) {
      throw new ValidationError('Repository contains no supported source files');
    }

    logger.info({ fileCount: files.length }, 'Repository structure validated');
  }
}
