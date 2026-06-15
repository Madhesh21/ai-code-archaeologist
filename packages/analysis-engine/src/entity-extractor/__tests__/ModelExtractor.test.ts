import { describe, it, expect } from 'vitest';
import { AstParserService } from '../../ast-parser/AstParserService.js';
import { ModelExtractor } from '../ModelExtractor.js';

describe('ModelExtractor', () => {
  const extractor = new ModelExtractor();
  const parser = new AstParserService();

  const baseOptions = {
    repositoryId: 'test-repo',
    fileId: 'test-file',
    filePath: 'test.ts',
    content: '',
    ast: null as any,
    language: 'typescript' as const,
  };

  it('extracts Mongoose model definitions', () => {
    const source = `const User = mongoose.model('User', userSchema);`;
    const result = parser.parse(source, 'test.ts');
    expect(result.success).toBe(true);

    const entities = extractor.extract({ ...baseOptions, content: source, ast: result.ast! });
    expect(entities.length).toBeGreaterThanOrEqual(1);
    const model = entities.find((e) => e.type === 'MODEL');
    expect(model).toBeDefined();
    expect(model?.name).toBe('User');
    expect(model?.metadata?.database).toBe('mongodb');
  });

  it('extracts multiple mongoose models', () => {
    const source = `const User = mongoose.model('User', userSchema);
const Product = mongoose.model('Product', productSchema);
const Order = mongoose.model('Order', orderSchema);`;
    const result = parser.parse(source, 'test.ts');
    expect(result.success).toBe(true);

    const entities = extractor.extract({ ...baseOptions, content: source, ast: result.ast! });
    const models = entities.filter((e) => e.type === 'MODEL');
    const names = models.map((e) => e.name);
    expect(names).toContain('User');
    expect(names).toContain('Product');
    expect(names).toContain('Order');
  });

  it('returns empty array for code with no models', () => {
    const source = `const x = 42;`;
    const result = parser.parse(source, 'test.ts');
    expect(result.success).toBe(true);

    const entities = extractor.extract({ ...baseOptions, content: source, ast: result.ast! });
    expect(entities.filter((e) => e.type === 'MODEL')).toHaveLength(0);
  });
});
