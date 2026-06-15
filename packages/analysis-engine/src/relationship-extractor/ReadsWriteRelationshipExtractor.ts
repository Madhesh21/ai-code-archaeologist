import type { AstNode } from '../ast-parser/types.js';
import type { ExtractedEntity } from '../entity-extractor/types.js';
import type { ExtractedRelationship, RelationshipExtractor, ExtractorOptions } from './types.js';
import { getNodeText } from '../entity-extractor/SourceHelper.js';

const READ_PATTERNS = [
  'readFile', 'readFileSync', 'readdir', 'readdirSync',
  'find', 'findOne', 'findById', 'findAll',
  'get', 'query', 'select', 'fetch',
  'GET',
];

const WRITE_PATTERNS = [
  'writeFile', 'writeFileSync', 'appendFile', 'appendFileSync',
  'save', 'create', 'insert', 'update', 'delete', 'remove',
  'POST', 'PUT', 'PATCH', 'DELETE',
];

export class ReadsWriteRelationshipExtractor implements RelationshipExtractor {
  readonly type = 'READS' as const;

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

      const isRead = READ_PATTERNS.some((p) =>
        calleeName.toLowerCase().includes(p.toLowerCase()),
      );
      const isWrite = WRITE_PATTERNS.some((p) =>
        calleeName.toLowerCase().includes(p.toLowerCase()),
      );

      if (!isRead && !isWrite) continue;

      const sourceEntity = this.findContainingEntity(callNode, options.entities);
      if (!sourceEntity) continue;

      const relationType = isWrite ? 'WRITES' : 'READS';

      const targetName = this.extractTargetName(callNode, options.content) ?? calleeName;

      relationships.push({
        id: '',
        repositoryId: options.repositoryId,
        sourceEntityId: sourceEntity?.id ?? '',
        targetEntityId: '',
        sourceEntityName: sourceEntity?.name ?? '',
        targetEntityName: targetName,
        type: relationType,
        filePath: options.filePath,
        startLine: callNode.loc?.start.line ?? 0,
        endLine: callNode.loc?.end.line ?? 0,
        metadata: {
          operation: calleeName,
          direction: isWrite ? 'write' : 'read',
        },
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

  private extractTargetName(node: AstNode, source: string): string | null {
    if (!node.children) return null;

    const args = node.children.filter(
      (c) => c.type === 'StringLiteral' || c.type === 'StringLiteral',
    );

    if (args.length > 0) {
      const text = getNodeText(args[0], source);
      return text.replace(/['"]/g, '');
    }

    for (const child of node.children) {
      if (child.type === 'StringLiteral') {
        const text = getNodeText(child, source);
        return text.replace(/['"]/g, '');
      }
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
