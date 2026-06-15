export interface ExtractedEntity {
  id: string;
  repositoryId: string;
  fileId: string;
  filePath: string;
  name: string;
  type: EntityType;
  startLine: number;
  endLine: number;
  metadata: Record<string, unknown>;
}

export type EntityType =
  | 'FUNCTION'
  | 'CLASS'
  | 'INTERFACE'
  | 'TYPE'
  | 'ENUM'
  | 'API_ROUTE'
  | 'MODEL'
  | 'SERVICE'
  | 'MIDDLEWARE'
  | 'HOOK'
  | 'COMPONENT';

export interface ExtractorOptions {
  repositoryId: string;
  fileId: string;
  filePath: string;
  content: string;
  ast: import('../ast-parser/types.js').AstNode;
  language: import('../ast-parser/types.js').SourceLanguage;
}

export interface EntityExtractor {
  readonly type: EntityType;
  extract(options: ExtractorOptions): ExtractedEntity[];
}

export interface EntityExtractionResult {
  entities: ExtractedEntity[];
  errors: ExtractionError[];
}

export interface ExtractionError {
  filePath: string;
  message: string;
}

export interface RouteMetadata {
  method: string;
  path: string;
  handler?: string;
  middleware?: string[];
}

export interface ModelMetadata {
  database: string;
  collection?: string;
  fields?: { name: string; type: string }[];
}

export interface ServiceMetadata {
  methods: string[];
  dependencies: string[];
}

export interface ComponentMetadata {
  componentType: string;
  props?: string[];
}

export interface MiddlewareMetadata {
  isGlobal: boolean;
  routes?: string[];
}
