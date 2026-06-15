import { Router } from 'express';
import { AstParserService, EntityExtractorService, RelationshipExtractorService } from '@archaeologist/analysis-engine';
import { RepositoryRepository } from '../infrastructure/database/repositories/RepositoryRepository.js';
import { RepositoryTreeRepository } from '../infrastructure/database/repositories/RepositoryTreeRepository.js';
import { EntityDefinitionRepository } from '../infrastructure/database/repositories/EntityDefinitionRepository.js';
import { RelationshipRepository } from '../infrastructure/database/repositories/RelationshipRepository.js';
import { RelationshipExtractionService } from '../services/analysis/RelationshipExtractionService.js';
import { NotFoundError } from '../utils/errors.js';

const router: Router = Router();

const repositoryRepo = new RepositoryRepository();
const treeRepo = new RepositoryTreeRepository();
const entityRepo = new EntityDefinitionRepository();
const relationshipRepo = new RelationshipRepository();
const astParser = new AstParserService();
const entityExtractor = new EntityExtractorService();
const relationshipExtractor = new RelationshipExtractorService();
const relationshipExtractionService = new RelationshipExtractionService(
  astParser,
  entityExtractor,
  relationshipExtractor,
  entityRepo,
  relationshipRepo,
  repositoryRepo,
  treeRepo,
);

router.post('/repositories/:id/relationships', async (req, res, next) => {
  try {
    const summary = await relationshipExtractionService.extract(req.params.id);

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/repositories/:id/relationships', async (req, res, next) => {
  try {
    const repository = await repositoryRepo.findById(req.params.id);
    if (!repository) {
      throw new NotFoundError('Repository not found');
    }

    const type = req.query.type as string | undefined;

    let relationships;
    if (type) {
      relationships = await relationshipRepo.findByRepositoryIdAndType(
        req.params.id,
        type,
      );
    } else {
      relationships = await relationshipRepo.findByRepositoryId(req.params.id);
    }

    res.json({
      success: true,
      data: relationships,
    });
  } catch (error) {
    next(error);
  }
});

export { router as relationshipsRouter };
