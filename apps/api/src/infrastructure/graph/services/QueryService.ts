import type { Neo4jClient } from '../Neo4jClient.js';
import type { GraphNode } from './NodeService.js';
import type { GraphRelationship } from './RelationshipService.js';

export interface Subgraph {
  nodes: GraphNode[];
  relationships: GraphRelationship[];
}

export interface GraphPath {
  nodes: GraphNode[];
  relationships: GraphRelationship[];
}

export class QueryService {
  constructor(private readonly client: Neo4jClient) {}

  async findNodeById(id: string): Promise<GraphNode | null> {
    const cypher = `
      MATCH (n {id: $id})
      RETURN n, labels(n) as labels
    `;
    const result = await this.client.query(cypher, { id });

    if (result.length === 0) return null;

    const record = result[0] as Record<string, unknown>;
    const n = (record.n as Record<string, unknown>) ?? {};
    const labels = record.labels as string[];

    return {
      id: (n.id as string) ?? id,
      labels,
      properties: n,
    };
  }

  async findNeighbors(nodeId: string, maxDepth: number = 1): Promise<Subgraph> {
    const cypher = `
      MATCH (n {id: $nodeId})
      OPTIONAL MATCH path = (n)-[*1..${maxDepth}]-(connected)
      UNWIND nodes(path) as node
      WITH DISTINCT node
      RETURN node, labels(node) as labels
    `;
    const nodeResult = await this.client.query(cypher, { nodeId });

    const nodes: GraphNode[] = nodeResult.map((record) => {
      const r = record as Record<string, unknown>;
      const node = (r.node as Record<string, unknown>) ?? {};
      const labels = r.labels as string[];
      return {
        id: (node.id as string) ?? '',
        labels,
        properties: node,
      };
    });

    const relCypher = `
      MATCH (n {id: $nodeId})-[r]-(connected)
      RETURN r, id(r) as relId, type(r) as relType,
             startNode(r).id as sourceNodeId,
             endNode(r).id as targetNodeId
    `;
    const relResult = await this.client.query(relCypher, { nodeId });

    const relationships: GraphRelationship[] = relResult.map((record) => {
      const r = record as Record<string, unknown>;
      return {
        id: String(r.relId as number),
        type: (r.relType as string) ?? '',
        sourceNodeId: r.sourceNodeId as string,
        targetNodeId: r.targetNodeId as string,
        properties: (r.r as Record<string, unknown>) ?? {},
      };
    });

    return { nodes, relationships };
  }

  async searchNodes(query: string, limit: number = 20): Promise<GraphNode[]> {
    const cypher = `
      MATCH (n)
      WHERE toLower(n.name) CONTAINS toLower($query)
      RETURN n, labels(n) as labels
      LIMIT $limit
    `;
    const result = await this.client.query(cypher, { query, limit });

    return result.map((record) => {
      const r = record as Record<string, unknown>;
      const n = (r.n as Record<string, unknown>) ?? {};
      const labels = r.labels as string[];
      return {
        id: (n.id as string) ?? '',
        labels,
        properties: n,
      };
    });
  }

  async findPath(
    sourceId: string,
    targetId: string,
    maxDepth: number = 10,
  ): Promise<GraphPath | null> {
    const cypher = `
      MATCH path = shortestPath(
        (a {id: $sourceId})-[*1..${maxDepth}]-(b {id: $targetId})
      )
      RETURN path
    `;
    const result = await this.client.query(cypher, { sourceId, targetId });

    if (result.length === 0) return null;

    const path = result[0] as Record<string, unknown>;
    const pathData = (path.path as Record<string, unknown>) ?? {};

    const segments = (pathData.segments as Record<string, unknown>[]) ?? [];
    const nodes: GraphNode[] = [];
    const relationships: GraphRelationship[] = [];

    for (const segment of segments) {
      const start = (segment.start as Record<string, unknown>) ?? {};
      const end = (segment.end as Record<string, unknown>) ?? {};
      const rel = (segment.relationship as Record<string, unknown>) ?? {};

      const startNode: GraphNode = {
        id: (start.id as string) ?? '',
        labels: (start.labels as string[]) ?? [],
        properties: { ...start },
      };

      const endNode: GraphNode = {
        id: (end.id as string) ?? '',
        labels: (end.labels as string[]) ?? [],
        properties: { ...end },
      };

      if (!nodes.some((n) => n.id === startNode.id)) {
        nodes.push(startNode);
      }
      if (!nodes.some((n) => n.id === endNode.id)) {
        nodes.push(endNode);
      }

      relationships.push({
        id: String(rel.elementId ?? ''),
        type: (rel.type as string) ?? '',
        sourceNodeId: (start.id as string) ?? '',
        targetNodeId: (end.id as string) ?? '',
        properties: { ...rel },
      });
    }

    return { nodes, relationships };
  }
}
