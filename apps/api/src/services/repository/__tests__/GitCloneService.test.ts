import { describe, it, expect, vi, beforeEach } from 'vitest';
import path from 'path';

vi.mock('simple-git', () => {
  const mockClone = vi.fn();
  const mockSimpleGit = vi.fn(() => ({ clone: mockClone }));
  return {
    default: mockSimpleGit,
    __mockClone: mockClone,
  };
});

vi.mock('fs/promises');

describe('GitCloneService', () => {
  let GitCloneService: typeof import('../GitCloneService.js').GitCloneService;
  let service: InstanceType<typeof GitCloneService>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import('../GitCloneService.js');
    GitCloneService = mod.GitCloneService;
    service = new GitCloneService('/tmp/test-base');
  });

  it('clones repository to destination path', async () => {
    const fs = await import('fs/promises');
    vi.mocked(fs.mkdir).mockResolvedValue(undefined);

    const simpleGit = await import('simple-git');
    const mockClone = (simpleGit as any).__mockClone;
    mockClone.mockResolvedValue(undefined);

    const result = await service.clone('https://github.com/owner/repo.git', 'repo-123');

    expect(result).toBe(path.join('/tmp/test-base', 'repo-123'));
    expect(fs.mkdir).toHaveBeenCalledWith('/tmp/test-base', { recursive: true });
    expect(simpleGit.default).toHaveBeenCalledTimes(1);
    expect(mockClone).toHaveBeenCalledWith(
      'https://github.com/owner/repo.git',
      path.join('/tmp/test-base', 'repo-123'),
      ['--depth=1'],
    );
  });

  it('clones by repositoryId', async () => {
    const fs = await import('fs/promises');
    vi.mocked(fs.mkdir).mockResolvedValue(undefined);

    const simpleGit = await import('simple-git');
    const mockClone = (simpleGit as any).__mockClone;
    mockClone.mockResolvedValue(undefined);

    const result = await service.clone('https://github.com/other/repo.git', 'my-repo');

    expect(result).toBe(path.join('/tmp/test-base', 'my-repo'));
    expect(mockClone).toHaveBeenCalledWith(
      'https://github.com/other/repo.git',
      path.join('/tmp/test-base', 'my-repo'),
      ['--depth=1'],
    );
  });

  it('propagates clone errors', async () => {
    const fs = await import('fs/promises');
    vi.mocked(fs.mkdir).mockResolvedValue(undefined);

    const simpleGit = await import('simple-git');
    const mockClone = (simpleGit as any).__mockClone;
    mockClone.mockRejectedValue(new Error('Repository not found'));

    await expect(
      service.clone('https://github.com/owner/missing.git', 'fail-repo'),
    ).rejects.toThrow('Failed to clone repository: Repository not found');
  });

  it('cleans up cloned repository', async () => {
    const fs = await import('fs/promises');
    vi.mocked(fs.rm).mockResolvedValue(undefined);

    await service.cleanup('repo-123');

    expect(fs.rm).toHaveBeenCalledWith(
      path.join('/tmp/test-base', 'repo-123'),
      { recursive: true, force: true },
    );
  });
});
