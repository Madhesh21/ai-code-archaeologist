import type { ParseResult } from '../ast-parser/types.js';
import type { ExtractedEntity } from '../entity-extractor/types.js';
import type { ImportInfo, ExportInfo } from '../entity-extractor/ImportExportCollector.js';
import type { ExtractedRelationship, RelationshipExtractor, ExtractorOptions } from './types.js';
import { CallRelationshipExtractor } from './CallRelationshipExtractor.js';
import { ImportRelationshipExtractor } from './ImportRelationshipExtractor.js';
import { ExtendsImplRelationshipExtractor } from './ExtendsImplRelationshipExtractor.js';
import { UsesRelationshipExtractor } from './UsesRelationshipExtractor.js';
import { DependsOnRelationshipExtractor } from './DependsOnRelationshipExtractor.js';
import { ReadsWriteRelationshipExtractor } from './ReadsWriteRelationshipExtractor.js';

export interface RelationshipExtractionInput {
  fileId: string;
  filePath: string;
  content: string;
  parseResult: ParseResult;
  entities: ExtractedEntity[];
  imports: ImportInfo[];
  exports: ExportInfo[];
}

export interface RelationshipExtractionResult {
  relationships: ExtractedRelationship[];
  errors: RelationshipError[];
}

export interface RelationshipError {
  filePath: string;
  message: string;
}

export class RelationshipExtractorService {
  private extractors: RelationshipExtractor[];

  constructor() {
    this.extractors = [
      new CallRelationshipExtractor(),
      new ImportRelationshipExtractor(),
      new ExtendsImplRelationshipExtractor(),
      new UsesRelationshipExtractor(),
      new DependsOnRelationshipExtractor(),
      new ReadsWriteRelationshipExtractor(),
    ];
  }

  extractFromFile(input: RelationshipExtractionInput): ExtractedRelationship[] {
    if (!input.parseResult.success || !input.parseResult.ast) {
      return [];
    }

    const options: ExtractorOptions = {
      repositoryId: '',
      filePath: input.filePath,
      content: input.content,
      ast: input.parseResult.ast,
      entities: input.entities,
      imports: input.imports,
      exports: input.exports,
    };

    const relationships: ExtractedRelationship[] = [];
    for (const extractor of this.extractors) {
      try {
        const extracted = extractor.extract(options);
        relationships.push(...extracted);
      } catch {
        // Individual extractor errors are caught, continue with others
      }
    }

    return relationships;
  }

  extractFromFiles(
    inputs: RelationshipExtractionInput[],
    repositoryId: string,
  ): RelationshipExtractionResult {
    const allRelationships: ExtractedRelationship[] = [];
    const allErrors: RelationshipError[] = [];

    for (const input of inputs) {
      try {
        const result = this.extractFromFile(input);
        for (const rel of result) {
          rel.repositoryId = repositoryId;
        }
        allRelationships.push(...result);
      } catch (err) {
        allErrors.push({
          filePath: input.filePath,
          message: err instanceof Error ? err.message : String(err),
        });
      }
    }

    return {
      relationships: allRelationships,
      errors: allErrors,
    };
  }
}
