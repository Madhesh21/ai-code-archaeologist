import { describe, it, expect } from 'vitest';
import { AstParserService } from '../../ast-parser/AstParserService.js';
import { ClassExtractor } from '../ClassExtractor.js';

describe('ClassExtractor', () => {
  const extractor = new ClassExtractor();
  const parser = new AstParserService();

  const baseOptions = {
    repositoryId: 'test-repo',
    fileId: 'test-file',
    filePath: 'test.ts',
    content: '',
    ast: null as any,
    language: 'typescript' as const,
  };

  it('extracts class declarations', () => {
    const source = `class UserService {}
class ProductService {}`;
    const result = parser.parse(source, 'test.ts');
    expect(result.success).toBe(true);

    const entities = extractor.extract({ ...baseOptions, content: source, ast: result.ast! });
    const names = entities.map((e) => e.name);
    expect(names).toContain('UserService');
    expect(names).toContain('ProductService');
    expect(entities.every((e) => e.type === 'CLASS')).toBe(true);
  });

  it('detects parent class (extends)', () => {
    const source = `class AdminController extends BaseController {}`;
    const result = parser.parse(source, 'test.ts');
    expect(result.success).toBe(true);

    const entities = extractor.extract({ ...baseOptions, content: source, ast: result.ast! });
    expect(entities).toHaveLength(1);
    expect(entities[0].metadata?.parentClass).toBe('BaseController');
  });

  it('detects implemented interfaces', () => {
    const source = `class UserRepository implements IUserRepository {}`;
    const result = parser.parse(source, 'test.ts');
    expect(result.success).toBe(true);

    const entities = extractor.extract({ ...baseOptions, content: source, ast: result.ast! });
    expect(entities).toHaveLength(1);
    const impl = entities[0].metadata?.implements as string[];
    expect(impl).toContain('IUserRepository');
  });

  it('extracts class methods', () => {
    const source = `class Service {
  find() {}
  save() {}
}`;
    const result = parser.parse(source, 'test.ts');
    expect(result.success).toBe(true);

    const entities = extractor.extract({ ...baseOptions, content: source, ast: result.ast! });
    const methods = entities[0].metadata?.methods as string[];
    expect(methods).toContain('find');
    expect(methods).toContain('save');
  });

  it('returns empty array for code with no classes', () => {
    const source = `function foo() {}`;
    const result = parser.parse(source, 'test.ts');
    expect(result.success).toBe(true);

    const entities = extractor.extract({ ...baseOptions, content: source, ast: result.ast! });
    expect(entities).toHaveLength(0);
  });
});
