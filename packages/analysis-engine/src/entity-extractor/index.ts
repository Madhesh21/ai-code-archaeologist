export { EntityExtractorService } from './EntityExtractorService.js';
export type { FileExtractionInput, ExtractedFileData } from './EntityExtractorService.js';

export { FunctionExtractor } from './FunctionExtractor.js';
export { ClassExtractor } from './ClassExtractor.js';
export { InterfaceExtractor } from './InterfaceExtractor.js';
export { RouteExtractor } from './RouteExtractor.js';
export { MiddlewareExtractor } from './MiddlewareExtractor.js';
export { ModelExtractor } from './ModelExtractor.js';
export { ServiceExtractor } from './ServiceExtractor.js';
export { ComponentExtractor } from './ComponentExtractor.js';
export { HookExtractor } from './HookExtractor.js';

export { collectImports, collectExports } from './ImportExportCollector.js';
export type { ImportInfo, ExportInfo } from './ImportExportCollector.js';

export { generateEntityId, generateRelationshipId } from './utils.js';

export type {
  ExtractedEntity,
  EntityType,
  ExtractorOptions,
  EntityExtractor,
  EntityExtractionResult,
  ExtractionError,
  RouteMetadata,
  ModelMetadata,
  ServiceMetadata,
  ComponentMetadata,
  MiddlewareMetadata,
} from './types.js';
