import type { RepositoryRepository } from '../../infrastructure/database/repositories/RepositoryRepository.js';
import type { EntityDefinitionRepository } from '../../infrastructure/database/repositories/EntityDefinitionRepository.js';
import type { RelationshipRepository } from '../../infrastructure/database/repositories/RelationshipRepository.js';
import type { RepositoryTreeRepository } from '../../infrastructure/database/repositories/RepositoryTreeRepository.js';
import type { AnalysisRepository } from '../../infrastructure/database/repositories/AnalysisRepository.js';
import { logger } from '../../utils/logger.js';
import { NotFoundError } from '../../utils/errors.js';

export interface ArchitectureReport {
  repositoryId: string;
  repositorySummary: RepositorySummary;
  technologySummary: TechnologySummary;
  apiInventory: ApiEndpoint[];
  modelInventory: ModelEntry[];
  entitySummary: EntitySummary;
  relationshipSummary: {
    total: number;
    byType: Record<string, number>;
  };
  dependencyOverview: DependencyInfo[];
  generatedAt: string;
}

export interface RepositorySummary {
  name: string;
  totalFiles: number;
  totalFolders: number;
  sourceType: string;
  status: string;
  languageBreakdown: Record<string, number>;
}

export interface TechnologySummary {
  frameworks: string[];
  databases: string[];
  infrastructure: string[];
}

export interface ApiEndpoint {
  method: string;
  path: string;
  handler: string;
  filePath: string;
  line: number;
}

export interface ModelEntry {
  name: string;
  database: string;
  fields: number;
  filePath: string;
}

export interface EntitySummary {
  total: number;
  byType: Record<string, number>;
}

export interface DependencyInfo {
  source: string;
  type: string;
  count: number;
}

export class ReportGeneratorService {
  constructor(
    private readonly repositoryRepo: RepositoryRepository,
    private readonly entityDefRepo: EntityDefinitionRepository,
    private readonly relationshipRepo: RelationshipRepository,
    private readonly treeRepo: RepositoryTreeRepository,
    private readonly analysisRepo?: AnalysisRepository,
  ) {}

  async generate(repositoryId: string): Promise<ArchitectureReport> {
    const repository = await this.repositoryRepo.findById(repositoryId);
    if (!repository) {
      throw new NotFoundError('Repository not found');
    }

    const tree = await this.treeRepo.findByRepositoryId(repositoryId);
    const entities = await this.entityDefRepo.findByRepositoryId(repositoryId);
    const relationships = await this.relationshipRepo.findByRepositoryId(repositoryId);

    const report = this.buildReport(repositoryId, repository, tree, entities, relationships);

    if (this.analysisRepo) {
      const existingAnalyses = await this.analysisRepo.findByRepositoryId
        ? await this.analysisRepo.findByRepositoryId(repositoryId)
        : [];
      if (existingAnalyses && existingAnalyses.length > 0) {
        for (const analysis of existingAnalyses) {
          await this.analysisRepo.update(analysis.id, {
            status: 'completed',
            report: report as unknown as Record<string, unknown>,
          } as any);
        }
      }
    }

    logger.info({ repositoryId }, 'Architecture report generated');

    return report;
  }

  private buildReport(
    repositoryId: string,
    repository: { name: string; sourceType: string; status: string },
    tree: { files: { path: string; extension: string }[]; folders: { path: string }[] } | null,
    entities: { type: string; name: string; metadata?: Record<string, unknown>; filePath: string; startLine?: number }[],
    relationships: { type: string; sourceEntityName: string; targetEntityName: string }[],
  ): ArchitectureReport {
    const repositorySummary = this.buildRepositorySummary(repository, tree);
    const technologySummary = this.buildTechnologySummary(tree);
    const apiInventory = this.buildApiInventory(entities);
    const modelInventory = this.buildModelInventory(entities);
    const entitySummary = this.buildEntitySummary(entities);
    const relationshipSummary = this.buildRelationshipSummary(relationships);
    const dependencyOverview = this.buildDependencyOverview(relationships);

    return {
      repositoryId,
      repositorySummary,
      technologySummary,
      apiInventory,
      modelInventory,
      entitySummary,
      relationshipSummary,
      dependencyOverview,
      generatedAt: new Date().toISOString(),
    };
  }

  private buildRepositorySummary(
    repository: { name: string; sourceType: string; status: string },
    tree: { files: { path: string; extension: string }[]; folders: { path: string }[] } | null,
  ): RepositorySummary {
    const languageBreakdown: Record<string, number> = {};
    if (tree) {
      for (const file of tree.files) {
        const ext = file.extension || 'unknown';
        languageBreakdown[ext] = (languageBreakdown[ext] ?? 0) + 1;
      }
    }

    return {
      name: repository.name,
      totalFiles: tree?.files.length ?? 0,
      totalFolders: tree?.folders.length ?? 0,
      sourceType: repository.sourceType,
      status: repository.status,
      languageBreakdown,
    };
  }

  private buildTechnologySummary(
    tree: { files: { path: string }[] } | null,
  ): TechnologySummary {
    const frameworks: string[] = [];
    const databases: string[] = [];
    const infrastructure: string[] = [];

    if (tree) {
      const allPaths = tree.files.map((f) => f.path);
      const allContent = allPaths.join(' ');

      if (allContent.includes('package.json')) frameworks.push('Node.js');
      if (allContent.includes('tsconfig.json')) frameworks.push('TypeScript');
      if (allContent.includes('react') || allContent.includes('jsx')) frameworks.push('React');
      if (allContent.includes('next.config')) frameworks.push('Next.js');
      if (allContent.includes('express') || allContent.includes('app.get') || allContent.includes('router.get')) frameworks.push('Express');
      if (allContent.includes('@nestjs')) frameworks.push('NestJS');
      if (allContent.includes('mongoose') || allContent.includes('schema') && allContent.includes('model')) databases.push('MongoDB');
      if (allContent.includes('postgres') || allContent.includes('pg ') || allContent.includes('typeorm')) databases.push('PostgreSQL');
      if (allContent.includes('redis')) databases.push('Redis');
      if (allContent.includes('docker-compose') || allContent.includes('Dockerfile')) infrastructure.push('Docker');
      if (allContent.includes('neo4j')) databases.push('Neo4j');
    }

    return { frameworks, databases, infrastructure };
  }

  private buildApiInventory(
    entities: { type: string; name: string; metadata?: Record<string, unknown>; filePath: string; startLine?: number }[],
  ): ApiEndpoint[] {
    return entities
      .filter((e) => e.type === 'API_ROUTE')
      .map((e) => ({
        method: ((e.metadata as Record<string, string>)?.method ?? 'GET').toUpperCase(),
        path: (e.metadata as Record<string, string>)?.path ?? e.name,
        handler: e.name,
        filePath: e.filePath,
        line: e.startLine ?? 0,
      }));
  }

  private buildModelInventory(
    entities: { type: string; name: string; metadata?: Record<string, unknown>; filePath: string }[],
  ): ModelEntry[] {
    return entities
      .filter((e) => e.type === 'MODEL')
      .map((e) => {
        const meta = e.metadata as Record<string, unknown> | undefined;
        return {
          name: e.name,
          database: (meta?.database as string) ?? 'unknown',
          fields: Array.isArray(meta?.fields) ? (meta.fields as unknown[]).length : 0,
          filePath: e.filePath,
        };
      });
  }

  private buildEntitySummary(
    entities: { type: string }[],
  ): EntitySummary {
    const byType: Record<string, number> = {};
    for (const entity of entities) {
      byType[entity.type] = (byType[entity.type] ?? 0) + 1;
    }
    return { total: entities.length, byType };
  }

  private buildRelationshipSummary(
    relationships: { type: string }[],
  ): { total: number; byType: Record<string, number> } {
    const byType: Record<string, number> = {};
    for (const rel of relationships) {
      byType[rel.type] = (byType[rel.type] ?? 0) + 1;
    }
    return { total: relationships.length, byType };
  }

  private buildDependencyOverview(
    relationships: { type: string; sourceEntityName: string; targetEntityName: string }[],
  ): DependencyInfo[] {
    const depMap = new Map<string, Map<string, number>>();

    for (const rel of relationships) {
      if (rel.type !== 'DEPENDS_ON' && rel.type !== 'IMPORTS') continue;

      if (!depMap.has(rel.targetEntityName)) {
        depMap.set(rel.targetEntityName, new Map());
      }
      const typeMap = depMap.get(rel.targetEntityName)!;
      typeMap.set(rel.type, (typeMap.get(rel.type) ?? 0) + 1);
    }

    return Array.from(depMap.entries())
      .map(([source, typeMap]) => ({
        source,
        type: Array.from(typeMap.keys()).join(', '),
        count: Array.from(typeMap.values()).reduce((sum, c) => sum + c, 0),
      }))
      .sort((a, b) => b.count - a.count);
  }
}
