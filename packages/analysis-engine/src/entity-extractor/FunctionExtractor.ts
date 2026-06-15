import type { AstNode } from '../ast-parser/types.js';
import type { ExtractedEntity, EntityExtractor, ExtractorOptions } from './types.js';
import { getNodeText, findChildByType } from './SourceHelper.js';

export class FunctionExtractor implements EntityExtractor {
  readonly type = 'FUNCTION' as const;

  extract(options: ExtractorOptions): ExtractedEntity[] {
    const entities: ExtractedEntity[] = [];
    const exports = this.collectExportNames(options.ast, options.content);

    const functions = this.collectFunctionNodes(options.ast);
    for (const fnNode of functions) {
      const name = this.extractFunctionName(fnNode, options.content);
      if (!name) continue;

      const isExported = exports.has(name) || exports.has('default') || this.hasExportKeyword(fnNode);

      entities.push({
        id: '',
        repositoryId: options.repositoryId,
        fileId: options.fileId,
        filePath: options.filePath,
        name,
        type: 'FUNCTION',
        startLine: fnNode.loc?.start.line ?? 0,
        endLine: fnNode.loc?.end.line ?? 0,
        metadata: {
          isExported,
        },
      });
    }

    const arrowAssignments = this.collectArrowAssignments(options.ast, options.content);
    for (const { name, node } of arrowAssignments) {
      entities.push({
        id: '',
        repositoryId: options.repositoryId,
        fileId: options.fileId,
        filePath: options.filePath,
        name,
        type: 'FUNCTION',
        startLine: node.loc?.start.line ?? 0,
        endLine: node.loc?.end.line ?? 0,
        metadata: {
          isExported: exports.has(name),
        },
      });
    }

    return entities;
  }

  private collectFunctionNodes(node: AstNode): AstNode[] {
    const result: AstNode[] = [];
    if (!node.children) return result;

    for (const child of node.children) {
      if (['FunctionDeclaration', 'FunctionExpression', 'MethodDeclaration'].includes(child.type)) {
        result.push(child);
      }
      if (
        child.type === 'MethodDefinition' ||
        child.type === 'ObjectMethod' ||
        child.type === 'ClassMethod'
      ) {
        result.push(child);
      }
      result.push(...this.collectFunctionNodes(child));
    }
    return result;
  }

  private collectArrowAssignments(
    node: AstNode,
    source: string,
  ): { name: string; node: AstNode }[] {
    const result: { name: string; node: AstNode }[] = [];
    if (!node.children) return result;

    for (const child of node.children) {
      if (child.type === 'VariableDeclaration' && child.children) {
        for (const decl of child.children) {
          if (decl.type === 'VariableDeclarator' && decl.children) {
            const arrow = decl.children.find(
              (c) => c.type === 'ArrowFunctionExpression' || c.type === 'ArrowFunction',
            );
            if (arrow) {
              const id = decl.children.find((c) => c.type === 'Identifier');
              if (id) {
                result.push({ name: getNodeText(id, source), node: arrow });
              }
            }
          }
        }
      }
      if (child.type === 'VariableDeclarationList' && child.children) {
        for (const decl of child.children) {
          if (decl.type === 'VariableDeclaration' && decl.children) {
            const arrow = decl.children.find(
              (c) => c.type === 'ArrowFunctionExpression' || c.type === 'ArrowFunction',
            );
            if (arrow) {
              const id = decl.children.find((c) => c.type === 'Identifier');
              if (id) {
                result.push({ name: getNodeText(id, source), node: arrow });
              }
            }
          }
        }
      }
      result.push(...this.collectArrowAssignments(child, source));
    }
    return result;
  }

  private extractFunctionName(node: AstNode, source: string): string | null {
    if (
      node.type === 'MethodDefinition' ||
      node.type === 'MethodDeclaration' ||
      node.type === 'ObjectMethod' ||
      node.type === 'ClassMethod'
    ) {
      const key = findChildByType(node, 'Identifier');
      if (key) return getNodeText(key, source);
      const strKey = findChildByType(node, 'StringLiteral');
      if (strKey) {
        const text = getNodeText(strKey, source);
        return text?.replace(/['"]/g, '') ?? null;
      }
      return '(anonymous)';
    }

    const id = findChildByType(node, 'Identifier');
    if (id) return getNodeText(id, source);
    return null;
  }

  private collectExportNames(node: AstNode, source: string): Set<string> {
    const names = new Set<string>();
    if (!node.children) return names;

    const findExportedName = (n: AstNode) => {
      if (!n.children) return;
      const hasExport = n.children.some((c) => c.type === 'ExportKeyword');
      const hasDefault = n.children.some((c) => c.type === 'DefaultKeyword');
      if (!hasExport && !hasDefault) return;
      if (n.type === 'FirstStatement') {
        for (const inner of n.children) {
          if (inner.type === 'VariableDeclarationList' && inner.children) {
            for (const vd of inner.children) {
              if (vd.type === 'VariableDeclaration' && vd.children) {
                const id = vd.children.find((c) => c.type === 'Identifier');
                if (id) names.add(getNodeText(id, source));
              }
            }
          }
        }
      } else {
        const id = findChildByType(n, 'Identifier');
        if (id) names.add(getNodeText(id, source));
        if (hasDefault) names.add('default');
      }
    };

    for (const child of node.children) {
      if (child.type === 'ExportNamedDeclaration' && child.children) {
        for (const decl of child.children) {
          const id = findChildByType(decl, 'Identifier');
          if (id) names.add(getNodeText(id, source));
        }
      } else if (child.type === 'ExportDefaultDeclaration') {
        names.add('default');
      }
      findExportedName(child);
    }
    return names;
  }

  private hasExportKeyword(node: AstNode): boolean {
    if (!node.children) return false;
    return node.children.some((c) => c.type === 'ExportKeyword');
  }
}
