import { describe, it, expect } from 'vitest';
import { AstParserService } from '../../ast-parser/AstParserService.js';
import { DependsOnRelationshipExtractor } from '../DependsOnRelationshipExtractor.js';
import { collectImports } from '../../entity-extractor/ImportExportCollector.js';

describe('DependsOnRelationshipExtractor', () => {
  const extractor = new DependsOnRelationshipExtractor();
  const parser = new AstParserService();

  it('extracts DEPENDS_ON for external package imports', () => {
    const source = `import express from 'express';
import { Router } from 'express';`;
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
    const expressRels = relationships.filter((r) => r.targetEntityName === 'express');
    expect(expressRels.length).toBeGreaterThanOrEqual(1);
    expect(expressRels[0].type).toBe('DEPENDS_ON');
  });

  it('ignores relative imports', () => {
    const source = `import { helper } from './helper';`;
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

  it('ignores node: prefix imports', () => {
    const source = `import * as fs from 'node:fs';`;
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

  it('returns empty array for code with no imports', () => {
    const source = `const x = 42;`;
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

  it('extracts DEPENDS_ON for multiple external packages', () => {
    const source = `import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';`;
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

    const targets = relationships.map((r) => r.targetEntityName);
    expect(targets).toContain('express');
    expect(targets).toContain('mongoose');
    expect(targets).toContain('cors');
  });

  it('handles empty imports array gracefully', () => {
    const relationships = extractor.extract({
      repositoryId: 'test-repo',
      filePath: 'test.ts',
      content: '',
      ast: { type: 'Program', loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } }, children: [], rawNode: null },
      entities: [],
      imports: [],
      exports: [],
    });

    expect(relationships).toHaveLength(0);
  });
});
