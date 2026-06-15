import * as fs from 'fs';
import * as path from 'path';
import { AstParserService, EntityExtractorService } from '@archaeologist/analysis-engine';
import type { FileExtractionInput } from '@archaeologist/analysis-engine';
import type { EntityDefinitionRepository } from '../../infrastructure/database/repositories/EntityDefinitionRepository.js';
import type { RepositoryRepository } from '../../infrastructure/database/repositories/RepositoryRepository.js';
import type { RepositoryTreeRepository } from '../../infrastructure/database/repositories/RepositoryTreeRepository.js';
import { generateEntityId } from '@archaeologist/analysis-engine';
import { logger } from '../../utils/logger.js';
import { NotFoundError, InternalError } from '../../utils/errors.js';

export interface ExtractionSummary {
  repositoryId: string;
  totalEntities: number;
  totalFiles: number;
  entitiesByType: Record<string, number>;
  errors: { filePath: string; message: string }[];
}

export class EntityExtractionService {
  constructor(
    private readonly astParser: AstParserService,
    private readonly entityExtractor: EntityExtractorService,
    private readonly entityRepo: EntityDefinitionRepository,
    private readonly repositoryRepo: RepositoryRepository,
    private readonly treeRepo: RepositoryTreeRepository,
  ) {}

  async extract(repositoryId: string): Promise<ExtractionSummary> {
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
        logger.warn({ file: file.path, error: err }, 'Failed to read or parse file');
      }
    }

    const result = this.entityExtractor.extractFromFiles(inputs, repositoryId);

    await this.entityRepo.deleteByRepositoryId(repositoryId);

    const entitiesByType: Record<string, number> = {};

    for (const entity of result.entities) {
      const id = generateEntityId(repositoryId, entity.filePath, entity.type, entity.name);
      entity.id = id;

      const doc = {
        repositoryId,
        fileId: entity.fileId,
        filePath: entity.filePath,
        name: entity.name,
        type: entity.type,
        startLine: entity.startLine,
        endLine: entity.endLine,
        metadata: entity.metadata,
      };
      await this.entityRepo.create(doc);

      entitiesByType[entity.type] = (entitiesByType[entity.type] ?? 0) + 1;
    }

    logger.info(
      { repositoryId, totalEntities: result.entities.length, totalFiles: inputs.length },
      'Entity extraction completed',
    );

    return {
      repositoryId,
      totalEntities: result.entities.length,
      totalFiles: inputs.length,
      entitiesByType,
      errors: result.errors,
    };
  }
}
