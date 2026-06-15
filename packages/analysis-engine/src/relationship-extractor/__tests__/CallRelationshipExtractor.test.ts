import { describe, it, expect } from 'vitest';
import { AstParserService } from '../../ast-parser/AstParserService.js';
import { CallRelationshipExtractor } from '../CallRelationshipExtractor.js';
import type { ExtractedEntity } from '../../entity-extractor/types.js';

describe('CallRelationshipExtractor', () => {
  const extractor = new CallRelationshipExtractor();
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
      type: 'FUNCTION',
      startLine,
      endLine,
      metadata: {},
    };
  }

  it('extracts CALLS when a function calls another known function', () => {
    const source = `function greet() { return 'hello'; }
function main() { greet(); }`;
    const result = parser.parse(source, 'test.ts');
    expect(result.success).toBe(true);

    const entities = [
      createEntity('1', 'greet', 1, 1),
      createEntity('2', 'main', 2, 2),
    ];

    const relationships = extractor.extract({
      repositoryId: 'test-repo',
      filePath: 'test.ts',
      content: source,
      ast: result.ast!,
      entities,
      imports: [],
      exports: [],
    });

    expect(relationships).toHaveLength(1);
    expect(relationships[0].type).toBe('CALLS');
    expect(relationships[0].targetEntityName).toBe('greet');
    expect(relationships[0].sourceEntityName).toBe('main');
  });

  it('extracts multiple CALLS relationships', () => {
    const source = `function a() { return 1; }
function b() { a(); }
function c() { a(); b(); }`;
    const result = parser.parse(source, 'test.ts');
    expect(result.success).toBe(true);

    const entities = [
      createEntity('1', 'a', 1, 1),
      createEntity('2', 'b', 2, 2),
      createEntity('3', 'c', 3, 3),
    ];

    const relationships = extractor.extract({
      repositoryId: 'test-repo',
      filePath: 'test.ts',
      content: source,
      ast: result.ast!,
      entities,
      imports: [],
      exports: [],
    });

    expect(relationships.length).toBeGreaterThanOrEqual(3);
    const callPairs = relationships.map((r) => ({
      source: r.sourceEntityName,
      target: r.targetEntityName,
    }));
    expect(callPairs).toContainEqual({ source: 'b', target: 'a' });
    expect(callPairs).toContainEqual({ source: 'c', target: 'a' });
    expect(callPairs).toContainEqual({ source: 'c', target: 'b' });
  });

  it('does not create relationships for unknown function calls', () => {
    const source = `function main() { unknownFunc(); }`;
    const result = parser.parse(source, 'test.ts');
    expect(result.success).toBe(true);

    const entities = [createEntity('1', 'main', 1, 1)];

    const relationships = extractor.extract({
      repositoryId: 'test-repo',
      filePath: 'test.ts',
      content: source,
      ast: result.ast!,
      entities,
      imports: [],
      exports: [],
    });

    expect(relationships).toHaveLength(0);
  });

  it('returns empty array when no entities exist', () => {
    const source = `function foo() { bar(); }`;
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

  it('returns empty array for code with no function calls', () => {
    const source = `const x = 42;
const y = 'hello';`;
    const result = parser.parse(source, 'test.ts');
    expect(result.success).toBe(true);

    const entities = [
      createEntity('1', 'x', 1, 1),
      createEntity('2', 'y', 2, 2),
    ];

    const relationships = extractor.extract({
      repositoryId: 'test-repo',
      filePath: 'test.ts',
      content: source,
      ast: result.ast!,
      entities,
      imports: [],
      exports: [],
    });

    expect(relationships).toHaveLength(0);
  });
});
