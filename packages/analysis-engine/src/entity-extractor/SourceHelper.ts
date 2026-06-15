import type { AstNode } from '../ast-parser/types.js';

export function getNodeText(node: AstNode, source: string): string {
  if (!node.loc) return '';
  const lines = source.split('\n');
  const startLine = node.loc.start.line - 1;
  const endLine = node.loc.end.line - 1;

  if (startLine < 0 || startLine >= lines.length) return '';

  if (startLine === endLine) {
    const line = lines[startLine];
    return line.slice(node.loc.start.column, node.loc.end.column).trim();
  }

  const parts: string[] = [];
  for (let i = startLine; i <= endLine && i < lines.length; i++) {
    const line = lines[i];
    if (i === startLine) {
      parts.push(line.slice(node.loc.start.column));
    } else if (i === endLine) {
      parts.push(line.slice(0, node.loc.end.column));
    } else {
      parts.push(line);
    }
  }
  return parts.join('\n').trim();
}

export function findChildByType(node: AstNode, type: string): AstNode | undefined {
  if (!node.children) return undefined;
  return node.children.find((c) => c.type === type);
}

export function findChildrenByType(node: AstNode, type: string): AstNode[] {
  if (!node.children) return [];
  return node.children.filter((c) => c.type === type);
}

export function extractIdentifierName(
  node: AstNode,
  source: string,
): string | null {
  const idChild = findChildByType(node, 'Identifier');
  if (idChild) {
    return getNodeText(idChild, source);
  }

  const keyChild = findChildByType(node, 'Identifier');
  if (keyChild) {
    return getNodeText(keyChild, source);
  }

  return null;
}

export function extractNameFromStringLiteral(
  node: AstNode,
  source: string,
): string | null {
  if (node.type === 'StringLiteral') {
    const text = getNodeText(node, source);
    return text.replace(/['"]/g, '');
  }
  return null;
}
