import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RepositoryValidationService } from '../RepositoryValidationService.js';
import { ValidationError } from '../../../utils/errors.js';

vi.mock('fs/promises');

describe('RepositoryValidationService', () => {
  let service: RepositoryValidationService;

  beforeEach(async () => {
    const fs = await import('fs/promises');
    vi.mocked(fs.stat).mockReset();
    service = new RepositoryValidationService();
  });

  describe('validateZipFile', () => {
    it('rejects non-existent file', async () => {
      const fs = await import('fs/promises');
      vi.mocked(fs.stat).mockRejectedValue(new Error('ENOENT'));
      await expect(service.validateZipFile('/no/such/file.zip')).rejects.toThrow();
    });

    it('rejects empty file', async () => {
      const fs = await import('fs/promises');
      vi.mocked(fs.stat).mockResolvedValue({ isFile: () => true, size: 0 } as any);
      await expect(service.validateZipFile('/empty.zip')).rejects.toThrow(ValidationError);
    });

    it('rejects file exceeding size limit', async () => {
      const fs = await import('fs/promises');
      vi.mocked(fs.stat).mockResolvedValue({ isFile: () => true, size: 501 * 1024 * 1024 } as any);
      await expect(service.validateZipFile('/too-large.zip')).rejects.toThrow(ValidationError);
    });

    it('accepts valid file', async () => {
      const fs = await import('fs/promises');
      vi.mocked(fs.stat).mockResolvedValue({ isFile: () => true, size: 1024 * 1024 } as any);
      await expect(service.validateZipFile('/valid.zip')).resolves.not.toThrow();
    });
  });

  describe('validateRepositoryStructure', () => {
    it('rejects empty file list', async () => {
      await expect(service.validateRepositoryStructure('/path', [])).rejects.toThrow(
        ValidationError,
      );
    });

    it('rejects repository with no supported source files', async () => {
      const files = ['readme.txt', 'docs/guide.pdf'];
      await expect(service.validateRepositoryStructure('/path', files)).rejects.toThrow(
        ValidationError,
      );
    });

    it('accepts repository with JS files', async () => {
      const files = ['src/index.js', 'package.json'];
      await expect(service.validateRepositoryStructure('/path', files)).resolves.not.toThrow();
    });

    it('accepts repository with TS files', async () => {
      const files = ['src/app.ts', 'tsconfig.json'];
      await expect(service.validateRepositoryStructure('/path', files)).resolves.not.toThrow();
    });

    it('accepts repository with JSX/TSX files', async () => {
      const files = ['src/components/App.tsx', 'src/components/Button.jsx'];
      await expect(service.validateRepositoryStructure('/path', files)).resolves.not.toThrow();
    });
  });
});
