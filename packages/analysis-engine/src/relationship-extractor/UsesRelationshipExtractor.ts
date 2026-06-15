import type { AstNode } from '../ast-parser/types.js';
import type { ExtractedEntity } from '../entity-extractor/types.js';
import type { ExtractedRelationship, RelationshipExtractor, ExtractorOptions } from './types.js';
import { getNodeText } from '../entity-extractor/SourceHelper.js';

export class UsesRelationshipExtractor implements RelationshipExtractor {
  readonly type = 'USES' as const;

  extract(options: ExtractorOptions): ExtractedRelationship[] {
    const relationships: ExtractedRelationship[] = [];
    const entityByName = new Map<string, ExtractedEntity>();
    for (const entity of options.entities) {
      entityByName.set(entity.name, entity);
    }

    const typeRefNodes = this.collectTypeReferences(options.ast);
    for (const typeRef of typeRefNodes) {
      const typeName = this.extractTypeName(typeRef, options.content);
      if (!typeName) continue;

      const targetEntity = entityByName.get(typeName);
      if (!targetEntity) continue;

      const sourceEntity = this.findContainingEntity(typeRef, options.entities);
      if (!sourceEntity) continue;

      relationships.push({
        id: '',
        repositoryId: options.repositoryId,
        sourceEntityId: sourceEntity.id,
        targetEntityId: targetEntity.id,
        sourceEntityName: sourceEntity.name,
        targetEntityName: typeName,
        type: 'USES',
        filePath: options.filePath,
        startLine: typeRef.loc?.start.line ?? 0,
        endLine: typeRef.loc?.end.line ?? 0,
        metadata: {},
      });
    }

    return relationships;
  }

  private collectTypeReferences(node: AstNode): AstNode[] {
    const result: AstNode[] = [];
    if (!node.children) return result;

    for (const child of node.children) {
      if (child.type === 'TSTypeReference' || child.type === 'TypeReference') {
        result.push(child);
      }
      result.push(...this.collectTypeReferences(child));
    }
    return result;
  }

  private extractTypeName(node: AstNode, source: string): string | null {
    if (!node.children) return null;
    const typeName = node.children.find(
      (c) => c.type === 'Identifier',
    );
    if (typeName) {
      return getNodeText(typeName, source);
    }
    return null;
  }

  private findContainingEntity(
    node: AstNode,
    entities: ExtractedEntity[],
  ): ExtractedEntity | undefined {
    const nodeStart = node.loc?.start.line ?? 0;
    let containing: ExtractedEntity | undefined;

    for (const entity of entities) {
      if (entity.startLine <= nodeStart && entity.endLine >= nodeStart) {
        if (!containing || entity.startLine >= containing.startLine) {
          containing = entity;
        }
      }
    }
    return containing;
  }
}
