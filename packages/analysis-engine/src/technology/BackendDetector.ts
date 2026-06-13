import type { DetectionResult, DetectorOptions, TechnologyDetector } from './DetectorTypes.js';
import type { MergedDependencies, ParsedPackageJson } from './PackageJsonParser.js';
import { PackageJsonParser } from './PackageJsonParser.js';

const BACKEND_PATTERNS: Array<{
  dependency: string;
  technology: string;
}> = [
  { dependency: 'express', technology: 'Express' },
  { dependency: '@nestjs/core', technology: 'NestJS' },
  { dependency: 'fastify', technology: 'Fastify' },
  { dependency: 'koa', technology: 'Koa' },
  { dependency: 'hapi', technology: 'Hapi.js' },
  { dependency: '@hono/hono', technology: 'Hono' },
  { dependency: 'django', technology: 'Django' },
  { dependency: 'flask', technology: 'Flask' },
  { dependency: 'spring-boot', technology: 'Spring Boot' },
  { dependency: '@sveltejs/kit', technology: 'SvelteKit' },
];

export class BackendDetector implements TechnologyDetector {
  constructor(private readonly parser: PackageJsonParser = new PackageJsonParser()) {}

  async detect(options: DetectorOptions): Promise<DetectionResult[]> {
    const parsedFiles = await this.parser.parseAll(options.repositoryPath, options.scanResult);
    const merged = this.parser.mergeDependencies(parsedFiles);

    return this.detectFromDependencies(merged, parsedFiles);
  }

  private detectFromDependencies(
    deps: MergedDependencies,
    parsedFiles: ParsedPackageJson[],
  ): DetectionResult[] {
    const results: DetectionResult[] = [];
    const detected = new Set<string>();

    for (const pattern of BACKEND_PATTERNS) {
      if (detected.has(pattern.technology)) continue;

      if (pattern.dependency in deps.allDependencies) {
        detected.add(pattern.technology);
        results.push({
          technology: pattern.technology,
          category: 'backend',
          confidence: 1,
          source: `dependency:${pattern.dependency}`,
        });
      }
    }

    if (deps.dependencies.node || deps.devDependencies.node || deps.peerDependencies.node) {
      if (!detected.has('Node.js')) {
        detected.add('Node.js');
        results.push({
          technology: 'Node.js',
          category: 'backend',
          confidence: 1,
          source: 'dependency:node',
        });
      }
    }

    if (!detected.has('Node.js')) {
      const hasEngineNode = parsedFiles.some(
        (pf) => pf.data.engines?.node,
      );
      if (hasEngineNode) {
        detected.add('Node.js');
        results.push({
          technology: 'Node.js',
          category: 'backend',
          confidence: 1,
          source: 'engines.node',
        });
      }
    }

    if (!detected.has('Node.js') && Object.keys(deps.allDependencies).length > 0) {
      const hasNodeScripts = parsedFiles.some((pf) => {
        if (!pf.data.scripts) return false;
        return Object.values(pf.data.scripts).some(
          (s) => s && (s.includes('node ') || s.includes('tsx ') || s.includes('ts-node ')),
        );
      });

      if (hasNodeScripts) {
        detected.add('Node.js');
        results.push({
          technology: 'Node.js',
          category: 'backend',
          confidence: 0.7,
          source: 'scripts',
        });
      }
    }

    return results;
  }
}
