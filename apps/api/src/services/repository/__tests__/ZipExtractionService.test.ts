import { describe, it, expect, vi, beforeEach } from 'vitest';
import path from 'path';
import type { ZipExtractionService } from '../ZipExtractionService.js';

vi.mock('adm-zip', () => {
  const mockInternals: { entries: Array<Record<string, any>> } = { entries: [] };
  const mockZip = {
    getEntries: () => mockInternals.entries,
  };
  function MockAdmZip() {
    return mockZip;
  }
  MockAdmZip.prototype.constructor = MockAdmZip;
  return {
    default: MockAdmZip,
    __setEntries: (entries: Array<Record<string, any>>) => {
      mockInternals.entries = entries;
    },
  };
});

vi.mock('fs/promises');

describe('ZipExtractionService', () => {
  let service: ZipExtractionService;

  beforeEach(async () => {
    vi.clearAllMocks();
    const { ZipExtractionService: ZES } = await import('../ZipExtractionService.js');
    service = new ZES();
  });

  it('extracts files from ZIP archive', async () => {
    const admZip = await import('adm-zip');
    const entry = {
      entryName: 'src/index.js',
      isDirectory: false,
      getData: () => Buffer.from('console.log("hello");'),
    };
    (admZip as any).__setEntries([entry]);

    const fs = await import('fs/promises');
    vi.mocked(fs.mkdir).mockResolvedValue(undefined);
    vi.mocked(fs.writeFile).mockResolvedValue(undefined);

    const files = await service.extract('/test.zip', '/dest');

    expect(files).toEqual(['src/index.js']);
    expect(fs.writeFile).toHaveBeenCalledWith(
      path.resolve('/dest', 'src/index.js'),
      entry.getData(),
    );
  });

  it('rejects empty ZIP archive', async () => {
    const admZip = await import('adm-zip');
    (admZip as any).__setEntries([]);

    await expect(service.extract('/empty.zip', '/dest')).rejects.toThrow('ZIP archive is empty');
  });

  it('skips directory entries', async () => {
    const admZip = await import('adm-zip');
    const dirEntry = { entryName: 'src/', isDirectory: true, getData: () => Buffer.from('') };
    const fileEntry = {
      entryName: 'src/index.js',
      isDirectory: false,
      getData: () => Buffer.from('content'),
    };
    (admZip as any).__setEntries([dirEntry, fileEntry]);

    const fs = await import('fs/promises');
    vi.mocked(fs.mkdir).mockResolvedValue(undefined);
    vi.mocked(fs.writeFile).mockResolvedValue(undefined);

    const files = await service.extract('/test.zip', '/dest');

    expect(files).toEqual(['src/index.js']);
  });
});
