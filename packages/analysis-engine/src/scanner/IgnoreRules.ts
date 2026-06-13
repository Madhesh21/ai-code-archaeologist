import path from 'path';

const DEFAULT_IGNORE_DIRS = [
  'node_modules',
  'dist',
  'build',
  'coverage',
  '.next',
  '.cache',
  '.git',
];

export class IgnoreRules {
  private readonly ignoreDirs: Set<string>;

  constructor(ignoreDirs: string[] = DEFAULT_IGNORE_DIRS) {
    this.ignoreDirs = new Set(ignoreDirs.map((d) => d.toLowerCase()));
  }

  shouldIgnore(entryPath: string): boolean {
    const basename = path.basename(entryPath).toLowerCase();
    return this.ignoreDirs.has(basename);
  }
}
