export interface IRepository {
  name: string;
  status: 'pending' | 'analyzing' | 'completed' | 'failed';
  source: 'upload' | 'github';
  createdAt: Date;
  updatedAt: Date;
}

export interface IMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface IAnalysis {
  repositoryId: string;
  status: 'queued' | 'scanning' | 'parsing' | 'extracting' | 'building' | 'completed' | 'failed';
  report?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IConversation {
  repositoryId: string;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}
