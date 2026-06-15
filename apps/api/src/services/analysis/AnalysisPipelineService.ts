import type { ScanResult } from '@archaeologist/analysis-engine';
import { ScannerService, IgnoreRules, TechnologyDetectorService, AstParserService, EntityExtractorService, RelationshipExtractorService } from '@archaeologist/analysis-engine';
import { GraphBuilderService, FlowReconstructionService } from '@archaeologist/graph-engine';
import { EmbeddingService } from '@archaeologist/search-engine';
import { QdrantVectorClient } from '@archaeologist/search-engine';
import type { RepositoryRepository } from '../../infrastructure/database/repositories/RepositoryRepository.js';
import type { RepositoryTreeRepository } from '../../infrastructure/database/repositories/RepositoryTreeRepository.js';
import type { EntityDefinitionRepository } from '../../infrastructure/database/repositories/EntityDefinitionRepository.js';
import type { RelationshipRepository } from '../../infrastructure/database/repositories/RelationshipRepository.js';
import type { AnalysisRepository } from '../../infrastructure/database/repositories/AnalysisRepository.js';
import type { FlowRepository } from '../../infrastructure/database/repositories/FlowRepository.js';
import type { Neo4jClient } from '../../infrastructure/graph/Neo4jClient.js';
import { NodeService } from '../../infrastructure/graph/services/NodeService.js';
import { RelationshipService } from '../../infrastructure/graph/services/RelationshipService.js';
import { OllamaAiClient } from '../../infrastructure/ai/OllamaAiClient.js';
import { EntityExtractionService } from './EntityExtractionService.js';
import { RelationshipExtractionService } from './RelationshipExtractionService.js';
import { ReportGeneratorService } from './ReportGeneratorService.js';
import type { ExtractionSummary } from './EntityExtractionService.js';
import type { RelationshipSummary } from './RelationshipExtractionService.js';
import { logger } from '../../utils/logger.js';
import { NotFoundError } from '../../utils/errors.js';

export interface PipelineResult {
  repositoryId: string;
  success: boolean;
  stages: {
    scan: { status: string; files?: number; folders?: number };
    technology: { status: string };
    entities: { status: string; totalEntities?: number };
    relationships: { status: string; totalRelationships?: number };
    graph: { status: string; nodeCount?: number; edgeCount?: number };
    embedding: { status: string; embeddedCount?: number };
    flow: { status: string; flowCount?: number };
    report: { status: string };
  };
  errors: string[];
}

export class AnalysisPipelineService {
  constructor(
    private readonly repositoryRepo: RepositoryRepository,
    private readonly treeRepo: RepositoryTreeRepository,
    private readonly entityDefRepo: EntityDefinitionRepository,
    private readonly relationshipRepo: RelationshipRepository,
    private readonly analysisRepo: AnalysisRepository,
    private readonly neo4jClient: Neo4jClient,
    private readonly flowRepo?: FlowRepository,
    private readonly technologyDetector?: TechnologyDetectorService,
  ) {}

  async runFullAnalysis(repositoryId: string): Promise<PipelineResult> {
    const repository = await this.repositoryRepo.findById(repositoryId);
    if (!repository) {
      throw new NotFoundError('Repository not found');
    }

    const localPath = repository.localPath;
    if (!localPath) {
      throw new NotFoundError('Repository has no local path');
    }

    const errors: string[] = [];
    const stages: PipelineResult['stages'] = {
      scan: { status: 'pending' },
      technology: { status: 'pending' },
      entities: { status: 'pending' },
      relationships: { status: 'pending' },
      graph: { status: 'pending' },
      embedding: { status: 'pending' },
      flow: { status: 'pending' },
      report: { status: 'pending' },
    };

    try {
      stages.scan = await this.runScan(repositoryId, localPath);
    } catch (err) {
      stages.scan = { status: 'failed' };
      errors.push(`Scan failed: ${err instanceof Error ? err.message : String(err)}`);
      return { repositoryId, success: false, stages, errors };
    }

    try {
      stages.technology = await this.runTechnologyDetection(repositoryId);
    } catch (err) {
      stages.technology = { status: 'failed' };
      errors.push(`Technology detection failed: ${err instanceof Error ? err.message : String(err)}`);
    }

    try {
      const entityResult = await this.runEntityExtraction(repositoryId);
      stages.entities = { status: 'completed', totalEntities: entityResult.totalEntities };
    } catch (err) {
      stages.entities = { status: 'failed' };
      errors.push(`Entity extraction failed: ${err instanceof Error ? err.message : String(err)}`);
    }

    try {
      const relResult = await this.runRelationshipExtraction(repositoryId);
      stages.relationships = { status: 'completed', totalRelationships: relResult.totalRelationships };
    } catch (err) {
      stages.relationships = { status: 'failed' };
      errors.push(`Relationship extraction failed: ${err instanceof Error ? err.message : String(err)}`);
    }

    try {
      const graphResult = await this.runGraphBuilding(repositoryId);
      stages.graph = { status: 'completed', nodeCount: graphResult.nodeCount, edgeCount: graphResult.edgeCount };
    } catch (err) {
      stages.graph = { status: 'failed' };
      errors.push(`Graph building failed: ${err instanceof Error ? err.message : String(err)}`);
    }

    try {
      const embedResult = await this.runEmbeddingGeneration(repositoryId);
      stages.embedding = { status: 'completed', embeddedCount: embedResult };
    } catch (err) {
      stages.embedding = { status: 'failed' };
      errors.push(`Embedding generation failed: ${err instanceof Error ? err.message : String(err)}`);
    }

    try {
      const flowResult = await this.runFlowReconstruction(repositoryId);
      stages.flow = { status: 'completed', flowCount: flowResult };
    } catch (err) {
      stages.flow = { status: 'failed' };
      errors.push(`Flow reconstruction failed: ${err instanceof Error ? err.message : String(err)}`);
    }

    try {
      await this.runReportGeneration(repositoryId);
      stages.report = { status: 'completed' };
    } catch (err) {
      stages.report = { status: 'failed' };
      errors.push(`Report generation failed: ${err instanceof Error ? err.message : String(err)}`);
    }

    const success = errors.length === 0;
    await this.repositoryRepo.updateStatus(repositoryId, success ? 'ready' : 'failed');

    logger.info(
      { repositoryId, success, stages: Object.values(stages).map((s) => s.status) },
      'Analysis pipeline completed',
    );

    return { repositoryId, success, stages, errors };
  }

  private async runScan(repositoryId: string, localPath: string): Promise<{ status: string; files?: number; folders?: number }> {
    await this.repositoryRepo.updateStatus(repositoryId, 'scanning');

    const scanner = new ScannerService(new IgnoreRules());
    const result: ScanResult = await scanner.scan(localPath);

    const tree = {
      repositoryId,
      files: result.files,
      folders: result.folders,
      scannedAt: new Date(),
    };
    await this.treeRepo.create(tree);

    return { status: 'completed', files: result.files.length, folders: result.folders.length };
  }

  private async runTechnologyDetection(repositoryId: string): Promise<{ status: string }> {
    const tree = await this.treeRepo.findByRepositoryId(repositoryId);
    if (!tree) return { status: 'skipped' };

    const detector = this.technologyDetector ?? new TechnologyDetectorService();
    await detector.detectTechnologies({
      repositoryPath: '',
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

    return { status: 'completed' };
  }

  private async runEntityExtraction(repositoryId: string): Promise<ExtractionSummary> {
    const astParser = new AstParserService();
    const entityExtractor = new EntityExtractorService();
    const entityExtractionService = new EntityExtractionService(
      astParser,
      entityExtractor,
      this.entityDefRepo,
      this.repositoryRepo,
      this.treeRepo,
    );

    return await entityExtractionService.extract(repositoryId);
  }

  private async runRelationshipExtraction(repositoryId: string): Promise<RelationshipSummary> {
    const astParser = new AstParserService();
    const entityExtractor = new EntityExtractorService();
    const relationshipExtractor = new RelationshipExtractorService();
    const relationshipExtractionService = new RelationshipExtractionService(
      astParser,
      entityExtractor,
      relationshipExtractor,
      this.entityDefRepo,
      this.relationshipRepo,
      this.repositoryRepo,
      this.treeRepo,
    );

    return await relationshipExtractionService.extract(repositoryId);
  }

  private async runGraphBuilding(repositoryId: string): Promise<{ nodeCount: number; edgeCount: number }> {
    await this.repositoryRepo.updateStatus(repositoryId, 'graph_building');

    const entityDefs = await this.entityDefRepo.findByRepositoryId(repositoryId);
    const relationships = await this.relationshipRepo.findByRepositoryId(repositoryId);

    const nodeService = new NodeService(this.neo4jClient);
    const relationshipService = new RelationshipService(this.neo4jClient);
    const graphBuilder = new GraphBuilderService(nodeService, relationshipService, this.neo4jClient);

    const result = await graphBuilder.buildGraph({
      repositoryId,
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

    return { nodeCount: result.nodeCount, edgeCount: result.edgeCount };
  }

  private async runEmbeddingGeneration(repositoryId: string): Promise<number> {
    await this.repositoryRepo.updateStatus(repositoryId, 'embedding');

    const entityDefs = await this.entityDefRepo.findByRepositoryId(repositoryId);

    const embeddableTypes = ['FUNCTION', 'CLASS', 'API_ROUTE', 'SERVICE', 'COMPONENT'];
    const embeddable = entityDefs.filter((e) => embeddableTypes.includes(e.type));

    if (embeddable.length === 0) {
      logger.info({ repositoryId }, 'No embeddable entities found');
      return 0;
    }

    const ollamaClient = new OllamaAiClient();
    const vectorClient = new QdrantVectorClient();
    const embeddingService = new EmbeddingService(ollamaClient, vectorClient);

    await embeddingService.ensureCollection();

    const payloads = embeddable.map((e) => {
      const meta = e.metadata as Record<string, unknown> | undefined;
      let content = e.name;

      if (e.type === 'API_ROUTE') {
        const method = (meta?.method as string) ?? 'GET';
        const path = (meta?.path as string) ?? '/';
        content = `${method} ${path}`;
      } else if (e.type === 'CLASS') {
        content = `Class ${e.name}`;
      } else if (e.type === 'SERVICE') {
        content = `${e.name} Service`;
      }

      return {
        entityId: e.id,
        entityType: e.type,
        entityName: e.name,
        filePath: e.filePath,
        repositoryId: e.repositoryId,
        content,
      };
    });

    await embeddingService.embedEntities(payloads);

    logger.info({ repositoryId, count: payloads.length }, 'Embeddings generated');

    return payloads.length;
  }

  private async runFlowReconstruction(repositoryId: string): Promise<number> {
    const routes = await this.entityDefRepo.findByRepositoryId(repositoryId);

    const flowCandidates = routes.filter((r) =>
      ['API_ROUTE', 'FUNCTION', 'SERVICE'].includes(r.type),
    );

    if (flowCandidates.length === 0) {
      logger.info({ repositoryId }, 'No flow candidates found');
      return 0;
    }

    if (!this.flowRepo) {
      logger.warn({ repositoryId }, 'Flow repository not available, skipping flow reconstruction');
      return 0;
    }

    if (!this.neo4jClient.isConnected()) {
      logger.warn({ repositoryId }, 'Neo4j not connected, skipping flow reconstruction');
      return 0;
    }

    const flowService = new FlowReconstructionService(this.neo4jClient);

    const topCandidates = flowCandidates.slice(0, 10);
    let flowCount = 0;

    for (const candidate of topCandidates) {
      try {
        const flow = await flowService.generateFlow(repositoryId, candidate.name);

        const existing = await this.flowRepo.findByName(repositoryId, flow.name);
        if (!existing) {
          await this.flowRepo.create({
            repositoryId,
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
          flowCount++;
        }
      } catch (err) {
        logger.warn({ repositoryId, candidate: candidate.name, err }, 'Flow generation failed for candidate');
      }
    }

    logger.info({ repositoryId, flowCount }, 'Flow reconstruction completed');
    return flowCount;
  }

  private async runReportGeneration(repositoryId: string): Promise<void> {
    await this.repositoryRepo.updateStatus(repositoryId, 'report_generating');

    const reportGenerator = new ReportGeneratorService(
      this.repositoryRepo,
      this.entityDefRepo,
      this.relationshipRepo,
      this.treeRepo,
    );

    await reportGenerator.generate(repositoryId);
  }
}
