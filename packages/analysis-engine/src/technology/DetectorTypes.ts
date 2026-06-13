import type { ScanResult } from '../scanner/types.js';

export interface TechnologyProfile {
  id: string;
  repositoryId: string;
  frontend: string[];
  backend: string[];
  database: string[];
  infrastructure: string[];
  testing: string[];
  ciCd: string[];
}

export interface PackageJson {
  name?: string;
  version?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
  engines?: Record<string, string>;
}

export interface TsConfigJson {
  compilerOptions?: Record<string, unknown>;
  extends?: string;
  files?: string[];
  include?: string[];
  exclude?: string[];
}

export interface DetectionResult {
  technology: string;
  category: 'frontend' | 'backend' | 'database' | 'infrastructure' | 'testing' | 'ciCd';
  confidence: number;
  source: string;
}

export interface DetectorOptions {
  repositoryPath: string;
  scanResult: ScanResult;
}

export interface TechnologyDetector {
  detect(options: DetectorOptions): Promise<DetectionResult[]>;
}
