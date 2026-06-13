import type { DetectionResult, DetectorOptions, TechnologyDetector } from './DetectorTypes.js';
import type { MergedDependencies } from './PackageJsonParser.js';
import { PackageJsonParser } from './PackageJsonParser.js';

const FRONTEND_PATTERNS: Array<{
  dependency: string;
  technology: string;
}> = [
  { dependency: 'react', technology: 'React' },
  { dependency: 'react-dom', technology: 'React' },
  { dependency: 'next', technology: 'Next.js' },
  { dependency: 'vue', technology: 'Vue' },
  { dependency: '@angular/core', technology: 'Angular' },
  { dependency: 'svelte', technology: 'Svelte' },
  { dependency: 'gatsby', technology: 'Gatsby' },
  { dependency: 'nuxt', technology: 'Nuxt.js' },
  { dependency: '@remix-run/react', technology: 'Remix' },
];

export class FrontendDetector implements TechnologyDetector {
  constructor(private readonly parser: PackageJsonParser = new PackageJsonParser()) {}

  async detect(options: DetectorOptions): Promise<DetectionResult[]> {
    const results: DetectionResult[] = [];
    const parsedFiles = await this.parser.parseAll(options.repositoryPath, options.scanResult);
    const merged = this.parser.mergeDependencies(parsedFiles);

    results.push(...this.detectFromDependencies(merged));
    results.push(...this.detectFromConfigFiles(options));

    return results;
  }

  private detectFromDependencies(deps: MergedDependencies): DetectionResult[] {
    const results: DetectionResult[] = [];
    const detected = new Set<string>();

    for (const pattern of FRONTEND_PATTERNS) {
      if (detected.has(pattern.technology)) continue;

      if (pattern.dependency in deps.allDependencies) {
        detected.add(pattern.technology);
        results.push({
          technology: pattern.technology,
          category: 'frontend',
          confidence: 1,
          source: `dependency:${pattern.dependency}`,
        });
      }
    }

    return results;
  }

  private detectFromConfigFiles(options: DetectorOptions): DetectionResult[] {
    const results: DetectionResult[] = [];

    for (const file of options.scanResult.files) {
      const lowerPath = file.path.toLowerCase();

      if (lowerPath === 'next.config.js' || lowerPath === 'next.config.mjs' || lowerPath === 'next.config.ts') {
        results.push({
          technology: 'Next.js',
          category: 'frontend',
          confidence: 1,
          source: `config:${file.path}`,
        });
      }
    }

    return results;
  }
}
