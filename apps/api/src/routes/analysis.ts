import { Router } from 'express';
import { ScannerService, IgnoreRules } from '@archaeologist/analysis-engine';
import { RepositoryRepository } from '../infrastructure/database/repositories/RepositoryRepository.js';
import { RepositoryTreeRepository } from '../infrastructure/database/repositories/RepositoryTreeRepository.js';
import { AnalysisService } from '../services/analysis/AnalysisService.js';

const router: Router = Router();

const scannerService = new ScannerService(new IgnoreRules());
const treeRepo = new RepositoryTreeRepository();
const repositoryRepo = new RepositoryRepository();
const analysisService = new AnalysisService(scannerService, treeRepo, repositoryRepo);

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

export { router as analysisRouter };
