import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { TypeScriptParserService } from '../TypeScriptParserService.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(__dirname, 'fixtures');

function loadFixture(name: string): string {
  return readFileSync(join(fixturesDir, name), 'utf-8');
}

describe('TypeScriptParserService', () => {
  const service = new TypeScriptParserService();

  describe('supports', () => {
    it('supports .ts files', () => {
      expect(service.supports('test.ts')).toBe(true);
    });

    it('supports .tsx files', () => {
      expect(service.supports('test.tsx')).toBe(true);
    });

    it('supports .mts files', () => {
      expect(service.supports('test.mts')).toBe(true);
    });

    it('supports .cts files', () => {
      expect(service.supports('test.cts')).toBe(true);
    });

    it('does not support .js files', () => {
      expect(service.supports('test.js')).toBe(false);
    });

    it('does not support .jsx files', () => {
      expect(service.supports('test.jsx')).toBe(false);
    });

    it('does not support .css files', () => {
      expect(service.supports('style.css')).toBe(false);
    });
  });

  describe('parse', () => {
    it('parses a TypeScript file with interfaces and enums', () => {
      const source = loadFixture('sample.ts');
      const result = service.parse(source, 'sample.ts');

      expect(result.success).toBe(true);
      expect(result.ast).not.toBeNull();
      expect(result.error).toBeNull();
      expect(result.filePath).toBe('sample.ts');
      expect(result.language).toBe('typescript');
    });

    it('parses a TSX file with typed React components', () => {
      const source = loadFixture('sample.tsx');
      const result = service.parse(source, 'sample.tsx');

      expect(result.success).toBe(true);
      expect(result.ast).not.toBeNull();
      expect(result.error).toBeNull();
      expect(result.language).toBe('typescript');
    });

    it('returns parse error for invalid TypeScript syntax', () => {
      const source = 'function broken( {: number ';
      const result = service.parse(source, 'broken.ts');

      expect(result.success).toBe(false);
      expect(result.ast).toBeNull();
      expect(result.error).not.toBeNull();
      expect(result.error!.message).toBeTruthy();
    });

    it('generates AST nodes with location information', () => {
      const source = 'function greet(name: string): void {}';
      const result = service.parse(source, 'greet.ts');

      expect(result.success).toBe(true);
      expect(result.ast!.type).toBe('SourceFile');
      expect(result.ast!.children.length).toBeGreaterThan(0);
    });

    it('handles empty source', () => {
      const result = service.parse('', 'empty.ts');
      expect(result.success).toBe(true);
      expect(result.ast).not.toBeNull();
    });

    it('handles module with import/export statements', () => {
      const source = `
        import { useState } from 'react';
        export const App: React.FC = () => null;
      `;
      const result = service.parse(source, 'module.tsx');
      expect(result.success).toBe(true);
      expect(result.ast).not.toBeNull();
    });

    it('correctly identifies node types in parsed AST', () => {
      const source = `
        interface User { name: string; }
        class Service implements User {}
      `;
      const result = service.parse(source, 'types.ts');
      expect(result.success).toBe(true);

      const typeNames = collectChildTypes(result.ast!);
      expect(typeNames).toContain('InterfaceDeclaration');
      expect(typeNames).toContain('ClassDeclaration');
    });
  });

  describe('language', () => {
    it('always returns typescript', () => {
      const result = service.parse('const x = 1;', 'file.ts');
      expect(result.language).toBe('typescript');
    });
  });
});

interface CollectibleNode {
  type: string;
  children: CollectibleNode[];
}

function collectChildTypes(node: CollectibleNode): string[] {
  const types: string[] = [];
  for (const child of node.children) {
    types.push(child.type);
    types.push(...collectChildTypes(child));
  }
  return types;
}
