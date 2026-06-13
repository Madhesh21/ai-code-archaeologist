import { describe, it, expect, vi } from 'vitest';
import { DatabaseDetector } from '../DatabaseDetector.js';
import type { DetectorOptions } from '../DetectorTypes.js';
import type { ScanResult } from '../../scanner/types.js';
import { PackageJsonParser } from '../PackageJsonParser.js';

function makeOptions(): DetectorOptions {
  const scanResult: ScanResult = { files: [], folders: [] };
  return { repositoryPath: '/fake', scanResult };
}

describe('DatabaseDetector', () => {
  it('should detect MongoDB from mongoose dependency', async () => {
    const parser = new PackageJsonParser();
    vi.spyOn(parser, 'parseAll').mockResolvedValue([
      { filePath: 'package.json', data: { dependencies: { mongoose: '^8.0.0' } } },
    ]);

    const detector = new DatabaseDetector(parser);
    const results = await detector.detect(makeOptions());

    expect(results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ technology: 'MongoDB', category: 'database', confidence: 1 }),
      ]),
    );
  });

  it('should detect MongoDB from mongodb dependency', async () => {
    const parser = new PackageJsonParser();
    vi.spyOn(parser, 'parseAll').mockResolvedValue([
      { filePath: 'package.json', data: { dependencies: { mongodb: '^6.0.0' } } },
    ]);

    const detector = new DatabaseDetector(parser);
    const results = await detector.detect(makeOptions());

    expect(results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ technology: 'MongoDB' }),
      ]),
    );
  });

  it('should detect PostgreSQL from pg dependency', async () => {
    const parser = new PackageJsonParser();
    vi.spyOn(parser, 'parseAll').mockResolvedValue([
      { filePath: 'package.json', data: { dependencies: { pg: '^8.0.0' } } },
    ]);

    const detector = new DatabaseDetector(parser);
    const results = await detector.detect(makeOptions());

    expect(results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ technology: 'PostgreSQL', category: 'database' }),
      ]),
    );
  });

  it('should detect PostgreSQL from prisma dependency', async () => {
    const parser = new PackageJsonParser();
    vi.spyOn(parser, 'parseAll').mockResolvedValue([
      { filePath: 'package.json', data: { dependencies: { prisma: '^5.0.0' } } },
    ]);

    const detector = new DatabaseDetector(parser);
    const results = await detector.detect(makeOptions());

    expect(results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ technology: 'PostgreSQL' }),
      ]),
    );
  });

  it('should detect MySQL from mysql dependency', async () => {
    const parser = new PackageJsonParser();
    vi.spyOn(parser, 'parseAll').mockResolvedValue([
      { filePath: 'package.json', data: { dependencies: { mysql: '^2.0.0' } } },
    ]);

    const detector = new DatabaseDetector(parser);
    const results = await detector.detect(makeOptions());

    expect(results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ technology: 'MySQL', category: 'database' }),
      ]),
    );
  });

  it('should detect Redis from redis dependency', async () => {
    const parser = new PackageJsonParser();
    vi.spyOn(parser, 'parseAll').mockResolvedValue([
      { filePath: 'package.json', data: { dependencies: { redis: '^4.0.0' } } },
    ]);

    const detector = new DatabaseDetector(parser);
    const results = await detector.detect(makeOptions());

    expect(results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ technology: 'Redis', category: 'database' }),
      ]),
    );
  });

  it('should detect multiple databases', async () => {
    const parser = new PackageJsonParser();
    vi.spyOn(parser, 'parseAll').mockResolvedValue([
      {
        filePath: 'package.json',
        data: {
          dependencies: {
            mongoose: '^8.0.0',
            pg: '^8.0.0',
            redis: '^4.0.0',
          },
        },
      },
    ]);

    const detector = new DatabaseDetector(parser);
    const results = await detector.detect(makeOptions());

    const technologies = results.map((r) => r.technology);
    expect(technologies).toContain('MongoDB');
    expect(technologies).toContain('PostgreSQL');
    expect(technologies).toContain('Redis');
  });

  it('should return empty array when no databases detected', async () => {
    const parser = new PackageJsonParser();
    vi.spyOn(parser, 'parseAll').mockResolvedValue([
      { filePath: 'package.json', data: { dependencies: { lodash: '^4.0.0' } } },
    ]);

    const detector = new DatabaseDetector(parser);
    const results = await detector.detect(makeOptions());

    expect(results).toHaveLength(0);
  });

  it('should not duplicate database entries', async () => {
    const parser = new PackageJsonParser();
    vi.spyOn(parser, 'parseAll').mockResolvedValue([
      {
        filePath: 'package.json',
        data: {
          dependencies: {
            mongoose: '^8.0.0',
            mongodb: '^6.0.0',
          },
        },
      },
    ]);

    const detector = new DatabaseDetector(parser);
    const results = await detector.detect(makeOptions());

    const mongoResults = results.filter((r) => r.technology === 'MongoDB');
    expect(mongoResults).toHaveLength(1);
  });
});
