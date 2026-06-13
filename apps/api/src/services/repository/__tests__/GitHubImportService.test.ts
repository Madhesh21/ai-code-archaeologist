import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('GitHubImportService', () => {
  let GitHubImportService: typeof import('../GitHubImportService.js').GitHubImportService;
  let service: InstanceType<typeof GitHubImportService>;
  let mockValidator: { validate: ReturnType<typeof vi.fn> };
  let mockCloneService: { clone: ReturnType<typeof vi.fn>; cleanup: ReturnType<typeof vi.fn> };
  let mockStorage: { moveToStorage: ReturnType<typeof vi.fn>; cleanup: ReturnType<typeof vi.fn> };
  let mockRepoRepo: { create: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn>; updateStatus: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    vi.clearAllMocks();

    mockValidator = { validate: vi.fn() };
    mockCloneService = { clone: vi.fn(), cleanup: vi.fn() };
    mockStorage = { moveToStorage: vi.fn(), cleanup: vi.fn() };
    mockRepoRepo = { create: vi.fn(), update: vi.fn(), updateStatus: vi.fn() };

    const mod = await import('../GitHubImportService.js');
    GitHubImportService = mod.GitHubImportService;
    service = new GitHubImportService(
      mockValidator as any,
      mockCloneService as any,
      mockStorage as any,
      mockRepoRepo as any,
    );
  });

  it('validates URL, creates repo, clones, stores, and returns result', async () => {
    mockValidator.validate.mockReturnValue({ owner: 'testowner', repo: 'testrepo' });
    mockCloneService.clone.mockResolvedValue('/tmp/clones/repo123');
    mockStorage.moveToStorage.mockResolvedValue('/storage/repo123');
    mockRepoRepo.create.mockResolvedValue({
      id: 'repo123',
      name: 'testowner/testrepo',
      sourceType: 'github',
      sourceUrl: 'https://github.com/testowner/testrepo',
      status: 'pending',
    });
    mockRepoRepo.updateStatus.mockResolvedValue(undefined);

    const result = await service.importFromGitHub('https://github.com/testowner/testrepo');

    expect(mockValidator.validate).toHaveBeenCalledWith('https://github.com/testowner/testrepo');
    expect(mockRepoRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'testowner/testrepo',
        sourceType: 'github',
        sourceUrl: 'https://github.com/testowner/testrepo',
        status: 'pending',
      }),
    );
    expect(mockCloneService.clone).toHaveBeenCalledWith(
      'https://github.com/testowner/testrepo',
      'repo123',
    );
    expect(mockStorage.moveToStorage).toHaveBeenCalledWith('/tmp/clones/repo123', 'repo123');
    expect(mockRepoRepo.update).toHaveBeenCalledWith('repo123', { localPath: '/storage/repo123' });
    expect(mockRepoRepo.updateStatus).toHaveBeenCalledWith('repo123', 'uploaded');
    expect(result).toEqual({ repositoryId: 'repo123' });
  });

  it('cleans up clone directory on storage failure', async () => {
    mockValidator.validate.mockReturnValue({ owner: 'o', repo: 'r' });
    mockCloneService.clone.mockResolvedValue('/tmp/clones/repo456');
    mockStorage.moveToStorage.mockRejectedValue(new Error('Disk full'));
    mockRepoRepo.create.mockResolvedValue({ id: 'repo456' });

    await expect(
      service.importFromGitHub('https://github.com/o/r'),
    ).rejects.toThrow('Disk full');

    expect(mockCloneService.cleanup).toHaveBeenCalledWith('repo456');
    expect(mockRepoRepo.updateStatus).toHaveBeenCalledWith('repo456', 'failed');
  });

  it('cleans up and marks failed on clone error', async () => {
    mockValidator.validate.mockReturnValue({ owner: 'o', repo: 'r' });
    mockCloneService.clone.mockRejectedValue(new Error('Not found'));
    mockRepoRepo.create.mockResolvedValue({ id: 'repo789' });

    await expect(
      service.importFromGitHub('https://github.com/o/r'),
    ).rejects.toThrow('Not found');

    expect(mockCloneService.cleanup).toHaveBeenCalledWith('repo789');
    expect(mockRepoRepo.updateStatus).toHaveBeenCalledWith('repo789', 'failed');
  });

  it('validates URL and throws before any side effects', async () => {
    mockValidator.validate.mockImplementation(() => {
      throw new Error('Invalid GitHub repository URL');
    });

    await expect(
      service.importFromGitHub('not-a-url'),
    ).rejects.toThrow('Invalid GitHub repository URL');

    expect(mockRepoRepo.create).not.toHaveBeenCalled();
    expect(mockCloneService.clone).not.toHaveBeenCalled();
  });
});
