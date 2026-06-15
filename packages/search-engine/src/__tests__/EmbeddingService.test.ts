import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmbeddingService } from '../EmbeddingService.js';
import type { EmbeddingPayload } from '../types.js';

describe('EmbeddingService', () => {
  const mockEmbed = vi.fn();
  const mockUpsert = vi.fn();
  const mockEnsureCollection = vi.fn();
  const mockDeleteByRepoId = vi.fn();

  let service: EmbeddingService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new EmbeddingService(
      { embed: mockEmbed },
      {
        ensureCollection: mockEnsureCollection,
        upsert: mockUpsert,
        deleteByRepositoryId: mockDeleteByRepoId,
        search: vi.fn(),
      } as any,
    );
  });

  it('should embed a single entity', async () => {
    mockEmbed.mockResolvedValue([0.1, 0.2, 0.3]);

    const payload: EmbeddingPayload = {
      entityId: 'fn_1',
      entityType: 'FUNCTION',
      entityName: 'login',
      filePath: 'src/auth.ts',
      repositoryId: 'repo_1',
      content: 'login function',
    };

    await service.embedEntity(payload);

    expect(mockEmbed).toHaveBeenCalledWith('login function');
    expect(mockUpsert).toHaveBeenCalledWith([
      {
        id: 'fn_1',
        vector: [0.1, 0.2, 0.3],
        payload: {
          entityId: 'fn_1',
          entityType: 'FUNCTION',
          entityName: 'login',
          filePath: 'src/auth.ts',
          repositoryId: 'repo_1',
        },
      },
    ]);
  });

  it('should embed multiple entities in batches', async () => {
    mockEmbed.mockResolvedValue([0.1, 0.2, 0.3]);

    const payloads: EmbeddingPayload[] = Array.from({ length: 3 }, (_, i) => ({
      entityId: `fn_${i}`,
      entityType: 'FUNCTION',
      entityName: `func_${i}`,
      filePath: `src/file_${i}.ts`,
      repositoryId: 'repo_1',
      content: `content_${i}`,
    }));

    await service.embedEntities(payloads);

    expect(mockEmbed).toHaveBeenCalledTimes(3);
    expect(mockUpsert).toHaveBeenCalledTimes(1);
    expect(mockUpsert).toHaveBeenCalledWith([
      expect.objectContaining({ id: 'fn_0' }),
      expect.objectContaining({ id: 'fn_1' }),
      expect.objectContaining({ id: 'fn_2' }),
    ]);
  });

  it('should handle empty payloads', async () => {
    await service.embedEntities([]);
    expect(mockEmbed).not.toHaveBeenCalled();
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it('should delete embeddings by repository', async () => {
    mockDeleteByRepoId.mockResolvedValue(undefined);

    await service.deleteEntityEmbeddings('repo_1');
    expect(mockDeleteByRepoId).toHaveBeenCalledWith('repo_1');
  });

  it('should ensure collection exists', async () => {
    mockEnsureCollection.mockResolvedValue(undefined);

    await service.ensureCollection();
    expect(mockEnsureCollection).toHaveBeenCalledTimes(1);
  });
});
