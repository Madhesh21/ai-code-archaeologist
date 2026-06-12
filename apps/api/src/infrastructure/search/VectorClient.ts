export abstract class VectorClient {
  abstract search(
    collection: string,
    vector: number[],
    limit?: number,
  ): Promise<unknown[]>;
  abstract upsert(
    collection: string,
    id: string,
    vector: number[],
    payload?: Record<string, unknown>,
  ): Promise<void>;
  abstract deleteCollection(collection: string): Promise<void>;
}
