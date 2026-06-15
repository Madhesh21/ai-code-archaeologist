import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SearchService } from '../SearchService.js';
import type { SearchResult } from '../types.js';

describe('SearchService', () => {
  const mockEmbed = vi.fn();
  const mockSearch = vi.fn();

  let service: SearchService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new SearchService(
      { embed: mockEmbed },
      {
        search: mockSearch,
        upsert: vi.fn(),
        ensureCollection: vi.fn(),
        deleteByRepositoryId: vi.fn(),
      } as any,
    );
  });

  it('should perform semantic search and return results', async () => {
    mockEmbed.mockResolvedValue([0.1, 0.2, 0.3]);
    mockSearch.mockResolvedValue([
      {
        id: 'fn_1',
        score: 0.95,
        payload: {
          entityId: 'fn_1',
          entityType: 'FUNCTION',
          entityName: 'login',
          filePath: 'src/auth.ts',
          repositoryId: 'repo_1',
        },
      },
    ]);

    const results = await service.semanticSearch('repo_1', 'login function', 5);

    expect(mockEmbed).toHaveBeenCalledWith('login function');
    expect(results).toHaveLength(1);
    expect(results[0].entityName).toBe('login');
    expect(results[0].score).toBe(0.95);
  });

  it('should perform hybrid search and fuse results', async () => {
    mockEmbed.mockResolvedValue([0.1, 0.2, 0.3]);
    mockSearch.mockResolvedValue([
      {
        id: 'fn_2',
        score: 0.8,
        payload: {
          entityId: 'fn_2',
          entityType: 'FUNCTION',
          entityName: 'validate',
          filePath: 'src/auth.ts',
          repositoryId: 'repo_1',
        },
      },
    ]);

    const graphResults: SearchResult[] = [
      { score: 1.0, entityId: 'fn_1', entityType: 'FUNCTION', entityName: 'login', filePath: 'src/auth.ts', repositoryId: 'repo_1' },
    ];

    const result = await service.hybridSearch('repo_1', 'login validate', graphResults, 10);

    expect(result.graphResults).toHaveLength(1);
    expect(result.semanticResults).toHaveLength(1);
    expect(result.fused.length).toBeGreaterThanOrEqual(1);
  });

  it('should deduplicate fused results', async () => {
    mockEmbed.mockResolvedValue([0.1, 0.2, 0.3]);
    mockSearch.mockResolvedValue([
      {
        id: 'fn_1',
        score: 0.9,
        payload: {
          entityId: 'fn_1',
          entityType: 'FUNCTION',
          entityName: 'login',
          filePath: 'src/auth.ts',
          repositoryId: 'repo_1',
        },
      },
    ]);

    const graphResults: SearchResult[] = [
      { score: 1.0, entityId: 'fn_1', entityType: 'FUNCTION', entityName: 'login', filePath: 'src/auth.ts', repositoryId: 'repo_1' },
    ];

    const result = await service.hybridSearch('repo_1', 'login', graphResults, 10);

    expect(result.fused.length).toBe(1);
  });
});
