import type { Neo4jClient } from '../Neo4jClient.js';
import { logger } from '../../../utils/logger.js';

export interface GraphNode {
  id: string;
  labels: string[];
  properties: Record<string, unknown>;
}

export class NodeService {
  constructor(private readonly client: Neo4jClient) {}

  async createNode(label: string, properties: Record<string, unknown>): Promise<GraphNode> {
    const cypher = `
      CREATE (n:\`${label}\`)
      SET n = $properties
      RETURN n, labels(n) as labels
    `;
    const result = await this.client.query(cypher, { properties });

    if (result.length === 0) {
      throw new Error(`Failed to create node with label: ${label}`);
    }

    return this.toGraphNode(result[0] as Record<string, unknown>);
  }

  async getNode(id: string): Promise<GraphNode | null> {
    const cypher = `
      MATCH (n {id: $id})
      RETURN n, labels(n) as labels
    `;
    const result = await this.client.query(cypher, { id });

    if (result.length === 0) return null;
    return this.toGraphNode(result[0] as Record<string, unknown>);
  }

  async updateNode(
    id: string,
    properties: Partial<Record<string, unknown>>,
  ): Promise<GraphNode | null> {
    const cypher = `
      MATCH (n {id: $id})
      SET n += $properties
      RETURN n, labels(n) as labels
    `;
    const result = await this.client.query(cypher, { id, properties });

    if (result.length === 0) return null;
    return this.toGraphNode(result[0] as Record<string, unknown>);
  }

  async deleteNode(id: string): Promise<boolean> {
    const cypher = `
      MATCH (n {id: $id})
      DETACH DELETE n
      RETURN count(n) as deleted
    `;
    const result = await this.client.query(cypher, { id });

    const deleted = (result[0] as Record<string, unknown>)?.deleted as number;
    return deleted > 0;
  }

  async findNodesByLabel(label: string, repositoryId?: string): Promise<GraphNode[]> {
    const whereClause = repositoryId ? 'WHERE n.repositoryId = $repositoryId' : '';
    const cypher = `
      MATCH (n:\`${label}\`)
      ${whereClause}
      RETURN n, labels(n) as labels
    `;
    const result = await this.client.query(cypher, { repositoryId });

    return result.map((record) => this.toGraphNode(record as Record<string, unknown>));
  }

  async createConstraint(label: string, field: string): Promise<void> {
    const constraintName = `${label.toLowerCase()}_${field}_unique`;
    const cypher = `
      CREATE CONSTRAINT ${constraintName} IF NOT EXISTS
      FOR (n:\`${label}\`)
      REQUIRE n.${field} IS UNIQUE
    `;
    await this.client.execute(cypher);
    logger.info({ constraint: constraintName }, 'Neo4j constraint created');
  }

  async createIndex(label: string, field: string): Promise<void> {
    const indexName = `${label.toLowerCase()}_${field}_idx`;
    const cypher = `
      CREATE INDEX ${indexName} IF NOT EXISTS
      FOR (n:\`${label}\`)
      ON (n.${field})
    `;
    await this.client.execute(cypher);
    logger.info({ index: indexName }, 'Neo4j index created');
  }

  private toGraphNode(record: Record<string, unknown>): GraphNode {
    const n = record.n as Record<string, unknown> | undefined;
    const labels = record.labels as string[];

    return {
      id: (n?.id as string) ?? '',
      labels,
      properties: n ?? {},
    };
  }
}
