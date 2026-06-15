import type { AstNode } from '../ast-parser/types.js';
import type { ExtractedEntity, EntityExtractor, ExtractorOptions } from './types.js';
import { getNodeText } from './SourceHelper.js';

export class MiddlewareExtractor implements EntityExtractor {
  readonly type = 'MIDDLEWARE' as const;

  extract(options: ExtractorOptions): ExtractedEntity[] {
    const entities: ExtractedEntity[] = [];
    const calls = this.findUseCalls(options.ast, options.content);
    const middlewareFunctions = this.findMiddlewareFunctions(options.ast, options.content);

    const seen = new Set<string>();

    for (const mw of [...calls, ...middlewareFunctions]) {
      if (seen.has(mw.name)) continue;
      seen.add(mw.name);

      entities.push({
        id: '',
        repositoryId: options.repositoryId,
        fileId: options.fileId,
        filePath: options.filePath,
        name: mw.name,
        type: 'MIDDLEWARE',
        startLine: mw.line,
        endLine: mw.line,
        metadata: {
          isGlobal: mw.isGlobal ?? true,
        },
      });
    }

    return entities;
  }

  private findUseCalls(
    node: AstNode,
    source: string,
  ): { name: string; line: number; isGlobal: boolean }[] {
    const result: { name: string; line: number; isGlobal: boolean }[] = [];
    if (!node.children) return result;

    for (const child of node.children) {
      if (
        child.type === 'CallExpression' ||
        child.type === 'OptionalCallExpression'
      ) {
        if (child.children) {
          const callee = child.children.find(
            (c) =>
              c.type === 'MemberExpression' ||
              c.type === 'PropertyAccessExpression' ||
              c.type === 'ComputedMemberExpression' ||
              c.type === 'ElementAccessExpression',
          );
          if (callee && callee.children) {
            const prop = callee.children[callee.children.length - 1];
            const propName = getNodeText(prop, source);
            if (propName === 'use' && callee.children[0]) {
              const objName = getNodeText(callee.children[0], source);
              if (objName === 'app') {
                // Find middleware function names passed as args
                for (const arg of child.children) {
                  if (arg !== callee && arg.type === 'Identifier') {
                    const mwName = getNodeText(arg, source);
                    result.push({
                      name: mwName,
                      line: child.loc?.start.line ?? 0,
                      isGlobal: true,
                    });
                  }
                }
              }
            }
          }
        }
      }
      result.push(...this.findUseCalls(child, source));
    }

    return result;
  }

  private findMiddlewareFunctions(
    node: AstNode,
    source: string,
  ): { name: string; line: number; isGlobal: boolean }[] {
    const result: { name: string; line: number; isGlobal: boolean }[] = [];
    if (!node.children) return result;

    for (const child of node.children) {
      if (
        child.type === 'FunctionDeclaration' ||
        child.type === 'VariableDeclaration'
      ) {
        const name = getNodeText(child, source).toLowerCase();
        if (
          name.includes('middleware') ||
          name.includes('auth') ||
          name.includes('guard')
        ) {
          if (child.children) {
            for (const sub of child.children) {
              if (sub.type === 'Identifier') {
                result.push({
                  name: getNodeText(sub, source),
                  line: child.loc?.start.line ?? 0,
                  isGlobal: false,
                });
              }
            }
          }
        }
      }
      result.push(...this.findMiddlewareFunctions(child, source));
    }

    return result;
  }
}
