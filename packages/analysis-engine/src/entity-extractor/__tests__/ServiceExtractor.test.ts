import { describe, it, expect } from 'vitest';
import { AstParserService } from '../../ast-parser/AstParserService.js';
import { ServiceExtractor } from '../ServiceExtractor.js';

describe('ServiceExtractor', () => {
  const extractor = new ServiceExtractor();
  const parser = new AstParserService();

  const baseOptions = {
    repositoryId: 'test-repo',
    fileId: 'test-file',
    filePath: 'test.ts',
    content: '',
    ast: null as any,
    language: 'typescript' as const,
  };

  it('extracts classes with Service suffix', () => {
    const source = `class AuthService {
  login() {}
  register() {}
}`;
    const result = parser.parse(source, 'test.ts');
    expect(result.success).toBe(true);

    const entities = extractor.extract({ ...baseOptions, content: source, ast: result.ast! });
    expect(entities.length).toBeGreaterThanOrEqual(1);
    expect(entities[0].name).toBe('AuthService');
    expect(entities[0].type).toBe('SERVICE');
    const methods = entities[0].metadata?.methods as string[];
    expect(methods).toContain('login');
    expect(methods).toContain('register');
  });

  it('extracts classes with Repository suffix', () => {
    const source = `class UserRepository {
  find() {}
  save() {}
}`;
    const result = parser.parse(source, 'test.ts');
    expect(result.success).toBe(true);

    const entities = extractor.extract({ ...baseOptions, content: source, ast: result.ast! });
    expect(entities.length).toBeGreaterThanOrEqual(1);
    expect(entities[0].name).toBe('UserRepository');
    expect(entities[0].type).toBe('SERVICE');
  });

  it('extracts exported service-like objects', () => {
    const source = `export const authService = { login() {} };`;
    const result = parser.parse(source, 'test.ts');
    expect(result.success).toBe(true);

    const entities = extractor.extract({ ...baseOptions, content: source, ast: result.ast! });
    const names = entities.map((e) => e.name);
    expect(names).toContain('authService');
  });

  it('returns empty array for code with no services', () => {
    const source = `function foo() {}`;
    const result = parser.parse(source, 'test.ts');
    expect(result.success).toBe(true);

    const entities = extractor.extract({ ...baseOptions, content: source, ast: result.ast! });
    expect(entities).toHaveLength(0);
  });
});
