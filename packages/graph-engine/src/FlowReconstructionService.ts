import type { IGraphClient } from './types.js';

export interface FlowStep {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  filePath?: string;
  details?: Record<string, unknown>;
}

export interface FlowDefinition {
  id: string;
  repositoryId: string;
  name: string;
  startNode: string;
  steps: FlowStep[];
  generatedAt: string;
}

interface GraphRecord {
  n: Record<string, unknown>;
  labels: string[];
}

interface RelRecord {
  r: Record<string, unknown>;
  relType: string;
  startName: string;
  endName: string;
}

export class FlowReconstructionService {
  constructor(private readonly client: IGraphClient) {}

  async generateFlow(
    repositoryId: string,
    entityName: string,
  ): Promise<FlowDefinition> {
    const startNode = await this.findStartNode(repositoryId, entityName);
    if (!startNode) {
      throw new Error(`Entity "${entityName}" not found in repository ${repositoryId}`);
    }

    const steps = await this.traceExecutionPath(startNode.id, repositoryId);

    return {
      id: `flow_${repositoryId}_${entityName}_${Date.now()}`,
      repositoryId,
      name: `${entityName} Flow`,
      startNode: startNode.id,
      steps,
      generatedAt: new Date().toISOString(),
    };
  }

  async listFlows(repositoryId: string): Promise<FlowDefinition[]> {
    const cypher = `
      MATCH (repo:Repository {id: $repositoryId})-[:CONTAINS*]->(n)
      WHERE n:Route OR n:Function OR n:Service
      RETURN n.name as name, labels(n) as labels
      LIMIT 50
    `;

    const result = await this.client.query(cypher, { repositoryId });
    const flows: FlowDefinition[] = [];

    for (const record of result) {
      const r = record as Record<string, unknown>;
      const name = r.name as string;
      if (!name) continue;

      try {
        const flow = await this.generateFlow(repositoryId, name);
        flows.push(flow);
      } catch {
        continue;
      }
    }

    return flows;
  }

  private async findStartNode(
    repositoryId: string,
    entityName: string,
  ): Promise<{ id: string; name: string; type: string } | null> {
    const cypher = `
      MATCH (n {repositoryId: $repositoryId, name: $entityName})
      WHERE n:Route OR n:Function OR n:Service OR n:Component
      RETURN n, labels(n) as labels
      LIMIT 1
    `;

    const result = await this.client.query(cypher, { repositoryId, entityName });

    if (result.length === 0) return null;

    const record = result[0] as GraphRecord;
    const props = record.n;
    const labels = record.labels;

    return {
      id: (props.id as string) ?? '',
      name: (props.name as string) ?? entityName,
      type: labels[0] ?? 'Function',
    };
  }

  private async traceExecutionPath(
    startNodeId: string,
    repositoryId: string,
    maxDepth: number = 15,
  ): Promise<FlowStep[]> {
    const visited = new Set<string>();
    const steps: FlowStep[] = [];

    const queue: { nodeId: string; depth: number }[] = [{ nodeId: startNodeId, depth: 0 }];

    while (queue.length > 0) {
      const current = queue.shift()!;

      if (visited.has(current.nodeId)) continue;
      if (current.depth > maxDepth) continue;
      visited.add(current.nodeId);

      const nodeInfo = await this.getNodeInfo(current.nodeId);
      if (nodeInfo) {
        steps.push(nodeInfo);
      }

      const neighbors = await this.getForwardNeighbors(current.nodeId);

      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          queue.push({ nodeId: neighbor, depth: current.depth + 1 });
        }
      }
    }

    return steps;
  }

  private async getNodeInfo(nodeId: string): Promise<FlowStep | null> {
    const cypher = `
      MATCH (n {id: $nodeId})
      RETURN n, labels(n) as labels
    `;

    const result = await this.client.query(cypher, { nodeId });
    if (result.length === 0) return null;

    const record = result[0] as GraphRecord;
    const props = record.n;
    const labels = record.labels;

    return {
      nodeId,
      nodeName: (props.name as string) ?? nodeId,
      nodeType: labels[0] ?? 'Unknown',
      filePath: (props.path as string) ?? (props.filePath as string) ?? undefined,
      details: this.extractDetails(props, labels[0]),
    };
  }

  private async getForwardNeighbors(nodeId: string): Promise<string[]> {
    const cypher = `
      MATCH (n {id: $nodeId})-[r:CALLS|USES|IMPORTS|EXPOSES|CONTAINS]->(neighbor)
      WHERE NOT neighbor:File AND NOT neighbor:Folder AND NOT neighbor:Repository
      RETURN neighbor.id as targetId
    `;

    const result = await this.client.query(cypher, { nodeId });
    return result.map((r) => {
      const record = r as Record<string, unknown>;
      return record.targetId as string;
    });
  }

  private extractDetails(
    props: Record<string, unknown>,
    label: string,
  ): Record<string, unknown> {
    switch (label) {
      case 'Route':
        return {
          method: props.method ?? 'GET',
          path: props.path ?? '/',
        };
      case 'Function':
        return {
          startLine: props.startLine,
          endLine: props.endLine,
          isExported: props.isExported,
          isAsync: props.isAsync,
        };
      case 'Model':
        return {
          database: props.database ?? 'unknown',
        };
      default:
        return {};
    }
  }
}
