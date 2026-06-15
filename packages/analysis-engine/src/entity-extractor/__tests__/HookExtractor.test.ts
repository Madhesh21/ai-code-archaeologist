import { describe, it, expect } from 'vitest';
import { AstParserService } from '../../ast-parser/AstParserService.js';
import { HookExtractor } from '../HookExtractor.js';

describe('HookExtractor', () => {
  const extractor = new HookExtractor();
  const parser = new AstParserService();

  const baseOptions = {
    repositoryId: 'test-repo',
    fileId: 'test-file',
    filePath: 'test.ts',
    content: '',
    ast: null as any,
    language: 'typescript' as const,
  };

  it('extracts hooks from function declarations starting with use', () => {
    const source = `function useAuth() { return { user }; }
function useFetch() { return { data }; }`;
    const result = parser.parse(source, 'test.ts');
    expect(result.success).toBe(true);

    const entities = extractor.extract({ ...baseOptions, content: source, ast: result.ast! });
    const names = entities.map((e) => e.name);
    expect(names).toContain('useAuth');
    expect(names).toContain('useFetch');
    expect(entities.every((e) => e.type === 'HOOK')).toBe(true);
  });

  it('extracts arrow function hooks', () => {
    const source = `const useTheme = () => ({ dark: false });
const useMediaQuery = (query: string) => window.matchMedia(query);`;
    const result = parser.parse(source, 'test.ts');
    expect(result.success).toBe(true);

    const entities = extractor.extract({ ...baseOptions, content: source, ast: result.ast! });
    const names = entities.map((e) => e.name);
    expect(names).toContain('useTheme');
    expect(names).toContain('useMediaQuery');
  });

  it('ignores regular functions not starting with use', () => {
    const source = `function getData() { return []; }
function useData() { return []; }`;
    const result = parser.parse(source, 'test.ts');
    expect(result.success).toBe(true);

    const entities = extractor.extract({ ...baseOptions, content: source, ast: result.ast! });
    expect(entities).toHaveLength(1);
    expect(entities[0].name).toBe('useData');
  });

  it('returns empty array for code with no hooks', () => {
    const source = `const x = 42;`;
    const result = parser.parse(source, 'test.ts');
    expect(result.success).toBe(true);

    const entities = extractor.extract({ ...baseOptions, content: source, ast: result.ast! });
    expect(entities).toHaveLength(0);
  });
});
