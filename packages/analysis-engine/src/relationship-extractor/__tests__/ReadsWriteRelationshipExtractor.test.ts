import { describe, it, expect } from 'vitest';
import { AstParserService } from '../../ast-parser/AstParserService.js';
import { ReadsWriteRelationshipExtractor } from '../ReadsWriteRelationshipExtractor.js';
import type { ExtractedEntity } from '../../entity-extractor/types.js';

describe('ReadsWriteRelationshipExtractor', () => {
  const extractor = new ReadsWriteRelationshipExtractor();
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

  it('returns empty array when there are no read/write calls', () => {
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

  it('returns empty array for unknown function calls', () => {
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
    const source = `function foo() { fs.readFileSync('/tmp/file'); }`;
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

  it('extracts READS when entities call readFileSync', () => {
    const source = `import fs from 'fs';
function loadConfig() {
  const data = fs.readFileSync('/etc/config.json', 'utf-8');
  return JSON.parse(data);
}`;
    const result = parser.parse(source, 'test.ts');
    expect(result.success).toBe(true);

    const entities = [createEntity('1', 'loadConfig', 2, 4)];

    const relationships = extractor.extract({
      repositoryId: 'test-repo',
      filePath: 'test.ts',
      content: source,
      ast: result.ast!,
      entities,
      imports: [],
      exports: [],
    });

    expect(relationships.length).toBeGreaterThanOrEqual(1);
    const reads = relationships.filter((r) => r.type === 'READS');
    expect(reads.length).toBeGreaterThanOrEqual(1);
  });

  it('extracts WRITES when entities call writeFileSync', () => {
    const source = `import fs from 'fs';
function saveConfig() {
  fs.writeFileSync('/etc/config.json', JSON.stringify(data));
}`;
    const result = parser.parse(source, 'test.ts');
    expect(result.success).toBe(true);

    const entities = [createEntity('1', 'saveConfig', 2, 4)];

    const relationships = extractor.extract({
      repositoryId: 'test-repo',
      filePath: 'test.ts',
      content: source,
      ast: result.ast!,
      entities,
      imports: [],
      exports: [],
    });

    expect(relationships.length).toBeGreaterThanOrEqual(1);
    const writes = relationships.filter((r) => r.type === 'WRITES');
    expect(writes.length).toBeGreaterThanOrEqual(1);
  });
});
