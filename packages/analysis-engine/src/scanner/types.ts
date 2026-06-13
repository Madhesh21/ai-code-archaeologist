export interface FileInfo {
  path: string;
  extension: string;
  size: number;
  hash: string;
}

export interface FolderInfo {
  path: string;
}

export interface ScanResult {
  files: FileInfo[];
  folders: FolderInfo[];
}

export interface ScannerOptions {
  ignorePatterns?: string[];
}
