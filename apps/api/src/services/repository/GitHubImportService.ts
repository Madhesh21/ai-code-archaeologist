import { GitHubUrlValidationService } from './GitHubUrlValidationService.js';
import { GitCloneService } from './GitCloneService.js';
import { FileStorageService } from './FileStorageService.js';
import { RepositoryRepository } from '../../infrastructure/database/repositories/RepositoryRepository.js';
import type { IRepository } from '../../infrastructure/database/schemas/interfaces.js';
import { logger } from '../../utils/logger.js';

export interface GitHubImportResult {
  repositoryId: string;
}

export class GitHubImportService {
  constructor(
    private readonly urlValidator: GitHubUrlValidationService,
    private readonly cloneService: GitCloneService,
    private readonly storage: FileStorageService,
    private readonly repositoryRepo: RepositoryRepository,
  ) {}

  async importFromGitHub(url: string): Promise<GitHubImportResult> {
    const repoInfo = this.urlValidator.validate(url);

    const repository = await this.repositoryRepo.create({
      name: `${repoInfo.owner}/${repoInfo.repo}`,
      sourceType: 'github',
      sourceUrl: url,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const repositoryId = repository.id;

    try {
      const cloneDir = await this.cloneService.clone(url, repositoryId);
      const localPath = await this.storage.moveToStorage(cloneDir, repositoryId);
      await this.repositoryRepo.update(repositoryId, { localPath } as Partial<IRepository>);
      await this.repositoryRepo.updateStatus(repositoryId, 'uploaded');

      logger.info({ repositoryId, repoInfo }, 'Repository imported from GitHub');

      return { repositoryId };
    } catch (error) {
      logger.error({ repositoryId, url, error }, 'GitHub import failed');
      await this.cloneService.cleanup(repositoryId);
      await this.repositoryRepo.updateStatus(repositoryId, 'failed');
      throw error;
    }
  }
}
