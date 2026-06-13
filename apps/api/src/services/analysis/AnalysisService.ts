import type { ScannerService, ScanResult } from '@archaeologist/analysis-engine';
import { TechnologyDetectorService } from '@archaeologist/analysis-engine';
import type { TechnologyProfile } from '@archaeologist/analysis-engine';
import type { RepositoryTreeRepository } from '../../infrastructure/database/repositories/RepositoryTreeRepository.js';
import type { RepositoryRepository } from '../../infrastructure/database/repositories/RepositoryRepository.js';
import type { TechnologyProfileRepository } from '../../infrastructure/database/repositories/TechnologyProfileRepository.js';
import type { IRepositoryTree } from '../../infrastructure/database/schemas/RepositoryTree.js';
import { logger } from '../../utils/logger.js';
import { NotFoundError, InternalError } from '../../utils/errors.js';

export class AnalysisService {
  constructor(
    private readonly scannerService: ScannerService,
    private readonly treeRepo: RepositoryTreeRepository,
    private readonly repositoryRepo: RepositoryRepository,
    private readonly technologyProfileRepo?: TechnologyProfileRepository,
    private readonly technologyDetector?: TechnologyDetectorService,
  ) {}

  async scanRepository(repositoryId: string): Promise<ScanResult> {
    const repository = await this.repositoryRepo.findById(repositoryId);
    if (!repository) {
      throw new NotFoundError('Repository not found');
    }

    const localPath = repository.localPath;
    if (!localPath) {
      throw new InternalError('Repository has no local path');
    }

    logger.info({ repositoryId, path: localPath }, 'Starting repository scan');

    await this.repositoryRepo.updateStatus(repositoryId, 'scanning');

    try {
      const result = await this.scannerService.scan(localPath);

      const tree = {
        repositoryId,
        files: result.files,
        folders: result.folders,
        scannedAt: new Date(),
      };
      await this.treeRepo.create(tree);

      await this.repositoryRepo.updateStatus(repositoryId, 'analyzing');

      logger.info(
        { repositoryId, files: result.files.length, folders: result.folders.length },
        'Repository scan completed',
      );

      return result;
    } catch (error) {
      await this.repositoryRepo.updateStatus(repositoryId, 'failed');
      logger.error({ repositoryId, error }, 'Repository scan failed');
      throw error;
    }
  }

  async getRepositoryTree(repositoryId: string): Promise<IRepositoryTree> {
    const tree = await this.treeRepo.findByRepositoryId(repositoryId);
    if (!tree) {
      throw new NotFoundError('Repository tree not found. Run scan first.');
    }
    return tree;
  }

  async detectTechnologies(repositoryId: string): Promise<TechnologyProfile> {
    const repository = await this.repositoryRepo.findById(repositoryId);
    if (!repository) {
      throw new NotFoundError('Repository not found');
    }

    const localPath = repository.localPath;
    if (!localPath) {
      throw new InternalError('Repository has no local path');
    }

    const tree = await this.treeRepo.findByRepositoryId(repositoryId);
    if (!tree) {
      throw new NotFoundError('Repository tree not found. Run scan first.');
    }

    logger.info({ repositoryId }, 'Starting technology detection');

    const detector =
      this.technologyDetector ?? new TechnologyDetectorService();
    const { profile } = await detector.detectTechnologies({
      repositoryPath: localPath,
      scanResult: {
        files: tree.files.map((f) => ({
          path: f.path,
          extension: f.extension,
          size: f.size,
          hash: f.hash,
        })),
        folders: tree.folders.map((f) => ({ path: f.path })),
      },
    });

    if (this.technologyProfileRepo) {
      await this.technologyProfileRepo.upsert(repositoryId, profile);
    }

    logger.info(
      { repositoryId, profile },
      'Technology detection completed',
    );

    return { id: '', repositoryId, ...profile };
  }
}
