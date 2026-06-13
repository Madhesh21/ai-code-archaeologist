import { Router } from 'express';
import { TechnologyDetectorService } from '@archaeologist/analysis-engine';
import { RepositoryRepository } from '../infrastructure/database/repositories/RepositoryRepository.js';
import { RepositoryTreeRepository } from '../infrastructure/database/repositories/RepositoryTreeRepository.js';
import { TechnologyProfileRepository } from '../infrastructure/database/repositories/TechnologyProfileRepository.js';
import { logger } from '../utils/logger.js';
import { NotFoundError, InternalError } from '../utils/errors.js';

const router: Router = Router();

const repositoryRepo = new RepositoryRepository();
const treeRepo = new RepositoryTreeRepository();
const technologyProfileRepo = new TechnologyProfileRepository();
const detector = new TechnologyDetectorService();

router.get('/repositories/:id/technology', async (req, res, next) => {
  try {
    const existing = await technologyProfileRepo.findByRepositoryId(req.params.id);

    if (!existing) {
      throw new NotFoundError('Technology profile not found. Run technology detection first.');
    }

    res.json({
      success: true,
      data: existing,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/repositories/:id/technology', async (req, res, next) => {
  try {
    const repository = await repositoryRepo.findById(req.params.id);
    if (!repository) {
      throw new NotFoundError('Repository not found');
    }

    const localPath = repository.localPath;
    if (!localPath) {
      throw new InternalError('Repository has no local path');
    }

    const tree = await treeRepo.findByRepositoryId(req.params.id);
    if (!tree) {
      throw new NotFoundError('Repository tree not found. Run scan first.');
    }

    logger.info({ repositoryId: req.params.id }, 'Starting technology detection');

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

    const saved = await technologyProfileRepo.upsert(req.params.id, profile);

    logger.info(
      { repositoryId: req.params.id, profile },
      'Technology detection completed',
    );

    res.json({
      success: true,
      data: saved,
    });
  } catch (error) {
    next(error);
  }
});

export { router as technologyRouter };
