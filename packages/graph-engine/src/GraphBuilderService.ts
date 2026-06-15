import type {
  GraphBuildInput,
  GraphBuildResult,
  INodeService,
  IRelationshipService,
  IGraphClient,
} from './types.js';
import { mapEntityTypeToLabel, isValidRelationshipType } from './NodeLabelMapper.js';

export class GraphBuilderService {
  constructor(
    private readonly nodeService: INodeService,
    private readonly relationshipService: IRelationshipService,
    private readonly client: IGraphClient,
  ) {}

  async buildGraph(input: GraphBuildInput): Promise<GraphBuildResult> {
    const errors: string[] = [];
    const { repositoryId, entities, relationships } = input;
    let nodeCount = 0;
    let edgeCount = 0;

    try {
      await this.cleanRepositoryGraph(repositoryId);

      await this.nodeService.createNode('Repository', {
        id: repositoryId,
        name: repositoryId,
        sourceType: 'upload',
        createdAt: new Date().toISOString(),
        repositoryId,
      });
      nodeCount++;

      const fileMap = new Map<string, typeof entities>();
      const folderPaths = new Set<string>();

      for (const entity of entities) {
        if (!fileMap.has(entity.fileId)) {
          fileMap.set(entity.fileId, []);
        }
        fileMap.get(entity.fileId)!.push(entity);

        const dir = this.getDirPath(entity.filePath);
        if (dir) {
          const parts = dir.split(/[/\\]/);
          let current = '';
          for (const part of parts) {
            current = current ? `${current}/${part}` : part;
            folderPaths.add(current);
          }
        }
      }

      const sortedFolders = [...folderPaths].sort(
        (a, b) => a.split('/').length - b.split('/').length,
      );
      const folderIds = new Map<string, string>();

      for (const folderPath of sortedFolders) {
        const folderId = `${repositoryId}:folder:${folderPath}`;
        const name = folderPath.split('/').pop() || folderPath;
        await this.nodeService.createNode('Folder', {
          id: folderId,
          path: folderPath,
          name,
          repositoryId,
        });
        nodeCount++;
        folderIds.set(folderPath, folderId);

        const parentPath = this.getDirPath(folderPath);
        if (parentPath && folderIds.has(parentPath)) {
          await this.relationshipService.createRelationship(
            folderIds.get(parentPath)!,
            'CONTAINS',
            folderId,
          );
          edgeCount++;
        } else {
          await this.relationshipService.createRelationship(
            repositoryId,
            'CONTAINS',
            folderId,
          );
          edgeCount++;
        }
      }

      for (const [fileId, fileEntities] of fileMap) {
        const filePath = fileEntities[0].filePath;
        const ext = filePath.includes('.') ? filePath.split('.').pop() || '' : '';
        await this.nodeService.createNode('File', {
          id: fileId,
          path: filePath,
          extension: ext,
          size: 0,
          repositoryId,
        });
        nodeCount++;

        const dir = this.getDirPath(filePath);
        if (dir && folderIds.has(dir)) {
          await this.relationshipService.createRelationship(
            folderIds.get(dir)!,
            'CONTAINS',
            fileId,
          );
          edgeCount++;
        } else {
          await this.relationshipService.createRelationship(
            repositoryId,
            'CONTAINS',
            fileId,
          );
          edgeCount++;
        }
      }

      for (const entity of entities) {
        const label = mapEntityTypeToLabel(entity.type);
        if (!label) {
          errors.push(`Unknown entity type: ${entity.type} for entity ${entity.name}`);
          continue;
        }

        const properties = this.buildEntityProperties(entity, repositoryId);
        await this.nodeService.createNode(label, properties);
        nodeCount++;

        await this.relationshipService.createRelationship(
          entity.fileId,
          'CONTAINS',
          entity.id,
        );
        edgeCount++;
      }

      for (const rel of relationships) {
        if (!isValidRelationshipType(rel.type)) {
          errors.push(`Invalid relationship type: ${rel.type}`);
          continue;
        }

        const props: Record<string, unknown> = {
          filePath: rel.filePath,
          startLine: rel.startLine,
        };
        await this.relationshipService.createRelationship(
          rel.sourceEntityId,
          rel.type,
          rel.targetEntityId,
          props,
        );
        edgeCount++;
      }

      return {
        success: errors.length === 0,
        repositoryId,
        nodeCount,
        edgeCount,
        errors,
      };
    } catch (error) {
      return {
        success: false,
        repositoryId,
        nodeCount,
        edgeCount,
        errors: [error instanceof Error ? error.message : String(error)],
      };
    }
  }

  async initializeGraphSchema(): Promise<void> {
    const constraints: { label: string; field: string }[] = [
      { label: 'Repository', field: 'id' },
      { label: 'File', field: 'id' },
      { label: 'Function', field: 'id' },
      { label: 'Route', field: 'id' },
      { label: 'Model', field: 'id' },
    ];

    for (const { label, field } of constraints) {
      await this.nodeService.createConstraint(label, field);
    }

    const indexes: { label: string; field: string }[] = [
      { label: 'Repository', field: 'id' },
      { label: 'File', field: 'path' },
      { label: 'Function', field: 'name' },
      { label: 'Class', field: 'name' },
      { label: 'Route', field: 'path' },
      { label: 'Model', field: 'name' },
    ];

    for (const { label, field } of indexes) {
      await this.nodeService.createIndex(label, field);
    }
  }

  private async cleanRepositoryGraph(repositoryId: string): Promise<void> {
    await this.client.execute(
      'MATCH (n {repositoryId: $repositoryId}) DETACH DELETE n',
      { repositoryId },
    );
  }

  private buildEntityProperties(
    entity: { id: string; name: string; type: string; startLine: number; endLine: number; metadata: Record<string, unknown>; exports?: { name: string; isDefault: boolean }[] },
    repositoryId: string,
  ): Record<string, unknown> {
    const base = {
      id: entity.id,
      name: entity.name,
      repositoryId,
    };

    switch (entity.type) {
      case 'FUNCTION':
        return {
          ...base,
          startLine: entity.startLine,
          endLine: entity.endLine,
          isExported: !!(entity.exports && entity.exports.length > 0),
          isAsync: (entity.metadata as Record<string, boolean>)?.isAsync ?? false,
        };
      case 'CLASS':
        return {
          ...base,
          startLine: entity.startLine,
          endLine: entity.endLine,
        };
      case 'API_ROUTE':
        return {
          ...base,
          method: (entity.metadata as Record<string, string>)?.method ?? 'GET',
          path: (entity.metadata as Record<string, string>)?.path ?? '/',
        };
      case 'MODEL':
        return {
          ...base,
          database: (entity.metadata as Record<string, string>)?.database ?? 'unknown',
        };
      case 'COMPONENT':
        return {
          ...base,
          type: (entity.metadata as Record<string, string>)?.componentType ?? 'UI',
        };
      default:
        return { ...base };
    }
  }

  private getDirPath(filePath: string): string | undefined {
    const normalized = filePath.replace(/\\/g, '/');
    const lastSlash = normalized.lastIndexOf('/');
    if (lastSlash === -1) return undefined;
    return normalized.slice(0, lastSlash);
  }
}
