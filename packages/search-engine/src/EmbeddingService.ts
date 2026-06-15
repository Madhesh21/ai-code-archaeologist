import { QdrantVectorClient } from './QdrantVectorClient.js';
import type { EmbeddingPayload, EmbeddingRecord } from './types.js';

interface EmbeddingProvider {
  embed(text: string): Promise<number[]>;
}

export class EmbeddingService {
  constructor(
    private readonly embeddingProvider: EmbeddingProvider,
    private readonly vectorClient: QdrantVectorClient,
  ) {}

  async embedEntity(payload: EmbeddingPayload): Promise<void> {
    const vector = await this.embeddingProvider.embed(payload.content);
    const record: EmbeddingRecord = {
      id: payload.entityId,
      vector,
      payload: {
        entityId: payload.entityId,
        entityType: payload.entityType,
        entityName: payload.entityName,
        filePath: payload.filePath,
        repositoryId: payload.repositoryId,
      },
    };

    await this.vectorClient.upsert([record]);
  }

  async embedEntities(payloads: EmbeddingPayload[]): Promise<void> {
    const batchSize = 50;

    for (let i = 0; i < payloads.length; i += batchSize) {
      const batch = payloads.slice(i, i + batchSize);
      const records: EmbeddingRecord[] = [];

      for (const payload of batch) {
        const vector = await this.embeddingProvider.embed(payload.content);
        records.push({
          id: payload.entityId,
          vector,
          payload: {
            entityId: payload.entityId,
            entityType: payload.entityType,
            entityName: payload.entityName,
            filePath: payload.filePath,
            repositoryId: payload.repositoryId,
          },
        });
      }

      await this.vectorClient.upsert(records);
    }
  }

  async deleteEntityEmbeddings(repositoryId: string): Promise<void> {
    await this.vectorClient.deleteByRepositoryId(repositoryId);
  }

  async ensureCollection(): Promise<void> {
    await this.vectorClient.ensureCollection();
  }
}
