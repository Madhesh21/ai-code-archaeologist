export class GitHubUrlValidationService {
  validate(url: string): { owner: string; repo: string } {
    if (!url || typeof url !== 'string') {
      throw new Error('Invalid GitHub repository URL');
    }

    const trimmed = url.trim();

    if (!trimmed.startsWith('https://github.com/')) {
      throw new Error('Invalid GitHub repository URL');
    }

    const path = trimmed.slice('https://github.com/'.length).replace(/\.git$/, '').replace(/\/$/, '');

    if (!path || !path.includes('/')) {
      throw new Error('Invalid GitHub repository URL');
    }

    const parts = path.split('/');
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      throw new Error('Invalid GitHub repository URL');
    }

    return { owner: parts[0], repo: parts[1] };
  }
}
