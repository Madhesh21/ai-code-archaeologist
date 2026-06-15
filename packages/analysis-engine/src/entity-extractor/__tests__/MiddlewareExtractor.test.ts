import { describe, it, expect } from 'vitest';
import { AstParserService } from '../../ast-parser/AstParserService.js';
import { MiddlewareExtractor } from '../MiddlewareExtractor.js';

describe('MiddlewareExtractor', () => {
  const extractor = new MiddlewareExtractor();
  const parser = new AstParserService();

  const baseOptions = {
    repositoryId: 'test-repo',
    fileId: 'test-file',
    filePath: 'test.ts',
    content: '',
    ast: null as any,
    language: 'typescript' as const,
  };

  it('extracts middleware from app.use() calls', () => {
    const source = `app.use(express.json());
app.use(authMiddleware);
app.use(errorHandler);`;
    const result = parser.parse(source, 'test.ts');
    expect(result.success).toBe(true);

    const entities = extractor.extract({ ...baseOptions, content: source, ast: result.ast! });
    const names = entities.map((e) => e.name);
    expect(names).toContain('authMiddleware');
    expect(names).toContain('errorHandler');
    expect(entities.every((e) => e.type === 'MIDDLEWARE')).toBe(true);
  });

  it('marks middleware as global', () => {
    const source = `app.use(logger);`;
    const result = parser.parse(source, 'test.ts');
    expect(result.success).toBe(true);

    const entities = extractor.extract({ ...baseOptions, content: source, ast: result.ast! });
    expect(entities.length).toBeGreaterThanOrEqual(1);
    expect(entities[0].metadata?.isGlobal).toBe(true);
  });

  it('returns empty array for code with no middleware', () => {
    const source = `const x = 42;`;
    const result = parser.parse(source, 'test.ts');
    expect(result.success).toBe(true);

    const entities = extractor.extract({ ...baseOptions, content: source, ast: result.ast! });
    expect(entities).toHaveLength(0);
  });
});
