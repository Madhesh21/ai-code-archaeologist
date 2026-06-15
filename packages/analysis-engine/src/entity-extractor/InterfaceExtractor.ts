import type { AstNode } from '../ast-parser/types.js';
import type { ExtractedEntity, EntityExtractor, ExtractorOptions } from './types.js';
import { getNodeText, findChildByType } from './SourceHelper.js';

export class InterfaceExtractor implements EntityExtractor {
  readonly type = 'INTERFACE' as const;

  extract(options: ExtractorOptions): ExtractedEntity[] {
    const entities: ExtractedEntity[] = [];
    const exports = this.collectExportNames(options.ast, options.content);

    const interfaces = this.collectInterfaceNodes(options.ast);
    for (const iface of interfaces) {
      const name = this.getInterfaceName(iface, options.content);
      if (!name) continue;

      entities.push({
        id: '',
        repositoryId: options.repositoryId,
        fileId: options.fileId,
        filePath: options.filePath,
        name,
        type: 'INTERFACE',
        startLine: iface.loc?.start.line ?? 0,
        endLine: iface.loc?.end.line ?? 0,
        metadata: {
          isExported: exports.has(name),
        },
      });
    }

    // Also extract Type Aliases
    const types = this.collectTypeAliasNodes(options.ast);
    for (const typeAlias of types) {
      const name = this.getInterfaceName(typeAlias, options.content);
      if (!name) continue;

      entities.push({
        id: '',
        repositoryId: options.repositoryId,
        fileId: options.fileId,
        filePath: options.filePath,
        name,
        type: 'TYPE',
        startLine: typeAlias.loc?.start.line ?? 0,
        endLine: typeAlias.loc?.end.line ?? 0,
        metadata: {
          isExported: exports.has(name),
        },
      });
    }

    // Extract Enums
    const enums = this.collectEnumNodes(options.ast);
    for (const en of enums) {
      const name = this.getInterfaceName(en, options.content);
      if (!name) continue;

      entities.push({
        id: '',
        repositoryId: options.repositoryId,
        fileId: options.fileId,
        filePath: options.filePath,
        name,
        type: 'ENUM',
        startLine: en.loc?.start.line ?? 0,
        endLine: en.loc?.end.line ?? 0,
        metadata: {
          isExported: exports.has(name),
        },
      });
    }

    return entities;
  }

  private collectInterfaceNodes(node: AstNode): AstNode[] {
    const result: AstNode[] = [];
    if (!node.children) return result;

    for (const child of node.children) {
      if (child.type === 'TSInterfaceDeclaration' || child.type === 'InterfaceDeclaration') {
        result.push(child);
      }
      result.push(...this.collectInterfaceNodes(child));
    }
    return result;
  }

  private collectTypeAliasNodes(node: AstNode): AstNode[] {
    const result: AstNode[] = [];
    if (!node.children) return result;

    for (const child of node.children) {
      if (child.type === 'TSTypeAliasDeclaration' || child.type === 'TypeAliasDeclaration') {
        result.push(child);
      }
      result.push(...this.collectTypeAliasNodes(child));
    }
    return result;
  }

  private collectEnumNodes(node: AstNode): AstNode[] {
    const result: AstNode[] = [];
    if (!node.children) return result;

    for (const child of node.children) {
      if (child.type === 'TSEnumDeclaration' || child.type === 'EnumDeclaration') {
        result.push(child);
      }
      result.push(...this.collectEnumNodes(child));
    }
    return result;
  }

  private getInterfaceName(node: AstNode, source: string): string | null {
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
}
