import type { SemanticContext, SemanticMatch } from './types.js';

interface SearchService {
  semanticSearch(
    repositoryId: string,
    query: string,
    limit?: number,
  ): Promise<{ score: number; entityId: string; entityType: string; entityName: string; filePath: string }[]>;
}

export class SemanticRetriever {
  constructor(private readonly searchService: SearchService) {}

  async retrieve(
    repositoryId: string,
    query: string,
    limit: number = 10,
  ): Promise<SemanticContext> {
    const results = await this.searchService.semanticSearch(repositoryId, query, limit);

    return {
      results: results.map((r) => ({
        entityId: r.entityId,
        entityName: r.entityName,
        entityType: r.entityType,
        score: r.score,
        filePath: r.filePath,
      })),
    };
  }
}
