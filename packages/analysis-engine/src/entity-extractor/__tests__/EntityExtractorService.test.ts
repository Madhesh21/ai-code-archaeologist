import { describe, it, expect } from 'vitest';
import { AstParserService } from '../../ast-parser/AstParserService.js';
import { EntityExtractorService } from '../EntityExtractorService.js';

describe('EntityExtractorService', () => {
  const extractor = new EntityExtractorService();
  const parser = new AstParserService();

  it('extracts entities from a file with functions and classes', () => {
    const source = `function greet() { return 'hello'; }
class UserService {
  find() {}
}`;
    const parseResult = parser.parse(source, 'test.ts');
    expect(parseResult.success).toBe(true);

    const result = extractor.extractFromFile({
      fileId: 'test-file',
      filePath: 'test.ts',
      content: source,
      parseResult,
      language: 'typescript',
    });

    const types = result.entities.map((e) => e.type);
    expect(types).toContain('FUNCTION');
    expect(types).toContain('CLASS');
    expect(types).toContain('SERVICE');
  });

  it('extracts imports from a file', () => {
    const source = `import { useState } from 'react';
import express from 'express';
function App() {}`;
    const parseResult = parser.parse(source, 'test.ts');
    expect(parseResult.success).toBe(true);

    const result = extractor.extractFromFile({
      fileId: 'test-file',
      filePath: 'test.ts',
      content: source,
      parseResult,
      language: 'typescript',
    });

    expect(result.imports.length).toBeGreaterThanOrEqual(2);
    const sources = result.imports.map((i) => i.source);
    expect(sources).toContain('react');
    expect(sources).toContain('express');
  });

  it('extracts exports from a file', () => {
    const source = `export function greet() { return 'hello'; }
export const name = 'test';`;
    const parseResult = parser.parse(source, 'test.ts');
    expect(parseResult.success).toBe(true);

    const result = extractor.extractFromFile({
      fileId: 'test-file',
      filePath: 'test.ts',
      content: source,
      parseResult,
      language: 'typescript',
    });

    expect(result.exports.length).toBeGreaterThanOrEqual(2);
    const names = result.exports.map((e) => e.name);
    expect(names).toContain('greet');
  });

  it('handles failed parse result gracefully', () => {
    const source = `const x = ;`; // intentionally invalid
    const parseResult = parser.parse(source, 'test.ts');
    expect(parseResult.success).toBe(false);

    const result = extractor.extractFromFile({
      fileId: 'test-file',
      filePath: 'test.ts',
      content: source,
      parseResult,
      language: 'typescript',
    });

    expect(result.entities).toHaveLength(0);
    expect(result.imports).toHaveLength(0);
  });

  it('extracts from multiple files and assigns repositoryId', () => {
    const source1 = `function foo() {}`;
    const source2 = `function bar() {}`;

    const parseResult1 = parser.parse(source1, 'test1.ts');
    const parseResult2 = parser.parse(source2, 'test2.ts');

    const result = extractor.extractFromFiles(
      [
        {
          fileId: 'f1',
          filePath: 'test1.ts',
          content: source1,
          parseResult: parseResult1,
          language: 'typescript' as const,
        },
        {
          fileId: 'f2',
          filePath: 'test2.ts',
          content: source2,
          parseResult: parseResult2,
          language: 'typescript' as const,
        },
      ],
      'test-repo',
    );

    expect(result.entities).toHaveLength(2);
    for (const entity of result.entities) {
      expect(entity.repositoryId).toBe('test-repo');
    }
  });
});
