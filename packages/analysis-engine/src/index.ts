export { ScannerService, IgnoreRules } from './scanner/index.js';
export type { FileInfo, FolderInfo, ScanResult, ScannerOptions } from './scanner/types.js';

export { PackageJsonParser, FrontendDetector, BackendDetector, DatabaseDetector, InfrastructureDetector, TechnologyDetectorService } from './technology/index.js';
export type { TechnologyProfile, PackageJson, TsConfigJson, DetectionResult, DetectorOptions, TechnologyDetector } from './technology/index.js';

export { BabelParserService, TypeScriptParserService, AstParserService } from './ast-parser/index.js';
export type { AstNode, SourceLocation, ParseResult, ParseError, AstParser, AstParserOptions, SourceLanguage } from './ast-parser/index.js';

export { EntityExtractorService, FunctionExtractor, ClassExtractor, InterfaceExtractor, RouteExtractor, MiddlewareExtractor, ModelExtractor, ServiceExtractor, ComponentExtractor, HookExtractor, generateEntityId, generateRelationshipId } from './entity-extractor/index.js';
export type { ExtractedEntity, EntityType, ExtractorOptions, EntityExtractor, EntityExtractionResult, ExtractionError, ExtractedFileData, FileExtractionInput } from './entity-extractor/index.js';

export { RelationshipExtractorService, CallRelationshipExtractor, ImportRelationshipExtractor, ExtendsImplRelationshipExtractor, UsesRelationshipExtractor, DependsOnRelationshipExtractor, ReadsWriteRelationshipExtractor } from './relationship-extractor/index.js';
export type { ExtractedRelationship, RelationshipType, RelationshipExtractor, RelationshipExtractionInput, RelationshipExtractionResult, RelationshipError } from './relationship-extractor/index.js';
export { collectImports, collectExports } from './entity-extractor/ImportExportCollector.js';
export type { ImportInfo, ExportInfo } from './entity-extractor/ImportExportCollector.js';
