import ts from 'typescript';
import type { AstNode } from '../ast-parser/types.js';
import type { ExtractedRelationship, RelationshipExtractor, ExtractorOptions } from './types.js';
import { getNodeText } from '../entity-extractor/SourceHelper.js';

export class ExtendsImplRelationshipExtractor implements RelationshipExtractor {
  readonly type = 'EXTENDS' as const;

  extract(options: ExtractorOptions): ExtractedRelationship[] {
    const relationships: ExtractedRelationship[] = [];
    const classNodes = this.collectClassDeclarations(options.ast);

    for (const classNode of classNodes) {
      const className = this.extractClassName(classNode, options.content);
      if (!className) continue;

      relationships.push(...this.extractHeritageRelationships(classNode, className, options));
    }

    return relationships;
  }

  private collectClassDeclarations(node: AstNode): AstNode[] {
    const result: AstNode[] = [];
    if (!node.children) return result;

    for (const child of node.children) {
      if (child.type === 'ClassDeclaration') {
        result.push(child);
      }
      result.push(...this.collectClassDeclarations(child));
    }
    return result;
  }

  private extractClassName(classNode: AstNode, source: string): string | null {
    if (!classNode.children) return null;

    const identifiers = classNode.children.filter((c) => c.type === 'Identifier');
    if (identifiers.length === 0) return null;

    const classBodyIndex = classNode.children.findIndex((c) => c.type === 'ClassBody');
    if (classBodyIndex === -1) {
      return getNodeText(identifiers[0], source);
    }

    for (const id of identifiers) {
      const idIndexInParent = classNode.children.indexOf(id);
      if (classBodyIndex === -1 || idIndexInParent < classBodyIndex) {
        if (identifiers.indexOf(id) === 0) {
          return getNodeText(id, source);
        }
      }
    }

    return getNodeText(identifiers[0], source);
  }

  private extractHeritageRelationships(
    classNode: AstNode,
    className: string,
    options: ExtractorOptions,
  ): ExtractedRelationship[] {
    const relationships: ExtractedRelationship[] = [];

    const heritageClauses = (classNode.children ?? []).filter(
      (c) => c.type === 'HeritageClause',
    );

    for (const clause of heritageClauses) {
      const clauseType = this.getHeritageClauseType(clause);
      if (!clauseType) continue;

      const targetNames = this.collectHeritageTargetNames(clause, options.content);
      for (const targetName of targetNames) {
        relationships.push({
          id: '',
          repositoryId: options.repositoryId,
          sourceEntityId: '',
          targetEntityId: '',
          sourceEntityName: className,
          targetEntityName: targetName,
          type: clauseType,
          filePath: options.filePath,
          startLine: classNode.loc?.start.line ?? 0,
          endLine: classNode.loc?.end.line ?? 0,
          metadata: {},
        });
      }
    }

    if (heritageClauses.length === 0) {
      relationships.push(
        ...this.extractBabelExtends(classNode, className, options),
        ...this.extractBabelImplements(classNode, className, options),
      );
    }

    return relationships;
  }

  private getHeritageClauseType(
    clause: AstNode,
  ): 'EXTENDS' | 'IMPLEMENTS' | null {
    const rawNode = clause.rawNode as { token?: number } | undefined;
    if (!rawNode || typeof rawNode.token !== 'number') return null;

    if (rawNode.token === ts.SyntaxKind.ExtendsKeyword) return 'EXTENDS';
    if (rawNode.token === ts.SyntaxKind.ImplementsKeyword) return 'IMPLEMENTS';
    return null;
  }

  private collectHeritageTargetNames(clause: AstNode, source: string): string[] {
    const names: string[] = [];
    if (!clause.children) return names;

    for (const child of clause.children) {
      if (child.type === 'ExpressionWithTypeArguments' && child.children) {
        for (const sub of child.children) {
          if (sub.type === 'Identifier') {
            const name = getNodeText(sub, source);
            if (name) names.push(name);
          }
        }
      } else if (child.type === 'Identifier') {
        const name = getNodeText(child, source);
        if (name) names.push(name);
      }
    }
    return names;
  }

  private extractBabelExtends(
    classNode: AstNode,
    className: string,
    options: ExtractorOptions,
  ): ExtractedRelationship[] {
    const relationships: ExtractedRelationship[] = [];
    const children = classNode.children ?? [];
    const classBodyIndex = children.findIndex((c) => c.type === 'ClassBody');

    if (classBodyIndex <= 1) return relationships;

    let foundClassName = false;
    for (let i = 0; i < classBodyIndex; i++) {
      const child = children[i];
      if (child.type === 'Identifier') {
        const name = getNodeText(child, options.content);
        if (!foundClassName) {
          foundClassName = true;
          continue;
        }
        if (name && name !== className) {
          relationships.push({
            id: '',
            repositoryId: options.repositoryId,
            sourceEntityId: '',
            targetEntityId: '',
            sourceEntityName: className,
            targetEntityName: name,
            type: 'EXTENDS',
            filePath: options.filePath,
            startLine: child.loc?.start.line ?? 0,
            endLine: child.loc?.end.line ?? 0,
            metadata: {},
          });
        }
      }
    }

    return relationships;
  }

  private extractBabelImplements(
    classNode: AstNode,
    className: string,
    options: ExtractorOptions,
  ): ExtractedRelationship[] {
    const relationships: ExtractedRelationship[] = [];
    const children = classNode.children ?? [];

    for (const child of children) {
      if (child.type === 'TSExpressionWithTypeArguments' && child.children) {
        for (const sub of child.children) {
          if (sub.type === 'Identifier') {
            const name = getNodeText(sub, options.content);
            if (name) {
              relationships.push({
                id: '',
                repositoryId: options.repositoryId,
                sourceEntityId: '',
                targetEntityId: '',
                sourceEntityName: className,
                targetEntityName: name,
                type: 'IMPLEMENTS',
                filePath: options.filePath,
                startLine: child.loc?.start.line ?? 0,
                endLine: child.loc?.end.line ?? 0,
                metadata: {},
              });
            }
          }
        }
      }
    }

    return relationships;
  }
}
