import type { DetectionResult, DetectorOptions, TechnologyDetector, TechnologyProfile } from './DetectorTypes.js';
import { FrontendDetector } from './FrontendDetector.js';
import { BackendDetector } from './BackendDetector.js';
import { DatabaseDetector } from './DatabaseDetector.js';
import { InfrastructureDetector } from './InfrastructureDetector.js';

export class TechnologyDetectorService {
  private detectors: TechnologyDetector[];

  constructor(
    detectors: TechnologyDetector[] = [
      new FrontendDetector(),
      new BackendDetector(),
      new DatabaseDetector(),
      new InfrastructureDetector(),
    ],
  ) {
    this.detectors = detectors;
  }

  async detectTechnologies(options: DetectorOptions): Promise<{
    profile: Omit<TechnologyProfile, 'id' | 'repositoryId'>;
    results: DetectionResult[];
  }> {
    const allResults: DetectionResult[] = [];

    for (const detector of this.detectors) {
      try {
        const results = await detector.detect(options);
        allResults.push(...results);
      } catch {
        continue;
      }
    }

    const profile = this.buildProfile(allResults);

    return { profile, results: allResults };
  }

  private buildProfile(results: DetectionResult[]): Omit<TechnologyProfile, 'id' | 'repositoryId'> {
    const profile: Omit<TechnologyProfile, 'id' | 'repositoryId'> = {
      frontend: [],
      backend: [],
      database: [],
      infrastructure: [],
      testing: [],
      ciCd: [],
    };

    for (const result of results) {
      const category = result.category;
      if (!profile[category].includes(result.technology)) {
        profile[category].push(result.technology);
      }
    }

    for (const key of Object.keys(profile) as (keyof typeof profile)[]) {
      profile[key].sort();
    }

    return profile;
  }
}
