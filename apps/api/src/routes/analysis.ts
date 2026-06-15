import { Router } from 'express';
import { ScannerService, IgnoreRules } from '@archaeologist/analysis-engine';
import { RepositoryRepository } from '../infrastructure/database/repositories/RepositoryRepository.js';
import { RepositoryTreeRepository } from '../infrastructure/database/repositories/RepositoryTreeRepository.js';
import { EntityDefinitionRepository } from '../infrastructure/database/repositories/EntityDefinitionRepository.js';
import { RelationshipRepository } from '../infrastructure/database/repositories/RelationshipRepository.js';
import { AnalysisRepository } from '../infrastructure/database/repositories/AnalysisRepository.js';
import { Neo4jClient } from '../infrastructure/graph/Neo4jClient.js';
import { AnalysisService } from '../services/analysis/AnalysisService.js';
import { AnalysisPipelineService } from '../services/analysis/AnalysisPipelineService.js';

const router: Router = Router();

const scannerService = new ScannerService(new IgnoreRules());
const treeRepo = new RepositoryTreeRepository();
const repositoryRepo = new RepositoryRepository();
const analysisService = new AnalysisService(scannerService, treeRepo, repositoryRepo);

const entityDefRepo = new EntityDefinitionRepository();
const relationshipRepo = new RelationshipRepository();
const analysisRepo = new AnalysisRepository();
const neo4jClient = new Neo4jClient();
const pipelineService = new AnalysisPipelineService(
  repositoryRepo,
  treeRepo,
  entityDefRepo,
  relationshipRepo,
  analysisRepo,
  neo4jClient,
);

router.post('/repositories/:id/scan', async (req, res, next) => {
  try {
    const result = await analysisService.scanRepository(req.params.id);

    res.json({
      success: true,
      data: {
        files: result.files.length,
        folders: result.folders.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/repositories/:id/tree', async (req, res, next) => {
  try {
    const tree = await analysisService.getRepositoryTree(req.params.id);

    res.json({
      success: true,
      data: tree,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/repositories/:id/pipeline', async (req, res, next) => {
  try {
    if (!neo4jClient.isConnected()) {
      await neo4jClient.connect();
    }

    const result = await pipelineService.runFullAnalysis(req.params.id);

    res.json({
      success: result.success,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

export { router as analysisRouter };
