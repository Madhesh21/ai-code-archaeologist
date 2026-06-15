import type { AstNode } from '../ast-parser/types.js';
import type { ExtractedEntity, EntityExtractor, ExtractorOptions } from './types.js';
import { getNodeText, findChildByType } from './SourceHelper.js';

const REACT_HOOK_PATTERN = /^use[A-Z]/;

export class HookExtractor implements EntityExtractor {
  readonly type = 'HOOK' as const;

  extract(options: ExtractorOptions): ExtractedEntity[] {
    const entities: ExtractedEntity[] = [];

    const functions = this.collectFunctionNodes(options.ast);
    for (const fn of functions) {
      const name = this.getFunctionName(fn, options.content);
      if (!name || !REACT_HOOK_PATTERN.test(name)) continue;

      entities.push({
        id: '',
        repositoryId: options.repositoryId,
        fileId: options.fileId,
        filePath: options.filePath,
        name,
        type: 'HOOK',
        startLine: fn.loc?.start.line ?? 0,
        endLine: fn.loc?.end.line ?? 0,
        metadata: {},
      });
    }

    const arrowHooks = this.collectArrowHooks(options.ast, options.content);
    for (const { name, node } of arrowHooks) {
      if (!REACT_HOOK_PATTERN.test(name)) continue;

      entities.push({
        id: '',
        repositoryId: options.repositoryId,
        fileId: options.fileId,
        filePath: options.filePath,
        name,
        type: 'HOOK',
        startLine: node.loc?.start.line ?? 0,
        endLine: node.loc?.end.line ?? 0,
        metadata: {},
      });
    }

    return entities;
  }

  private collectFunctionNodes(node: AstNode): AstNode[] {
    const result: AstNode[] = [];
    if (!node.children) return result;

    for (const child of node.children) {
      if (child.type === 'FunctionDeclaration' || child.type === 'FunctionExpression') {
        result.push(child);
      }
      result.push(...this.collectFunctionNodes(child));
    }
    return result;
  }

  private collectArrowHooks(
    node: AstNode,
    source: string,
  ): { name: string; node: AstNode }[] {
    const result: { name: string; node: AstNode }[] = [];
    if (!node.children) return result;

    const findArrowIn = (children: AstNode[]) => {
      for (const decl of children) {
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
          findArrowIn(decl.children);
        }
      }
    };

    for (const child of node.children) {
      if (child.type === 'VariableDeclaration' && child.children) {
        findArrowIn(child.children);
      }
      if (child.type === 'VariableDeclarationList' && child.children) {
        findArrowIn(child.children);
      }
      result.push(...this.collectArrowHooks(child, source));
    }
    return result;
  }

  private getFunctionName(node: AstNode, source: string): string | null {
    const id = findChildByType(node, 'Identifier');
    if (id) return getNodeText(id, source);
    return null;
  }
}
