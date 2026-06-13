import fs from 'fs/promises';
import path from 'path';
import type { ScanResult } from '../scanner/types.js';
import type { PackageJson } from './DetectorTypes.js';

export interface ParsedPackageJson {
  filePath: string;
  data: PackageJson;
}

export interface MergedDependencies {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  peerDependencies: Record<string, string>;
  optionalDependencies: Record<string, string>;
  allDependencies: Record<string, string>;
}

export class PackageJsonParser {
  async parseAll(repositoryPath: string, scanResult: ScanResult): Promise<ParsedPackageJson[]> {
    const packageJsonFiles = scanResult.files.filter(
      (f) => f.path.toLowerCase() === 'package.json' || f.path.toLowerCase().endsWith('/package.json') || f.path.toLowerCase().endsWith('\\package.json'),
    );

    const results: ParsedPackageJson[] = [];

    for (const file of packageJsonFiles) {
      try {
        const fullPath = path.join(repositoryPath, file.path);
        const content = await fs.readFile(fullPath, 'utf-8');
        const data = JSON.parse(content) as PackageJson;
        results.push({ filePath: file.path, data });
      } catch {
        continue;
      }
    }

    return results;
  }

  mergeDependencies(parsedFiles: ParsedPackageJson[]): MergedDependencies {
    const dependencies: Record<string, string> = {};
    const devDependencies: Record<string, string> = {};
    const peerDependencies: Record<string, string> = {};
    const optionalDependencies: Record<string, string> = {};

    for (const parsed of parsedFiles) {
      Object.assign(dependencies, parsed.data.dependencies ?? {});
      Object.assign(devDependencies, parsed.data.devDependencies ?? {});
      Object.assign(peerDependencies, parsed.data.peerDependencies ?? {});
      Object.assign(optionalDependencies, parsed.data.optionalDependencies ?? {});
    }

    const allDependencies: Record<string, string> = {};
    Object.assign(allDependencies, dependencies);
    Object.assign(allDependencies, devDependencies);
    Object.assign(allDependencies, peerDependencies);
    Object.assign(allDependencies, optionalDependencies);

    return {
      dependencies,
      devDependencies,
      peerDependencies,
      optionalDependencies,
      allDependencies,
    };
  }
}
