import { Router } from 'express';
import { AstParserService, EntityExtractorService } from '@archaeologist/analysis-engine';
import { RepositoryRepository } from '../infrastructure/database/repositories/RepositoryRepository.js';
import { RepositoryTreeRepository } from '../infrastructure/database/repositories/RepositoryTreeRepository.js';
import { EntityDefinitionRepository } from '../infrastructure/database/repositories/EntityDefinitionRepository.js';
import type { IEntityDefinition } from '../infrastructure/database/schemas/EntityDefinition.js';
import { EntityExtractionService } from '../services/analysis/EntityExtractionService.js';
import { NotFoundError } from '../utils/errors.js';

const router: Router = Router();

const repositoryRepo = new RepositoryRepository();
const treeRepo = new RepositoryTreeRepository();
const entityRepo = new EntityDefinitionRepository();
const astParser = new AstParserService();
const entityExtractor = new EntityExtractorService();
const entityExtractionService = new EntityExtractionService(
  astParser,
  entityExtractor,
  entityRepo,
  repositoryRepo,
  treeRepo,
);

router.post('/repositories/:id/entities', async (req, res, next) => {
  try {
    const summary = await entityExtractionService.extract(req.params.id);

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/repositories/:id/entities', async (req, res, next) => {
  try {
    const repository = await repositoryRepo.findById(req.params.id);
    if (!repository) {
      throw new NotFoundError('Repository not found');
    }

    const type = req.query.type as string | undefined;

    let entities;
    if (type) {
      entities = await entityRepo.findByRepositoryIdAndType(
        req.params.id,
        type as IEntityDefinition['type'],
      );
    } else {
      entities = await entityRepo.findByRepositoryId(req.params.id);
    }

    res.json({
      success: true,
      data: entities,
    });
  } catch (error) {
    next(error);
  }
});

export { router as entitiesRouter };
