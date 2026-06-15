import type { AstNode } from '../ast-parser/types.js';
import type { ExtractedEntity, EntityExtractor, ExtractorOptions } from './types.js';
import { getNodeText, findChildByType } from './SourceHelper.js';

export class ServiceExtractor implements EntityExtractor {
  readonly type = 'SERVICE' as const;

  extract(options: ExtractorOptions): ExtractedEntity[] {
    const entities: ExtractedEntity[] = [];

    // Detect service classes (classes with "Service" suffix)
    const classes = this.findClassNodes(options.ast);
    for (const cls of classes) {
      const name = this.getClassName(cls, options.content);
      if (!name) continue;

      if (
        name.endsWith('Service') ||
        name.endsWith('Repository') ||
        name.endsWith('Provider') ||
        name.endsWith('Factory') ||
        name.endsWith('Manager') ||
        name.endsWith('Helper') ||
        name.endsWith('Util')
      ) {
        const methods = this.getClassMethods(cls, options.content);
        entities.push({
          id: '',
          repositoryId: options.repositoryId,
          fileId: options.fileId,
          filePath: options.filePath,
          name,
          type: 'SERVICE',
          startLine: cls.loc?.start.line ?? 0,
          endLine: cls.loc?.end.line ?? 0,
          metadata: {
            methods,
          },
        });
      }
    }

    // Detect exported service-like objects/functions
    const exports = this.findServiceExports(options.ast, options.content);
    for (const exp of exports) {
      entities.push({
        id: '',
        repositoryId: options.repositoryId,
        fileId: options.fileId,
        filePath: options.filePath,
        name: exp.name,
        type: 'SERVICE',
        startLine: exp.line,
        endLine: exp.line,
        metadata: {
          methods: [],
        },
      });
    }

    return entities;
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

  private getClassName(node: AstNode, source: string): string | null {
    const id = findChildByType(node, 'Identifier');
    if (id) return getNodeText(id, source);
    return null;
  }

  private getClassMethods(node: AstNode, source: string): string[] {
    const methods: string[] = [];
    if (!node.children) return methods;

    for (const child of node.children) {
      if (child.type === 'MethodDeclaration') {
        const key = findChildByType(child, 'Identifier');
        if (key) methods.push(getNodeText(key, source));
      }
      if (child.type === 'ClassBody' && child.children) {
        for (const member of child.children) {
          if (
            member.type === 'MethodDefinition' ||
            member.type === 'ClassMethod' ||
            member.type === 'MethodDeclaration'
          ) {
            const key = findChildByType(member, 'Identifier');
            if (key) methods.push(getNodeText(key, source));
          }
        }
      }
    }
    return methods;
  }

  private findServiceExports(
    node: AstNode,
    source: string,
  ): { name: string; line: number }[] {
    const result: { name: string; line: number }[] = [];
    if (!node.children) return result;

    for (const child of node.children) {
      if (child.type === 'ExportNamedDeclaration' && child.children) {
        for (const decl of child.children) {
          if (decl.type === 'VariableDeclaration' && decl.children) {
            result.push(...this.extractServiceNames(decl.children, source, child));
          }
        }
      } else if (
        child.type === 'FirstStatement' &&
        child.children &&
        child.children.some((c) => c.type === 'ExportKeyword')
      ) {
        for (const inner of child.children) {
          if (inner.type === 'VariableDeclarationList' && inner.children) {
            result.push(...this.extractServiceNames(inner.children, source, child));
          }
        }
      }
      result.push(...this.findServiceExports(child, source));
    }
    return result;
  }

  private extractServiceNames(
    children: AstNode[],
    source: string,
    locNode: AstNode,
  ): { name: string; line: number }[] {
    const result: { name: string; line: number }[] = [];
    for (const vDecl of children) {
      if (vDecl.type === 'VariableDeclarator' || vDecl.type === 'VariableDeclaration') {
        const id = findChildByType(vDecl, 'Identifier');
        if (id) {
          const name = getNodeText(id, source);
          if (name && this.isServiceName(name)) {
            result.push({
              name,
              line: locNode.loc?.start.line ?? 0,
            });
          }
        }
      }
    }
    return result;
  }

  private isServiceName(name: string): boolean {
    const lower = name.toLowerCase();
    return (
      lower.endsWith('service') ||
      lower.endsWith('repository') ||
      lower.endsWith('provider') ||
      lower.endsWith('factory') ||
      lower.endsWith('manager')
    );
  }
}
