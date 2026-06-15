import * as fs from 'fs';
import * as path from 'path';
import { AstParserService, RelationshipExtractorService, EntityExtractorService } from '@archaeologist/analysis-engine';
import type { FileExtractionInput } from '@archaeologist/analysis-engine';
import { collectImports, collectExports, generateRelationshipId } from '@archaeologist/analysis-engine';
import type { RelationshipRepository } from '../../infrastructure/database/repositories/RelationshipRepository.js';
import type { EntityDefinitionRepository } from '../../infrastructure/database/repositories/EntityDefinitionRepository.js';
import type { RepositoryRepository } from '../../infrastructure/database/repositories/RepositoryRepository.js';
import type { RepositoryTreeRepository } from '../../infrastructure/database/repositories/RepositoryTreeRepository.js';
import { logger } from '../../utils/logger.js';
import { NotFoundError, InternalError } from '../../utils/errors.js';

export interface RelationshipSummary {
  repositoryId: string;
  totalRelationships: number;
  totalFiles: number;
  relationshipsByType: Record<string, number>;
  errors: { filePath: string; message: string }[];
}

export class RelationshipExtractionService {
  constructor(
    private readonly astParser: AstParserService,
    private readonly entityExtractor: EntityExtractorService,
    private readonly relationshipExtractor: RelationshipExtractorService,
    private readonly entityRepo: EntityDefinitionRepository,
    private readonly relationshipRepo: RelationshipRepository,
    private readonly repositoryRepo: RepositoryRepository,
    private readonly treeRepo: RepositoryTreeRepository,
  ) {}

  async extract(repositoryId: string): Promise<RelationshipSummary> {
    const repository = await this.repositoryRepo.findById(repositoryId);
    if (!repository) {
      throw new NotFoundError('Repository not found');
    }

    const localPath = repository.localPath;
    if (!localPath) {
      throw new InternalError('Repository has no local path');
    }

    const tree = await this.treeRepo.findByRepositoryId(repositoryId);
    if (!tree) {
      throw new NotFoundError('Repository tree not found. Run scan first.');
    }

    const existingEntities = await this.entityRepo.findByRepositoryId(repositoryId);
    if (!existingEntities || existingEntities.length === 0) {
      throw new NotFoundError('No entities found. Run entity extraction first.');
    }

    const jsTsFiles = tree.files.filter(
      (f) =>
        f.extension === '.js' ||
        f.extension === '.jsx' ||
        f.extension === '.ts' ||
        f.extension === '.tsx',
    );

    const inputs: FileExtractionInput[] = [];

    for (const file of jsTsFiles) {
      try {
        const fullPath = path.join(localPath, file.path);
        const content = fs.readFileSync(fullPath, 'utf-8');
        const parseResult = this.astParser.parse(content, file.path);
        const language = file.extension === '.ts' || file.extension === '.tsx' ? 'typescript' : 'javascript';

        inputs.push({
          fileId: `${repositoryId}:${file.path}`,
          filePath: file.path,
          content,
          parseResult,
          language,
        });
      } catch (err) {
        logger.warn({ file: file.path, error: err }, 'Failed to read or parse file for relationship extraction');
      }
    }

    const extractionInputs = inputs.map((input) => {
      const entities = existingEntities.filter((e) => e.fileId === input.fileId);
      const imports = input.parseResult.success && input.parseResult.ast
        ? collectImports(input.parseResult.ast, input.content)
        : [];
      const exports = input.parseResult.success && input.parseResult.ast
        ? collectExports(input.parseResult.ast, input.content)
        : [];

      return {
        fileId: input.fileId,
        filePath: input.filePath,
        content: input.content,
        parseResult: input.parseResult,
        entities: entities.map((e) => ({
          id: e.id,
          repositoryId: e.repositoryId,
          fileId: e.fileId,
          filePath: e.filePath,
          name: e.name,
          type: e.type as any,
          startLine: e.startLine ?? 0,
          endLine: e.endLine ?? 0,
          metadata: e.metadata ?? {},
        })),
        imports,
        exports,
      };
    });

    const result = this.relationshipExtractor.extractFromFiles(extractionInputs, repositoryId);

    await this.relationshipRepo.deleteByRepositoryId(repositoryId);

    const relationshipsByType: Record<string, number> = {};

    for (const rel of result.relationships) {
      const id = generateRelationshipId(repositoryId, rel.type, rel.sourceEntityId, rel.targetEntityId);
      rel.id = id;

      const doc = {
        repositoryId,
        sourceEntityId: rel.sourceEntityId,
        targetEntityId: rel.targetEntityId,
        sourceEntityName: rel.sourceEntityName,
        targetEntityName: rel.targetEntityName,
        type: rel.type,
        filePath: rel.filePath,
        startLine: rel.startLine,
        endLine: rel.endLine,
        metadata: rel.metadata,
      };
      await this.relationshipRepo.create(doc);

      relationshipsByType[rel.type] = (relationshipsByType[rel.type] ?? 0) + 1;
    }

    logger.info(
      { repositoryId, totalRelationships: result.relationships.length, totalFiles: inputs.length },
      'Relationship extraction completed',
    );

    return {
      repositoryId,
      totalRelationships: result.relationships.length,
      totalFiles: inputs.length,
      relationshipsByType,
      errors: result.errors,
    };
  }
}
