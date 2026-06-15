import { describe, it, expect } from 'vitest';
import { AstParserService } from '../../ast-parser/AstParserService.js';
import { FunctionExtractor } from '../FunctionExtractor.js';

describe('FunctionExtractor', () => {
  const extractor = new FunctionExtractor();
  const parser = new AstParserService();

  const baseOptions = {
    repositoryId: 'test-repo',
    fileId: 'test-file',
    filePath: 'test.ts',
    content: '',
    ast: null as any,
    language: 'typescript' as const,
  };

  it('extracts named function declarations', () => {
    const source = `function greet() { return 'hello'; }
function add(a: number, b: number) { return a + b; }`;
    const result = parser.parse(source, 'test.ts');
    expect(result.success).toBe(true);

    const entities = extractor.extract({ ...baseOptions, content: source, ast: result.ast! });
    const names = entities.map((e) => e.name);
    expect(names).toContain('greet');
    expect(names).toContain('add');
    expect(entities.every((e) => e.type === 'FUNCTION')).toBe(true);
  });

  it('extracts arrow functions assigned to variables', () => {
    const source = `const greet = () => 'hello';
const add = (a: number, b: number) => a + b;`;
    const result = parser.parse(source, 'test.ts');
    expect(result.success).toBe(true);

    const entities = extractor.extract({ ...baseOptions, content: source, ast: result.ast! });
    const names = entities.map((e) => e.name);
    expect(names).toContain('greet');
    expect(names).toContain('add');
  });

  it('extracts class methods', () => {
    const source = `class Service {
  handle() { return 'ok'; }
  process(data: string) { return data; }
}`;
    const result = parser.parse(source, 'test.ts');
    expect(result.success).toBe(true);

    const entities = extractor.extract({ ...baseOptions, content: source, ast: result.ast! });
    const names = entities.map((e) => e.name);
    expect(names).toContain('handle');
    expect(names).toContain('process');
  });

  it('marks exported functions', () => {
    const source = `export function greet() { return 'hello'; }
function hidden() { return 42; }`;
    const result = parser.parse(source, 'test.ts');
    expect(result.success).toBe(true);

    const entities = extractor.extract({ ...baseOptions, content: source, ast: result.ast! });
    const greet = entities.find((e) => e.name === 'greet');
    const hidden = entities.find((e) => e.name === 'hidden');
    expect(greet?.metadata?.isExported).toBe(true);
    expect(hidden?.metadata?.isExported).toBe(false);
  });

  it('returns empty array for code with no functions', () => {
    const source = `const x = 42;
const y = 'hello';`;
    const result = parser.parse(source, 'test.ts');
    expect(result.success).toBe(true);

    const entities = extractor.extract({ ...baseOptions, content: source, ast: result.ast! });
    expect(entities).toHaveLength(0);
  });
});
