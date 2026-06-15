export interface GraphBuildInput {
  repositoryId: string;
  entities: EntityDefinitionData[];
  relationships: RelationshipData[];
}

export interface EntityDefinitionData {
  id: string;
  name: string;
  type: string;
  fileId: string;
  filePath: string;
  startLine: number;
  endLine: number;
  metadata: Record<string, unknown>;
  imports?: { source: string; specifiers: string[] }[];
  exports?: { name: string; isDefault: boolean }[];
}

export interface RelationshipData {
  id: string;
  sourceEntityId: string;
  sourceEntityName: string;
  targetEntityId: string;
  targetEntityName: string;
  type: string;
  filePath: string;
  startLine: number;
}

export interface GraphBuildResult {
  success: boolean;
  repositoryId: string;
  nodeCount: number;
  edgeCount: number;
  errors: string[];
}

export interface GraphNode {
  id: string;
  labels: string[];
  properties: Record<string, unknown>;
}

export interface GraphRelationship {
  id: string;
  type: string;
  sourceNodeId: string;
  targetNodeId: string;
  properties: Record<string, unknown>;
}

export interface INodeService {
  createNode(label: string, properties: Record<string, unknown>): Promise<GraphNode>;
  getNode(id: string): Promise<GraphNode | null>;
  createConstraint(label: string, field: string): Promise<void>;
  createIndex(label: string, field: string): Promise<void>;
}

export interface IRelationshipService {
  createRelationship(
    sourceId: string,
    type: string,
    targetId: string,
    properties?: Record<string, unknown>,
  ): Promise<GraphRelationship>;
}

export interface IGraphClient {
  execute(cypher: string, params?: Record<string, unknown>): Promise<void>;
  query(cypher: string, params?: Record<string, unknown>): Promise<unknown[]>;
}
