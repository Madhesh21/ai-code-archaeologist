import { describe, it, expect } from 'vitest';
import { AstParserService } from '../../ast-parser/AstParserService.js';
import { InterfaceExtractor } from '../InterfaceExtractor.js';

describe('InterfaceExtractor', () => {
  const extractor = new InterfaceExtractor();
  const parser = new AstParserService();

  const baseOptions = {
    repositoryId: 'test-repo',
    fileId: 'test-file',
    filePath: 'test.ts',
    content: '',
    ast: null as any,
    language: 'typescript' as const,
  };

  it('extracts TypeScript interfaces', () => {
    const source = `interface User { name: string; age: number; }
interface Product { id: string; price: number; }`;
    const result = parser.parse(source, 'test.ts');
    expect(result.success).toBe(true);

    const entities = extractor.extract({ ...baseOptions, content: source, ast: result.ast! });
    const names = entities.map((e) => e.name);
    expect(names).toContain('User');
    expect(names).toContain('Product');
    expect(entities.filter((e) => e.type === 'INTERFACE').length).toBe(2);
  });

  it('extracts type aliases', () => {
    const source = `type UserId = string;
type UserRole = 'admin' | 'user';`;
    const result = parser.parse(source, 'test.ts');
    expect(result.success).toBe(true);

    const entities = extractor.extract({ ...baseOptions, content: source, ast: result.ast! });
    const typeEntities = entities.filter((e) => e.type === 'TYPE');
    const names = typeEntities.map((e) => e.name);
    expect(names).toContain('UserId');
    expect(names).toContain('UserRole');
  });

  it('extracts enums', () => {
    const source = `enum Color { Red, Green, Blue }
enum Status { Active, Inactive }`;
    const result = parser.parse(source, 'test.ts');
    expect(result.success).toBe(true);

    const entities = extractor.extract({ ...baseOptions, content: source, ast: result.ast! });
    const enumEntities = entities.filter((e) => e.type === 'ENUM');
    const names = enumEntities.map((e) => e.name);
    expect(names).toContain('Color');
    expect(names).toContain('Status');
  });

  it('marks exported interfaces', () => {
    const source = `export interface PublicInterface { x: number; }
interface PrivateInterface { y: string; }`;
    const result = parser.parse(source, 'test.ts');
    expect(result.success).toBe(true);

    const entities = extractor.extract({ ...baseOptions, content: source, ast: result.ast! });
    const pub = entities.find((e) => e.name === 'PublicInterface');
    const priv = entities.find((e) => e.name === 'PrivateInterface');
    expect(pub?.metadata?.isExported).toBe(true);
    expect(priv?.metadata?.isExported).toBe(false);
  });

  it('returns empty array for code with no interfaces/types/enums', () => {
    const source = `const x = 42;`;
    const result = parser.parse(source, 'test.ts');
    expect(result.success).toBe(true);

    const entities = extractor.extract({ ...baseOptions, content: source, ast: result.ast! });
    expect(entities).toHaveLength(0);
  });
});
