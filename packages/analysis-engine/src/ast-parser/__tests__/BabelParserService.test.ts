import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { BabelParserService } from '../BabelParserService.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(__dirname, 'fixtures');

function loadFixture(name: string): string {
  return readFileSync(join(fixturesDir, name), 'utf-8');
}

describe('BabelParserService', () => {
  const service = new BabelParserService();

  describe('supports', () => {
    it('supports .js files', () => {
      expect(service.supports('test.js')).toBe(true);
    });

    it('supports .jsx files', () => {
      expect(service.supports('test.jsx')).toBe(true);
    });

    it('supports .mjs files', () => {
      expect(service.supports('test.mjs')).toBe(true);
    });

    it('supports .cjs files', () => {
      expect(service.supports('test.cjs')).toBe(true);
    });

    it('supports .ts files', () => {
      expect(service.supports('test.ts')).toBe(true);
    });

    it('supports .tsx files', () => {
      expect(service.supports('test.tsx')).toBe(true);
    });

    it('does not support .css files', () => {
      expect(service.supports('style.css')).toBe(false);
    });

    it('does not support .json files', () => {
      expect(service.supports('data.json')).toBe(false);
    });
  });

  describe('parse', () => {
    it('parses a JavaScript file with functions and classes', () => {
      const source = loadFixture('sample.js');
      const result = service.parse(source, 'sample.js');

      expect(result.success).toBe(true);
      expect(result.ast).not.toBeNull();
      expect(result.error).toBeNull();
      expect(result.filePath).toBe('sample.js');
      expect(result.language).toBe('javascript');
    });

    it('parses a JSX file with React components', () => {
      const source = loadFixture('sample.jsx');
      const result = service.parse(source, 'sample.jsx');

      expect(result.success).toBe(true);
      expect(result.ast).not.toBeNull();
      expect(result.error).toBeNull();
      expect(result.language).toBe('javascript');
    });

    it('parses a TypeScript file with interfaces and enums', () => {
      const source = loadFixture('sample.ts');
      const result = service.parse(source, 'sample.ts');

      expect(result.success).toBe(true);
      expect(result.ast).not.toBeNull();
      expect(result.error).toBeNull();
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

    it('returns parse error for invalid syntax', () => {
      const source = loadFixture('invalid.js');
      const result = service.parse(source, 'invalid.js');

      expect(result.success).toBe(false);
      expect(result.ast).toBeNull();
      expect(result.error).not.toBeNull();
      expect(result.error!.message).toBeTruthy();
      expect(result.error!.line).toBeGreaterThan(0);
    });

    it('generates AST nodes with location information', () => {
      const source = 'function foo() { return 42; }';
      const result = service.parse(source, 'test.js');

      expect(result.success).toBe(true);
      expect(result.ast!.type).toBe('File');
      expect(result.ast!.loc.start.line).toBe(1);
      expect(result.ast!.children.length).toBeGreaterThan(0);
    });

    it('handles empty source', () => {
      const result = service.parse('', 'empty.js');
      expect(result.success).toBe(true);
      expect(result.ast).not.toBeNull();
    });

    it('handles module with import/export statements', () => {
      const source = `
        import { useState } from 'react';
        export const App = () => null;
      `;
      const result = service.parse(source, 'module.jsx');
      expect(result.success).toBe(true);
      expect(result.ast).not.toBeNull();
    });
  });

  describe('language detection', () => {
    it('detects JavaScript for .js files', () => {
      const result = service.parse('const x = 1;', 'file.js');
      expect(result.language).toBe('javascript');
    });

    it('detects TypeScript for .ts files', () => {
      const result = service.parse('const x: number = 1;', 'file.ts');
      expect(result.language).toBe('typescript');
    });
  });
});
