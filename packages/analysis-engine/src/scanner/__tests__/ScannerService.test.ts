import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { ScannerService } from '../ScannerService.js';
import { IgnoreRules } from '../IgnoreRules.js';

describe('ScannerService', () => {
  let tempDir: string;
  let service: ScannerService;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'scanner-test-'));
    service = new ScannerService(new IgnoreRules());
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  async function createFile(relativePath: string, content = ''): Promise<void> {
    const fullPath = path.join(tempDir, relativePath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content);
  }

  it('scans a directory with files', async () => {
    await createFile('src/index.ts', 'export const foo = 1;');
    await createFile('src/utils.ts', 'export const bar = 2;');
    await createFile('package.json', '{}');

    const result = await service.scan(tempDir);

    expect(result.files).toHaveLength(3);
    expect(result.folders).toHaveLength(1);
    expect(result.folders[0].path).toBe('src');
  });

  it('collects file metadata', async () => {
    const content = 'hello world';
    await createFile('test.ts', content);

    const result = await service.scan(tempDir);

    expect(result.files).toHaveLength(1);
    const file = result.files[0];
    expect(file.path).toBe('test.ts');
    expect(file.extension).toBe('.ts');
    expect(file.size).toBe(Buffer.byteLength(content));
    expect(file.hash).toBeTruthy();
    expect(file.hash.length).toBe(32);
  });

  it('ignores node_modules directory', async () => {
    await createFile('src/index.ts', 'const a = 1;');
    await createFile('node_modules/express/index.js', 'module.exports = {};');
    await createFile('node_modules/react/index.js', 'module.exports = {};');

    const result = await service.scan(tempDir);

    expect(result.files).toHaveLength(1);
    expect(result.files[0].path).toBe('src/index.ts');
  });

  it('ignores build directories', async () => {
    await createFile('src/index.ts', 'const a = 1;');
    await createFile('dist/bundle.js', 'bundle');
    await createFile('build/output.js', 'output');
    await createFile('.next/server.js', 'server');
    await createFile('coverage/lcov.info', 'coverage');
    await createFile('.cache/hash', 'hash');

    const result = await service.scan(tempDir);

    expect(result.files).toHaveLength(1);
    expect(result.files[0].path).toBe('src/index.ts');
  });

  it('ignores .git directory', async () => {
    await createFile('index.ts', 'const a = 1;');
    await createFile('.git/HEAD', 'ref');
    await createFile('.git/objects/abc', 'object');

    const result = await service.scan(tempDir);

    expect(result.files).toHaveLength(1);
  });

  it('traverses nested directories', async () => {
    await createFile('a/b/c/d/file.ts', 'content');
    await createFile('a/b/e/file.ts', 'content');

    const result = await service.scan(tempDir);

    expect(result.files).toHaveLength(2);
    expect(result.folders).toHaveLength(5);
    const folderPaths = result.folders.map((f) => f.path).sort();
    expect(folderPaths).toEqual(['a', 'a/b', 'a/b/c', 'a/b/c/d', 'a/b/e']);
  });

  it('handles empty directory', async () => {
    const result = await service.scan(tempDir);
    expect(result.files).toHaveLength(0);
    expect(result.folders).toHaveLength(0);
  });

  it('handles multiple file types', async () => {
    await createFile('index.ts', '');
    await createFile('style.css', '');
    await createFile('main.js', '');
    await createFile('data.json', '{}');
    await createFile('readme.md', '# Readme');

    const result = await service.scan(tempDir);

    expect(result.files).toHaveLength(5);
    const extensions = result.files.map((f) => f.extension).sort();
    expect(extensions).toEqual(['.css', '.js', '.json', '.md', '.ts']);
  });

  it('produces deterministic output for same directory', async () => {
    await createFile('a.ts', '1');
    await createFile('b.ts', '2');

    const result1 = await service.scan(tempDir);
    const result2 = await service.scan(tempDir);

    expect(result1.files).toEqual(result2.files);
    expect(result1.folders).toEqual(result2.folders);
  });

  it('throws for non-existent directory', async () => {
    await expect(service.scan('/nonexistent/path')).rejects.toThrow('Directory not found');
  });
});
