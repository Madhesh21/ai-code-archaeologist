export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: { code: string; message: string };
}

export type GraphNodeType =
  | 'Function' | 'Class' | 'Interface' | 'Type' | 'Enum'
  | 'Service' | 'Middleware' | 'Component' | 'Hook' | 'Route'
  | 'Model' | 'File' | 'Folder' | 'Repository';

export interface GraphNode {
  id: string;
  type: GraphNodeType;
  name: string;
  filePath?: string;
}

export interface GraphRelationship {
  type: string;
  sourceId: string;
  targetId: string;
  targetName?: string;
  targetType?: string;
  properties?: Record<string, unknown>;
}

export interface GraphSummary {
  nodes: number;
  relationships: number;
}

export interface FlowItem {
  id: string;
  name: string;
  stepCount: number;
}

export interface FlowDetail {
  id: string;
  name: string;
  steps: Array<{ name: string; type: string }>;
  source: string;
}

export interface TechnologySummary {
  frontend: string[];
  backend: string[];
  database: string[];
  infrastructure: string[];
}

export interface ReportData {
  executiveSummary: string;
  technologySummary: TechnologySummary;
  apiInventory: Array<{ method: string; path: string; controller: string }>;
  modelInventory: Array<{ name: string; fields: number; collection: string }>;
  dependencyOverview: Array<{ source: string; targets: string[] }>;
}
