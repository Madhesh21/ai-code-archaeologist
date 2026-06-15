import type { GraphContext, GraphContextNode, GraphContextRelationship, QuestionIntent } from './types.js';

interface Neo4jQueryFn {
  query(cypher: string, params?: Record<string, unknown>): Promise<unknown[]>;
}

export class GraphRetriever {
  constructor(private readonly queryService: Neo4jQueryFn) {}

  async retrieve(
    repositoryId: string,
    intent: QuestionIntent,
    entities: string[],
  ): Promise<GraphContext> {
    switch (intent) {
      case 'FLOW_EXPLANATION':
        return this.retrieveFlowContext(repositoryId, entities);
      case 'DEPENDENCY':
        return this.retrieveDependencyContext(repositoryId, entities);
      case 'ARCHITECTURE':
        return this.retrieveArchitectureContext(repositoryId);
      case 'LOCATION':
        return this.retrieveLocationContext(repositoryId, entities);
      case 'TECHNOLOGY':
        return this.retrieveTechnologyContext(repositoryId);
      default:
        return this.retrieveGeneralContext(repositoryId, entities);
    }
  }

  private async retrieveFlowContext(
    repositoryId: string,
    entities: string[],
  ): Promise<GraphContext> {
    const entityName = entities[0] ?? '';
    if (!entityName) {
      return this.retrieveGeneralContext(repositoryId, entities);
    }

    const cypher = `
      MATCH (start {repositoryId: $repositoryId, name: $entityName})
      OPTIONAL MATCH path = (start)-[:CALLS|USES|IMPORTS|EXPOSES*1..5]->(connected)
      WHERE NOT connected:File AND NOT connected:Folder AND NOT connected:Repository
      UNWIND nodes(path) as node
      WITH DISTINCT node
      RETURN node, labels(node) as labels
      LIMIT 30
    `;

    const result = await this.queryService.query(cypher, { repositoryId, entityName });
    return this.buildGraphContext(result);
  }

  private async retrieveDependencyContext(
    repositoryId: string,
    entities: string[],
  ): Promise<GraphContext> {
    const entityName = entities[0] ?? '';

    const cypher = `
      MATCH (n {repositoryId: $repositoryId})
      WHERE n.name CONTAINS $entityName
      OPTIONAL MATCH (n)-[r]-(connected)
      WHERE connected:Function OR connected:Service OR connected:Model OR connected:Route
      RETURN n, labels(n) as n_labels,
             connected, labels(connected) as c_labels,
             type(r) as relType
      LIMIT 50
    `;

    const result = await this.queryService.query(cypher, { repositoryId, entityName });
    return this.buildRelationshipContext(result);
  }

  private async retrieveArchitectureContext(repositoryId: string): Promise<GraphContext> {
    const cypher = `
      MATCH (repo:Repository {id: $repositoryId})
      OPTIONAL MATCH (repo)-[:CONTAINS*]->(n)
      WHERE n:Folder OR n:File OR n:Service OR n:Model OR n:Route
      RETURN n, labels(n) as labels
      LIMIT 100
    `;

    const result = await this.queryService.query(cypher, { repositoryId });
    return this.buildGraphContext(result);
  }

  private async retrieveLocationContext(
    repositoryId: string,
    entities: string[],
  ): Promise<GraphContext> {
    const entityName = entities[0] ?? '';

    const cypher = `
      MATCH (n {repositoryId: $repositoryId})
      WHERE toLower(n.name) CONTAINS toLower($entityName)
      RETURN n, labels(n) as labels
      LIMIT 20
    `;

    const result = await this.queryService.query(cypher, { repositoryId, entityName });
    return this.buildGraphContext(result);
  }

  private async retrieveTechnologyContext(repositoryId: string): Promise<GraphContext> {
    const cypher = `
      MATCH (repo:Repository {id: $repositoryId})
      OPTIONAL MATCH (repo)-[:CONTAINS*]->(n)
      WHERE n:File
      RETURN n, labels(n) as labels
      LIMIT 50
    `;

    const result = await this.queryService.query(cypher, { repositoryId });
    return this.buildGraphContext(result);
  }

  private async retrieveGeneralContext(
    repositoryId: string,
    entities: string[],
  ): Promise<GraphContext> {
    const entityName = entities[0] ?? '';

    const cypher = `
      MATCH (n {repositoryId: $repositoryId})
      WHERE n.name CONTAINS $entityName OR $entityName = ''
      RETURN n, labels(n) as labels
      LIMIT 20
    `;

    const result = await this.queryService.query(cypher, { repositoryId, entityName });
    return this.buildGraphContext(result);
  }

  private buildGraphContext(result: unknown[]): GraphContext {
    const nodes: GraphContextNode[] = [];
    const relationships: GraphContextRelationship[] = [];

    const seenIds = new Set<string>();

    for (const record of result) {
      const r = record as Record<string, unknown>;
      const nodeData = r.node as Record<string, unknown> | undefined;
      const labels = r.labels as string[] | undefined;

      if (!nodeData || !labels) continue;

      const id = (nodeData.id as string) ?? '';
      if (!id || seenIds.has(id)) continue;
      seenIds.add(id);

      nodes.push({
        id,
        name: (nodeData.name as string) ?? id,
        type: labels[0] ?? 'Unknown',
        filePath: (nodeData.path as string) ?? undefined,
        properties: { ...nodeData },
      });
    }

    return { nodes, relationships };
  }

  private buildRelationshipContext(result: unknown[]): GraphContext {
    const nodes: GraphContextNode[] = [];
    const relationships: GraphContextRelationship[] = [];

    const seenNodeIds = new Set<string>();

    for (const record of result) {
      const r = record as Record<string, unknown>;
      const nodeData = r.n as Record<string, unknown> | undefined;
      const labels = r.n_labels as string[] | undefined;
      const connectedData = r.connected as Record<string, unknown> | undefined;
      const connectedLabels = r.c_labels as string[] | undefined;
      const relType = r.relType as string | undefined;

      if (nodeData && labels) {
        const id = (nodeData.id as string) ?? '';
        if (!seenNodeIds.has(id)) {
          seenNodeIds.add(id);
          nodes.push({
            id,
            name: (nodeData.name as string) ?? id,
            type: labels[0] ?? 'Unknown',
            properties: { ...nodeData },
          });
        }
      }

      if (connectedData && connectedLabels) {
        const id = (connectedData.id as string) ?? '';
        if (!seenNodeIds.has(id)) {
          seenNodeIds.add(id);
          nodes.push({
            id,
            name: (connectedData.name as string) ?? id,
            type: connectedLabels[0] ?? 'Unknown',
            properties: { ...connectedData },
          });
        }
      }

      if (relType && nodeData && connectedData) {
        relationships.push({
          type: relType,
          sourceName: (nodeData.name as string) ?? '',
          targetName: (connectedData.name as string) ?? '',
        });
      }
    }

    return { nodes, relationships };
  }
}
