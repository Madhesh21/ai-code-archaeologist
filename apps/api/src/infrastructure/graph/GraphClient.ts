export abstract class GraphClient {
  abstract query(cypher: string, params?: Record<string, unknown>): Promise<unknown[]>;
  abstract execute(cypher: string, params?: Record<string, unknown>): Promise<void>;
}
