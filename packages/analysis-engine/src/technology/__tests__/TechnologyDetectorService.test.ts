import { describe, it, expect } from 'vitest';
import { TechnologyDetectorService } from '../TechnologyDetectorService.js';
import type { DetectorOptions, DetectionResult, TechnologyDetector } from '../DetectorTypes.js';
import type { ScanResult } from '../../scanner/types.js';

class MockDetector implements TechnologyDetector {
  constructor(private results: DetectionResult[]) {}

  async detect(_options: DetectorOptions): Promise<DetectionResult[]> {
    return this.results;
  }
}

class FailingDetector implements TechnologyDetector {
  async detect(_options: DetectorOptions): Promise<DetectionResult[]> {
    throw new Error('Detection failed');
  }
}

function makeOptions(): DetectorOptions {
  const scanResult: ScanResult = { files: [], folders: [] };
  return { repositoryPath: '/fake', scanResult };
}

describe('TechnologyDetectorService', () => {
  it('should aggregate results from all detectors', async () => {
    const detector1 = new MockDetector([
      { technology: 'React', category: 'frontend', confidence: 1, source: 'dep' },
    ]);
    const detector2 = new MockDetector([
      { technology: 'Express', category: 'backend', confidence: 1, source: 'dep' },
    ]);

    const service = new TechnologyDetectorService([detector1, detector2]);
    const { profile, results } = await service.detectTechnologies(makeOptions());

    expect(results).toHaveLength(2);
    expect(profile.frontend).toContain('React');
    expect(profile.backend).toContain('Express');
  });

  it('should build profile with sorted entries', async () => {
    const detector = new MockDetector([
      { technology: 'Express', category: 'backend', confidence: 1, source: 'dep' },
      { technology: 'React', category: 'frontend', confidence: 1, source: 'dep' },
    ]);

    const service = new TechnologyDetectorService([detector]);
    const { profile } = await service.detectTechnologies(makeOptions());

    expect(profile.frontend).toEqual(['React']);
    expect(profile.backend).toEqual(['Express']);
  });

  it('should continue when a detector fails', async () => {
    const detector1 = new MockDetector([
      { technology: 'React', category: 'frontend', confidence: 1, source: 'dep' },
    ]);
    const failing = new FailingDetector();
    const detector2 = new MockDetector([
      { technology: 'Express', category: 'backend', confidence: 1, source: 'dep' },
    ]);

    const service = new TechnologyDetectorService([detector1, failing, detector2]);
    const { profile, results } = await service.detectTechnologies(makeOptions());

    expect(results).toHaveLength(2);
    expect(profile.frontend).toContain('React');
    expect(profile.backend).toContain('Express');
  });

  it('should return empty profile when no detectors provided', async () => {
    const service = new TechnologyDetectorService([]);
    const { profile, results } = await service.detectTechnologies(makeOptions());

    expect(results).toHaveLength(0);
    expect(profile.frontend).toEqual([]);
    expect(profile.backend).toEqual([]);
    expect(profile.database).toEqual([]);
    expect(profile.infrastructure).toEqual([]);
    expect(profile.testing).toEqual([]);
    expect(profile.ciCd).toEqual([]);
  });

  it('should deduplicate technologies within the same category', async () => {
    const detector = new MockDetector([
      { technology: 'React', category: 'frontend', confidence: 1, source: 'dep:react' },
      { technology: 'React', category: 'frontend', confidence: 1, source: 'dep:react-dom' },
    ]);

    const service = new TechnologyDetectorService([detector]);
    const { profile } = await service.detectTechnologies(makeOptions());

    expect(profile.frontend).toEqual(['React']);
  });

  it('should populate all categories', async () => {
    const detector = new MockDetector([
      { technology: 'React', category: 'frontend', confidence: 1, source: 'dep' },
      { technology: 'Express', category: 'backend', confidence: 1, source: 'dep' },
      { technology: 'MongoDB', category: 'database', confidence: 1, source: 'dep' },
      { technology: 'Docker', category: 'infrastructure', confidence: 1, source: 'file' },
      { technology: 'Jest', category: 'testing', confidence: 1, source: 'dep' },
      { technology: 'GitHub Actions', category: 'ciCd', confidence: 1, source: 'file' },
    ]);

    const service = new TechnologyDetectorService([detector]);
    const { profile } = await service.detectTechnologies(makeOptions());

    expect(profile.frontend).toContain('React');
    expect(profile.backend).toContain('Express');
    expect(profile.database).toContain('MongoDB');
    expect(profile.infrastructure).toContain('Docker');
    expect(profile.testing).toContain('Jest');
    expect(profile.ciCd).toContain('GitHub Actions');
  });
});
