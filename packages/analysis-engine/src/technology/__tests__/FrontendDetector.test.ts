import { describe, it, expect, vi } from 'vitest';
import { FrontendDetector } from '../FrontendDetector.js';
import type { DetectorOptions } from '../DetectorTypes.js';
import type { ScanResult } from '../../scanner/types.js';
import { PackageJsonParser } from '../PackageJsonParser.js';

function makeOptions(files: ScanResult['files']): DetectorOptions {
  const scanResult: ScanResult = { files, folders: [] };
  return { repositoryPath: '/fake', scanResult };
}

describe('FrontendDetector', () => {
  it('should detect React from react dependency', async () => {
    const parser = new PackageJsonParser();
    vi.spyOn(parser, 'parseAll').mockResolvedValue([
      { filePath: 'package.json', data: { dependencies: { react: '^18.0.0', 'react-dom': '^18.0.0' } } },
    ]);

    const detector = new FrontendDetector(parser);
    const results = await detector.detect(makeOptions([]));

    expect(results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ technology: 'React', category: 'frontend' }),
      ]),
    );
  });

  it('should detect Next.js from next dependency', async () => {
    const parser = new PackageJsonParser();
    vi.spyOn(parser, 'parseAll').mockResolvedValue([
      { filePath: 'package.json', data: { dependencies: { next: '^14.0.0' } } },
    ]);

    const detector = new FrontendDetector(parser);
    const results = await detector.detect(makeOptions([]));

    expect(results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ technology: 'Next.js', category: 'frontend' }),
      ]),
    );
  });

  it('should detect Vue from vue dependency', async () => {
    const parser = new PackageJsonParser();
    vi.spyOn(parser, 'parseAll').mockResolvedValue([
      { filePath: 'package.json', data: { dependencies: { vue: '^3.0.0' } } },
    ]);

    const detector = new FrontendDetector(parser);
    const results = await detector.detect(makeOptions([]));

    expect(results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ technology: 'Vue', category: 'frontend' }),
      ]),
    );
  });

  it('should detect Angular from @angular/core dependency', async () => {
    const parser = new PackageJsonParser();
    vi.spyOn(parser, 'parseAll').mockResolvedValue([
      { filePath: 'package.json', data: { dependencies: { '@angular/core': '^17.0.0' } } },
    ]);

    const detector = new FrontendDetector(parser);
    const results = await detector.detect(makeOptions([]));

    expect(results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ technology: 'Angular', category: 'frontend' }),
      ]),
    );
  });

  it('should detect Next.js from config files', async () => {
    const parser = new PackageJsonParser();
    vi.spyOn(parser, 'parseAll').mockResolvedValue([]);

    const detector = new FrontendDetector(parser);
    const results = await detector.detect(makeOptions([
      { path: 'next.config.js', extension: '.js', size: 100, hash: 'a' },
    ]));

    expect(results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ technology: 'Next.js', category: 'frontend', source: 'config:next.config.js' }),
      ]),
    );
  });

  it('should return empty array when no frontend frameworks detected', async () => {
    const parser = new PackageJsonParser();
    vi.spyOn(parser, 'parseAll').mockResolvedValue([
      { filePath: 'package.json', data: { dependencies: { lodash: '^4.0.0' } } },
    ]);

    const detector = new FrontendDetector(parser);
    const results = await detector.detect(makeOptions([]));

    expect(results).toHaveLength(0);
  });

  it('should not duplicate detection results', async () => {
    const parser = new PackageJsonParser();
    vi.spyOn(parser, 'parseAll').mockResolvedValue([
      { filePath: 'package.json', data: { dependencies: { react: '^18.0.0', 'react-dom': '^18.0.0' } } },
    ]);

    const detector = new FrontendDetector(parser);
    const results = await detector.detect(makeOptions([]));

    const reactResults = results.filter((r) => r.technology === 'React');
    expect(reactResults).toHaveLength(1);
  });

  it('should assign confidence of 1 for dependency matches', async () => {
    const parser = new PackageJsonParser();
    vi.spyOn(parser, 'parseAll').mockResolvedValue([
      { filePath: 'package.json', data: { dependencies: { 'react': '^18.0.0' } } },
    ]);

    const detector = new FrontendDetector(parser);
    const results = await detector.detect(makeOptions([]));

    const reactResult = results.find((r) => r.technology === 'React');
    expect(reactResult?.confidence).toBe(1);
  });
});
