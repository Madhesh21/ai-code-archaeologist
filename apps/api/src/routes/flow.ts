import { Router, type Request, type Response, type NextFunction } from 'express';
import { FlowReconstructionService } from '@archaeologist/graph-engine';
import { RepositoryRepository } from '../infrastructure/database/repositories/RepositoryRepository.js';
import { FlowRepository } from '../infrastructure/database/repositories/FlowRepository.js';
import { Neo4jClient } from '../infrastructure/graph/Neo4jClient.js';
import { logger } from '../utils/logger.js';
import { NotFoundError, InternalError } from '../utils/errors.js';

const router: Router = Router();

const repositoryRepo = new RepositoryRepository();
const flowRepo = new FlowRepository();
const neo4jClient = new Neo4jClient();
const flowService = new FlowReconstructionService(neo4jClient);

router.get('/repositories/:id/flows', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = await repositoryRepo.findById(req.params.id);
    if (!repository) {
      throw new NotFoundError('Repository not found');
    }

    const flows = await flowRepo.findByRepositoryId(req.params.id);

    res.json({
      success: true,
      data: flows.map((f) => ({
        id: f.id,
        name: f.name,
        startNode: f.startNode,
        stepCount: f.steps?.length ?? 0,
        generatedAt: f.generatedAt,
      })),
    });
  } catch (error) {
    next(error);
  }
});

router.get(
  '/repositories/:id/flows/:flowId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const flow = await flowRepo.findById(req.params.flowId);
      if (!flow) {
        throw new NotFoundError('Flow not found');
      }

      res.json({
        success: true,
        data: {
          id: flow.id,
          name: flow.name,
          startNode: flow.startNode,
          steps: flow.steps ?? [],
          generatedAt: flow.generatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  '/repositories/:id/flows/generate',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const repository = await repositoryRepo.findById(req.params.id);
      if (!repository) {
        throw new NotFoundError('Repository not found');
      }

      const { entityName } = req.body;
      if (!entityName) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'entityName is required' },
        });
        return;
      }

      if (!neo4jClient.isConnected()) {
        await neo4jClient.connect();
      }

      logger.info({ repositoryId: req.params.id, entityName }, 'Generating flow');

      const flow = await flowService.generateFlow(req.params.id, entityName);

      const saved = await flowRepo.create({
        repositoryId: req.params.id,
        name: flow.name,
        startNode: flow.startNode,
        steps: flow.steps.map((s) => ({
          nodeId: s.nodeId,
          nodeName: s.nodeName,
          nodeType: s.nodeType,
          filePath: s.filePath,
          details: s.details,
        })),
        generatedAt: new Date(flow.generatedAt),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      res.status(201).json({
        success: true,
        data: {
          flowId: saved.id,
          name: saved.name,
          steps: saved.steps,
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

export { router as flowRouter };
