import type { ExtractedRelationship, RelationshipExtractor, ExtractorOptions } from './types.js';

export class ImportRelationshipExtractor implements RelationshipExtractor {
  readonly type = 'IMPORTS' as const;

  extract(options: ExtractorOptions): ExtractedRelationship[] {
    const relationships: ExtractedRelationship[] = [];
    const entityByName = new Map<string, import('../entity-extractor/types.js').ExtractedEntity>();
    for (const entity of options.entities) {
      entityByName.set(entity.name, entity);
    }

    for (const imp of options.imports) {
      for (const specifier of imp.specifiers) {
        const matchingEntity = entityByName.get(specifier.replace(/^\* as /, ''));

        relationships.push({
          id: '',
          repositoryId: options.repositoryId,
          sourceEntityId: matchingEntity?.id ?? '',
          targetEntityId: '',
          sourceEntityName: matchingEntity?.name ?? options.filePath,
          targetEntityName: imp.source,
          type: 'IMPORTS',
          filePath: options.filePath,
          startLine: imp.startLine,
          endLine: imp.endLine,
          metadata: {
            specifier,
            isDefault: imp.specifiers.length === 1 && specifier === imp.specifiers[0]
              && !specifier.startsWith('* as '),
          },
        });
      }
    }

    return relationships;
  }
}
