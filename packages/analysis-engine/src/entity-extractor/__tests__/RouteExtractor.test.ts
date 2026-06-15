import { describe, it, expect } from 'vitest';
import { AstParserService } from '../../ast-parser/AstParserService.js';
import { RouteExtractor } from '../RouteExtractor.js';

describe('RouteExtractor', () => {
  const extractor = new RouteExtractor();
  const parser = new AstParserService();

  const baseOptions = {
    repositoryId: 'test-repo',
    fileId: 'test-file',
    filePath: 'test.ts',
    content: '',
    ast: null as any,
    language: 'typescript' as const,
  };

  it('extracts Express GET routes', () => {
    const source = `router.get('/users', getUsers);`;
    const result = parser.parse(source, 'test.ts');
    expect(result.success).toBe(true);

    const entities = extractor.extract({ ...baseOptions, content: source, ast: result.ast! });
    expect(entities).toHaveLength(1);
    expect(entities[0].type).toBe('API_ROUTE');
    expect(entities[0].name).toContain('GET');
    expect(entities[0].name).toContain('/users');
  });

  it('extracts Express POST routes', () => {
    const source = `router.post('/users', createUser);`;
    const result = parser.parse(source, 'test.ts');
    expect(result.success).toBe(true);

    const entities = extractor.extract({ ...baseOptions, content: source, ast: result.ast! });
    expect(entities).toHaveLength(1);
    expect(entities[0].name).toContain('POST');
    expect(entities[0].name).toContain('/users');
  });

  it('extracts multiple HTTP methods', () => {
    const source = `router.get('/users', list);
router.post('/users', create);
router.put('/users/:id', update);
router.delete('/users/:id', remove);`;
    const result = parser.parse(source, 'test.ts');
    expect(result.success).toBe(true);

    const entities = extractor.extract({ ...baseOptions, content: source, ast: result.ast! });
    expect(entities).toHaveLength(4);
    expect(entities.filter((e) => e.name.startsWith('GET'))).toHaveLength(1);
    expect(entities.filter((e) => e.name.startsWith('POST'))).toHaveLength(1);
    expect(entities.filter((e) => e.name.startsWith('PUT'))).toHaveLength(1);
    expect(entities.filter((e) => e.name.startsWith('DELETE'))).toHaveLength(1);
  });

  it('returns empty array for code with no routes', () => {
    const source = `const x = 42;`;
    const result = parser.parse(source, 'test.ts');
    expect(result.success).toBe(true);

    const entities = extractor.extract({ ...baseOptions, content: source, ast: result.ast! });
    expect(entities).toHaveLength(0);
  });
});
