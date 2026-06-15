import type { AstNode } from '../ast-parser/types.js';
import type { ExtractedEntity, EntityExtractor, ExtractorOptions } from './types.js';
import { getNodeText, findChildByType } from './SourceHelper.js';

export class ComponentExtractor implements EntityExtractor {
  readonly type = 'COMPONENT' as const;

  extract(options: ExtractorOptions): ExtractedEntity[] {
    const entities: ExtractedEntity[] = [];
    const exports = this.collectExportNames(options.ast, options.content);

    const functions = this.collectFunctionReturnsJSX(options.ast);
    for (const fn of functions) {
      const name = this.getFunctionName(fn, options.content);
      if (!name || !this.isComponentName(name)) continue;

      entities.push({
        id: '',
        repositoryId: options.repositoryId,
        fileId: options.fileId,
        filePath: options.filePath,
        name,
        type: 'COMPONENT',
        startLine: fn.loc?.start.line ?? 0,
        endLine: fn.loc?.end.line ?? 0,
        metadata: {
          componentType: exports.has(name) ? 'PAGE' : 'UI',
        },
      });
    }

    const assignments = this.collectArrowComponents(options.ast, options.content);
    for (const { name, node } of assignments) {
      if (!this.isComponentName(name)) continue;

      entities.push({
        id: '',
        repositoryId: options.repositoryId,
        fileId: options.fileId,
        filePath: options.filePath,
        name,
        type: 'COMPONENT',
        startLine: node.loc?.start.line ?? 0,
        endLine: node.loc?.end.line ?? 0,
        metadata: {
          componentType: exports.has(name) ? 'PAGE' : 'UI',
        },
      });
    }

    return entities;
  }

  private collectFunctionReturnsJSX(node: AstNode): AstNode[] {
    const result: AstNode[] = [];
    if (!node.children) return result;

    for (const child of node.children) {
      if (child.type === 'FunctionDeclaration' || child.type === 'FunctionExpression') {
        if (this.containsJSX(child)) {
          result.push(child);
        }
      }
      result.push(...this.collectFunctionReturnsJSX(child));
    }
    return result;
  }

  private collectArrowComponents(
    node: AstNode,
    source: string,
  ): { name: string; node: AstNode }[] {
    const result: { name: string; node: AstNode }[] = [];
    if (!node.children) return result;

    const findArrow = (children: AstNode[]) => {
      for (const decl of children) {
        if (decl.type === 'VariableDeclarator' && decl.children) {
          const arrow = decl.children.find(
            (c) => c.type === 'ArrowFunctionExpression' || c.type === 'ArrowFunction',
          );
          if (arrow && this.containsJSX(arrow)) {
            const id = decl.children.find((c) => c.type === 'Identifier');
            if (id) {
              result.push({ name: getNodeText(id, source), node: arrow });
            }
          }
        }
        if (decl.type === 'VariableDeclaration' && decl.children) {
          const arrow = decl.children.find(
            (c) => c.type === 'ArrowFunctionExpression' || c.type === 'ArrowFunction',
          );
          if (arrow && this.containsJSX(arrow)) {
            const id = decl.children.find((c) => c.type === 'Identifier');
            if (id) {
              result.push({ name: getNodeText(id, source), node: arrow });
            }
          }
          findArrow(decl.children);
        }
      }
    };

    for (const child of node.children) {
      if (child.type === 'VariableDeclaration' && child.children) {
        findArrow(child.children);
      }
      if (child.type === 'VariableDeclarationList' && child.children) {
        findArrow(child.children);
      }
      result.push(...this.collectArrowComponents(child, source));
    }
    return result;
  }

  private containsJSX(node: AstNode): boolean {
    if (!node.children) return false;
    for (const child of node.children) {
      if (
        child.type.startsWith('JSX') ||
        child.type.startsWith('Jsx') ||
        child.type === 'JSXElement' ||
        child.type === 'JSXFragment' ||
        child.type === 'JsxElement' ||
        child.type === 'JsxFragment'
      ) {
        return true;
      }
      if (this.containsJSX(child)) return true;
    }
    return false;
  }

  private getFunctionName(node: AstNode, source: string): string | null {
    const id = findChildByType(node, 'Identifier');
    if (id) return getNodeText(id, source);
    return null;
  }

  private isComponentName(name: string): boolean {
    return /^[A-Z]/.test(name);
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
}
