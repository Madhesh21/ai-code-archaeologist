export interface ExtractedRelationship {
  id: string;
  repositoryId: string;
  sourceEntityId: string;
  targetEntityId: string;
  sourceEntityName: string;
  targetEntityName: string;
  type: RelationshipType;
  filePath: string;
  startLine: number;
  endLine: number;
  metadata: Record<string, unknown>;
}

export type RelationshipType =
  | 'IMPORTS'
  | 'EXPORTS'
  | 'CALLS'
  | 'USES'
  | 'READS'
  | 'WRITES'
  | 'DEPENDS_ON'
  | 'IMPLEMENTS'
  | 'EXTENDS'
  | 'CONTAINS'
  | 'EXPOSES'
  | 'RETURNS';

export interface RelationshipExtractor {
  readonly type: RelationshipType;
  extract(options: ExtractorOptions): ExtractedRelationship[];
}

export interface ExtractorOptions {
  repositoryId: string;
  filePath: string;
  content: string;
  ast: import('../ast-parser/types.js').AstNode;
  entities: import('../entity-extractor/types.js').ExtractedEntity[];
  imports: import('../entity-extractor/ImportExportCollector.js').ImportInfo[];
  exports: import('../entity-extractor/ImportExportCollector.js').ExportInfo[];
}
