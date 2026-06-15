import type { AstNode } from '../ast-parser/types.js';
import type { ExtractedEntity, EntityExtractor, ExtractorOptions } from './types.js';
import { getNodeText, findChildByType } from './SourceHelper.js';

export class ClassExtractor implements EntityExtractor {
  readonly type = 'CLASS' as const;

  extract(options: ExtractorOptions): ExtractedEntity[] {
    const entities: ExtractedEntity[] = [];
    const exports = this.collectExportNames(options.ast, options.content);

    const classes = this.collectClassNodes(options.ast);
    for (const cls of classes) {
      const name = this.extractClassName(cls, options.content);
      if (!name) continue;

      const isExported = exports.has(name) || this.hasExportKeyword(cls);
      const parentClass = this.findParentClass(cls, options.content);
      const implementedInterfaces = this.findImplementedInterfaces(cls, options.content);

      entities.push({
        id: '',
        repositoryId: options.repositoryId,
        fileId: options.fileId,
        filePath: options.filePath,
        name,
        type: 'CLASS',
        startLine: cls.loc?.start.line ?? 0,
        endLine: cls.loc?.end.line ?? 0,
        metadata: {
          isExported,
          parentClass,
          implements: implementedInterfaces,
          methods: this.findMethodNames(cls, options.content),
        },
      });
    }

    return entities;
  }

  private collectClassNodes(node: AstNode): AstNode[] {
    const result: AstNode[] = [];
    if (!node.children) return result;

    for (const child of node.children) {
      if (child.type === 'ClassDeclaration') {
        result.push(child);
      }
      result.push(...this.collectClassNodes(child));
    }
    return result;
  }

  private extractClassName(node: AstNode, source: string): string | null {
    const id = findChildByType(node, 'Identifier');
    if (id) return getNodeText(id, source);
    return null;
  }

  private findParentClass(node: AstNode, source: string): string | undefined {
    if (!node.children) return undefined;
    for (const child of node.children) {
      if (child.type === 'ClassHeritage' || child.type === 'ExtendsClause' || child.type === 'HeritageClause') {
        if (child.children) {
          for (const heritage of child.children) {
            if (heritage.type === 'Identifier') {
              return getNodeText(heritage, source);
            }
            if (heritage.type === 'ExpressionWithTypeArguments' && heritage.children) {
              const id = heritage.children.find((c) => c.type === 'Identifier');
              if (id) return getNodeText(id, source);
            }
          }
        }
      }
    }
    return undefined;
  }

  private findImplementedInterfaces(node: AstNode, source: string): string[] {
    const interfaces: string[] = [];
    if (!node.children) return interfaces;

    for (const child of node.children) {
      if (child.type === 'ImplementsClause' || child.type === 'HeritageClause') {
        if (child.children) {
          for (const iface of child.children) {
            if (iface.type === 'Identifier') {
              interfaces.push(getNodeText(iface, source));
            }
            if (iface.type === 'ExpressionWithTypeArguments' && iface.children) {
              const id = iface.children.find((c) => c.type === 'Identifier');
              if (id) interfaces.push(getNodeText(id, source));
            }
          }
        }
      }
    }
    return interfaces;
  }

  private findMethodNames(node: AstNode, source: string): string[] {
    const methods: string[] = [];
    if (!node.children) return methods;

    for (const child of node.children) {
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
      if (child.type === 'MethodDeclaration') {
        const key = findChildByType(child, 'Identifier');
        if (key) methods.push(getNodeText(key, source));
      }
    }
    return methods;
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
