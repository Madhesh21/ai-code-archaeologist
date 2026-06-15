import type { EmbeddingRecord } from './types.js';

interface QdrantPoint {
  id: string;
  vector: number[];
  payload: Record<string, unknown>;
}

interface QdrantSearchResult {
  id: string;
  score: number;
  payload: Record<string, unknown>;
}

export class QdrantVectorClient {
  private baseUrl: string;
  private defaultCollection: string;

  constructor(baseUrl: string = 'http://localhost:6333', collection: string = 'repository_entities') {
    this.baseUrl = baseUrl;
    this.defaultCollection = collection;
  }

  async ensureCollection(): Promise<void> {
    const exists = await this.collectionExists();
    if (!exists) {
      const response = await fetch(`${this.baseUrl}/collections/${this.defaultCollection}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vectors: {
            size: 768,
            distance: 'Cosine',
          },
        }),
      });

      if (!response.ok && response.status !== 409) {
        const body = await response.text();
        throw new Error(`Failed to create Qdrant collection: ${body}`);
      }
    }
  }

  async collectionExists(): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/collections/${this.defaultCollection}`, {
      method: 'GET',
    });
    return response.ok;
  }

  async upsert(records: EmbeddingRecord[]): Promise<void> {
    const points: QdrantPoint[] = records.map((r) => ({
      id: r.id,
      vector: r.vector,
      payload: r.payload,
    }));

    const response = await fetch(
      `${this.baseUrl}/collections/${this.defaultCollection}/points`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points }),
      },
    );

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Qdrant upsert failed: ${body}`);
    }
  }

  async search(
    vector: number[],
    filter?: Record<string, unknown>,
    limit: number = 10,
  ): Promise<QdrantSearchResult[]> {
    const response = await fetch(
      `${this.baseUrl}/collections/${this.defaultCollection}/points/search`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vector,
          limit,
          filter: filter ?? {},
          with_payload: true,
        }),
      },
    );

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Qdrant search failed: ${body}`);
    }

    const data = (await response.json()) as { result: QdrantSearchResult[] };
    return data.result ?? [];
  }

  async deleteByRepositoryId(repositoryId: string): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/collections/${this.defaultCollection}/points/delete`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filter: {
            must: [{ key: 'repositoryId', match: { value: repositoryId } }],
          },
        }),
      },
    );

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Qdrant delete failed: ${body}`);
    }
  }

  async deleteCollection(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/collections/${this.defaultCollection}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Qdrant delete collection failed: ${body}`);
    }
  }
}
