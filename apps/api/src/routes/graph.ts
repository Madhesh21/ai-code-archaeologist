import { Router } from 'express';
import { GraphBuilderService } from '@archaeologist/graph-engine';
import { RepositoryRepository } from '../infrastructure/database/repositories/RepositoryRepository.js';
import { EntityDefinitionRepository } from '../infrastructure/database/repositories/EntityDefinitionRepository.js';
import { RelationshipRepository } from '../infrastructure/database/repositories/RelationshipRepository.js';
import { Neo4jClient } from '../infrastructure/graph/Neo4jClient.js';
import { NodeService } from '../infrastructure/graph/services/NodeService.js';
import { RelationshipService } from '../infrastructure/graph/services/RelationshipService.js';
import { logger } from '../utils/logger.js';
import { NotFoundError, InternalError } from '../utils/errors.js';

const router: Router = Router();

const repositoryRepo = new RepositoryRepository();
const entityDefinitionRepo = new EntityDefinitionRepository();
const relationshipRepo = new RelationshipRepository();
const neo4jClient = new Neo4jClient();
const nodeService = new NodeService(neo4jClient);
const relationshipService = new RelationshipService(neo4jClient);
const graphBuilder = new GraphBuilderService(nodeService, relationshipService, neo4jClient);

router.post('/repositories/:id/graph', async (req, res, next) => {
  try {
    const repository = await repositoryRepo.findById(req.params.id);
    if (!repository) {
      throw new NotFoundError('Repository not found');
    }

    const entityDefs = await entityDefinitionRepo.findByRepositoryId(req.params.id);
    if (!entityDefs || entityDefs.length === 0) {
      throw new NotFoundError('No entity definitions found. Run entity extraction first.');
    }

    const relationships = await relationshipRepo.findByRepositoryId(req.params.id);

    logger.info(
      { repositoryId: req.params.id, entities: entityDefs.length, relationships: relationships.length },
      'Building knowledge graph',
    );

    await repositoryRepo.updateStatus(req.params.id, 'graph_building');

    const result = await graphBuilder.buildGraph({
      repositoryId: req.params.id,
      entities: entityDefs.map((e) => ({
        id: e.id,
        name: e.name,
        type: e.type,
        fileId: e.fileId,
        filePath: e.filePath,
        startLine: e.startLine ?? 0,
        endLine: e.endLine ?? 0,
        metadata: e.metadata ?? {},
      })),
      relationships: relationships.map((r) => ({
        id: r.id,
        sourceEntityId: r.sourceEntityId,
        sourceEntityName: r.sourceEntityName,
        targetEntityId: r.targetEntityId,
        targetEntityName: r.targetEntityName,
        type: r.type,
        filePath: r.filePath,
        startLine: r.startLine,
      })),
    });

    await repositoryRepo.updateStatus(req.params.id, result.success ? 'embedding' : 'failed');

    res.json({
      success: result.success,
      data: {
        nodeCount: result.nodeCount,
        edgeCount: result.edgeCount,
        errors: result.errors,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/repositories/:id/graph', async (req, res, next) => {
  try {
    const repository = await repositoryRepo.findById(req.params.id);
    if (!repository) {
      throw new NotFoundError('Repository not found');
    }

    const entityDefs = await entityDefinitionRepo.findByRepositoryId(req.params.id);

    res.json({
      success: true,
      data: {
        entities: entityDefs,
      },
    });
  } catch (error) {
    next(error);
  }
});

export { router as graphRouter };
