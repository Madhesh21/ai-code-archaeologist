import type { ParseResult } from '../ast-parser/types.js';
import type {
  ExtractedEntity,
  EntityExtractor,
  ExtractorOptions,
  EntityExtractionResult,
} from './types.js';
import { FunctionExtractor } from './FunctionExtractor.js';
import { ClassExtractor } from './ClassExtractor.js';
import { InterfaceExtractor } from './InterfaceExtractor.js';
import { RouteExtractor } from './RouteExtractor.js';
import { MiddlewareExtractor } from './MiddlewareExtractor.js';
import { ModelExtractor } from './ModelExtractor.js';
import { ServiceExtractor } from './ServiceExtractor.js';
import { ComponentExtractor } from './ComponentExtractor.js';
import { HookExtractor } from './HookExtractor.js';
import { collectImports, collectExports } from './ImportExportCollector.js';

export interface FileExtractionInput {
  fileId: string;
  filePath: string;
  content: string;
  parseResult: ParseResult;
  language: 'javascript' | 'typescript';
}

export interface ExtractedFileData {
  fileId: string;
  filePath: string;
  entities: ExtractedEntity[];
  imports: import('./ImportExportCollector.js').ImportInfo[];
  exports: import('./ImportExportCollector.js').ExportInfo[];
}

export class EntityExtractorService {
  private extractors: EntityExtractor[];

  constructor() {
    this.extractors = [
      new FunctionExtractor(),
      new ClassExtractor(),
      new InterfaceExtractor(),
      new RouteExtractor(),
      new MiddlewareExtractor(),
      new ModelExtractor(),
      new ServiceExtractor(),
      new ComponentExtractor(),
      new HookExtractor(),
    ];
  }

  extractFromFile(input: FileExtractionInput): ExtractedFileData {
    const entities: ExtractedEntity[] = [];
    const errors: string[] = [];

    if (!input.parseResult.success || !input.parseResult.ast) {
      return {
        fileId: input.fileId,
        filePath: input.filePath,
        entities: [],
        imports: [],
        exports: [],
      };
    }

    const ast = input.parseResult.ast;
    const options: ExtractorOptions = {
      repositoryId: '',
      fileId: input.fileId,
      filePath: input.filePath,
      content: input.content,
      ast,
      language: input.language,
    };

    for (const extractor of this.extractors) {
      try {
        const extracted = extractor.extract(options);
        entities.push(...extracted);
      } catch (err) {
        errors.push(
          `Extractor ${extractor.type} failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    const imports = collectImports(ast, input.content);
    const exports = collectExports(ast, input.content);

    return { fileId: input.fileId, filePath: input.filePath, entities, imports, exports };
  }

  extractFromFiles(
    inputs: FileExtractionInput[],
    repositoryId: string,
  ): EntityExtractionResult {
    const allEntities: ExtractedEntity[] = [];
    const allErrors: { filePath: string; message: string }[] = [];

    for (const input of inputs) {
      try {
        const result = this.extractFromFile(input);
        for (const entity of result.entities) {
          entity.repositoryId = repositoryId;
        }
        allEntities.push(...result.entities);
      } catch (err) {
        allErrors.push({
          filePath: input.filePath,
          message: err instanceof Error ? err.message : String(err),
        });
      }
    }

    return {
      entities: allEntities,
      errors: allErrors,
    };
  }
}
