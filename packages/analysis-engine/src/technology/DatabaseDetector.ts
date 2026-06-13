import type { DetectionResult, DetectorOptions, TechnologyDetector } from './DetectorTypes.js';
import type { MergedDependencies } from './PackageJsonParser.js';
import { PackageJsonParser } from './PackageJsonParser.js';

const DATABASE_PATTERNS: Array<{
  dependencies: string[];
  technology: string;
}> = [
  { dependencies: ['mongoose', 'mongodb', 'mongose'], technology: 'MongoDB' },
  { dependencies: ['pg', 'pg-native', 'sequelize', 'typeorm', 'prisma', '@prisma/client', 'drizzle-orm'], technology: 'PostgreSQL' },
  { dependencies: ['mysql', 'mysql2', 'mariadb'], technology: 'MySQL' },
  { dependencies: ['redis', 'ioredis'], technology: 'Redis' },
  { dependencies: ['sqlite3', 'better-sqlite3', 'sql.js'], technology: 'SQLite' },
  { dependencies: ['mssql', 'tedious'], technology: 'SQL Server' },
  { dependencies: ['cassandra-driver'], technology: 'Cassandra' },
  { dependencies: ['firebase-admin', 'firebase'], technology: 'Firebase' },
  { dependencies: ['@supabase/supabase-js'], technology: 'Supabase' },
  { dependencies: ['neo4j-driver'], technology: 'Neo4j' },
  { dependencies: ['@planetscale/database'], technology: 'PlanetScale' },
];

export class DatabaseDetector implements TechnologyDetector {
  constructor(private readonly parser: PackageJsonParser = new PackageJsonParser()) {}

  async detect(options: DetectorOptions): Promise<DetectionResult[]> {
    const parsedFiles = await this.parser.parseAll(options.repositoryPath, options.scanResult);
    const merged = this.parser.mergeDependencies(parsedFiles);

    return this.detectFromDependencies(merged);
  }

  private detectFromDependencies(deps: MergedDependencies): DetectionResult[] {
    const results: DetectionResult[] = [];
    const detected = new Set<string>();

    for (const pattern of DATABASE_PATTERNS) {
      if (detected.has(pattern.technology)) continue;

      for (const dep of pattern.dependencies) {
        if (dep in deps.allDependencies) {
          detected.add(pattern.technology);
          results.push({
            technology: pattern.technology,
            category: 'database',
            confidence: 1,
            source: `dependency:${dep}`,
          });
          break;
        }
      }
    }

    return results;
  }
}
