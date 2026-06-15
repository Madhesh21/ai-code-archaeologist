import type { AstNode } from '../ast-parser/types.js';
import type { ExtractedEntity, EntityExtractor, ExtractorOptions } from './types.js';
import { getNodeText, findChildByType } from './SourceHelper.js';

export class ModelExtractor implements EntityExtractor {
  readonly type = 'MODEL' as const;

  extract(options: ExtractorOptions): ExtractedEntity[] {
    const entities: ExtractedEntity[] = [];
    const calls = this.findCallExpressions(options.ast);

    for (const call of calls) {
      const modelInfo = this.parseModelDefinition(call, options.content);
      if (!modelInfo) continue;

      entities.push({
        id: '',
        repositoryId: options.repositoryId,
        fileId: options.fileId,
        filePath: options.filePath,
        name: modelInfo.name,
        type: 'MODEL',
        startLine: call.loc?.start.line ?? 0,
        endLine: call.loc?.end.line ?? 0,
        metadata: {
          database: modelInfo.database ?? 'mongodb',
          collection: modelInfo.collection,
        },
      });
    }

    // Also detect class-based models (TypeORM, Sequelize, etc.)
    const classes = this.findClassNodes(options.ast);
    for (const cls of classes) {
      const name = this.getClassName(cls, options.content);
      if (!name) continue;

      const isModel = this.isModelClass(cls, options.content);
      if (isModel) {
        entities.push({
          id: '',
          repositoryId: options.repositoryId,
          fileId: options.fileId,
          filePath: options.filePath,
          name,
          type: 'MODEL',
          startLine: cls.loc?.start.line ?? 0,
          endLine: cls.loc?.end.line ?? 0,
          metadata: {
            database: 'generic',
          },
        });
      }
    }

    return entities;
  }

  private findCallExpressions(node: AstNode): AstNode[] {
    const result: AstNode[] = [];
    if (!node.children) return result;

    for (const child of node.children) {
      if (child.type === 'CallExpression' || child.type === 'OptionalCallExpression') {
        result.push(child);
      }
      result.push(...this.findCallExpressions(child));
    }
    return result;
  }

  private findClassNodes(node: AstNode): AstNode[] {
    const result: AstNode[] = [];
    if (!node.children) return result;

    for (const child of node.children) {
      if (child.type === 'ClassDeclaration') {
        result.push(child);
      }
      result.push(...this.findClassNodes(child));
    }
    return result;
  }

  private parseModelDefinition(
    call: AstNode,
    source: string,
  ): { name: string; database?: string; collection?: string } | null {
    if (!call.children || call.children.length < 2) return null;

    const callee = call.children.find(
      (c) =>
        c.type === 'MemberExpression' ||
        c.type === 'PropertyAccessExpression' ||
        c.type === 'Identifier' ||
        c.type === 'ComputedMemberExpression' ||
        c.type === 'ElementAccessExpression',
    );
    if (!callee) return null;

    const isMongooseModel = this.isMongooseModelCall(callee, source);
    const isDirectModelCall =
      callee.type === 'Identifier' && getNodeText(callee, source) === 'model';

    if (!isMongooseModel && !isDirectModelCall) return null;

    const nameArg = call.children.find(
      (c) => c !== callee && c.type === 'StringLiteral',
    );
    if (!nameArg) return null;

    const name = getNodeText(nameArg, source)?.replace(/['"]/g, '') ?? '';
    if (!name) return null;

    return { name, database: 'mongodb' };
  }

  private isMongooseModelCall(callee: AstNode, source: string): boolean {
    if (!callee.children || callee.children.length < 2) return false;

    const property = callee.children[callee.children.length - 1];
    const propName = getNodeText(property, source);

    if (propName !== 'model') return false;

    const objectNames = callee.children
      .slice(0, -1)
      .map((c) => getNodeText(c, source).toLowerCase());

    return (
      objectNames.includes('mongoose') ||
      objectNames.includes('mongoose') ||
      callee.children.some(
        (c) =>
          c.type === 'Identifier' &&
          getNodeText(c, source).toLowerCase() === 'mongoose',
      )
    );
  }

  private isModelClass(node: AstNode, source: string): boolean {
    if (!node.children) return false;
    const text = getNodeText(node, source).toLowerCase();
    if (text.includes('model') || text.includes('entity') || text.includes('schema')) {
      return true;
    }
    for (const child of node.children) {
      if (child.type === 'ClassHeritage' || child.type === 'ExtendsClause' || child.type === 'HeritageClause') {
        return true;
      }
    }
    return false;
  }

  private getClassName(node: AstNode, source: string): string | null {
    const id = findChildByType(node, 'Identifier');
    if (id) return getNodeText(id, source);
    return null;
  }
}
