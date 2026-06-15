import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../infrastructure/database/repositories/RepositoryRepository.js', () => ({
  RepositoryRepository: vi.fn().mockImplementation(function () {
    return { findById: vi.fn() };
  }),
}));

vi.mock('../../infrastructure/database/repositories/RepositoryTreeRepository.js', () => ({
  RepositoryTreeRepository: vi.fn().mockImplementation(function () {
    return {};
  }),
}));

vi.mock('../../infrastructure/database/repositories/EntityDefinitionRepository.js', () => ({
  EntityDefinitionRepository: vi.fn().mockImplementation(function () {
    return {};
  }),
}));

vi.mock('../../infrastructure/database/repositories/RelationshipRepository.js', () => ({
  RelationshipRepository: vi.fn().mockImplementation(function () {
    return {};
  }),
}));

vi.mock('../../infrastructure/database/repositories/AnalysisRepository.js', () => ({
  AnalysisRepository: vi.fn().mockImplementation(function () {
    return {};
  }),
}));

vi.mock('../../infrastructure/graph/Neo4jClient.js', () => ({
  Neo4jClient: vi.fn().mockImplementation(function () {
    return {
      isConnected: vi.fn().mockReturnValue(false),
      connect: vi.fn().mockResolvedValue(undefined),
    };
  }),
}));

vi.mock('../../services/analysis/AnalysisService.js', () => ({
  AnalysisService: vi.fn().mockImplementation(function () {
    return {
      scanRepository: vi.fn(),
      getRepositoryTree: vi.fn(),
    };
  }),
}));

vi.mock('../../services/analysis/AnalysisPipelineService.js', () => ({
  AnalysisPipelineService: vi.fn().mockImplementation(function () {
    return {
      runFullAnalysis: vi.fn(),
    };
  }),
}));

describe('analysis router', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exports a router with scan, tree, and pipeline routes', async () => {
    const { analysisRouter } = await import('../analysis.js');
    const routes = analysisRouter.stack.map((layer: any) => ({
      path: layer.route?.path,
      method: layer.route?.stack[0]?.method,
    }));

    expect(routes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: '/repositories/:id/scan', method: 'post' }),
        expect.objectContaining({ path: '/repositories/:id/tree', method: 'get' }),
        expect.objectContaining({ path: '/repositories/:id/pipeline', method: 'post' }),
      ]),
    );
  });

  it('has the correct number of routes', async () => {
    const { analysisRouter } = await import('../analysis.js');
    expect(analysisRouter.stack.length).toBeGreaterThanOrEqual(3);
  });
});
