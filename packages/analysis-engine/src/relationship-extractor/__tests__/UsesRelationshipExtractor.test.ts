import { describe, it, expect } from 'vitest';
import { AstParserService } from '../../ast-parser/AstParserService.js';
import { UsesRelationshipExtractor } from '../UsesRelationshipExtractor.js';
import type { ExtractedEntity } from '../../entity-extractor/types.js';

describe('UsesRelationshipExtractor', () => {
  const extractor = new UsesRelationshipExtractor();
  const parser = new AstParserService();

  function createEntity(
    id: string,
    name: string,
    startLine: number,
    endLine: number,
  ): ExtractedEntity {
    return {
      id,
      repositoryId: 'test-repo',
      fileId: 'test-file',
      filePath: 'test.ts',
      name,
      type: 'CLASS',
      startLine,
      endLine,
      metadata: {},
    };
  }

  it('returns empty array when no type references exist', () => {
    const source = `const x = 42;`;
    const result = parser.parse(source, 'test.ts');
    expect(result.success).toBe(true);

    const relationships = extractor.extract({
      repositoryId: 'test-repo',
      filePath: 'test.ts',
      content: source,
      ast: result.ast!,
      entities: [],
      imports: [],
      exports: [],
    });

    expect(relationships).toHaveLength(0);
  });

  it('returns empty array when no entities match type references', () => {
    const source = `const x: number = 42;`;
    const result = parser.parse(source, 'test.ts');
    expect(result.success).toBe(true);

    const relationships = extractor.extract({
      repositoryId: 'test-repo',
      filePath: 'test.ts',
      content: source,
      ast: result.ast!,
      entities: [],
      imports: [],
      exports: [],
    });

    expect(relationships).toHaveLength(0);
  });

  it('handles empty entities array', () => {
    const source = `function greet(name: string): void {}`;
    const result = parser.parse(source, 'test.ts');
    expect(result.success).toBe(true);

    const relationships = extractor.extract({
      repositoryId: 'test-repo',
      filePath: 'test.ts',
      content: source,
      ast: result.ast!,
      entities: [],
      imports: [],
      exports: [],
    });

    expect(relationships).toHaveLength(0);
  });

  it('returns empty array for code with no entities at all', () => {
    const source = ``;
    const result = parser.parse(source, 'test.ts');
    expect(result.success).toBe(true);

    const relationships = extractor.extract({
      repositoryId: 'test-repo',
      filePath: 'test.ts',
      content: source,
      ast: result.ast!,
      entities: [],
      imports: [],
      exports: [],
    });

    expect(relationships).toHaveLength(0);
  });
});
