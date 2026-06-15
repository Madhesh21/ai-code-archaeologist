import type { AstNode } from '../ast-parser/types.js';
import { getNodeText, findChildByType } from './SourceHelper.js';

export interface ImportInfo {
  source: string;
  specifiers: string[];
  startLine: number;
  endLine: number;
}

export interface ExportInfo {
  name: string;
  isDefault: boolean;
  startLine: number;
  endLine: number;
}

export function collectImports(node: AstNode, source: string): ImportInfo[] {
  const result: ImportInfo[] = [];
  if (!node.children) return result;

  for (const child of node.children) {
    if (child.type === 'ImportDeclaration') {
      const sourceNode = findChildByType(child, 'StringLiteral');
      const importSource = sourceNode
        ? (getNodeText(sourceNode, source)?.replace(/['"]/g, '') ?? '')
        : '';

      const specifiers: string[] = [];
      if (child.children) {
        for (const spec of child.children) {
          if (spec.type === 'ImportDefaultSpecifier') {
            const id = findChildByType(spec, 'Identifier');
            if (id) specifiers.push(getNodeText(id, source));
          } else if (spec.type === 'ImportSpecifier') {
            const id = findChildByType(spec, 'Identifier');
            if (id) specifiers.push(getNodeText(id, source));
          } else if (spec.type === 'ImportNamespaceSpecifier') {
            const id = findChildByType(spec, 'Identifier');
            if (id) specifiers.push(`* as ${getNodeText(id, source)}`);
          } else if (spec.type === 'ImportClause' && spec.children) {
            for (const clauseChild of spec.children) {
              if (clauseChild.type === 'NamedImports' && clauseChild.children) {
                for (const namedImport of clauseChild.children) {
                  if (namedImport.type === 'ImportSpecifier') {
                    const id = findChildByType(namedImport, 'Identifier');
                    if (id) specifiers.push(getNodeText(id, source));
                  }
                }
              } else if (clauseChild.type === 'NamespaceImport' && clauseChild.children) {
                const id = clauseChild.children.find((c) => c.type === 'Identifier');
                if (id) specifiers.push(`* as ${getNodeText(id, source)}`);
              } else if (clauseChild.type === 'Identifier') {
                specifiers.push(getNodeText(clauseChild, source));
              }
            }
          }
        }
      }

      result.push({
        source: importSource,
        specifiers,
        startLine: child.loc?.start.line ?? 0,
        endLine: child.loc?.end.line ?? 0,
      });
    }

    result.push(...collectImports(child, source));
  }

  return result;
}

export function collectExports(node: AstNode, source: string): ExportInfo[] {
  const result: ExportInfo[] = [];
  if (!node.children) return result;

  const addExport = (name: string, isDefault: boolean, line: number, endLine: number) => {
    result.push({ name, isDefault, startLine: line, endLine });
  };

  for (const child of node.children) {
    if (child.type === 'ExportNamedDeclaration' && child.children) {
      for (const decl of child.children) {
        if (decl.type === 'VariableDeclaration' && decl.children) {
          for (const vDecl of decl.children) {
            if (vDecl.type === 'VariableDeclarator') {
              const id = findChildByType(vDecl, 'Identifier');
              if (id) {
                addExport(getNodeText(id, source), false, child.loc?.start.line ?? 0, child.loc?.end.line ?? 0);
              }
            }
          }
        }
        const id = findChildByType(decl, 'Identifier');
        if (id) {
          addExport(getNodeText(id, source), false, child.loc?.start.line ?? 0, child.loc?.end.line ?? 0);
        }
      }
    } else if (child.type === 'ExportDefaultDeclaration') {
      if (child.children && child.children[0]) {
        const expr = child.children[0];
        const id = findChildByType(expr, 'Identifier');
        addExport(id ? getNodeText(id, source) : 'default', true, child.loc?.start.line ?? 0, child.loc?.end.line ?? 0);
      } else {
        addExport('default', true, child.loc?.start.line ?? 0, child.loc?.end.line ?? 0);
      }
    } else if (child.type === 'ExportAllDeclaration') {
      const sourceNode = findChildByType(child, 'StringLiteral');
      addExport(
        sourceNode ? `* from ${getNodeText(sourceNode, source)?.replace(/['"]/g, '') ?? ''}` : '*',
        false,
        child.loc?.start.line ?? 0,
        child.loc?.end.line ?? 0,
      );
    } else if (child.children?.some((c) => c.type === 'ExportKeyword')) {
      const hasDefault = child.children.some((c) => c.type === 'DefaultKeyword');
      if (child.type === 'FirstStatement') {
        for (const inner of child.children) {
          if (inner.type === 'VariableDeclarationList' && inner.children) {
            for (const vd of inner.children) {
              if (vd.type === 'VariableDeclaration' && vd.children) {
                const id = vd.children.find((c) => c.type === 'Identifier');
                if (id) {
                  addExport(getNodeText(id, source), hasDefault, child.loc?.start.line ?? 0, child.loc?.end.line ?? 0);
                }
              }
            }
          }
        }
      } else {
        const id = findChildByType(child, 'Identifier');
        if (id) {
          addExport(getNodeText(id, source), hasDefault, child.loc?.start.line ?? 0, child.loc?.end.line ?? 0);
        }
        if (hasDefault) {
          addExport('default', true, child.loc?.start.line ?? 0, child.loc?.end.line ?? 0);
        }
      }
    }

    result.push(...collectExports(child, source));
  }

  return result;
}
