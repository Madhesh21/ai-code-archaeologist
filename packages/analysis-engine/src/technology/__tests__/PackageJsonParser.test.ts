import { describe, it, expect } from 'vitest';
import { PackageJsonParser } from '../PackageJsonParser.js';
import type { ScanResult } from '../../scanner/types.js';

describe('PackageJsonParser', () => {
  const parser = new PackageJsonParser();

  describe('mergeDependencies', () => {
    it('should merge dependencies from multiple package.json files', () => {
      const result = parser.mergeDependencies([
        {
          filePath: 'package.json',
          data: {
            dependencies: { react: '^18.0.0', express: '^4.0.0' },
            devDependencies: { typescript: '^5.0.0' },
          },
        },
        {
          filePath: 'packages/backend/package.json',
          data: {
            dependencies: { express: '^4.18.0', mongoose: '^8.0.0' },
          },
        },
      ]);

      expect(result.dependencies.react).toBe('^18.0.0');
      expect(result.dependencies.express).toBe('^4.18.0');
      expect(result.dependencies.mongoose).toBe('^8.0.0');
      expect(result.devDependencies.typescript).toBe('^5.0.0');
      expect(result.allDependencies.react).toBe('^18.0.0');
      expect(result.allDependencies.typescript).toBe('^5.0.0');
      expect(result.allDependencies.mongoose).toBe('^8.0.0');
    });

    it('should handle empty package.json files', () => {
      const result = parser.mergeDependencies([
        {
          filePath: 'package.json',
          data: {},
        },
      ]);

      expect(result.dependencies).toEqual({});
      expect(result.allDependencies).toEqual({});
    });

    it('should handle missing dependency sections', () => {
      const result = parser.mergeDependencies([
        {
          filePath: 'package.json',
          data: { name: 'test' },
        },
      ]);

      expect(result.dependencies).toEqual({});
      expect(result.devDependencies).toEqual({});
      expect(result.peerDependencies).toEqual({});
      expect(result.allDependencies).toEqual({});
    });

    it('should include peer and optional dependencies in allDependencies', () => {
      const result = parser.mergeDependencies([
        {
          filePath: 'package.json',
          data: {
            peerDependencies: { react: '^18.0.0' },
            optionalDependencies: { fsevents: '^2.0.0' },
          },
        },
      ]);

      expect(result.peerDependencies.react).toBe('^18.0.0');
      expect(result.optionalDependencies.fsevents).toBe('^2.0.0');
      expect(result.allDependencies.react).toBe('^18.0.0');
      expect(result.allDependencies.fsevents).toBe('^2.0.0');
    });

    it('should deduplicate by overwriting with later values for same key', () => {
      const result = parser.mergeDependencies([
        {
          filePath: 'package.json',
          data: { dependencies: { react: '^18.0.0' } },
        },
        {
          filePath: 'packages/web/package.json',
          data: { dependencies: { react: '^19.0.0' } },
        },
      ]);

      expect(result.dependencies.react).toBe('^19.0.0');
    });
  });

  describe('parseAll', () => {
    it('should filter only package.json files from scan result', async () => {
      const scanResult: ScanResult = {
        files: [
          { path: 'package.json', extension: '.json', size: 100, hash: 'a' },
          { path: 'packages/web/package.json', extension: '.json', size: 200, hash: 'b' },
          { path: 'src/index.ts', extension: '.ts', size: 50, hash: 'c' },
          { path: 'tsconfig.json', extension: '.json', size: 80, hash: 'd' },
        ],
        folders: [],
      };

      const parsed = await parser.parseAll('C:\\nonexistent', scanResult);
      expect(parsed).toHaveLength(0);
    });
  });
});
