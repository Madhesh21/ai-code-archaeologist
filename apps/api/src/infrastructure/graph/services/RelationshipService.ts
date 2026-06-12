import type { Neo4jClient } from '../Neo4jClient.js';

export interface GraphRelationship {
  id: string;
  type: string;
  sourceNodeId: string;
  targetNodeId: string;
  properties: Record<string, unknown>;
}

export class RelationshipService {
  constructor(private readonly client: Neo4jClient) {}

  async createRelationship(
    sourceId: string,
    type: string,
    targetId: string,
    properties?: Record<string, unknown>,
  ): Promise<GraphRelationship> {
    const setProps = properties ? `SET r += $properties` : '';
    const cypher = `
      MATCH (a {id: $sourceId})
      MATCH (b {id: $targetId})
      CREATE (a)-[r:\`${type}\`]->(b)
      ${setProps}
      RETURN r, id(r) as relId, $sourceId as sourceNodeId, $targetId as targetNodeId
    `;
    const result = await this.client.query(cypher, {
      sourceId,
      targetId,
      properties: properties ?? {},
    });

    if (result.length === 0) {
      throw new Error(`Failed to create relationship: ${sourceId} -[${type}]-> ${targetId}`);
    }

    return this.toGraphRelationship(result[0] as Record<string, unknown>, type);
  }

  async getNodeRelationships(
    nodeId: string,
    direction?: 'incoming' | 'outgoing',
  ): Promise<GraphRelationship[]> {
    const dirPattern =
      direction === 'incoming'
        ? '()-[r]->(n {id: $nodeId})'
        : direction === 'outgoing'
          ? '(n {id: $nodeId})-[r]->()'
          : '(n {id: $nodeId})-[r]-()';

    const cypher = `
      MATCH ${dirPattern}
      RETURN r, id(r) as relId, type(r) as relType,
             startNode(r).id as sourceNodeId,
             endNode(r).id as targetNodeId
    `;
    const result = await this.client.query(cypher, { nodeId });

    return result.map((record) => this.toGraphRelationship(record as Record<string, unknown>));
  }

  async deleteRelationship(sourceId: string, type: string, targetId: string): Promise<boolean> {
    const cypher = `
      MATCH (a {id: $sourceId})-[r:\`${type}\`]->(b {id: $targetId})
      DELETE r
      RETURN count(r) as deleted
    `;
    const result = await this.client.query(cypher, { sourceId, targetId });

    const deleted = (result[0] as Record<string, unknown>)?.deleted as number;
    return deleted > 0;
  }

  private toGraphRelationship(
    record: Record<string, unknown>,
    overrideType?: string,
  ): GraphRelationship {
    const relId = record.relId as number;
    const relType =
      overrideType ??
      (record.relType as string) ??
      ((record.r as Record<string, unknown>)?.type as string);
    const r = (record.r as Record<string, unknown>) ?? {};

    return {
      id: String(relId),
      type: relType,
      sourceNodeId: record.sourceNodeId as string,
      targetNodeId: record.targetNodeId as string,
      properties: r,
    };
  }
}
