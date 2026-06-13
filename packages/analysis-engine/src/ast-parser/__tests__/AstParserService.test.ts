import { describe, it, expect } from 'vitest';
import { AstParserService } from '../AstParserService.js';

describe('AstParserService', () => {
  const service = new AstParserService();

  describe('parse', () => {
    it('parses JavaScript files using Babel', () => {
      const result = service.parse('const x = 1;', 'test.js');
      expect(result.success).toBe(true);
      expect(result.ast).not.toBeNull();
      expect(result.language).toBe('javascript');
    });

    it('parses JSX files using Babel', () => {
      const result = service.parse('const App = () => <div />;', 'test.jsx');
      expect(result.success).toBe(true);
      expect(result.language).toBe('javascript');
    });

    it('parses TypeScript files using TypeScript compiler', () => {
      const result = service.parse('const x: number = 1;', 'test.ts');
      expect(result.success).toBe(true);
      expect(result.language).toBe('typescript');
    });

    it('parses TSX files using TypeScript compiler', () => {
      const result = service.parse('const App: React.FC = () => <div />;', 'test.tsx');
      expect(result.success).toBe(true);
      expect(result.language).toBe('typescript');
    });

    it('parses .mjs files using Babel', () => {
      const result = service.parse('export const x = 1;', 'test.mjs');
      expect(result.success).toBe(true);
      expect(result.language).toBe('javascript');
    });

    it('parses .cjs files using Babel', () => {
      const result = service.parse('module.exports = {};', 'test.cjs');
      expect(result.success).toBe(true);
      expect(result.language).toBe('javascript');
    });

    it('parses .mts files using TypeScript compiler', () => {
      const result = service.parse('export const x: number = 1;', 'test.mts');
      expect(result.success).toBe(true);
      expect(result.language).toBe('typescript');
    });

    it('parses .cts files using TypeScript compiler', () => {
      const result = service.parse('export const x: number = 1;', 'test.cts');
      expect(result.success).toBe(true);
      expect(result.language).toBe('typescript');
    });

    it('handles invalid syntax gracefully', () => {
      const result = service.parse('function broken( {', 'broken.js');
      expect(result.success).toBe(false);
      expect(result.ast).toBeNull();
      expect(result.error).not.toBeNull();
    });

    it('handles invalid TypeScript syntax gracefully', () => {
      const result = service.parse('const x: = 1;', 'broken.ts');
      expect(result.success).toBe(false);
      expect(result.ast).toBeNull();
      expect(result.error).not.toBeNull();
    });

    it('handles empty files', () => {
      const result = service.parse('', 'empty.js');
      expect(result.success).toBe(true);
      expect(result.ast).not.toBeNull();
    });
  });

  describe('parseAll', () => {
    it('parses multiple files', () => {
      const files = [
        { path: 'a.js', content: 'const a = 1;' },
        { path: 'b.ts', content: 'const b: number = 2;' },
        { path: 'c.jsx', content: 'const C = () => <div />;' },
      ];

      const results = service.parseAll(files);

      expect(results).toHaveLength(3);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(true);
      expect(results[2].success).toBe(true);
    });

    it('continues parsing when one file fails', () => {
      const files = [
        { path: 'good.js', content: 'const x = 1;' },
        { path: 'bad.js', content: 'function broken( {' },
        { path: 'good.ts', content: 'const y: string = "hello";' },
      ];

      const results = service.parseAll(files);

      expect(results).toHaveLength(3);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
      expect(results[2].success).toBe(true);
    });

    it('handles empty file list', () => {
      const results = service.parseAll([]);
      expect(results).toHaveLength(0);
    });

    it('returns correct file paths in results', () => {
      const files = [
        { path: 'src/index.ts', content: 'export const x = 1;' },
      ];

      const results = service.parseAll(files);

      expect(results[0].filePath).toBe('src/index.ts');
    });
  });
});
