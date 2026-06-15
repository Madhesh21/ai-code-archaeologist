export interface IRepository {
  id: string;
  name: string;
  description?: string;
  sourceType: 'upload' | 'github';
  sourceUrl?: string;
  localPath?: string;
  status:
    | 'pending'
    | 'uploaded'
    | 'scanning'
    | 'analyzing'
    | 'graph_building'
    | 'embedding'
    | 'report_generating'
    | 'ready'
    | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

export interface IMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface IAnalysis {
  id: string;
  repositoryId: string;
  status: 'queued' | 'scanning' | 'parsing' | 'extracting' | 'building' | 'completed' | 'failed';
  report?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IConversation {
  id: string;
  repositoryId: string;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IFlowStep {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  filePath?: string;
  details?: Record<string, unknown>;
}

export interface IFlow {
  id: string;
  repositoryId: string;
  name: string;
  startNode: string;
  steps: IFlowStep[];
  generatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
