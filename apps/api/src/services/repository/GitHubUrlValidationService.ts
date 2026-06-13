import { ValidationError } from '../../utils/errors.js';

export interface GitHubRepoInfo {
  owner: string;
  repo: string;
}

export class GitHubUrlValidationService {
  validate(url: string): GitHubRepoInfo {
    if (!url || typeof url !== 'string') {
      throw new ValidationError('Invalid GitHub repository URL');
    }

    const trimmed = url.trim().replace(/\.git$/, '').replace(/\/$/, '');

    const pattern = /^https:\/\/github\.com\/([a-zA-Z0-9._-]+)\/([a-zA-Z0-9._-]+)$/;
    const match = trimmed.match(pattern);

    if (!match) {
      throw new ValidationError('Invalid GitHub repository URL');
    }

    return { owner: match[1], repo: match[2] };
  }
}
