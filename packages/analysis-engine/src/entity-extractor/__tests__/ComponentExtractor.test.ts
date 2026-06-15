import { describe, it, expect } from 'vitest';
import { AstParserService } from '../../ast-parser/AstParserService.js';
import { ComponentExtractor } from '../ComponentExtractor.js';

describe('ComponentExtractor', () => {
  const extractor = new ComponentExtractor();
  const parser = new AstParserService();

  const baseOptions = {
    repositoryId: 'test-repo',
    fileId: 'test-file',
    filePath: 'test.tsx',
    content: '',
    ast: null as any,
    language: 'typescript' as const,
  };

  it('extracts function components returning JSX', () => {
    const source = `function UserProfile() { return <div>Profile</div>; }
function LoginPage() { return <form>Login</form>; }`;
    const result = parser.parse(source, 'test.tsx');
    expect(result.success).toBe(true);

    const entities = extractor.extract({ ...baseOptions, content: source, ast: result.ast! });
    const names = entities.map((e) => e.name);
    expect(names).toContain('UserProfile');
    expect(names).toContain('LoginPage');
    expect(entities.every((e) => e.type === 'COMPONENT')).toBe(true);
  });

  it('extracts arrow function components', () => {
    const source = `const Header = () => <header>Logo</header>;
const Footer = () => <footer>Copyright</footer>;`;
    const result = parser.parse(source, 'test.tsx');
    expect(result.success).toBe(true);

    const entities = extractor.extract({ ...baseOptions, content: source, ast: result.ast! });
    const names = entities.map((e) => e.name);
    expect(names).toContain('Header');
    expect(names).toContain('Footer');
  });

  it('marks exported components as PAGE type', () => {
    const source = `export function Dashboard() { return <div>Dashboard</div>; }
function PrivateComponent() { return <span>hidden</span>; }`;
    const result = parser.parse(source, 'test.tsx');
    expect(result.success).toBe(true);

    const entities = extractor.extract({ ...baseOptions, content: source, ast: result.ast! });
    const dash = entities.find((e) => e.name === 'Dashboard');
    const priv = entities.find((e) => e.name === 'PrivateComponent');
    expect(dash?.metadata?.componentType).toBe('PAGE');
    expect(priv?.metadata?.componentType).toBe('UI');
  });

  it('ignores functions without JSX', () => {
    const source = `function helper() { return 42; }
function Component() { return <div>Hi</div>; }`;
    const result = parser.parse(source, 'test.tsx');
    expect(result.success).toBe(true);

    const entities = extractor.extract({ ...baseOptions, content: source, ast: result.ast! });
    expect(entities).toHaveLength(1);
    expect(entities[0].name).toBe('Component');
  });

  it('returns empty array for code with no components', () => {
    const source = `const x = 42;`;
    const result = parser.parse(source, 'test.tsx');
    expect(result.success).toBe(true);

    const entities = extractor.extract({ ...baseOptions, content: source, ast: result.ast! });
    expect(entities).toHaveLength(0);
  });
});
