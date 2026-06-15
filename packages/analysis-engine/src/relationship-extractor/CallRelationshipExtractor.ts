import type { AstNode } from '../ast-parser/types.js';
import type { ExtractedEntity } from '../entity-extractor/types.js';
import type { ExtractedRelationship, RelationshipExtractor, ExtractorOptions } from './types.js';
import { getNodeText } from '../entity-extractor/SourceHelper.js';

export class CallRelationshipExtractor implements RelationshipExtractor {
  readonly type = 'CALLS' as const;

  extract(options: ExtractorOptions): ExtractedRelationship[] {
    const relationships: ExtractedRelationship[] = [];
    const entityByName = new Map<string, ExtractedEntity>();
    for (const entity of options.entities) {
      entityByName.set(entity.name, entity);
    }

    const callNodes = this.collectCallExpressions(options.ast);
    for (const callNode of callNodes) {
      const calleeName = this.extractCalleeName(callNode, options.content);
      if (!calleeName) continue;

      const targetEntity = entityByName.get(calleeName);
      if (!targetEntity) continue;

      const sourceEntity = this.findContainingEntity(callNode, options.entities);

      relationships.push({
        id: '',
        repositoryId: options.repositoryId,
        sourceEntityId: sourceEntity?.id ?? '',
        targetEntityId: targetEntity.id,
        sourceEntityName: sourceEntity?.name ?? '',
        targetEntityName: calleeName,
        type: 'CALLS',
        filePath: options.filePath,
        startLine: callNode.loc?.start.line ?? 0,
        endLine: callNode.loc?.end.line ?? 0,
        metadata: {},
      });
    }

    return relationships;
  }

  private collectCallExpressions(node: AstNode): AstNode[] {
    const result: AstNode[] = [];
    if (!node.children) return result;

    for (const child of node.children) {
      if (child.type === 'CallExpression') {
        result.push(child);
      }
      result.push(...this.collectCallExpressions(child));
    }
    return result;
  }

  private extractCalleeName(node: AstNode, source: string): string | null {
    if (!node.children) return null;

    const memberExpr = node.children.find(
      (c) => c.type === 'MemberExpression' || c.type === 'PropertyAccessExpression',
    );
    if (memberExpr && memberExpr.children) {
      const identifiers = memberExpr.children.filter((c) => c.type === 'Identifier');
      if (identifiers.length > 0) {
        return getNodeText(identifiers[identifiers.length - 1], source);
      }
    }

    const identifier = node.children.find((c) => c.type === 'Identifier');
    if (identifier) {
      return getNodeText(identifier, source);
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
