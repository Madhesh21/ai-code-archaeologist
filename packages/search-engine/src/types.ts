export interface SearchResult {
  score: number;
  entityId: string;
  entityType: string;
  entityName: string;
  filePath: string;
  repositoryId: string;
}

export interface HybridSearchResult {
  graphResults: SearchResult[];
  semanticResults: SearchResult[];
  fused: SearchResult[];
}

export interface EmbeddingPayload {
  entityId: string;
  entityType: string;
  entityName: string;
  filePath: string;
  repositoryId: string;
  content: string;
}

export interface EmbeddingRecord {
  id: string;
  vector: number[];
  payload: Record<string, unknown>;
}

export interface IEmbeddingService {
  embedEntity(payload: EmbeddingPayload): Promise<void>;
  embedEntities(payloads: EmbeddingPayload[]): Promise<void>;
  deleteEntityEmbeddings(repositoryId: string): Promise<void>;
}

export interface ISearchService {
  semanticSearch(
    repositoryId: string,
    query: string,
    limit?: number,
  ): Promise<SearchResult[]>;
  hybridSearch(
    repositoryId: string,
    query: string,
    graphResults: SearchResult[],
    limit?: number,
  ): Promise<HybridSearchResult>;
}
