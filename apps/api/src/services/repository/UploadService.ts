import path from 'path';
import fs from 'fs/promises';
import { ZipExtractionService } from './ZipExtractionService.js';
import { RepositoryValidationService } from './RepositoryValidationService.js';
import { FileStorageService } from './FileStorageService.js';
import { RepositoryRepository } from '../../infrastructure/database/repositories/RepositoryRepository.js';
import type { IRepository } from '../../infrastructure/database/schemas/interfaces.js';
import { logger } from '../../utils/logger.js';

export interface UploadResult {
  repositoryId: string;
  repository: IRepository;
}

export class UploadService {
  constructor(
    private readonly zipExtraction: ZipExtractionService,
    private readonly validation: RepositoryValidationService,
    private readonly storage: FileStorageService,
    private readonly repositoryRepo: RepositoryRepository,
  ) {}

  async upload(zipFilePath: string, originalName: string, tempDir: string): Promise<UploadResult> {
    await this.validation.validateZipFile(zipFilePath);

    const extractDir = await fs.mkdtemp(path.join(tempDir, 'extract-'));

    try {
      const extractedFiles = await this.zipExtraction.extract(zipFilePath, extractDir);

      await this.validation.validateRepositoryStructure(extractDir, extractedFiles);

      const repoName = path.basename(originalName, '.zip');

      const repository = await this.repositoryRepo.create({
        name: repoName,
        sourceType: 'upload',
        sourceUrl: originalName,
        status: 'uploaded',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const repositoryId = repository.id;

      const localPath = await this.storage.moveToStorage(extractDir, repositoryId);

      await this.repositoryRepo.update(repositoryId, { localPath } as Partial<IRepository>);

      logger.info({ repositoryId, name: repoName }, 'Repository uploaded successfully');

      return { repositoryId, repository };
    } catch (error) {
      await this.storage.cleanup(extractDir);
      throw error;
    }
  }
}
