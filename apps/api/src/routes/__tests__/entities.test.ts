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
    return {
      findByRepositoryId: vi.fn(),
      findByRepositoryIdAndType: vi.fn(),
      deleteByRepositoryId: vi.fn(),
      create: vi.fn(),
    };
  }),
}));

vi.mock('../../services/analysis/EntityExtractionService.js', () => ({
  EntityExtractionService: vi.fn().mockImplementation(function () {
    return { extract: vi.fn() };
  }),
}));

describe('entities router', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should export a router with POST and GET routes', async () => {
    const { entitiesRouter } = await import('../entities.js');
    const routes = entitiesRouter.stack.map((layer) => ({
      path: (layer as any).route?.path,
      method: (layer as any).route?.stack[0]?.method,
    }));

    expect(routes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: '/repositories/:id/entities', method: 'post' }),
        expect.objectContaining({ path: '/repositories/:id/entities', method: 'get' }),
      ]),
    );
  });

  it('should have POST and GET routes registered', async () => {
    const { entitiesRouter } = await import('../entities.js');
    const routes = entitiesRouter.stack.map((layer) => ({
      path: (layer as any).route?.path,
      method: (layer as any).route?.stack[0]?.method,
    }));

    expect(routes.length).toBeGreaterThanOrEqual(2);
  });
});
