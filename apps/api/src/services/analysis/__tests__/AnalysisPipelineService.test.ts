import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import type { Neo4jClient } from '../../../infrastructure/graph/Neo4jClient.js';
import type { RepositoryRepository } from '../../../infrastructure/database/repositories/RepositoryRepository.js';
import type { RepositoryTreeRepository } from '../../../infrastructure/database/repositories/RepositoryTreeRepository.js';
import type { EntityDefinitionRepository } from '../../../infrastructure/database/repositories/EntityDefinitionRepository.js';
import type { RelationshipRepository } from '../../../infrastructure/database/repositories/RelationshipRepository.js';
import type { AnalysisRepository } from '../../../infrastructure/database/repositories/AnalysisRepository.js';

vi.mock('@archaeologist/graph-engine', () => ({
  GraphBuilderService: vi.fn().mockImplementation(function () {
    return {
      buildGraph: vi.fn().mockResolvedValue({ nodeCount: 3, edgeCount: 2 }),
    };
  }),
  FlowReconstructionService: vi.fn().mockImplementation(function () {
    return {
      generateFlow: vi.fn().mockRejectedValue(new Error('No flow')),
      listFlows: vi.fn().mockResolvedValue([]),
    };
  }),
}));

vi.mock('@archaeologist/search-engine', () => ({
  EmbeddingService: vi.fn().mockImplementation(function () {
    return {
      ensureCollection: vi.fn().mockResolvedValue(undefined),
      embedEntity: vi.fn().mockResolvedValue(undefined),
      embedEntities: vi.fn().mockResolvedValue(undefined),
      deleteEntityEmbeddings: vi.fn().mockResolvedValue(undefined),
    };
  }),
  QdrantVectorClient: vi.fn().mockImplementation(function () {
    return {
      ensureCollection: vi.fn().mockResolvedValue(undefined),
      upsert: vi.fn().mockResolvedValue(undefined),
      search: vi.fn().mockResolvedValue([]),
      deleteByRepositoryId: vi.fn().mockResolvedValue(undefined),
      collectionExists: vi.fn().mockResolvedValue(true),
    };
  }),
}));

vi.mock('../../../infrastructure/ai/OllamaAiClient.js', () => ({
  OllamaAiClient: vi.fn().mockImplementation(function () {
    return {
      chat: vi.fn(),
      chatStream: vi.fn(),
      embed: vi.fn().mockResolvedValue([0.1, 0.2, 0.3]),
      isAvailable: vi.fn().mockResolvedValue(true),
    };
  }),
}));

const mockRepositoryRepo = {
  findById: vi.fn(),
  updateStatus: vi.fn(),
} as unknown as RepositoryRepository;

const mockTreeRepo = {
  findByRepositoryId: vi.fn(),
  create: vi.fn(),
} as unknown as RepositoryTreeRepository;

const mockEntityDefRepo = {
  findByRepositoryId: vi.fn(),
  deleteByRepositoryId: vi.fn(),
  create: vi.fn(),
} as unknown as EntityDefinitionRepository;

const mockRelationshipRepo = {
  findByRepositoryId: vi.fn(),
  deleteByRepositoryId: vi.fn(),
  create: vi.fn(),
} as unknown as RelationshipRepository;

const mockAnalysisRepo = {} as unknown as AnalysisRepository;

const mockNeo4jClient = {
  isConnected: vi.fn().mockReturnValue(true),
  connect: vi.fn(),
  run: vi.fn(),
  close: vi.fn(),
} as unknown as Neo4jClient;

let fixtureDir: string;

async function createPipeline() {
  const { AnalysisPipelineService } = await import('../AnalysisPipelineService.js');
  return new AnalysisPipelineService(
    mockRepositoryRepo,
    mockTreeRepo,
    mockEntityDefRepo,
    mockRelationshipRepo,
    mockAnalysisRepo,
    mockNeo4jClient,
  );
}

describe('AnalysisPipelineService', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    fixtureDir = fs.mkdtempSync(
      path.join(os.tmpdir(), 'pipeline-test-'),
    );

    fs.writeFileSync(path.join(fixtureDir, 'index.ts'), 'export function greet() { return "hello"; }\n');
    fs.mkdirSync(path.join(fixtureDir, 'src'));
    fs.writeFileSync(path.join(fixtureDir, 'src', 'utils.ts'), 'export const x = 1;\n');

    mockRepositoryRepo.findById = vi.fn().mockResolvedValue({
      _id: 'repo-1',
      localPath: fixtureDir,
      status: 'cloned',
    });
    (mockRepositoryRepo as any).updateStatus = vi.fn().mockResolvedValue(undefined);

    mockTreeRepo.findByRepositoryId = vi.fn().mockResolvedValue({
      repositoryId: 'repo-1',
      files: [
        { path: 'index.ts', extension: '.ts', size: 43, hash: 'abc' },
        { path: 'src/utils.ts', extension: '.ts', size: 19, hash: 'def' },
      ],
      folders: [{ path: 'src' }],
      scannedAt: new Date(),
    });
    (mockTreeRepo as any).create = vi.fn().mockResolvedValue(undefined);

    mockEntityDefRepo.findByRepositoryId = vi.fn().mockResolvedValue([
      {
        id: 'entity-1',
        repositoryId: 'repo-1',
        fileId: 'repo-1:index.ts',
        filePath: 'index.ts',
        name: 'greet',
        type: 'FUNCTION',
        startLine: 1,
        endLine: 1,
        metadata: { isExported: true },
      },
    ]);
    (mockEntityDefRepo as any).deleteByRepositoryId = vi.fn().mockResolvedValue(undefined);
    (mockEntityDefRepo as any).create = vi.fn().mockResolvedValue(undefined);

    mockRelationshipRepo.findByRepositoryId = vi.fn().mockResolvedValue([]);
    (mockRelationshipRepo as any).deleteByRepositoryId = vi.fn().mockResolvedValue(undefined);
    (mockRelationshipRepo as any).create = vi.fn().mockResolvedValue(undefined);
  });

  it('completes all 8 stages successfully on happy path', async () => {
    const pipeline = await createPipeline();
    const result = await pipeline.runFullAnalysis('repo-1');

    expect(result.repositoryId).toBe('repo-1');
    expect(result.stages.scan.status).toBe('completed');
    expect(result.stages.technology.status).toBe('completed');
    expect(result.stages.entities.status).toBe('completed');
    expect(result.stages.relationships.status).toBe('completed');
    expect(result.stages.graph.status).toBe('completed');
    expect(result.stages.embedding.status).toBe('completed');
    expect(result.stages.flow.status).toBe('completed');
    expect(result.stages.report.status).toBe('completed');
    expect(result.errors).toHaveLength(0);
    expect(result.success).toBe(true);
  });

  it('reports scan stage with file and folder counts', async () => {
    const pipeline = await createPipeline();
    const result = await pipeline.runFullAnalysis('repo-1');

    expect(result.stages.scan.status).toBe('completed');
    expect(typeof result.stages.scan.files).toBe('number');
    expect(typeof result.stages.scan.folders).toBe('number');
  });

  it('aborts early when scan fails and returns partial result', async () => {
    mockRepositoryRepo.findById = vi.fn().mockResolvedValue({
      _id: 'repo-1',
      localPath: '/nonexistent\\path',
      status: 'cloned',
    });

    const pipeline = await createPipeline();
    const result = await pipeline.runFullAnalysis('repo-1');

    expect(result.success).toBe(false);
    expect(result.stages.scan.status).toBe('failed');
    expect(result.stages.technology.status).toBe('pending');
    expect(result.stages.entities.status).toBe('pending');
    expect(result.errors.length).toBeGreaterThanOrEqual(1);
    expect(result.errors[0]).toContain('Scan failed');
  });

  it('throws NotFoundError for missing repository', async () => {
    mockRepositoryRepo.findById = vi.fn().mockResolvedValue(null);

    const pipeline = await createPipeline();
    await expect(pipeline.runFullAnalysis('nonexistent')).rejects.toThrow(
      'Repository not found',
    );
  });

  it('throws when repository has no local path', async () => {
    mockRepositoryRepo.findById = vi.fn().mockResolvedValue({
      _id: 'repo-1',
      localPath: '',
      status: 'cloned',
    });

    const pipeline = await createPipeline();
    await expect(pipeline.runFullAnalysis('repo-1')).rejects.toThrow(
      'Repository has no local path',
    );
  });

  it('returns success false when a post-scan stage fails', async () => {
    mockTreeRepo.findByRepositoryId = vi.fn().mockResolvedValue(null);

    const pipeline = await createPipeline();
    const result = await pipeline.runFullAnalysis('repo-1');

    expect(result.success).toBe(false);
    expect(result.stages.scan.status).toBe('completed');
    expect(result.stages.technology.status).toBe('skipped');
    expect(result.errors.length).toBeGreaterThanOrEqual(1);
  });
});
