import { describe, it, expect, vi } from 'vitest';
import { BackendDetector } from '../BackendDetector.js';
import type { DetectorOptions } from '../DetectorTypes.js';
import type { ScanResult } from '../../scanner/types.js';
import { PackageJsonParser } from '../PackageJsonParser.js';

function makeOptions(files: ScanResult['files'] = []): DetectorOptions {
  const scanResult: ScanResult = { files, folders: [] };
  return { repositoryPath: '/fake', scanResult };
}

describe('BackendDetector', () => {
  it('should detect Express from express dependency', async () => {
    const parser = new PackageJsonParser();
    vi.spyOn(parser, 'parseAll').mockResolvedValue([
      { filePath: 'package.json', data: { dependencies: { express: '^4.18.0' } } },
    ]);

    const detector = new BackendDetector(parser);
    const results = await detector.detect(makeOptions());

    expect(results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ technology: 'Express', category: 'backend' }),
      ]),
    );
  });

  it('should detect NestJS from @nestjs/core dependency', async () => {
    const parser = new PackageJsonParser();
    vi.spyOn(parser, 'parseAll').mockResolvedValue([
      { filePath: 'package.json', data: { dependencies: { '@nestjs/core': '^10.0.0' } } },
    ]);

    const detector = new BackendDetector(parser);
    const results = await detector.detect(makeOptions());

    expect(results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ technology: 'NestJS', category: 'backend' }),
      ]),
    );
  });

  it('should detect Fastify from fastify dependency', async () => {
    const parser = new PackageJsonParser();
    vi.spyOn(parser, 'parseAll').mockResolvedValue([
      { filePath: 'package.json', data: { dependencies: { fastify: '^4.0.0' } } },
    ]);

    const detector = new BackendDetector(parser);
    const results = await detector.detect(makeOptions());

    expect(results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ technology: 'Fastify', category: 'backend' }),
      ]),
    );
  });

  it('should detect multiple backend frameworks', async () => {
    const parser = new PackageJsonParser();
    vi.spyOn(parser, 'parseAll').mockResolvedValue([
      {
        filePath: 'package.json',
        data: {
          dependencies: {
            express: '^4.18.0',
            '@nestjs/core': '^10.0.0',
          },
        },
      },
    ]);

    const detector = new BackendDetector(parser);
    const results = await detector.detect(makeOptions());

    const technologies = results.map((r) => r.technology);
    expect(technologies).toContain('Express');
    expect(technologies).toContain('NestJS');
  });

  it('should return empty array when no backend frameworks detected', async () => {
    const parser = new PackageJsonParser();
    vi.spyOn(parser, 'parseAll').mockResolvedValue([
      { filePath: 'package.json', data: { dependencies: { lodash: '^4.0.0' } } },
    ]);

    const detector = new BackendDetector(parser);
    const results = await detector.detect(makeOptions());

    expect(results).toHaveLength(0);
  });

  it('should detect Node.js from engine field', async () => {
    const parser = new PackageJsonParser();
    vi.spyOn(parser, 'parseAll').mockResolvedValue([
      { filePath: 'package.json', data: { engines: { node: '>=18.0.0' } } },
    ]);

    const detector = new BackendDetector(parser);
    const results = await detector.detect(makeOptions());

    expect(results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ technology: 'Node.js', category: 'backend', confidence: 1 }),
      ]),
    );
  });

  it('should assign confidence of 1 for dependency matches', async () => {
    const parser = new PackageJsonParser();
    vi.spyOn(parser, 'parseAll').mockResolvedValue([
      { filePath: 'package.json', data: { dependencies: { express: '^4.18.0' } } },
    ]);

    const detector = new BackendDetector(parser);
    const results = await detector.detect(makeOptions());

    const expressResult = results.find((r) => r.technology === 'Express');
    expect(expressResult?.confidence).toBe(1);
  });
});
