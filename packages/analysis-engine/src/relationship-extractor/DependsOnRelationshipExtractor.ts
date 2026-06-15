import type { ExtractedRelationship, RelationshipExtractor, ExtractorOptions } from './types.js';

export class DependsOnRelationshipExtractor implements RelationshipExtractor {
  readonly type = 'DEPENDS_ON' as const;

  extract(options: ExtractorOptions): ExtractedRelationship[] {
    const relationships: ExtractedRelationship[] = [];

    for (const imp of options.imports) {
      const source = imp.source;
      if (!source) continue;

      if (this.isExternalPackage(source)) {
        for (const specifier of imp.specifiers) {
          relationships.push({
            id: '',
            repositoryId: options.repositoryId,
            sourceEntityId: '',
            targetEntityId: '',
            sourceEntityName: specifier,
            targetEntityName: source,
            type: 'DEPENDS_ON',
            filePath: options.filePath,
            startLine: imp.startLine,
            endLine: imp.endLine,
            metadata: {
              source,
              specifier,
              importType: 'external',
            },
          });
        }

        if (imp.specifiers.length === 0) {
          relationships.push({
            id: '',
            repositoryId: options.repositoryId,
            sourceEntityId: '',
            targetEntityId: '',
            sourceEntityName: options.filePath,
            targetEntityName: source,
            type: 'DEPENDS_ON',
            filePath: options.filePath,
            startLine: imp.startLine,
            endLine: imp.endLine,
            metadata: {
              source,
              importType: 'external',
            },
          });
        }
      }
    }

    return relationships;
  }

  private isExternalPackage(source: string): boolean {
    if (source.startsWith('.')) return false;
    if (source.startsWith('/')) return false;
    if (source.startsWith('node:')) return false;
    return true;
  }
}
