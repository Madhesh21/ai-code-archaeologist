import { describe, it, expect } from 'vitest';
import { AstParserService } from '../../ast-parser/AstParserService.js';
import { ExtendsImplRelationshipExtractor } from '../ExtendsImplRelationshipExtractor.js';

describe('ExtendsImplRelationshipExtractor', () => {
  const extractor = new ExtendsImplRelationshipExtractor();
  const parser = new AstParserService();

  it('extracts EXTENDS from class inheritance', () => {
    const source = `class BaseController {}
class UserController extends BaseController {}`;
    const result = parser.parse(source, 'test.ts');
    expect(result.success).toBe(true);

    const relationships = extractor.extract({
      repositoryId: 'test-repo',
      filePath: 'test.ts',
      content: source,
      ast: result.ast!,
      entities: [],
      imports: [],
      exports: [],
    });

    expect(relationships.length).toBeGreaterThanOrEqual(1);
    const extendsRels = relationships.filter((r) => r.type === 'EXTENDS');
    expect(extendsRels).toHaveLength(1);
    expect(extendsRels[0].sourceEntityName).toBe('UserController');
    expect(extendsRels[0].targetEntityName).toBe('BaseController');
  });

  it('extracts IMPLEMENTS from interface implementation', () => {
    const source = `interface IRepository {}
class UserRepository implements IRepository {}`;
    const result = parser.parse(source, 'test.ts');
    expect(result.success).toBe(true);

    const relationships = extractor.extract({
      repositoryId: 'test-repo',
      filePath: 'test.ts',
      content: source,
      ast: result.ast!,
      entities: [],
      imports: [],
      exports: [],
    });

    const implementsRels = relationships.filter((r) => r.type === 'IMPLEMENTS');
    expect(implementsRels.length).toBeGreaterThanOrEqual(1);
    expect(implementsRels[0].sourceEntityName).toBe('UserRepository');
    expect(implementsRels[0].targetEntityName).toBe('IRepository');
  });

  it('extracts both EXTENDS and IMPLEMENTS', () => {
    const source = `interface ISerializable {}
class BaseEntity {}
class UserEntity extends BaseEntity implements ISerializable {}`;
    const result = parser.parse(source, 'test.ts');
    expect(result.success).toBe(true);

    const relationships = extractor.extract({
      repositoryId: 'test-repo',
      filePath: 'test.ts',
      content: source,
      ast: result.ast!,
      entities: [],
      imports: [],
      exports: [],
    });

    const extendsRels = relationships.filter((r) => r.type === 'EXTENDS');
    const implementsRels = relationships.filter((r) => r.type === 'IMPLEMENTS');
    expect(extendsRels).toHaveLength(1);
    expect(implementsRels).toHaveLength(1);
    expect(extendsRels[0].sourceEntityName).toBe('UserEntity');
    expect(extendsRels[0].targetEntityName).toBe('BaseEntity');
    expect(implementsRels[0].sourceEntityName).toBe('UserEntity');
    expect(implementsRels[0].targetEntityName).toBe('ISerializable');
  });

  it('returns empty array for class without heritage', () => {
    const source = `class StandaloneClass {}`;
    const result = parser.parse(source, 'test.ts');
    expect(result.success).toBe(true);

    const relationships = extractor.extract({
      repositoryId: 'test-repo',
      filePath: 'test.ts',
      content: source,
      ast: result.ast!,
      entities: [],
      imports: [],
      exports: [],
    });

    expect(relationships).toHaveLength(0);
  });

  it('returns empty array when no classes exist', () => {
    const source = `const x = 42;`;
    const result = parser.parse(source, 'test.ts');
    expect(result.success).toBe(true);

    const relationships = extractor.extract({
      repositoryId: 'test-repo',
      filePath: 'test.ts',
      content: source,
      ast: result.ast!,
      entities: [],
      imports: [],
      exports: [],
    });

    expect(relationships).toHaveLength(0);
  });

  it('handles multiple implementations', () => {
    const source = `interface A {}
interface B {}
class C implements A, B {}`;
    const result = parser.parse(source, 'test.ts');
    expect(result.success).toBe(true);

    const relationships = extractor.extract({
      repositoryId: 'test-repo',
      filePath: 'test.ts',
      content: source,
      ast: result.ast!,
      entities: [],
      imports: [],
      exports: [],
    });

    const implementsRels = relationships.filter((r) => r.type === 'IMPLEMENTS');
    expect(implementsRels).toHaveLength(2);
    const targets = implementsRels.map((r) => r.targetEntityName);
    expect(targets).toContain('A');
    expect(targets).toContain('B');
  });
});
