import type { AstNode } from '../ast-parser/types.js';
import type { ExtractedEntity, EntityExtractor, ExtractorOptions } from './types.js';
import { getNodeText, findChildByType } from './SourceHelper.js';

export class ImportExtractor implements EntityExtractor {
  readonly type = 'FUNCTION' as const;

  extract(options: ExtractorOptions): ExtractedEntity[] {
    const entities: ExtractedEntity[] = [];
    const imports = this.collectImportNodes(options.ast);

    for (const imp of imports) {
      const source = this.getImportSource(imp, options.content);
      if (!source) continue;

      const specifiers = this.getImportSpecifiers(imp, options.content);
      if (specifiers.length === 0) {
        entities.push(this.makeImport(options, source, '*', imp));
      } else {
        for (const spec of specifiers) {
          entities.push(this.makeImport(options, source, spec, imp));
        }
      }
    }

    return entities;
  }

  private makeImport(
    options: ExtractorOptions,
    source: string,
    specifier: string,
    node: AstNode,
  ): ExtractedEntity {
    return {
      id: '',
      repositoryId: options.repositoryId,
      fileId: options.fileId,
      filePath: options.filePath,
      name: specifier,
      type: 'FUNCTION',
      startLine: node.loc?.start.line ?? 0,
      endLine: node.loc?.end.line ?? 0,
      metadata: {
        importSource: source,
        isExported: false,
      },
    };
  }

  private collectImportNodes(node: AstNode): AstNode[] {
    const result: AstNode[] = [];
    if (!node.children) return result;

    for (const child of node.children) {
      if (child.type === 'ImportDeclaration') {
        result.push(child);
      }
      result.push(...this.collectImportNodes(child));
    }
    return result;
  }

  private getImportSource(node: AstNode, source: string): string | null {
    const sourceChild = findChildByType(node, 'StringLiteral');
    if (sourceChild) {
      const text = getNodeText(sourceChild, source);
      return text?.replace(/['"]/g, '') ?? null;
    }
    return null;
  }

  private getImportSpecifiers(node: AstNode, source: string): string[] {
    const specifiers: string[] = [];
    if (!node.children) return specifiers;

    for (const child of node.children) {
      if (child.type === 'ImportDefaultSpecifier' && child.children) {
        const id = child.children.find((c) => c.type === 'Identifier');
        if (id) specifiers.push(getNodeText(id, source));
      }
      if (child.type === 'ImportSpecifier' && child.children) {
        const imported = child.children.find(
          (c) => c.type === 'Identifier',
        );
        if (imported) specifiers.push(getNodeText(imported, source));
      }
      if (child.type === 'ImportNamespaceSpecifier' && child.children) {
        const id = child.children.find((c) => c.type === 'Identifier');
        if (id) specifiers.push(`* as ${getNodeText(id, source)}`);
      }
    }
    return specifiers;
  }
}
