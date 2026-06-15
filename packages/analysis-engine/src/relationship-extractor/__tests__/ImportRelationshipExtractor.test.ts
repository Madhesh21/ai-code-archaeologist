import { describe, it, expect } from 'vitest';
import { AstParserService } from '../../ast-parser/AstParserService.js';
import { ImportRelationshipExtractor } from '../ImportRelationshipExtractor.js';
import { collectImports } from '../../entity-extractor/ImportExportCollector.js';
import type { ExtractedEntity } from '../../entity-extractor/types.js';

describe('ImportRelationshipExtractor', () => {
  const extractor = new ImportRelationshipExtractor();
  const parser = new AstParserService();

  function createEntity(
    id: string,
    name: string,
  ): ExtractedEntity {
    return {
      id,
      repositoryId: 'test-repo',
      fileId: 'test-file',
      filePath: 'test.ts',
      name,
      type: 'FUNCTION',
      startLine: 1,
      endLine: 1,
      metadata: {},
    };
  }

  it('extracts IMPORTS from named import specifiers', () => {
    const source = `import { AuthService } from './auth';
class LoginService { }`;
    const result = parser.parse(source, 'test.ts');
    expect(result.success).toBe(true);

    const imports = collectImports(result.ast!, source);

    const relationships = extractor.extract({
      repositoryId: 'test-repo',
      filePath: 'test.ts',
      content: source,
      ast: result.ast!,
      entities: [],
      imports,
      exports: [],
    });

    expect(relationships.length).toBeGreaterThanOrEqual(1);
    expect(relationships[0].type).toBe('IMPORTS');
    expect(relationships[0].targetEntityName).toBe('./auth');
    expect(relationships[0].metadata.specifier).toBe('AuthService');
  });

  it('extracts IMPORTS from default imports', () => {
    const source = `import express from 'express';`;
    const result = parser.parse(source, 'test.ts');
    expect(result.success).toBe(true);

    const imports = collectImports(result.ast!, source);

    const relationships = extractor.extract({
      repositoryId: 'test-repo',
      filePath: 'test.ts',
      content: source,
      ast: result.ast!,
      entities: [],
      imports,
      exports: [],
    });

    expect(relationships).toHaveLength(1);
    expect(relationships[0].targetEntityName).toBe('express');
    expect(relationships[0].metadata.specifier).toBe('express');
  });

  it('extracts IMPORTS from namespace imports', () => {
    const source = `import * as utils from './utils';`;
    const result = parser.parse(source, 'test.ts');
    expect(result.success).toBe(true);

    const imports = collectImports(result.ast!, source);

    const relationships = extractor.extract({
      repositoryId: 'test-repo',
      filePath: 'test.ts',
      content: source,
      ast: result.ast!,
      entities: [],
      imports,
      exports: [],
    });

    expect(relationships).toHaveLength(1);
    expect(relationships[0].targetEntityName).toBe('./utils');
    expect(relationships[0].metadata.specifier).toBe('* as utils');
  });

  it('links import specifiers to matching entities', () => {
    const source = `import { Helper } from './helper';`;
    const result = parser.parse(source, 'test.ts');
    expect(result.success).toBe(true);

    const imports = collectImports(result.ast!, source);
    const entities = [createEntity('e1', 'Helper')];

    const relationships = extractor.extract({
      repositoryId: 'test-repo',
      filePath: 'test.ts',
      content: source,
      ast: result.ast!,
      entities,
      imports,
      exports: [],
    });

    expect(relationships).toHaveLength(1);
    expect(relationships[0].sourceEntityId).toBe('e1');
  });

  it('returns empty array when there are no imports', () => {
    const source = `const x = 1;`;
    const result = parser.parse(source, 'test.ts');
    expect(result.success).toBe(true);

    const imports = collectImports(result.ast!, source);

    const relationships = extractor.extract({
      repositoryId: 'test-repo',
      filePath: 'test.ts',
      content: source,
      ast: result.ast!,
      entities: [],
      imports,
      exports: [],
    });

    expect(relationships).toHaveLength(0);
  });

  it('handles multiple imports from different sources', () => {
    const source = `import { a } from './a';
import { b } from './b';
import { c } from './c';`;
    const result = parser.parse(source, 'test.ts');
    expect(result.success).toBe(true);

    const imports = collectImports(result.ast!, source);

    const relationships = extractor.extract({
      repositoryId: 'test-repo',
      filePath: 'test.ts',
      content: source,
      ast: result.ast!,
      entities: [],
      imports,
      exports: [],
    });

    expect(relationships).toHaveLength(3);
    const targets = relationships.map((r) => r.targetEntityName);
    expect(targets).toContain('./a');
    expect(targets).toContain('./b');
    expect(targets).toContain('./c');
  });
});
