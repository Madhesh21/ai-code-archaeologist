import type { DetectionResult, DetectorOptions, TechnologyDetector } from './DetectorTypes.js';
import { PackageJsonParser } from './PackageJsonParser.js';

const CI_CD_PATTERNS: Array<{
  filePattern: string;
  technology: string;
}> = [
  { filePattern: '.github/workflows', technology: 'GitHub Actions' },
  { filePattern: '.gitlab-ci.yml', technology: 'GitLab CI' },
  { filePattern: 'jenkinsfile', technology: 'Jenkins' },
  { filePattern: '.circleci', technology: 'CircleCI' },
  { filePattern: '.travis.yml', technology: 'Travis CI' },
];

const TESTING_PATTERNS: Array<{
  dependency: string;
  technology: string;
}> = [
  { dependency: 'jest', technology: 'Jest' },
  { dependency: 'vitest', technology: 'Vitest' },
  { dependency: 'mocha', technology: 'Mocha' },
  { dependency: 'chai', technology: 'Chai' },
  { dependency: 'cypress', technology: 'Cypress' },
  { dependency: 'playwright', technology: 'Playwright' },
  { dependency: '@testing-library/react', technology: 'React Testing Library' },
  { dependency: 'supertest', technology: 'Supertest' },
];

export class InfrastructureDetector implements TechnologyDetector {
  constructor(private readonly parser: PackageJsonParser = new PackageJsonParser()) {}

  async detect(options: DetectorOptions): Promise<DetectionResult[]> {
    const results: DetectionResult[] = [];

    results.push(...this.detectInfrastructure(options));
    results.push(...this.detectCiCd(options));

    const parsedFiles = await this.parser.parseAll(options.repositoryPath, options.scanResult);
    const merged = this.parser.mergeDependencies(parsedFiles);
    results.push(...this.detectTesting(merged));

    return results;
  }

  private detectInfrastructure(options: DetectorOptions): DetectionResult[] {
    const results: DetectionResult[] = [];
    let hasDocker = false;
    let hasDockerCompose = false;

    for (const file of options.scanResult.files) {
      const lowerPath = file.path.toLowerCase().replace(/\\/g, '/');
      const basename = lowerPath.split('/').pop() ?? '';

      if (basename === 'dockerfile') {
        hasDocker = true;
      } else if (basename === 'docker-compose.yml' || basename === 'docker-compose.yaml') {
        hasDockerCompose = true;
      } else if (basename === '.dockerignore') {
        hasDocker = true;
      }
    }

    if (hasDocker || hasDockerCompose) {
      results.push({
        technology: 'Docker',
        category: 'infrastructure',
        confidence: 1,
        source: hasDockerCompose ? 'docker-compose' : 'dockerfile',
      });
    }

    if (hasDockerCompose) {
      results.push({
        technology: 'Docker Compose',
        category: 'infrastructure',
        confidence: 1,
        source: 'docker-compose',
      });
    }

    return results;
  }

  private detectCiCd(options: DetectorOptions): DetectionResult[] {
    const results: DetectionResult[] = [];

    for (const pattern of CI_CD_PATTERNS) {
      for (const file of options.scanResult.files) {
        if (file.path.toLowerCase().startsWith(pattern.filePattern.toLowerCase())) {
          results.push({
            technology: pattern.technology,
            category: 'ciCd',
            confidence: 1,
            source: `file:${file.path}`,
          });
          break;
        }
      }
    }

    return results;
  }

  private detectTesting(deps: { allDependencies: Record<string, string> }): DetectionResult[] {
    const results: DetectionResult[] = [];
    const detected = new Set<string>();

    for (const pattern of TESTING_PATTERNS) {
      if (detected.has(pattern.technology)) continue;

      if (pattern.dependency in deps.allDependencies) {
        detected.add(pattern.technology);
        results.push({
          technology: pattern.technology,
          category: 'testing',
          confidence: 1,
          source: `dependency:${pattern.dependency}`,
        });
      }
    }

    return results;
  }
}
