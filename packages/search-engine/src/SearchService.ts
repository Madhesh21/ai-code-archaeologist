import { QdrantVectorClient } from './QdrantVectorClient.js';
import type { SearchResult, HybridSearchResult } from './types.js';

interface EmbeddingProvider {
  embed(text: string): Promise<number[]>;
}

export class SearchService {
  constructor(
    private readonly embeddingProvider: EmbeddingProvider,
    private readonly vectorClient: QdrantVectorClient,
  ) {}

  async semanticSearch(
    repositoryId: string,
    query: string,
    limit: number = 10,
  ): Promise<SearchResult[]> {
    const vector = await this.embeddingProvider.embed(query);

    const results = await this.vectorClient.search(
      vector,
      {
        must: [{ key: 'repositoryId', match: { value: repositoryId } }],
      },
      limit,
    );

    return results.map((r) => ({
      score: r.score,
      entityId: (r.payload.entityId as string) ?? '',
      entityType: (r.payload.entityType as string) ?? '',
      entityName: (r.payload.entityName as string) ?? '',
      filePath: (r.payload.filePath as string) ?? '',
      repositoryId: (r.payload.repositoryId as string) ?? '',
    }));
  }

  async hybridSearch(
    repositoryId: string,
    query: string,
    graphResults: SearchResult[],
    limit: number = 10,
  ): Promise<HybridSearchResult> {
    const semanticResults = await this.semanticSearch(repositoryId, query, limit);

    const fused = this.fuseResults(graphResults, semanticResults, limit);

    return {
      graphResults,
      semanticResults,
      fused,
    };
  }

  private fuseResults(
    graphResults: SearchResult[],
    semanticResults: SearchResult[],
    limit: number,
  ): SearchResult[] {
    const seen = new Set<string>();
    const fused: SearchResult[] = [];

    const graphWeight = 0.6;
    const semanticWeight = 0.4;

    const maxGraphScore = graphResults.length > 0 ? graphResults[0].score : 1;
    const maxSemanticScore = semanticResults.length > 0 ? semanticResults[0].score : 1;

    for (const result of graphResults) {
      if (seen.has(result.entityId)) continue;
      seen.add(result.entityId);
      fused.push({
        ...result,
        score: (result.score / maxGraphScore) * graphWeight,
      });
    }

    for (const result of semanticResults) {
      if (seen.has(result.entityId)) continue;
      seen.add(result.entityId);
      fused.push({
        ...result,
        score: (result.score / maxSemanticScore) * semanticWeight,
      });
    }

    return fused.sort((a, b) => b.score - a.score).slice(0, limit);
  }
}
