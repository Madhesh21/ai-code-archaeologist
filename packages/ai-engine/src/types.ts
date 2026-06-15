export interface GraphContext {
  nodes: GraphContextNode[];
  relationships: GraphContextRelationship[];
}

export interface GraphContextNode {
  id: string;
  name: string;
  type: string;
  filePath?: string;
  properties: Record<string, unknown>;
}

export interface GraphContextRelationship {
  type: string;
  sourceName: string;
  targetName: string;
}

export interface SemanticContext {
  results: SemanticMatch[];
}

export interface SemanticMatch {
  entityId: string;
  entityName: string;
  entityType: string;
  score: number;
  filePath: string;
}

export interface MergedContext {
  question: string;
  intent: QuestionIntent;
  graphContext: GraphContext;
  semanticContext: SemanticContext;
  technologyContext?: TechnologyContext;
  flowContext?: FlowContext;
}

export interface TechnologyContext {
  frontend: string[];
  backend: string[];
  database: string[];
  infrastructure: string[];
}

export interface FlowContext {
  name: string;
  steps: { nodeName: string; nodeType: string }[];
}

export type QuestionIntent =
  | 'ARCHITECTURE'
  | 'FLOW_EXPLANATION'
  | 'DEPENDENCY'
  | 'LOCATION'
  | 'TECHNOLOGY'
  | 'GENERAL'
  | 'IMPACT_ANALYSIS';

export interface IntentResult {
  intent: QuestionIntent;
  confidence: number;
  entities: string[];
}

export interface PromptTemplate {
  system: string;
  user: string;
}

export interface AnswerResult {
  answer: string;
  sources: { type: string; name: string }[];
  confidence: number;
}

export interface GraphRetriever {
  retrieve(repositoryId: string, intent: QuestionIntent, entities: string[]): Promise<GraphContext>;
}

export interface SemanticRetriever {
  retrieve(repositoryId: string, query: string, limit?: number): Promise<SemanticContext>;
}

export interface ContextBuilder {
  build(repositoryId: string, question: string, intent: IntentResult): Promise<MergedContext>;
}

export interface AnswerGenerator {
  generate(context: MergedContext): Promise<AnswerResult>;
}
