import { describe, it, expect, vi } from 'vitest';
import { InfrastructureDetector } from '../InfrastructureDetector.js';
import type { DetectorOptions } from '../DetectorTypes.js';
import type { ScanResult } from '../../scanner/types.js';
import { PackageJsonParser } from '../PackageJsonParser.js';

function makeOptions(files: ScanResult['files']): DetectorOptions {
  const scanResult: ScanResult = { files, folders: [] };
  return { repositoryPath: '/fake', scanResult };
}

describe('InfrastructureDetector', () => {
  describe('Docker detection', () => {
    it('should detect Docker from Dockerfile', async () => {
      const parser = new PackageJsonParser();
      vi.spyOn(parser, 'parseAll').mockResolvedValue([]);

      const detector = new InfrastructureDetector(parser);
      const results = await detector.detect(makeOptions([
        { path: 'Dockerfile', extension: '', size: 100, hash: 'a' },
      ]));

      expect(results).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ technology: 'Docker', category: 'infrastructure' }),
        ]),
      );
    });

    it('should detect Docker from docker-compose.yml', async () => {
      const parser = new PackageJsonParser();
      vi.spyOn(parser, 'parseAll').mockResolvedValue([]);

      const detector = new InfrastructureDetector(parser);
      const results = await detector.detect(makeOptions([
        { path: 'docker-compose.yml', extension: '.yml', size: 200, hash: 'b' },
      ]));

      const technologies = results.map((r) => r.technology);
      expect(technologies).toContain('Docker');
      expect(technologies).toContain('Docker Compose');
    });

    it('should detect Docker from .dockerignore', async () => {
      const parser = new PackageJsonParser();
      vi.spyOn(parser, 'parseAll').mockResolvedValue([]);

      const detector = new InfrastructureDetector(parser);
      const results = await detector.detect(makeOptions([
        { path: '.dockerignore', extension: '', size: 50, hash: 'c' },
      ]));

      expect(results).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ technology: 'Docker' }),
        ]),
      );
    });
  });

  describe('CI/CD detection', () => {
    it('should detect GitHub Actions from .github/workflows', async () => {
      const parser = new PackageJsonParser();
      vi.spyOn(parser, 'parseAll').mockResolvedValue([]);

      const detector = new InfrastructureDetector(parser);
      const results = await detector.detect(makeOptions([
        { path: '.github/workflows/ci.yml', extension: '.yml', size: 300, hash: 'd' },
      ]));

      expect(results).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ technology: 'GitHub Actions', category: 'ciCd' }),
        ]),
      );
    });

    it('should detect Jenkins from Jenkinsfile', async () => {
      const parser = new PackageJsonParser();
      vi.spyOn(parser, 'parseAll').mockResolvedValue([]);

      const detector = new InfrastructureDetector(parser);
      const results = await detector.detect(makeOptions([
        { path: 'Jenkinsfile', extension: '', size: 200, hash: 'e' },
      ]));

      expect(results).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ technology: 'Jenkins', category: 'ciCd' }),
        ]),
      );
    });

    it('should detect GitLab CI from .gitlab-ci.yml', async () => {
      const parser = new PackageJsonParser();
      vi.spyOn(parser, 'parseAll').mockResolvedValue([]);

      const detector = new InfrastructureDetector(parser);
      const results = await detector.detect(makeOptions([
        { path: '.gitlab-ci.yml', extension: '.yml', size: 150, hash: 'f' },
      ]));

      expect(results).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ technology: 'GitLab CI', category: 'ciCd' }),
        ]),
      );
    });
  });

  describe('Testing framework detection', () => {
    it('should detect Jest from dependency', async () => {
      const parser = new PackageJsonParser();
      vi.spyOn(parser, 'parseAll').mockResolvedValue([
        { filePath: 'package.json', data: { devDependencies: { jest: '^29.0.0' } } },
      ]);

      const detector = new InfrastructureDetector(parser);
      const results = await detector.detect(makeOptions([]));

      expect(results).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ technology: 'Jest', category: 'testing' }),
        ]),
      );
    });

    it('should detect Vitest from dependency', async () => {
      const parser = new PackageJsonParser();
      vi.spyOn(parser, 'parseAll').mockResolvedValue([
        { filePath: 'package.json', data: { devDependencies: { vitest: '^1.0.0' } } },
      ]);

      const detector = new InfrastructureDetector(parser);
      const results = await detector.detect(makeOptions([]));

      expect(results).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ technology: 'Vitest', category: 'testing' }),
        ]),
      );
    });

    it('should detect Cypress from dependency', async () => {
      const parser = new PackageJsonParser();
      vi.spyOn(parser, 'parseAll').mockResolvedValue([
        { filePath: 'package.json', data: { devDependencies: { cypress: '^13.0.0' } } },
      ]);

      const detector = new InfrastructureDetector(parser);
      const results = await detector.detect(makeOptions([]));

      expect(results).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ technology: 'Cypress', category: 'testing' }),
        ]),
      );
    });
  });

  it('should return empty array when no infrastructure detected', async () => {
    const parser = new PackageJsonParser();
    vi.spyOn(parser, 'parseAll').mockResolvedValue([
      { filePath: 'package.json', data: { dependencies: { lodash: '^4.0.0' } } },
    ]);

    const detector = new InfrastructureDetector(parser);
    const results = await detector.detect(makeOptions([]));

    expect(results).toHaveLength(0);
  });
});
