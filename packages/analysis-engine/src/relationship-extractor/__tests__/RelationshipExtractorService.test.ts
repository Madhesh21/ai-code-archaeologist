import { describe, it, expect } from 'vitest';
import { AstParserService } from '../../ast-parser/AstParserService.js';
import { RelationshipExtractorService } from '../RelationshipExtractorService.js';
import { collectImports } from '../../entity-extractor/ImportExportCollector.js';
import type { RelationshipExtractionInput } from '../RelationshipExtractorService.js';

describe('RelationshipExtractorService', () => {
  const service = new RelationshipExtractorService();
  const parser = new AstParserService();

  function makeInput(
    filePath: string,
    content: string,
  ): RelationshipExtractionInput {
    const parseResult = parser.parse(content, filePath);
    return {
      fileId: 'file-1',
      filePath,
      content,
      parseResult,
      entities: [],
      imports: parseResult.ast ? collectImports(parseResult.ast, content) : [],
      exports: [],
    };
  }

  describe('extractFromFile', () => {
    it('extracts relationships from a file', () => {
      const source = `import { helper } from './helper';
class Base {}
class Derived extends Base {}`;
      const input = makeInput('test.ts', source);
      const result = service.extractFromFile(input);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      const types = result.map((r) => r.type);
      expect(types).toContain('IMPORTS');
      expect(types).toContain('EXTENDS');
    });

    it('returns empty array when parse fails', () => {
      const input = makeInput('broken.js', 'function broken( {');
      const result = service.extractFromFile(input);
      expect(result).toHaveLength(0);
    });

    it('returns empty array for file with no relationships', () => {
      const source = `const x = 42;`;
      const input = makeInput('test.ts', source);
      const result = service.extractFromFile(input);
      expect(result).toHaveLength(0);
    });
  });

  describe('extractFromFiles', () => {
    it('extracts relationships from multiple files', () => {
      const inputs = [
        makeInput('a.ts', 'function foo() { bar(); } function bar() { }'),
        makeInput('b.ts', 'class Base {} class Derived extends Base {}'),
      ];

      const result = service.extractFromFiles(inputs, 'repo-1');
      expect(result.relationships.length).toBeGreaterThan(0);
      expect(result.errors).toHaveLength(0);

      for (const rel of result.relationships) {
        expect(rel.repositoryId).toBe('repo-1');
      }
    });

    it('handles empty input array', () => {
      const result = service.extractFromFiles([], 'repo-1');
      expect(result.relationships).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
    });

    it('continues processing when one file fails', () => {
      const inputs = [
        makeInput('good.ts', 'const x = 1;'),
        { ...makeInput('bad.js', 'broken {('), fileId: 'bad-file' },
      ];

      const result = service.extractFromFiles(inputs, 'repo-1');
      expect(result.relationships).toHaveLength(0);
    });

    it('assigns repositoryId to all relationships', () => {
      const inputs = [
        makeInput('a.ts', 'class Base {} class Derived extends Base {}'),
      ];

      const result = service.extractFromFiles(inputs, 'my-repo');
      for (const rel of result.relationships) {
        expect(rel.repositoryId).toBe('my-repo');
      }
    });
  });
});
